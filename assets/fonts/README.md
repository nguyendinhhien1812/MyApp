# Fonts — Be Vietnam Pro

Đặt 4 file `.ttf` sau vào đúng thư mục này (tên phải khớp chính xác — dùng làm `fontFamily` trong code, xem `src/theme/tokens.ts`):

- `BeVietnamPro-Regular.ttf`   (weight 400)
- `BeVietnamPro-Medium.ttf`    (weight 500)
- `BeVietnamPro-SemiBold.ttf`  (weight 600)
- `BeVietnamPro-Bold.ttf`      (weight 700)

Tải tại: https://fonts.google.com/specimen/Be+Vietnam+Pro

## Sau khi thêm file, chạy:

```bash
npx react-native-asset      # copy font vào iOS (Info.plist) + Android (res/font)
cd ios && pod install && cd ..
npm run ios                 # hoặc npm run android — build lại để nạp font
```

> Nếu tên PostScript bên trong file `.ttf` khác với tên file, `fontFamily` trên iOS
> có thể không khớp — khi đó báo lại để chỉnh `FONT` trong `src/theme/tokens.ts`.
