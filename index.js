/**
 * @format
 */
import './gesture-handler.native';
import { AppRegistry, Platform } from 'react-native';
import { enableScreens } from 'react-native-screens';
import { ScriptManager, Script } from '@callstack/repack/client';
import { name as appName } from './app.json';
import { version as hostVersion } from './package.json';
import { ensureManifest, resolveScriptUrl } from './src/services/miniAppService';
import App from './src/app';

enableScreens(); // Enable screens for better performance

// Nạp registry trước khi có ai hỏi tới URL. Không await ở top-level được nên
// giữ promise lại, resolver sẽ chờ đúng promise đó.
const manifestReady = ensureManifest(hostVersion);

// priority 10 (mặc định là 2). BẮT BUỘC phải cao hơn:
// ResolverPlugin của Module Federation 2 tự đăng ký một resolver cho mỗi remote,
// dùng URL build-time trong rspack.config.mjs. Nó được đẩy vào enqueuedResolvers
// TRƯỚC khi ScriptManager khởi tạo, nên nếu cùng priority thì nó đứng trước và
// registry không bao giờ được hỏi tới — mini-app cứ tải từ localhost:9000.
ScriptManager.shared.addResolver(async (scriptId, caller) => {
  // Registry hỏng thì loadManifest đã tự nuốt lỗi và trả mảng rỗng — resolver
  // vẫn chạy tiếp với hành vi dev cũ thay vì làm chết cả app.
  await manifestReady;

  const url = resolveScriptUrl(scriptId, caller, Script.getDevServerURL(scriptId));
  if (!url) {
    return undefined;
  }

  return {
    url,
    // Chunk của mini-app tải qua mạng nên cache lại; chunk của host lấy từ dev
    // server thì không, để sửa code là thấy ngay.
    cache: caller !== 'main',
    query: {
      platform: Platform.OS,
    },
  };
}, { priority: 10 });

AppRegistry.registerComponent(appName, () => App);
