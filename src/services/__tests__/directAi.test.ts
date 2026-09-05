// App gọi thẳng nhà cung cấp model. Hai thứ đáng test: nhận diện đúng loại key
// (đoán sai là gọi nhầm nơi), và vòng tool calling không bao giờ mất kiểm soát.

import { detectProvider, askDirect } from '../directAi';
import { TOOL_DECLARATIONS } from '../toolDeclarations';

const turns = [{ role: 'user' as const, text: 'số dư của tôi bao nhiêu' }];
const SYS = 'Bạn là trợ lý.';
const setup = (runTool: jest.Mock) => ({ tools: TOOL_DECLARATIONS, runTool });

const okJson = (body: unknown) => ({ ok: true, status: 200, json: async () => body });

const geminiCall = (name: string) =>
  okJson({ candidates: [{ content: { parts: [{ functionCall: { name, args: {} } }] } }] });
const geminiText = (text: string) =>
  okJson({ candidates: [{ content: { parts: [{ text }] } }] });

beforeEach(() => { (global.fetch as jest.Mock).mockReset(); });

describe('detectProvider', () => {
  it.each([
    ['AIzaSyB1234567890', 'gemini'],
    ['sk-ant-api03-abc', 'claude'],
    ['  AIzaSyB123  ', 'gemini'],
  ])('%s -> %s', (key, want) => {
    expect(detectProvider(key)).toBe(want);
  });

  it.each([['sk-proj-openai'], ['abc'], [''], ['   '], ['aizaThuong']])(
    '%s -> không nhận ra', key => {
      expect(detectProvider(key)).toBeNull();
    });
});

describe('key không nhận ra', () => {
  it('báo lỗi ngay, KHÔNG gọi mạng', async () => {
    const r = await askDirect(turns, 'khong-phai-key', SYS);
    expect(r.error).toBe('invalidKey');
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

describe('ánh xạ mã lỗi HTTP', () => {
  it.each([
    [401, 'invalidKey'],
    [429, 'rateLimit'],
    [500, 'network'],
  ])('Claude %i -> %s', async (status, want) => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status, json: async () => ({}) });
    expect((await askDirect(turns, 'sk-ant-x', SYS)).error).toBe(want);
  });

  it('mạng đứt giữa chừng -> network, không ném lỗi', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('đứt'));
    await expect(askDirect(turns, 'AIzaX', SYS)).resolves.toMatchObject({ error: 'network' });
  });

  it('Claude từ chối trả lời -> không trả câu rỗng cho người dùng', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      okJson({ stop_reason: 'refusal', content: [] }));
    expect((await askDirect(turns, 'sk-ant-x', SYS)).error).toBe('network');
  });
});

describe('vòng tool calling', () => {
  it('Gemini: gọi tool rồi diễn giải kết quả', async () => {
    const runTool = jest.fn().mockResolvedValue({ balance: 12500000, currency: 'VND' });
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(geminiCall('getBalance'))
      .mockResolvedValueOnce(geminiText('Số dư của bạn là 12.500.000đ.'));

    const r = await askDirect(turns, 'AIzaX', SYS, setup(runTool));
    expect(runTool).toHaveBeenCalledWith('getBalance', {});
    expect(r).toEqual({ text: 'Số dư của bạn là 12.500.000đ.', error: '' });
  });

  it('Claude: gửi lại đúng tool_use_id đã nhận', async () => {
    const runTool = jest.fn().mockResolvedValue({ balance: 1 });
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(okJson({
        stop_reason: 'tool_use',
        content: [{ type: 'tool_use', id: 'tu_xyz', name: 'getBalance', input: {} }],
      }))
      .mockResolvedValueOnce(okJson({ stop_reason: 'end_turn', content: [{ type: 'text', text: 'xong' }] }));

    await askDirect(turns, 'sk-ant-x', SYS, setup(runTool));
    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[1][1].body);
    const result = body.messages.flatMap((m: any) => Array.isArray(m.content) ? m.content : [])
      .find((b: any) => b.type === 'tool_result');
    expect(result.tool_use_id).toBe('tu_xyz');
  });

  it('model bịa tên hàm -> KHÔNG chạy, báo lại để nó tự sửa', async () => {
    const runTool = jest.fn();
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(geminiCall('transferMoney'))
      .mockResolvedValueOnce(geminiText('xin lỗi'));

    await askDirect(turns, 'AIzaX', SYS, setup(runTool));
    expect(runTool).not.toHaveBeenCalled();
  });

  it('tool ném lỗi -> vẫn trả lời được, không vỡ cả lượt chat', async () => {
    const runTool = jest.fn().mockRejectedValue(new Error('mạng hỏng'));
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(geminiCall('getBalance'))
      .mockResolvedValueOnce(geminiText('mình chưa lấy được số dư'));

    const r = await askDirect(turns, 'AIzaX', SYS, setup(runTool));
    expect(r.error).toBe('');
  });

  it('model đòi gọi tool mãi -> dừng ở 3 vòng, vẫn có câu trả lời', async () => {
    const runTool = jest.fn().mockResolvedValue({ ok: true });
    (global.fetch as jest.Mock).mockImplementation(async (_url: string, init: any) => {
      const body = JSON.parse(init.body);
      return body.tools ? geminiCall('getBalance') : geminiText('đành chịu');
    });

    const r = await askDirect(turns, 'AIzaX', SYS, setup(runTool));
    expect(runTool).toHaveBeenCalledTimes(3);
    expect(r).toEqual({ text: 'đành chịu', error: '' });
  });

  it('không truyền setup thì không gửi trường tools', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(geminiText('chào'));
    await askDirect(turns, 'AIzaX', SYS);
    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body.tools).toBeUndefined();
  });
});

describe('chuẩn hoá lượt hội thoại', () => {
  it('bỏ các lượt bot đứng đầu — cả hai API đều đòi lượt đầu là của người dùng', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(geminiText('ok'));
    await askDirect(
      [{ role: 'assistant', text: 'chào bạn' }, { role: 'user', text: 'hỏi' }],
      'AIzaX', SYS,
    );
    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body.contents[0].role).toBe('user');
  });
});
