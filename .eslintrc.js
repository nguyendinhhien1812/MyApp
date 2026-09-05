module.exports = {
  root: true,
  extends: '@react-native',
  overrides: [
    {
      // File test và setup chạy trong Jest, không phải trong app
      files: ['**/__tests__/**/*.{ts,tsx}', 'jest.setup.js'],
      env: { jest: true },
    },
  ],
};
