import { MD3LightTheme, MD3Theme } from 'react-native-paper';

// ─── Brand tokens ────────────────────────────────────────────────────────────
// Nguồn duy nhất cho màu brand — các UI component import từ đây,
// không hardcode lại trong từng file. (Xem CODING_GUIDE mục 2)
export const BRAND = {
  primary:       '#E89951', // Cam chủ đạo
  primaryDark:   '#b36a1a', // Cam đậm (text trên nền sáng)
  primaryLight:  '#fdf3e7', // Cam nhạt (nền badge, icon bg)
  primaryBorder: '#f0c48a', // Cam viền

  success: '#1a7a40',
  danger:  '#c0392b',
  info:    '#1a4a7a',
  purple:  '#6c3fc4',

  bg:      '#F2F2F7',
  white:   '#fff',
  text:    '#1a1a1a',
  subtext: '#888',
  hint:    '#aaa',
  muted:   '#bbb',
  border:  '#e8e8e8',
  divider: '#F0F0F0',
} as const;

// ─── React Native Paper theme (MD3) theo brand ──────────────────────────────
export const paperTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: BRAND.primary,
    onPrimary: BRAND.white,
    primaryContainer: BRAND.primaryLight,
    onPrimaryContainer: BRAND.primaryDark,
    secondary: BRAND.info,
    onSecondary: BRAND.white,
    error: BRAND.danger,
    background: BRAND.bg,
    surface: BRAND.white,
    onSurface: BRAND.text,
    surfaceVariant: BRAND.primaryLight,
    onSurfaceVariant: BRAND.subtext,
    outline: BRAND.border,
  },
};
