// Định dạng tiền dùng chung. Trước đây `money` bị chép ở 8 màn với HAI hành vi
// khác nhau (có/không Math.abs) và `shortMoney` ở 2 màn với hai mức đơn vị khác
// nhau — nên tách tên rõ ràng thay vì gộp thành một hàm mơ hồ.

const VND = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

/** Giữ nguyên dấu: số âm hiện dấu trừ. */
export const money = (n: number): string => VND.format(n);

/**
 * Chỉ lấy độ lớn. Dùng ở nơi giao diện TỰ thêm dấu (+/−) — nếu dùng `money`
 * thì số âm sẽ ra hai dấu trừ liền nhau.
 */
export const moneyAbs = (n: number): string => VND.format(Math.abs(n));

/**
 * Rút gọn theo đơn vị Việt: k / tr / tỷ.
 * `trim` bỏ số 0 thừa sau dấu phẩy — 1.000.000 ra "1tr" thay vì "1.0tr".
 */
export const shortMoney = (n: number, opts?: { trim?: boolean }): string => {
  const fmt = (v: number, unit: string) => {
    const s = v.toFixed(1);
    return `${opts?.trim ? s.replace(/\.0$/, '') : s}${unit}`;
  };
  if (n >= 1_000_000_000) { return fmt(n / 1_000_000_000, 'tỷ'); }
  if (n >= 1_000_000) { return fmt(n / 1_000_000, 'tr'); }
  return `${(n / 1_000).toFixed(0)}k`;
};
