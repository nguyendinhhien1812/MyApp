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

## Thêm dependency có phần native → PHẢI chạy lại `pod install`

Dự án dùng **pnpm**, mà pnpm đặt gói trong `node_modules/.pnpm/<tên>@<phiên bản>_<băm>/`.
Phần băm đó tính theo **toàn bộ cây phụ thuộc**, nên thêm một gói không liên quan cũng làm
đường dẫn của gói khác đổi.

Hậu quả: Pods vẫn trỏ đường dẫn cũ và build iOS chết với

```
Build input files cannot be found: .../@callstack+repack@..._<băm cũ>/ios/CodeSigningUtils.swift
```

Đã xảy ra thật: thêm `@module-federation/enhanced` làm đổi đường dẫn của `@callstack/repack`.

```bash
cd ios && LANG=en_US.UTF-8 pod install
```

`LANG` là bắt buộc — CocoaPods chết câm với `Encoding::CompatibilityError` khi shell dùng
ASCII.

**Lỗi này ẩn rất lâu**: nạp lại JS vẫn chạy bình thường trên bản `.app` đã build từ trước,
nên chỉ lộ ra ở lần build native tiếp theo — có thể là nhiều ngày sau.

## Build Android — bốn cái bẫy đã gỡ

Thư mục `android/` ban đầu là **template RN 0.75 nằm trên bản cài RN 0.74.5**, cộng thêm
pnpm không dựng cây phẳng. Bốn lỗi nối đuôi nhau, mỗi lỗi che lỗi sau:

1. **Gradle quá mới** — wrapper để `8.14.1`, RN 0.74.5 cần `8.6`. Triệu chứng:
   `Unresolved reference: serviceOf` khi biên dịch `react-native-gradle-plugin`.
2. **`settings.gradle` gọi API của 0.75** — `extensions.configure(com.facebook.react.ReactSettingsExtension)`.
   Ở 0.74, `com.facebook.react.settings` là **plugin rỗng**, không đăng ký extension nào.
   Triệu chứng lạc đề hoàn toàn: `Could not get unknown property 'com'`.
3. **`app/build.gradle` gọi API của 0.75** — `react { autolinkLibrariesWithApp() }`.
   RN 0.74 liên kết native bằng `applyNativeModulesAppBuildGradle(project)`. **Đừng lẫn hai cách.**
4. **`@react-native/codegen` không tìm thấy, rồi tìm thấy nhưng vỡ** — nó là phụ thuộc
   gián tiếp nên không có ở `node_modules/@react-native/codegen`; và bản thân nó **dùng
   `yargs` mà quên khai báo**, nên với pnpm nó vớ phải `yargs@16.2.2` — bản chưa có `parseSync`.

Hai chỗ vá cho pnpm, đều **suy ra đường dẫn thay vì viết cứng** để không vỡ khi cài lại:

- `settings.gradle` dò `@react-native/gradle-plugin` (phẳng trước, rồi quét `.pnpm`).
- `app/build.gradle` đặt `codegenDir` bằng cách đi từ chính `react-native`:
  `getCanonicalFile()` xuyên qua symlink của pnpm về `.pnpm/react-native@<ver>/node_modules`,
  nơi codegen nằm cạnh nó — nên **luôn khớp phiên bản** (store đang có cả 0.74.87 lẫn 0.75.3).

Phần `yargs` thiếu khai báo vá bằng `pnpm.packageExtensions` trong `package.json`. Không
dùng `overrides` toàn cục vì `yargs@15` có người thật sự cần (`cli-platform-android@10.x`,
`logkitty`).

Build cần `ANDROID_HOME` (chưa có `android/local.properties`):

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
cd android && ./gradlew :app:assembleDebug
```

## Cổng chất lượng

```bash
pnpm run tools:check   # khai báo tool ở app và Worker có khớp không
pnpm exec tsc --noEmit
pnpm run lint
pnpm test
```

Cả bốn phải **sạch**. Không còn lỗi "có sẵn" nào để bỏ qua — `src/components/Picker` (code
chết từ dự án khác) đã xoá, `BankNavigator` đã khai `BankStackParamList`.

CI (`.github/workflows/ci.yml`) chạy đúng bốn lệnh này cộng `node --check` và
`wrangler deploy --dry-run` cho `server/`.

`eslint` **không** áp cho `server/`, `miniapps/`, `tools/` (xem `.eslintignore`) — chúng chạy
runtime khác, có cổng riêng.

### Khi viết test

Test nằm ở `src/**/__tests__/*.test.ts`. `jest.setup.js` làm `fetch` **nổ** theo mặc định —
test cần mạng thì tự giả lập bằng `jest.spyOn`. Test chạm mạng thật là test hay hỏng vặt vì
lý do ngoài code.

Ưu tiên kiểm **bất biến** hơn giá trị cụ thể: `expect(getBalance()).toBe(12500000)` sẽ đỏ khi
đổi dữ liệu demo, còn "hai nhóm lọc cộng lại bằng tổng" thì luôn đúng.
