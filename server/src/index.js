// Proxy giữa app MyApp và nhà cung cấp model.
//
// Mục đích 1: API key nằm ở đây (Cloudflare secret), không bao giờ đi vào bundle app.
// Mục đích 2: app chỉ nói MỘT giao thức (hình dạng của Anthropic); Worker lo việc
// dịch sang provider đang cấu hình. Đổi provider = nạp secret khác, không sửa app.

import { TOOL_DECLARATIONS, isAllowedTool } from './tools.js';
import { sanitizeMessages } from './messages.js';
import * as claude from './providers/claude.js';
import * as gemini from './providers/gemini.js';
import { resolveManifest, simulateRollout, diffRegistry } from './registry.js';
import { ADMIN_HTML } from './adminPage.js';

// Claude đứng trước: có cả hai key thì dùng Claude.
const PROVIDERS = [claude, gemini];

/** Provider nào đã có key. Không có cái nào -> null, app rơi về chế độ demo. */
const pickProvider = env => PROVIDERS.find(p => p.isConfigured(env)) ?? null;

// Đặt ở server chứ không nhận từ client — để client không sửa được vai trò của trợ lý
const SYSTEM_PROMPT =
  'Bạn là trợ lý AI thân thiện của MyApp — ứng dụng quản lý tài chính cá nhân gồm: ' +
  'Ngân hàng (chuyển tiền, QR Pay, nạp tiền, quản lý thẻ), Đầu tư (cổ phiếu, tỷ giá), ' +
  'Chi phí (thống kê chi tiêu). Trả lời ngắn gọn, hữu ích, bằng đúng ngôn ngữ người dùng đang dùng.';

// Hạn mức. Đây là trần thiệt hại nếu URL proxy bị lộ, nên đừng nới tuỳ tiện.
const PER_IP_HOURLY = 20;
const DAILY_TOTAL = 1000;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

// KV nhất quán theo kiểu eventual nên số đếm có thể hụt khi bị dội cùng lúc.
// Chấp nhận được vì đây là hàng rào thô; cần chính xác tuyệt đối thì phải dùng Durable Objects.
const bumpCounter = async (kv, key, ttl) => {
  const current = Number((await kv.get(key)) ?? 0);
  await kv.put(key, String(current + 1), { expirationTtl: ttl });
  return current + 1;
};

const checkLimits = async (kv, ip, now) => {
  const hour = Math.floor(now / 3_600_000);
  const day = new Date(now).toISOString().slice(0, 10);

  const perIp = await bumpCounter(kv, `ip:${ip}:${hour}`, 3600);
  if (perIp > PER_IP_HOURLY) {
    return 'Bạn đã hỏi khá nhiều rồi. Thử lại sau một giờ nhé.';
  }

  const total = await bumpCounter(kv, `day:${day}`, 86400);
  if (total > DAILY_TOTAL) {
    return 'Trợ lý đã đạt giới hạn lượt hỏi trong ngày. Bạn quay lại vào ngày mai nhé.';
  }

  return null;
};

// Chuyển async iterator chữ của provider thành SSE dạng {"t": "..."} cho app.
// Không chuyển thẳng stream gốc vì nó lộ cấu trúc/metadata của upstream, và app
// chỉ cần phần chữ mới. Nhờ lớp này mà đổi provider không đụng tới app.
const pipeTextStream = chunks =>
  new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      const emit = obj => controller.enqueue(enc.encode(`data: ${JSON.stringify(obj)}\n\n`));

      try {
        for await (const text of chunks) {
          emit({ t: text });
        }
        controller.enqueue(enc.encode('data: [DONE]\n\n'));
      } catch (err) {
        console.error('stream đứt', err?.message ?? err);
        controller.enqueue(enc.encode('data: {"error":"upstream"}\n\n'));
      } finally {
        controller.close();
      }
    },
  });

// ─── Phục vụ bundle mini-app ────────────────────────────────────────────────
//
// Bundle nằm trong assets/ của Worker (Workers Assets), lấy ra qua binding
// ASSETS. Không dùng R2 vì bật R2 đòi thông tin thanh toán.
//
// ĐÁNH ĐỔI đã biết: assets là một phần của bản deploy, nên đổi mini-app vẫn phải
// deploy lại Worker — mất tính "mini-app deploy hoàn toàn độc lập" mà R2 cho.
// Đổi lại, APP vẫn không cần phát hành lại, và registry vẫn điều khiển phiên bản
// lẫn rollout như cũ.

const BUNDLE_PREFIX = '/bundles/';

const CONTENT_TYPES = {
  bundle: 'application/javascript; charset=utf-8',
  js: 'application/javascript; charset=utf-8',
  map: 'application/json; charset=utf-8',
  json: 'application/json; charset=utf-8',
};

