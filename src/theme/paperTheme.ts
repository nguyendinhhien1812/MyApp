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
};

export const LIGHT: ThemeColors = {
  primary:       '#E89951',
  primaryDark:   '#b36a1a',
  primaryLight:  '#fdf3e7',
  primaryBorder: '#f0c48a',

  accent:     '#b68235',
  accent100:  '#f4ebdb',
  accent300:  '#d8b783', // đồng sáng cho nền tối
  accent700:  '#8a5e1c', // đồng ấm cho chữ/icon trên nền sáng
  heroCopper: '#8a5e1c', // nền hero đồng ấm
  heroDark:   '#1a1815',
  offWhite:   '#fdfcfb',

  success: '#1a7a40',
  danger:  '#c0392b',
  info:    '#1a4a7a',
  purple:  '#6c3fc4',

  bg:      '#F2F2F7',
  white:   '#ffffff',
  text:    '#1a1a1a',
  subtext: '#888888',
  hint:    '#aaaaaa',
  muted:   '#bbbbbb',
  border:  '#e8e8e8',
  divider: '#F0F0F0',
};

export const DARK: ThemeColors = {
  primary:       '#E89951', // giữ nguyên cam brand
  primaryDark:   '#f0b070', // sáng hơn để đọc được trên nền tối
  primaryLight:  '#2a2016', // cam trầm làm nền badge
  primaryBorder: '#4a3a22',

  accent:     '#c99a54', // vàng đồng sáng hơn cho nền tối
  accent100:  '#2a2016', // nền accent trầm
  accent300:  '#d8b783', // đồng sáng cho nền tối (giống light)
  accent700:  '#e0b877', // accent sáng để đọc chữ/icon trên nền tối
  heroCopper: '#8a5e1c', // nền hero giữ đồng ấm đậm ở cả 2 mode
  heroDark:   '#1a1815',
  offWhite:   '#fdfcfb',

  success: '#4ade80',
  danger:  '#f87171',
  info:    '#60a5fa',
  purple:  '#c9a6f5',

  bg:      '#121212',
  white:   '#1e1e1e', // nền card
  text:    '#f2f2f2',
  subtext: '#9a9a9a',
  hint:    '#7a7a7a',
  muted:   '#6a6a6a',
  border:  '#2c2c2c',
  divider: '#262626',
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
