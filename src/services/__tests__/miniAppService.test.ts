// Resolver quyết định app tải bundle mini-app từ URL nào. Sai ở đây là tải
// nhầm bundle hoặc treo — và lỗi rất im lặng.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { reloadManifest, getManifest, resolveScriptUrl } from '../miniAppService';

const DEV_SERVER = 'http://localhost:8088/host.chunk.bundle';
const BASE = 'https://cdn.example.com/loyalty/1.0.0';

const entry = (over: Record<string, unknown> = {}) => ({
  id: 'loyalty',
  name: { vi: 'Tích điểm', en: 'Loyalty' },
  icon: 'gift-outline',
  version: '1.0.0',
  container: `${BASE}/loyalty.container.bundle`,
  chunkBase: BASE,
  sha256: null,
  ...over,
});

const mockRegistry = (miniApps: unknown[]) => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => ({ miniApps }),
  });
};

beforeEach(async () => {
  (global.fetch as jest.Mock).mockReset();
  // Dọn cache: loadManifest cố ý rơi về bản đã lưu khi mạng hỏng, nên còn cache
  // cũ thì test sau nhìn thấy dữ liệu của test trước.
  await AsyncStorage.clear();
});

describe('nạp manifest', () => {
  it('lấy được danh sách từ registry', async () => {
    mockRegistry([entry()]);
    await reloadManifest('1.0.0');
    expect(getManifest()).toHaveLength(1);
    expect(getManifest()[0].id).toBe('loyalty');
  });

  it('registry hỏng thì KHÔNG ném lỗi — app phải mở được', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('mất mạng'));
    await expect(reloadManifest('1.0.0')).resolves.toBeDefined();
  });

  it('registry trả sai cấu trúc thì rơi về bản đã lưu, không ném lỗi', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ oops: 1 }) });
    await expect(reloadManifest('1.0.0')).resolves.toEqual([]);
  });

  it('HTTP lỗi cũng nuốt', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) });
    await expect(reloadManifest('1.0.0')).resolves.toBeDefined();
  });

  it('gửi kèm phiên bản host để registry lọc theo tương thích', async () => {
    mockRegistry([]);
    await reloadManifest('2.3.4');
    const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain('host=2.3.4');
    expect(url).toContain('device=');
  });
});

describe('resolveScriptUrl', () => {
  beforeEach(async () => {
    mockRegistry([entry()]);
    await reloadManifest('1.0.0');
  });

  it('scriptId trùng id mini-app -> file container của phiên bản đã chốt', () => {
    expect(resolveScriptUrl('loyalty', 'main', DEV_SERVER)).toBe(`${BASE}/loyalty.container.bundle`);
  });

  it('chunk con ghép từ chunkBase', () => {
    expect(resolveScriptUrl('__federation_expose_App', 'loyalty', DEV_SERVER))
      .toBe(`${BASE}/__federation_expose_App.chunk.bundle`);
  });

  it('chunk của chính host đi về dev server', () => {
    expect(resolveScriptUrl('vendors_react', 'main', DEV_SERVER)).toBe(DEV_SERVER);
  });

  it('scriptId lạ trả undefined — thà báo lỗi tải còn hơn đoán bừa một URL', () => {
    expect(resolveScriptUrl('khongTonTai', undefined, DEV_SERVER)).toBeUndefined();
  });
});

describe('chunkBase thiếu hoặc thừa dấu gạch chéo', () => {
  it.each([
    ['không có dấu / cuối', BASE],
    ['có dấu / cuối', `${BASE}/`],
  ])('%s đều ghép ra đúng một dấu /', async (_label, chunkBase) => {
    mockRegistry([entry({ chunkBase })]);
    await reloadManifest('1.0.0');
    expect(resolveScriptUrl('abc', 'loyalty', DEV_SERVER)).toBe(`${BASE}/abc.chunk.bundle`);
  });
});

describe('mini-app bị gỡ khỏi registry', () => {
  it('không rơi về bundle cũ ở localhost', async () => {
    mockRegistry([]);
    await reloadManifest('1.0.0');
    const url = resolveScriptUrl('loyalty', 'main', DEV_SERVER);
    expect(url ?? '').not.toContain('localhost:9000');
  });
});
