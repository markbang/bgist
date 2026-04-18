import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react-native';
import {SettingsScreen} from '../../src/features/profile/screens/SettingsScreen';
import {darkAppTheme as mockDarkAppTheme} from '../../src/app/theme/tokens';

const mockSetLanguage = jest.fn();
const mockSetThemePreference = jest.fn(() => Promise.resolve());
const mockSetThemePreset = jest.fn(() => Promise.resolve());
const mockSetAutoCheckEnabled = jest.fn(() => Promise.resolve());
const mockCheckForUpdates = jest.fn(() => Promise.resolve());
const mockOpenUpdate = jest.fn(() => Promise.resolve());
const mockSignOut = jest.fn();

jest.mock('../../src/i18n/context', () => ({
  useI18n: jest.fn(() => ({
    language: 'en',
    setLanguage: mockSetLanguage,
    t: (key: string, values?: Record<string, string>) => {
      const template =
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
            'settings.themePresetCurrent': 'Current',
            'settings.themePresetDefaultDescription': 'Neutral GitHub-inspired tones.',
            'settings.themePresetOceanDescription': 'Cool teal accents with a quieter mood.',
            'settings.themePresetForestDescription': 'Calm green accents with softer contrast.',
            'settings.themePresetSunsetDescription': 'Warm amber accents with gentle highlights.',
            'settings.currentAppearance': 'Following system: {appearance}',
            'settings.themeCurrentSystemDark': 'Following system: dark',
            'settings.themeCurrentSystemLight': 'Following system: light',
            'settings.languageTitle': 'Language',
            'settings.language': 'Language',
            'settings.languageDescription': 'Choose the language used throughout the app.',
            'settings.updatesTitle': 'Updates',
            'settings.updatesDescription':
              'Check new releases and choose whether BGist should look for them automatically.',
            'settings.updatesStatusIdle': 'Latest version unknown',
            'settings.updatesStatusChecking': 'Checking for updates…',
            'settings.updatesStatusAvailable': 'Update available: {version}',
            'settings.updatesStatusUpToDate': 'Up to date with {version}',
            'settings.updatesStatusFailed': 'Could not check for updates',
            'settings.updatesLastChecked': 'Last checked {date}',
            'settings.updateAvailableBanner':
              'A newer build ({version}) is available to download.',
            'settings.autoCheckEnabled': 'Automatic update checks are on',
            'settings.autoCheckDisabled': 'Automatic update checks are off',
            'settings.checkForUpdates': 'Check for updates',
            'settings.downloadLatest': 'Download latest',
            'settings.openLatestRelease': 'Open latest release',
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
            'common.on': 'On',
            'common.off': 'Off',
            'auth.signOut': 'Sign Out',
          } as Record<string, string>
        )[key] ?? key;

      return Object.entries({
        appearance: 'Dark',
        date: 'Apr 19',
        login: 'octocat',
        version: '0.2.3',
        ...values,
      }).reduce((result, [token, value]) => result.replace(`{${token}}`, value), template);
    },
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

jest.mock('../../src/features/updates/context/AppUpdateProvider', () => ({
  useAppUpdate: jest.fn(() => ({
    autoCheckEnabled: true,
    checkForUpdates: mockCheckForUpdates,
    currentVersion: '0.2.3',
    downloadUrl: 'https://example.com/BGist-v0-2-4-arm64-v8a.apk',
    errorMessage: null,
    isChecking: false,
    lastCheckedAt: '2026-04-19T10:00:00.000Z',
    latestVersion: '0.2.4',
    openRelease: jest.fn(() => Promise.resolve()),
    openUpdate: mockOpenUpdate,
    releaseUrl: 'https://github.com/markbang/bgist/releases/tag/v0.2.4',
    setAutoCheckEnabled: mockSetAutoCheckEnabled,
    updateAvailable: true,
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
  expect(screen.getAllByText('Following system: dark').length).toBeGreaterThan(0);
  expect(screen.getAllByText('Default').length).toBeGreaterThan(0);
  expect(screen.getAllByText('Current').length).toBeGreaterThan(0);
  expect(screen.getByText('Cool teal accents with a quieter mood.')).toBeTruthy();
  expect(screen.getByText('@octocat')).toBeTruthy();
  expect(screen.getByText('Signed in as @octocat')).toBeTruthy();
  expect(screen.getByText('Updates')).toBeTruthy();
  expect(screen.getByText('Update available: 0.2.4')).toBeTruthy();
  expect(screen.getByText('A newer build (0.2.4) is available to download.')).toBeTruthy();
  expect(screen.getByText('Automatic update checks are on')).toBeTruthy();
  expect(screen.getByText('Version 0.2.3')).toBeTruthy();

  fireEvent.press(screen.getByRole('button', {name: 'Dark'}));
  fireEvent.press(screen.getByRole('button', {name: 'Ocean'}));
  fireEvent.press(screen.getByRole('button', {name: '中文'}));
  fireEvent.press(screen.getByRole('button', {name: 'Off'}));
  fireEvent.press(screen.getByRole('button', {name: 'Check for updates'}));
  fireEvent.press(screen.getByRole('button', {name: 'Download latest'}));

  expect(mockSetThemePreference).toHaveBeenCalledWith('dark');
  expect(mockSetThemePreset).toHaveBeenCalledWith('ocean');
  expect(mockSetLanguage).toHaveBeenCalledWith('zh');
  expect(mockSetAutoCheckEnabled).toHaveBeenCalledWith(false);
  expect(mockCheckForUpdates).toHaveBeenCalledWith({interactive: true});
  expect(mockOpenUpdate).toHaveBeenCalled();
});
