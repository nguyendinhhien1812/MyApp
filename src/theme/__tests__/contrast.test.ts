import { LIGHT, DARK, ThemeColors } from '../paperTheme';

// CLAUDE.md bắt kiểm bằng mắt: "bật chế độ Tối → không khối nào bị tàng hình".
// File này làm việc đó bằng số, cho cả hai palette, để không phụ thuộc vào việc
// người review có nhớ mở dark mode hay không.
//
// Công thức tỉ lệ tương phản: WCAG 2.1, mục 1.4.3.

const kenh = (v: number) => {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

// Cắt chuỗi thay vì dịch bit: tránh no-bitwise, và đọc ra ngay là R/G/B.
const doSang = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return 0.2126 * kenh(r) + 0.7152 * kenh(g) + 0.0722 * kenh(b);
};

const tyLe = (fg: string, bg: string) => {
  const a = doSang(fg);
  const b = doSang(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
};

type Cap = [keyof ThemeColors, keyof ThemeColors];

// Chữ thường: WCAG AA đòi 4.5:1
const CHU_THUONG: Cap[] = [
  ['text', 'bg'],
  ['text', 'white'],
  ['text', 'tabBar'],
  ['text', 'tabBarActiveBg'],
  ['subtext', 'bg'],
  ['subtext', 'white'],
  ['accent700', 'white'],
  ['accent700', 'bg'],
  ['accent700', 'accent100'],
  ['offWhite', 'heroCopper'],
  ['offWhite', 'btnSolid'],
  ['offWhite', 'heroDark'],
  ['danger', 'dangerBg'],
  ['danger', 'white'],
  ['success', 'white'],
];

// Chữ to/đậm: AA cho phép 3:1
const CHU_TO: Cap[] = [
  ['primaryDark', 'white'],
  ['primaryDark', 'primaryLight'],
];

// NỢ ĐÃ BIẾT — chưa đạt chuẩn, ghi lại kèm số đo để nó không âm thầm tệ thêm.
// Đây KHÔNG phải danh sách miễn trừ vĩnh viễn: sửa được thì chuyển lên trên.
//   hint/muted  : dùng cho chữ mờ và trạng thái vô hiệu.
//   borderStrong: WCAG 1.4.11 đòi 3:1 cho viền thành phần bấm được.
const NO_DA_BIET: { cap: Cap; light: number; dark: number }[] = [
  { cap: ['hint', 'white'], light: 2.94, dark: 3.84 },
  { cap: ['muted', 'white'], light: 2.23, dark: 3.05 },
  { cap: ['borderStrong', 'white'], light: 1.92, dark: 2.08 },
  { cap: ['borderStrong', 'bg'], light: 1.78, dark: 2.36 },
];

const PALETTE: [string, ThemeColors][] = [
  ['LIGHT', LIGHT],
  ['DARK', DARK],
];

describe('tương phản màu', () => {
  describe.each(PALETTE)('%s', (_ten, p) => {
    it.each(CHU_THUONG)('%s trên %s đạt AA (4.5:1)', (fg, bg) => {
      expect(tyLe(p[fg], p[bg])).toBeGreaterThanOrEqual(4.5);
    });

    it.each(CHU_TO)('%s trên %s đạt AA chữ to (3:1)', (fg, bg) => {
      expect(tyLe(p[fg], p[bg])).toBeGreaterThanOrEqual(3);
    });
  });

  // Chốt chặn nợ: cho phép giữ nguyên, cấm tụt thêm.
  it.each(NO_DA_BIET)('nợ $cap không tệ thêm', ({ cap: [fg, bg], light, dark }) => {
    expect(tyLe(LIGHT[fg], LIGHT[bg])).toBeGreaterThanOrEqual(light - 0.01);
    expect(tyLe(DARK[fg], DARK[bg])).toBeGreaterThanOrEqual(dark - 0.01);
  });

  it('mọi màu trong palette là hex 6 ký tự (công thức trên giả định vậy)', () => {
    const sai: string[] = [];
    for (const [ten, p] of PALETTE) {
      for (const [k, v] of Object.entries(p)) {
        if (!/^#[0-9a-fA-F]{6}$/.test(v)) {
          sai.push(`${ten}.${k} = ${v}`);
        }
      }
    }
    expect(sai).toEqual([]);
  });
});
