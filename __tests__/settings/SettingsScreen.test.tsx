import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react-native';
import {SettingsScreen} from '../../src/features/profile/screens/SettingsScreen';
import {darkAppTheme as mockDarkAppTheme} from '../../src/app/theme/tokens';

const mockSetLanguage = jest.fn();
const mockSetThemePreference = jest.fn(() => Promise.resolve());
const mockSetThemePreset = jest.fn(() => Promise.resolve());
const mockSignOut = jest.fn();

jest.mock('../../src/i18n/context', () => ({
  useI18n: jest.fn(() => ({
    language: 'en',
    setLanguage: mockSetLanguage,
    t: (key: string) =>
      (
        {
          'settings.title': 'Settings',
          'settings.appearanceTitle': 'Appearance',
          'settings.appearance': 'Appearance',
          'settings.appearanceDescription': 'Choose how BGist should look on this device.',
          'settings.themeSystem': 'System',
          'settings.themeLight': 'Light',
          'settings.themeDark': 'Dark',
          'settings.themePresetDefault': 'Default',
          'settings.themePresetOcean': 'Ocean',
          'settings.themePresetForest': 'Forest',
          'settings.themePresetSunset': 'Sunset',
          'settings.currentAppearance': 'Following system: {appearance}',
          'settings.themeCurrentSystemDark': 'Following system: dark',
          'settings.themeCurrentSystemLight': 'Following system: light',
          'settings.languageTitle': 'Language',
          'settings.language': 'Language',
          'settings.languageDescription': 'Choose the language used throughout the app.',
          'settings.accountTitle': 'Account',
          'settings.account': 'Account',
          'settings.accountDescription': 'Manage your GitHub session and open your public profile.',
          'settings.accountSignedInAs': 'Signed in as @{login}',
          'settings.openGitHubProfile': 'Open GitHub profile',
          'settings.signOut': 'Sign Out',
          'settings.aboutTitle': 'About',
          'settings.aboutDescription': 'BGist version {version}',
          'settings.openRepository': 'Open repository',
          'settings.versionLabel': 'Version {version}',
          'common.languageEnglish': 'English',
          'common.languageChinese': '中文',
          'auth.signOut': 'Sign Out',
        } as Record<string, string>
      )[key]
        ?.replace('{appearance}', 'Dark')
        .replace('{version}', '0.2.3')
        .replace('{login}', 'octocat') ?? key,
  })),
}));

jest.mock('../../src/features/auth/session/SessionProvider', () => ({
  useSession: jest.fn(() => ({
    user: {
      login: 'octocat',
    },
    signOut: mockSignOut,
  })),
}));

jest.mock('../../src/app/theme/context', () => ({
  useAppTheme: jest.fn(() => ({
    ...mockDarkAppTheme,
    theme: mockDarkAppTheme,
    themeName: 'dark',
    themePreference: 'system',
    themePreset: 'default',
    resolvedScheme: 'dark',
    setThemePreference: mockSetThemePreference,
    setThemePreset: mockSetThemePreset,
    isDark: true,
  })),
  useThemePreference: jest.fn(() => ({
    colorMode: 'system',
    preset: 'default',
    resolvedScheme: 'dark',
    setColorMode: mockSetThemePreference,
    setPreset: mockSetThemePreset,
  })),
}));

afterEach(() => {
  jest.clearAllMocks();
});

test('lets people change appearance and language from settings', () => {
  render(
    <SettingsScreen
      navigation={{goBack: jest.fn(), navigate: jest.fn()} as never}
      route={{key: 'Settings', name: 'Settings'} as never}
    />,
  );

  expect(screen.getByText('Settings')).toBeTruthy();
  expect(screen.getByText('Following system: dark')).toBeTruthy();
  expect(screen.getAllByText('Default').length).toBeGreaterThan(0);
  expect(screen.getByText('@octocat')).toBeTruthy();
  expect(screen.getByText('Signed in as @octocat')).toBeTruthy();
  expect(screen.getByText('Version 0.2.3')).toBeTruthy();

  fireEvent.press(screen.getByRole('button', {name: 'Dark'}));
  fireEvent.press(screen.getByRole('button', {name: 'Ocean'}));
  fireEvent.press(screen.getByRole('button', {name: '中文'}));

  expect(mockSetThemePreference).toHaveBeenCalledWith('dark');
  expect(mockSetThemePreset).toHaveBeenCalledWith('ocean');
  expect(mockSetLanguage).toHaveBeenCalledWith('zh');
});
