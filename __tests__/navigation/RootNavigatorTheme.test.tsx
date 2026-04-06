import React from 'react';
import {render} from '@testing-library/react-native';
import {darkAppTheme as mockDarkAppTheme} from '../../src/app/theme/tokens';

const captured = {
  theme: null as null | Record<string, unknown>,
};

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({
    children,
    theme,
  }: {
    children: React.ReactNode;
    theme: Record<string, unknown>;
  }) => {
    captured.theme = theme;
    return <>{children}</>;
  },
  DefaultTheme: {
    dark: false,
    colors: {
      background: '#fff',
      card: '#fff',
      border: '#ddd',
      primary: '#000',
      text: '#000',
    },
  },
  DarkTheme: {
    dark: true,
    colors: {
      background: '#000',
      card: '#000',
      border: '#333',
      primary: '#fff',
      text: '#fff',
    },
  },
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({children}: {children: React.ReactNode}) => <>{children}</>,
    Screen: () => null,
  }),
}));

jest.mock('../../src/features/auth/session/SessionProvider', () => ({
  useSession: jest.fn(() => ({
    status: 'signedOut',
  })),
}));

jest.mock('../../src/app/theme/context', () => ({
  useAppTheme: jest.fn(() => ({
    ...mockDarkAppTheme,
    theme: mockDarkAppTheme,
    themeName: 'dark',
    themePreference: 'dark',
    resolvedScheme: 'dark',
    setThemePreference: jest.fn(),
    isDark: true,
  })),
}));

jest.mock('../../src/features/auth/screens/LoginScreen', () => () => null);
jest.mock('../../src/features/gists/screens/GistDetailScreen', () => ({
  GistDetailScreen: () => null,
}));
jest.mock('../../src/features/gists/screens/GistEditorScreen', () => ({
  GistEditorScreen: () => null,
}));
jest.mock('../../src/features/gists/screens/GistHistoryScreen', () => ({
  GistHistoryScreen: () => null,
}));
jest.mock('../../src/features/gists/screens/GistViewerScreen', () => ({
  GistViewerScreen: () => null,
}));
jest.mock('../../src/features/profile/screens/UserProfileScreen', () => ({
  UserProfileScreen: () => null,
}));
jest.mock('../../src/features/profile/screens/SettingsScreen', () => ({
  SettingsScreen: () => null,
}));
jest.mock('../../src/app/navigation/MainTabs', () => ({
  MainTabs: () => null,
}));

test('uses the dark navigation palette when the resolved theme is dark', () => {
  const {RootNavigator} = require('../../src/app/navigation/RootNavigator') as typeof import('../../src/app/navigation/RootNavigator');

  render(<RootNavigator />);

  expect(captured.theme).toMatchObject({
    dark: true,
    colors: expect.objectContaining({
      background: mockDarkAppTheme.colors.canvas,
      card: mockDarkAppTheme.colors.surface,
      border: mockDarkAppTheme.colors.border,
      primary: mockDarkAppTheme.colors.accent,
      text: mockDarkAppTheme.colors.textPrimary,
    }),
  });
});