const handleBundle = async (request, env, url) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return json({ error: 'method_not_allowed' }, 405);
  }
  if (!env.ASSETS) {
    console.error('thiếu binding ASSETS');
    return json({ error: 'bundles_not_configured' }, 503);
  }

  const key = decodeURIComponent(url.pathname.slice(BUNDLE_PREFIX.length));

  // Đường dẫn đã được new URL() chuẩn hoá nên '..' thường bị gộp mất từ trước;
  // chốt này bắt các ca dấu / bị mã hoá (..%2F) vẫn lọt tới đây.
  if (!key || key.includes('..') || key.startsWith('/')) {
    return json({ error: 'bad_key' }, 400);
  }

  // Chuyển tiếp nguyên request để ASSETS tự xử lý If-None-Match -> 304
  const res = await env.ASSETS.fetch(request);
  if (res.status === 404) {
    return json({ error: 'not_found' }, 404);
  }

  const headers = new Headers(res.headers);
  const ext = key.split('.').pop();
  headers.set('Content-Type', CONTENT_TYPES[ext] ?? 'application/octet-stream');
  // Đường dẫn có sẵn số phiên bản nên nội dung không bao giờ đổi -> cache thoải mái
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');

  return new Response(res.status === 304 || request.method === 'HEAD' ? null : res.body, {
    status: res.status,
    headers,
  });
};

const REGISTRY_KEY = 'miniapp-registry';
const REGISTRY_LOG_KEY = 'miniapp-registry-log';
// Giữ đủ để lần lại vài lần chỉnh gần nhất, không biến KV thành kho lịch sử
const LOG_MAX = 50;

const readRegistry = async env => {
  try {
    const raw = await env.RATE_LIMIT.get(REGISTRY_KEY);
    return raw ? JSON.parse(raw) : { miniApps: [] };
  } catch (err) {
    // Registry hỏng thì trả rỗng — app phải chạy được khi không có mini-app nào
    console.error('registry hỏng', err);
    return { miniApps: [] };
  }
};

/** App gọi để biết nên tải phiên bản nào. Chỉ đọc, không cần xác thực. */
const handleRegistry = async (request, env, url) => {
  if (request.method !== 'GET') {
    return json({ error: 'method_not_allowed' }, 405);
  }
  const hostVersion = url.searchParams.get('host') ?? '1.0.0';
  const deviceId = url.searchParams.get('device') ?? 'anonymous';

  // Ghim phiên bản để QA: ?pin=loyalty@1.2.0
  const pins = {};
  for (const raw of url.searchParams.getAll('pin')) {
    const [id, version] = raw.split('@');
    if (id && version) { pins[id] = version; }
  }

  const registry = await readRegistry(env);
  return json({ miniApps: resolveManifest(registry, { hostVersion, deviceId, pins }) });
};

/** Dashboard đọc/ghi toàn bộ registry. Cần ADMIN_TOKEN. */
const isAdmin = (request, env) => {
  const auth = request.headers.get('Authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  // Thiếu secret thì KHOÁ hẳn thay vì mở toang
  return Boolean(env.ADMIN_TOKEN) && token === env.ADMIN_TOKEN;
};

const handleRegistryAdmin = async (request, env) => {
  if (!isAdmin(request, env)) {
    return json({ error: 'unauthorized' }, 401);
  }

  if (request.method === 'GET') {
    return json(await readRegistry(env));
  }
  if (request.method === 'PUT') {
    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'bad_json' }, 400);
    }
    if (!Array.isArray(body?.miniApps)) {
      return json({ error: 'bad_shape' }, 400);
    }

    // Ghi nhật ký TRƯỚC khi ghi đè, vì cần bản cũ để so
    const previous = await readRegistry(env);
    const changes = diffRegistry(previous, body);

    await env.RATE_LIMIT.put(REGISTRY_KEY, JSON.stringify(body));

    // Nhật ký hỏng không được làm hỏng việc lưu registry
    if (changes.length) {
      try {
        const log = await readLog(env);
        log.unshift({ at: new Date().toISOString(), changes });
        await env.RATE_LIMIT.put(REGISTRY_LOG_KEY, JSON.stringify(log.slice(0, LOG_MAX)));
      } catch (err) {
        console.error('không ghi được nhật ký', err);
      }
    }

    return json({ ok: true, count: body.miniApps.length, changes });
  }
  return json({ error: 'method_not_allowed' }, 405);
};

