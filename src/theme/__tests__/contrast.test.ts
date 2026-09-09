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
  // hint là placeholderTextColor (FormTextInput, Chatbot) — chữ gợi ý KHÔNG
  // được WCAG miễn trừ. muted là chữ phụ ở 73 chỗ (txMeta, txTime, status...).
  ['hint', 'bg'],
  ['hint', 'white'],
  ['muted', 'bg'],
  ['muted', 'white'],
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

// Viền của thành phần bấm được: WCAG 1.4.11 đòi 3:1 (không phải 4.5 — đây là
// ranh giới đồ hoạ, không phải chữ). borderStrong dùng ở 8 chỗ, đều là borderColor
// của chip/card/tab chưa chọn.
const VIEN_UI: Cap[] = [
  ['borderStrong', 'bg'],
  ['borderStrong', 'white'],
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

    it.each(VIEN_UI)('viền %s trên %s đạt 3:1 (WCAG 1.4.11)', (fg, bg) => {
      expect(tyLe(p[fg], p[bg])).toBeGreaterThanOrEqual(3);
    });
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
