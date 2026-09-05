// Danh bạ chuyển tiền. Trước đây RECENT và ALL_CONTACTS là hai mảng riêng, trong
// đó RECENT chỉ là 5 người đầu với tên rút gọn — nay suy ra từ một nguồn.

export type RelativeTime = {
  value: number;
  unit: 'days' | 'weeks' | 'months';
};

export type Contact = {
  id: number;
  name: string;
  bank: string;
  avatar: string;
  lastAmount: number;
  // Trước đây là chuỗi '2 ngày trước' viết cứng nên bản tiếng Anh không dịch được
  lastSeen: RelativeTime;
};

const CONTACTS: Contact[] = [
  { id: 1, name: 'John Smith',   bank: 'Vietcombank', avatar: 'https://i.pravatar.cc/80?img=1',  lastAmount: 500_000,   lastSeen: { value: 2, unit: 'days' } },
  { id: 2, name: 'Kevin Brown',  bank: 'Techcombank', avatar: 'https://i.pravatar.cc/80?img=12', lastAmount: 200_000,   lastSeen: { value: 4, unit: 'days' } },
  { id: 3, name: 'Lyda Hansen',  bank: 'BIDV',        avatar: 'https://i.pravatar.cc/80?img=5',  lastAmount: 1_000_000, lastSeen: { value: 5, unit: 'days' } },
  { id: 4, name: 'Marry White',  bank: 'ACB',         avatar: 'https://i.pravatar.cc/80?img=9',  lastAmount: 300_000,   lastSeen: { value: 1, unit: 'weeks' } },
  { id: 5, name: 'Evelyn Davis', bank: 'MB Bank',     avatar: 'https://i.pravatar.cc/80?img=20', lastAmount: 150_000,   lastSeen: { value: 2, unit: 'weeks' } },
  { id: 6, name: 'Michael Lee',  bank: 'TPBank',      avatar: 'https://i.pravatar.cc/80?img=3',  lastAmount: 800_000,   lastSeen: { value: 3, unit: 'weeks' } },
  { id: 7, name: 'Sarah Kim',    bank: 'Sacombank',   avatar: 'https://i.pravatar.cc/80?img=47', lastAmount: 450_000,   lastSeen: { value: 1, unit: 'months' } },
];

export const listContacts = (): Contact[] => [...CONTACTS];

/** Tìm theo tên hoặc tên ngân hàng; chuỗi rỗng trả về tất cả. */
export const searchContacts = (query: string): Contact[] => {
  const q = query.trim().toLowerCase();
  if (!q) { return [...CONTACTS]; }
  return CONTACTS.filter(
    c => c.name.toLowerCase().includes(q) || c.bank.toLowerCase().includes(q),
  );
};

/** Người liên hệ gần đây, kèm tên rút gọn để hiển thị dưới avatar. */
export const recentContacts = (limit = 5): Array<Contact & { shortName: string }> =>
  CONTACTS.slice(0, limit).map(c => ({ ...c, shortName: c.name.split(' ')[0] }));
