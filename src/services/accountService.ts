// Tài khoản ngân hàng: số dư, lịch sử giao dịch, danh sách gửi nhanh.

export type DateGroup = 'today' | 'yesterday' | 'daysAgo2';

export type Transaction = {
  id: number;
  name: string;
  time: string;
  dateGroup: DateGroup;
  amount: number; // dương = tiền vào
  type: 'income' | 'expense';
};

export type QuickContact = { id: number; name: string; avatar: string };

const BALANCE = 1_000_000_000;

const TRANSACTIONS: Transaction[] = [
  { id: 1,  name: 'Transfer from Elly',  time: '02:45', dateGroup: 'today',     amount: 450000,   type: 'income' },
  { id: 2,  name: 'Spotify Premium',     time: '01:10', dateGroup: 'today',     amount: -8000,    type: 'expense' },
  { id: 3,  name: 'Coffee at Highland',  time: '11:32', dateGroup: 'today',     amount: -35000,   type: 'expense' },
  { id: 4,  name: 'Lương tháng 11',      time: '09:00', dateGroup: 'today',     amount: 12000000, type: 'income' },
  { id: 5,  name: 'Tiền điện',           time: '08:00', dateGroup: 'yesterday', amount: -350000,  type: 'expense' },
  { id: 6,  name: 'Chuyển tiền cho mẹ', time: '07:30', dateGroup: 'yesterday', amount: -1000000, type: 'expense' },
  { id: 7,  name: 'Zalopay Cashback',    time: '06:00', dateGroup: 'yesterday', amount: 150000,   type: 'income' },
  { id: 8,  name: 'Grab Ride',           time: '05:00', dateGroup: 'daysAgo2',  amount: -52000,   type: 'expense' },
  { id: 9,  name: 'YouTube Premium',     time: '04:00', dateGroup: 'daysAgo2',  amount: -30000,   type: 'expense' },
  { id: 10, name: 'Transfer from David', time: '10:00', dateGroup: 'daysAgo2',  amount: 2200000,  type: 'income' },
];

const QUICK_SEND: QuickContact[] = [
  { id: 1, name: 'John',   avatar: 'https://randomuser.me/api/portraits/men/75.jpg' },
  { id: 2, name: 'Kevin',  avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { id: 3, name: 'Lyda',   avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { id: 4, name: 'Marry',  avatar: 'https://randomuser.me/api/portraits/women/68.jpg' },
  { id: 5, name: 'Evelyn', avatar: 'https://randomuser.me/api/portraits/women/12.jpg' },
];

// Các hàm list* trả về BẢN SAO, không phải mảng gốc. Trả thẳng mảng nội bộ thì
// một màn gọi .sort() hay .pop() trên kết quả sẽ xáo vĩnh viễn dữ liệu chung —
// lỗi rất khó lần vì nó xuất hiện ở màn KHÁC với màn gây ra.
export const getBalance = (): number => BALANCE;

export const listTransactions = (filter?: { type?: 'income' | 'expense' }): Transaction[] =>
  filter?.type ? TRANSACTIONS.filter(tx => tx.type === filter.type) : [...TRANSACTIONS];

/** Gộp theo mốc ngày, giữ nguyên thứ tự xuất hiện. */
export const groupTransactionsByDate = (
  items: Transaction[] = TRANSACTIONS,
): { dateGroup: DateGroup; data: Transaction[] }[] =>
  items.reduce<{ dateGroup: DateGroup; data: Transaction[] }[]>((acc, tx) => {
    const group = acc.find(g => g.dateGroup === tx.dateGroup);
    if (group) { group.data.push(tx); }
    else { acc.push({ dateGroup: tx.dateGroup, data: [tx] }); }
    return acc;
  }, []);

export const listQuickSend = (): QuickContact[] => [...QUICK_SEND];
