// ─── Design tokens "Classical" (không phụ thuộc sáng/tối) ────────────────────
// Bổ sung cho hệ màu ở paperTheme.ts. Màu accent/nền tối/… là token theo mode,
// nằm trong ThemeColors. Còn bo góc / thang chữ / khoảng cách / font là cố định
// nên tách riêng ở đây để mọi màn dùng chung khi áp redesign.

// Bo góc 3 bậc chuẩn + pill/avatar
export const RADII = {
  card: 22, // card lớn (hero, stat, list item lớn)
  item: 16, // nút / item nhỏ
  chip: 10, // chip nhỏ
  pill: 100, // pill / avatar
} as const;

// Thang chữ 5 bậc
export const TYPE = {
  display: 24, // số liệu lớn
  title: 18, // tiêu đề section
  itemTitle: 15, // tiêu đề item
  body: 13, // nội dung
  caption: 11, // caption / nhãn viết hoa
} as const;

// Khoảng cách (--space-1..6 = 4/8/12/16/20/24) + padding ngoài mỗi màn
export const SPACING = {
  s1: 4,
  s2: 8,
  s3: 12,
  s4: 16,
  s5: 20,
  s6: 24,
  screenX: 24, // padding ngang cố định mỗi màn
} as const;

// Font Be Vietnam Pro (400/500/600/700).
// Tên family = tên file .ttf (không đuôi) sau khi link bằng `npx react-native-asset`.
// Đặt các file vào assets/fonts: BeVietnamPro-{Regular,Medium,SemiBold,Bold}.ttf
export const FONT = {
  regular: 'BeVietnamPro-Regular',
  medium: 'BeVietnamPro-Medium',
  semibold: 'BeVietnamPro-SemiBold',
  bold: 'BeVietnamPro-Bold',
} as const;
