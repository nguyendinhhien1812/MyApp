// Build mini-app "Tích điểm" thành một remote Module Federation.
//
// Tên container là 'loyalty' — trùng id trong registry và trùng tên remote host
// khai báo. Ba chỗ này lệch nhau là resolver tra không ra URL.
//
// context trỏ về GỐC repo để rspack dùng chung node_modules với host — không tạo
// bản react-native thứ hai. Dự án từng dính lỗi trùng peer gây trắng màn hình.

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as Repack from '@callstack/repack';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

export default Repack.defineRspackConfig({
  context: ROOT,
  entry: {},
  resolve: {
    ...Repack.getResolveOptions(),
  },
  output: {
    path: path.join(__dirname, 'build'),
    uniqueName: 'loyalty',
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
    new Repack.plugins.ModuleFederationPluginV2({
      name: 'loyalty',
      // Tắt sinh type qua mạng của MF2: 'dev' bật plugin gợi ý type chạy bằng
      // WebSocket, mà React Native không có API đó — nó ném
      // "Cannot read property 'prototype' of undefined" ngay lúc khởi động.
      dts: false,
      dev: false,
      filename: 'loyalty.container.bundle',
      exposes: {
        './App': path.join(__dirname, 'src/LoyaltyScreen.tsx'),
      },
      shared: {
        // eager: false — host đã nạp sẵn, mini-app chỉ dùng lại bản đó.
        // Đặt eager: true ở đây là nhúng React lần hai vào bundle remote.
        react: { singleton: true, eager: false, requiredVersion: '18.2.0' },
        'react-native': { singleton: true, eager: false, requiredVersion: '0.74.5' },
      },
    }),
  ],
});
