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
