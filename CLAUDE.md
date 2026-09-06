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

## Build Android — mười hai cái bẫy đã gỡ

Thư mục `android/` **chưa từng build được** trước ngày 2026-09-06: nó là **template RN 0.75+
nằm trên bản cài RN 0.74.5**, cộng thêm pnpm không dựng cây phẳng. Mười hai lỗi nối đuôi nhau,
mỗi lỗi che lỗi sau — sửa xong một cái mới thấy cái kế tiếp.

**Nguyên tắc chung: mọi thứ phải bám RN 0.74.5, đừng tin giá trị sẵn có trong `android/`.**

### Sai template

| Chỗ | Giá trị sai (RN 0.75+) | Đúng cho 0.74.5 | Triệu chứng |
|---|---|---|---|
| `gradle-wrapper.properties` | `gradle-8.14.1-bin` | `gradle-8.6-all` | `Unresolved reference: serviceOf` |
| `settings.gradle` | `ReactSettingsExtension` | `applyNativeModulesSettingsGradle` | `Could not get unknown property 'com'` |
| `app/build.gradle` | `react { autolinkLibrariesWithApp() }` | `applyNativeModulesAppBuildGradle` | `Could not find method autolinkLibrariesWithApp()` |
| `build.gradle` | `kotlinVersion = 2.1.20` | `1.9.22` | 107 lỗi `incompatible version of Kotlin` |
| `build.gradle` | `ndkVersion = 27.1.x` | `26.1.10909125` | 12 lỗi C++ do `-Werror` |
| `MainApplication.kt` | `loadReactNative(this)` | `SoLoader.init` + `load()` | `Unresolved reference: ReactNativeApplicationEntryPoint` |

`kotlinVersion` quan trọng vì **năm thư viện** (repack, gesture-handler, safe-area-context,
screens, webview) đọc `rootProject.ext.kotlinVersion` để kéo `kotlin-stdlib`. Compiler thật
thì do `@react-native/gradle-plugin` ghim (`libs.versions.toml`: `kotlin = 1.9.22`).

NDK 27 mang Clang mới hơn, sinh `-Wdeprecated-this-capture` và `-Wvla-cxx-extension`; mã C++
của reanimated biên dịch với `-Werror` nên warning hoá lỗi cứng.

### Kiến trúc mới phải TẮT

`newArchEnabled=false` trong `android/gradle.properties`. iOS không đặt `RCT_NEW_ARCH_ENABLED`
nên chạy kiến trúc cũ; để Android bật là hai nền tảng lệch nhau, và mã Fabric của
`react-native-screens` / `react-native-svg` không khớp API RN 0.74 → hàng loạt lỗi
`only virtual member functions can be marked 'override'` cùng `OnLoad.cpp` gọi
`rncli_cxxModuleProvider` không tồn tại.

### Cổng dev server (bẫy im lặng nhất)

`reactNativeDevServerPort=8088` trong `android/gradle.properties`. iOS ghim 8088 qua
`RCT_METRO_PORT` trong Podfile, **Android có đường riêng** — thiếu nó thì app cứ gọi 8081,
`adb reverse` trỏ 8088 vô ích, và màn đỏ chỉ nói "404" chứ không nói sai cổng.

### Hai thư viện phải GHIM CỨNG, không dùng caret

| Gói | Bản | Vì sao không lên cao hơn |
|---|---|---|
| `react-native-reanimated` | `3.9.0` | 3.7.x/3.8.x còn override `replaceExistingNonRootView` — RN 0.74 đã bỏ khỏi `UIManagerModule`. 3.9.0 là bản đầu tiên bỏ. |
| `react-native-svg` | `15.12.1` | 15.13.0 chuyển sang `processTransform` 6 tham số và `MatrixDecompositionContext` công khai — chỉ có ở RN mới. 15.12.1 là bản cuối còn hợp, vẫn thoả peer `^15.12.0` của iconoir. |

Caret sẽ trôi ngược lên bản đòi RN mới hơn. Dự án khoá RN 0.74.5 nên hai gói này ghim exact.

### pnpm: hai đường dẫn phải SUY RA, không viết cứng

- `settings.gradle` dò `@react-native/gradle-plugin` (thử phẳng trước, rồi quét `.pnpm`).
- `app/build.gradle` đặt `codegenDir` bằng cách đi từ chính `react-native`:
  `getCanonicalFile()` xuyên symlink của pnpm về `.pnpm/react-native@<ver>/node_modules`,
  nơi codegen nằm cạnh nó — nên **luôn khớp phiên bản** (store có cả 0.74.87 lẫn 0.75.3).

Ngoài ra `@react-native/codegen` **dùng `yargs` mà quên khai báo**; npm/yarn cho nó ăn ké cây
phẳng, pnpm thì không nên nó vớ phải `yargs@16.2.2` (chưa có `parseSync`). Vá bằng
`pnpm.packageExtensions` trong `package.json` — **không** dùng `overrides` toàn cục vì
`yargs@15` có người thật sự cần (`cli-platform-android@10.x`, `logkitty`).

### Chạy

Cần `ANDROID_HOME` (dự án không commit `android/local.properties`):

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
cd android && ./gradlew :app:assembleDebug
```

Trên máy ảo Android 15+ sẽ có hộp thoại "This app isn't 16 KB compatible" — chỉ là cảnh báo,
app vẫn chạy ở chế độ tương thích. Các `.so` dựng sẵn của RN 0.74 chưa canh 16 KB.

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
