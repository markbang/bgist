module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^react-native-webview$': '<rootDir>/__mocks__/react-native-webview.tsx',
  },
  modulePathIgnorePatterns: ['<rootDir>/.omx/'],
  testPathIgnorePatterns: ['<rootDir>/.omx/'],
  watchPathIgnorePatterns: ['<rootDir>/.omx/'],
  openHandlesTimeout: 0,
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-safe-area-context)/)',
  ],
};
