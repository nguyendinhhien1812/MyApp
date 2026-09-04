# MyApp — hướng dẫn cho Claude Code

App React Native 0.74.5 dạng portfolio: trang chủ hồ sơ + các mini-app tài chính
(Ngân hàng, Đầu tư, Chi tiêu, Trợ lý AI). Bundler là **Re.Pack (rspack)**, không phải Metro.

**Quy ước chi tiết nằm ở [CODING_GUIDE.md](CODING_GUIDE.md)** — đọc trước khi thêm màn mới.
Đặc biệt: chương 2 (design tokens), 4 (SubHeader / dark mode), 7 (i18n), 10 (xử lý lỗi).

## Miễn trừ so với skill `my-coding-style`

Skill phong cách cá nhân có 2 quy ước **không áp** cho dự án này:

1. **Cấu trúc thư mục** — skill nói tổ chức theo loại file. Dự án này tổ chức **theo feature**:
   `src/container/<TênMàn>/index.tsx` (18 thư mục màn), kèm `components/` và `screen/` chứa
   sub-screen nội bộ của mini-app.
   Đây là chuẩn RN của dự án, đã ghi trong CODING_GUIDE chương 1 — **không tái cấu trúc**.
2. **Component = `function` declaration** — skill nói vậy, nhưng cả 45 file trong dự án dùng
   `const X = () => {}`. **Giữ arrow function** cho nhất quán, kể cả file mới.

Các quy ước còn lại của skill (TypeScript thực dụng, comment tiếng Việt, xử lý lỗi,
logger có prefix, test chọn lọc) **áp bình thường**.

## Logger của dự án

`src/utils/logger.ts` — chỉ in khi `__DEV__`, nên không cần `transform-remove-console`.

```ts
import { logger } from '../../utils/logger';

logger.warn('theme', 'không lưu được theme, chỉ áp dụng cho phiên này', err);
logger.error('invest', 'không tải được tỷ giá', err);
```

Scope đang dùng — **dùng lại thay vì tạo mới nếu phù hợp**:
`theme` · `about` · `webview` · `chatbot` · `invest` · `miniapp`

## Bắt buộc khi viết UI

- **Màu**: lấy qua `useThemeColors()`; bo góc/chữ/spacing lấy từ `src/theme/tokens.ts`.
  Không hardcode hex — trừ màu semantic cố định (xanh lãi, đỏ lỗ) và màu pastel của data tĩnh.
- **Chuỗi**: mọi text qua `t.xxx.key` (`useLanguage()`), thêm key vào **cả `vi` và `en`** trong
  `src/i18n/translations.ts`. Tên riêng (vd `Nguyễn Đình Hiến`) tách thành hằng số, không dịch.
  Mảng dữ liệu cần dịch phải build **trong** component để lấy được `t`.
- **Header màn con**: dùng `<SubHeader>`, không tự dựng header.
- **Kiểm tra trước khi xong**: đổi sang EN → text đổi hết; bật chế độ Tối → không khối nào
  bị "tàng hình" (nền tối trên nền tối).

## Mini-app (Module Federation)

Host nạp mini-app từ bundle tải lúc chạy. Tên `loyalty` phải trùng ở **ba** chỗ:
`remotes` trong `rspack.config.mjs`, `name`/`filename` trong
`miniapps/loyalty/rspack.config.mjs`, và `id` trong registry.

Bắt buộc dùng **`ModuleFederationPluginV2`** (cần `@module-federation/enhanced`), kèm
`dts: false` và `dev: false`. Lý do:

- **V1 hỏng**: module tham chiếu remote chạy trong `__webpack_require__.I` lúc khởi động,
  tức TRƯỚC khi `ScriptManager` khởi tạo → `Cannot read property 'addResolver' of undefined`.
- **`dev: true` hỏng**: MF2 bật plugin gợi ý type qua WebSocket, React Native không có
  → `Cannot read property 'prototype' of undefined`.

**Resolver trong `index.js` phải đăng ký với `priority: 10`** (mặc định là 2). MF2 tự đăng
ký một resolver cho mỗi remote, dùng URL build-time trong `rspack.config.mjs`, và nó được
đẩy vào `enqueuedResolvers` TRƯỚC khi `ScriptManager` khởi tạo. Cùng priority thì nó đứng
trước, registry không bao giờ được hỏi, mini-app cứ tải từ `localhost:9000` — lỗi im lặng,
chỉ lộ ra khi tắt server local.

Chạy thử local: `npm run miniapp:build` rồi `npm run miniapp:serve` (cổng 9000).
Phát hành thật: `./miniapps/release.sh loyalty <x.y.z>` (build → assets → deploy Worker).

Bundle production nằm ở `server/assets/bundles/` và **đi kèm bản deploy Worker** — deploy
khi thư mục rỗng là gỡ sạch mini-app đang chạy. Vì thế thư mục đó được commit.

## Chọn provider AI

`server/` tự chọn theo secret: `ANTHROPIC_API_KEY` → Claude, `GEMINI_API_KEY` → Gemini,
có cả hai thì Claude thắng. App **không biết** đang dùng cái nào — nó chỉ nói hình dạng
message của Anthropic, Worker lo việc dịch (`server/src/providers/`).

Thêm provider mới = thêm một file trong `providers/` với ba hàm
`isConfigured` / `complete` / `streamText`, rồi đưa vào mảng `PROVIDERS`.

## Chạy app

Dev server cố định **port 8088** (tránh trùng 8081 với project `mwg-work` — trùng port làm
app tải nhầm bundle và lỗi reanimated Worklets). Port đã bake vào `ios/Podfile`
(`RCT_METRO_PORT=8088`) nên `npm run ios` tự dùng đúng.

```bash
npm start          # Re.Pack dev server trên 8088
npm run ios
```

## Lỗi TypeScript có sẵn (không phải do bạn gây ra)

`src/components/Picker/index.tsx` (import module không tồn tại) và
`src/navigation/BankNavigator.tsx:18` (typing StackScreenProps) — đã lỗi từ trước, bỏ qua khi
đọc output `tsc`.
