import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as Repack from '@callstack/repack';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Rspack configuration enhanced with Re.Pack defaults for React Native.
 *
 * Learn about Rspack configuration: https://rspack.dev/config/
 * Learn about Re.Pack configuration: https://re-pack.dev/docs/guides/configuration
 */

export default Repack.defineRspackConfig({
  context: __dirname,
  entry: './index.js',
  resolve: {
    ...Repack.getResolveOptions(),
  },
  module: {
    rules: [
      {
        test: /\.[cm]?[jt]sx?$/,
        type: 'javascript/auto',
        use: {
          loader: '@callstack/repack/babel-swc-loader',
          parallel: true,
          options: {},
        },
      },
      ...Repack.getAssetTransformRules(),
    ],
  },
  plugins: [
    new Repack.RepackPlugin(),
    // V2 (Module Federation 2). KHÔNG dùng V1: ở V1, module tham chiếu remote
    // chạy ngay trong __webpack_require__.I lúc khởi động, tức là TRƯỚC khi
    // ScriptManager kịp khởi tạo — nó đọc scriptManager undefined rồi ném lỗi
    // "Cannot read property 'addResolver' of undefined".
    new Repack.plugins.ModuleFederationPluginV2({
      name: 'host',
      // Tắt sinh type qua mạng của MF2: 'dev' bật plugin gợi ý type chạy bằng
      // WebSocket, mà React Native không có API đó — nó ném
      // "Cannot read property 'prototype' of undefined" ngay lúc khởi động.
      dts: false,
      dev: false,
      remotes: {
        // Tên remote PHẢI trùng id mini-app trong registry — resolver ở
        // miniAppService tra bằng scriptId, mà scriptId chính là tên này.
        // URL dưới đây chỉ là mặc định lúc build; lúc chạy ScriptManager
        // thay bằng URL registry trả về.
        loyalty: 'loyalty@http://localhost:9000/loyalty.container.bundle',
      },
      shared: {
        react: {
          singleton: true,
          eager: true,
          requiredVersion: '18.2.0',
        },
        'react-native': {
          singleton: true,
          eager: true,
          requiredVersion: '0.74.5',
        },
      },
    }),
  ],
});
