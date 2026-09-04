import { MD3LightTheme, MD3DarkTheme, MD3Theme } from 'react-native-paper';

// ─── Design tokens: 2 palette Sáng / Tối ────────────────────────────────────
// Cam brand (primary, primaryBorder) GIỮ NGUYÊN ở cả 2 mode để app luôn nhận diện
// được. Chỉ nền/chữ/màu semantic đảo theo mode. (Xem CODING_GUIDE mục 2)
//
// Component KHÔNG import trực tiếp BRAND nữa — dùng useThemeColors() để lấy
// `colors` động, rồi makeStyles(colors). BRAND = LIGHT giữ lại cho tương thích ngược.

export type ThemeColors = {
  primary: string;
  primaryDark: string;   // text cam trên nền (đậm ở light, sáng ở dark)
  primaryLight: string;  // nền badge/icon cam nhạt
  primaryBorder: string;

  // ─── Design "Classical": accent vàng đồng + nền tối + trắng ngà ────────────
  accent: string;     // vàng đồng chính #b68235 (dot, progress, nhấn nhẹ)
  accent100: string;  // nền accent nhạt (bell/badge/ô icon)
  accent300: string;  // đồng SÁNG cho chữ/icon trên nền tối — cố định 2 mode
  accent700: string;  // accent đậm cho CHỮ/ICON trên nền sáng (đảo theo mode)
  heroCopper: string; // nền đồng ấm cho hero Home — cố định đậm ở cả 2 mode
  heroDark: string;   // nền tối cho header/hero mini-app (#1a1815)
  offWhite: string;   // trắng ngà #fdfcfb (chữ/nút trên nền tối)

  success: string;
  danger: string;
  /** Nền cho khối lỗi (bong bóng chat lỗi, banner). */
  dangerBg: string;
  info: string;
  purple: string;

  bg: string;
  white: string;   // nền card (đổi tên giữ nguyên để tương thích code cũ)
  text: string;
  subtext: string;
  hint: string;
  muted: string;
  border: string;
  divider: string;

  // ─── Thanh tab ────────────────────────────────────────────────────────────
  // Tách riêng vì thứ tự phân tầng đảo giữa 2 mode: nền sáng thì thanh phải
  // nổi bằng cách tối/trắng hơn nền, nền tối thì phải SÁNG hơn card mới nổi.
  tabBar: string;         // nền thanh
  tabBarActiveBg: string; // ô bo tròn sau mục đang chọn
  tabBarBorder: string;

  // Nút CTA đặc: nền sáng dùng khối tối, nền tối chuyển sang đồng đặc
  // (nút tối trên nền tối mất khối). Chữ trắng ngà đọc được trên cả hai.
  btnSolid: string;

  // Đường bao của thành phần bấm được (chip, tab chưa chọn). Đậm hơn `border`
  // vốn dành cho divider — hairline màu `border` chỉ 1.28:1 nên gần như vô hình.
  borderStrong: string;
};

export const LIGHT: ThemeColors = {
  primary:       '#E89951',
  primaryDark:   '#b36a1a',
  primaryLight:  '#fdf3e7',
  primaryBorder: '#f0c48a',

  accent:     '#A8732B', // chỉ cho mảng trang trí KHÔNG chứa chữ (progress, dot)
  accent100:  '#F3E8D5',
  accent300:  '#d8b783', // đồng sáng cho nền tối
  accent700:  '#855819', // đồng đậm cho CHỮ/ICON — đậm hơn #99661F để đạt AA trên #F3E8D5
  heroCopper: '#99661F', // nền hero, chữ trắng lên đây đạt 4.91:1
  heroDark:   '#1a1815',
  offWhite:   '#fdfcfb',

  success: '#1a7a40',
  danger:  '#c0392b',
  dangerBg: '#fdecea',
  info:    '#1a4a7a',
  purple:  '#6c3fc4',

  bg:      '#F8F6F2',
  white:   '#FFFFFF',
  text:    '#1A1815',
  subtext: '#736E66', // đậm hơn #888888 cũ: bản cũ chỉ 3.54:1 trên nền trắng
  hint:    '#9C968C',
  muted:   '#B3ADA3',
  border:  '#E8E3DB',
  divider: '#F0EDE7',

  tabBar:         '#FFFFFF',
  tabBarActiveBg: '#F3E8D5',
  tabBarBorder:   '#E8E3DB',
  btnSolid:       '#1a1815',
  borderStrong:   '#C4BAA9',
};

export const DARK: ThemeColors = {
  primary:       '#E89951', // giữ nguyên cam brand
  primaryDark:   '#f0b070', // sáng hơn để đọc được trên nền tối
  primaryLight:  '#2a2016', // cam trầm làm nền badge
  primaryBorder: '#4a3a22',

  // Vai trò tách đôi: accent là màu NỀN, accent700 là màu CHỮ.
  // Dùng #8C5F22 làm chữ trên card tối chỉ được 2.96:1 — không đọc được.
  accent:     '#8C5F22', // nền nút/chip đặc, chữ trắng lên đây đạt 5.43:1
  accent100:  '#34281A', // nền accent trầm
  accent300:  '#d8b783', // đồng sáng cho nền tối (giống light)
  accent700:  '#e0b877', // đồng sáng cho CHỮ/ICON trên nền tối — 8.86:1
  heroCopper: '#8C5F22',
  heroDark:   '#1a1815',
  offWhite:   '#fdfcfb',

  success: '#4ade80',
  danger:  '#f87171',
  dangerBg: '#2E1A18',
  info:    '#60a5fa',
  purple:  '#c9a6f5',

  bg:      '#121212',
  white:   '#1F1F1F', // nền card
  text:    '#f2f2f2',
  subtext: '#A6A6A6',
  hint:    '#7a7a7a',
  muted:   '#6a6a6a',
  border:  '#2A2A2A',
  divider: '#242424',

  // Nền tối thì thanh tab phải SÁNG hơn card #1F1F1F mới nổi lên được
  tabBar:         '#1F1F1F',
  tabBarActiveBg: '#34281A',
  tabBarBorder:   '#2A2A2A',
  btnSolid:       '#8C5F22', // chữ trắng lên đây đạt 5.43:1
  borderStrong:   '#575047',
};

// Tương thích ngược: code cũ import { BRAND } vẫn chạy (= palette sáng)
export const BRAND = LIGHT;

// ─── React Native Paper theme (MD3) theo brand, cho 2 mode ──────────────────
const makePaperTheme = (c: ThemeColors, base: MD3Theme): MD3Theme => ({
  ...base,
  colors: {
    ...base.colors,
    primary: c.primary,
    onPrimary: '#ffffff',
    primaryContainer: c.primaryLight,
    onPrimaryContainer: c.primaryDark,
    secondary: c.info,
    onSecondary: '#ffffff',
    error: c.danger,
    background: c.bg,
    surface: c.white,
    onSurface: c.text,
    surfaceVariant: c.primaryLight,
    onSurfaceVariant: c.subtext,
    outline: c.border,
    // Snackbar / Dialog nền
    inverseSurface: c.text,
    elevation: {
      ...base.colors.elevation,
      level3: c.white,
    },
  },
});

export const paperLightTheme = makePaperTheme(LIGHT, MD3LightTheme);
export const paperDarkTheme = makePaperTheme(DARK, MD3DarkTheme);

// Giữ export cũ để app.tsx không vỡ trước khi wire context
export const paperTheme = paperLightTheme;
