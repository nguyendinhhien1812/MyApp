# Mini-app: Tích điểm

Remote Module Federation, build và deploy **độc lập** với app host.

## Vì sao không có package.json riêng

`context` trong `rspack.config.mjs` trỏ về gốc repo nên rspack dùng chung
`node_modules` với host. Tạo package riêng có dependency `react-native` sẽ sinh
bản thứ hai — dự án từng dính đúng lỗi đó, biểu hiện là trắng màn hình.

## Build

```bash
npm run miniapp:build
```

Kết quả nằm ở `miniapps/loyalty/build/`, file container là `loyalty.container.bundle`.

## Chạy local

```bash
npm run miniapp:serve
```

Phục vụ tĩnh trên cổng 9000 — đúng cổng host đang trỏ tới khi chưa cấu hình registry.

Tên `loyalty` xuất hiện ở **ba** chỗ và phải trùng nhau, lệch một chỗ là resolver
tra không ra URL:

| Chỗ | Giá trị |
|---|---|
| `miniapps/loyalty/rspack.config.mjs` | `name` / `filename` / `uniqueName` |
| `rspack.config.mjs` (host) | khoá trong `remotes` |
| registry | `id` của mini-app |

## Phát hành

```bash
./miniapps/release.sh loyalty 1.1.0
```

Build → chép `.bundle` vào `server/assets/` → deploy Worker → in sẵn `container` /
`chunkBase` để dán vào `/admin`. Thêm `--local` để dừng trước bước deploy.

`server/assets/` đi kèm bản deploy nên **phải commit** — deploy khi nó rỗng là gỡ sạch mọi
mini-app đang chạy.

Script gọi thẳng `server/node_modules/.bin/wrangler`, **không** dùng `npx wrangler` từ gốc
repo — ở gốc không có wrangler nên npx sẽ tải bản v4, mà v4 đòi Node 22.

## Đăng lên registry bằng tay

Upload thư mục `build/` lên CDN rồi cập nhật registry:

```bash
curl -X PUT https://<worker>/registry/admin -H "Authorization: Bearer $ADMIN_TOKEN" -H 'Content-Type: application/json' -d @registry.json
```

Cấu trúc một phiên bản trong registry:

| Trường | Ý nghĩa |
|---|---|
| `version` | semver, so sánh theo số chứ không theo chuỗi |
| `container` | URL đầy đủ tới `loyalty.container.bundle` |
| `chunkBase` | thư mục gốc để resolve các chunk con |
| `minHost` / `maxHost` | khoảng phiên bản host dùng được; `maxHost` là ngưỡng loại trừ |
| `rollout` | phần trăm thiết bị nhận bản này, chia tất định theo deviceId |
| `status` | `active` / `paused` |
| `sha256` | **chưa được kiểm** — xem phần An toàn ở README gốc của server |
