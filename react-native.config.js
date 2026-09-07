module.exports = {
  commands: require('@callstack/repack/commands/rspack'),
  // Font tuỳ biến (Be Vietnam Pro). Đặt file .ttf vào assets/fonts rồi chạy
  // `npx react-native-asset` để copy vào iOS/Android, sau đó build lại.
  assets: ['./assets/fonts'],
};
