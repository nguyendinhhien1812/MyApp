// Nguồn dữ liệu chi tiêu. Trước đây CATEGORIES (màn Chi tiêu) và CAT_STATS
// (màn Thống kê) là hai mảng riêng cùng số liệu — đã lệch nhau sẵn về thứ tự và
// việc có 'other' hay không. Giờ chỉ còn một nguồn.
//
// Các hàm dưới đây là thứ sẽ khai báo cho model ở bước tool calling, nên chữ ký
// phải rõ nghĩa với người đọc lẫn với model.

export type CategoryId =
  | 'food'
  | 'shopping'
  | 'fun'
  | 'transport'
  | 'utility'
  | 'other';

export type Category = {
  id: CategoryId;
  total: number;
  percent: number;
};

export type Expense = {
  id: number;
  name: string;
  categoryId: CategoryId;
  amount: number; // âm = chi ra
  date: string;   // dd/MM/yyyy
  time: string;
  // Icon riêng của khoản chi (Starbucks = cốc, Netflix = nút play). Màu thì suy
  // từ danh mục, nhưng icon là dữ liệu của từng bản ghi nên phải giữ.
  icon: string;
};

export type Period = 'week' | 'month' | 'year';

const CATEGORIES: Category[] = [
  { id: 'food', total: 3_200_000, percent: 0.38 },
  { id: 'shopping', total: 2_100_000, percent: 0.25 },
  { id: 'utility', total: 1_485_110, percent: 0.18 },
  { id: 'fun', total: 890_000, percent: 0.11 },
  { id: 'transport', total: 650_000, percent: 0.08 },
  { id: 'other', total: 0, percent: 0 },
];

const EXPENSES: Expense[] = [
  { id: 1, name: 'Starbucks Coffee', categoryId: 'food', amount: -163_980, date: '10/09/2024', time: '17:13', icon: 'cafe-outline' },
  { id: 2, name: 'Netflix', categoryId: 'fun', amount: -60_230, date: '09/09/2024', time: '12:00', icon: 'play-circle-outline' },
  { id: 3, name: 'Spotify Premium', categoryId: 'fun', amount: -29_900, date: '08/09/2024', time: '09:00', icon: 'musical-notes-outline' },
  { id: 4, name: 'Bữa trưa văn phòng', categoryId: 'food', amount: -85_000, date: '08/09/2024', time: '12:30', icon: 'restaurant-outline' },
  { id: 5, name: 'Shopee', categoryId: 'shopping', amount: -250_000, date: '07/09/2024', time: '20:45', icon: 'bag-handle-outline' },
  { id: 6, name: 'Grab', categoryId: 'transport', amount: -35_000, date: '07/09/2024', time: '08:10', icon: 'car-outline' },
  { id: 7, name: 'Pay H&M', categoryId: 'shopping', amount: -199_000, date: '06/09/2024', time: '14:22', icon: 'shirt-outline' },
  { id: 8, name: 'Điện EVN', categoryId: 'utility', amount: -320_000, date: '05/09/2024', time: '10:00', icon: 'flash-outline' },
];

const CHART: Record<Period, { labels: string[]; values: number[] }> = {
  week: {
    labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
    values: [163_980, 85_000, 250_000, 199_000, 320_000, 60_230, 35_000],
  },
  month: {
    labels: ['T1', 'T2', 'T3', 'T4'],
    values: [2_100_000, 3_450_000, 1_890_000, 885_110],
  },
  year: {
    labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
    values: [7_200_000, 8_100_000, 6_500_000, 9_300_000, 7_800_000, 8_500_000,
      10_200_000, 9_100_000, 8_325_110, 7_600_000, 8_900_000, 11_000_000],
  },
};

/** Toàn bộ danh mục, kể cả danh mục chưa phát sinh chi tiêu. */
export const listCategories = (): Category[] => [...CATEGORIES];

/** Chỉ danh mục đã phát sinh, sắp giảm dần — dùng cho biểu đồ Thống kê. */
export const spendingByCategory = (): Category[] =>
  CATEGORIES.filter(c => c.total > 0).sort((a, b) => b.total - a.total);

export const listExpenses = (filter?: { categoryId?: CategoryId }): Expense[] =>
  filter?.categoryId ? EXPENSES.filter(e => e.categoryId === filter.categoryId) : EXPENSES;

/** Giao dịch chi nhiều nhất, mặc định 3 khoản. */
export const topExpenses = (limit = 3): Expense[] =>
  [...EXPENSES].sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount)).slice(0, limit);

export const totalSpent = (): number =>
  EXPENSES.reduce((sum, e) => sum + Math.abs(e.amount), 0);

export const getChart = (period: Period) => CHART[period];
