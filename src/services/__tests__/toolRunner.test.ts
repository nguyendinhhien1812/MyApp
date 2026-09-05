// Đây là nơi model chạm vào dữ liệu thật của app, nên trọng tâm không phải
// "trả đúng số" mà là "không bao giờ ném lỗi và không bao giờ tự ý làm gì".

import { runTool } from '../toolRunner';
import { getBalance } from '../accountService';
import { totalSpent } from '../expenseService';
import { TOOL_DECLARATIONS } from '../toolDeclarations';

describe('tên hàm lạ', () => {
  it('không ném lỗi, trả về kết quả mềm để model tự sửa', async () => {
    const { data } = await runTool('transferMoney', { amount: 9e9 });
    expect(data).toEqual({ ok: false, reason: 'không có hàm tên transferMoney' });
  });

  it('chuỗi rỗng cũng không làm nổ', async () => {
    await expect(runTool('', {})).resolves.toBeDefined();
  });

  it('không kèm ý định điều hướng', async () => {
    const { nav } = await runTool('deleteEverything', {});
    expect(nav).toBeUndefined();
  });
});

describe('mọi tool đã khai báo đều chạy được', () => {
  // Khai báo mà không chạy được nghĩa là model sẽ gọi vào khoảng không
  const names = TOOL_DECLARATIONS.map(d => d.name);

  it.each(names)('%s không ném lỗi khi gọi với tham số rỗng', async name => {
    await expect(runTool(name, {})).resolves.toBeDefined();
  });

  it.each(names)('%s luôn trả về trường data', async name => {
    const { data } = await runTool(name, {});
    expect(data).toBeDefined();
  });
});

describe('dữ liệu trả về khớp với service', () => {
  it('getBalance khớp accountService', async () => {
    const { data } = await runTool('getBalance', {});
    expect(data).toMatchObject({ balance: getBalance(), currency: 'VND' });
  });

  it('totalSpent khớp expenseService', async () => {
    const { data } = await runTool('totalSpent', {});
    expect(data).toMatchObject({ total: totalSpent(), currency: 'VND' });
  });
});

describe('openScreen — tool duy nhất có tác dụng phụ', () => {
  it('thiếu tên màn thì từ chối, không điều hướng', async () => {
    const { data, nav } = await runTool('openScreen', {});
    expect(data).toMatchObject({ ok: false });
    expect(nav).toBeUndefined();
  });

  it('có tên màn thì trả ý định điều hướng', async () => {
    const { data, nav } = await runTool('openScreen', { screen: 'TransferMoney' });
    expect(nav).toMatchObject({ screen: 'TransferMoney' });
    expect(data).toMatchObject({ ok: true, opened: 'TransferMoney' });
  });

  it('nói rõ CHƯA thực hiện giao dịch — để model không tường thuật sai', async () => {
    const { data } = await runTool('openScreen', { screen: 'TransferMoney', amount: 500000 });
    expect(JSON.stringify(data)).toContain('Chưa thực hiện giao dịch');
  });

  it('mang theo dữ liệu điền sẵn', async () => {
    const { nav } = await runTool('openScreen', {
      screen: 'TransferMoney', contactName: 'John Smith', amount: 500000,
    });
    expect(nav).toMatchObject({ contactName: 'John Smith', amount: 500000 });
  });
});

describe('KHÔNG có tool nào chuyển được tiền', () => {
  // Bất biến an toàn của app tài chính: mọi tool đều chỉ đọc.
  it('không tool nào tên gợi ý hành động chuyển tiền', () => {
    const risky = /transfer|send|pay|withdraw|delete|remove/i;
    const bad = TOOL_DECLARATIONS.filter(d => risky.test(d.name));
    expect(bad.map(d => d.name)).toEqual([]);
  });
});
