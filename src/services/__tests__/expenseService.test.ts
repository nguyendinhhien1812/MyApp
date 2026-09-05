import {
  listCategories,
  spendingByCategory,
  listExpenses,
  topExpenses,
  totalSpent,
  getChart,
  CategoryId,
} from '../expenseService';

describe('spendingByCategory', () => {
  it('sắp giảm dần theo số tiền', () => {
    const rows = spendingByCategory();
    const totals = rows.map(r => r.total);
    expect([...totals].sort((a, b) => b - a)).toEqual(totals);
  });

  it('tỉ lệ phần trăm cộng lại xấp xỉ 100%', () => {
    const sum = spendingByCategory().reduce((s, c) => s + c.percent, 0);
    expect(sum).toBeCloseTo(1, 2);
  });

  it('mọi tỉ lệ nằm trong khoảng 0–1', () => {
    expect(spendingByCategory().every(c => c.percent >= 0 && c.percent <= 1)).toBe(true);
  });

  it('không bịa ra danh mục lạ', () => {
    const known = new Set(listCategories().map(c => c.id));
    expect(spendingByCategory().every(c => known.has(c.id))).toBe(true);
  });
});

describe('listExpenses', () => {
  it('lọc theo danh mục chỉ trả về đúng danh mục đó', () => {
    for (const cat of listCategories()) {
      const rows = listExpenses({ categoryId: cat.id });
      expect(rows.every(e => e.categoryId === cat.id)).toBe(true);
    }
  });

  it('gộp các danh mục lại bằng đúng tổng — không khoản nào rơi ra ngoài', () => {
    const perCat = listCategories()
      .reduce((n, c) => n + listExpenses({ categoryId: c.id }).length, 0);
    expect(perCat).toBe(listExpenses().length);
  });

  it('danh mục không tồn tại thì trả về rỗng', () => {
    expect(listExpenses({ categoryId: 'khong-co' as CategoryId })).toEqual([]);
  });
});

describe('topExpenses', () => {
  it('trả đúng số lượng yêu cầu', () => {
    expect(topExpenses(3)).toHaveLength(3);
    expect(topExpenses(1)).toHaveLength(1);
  });

  it('sắp theo giá trị tuyệt đối giảm dần', () => {
    const amounts = topExpenses(5).map(e => Math.abs(e.amount));
    expect([...amounts].sort((a, b) => b - a)).toEqual(amounts);
  });

  it('xin nhiều hơn số có thì trả về tất cả, không lỗi', () => {
    expect(topExpenses(9999).length).toBe(listExpenses().length);
  });

  it('KHÔNG xáo thứ tự dữ liệu gốc dù bên trong có sort', () => {
    const before = listExpenses().map(e => e.id);
    topExpenses(5);
    expect(listExpenses().map(e => e.id)).toEqual(before);
  });
});

describe('totalSpent', () => {
  it('bằng đúng tổng các khoản chi', () => {
    const sum = listExpenses().reduce((s, e) => s + Math.abs(e.amount), 0);
    expect(totalSpent()).toBe(sum);
  });
});

describe('getChart', () => {
  it.each(['week', 'month', 'year'] as const)('kỳ %s: số cột khớp số nhãn', period => {
    const { values, labels } = getChart(period);
    expect(values).toHaveLength(labels.length);
    expect(values.length).toBeGreaterThan(0);
  });

  it('không có giá trị âm', () => {
    for (const p of ['week', 'month', 'year'] as const) {
      expect(getChart(p).values.every(v => v >= 0)).toBe(true);
    }
  });
});
