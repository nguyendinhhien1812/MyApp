// Test cho tầng dữ liệu tài khoản.
//
// Trọng tâm là các BẤT BIẾN chứ không phải giá trị cụ thể: dữ liệu demo có thể
// đổi, nhưng "lọc rồi gom nhóm không được làm mất giao dịch nào" thì luôn đúng.

import {
  getBalance,
  listTransactions,
  groupTransactionsByDate,
  listQuickSend,
} from '../accountService';

describe('listTransactions', () => {
  it('không lọc thì trả về tất cả', () => {
    expect(listTransactions()).toHaveLength(listTransactions(undefined).length);
    expect(listTransactions().length).toBeGreaterThan(0);
  });

  it('lọc income chỉ ra tiền vào', () => {
    const rows = listTransactions({ type: 'income' });
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every(t => t.type === 'income')).toBe(true);
  });

  it('lọc expense chỉ ra tiền ra', () => {
    const rows = listTransactions({ type: 'expense' });
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every(t => t.type === 'expense')).toBe(true);
  });

  it('hai nhóm lọc cộng lại bằng tổng — không giao dịch nào rơi ra ngoài', () => {
    const all = listTransactions().length;
    const income = listTransactions({ type: 'income' }).length;
    const expense = listTransactions({ type: 'expense' }).length;
    expect(income + expense).toBe(all);
  });

  it('trả về mảng mới, sửa kết quả không đụng vào dữ liệu gốc', () => {
    const first = listTransactions();
    first.pop();
    expect(listTransactions().length).toBe(first.length + 1);
  });
});

describe('groupTransactionsByDate', () => {
  it('gom đủ, không mất và không nhân đôi giao dịch nào', () => {
    const all = listTransactions();
    const grouped = groupTransactionsByDate(all);
    const flat = grouped.flatMap(g => g.data);
    expect(flat).toHaveLength(all.length);
    expect(new Set(flat.map(t => t.id)).size).toBe(all.length);
  });

  it('không tạo nhóm rỗng', () => {
    const grouped = groupTransactionsByDate(listTransactions());
    expect(grouped.every(g => g.data.length > 0)).toBe(true);
  });

  it('mỗi nhóm chỉ chứa giao dịch đúng mốc thời gian của nó', () => {
    const grouped = groupTransactionsByDate(listTransactions());
    for (const g of grouped) {
      expect(g.data.every(t => t.dateGroup === g.dateGroup)).toBe(true);
    }
  });

  it('danh sách rỗng thì không có nhóm nào', () => {
    expect(groupTransactionsByDate([])).toEqual([]);
  });

  it('lọc trước rồi gom vẫn giữ đủ số giao dịch đã lọc', () => {
    const income = listTransactions({ type: 'income' });
    const flat = groupTransactionsByDate(income).flatMap(g => g.data);
    expect(flat).toHaveLength(income.length);
  });
});

describe('dữ liệu nền', () => {
  it('số dư là số dương', () => {
    expect(getBalance()).toBeGreaterThan(0);
  });

  it('gửi nhanh không trùng id', () => {
    const ids = listQuickSend().map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('mọi giao dịch đều có id duy nhất', () => {
    const ids = listTransactions().map(t => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
