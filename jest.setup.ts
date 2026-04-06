jest.mock('react-native-screens', () => {
  const React = require('react');
  const {View} = require('react-native');

  const Mock = React.forwardRef(({children, ...props}, ref) =>
    React.createElement(View, {...props, ref}, children),
  );

  Mock.displayName = 'MockScreen';

  return {
    enableScreens: jest.fn(),
    enableFreeze: jest.fn(),
    screensEnabled: jest.fn(() => false),
    isSearchBarAvailableForCurrentPlatform: jest.fn(() => false),
    Screen: Mock,
    ScreenStack: Mock,
    ScreenStackItem: Mock,
    ScreenStackHeaderConfig: Mock,
    ScreenStackHeaderLeftView: Mock,
    ScreenStackHeaderRightView: Mock,
    ScreenStackHeaderCenterView: Mock,
    ScreenStackHeaderBackButtonImage: Mock,
    ScreenStackHeaderSearchBarView: Mock,
    SearchBar: Mock,
    ScreenFooter: Mock,
    FullWindowOverlay: Mock,
    compatibilityFlags: {},
  };
});
jest.mock('react-native-safe-area-context', () => {
  const mock = require('react-native-safe-area-context/jest/mock');
  return mock.default ?? mock;
});
jest.mock(
  '@react-native-async-storage/async-storage',
  () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper', () => ({}), {
  virtual: true,
});
