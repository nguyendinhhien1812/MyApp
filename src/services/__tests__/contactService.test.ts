import { listContacts, searchContacts, recentContacts } from '../contactService';

describe('searchContacts', () => {
  it('chuỗi rỗng trả về tất cả', () => {
    expect(searchContacts('')).toHaveLength(listContacts().length);
  });

  it('chỉ toàn khoảng trắng cũng coi như rỗng', () => {
    expect(searchContacts('   ')).toHaveLength(listContacts().length);
  });

  it('không phân biệt hoa thường', () => {
    const name = listContacts()[0].name;
    expect(searchContacts(name.toUpperCase())).toEqual(searchContacts(name.toLowerCase()));
  });

  it('bỏ qua khoảng trắng thừa hai đầu', () => {
    const name = listContacts()[0].name;
    expect(searchContacts(`  ${name}  `)).toEqual(searchContacts(name));
  });

  it('tìm được theo tên ngân hàng, không chỉ theo tên người', () => {
    const bank = listContacts()[0].bank;
    const rows = searchContacts(bank);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every(c => c.name.toLowerCase().includes(bank.toLowerCase())
      || c.bank.toLowerCase().includes(bank.toLowerCase()))).toBe(true);
  });

  it('không khớp gì thì trả về rỗng, không lỗi', () => {
    expect(searchContacts('zzzz-khong-ton-tai-zzzz')).toEqual([]);
  });

  it('kết quả luôn là tập con của danh bạ', () => {
    const ids = new Set(listContacts().map(c => c.id));
    expect(searchContacts('a').every(c => ids.has(c.id))).toBe(true);
  });
});

describe('recentContacts', () => {
  it('tôn trọng giới hạn', () => {
    expect(recentContacts(3)).toHaveLength(3);
    expect(recentContacts(1)).toHaveLength(1);
  });

  it('xin nhiều hơn số có thì trả hết, không lỗi', () => {
    expect(recentContacts(9999)).toHaveLength(listContacts().length);
  });

  it('shortName là chữ đầu của tên đầy đủ', () => {
    for (const c of recentContacts(5)) {
      expect(c.name.startsWith(c.shortName)).toBe(true);
      expect(c.shortName).not.toContain(' ');
    }
  });
});

describe('bảo vệ dữ liệu gốc', () => {
  it('sửa kết quả không đụng vào danh bạ chung', () => {
    const n = listContacts().length;
    listContacts().pop();
    expect(listContacts()).toHaveLength(n);
  });

  it('danh bạ không trùng id', () => {
    const ids = listContacts().map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
