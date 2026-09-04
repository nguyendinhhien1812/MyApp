// Gọi thẳng nhà cung cấp model từ app, dùng key người dùng tự nhập.
//
// Vì sao có đường này bên cạnh proxy: Gemini chặn theo NƠI PHÁT REQUEST. Proxy
// chạy trên biên Cloudflare, mà datacenter đổi theo từng lần gọi nên có lần rơi
// vào nước Google không hỗ trợ — đo được 11/12 lần hỏng, bật cả Smart Placement
// cũng không cứu. Gọi thẳng từ máy người dùng thì vị trí là Việt Nam, hợp lệ.
//
// ĐÁNH ĐỔI đã biết: key nằm trong app thì moi ra được. Đường an toàn vẫn là
// proxy (AI_PROXY_URL) — dùng khi có key Claude, vì Anthropic không chặn kiểu này.

import { logger } from '../utils/logger';
import { ToolDeclaration, isAllowedTool } from './toolDeclarations';

const GEMINI_MODEL = 'gemini-3.6-flash';
const CLAUDE_MODEL = 'claude-opus-5';
const MAX_TOKENS = 2048;

export type Provider = 'gemini' | 'claude';

export type DirectResult = {
  text: string;
  /** Mã lỗi để màn hình tự chọn câu thông báo; rỗng nghĩa là thành công. */
  error: '' | 'invalidKey' | 'rateLimit' | 'network';
};

export type DirectTurn = { role: 'user' | 'assistant'; text: string };

/** App tự chạy tool rồi trả dữ liệu về cho model diễn giải. */
export type RunTool = (name: string, input: Record<string, unknown>) => Promise<unknown>;

export type ToolSetup = { tools: ToolDeclaration[]; runTool: RunTool };

// Chặn model quay vòng vô tận. Ba vòng đủ cho chuỗi dài nhất đang có
// (searchContacts -> openScreen), mà vẫn có trần.
const MAX_TOOL_ROUNDS = 3;

/**
 * Đoán provider từ dạng key. Key Anthropic bắt đầu bằng `sk-ant-`, key Google
 * AI Studio bắt đầu bằng `AIza`. Đoán sai thì gọi nhầm nơi và nhận 401 —
 * nên mặc định về Gemini chỉ khi thấy đúng tiền tố của nó.
 */
export const detectProvider = (apiKey: string): Provider | null => {
  const k = apiKey.trim();
  if (k.startsWith('sk-ant-')) { return 'claude'; }
  if (k.startsWith('AIza')) { return 'gemini'; }
  return null;
};

/** Bỏ các lượt bot đứng đầu — cả hai API đều bắt buộc lượt đầu là của người dùng. */
const trimToFirstUser = <T extends { role: string }>(turns: T[]): T[] => {
  const i = turns.findIndex(t => t.role === 'user');
  return i > 0 ? turns.slice(i) : turns;
};

/** Khai báo chuẩn Anthropic -> chuẩn Gemini. Chỉ khác tên khoá. */
const toGeminiTool = (t: ToolDeclaration) => ({
  name: t.name,
  description: t.description,
  parameters: t.input_schema,
});

/**
 * Chạy tool, có chốt chặn.
 *
 * Model có thể bịa ra tên hàm — chặn ở đây chứ không tin nó, vì `runTool` sẽ
 * đụng vào dữ liệu thật. Tool lỗi cũng không được ném ra ngoài: phải trả một
 * kết quả để model còn diễn giải, không thì cả lượt chat hỏng.
 */
const runGuarded = async (
  setup: ToolSetup,
  name: string,
  input: Record<string, unknown>,
): Promise<unknown> => {
  if (!isAllowedTool(name)) {
    logger.error('chatbot', `model gọi tool ngoài danh sách: ${name}`);
    return { ok: false, reason: `không có hàm tên ${name}` };
  }
  try {
    return await setup.runTool(name, input);
  } catch (err) {
    logger.error('chatbot', `chạy tool ${name} thất bại`, err);
    return { ok: false, reason: 'không lấy được dữ liệu' };
  }
};

