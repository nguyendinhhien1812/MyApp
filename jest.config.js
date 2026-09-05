module.exports = {
  preset: 'react-native',

  // Mặc định Jest bỏ qua toàn bộ node_modules khi transform, mà React Native
  // phát hành code chưa biên dịch (Flow/JSX). Với pnpm thì đường dẫn còn lồng
  // thêm một tầng `.pnpm/<gói>@<phiên bản>/node_modules/...`, nên pattern mặc
  // định của preset không khớp và Jest chết ngay ở js-polyfills.
  transformIgnorePatterns: [
    'node_modules/(?!.*(react-native|@react-native|@callstack|@rneui|iconoir-react-native|@react-navigation))',
  ],

  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Chỉ chạy test của mình, không quét vào node_modules
  testMatch: ['<rootDir>/src/**/__tests__/**/*.test.ts?(x)'],
};
