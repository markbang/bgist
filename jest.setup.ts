import type {ForwardedRef, ReactNode} from 'react';

jest.mock('react-native-screens', () => {
  const React = require('react');
  const {View} = require('react-native');

  const Mock = React.forwardRef(
    ({children, ...props}: {children?: ReactNode}, ref: ForwardedRef<unknown>) =>
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
jest.mock('react-native-app-auth', () => ({
  authorize: jest.fn(),
}));
jest.mock('react-native-keychain', () => ({
  getGenericPassword: jest.fn(() => Promise.resolve(false)),
  setGenericPassword: jest.fn(() => Promise.resolve(true)),
  resetGenericPassword: jest.fn(() => Promise.resolve(true)),
}));
jest.mock('@react-native-clipboard/clipboard', () => ({
  setString: jest.fn(),
  getString: jest.fn(() => Promise.resolve('')),
}));
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper', () => ({}), {
  virtual: true,
});