const readLog = async env => {
  try {
    const raw = await env.RATE_LIMIT.get(REGISTRY_LOG_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/** Nhật ký thay đổi registry. Cần ADMIN_TOKEN như mọi thứ khác trong /admin. */
const handleRegistryLog = async (request, env) => {
  if (!isAdmin(request, env)) { return json({ error: 'unauthorized' }, 401); }
  if (request.method !== 'GET') { return json({ error: 'method_not_allowed' }, 405); }
  return json({ entries: await readLog(env) });
};

/**
 * Ước lượng xem sửa rollout xong thì thiết bị nào nhận bản nào.
 * Bắt token vì nó chạy vòng lặp tốn CPU, và vì nó là công cụ vận hành.
 */
const handleSimulate = async (request, env, url) => {
  if (!isAdmin(request, env)) { return json({ error: 'unauthorized' }, 401); }
  if (request.method !== 'GET') { return json({ error: 'method_not_allowed' }, 405); }

  const id = url.searchParams.get('app');
  const hostVersion = url.searchParams.get('host') ?? '1.0.0';
  const sampleSize = url.searchParams.get('n') ?? 1000;

  const registry = await readRegistry(env);
  const app = registry.miniApps?.find(a => a.id === id);
  if (!app) { return json({ error: 'not_found' }, 404); }

  return json(simulateRollout(app, { hostVersion, sampleSize }));
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/health') {
      // Kèm token thì trả thêm provider nào đã sẵn sàng. Chỉ boolean, không bao
      // giờ lộ giá trị key — nhưng vẫn gác token để không phơi cấu hình ra ngoài.
      if (isAdmin(request, env)) {
        return json({
          ok: true,
          provider: pickProvider(env)?.NAME ?? null,
          configured: Object.fromEntries(
            PROVIDERS.map(p => [p.NAME, p.isConfigured(env)]),
          ),
        });
      }
      return json({ ok: true });
    }

    // ─── Registry mini-app ───────────────────────────────────────────────
    if (url.pathname.startsWith(BUNDLE_PREFIX)) {
      return handleBundle(request, env, url);
    }
    if (url.pathname === '/registry') {
      return handleRegistry(request, env, url);
    }
    if (url.pathname === '/registry/admin') {
      return handleRegistryAdmin(request, env);
    }
    if (url.pathname === '/registry/admin/log') {
      return handleRegistryLog(request, env);
    }
    if (url.pathname === '/registry/simulate') {
      return handleSimulate(request, env, url);
    }
    // Trang quản trị. HTML tự nó không chứa gì bí mật — token do người vận hành
    // nhập lúc chạy, và mọi lệnh đọc/ghi vẫn phải qua /registry/admin.
    if (url.pathname === '/admin') {
      return new Response(ADMIN_HTML, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store',
          // Trang chỉ gọi chính nó; khoá luôn để lỡ có XSS cũng không gửi token đi đâu được
          'Content-Security-Policy':
            "default-src 'none'; connect-src 'self'; style-src 'unsafe-inline'; script-src 'unsafe-inline'",
          'X-Frame-Options': 'DENY',
        },
      });
    }
    const isStream = url.pathname === '/chat/stream';
    // Chặng 1 của vòng tool calling: model quyết định gọi hàm nào.
    // KHÔNG stream được vì thứ trả về là lệnh gọi hàm chứ không phải chữ.
    const isTools = url.pathname === '/chat/tools';
    if (
      request.method !== 'POST' ||
      (url.pathname !== '/chat' && !isStream && !isTools)
    ) {
      return json({ error: 'not_found' }, 404);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'bad_json' }, 400);
    }

    const messages = sanitizeMessages(body?.messages);
    if (!messages) {
      return json({ error: 'bad_messages' }, 400);
    }

    const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
    const limitMessage = await checkLimits(env.RATE_LIMIT, ip, Date.now());
    if (limitMessage) {
      return json({ error: 'rate_limited', message: limitMessage }, 429);
    }

    const provider = pickProvider(env);
    if (!provider) {
      console.error('chưa cấu hình provider nào (ANTHROPIC_API_KEY hoặc GEMINI_API_KEY)');
      return json({ error: 'no_provider' }, 502);
    }

    const args = { env, system: SYSTEM_PROMPT, messages };

    try {
      if (isStream) {
        return new Response(pipeTextStream(provider.streamText(args)), {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
          },
        });
      }

      const out = await provider.complete(
        isTools ? { ...args, tools: TOOL_DECLARATIONS } : args,
      );

      if (out.kind === 'refusal') {
        console.error('bị từ chối', out.category);
        return json({ error: 'refusal' }, 502);
      }

      // Chặn cả ở đây phòng model bịa ra tên tool không khai báo
      if (out.kind === 'tool') {
        if (!isAllowedTool(out.name)) {
          console.error('model gọi tool ngoài danh sách', out.name);
          return json({ error: 'unknown_tool' }, 502);
        }
        return json({ toolUse: { id: out.id, name: out.name, input: out.input } });
      }

      if (!out.text) {
        console.error('model trả rỗng');
        return json({ error: 'empty' }, 502);
      }
      return json({ text: out.text });
    } catch (err) {
      // In thông điệp ra log Worker để còn chẩn đoán được, nhưng KHÔNG trả ra
      // ngoài — nó có thể lộ thông tin về key/hạn mức.
      console.error(`không gọi được ${provider.NAME}`, err?.status, err?.message);
      return json({ error: 'upstream' }, 502);
    }
  },
};
