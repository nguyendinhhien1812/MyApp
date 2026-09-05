// Chặn mạng thật trong test.
//
// Test chạm mạng là test chậm và hay hỏng vặt — hỏng vì API bên ngoài chứ không
// phải vì code sai. Ở đây fetch mặc định NỔ, test nào cần thì tự giả lập.
global.fetch = jest.fn(() => {
  throw new Error(
    'Test vừa gọi fetch thật. Hãy giả lập bằng jest.spyOn(global, "fetch") trong chính test đó.',
  );
});

// AsyncStorage: dùng bản giả chính thức thay vì bản native
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
