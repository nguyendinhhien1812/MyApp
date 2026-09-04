import { Translations } from '../../i18n/translations';
import { CategoryId } from '../../services/expenseService';

export type { CategoryId };

// Tên category chỉ tồn tại trong translations — dữ liệu chỉ giữ id.
export const getCatName = (id: CategoryId, t: Translations) => {
  const map: Record<CategoryId, string> = {
    food: t.expense.catFood,
    shopping: t.expense.catShopping,
    fun: t.expense.catFun,
    transport: t.expense.catTransport,
    utility: t.expense.catUtility,
    other: t.expense.catOther,
  };
  return map[id];
};

// Màu và icon là phần TRÌNH BÀY, không thuộc dữ liệu — để service trả về màu
// thì model ở bước tool calling sẽ nhận cả đống thông tin nó không cần.
export const CATEGORY_VISUALS: Record<
  CategoryId,
  { icon: string; iconBg: string; iconColor: string; barColor: string }
> = {
  food:      { icon: 'restaurant-outline',      iconBg: '#fff4e8', iconColor: '#b36a1a', barColor: '#E89951' },
  shopping:  { icon: 'bag-handle-outline',      iconBg: '#f5f0ff', iconColor: '#6c3fc4', barColor: '#6c3fc4' },
  fun:       { icon: 'game-controller-outline', iconBg: '#e8f0f8', iconColor: '#1a4a7a', barColor: '#1a4a7a' },
  transport: { icon: 'car-outline',             iconBg: '#e8f8f0', iconColor: '#1a7a40', barColor: '#1a7a40' },
  utility:   { icon: 'flash-outline',           iconBg: '#ffeaea', iconColor: '#c0392b', barColor: '#c0392b' },
  other:     { icon: 'ellipsis-horizontal',     iconBg: '#f0f0f0', iconColor: '#888888', barColor: '#888888' },
};