const askGemini = async (
  turns: DirectTurn[],
  apiKey: string,
  system: string,
  setup?: ToolSetup,
): Promise<DirectResult> => {
  // Gemini ghép lời gọi với kết quả qua TÊN hàm, không qua id
  const contents: any[] = trimToFirstUser(
    turns.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.text }] })),
  );

  for (let round = 0; ; round++) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: system }] },
          contents,
          ...(setup && round < MAX_TOOL_ROUNDS
            ? { tools: [{ function_declarations: setup.tools.map(toGeminiTool) }] }
            : {}),
        }),
      },
    );
    const data = await res.json();

    if (!res.ok) {
      logger.error('chatbot', `gemini ${res.status}`, data?.error?.message);
      if (res.status === 400 || res.status === 403) { return { text: '', error: 'invalidKey' }; }
      if (res.status === 429) { return { text: '', error: 'rateLimit' }; }
      return { text: '', error: 'network' };
    }

    const parts = data?.candidates?.[0]?.content?.parts ?? [];
    const callPart = parts.find((p: any) => p?.functionCall);

    if (setup && callPart && round < MAX_TOOL_ROUNDS) {
      const { name, args } = callPart.functionCall;
      const result = await runGuarded(setup, name, args ?? {});
      contents.push(
        { role: 'model', parts: [{ functionCall: { name, args: args ?? {} } }] },
        { role: 'user', parts: [{ functionResponse: { name, response: { result } } }] },
      );
      continue;
    }

    const text = parts.map((p: any) => p?.text ?? '').join('').trim();
    return text ? { text, error: '' } : { text: '', error: 'network' };
  }
};

const askClaude = async (
  turns: DirectTurn[],
  apiKey: string,
  system: string,
  setup?: ToolSetup,
): Promise<DirectResult> => {
  const messages: any[] = trimToFirstUser(turns.map(m => ({ role: m.role, content: m.text })));

  for (let round = 0; ; round++) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        // Tên header nói thẳng vấn đề: key nằm trong app thì moi ra được.
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: MAX_TOKENS,
        system,
        messages,
        ...(setup && round < MAX_TOOL_ROUNDS ? { tools: setup.tools } : {}),
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      logger.error('chatbot', `claude ${res.status}`, data?.error?.type);
      if (res.status === 401) { return { text: '', error: 'invalidKey' }; }
      if (res.status === 429) { return { text: '', error: 'rateLimit' }; }
      return { text: '', error: 'network' };
    }
    if (data?.stop_reason === 'refusal') {
      logger.warn('chatbot', 'claude từ chối trả lời');
      return { text: '', error: 'network' };
    }

    const blocks = data?.content ?? [];
    const toolUse = blocks.find((b: any) => b?.type === 'tool_use');

    if (setup && toolUse && round < MAX_TOOL_ROUNDS) {
      const result = await runGuarded(setup, toolUse.name, toolUse.input ?? {});
      // Claude ghép qua tool_use_id — phải gửi lại đúng id nó cấp
      messages.push(
        { role: 'assistant', content: blocks },
        {
          role: 'user',
          content: [
            { type: 'tool_result', tool_use_id: toolUse.id, content: JSON.stringify(result) },
          ],
        },
      );
      continue;
    }

    const text = blocks
      .filter((b: any) => b?.type === 'text')
      .map((b: any) => b.text)
      .join('')
      .trim();
    return text ? { text, error: '' } : { text: '', error: 'network' };
  }
};

/** Gọi provider tương ứng với key. Không ném lỗi — luôn trả về DirectResult. */
export const askDirect = async (
  turns: DirectTurn[],
  apiKey: string,
  system: string,
  setup?: ToolSetup,
): Promise<DirectResult> => {
  const provider = detectProvider(apiKey);
  if (!provider) {
    return { text: '', error: 'invalidKey' };
  }
  try {
    return provider === 'claude'
      ? await askClaude(turns, apiKey, system, setup)
      : await askGemini(turns, apiKey, system, setup);
  } catch (err) {
    logger.error('chatbot', `không gọi được ${provider}`, err);
    return { text: '', error: 'network' };
  }
};
