// Cầu nối giữa registry trên server và ScriptManager của Re.Pack.
//
// Nhiệm vụ: trả lời câu "scriptId này tải từ URL nào". Trước đây URL cứng
// localhost:9000; giờ do registry quyết định, có phiên bản và rollout.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../utils/logger';

// Để rỗng = không dùng registry, quay về hành vi dev cũ (localhost:9000).
// Đây là URL, không phải bí mật.
export const REGISTRY_URL = 'https://myapp-ai-proxy.kyonguyen00775.workers.dev';

// Cổng dev cho mini-app chạy local — dùng khi chưa cấu hình registry
const DEV_MINIAPP_PORT = 9000;

/**
 * Remote mà host khai sẵn trong rspack.config.mjs. Tên PHẢI trùng id trong
 * registry — resolver tra bằng scriptId, mà scriptId chính là tên remote.
 * Danh sách này phải khớp LOADERS ở src/container/MiniApps/loaders.ts.
 */
export const DECLARED_REMOTES = ['loyalty'];

/** Nhãn phiên bản ở chế độ dev — không phải semver nên đừng đem đi so sánh. */
export const DEV_VERSION = 'dev';

const CACHE_KEY = '@myapp/miniapp-manifest';
const DEVICE_KEY = '@myapp/device-id';

export type MiniAppEntry = {
  id: string;
  name?: Record<string, string>;
  icon?: string;
  version: string;
  container: string;
  chunkBase: string;
  sha256: string | null;
};

/**
 * Manifest giả lập khi chưa nối registry: coi mọi remote đã khai là đang chạy
 * ở cổng dev. Nhờ vậy màn danh sách dùng được ngay mà không cần dựng server —
 * và resolver chỉ có MỘT đường tra URL, không phải hai.
 */
const devManifest = (): MiniAppEntry[] =>
  DECLARED_REMOTES.map(id => ({
    id,
    version: DEV_VERSION,
    container: `http://localhost:${DEV_MINIAPP_PORT}/${id}.container.bundle`,
    chunkBase: `http://localhost:${DEV_MINIAPP_PORT}/`,
    sha256: null,
  }));

let manifest: MiniAppEntry[] = [];
let deviceId = 'anonymous';

/** ID thiết bị ổn định — rollout phải bám theo máy, không đổi mỗi lần mở app. */
const loadDeviceId = async (): Promise<string> => {
  try {
    const saved = await AsyncStorage.getItem(DEVICE_KEY);
    if (saved) { return saved; }
    // Không cần bảo mật, chỉ cần ổn định và phân tán đều
    const id = `d-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    await AsyncStorage.setItem(DEVICE_KEY, id);
    return id;
  } catch (err) {
    logger.warn('miniapp', 'không đọc/ghi được device id, rollout sẽ không ổn định', err);
    return 'anonymous';
  }
};

const readCache = async (): Promise<MiniAppEntry[]> => {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/**
 * Nạp danh sách mini-app. Gọi một lần lúc khởi động.
 * Mạng hỏng thì dùng bản đã lưu — app vẫn mở được mini-app đã tải trước đó.
 */
export const loadManifest = async (hostVersion: string): Promise<MiniAppEntry[]> => {
  deviceId = await loadDeviceId();

  if (!REGISTRY_URL) {
    manifest = devManifest();
    return manifest;
  }

  try {
    const url = `${REGISTRY_URL}/registry?host=${encodeURIComponent(hostVersion)}&device=${encodeURIComponent(deviceId)}`;
    const res = await fetch(url);
    if (!res.ok) { throw new Error(`HTTP ${res.status}`); }
    const data = await res.json();
    if (!Array.isArray(data?.miniApps)) { throw new Error('Sai cấu trúc'); }

    manifest = data.miniApps;
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(manifest)).catch(() => {});
    return manifest;
  } catch (err) {
    // Không chặn khởi động vì registry hỏng — dùng bản lưu, tệ nhất là rỗng
    logger.warn('miniapp', 'không tải được registry, dùng bản đã lưu', err);
    manifest = await readCache();
    return manifest;
  }
};

export const getManifest = (): MiniAppEntry[] => manifest;

let ready: Promise<MiniAppEntry[]> | null = null;

/**
 * Nạp manifest đúng MỘT lần rồi dùng lại promise đó.
 * Cả resolver lúc khởi động lẫn màn danh sách đều chờ cùng promise này —
 * nếu mỗi bên tự gọi loadManifest thì màn hình có thể render trước khi
 * manifest kịp về và hiện ra danh sách rỗng.
 */
export const ensureManifest = (hostVersion: string): Promise<MiniAppEntry[]> => {
  if (!ready) { ready = loadManifest(hostVersion); }
  return ready;
};

/** Buộc tải lại từ registry, bỏ qua promise đã ghi nhớ. */
export const reloadManifest = (hostVersion: string): Promise<MiniAppEntry[]> => {
  ready = loadManifest(hostVersion);
  return ready;
};

export const findMiniApp = (id: string): MiniAppEntry | undefined =>
  manifest.find(m => m.id === id);

/**
 * Quyết định URL cho ScriptManager.
 *
 * - scriptId trùng id một mini-app  -> file container của phiên bản đã chốt
 * - caller là id một mini-app       -> chunk con, ghép từ chunkBase
 * - còn lại                          -> chunk của chính host
 *
 * Trả undefined nghĩa là "không biết" — Re.Pack sẽ báo lỗi tải, đúng hơn là
 * đoán bừa một URL rồi chạy nhầm bundle.
 */
export const resolveScriptUrl = (
  scriptId: string,
  caller: string | undefined,
  devServerUrl: string | undefined,
): string | undefined => {
  const asContainer = findMiniApp(scriptId);
  if (asContainer) { return asContainer.container; }

  const owner = caller ? findMiniApp(caller) : undefined;
  if (owner) {
    const base = owner.chunkBase.endsWith('/') ? owner.chunkBase : `${owner.chunkBase}/`;
    return `${base}${scriptId}.chunk.bundle`;
  }

  if (caller === 'main') { return devServerUrl; }

  // Chưa cấu hình registry: giữ hành vi dev cũ để chạy local vẫn được
  if (!REGISTRY_URL) {
    return `http://localhost:${DEV_MINIAPP_PORT}/${scriptId}.chunk.bundle`;
  }

  // Không thuộc về registry -> trả undefined để resolver kế tiếp (của Module
  // Federation) xử lý. Đoán bừa devServerUrl ở đây chỉ tạo ra lỗi 404 khó hiểu.
  return undefined;
};
