import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { SettingsScreen } from '../../src/features/profile/screens/SettingsScreen';
import { darkAppTheme as mockDarkAppTheme } from '../../src/app/theme/tokens';

const mockSetLanguage = jest.fn();
const mockSetThemePreference = jest.fn(() => Promise.resolve());
const mockSetThemePreset = jest.fn(() => Promise.resolve());
const mockSetAutoCheckEnabled = jest.fn(() => Promise.resolve());
const mockSetAutoDownloadEnabled = jest.fn(() => Promise.resolve());
const mockSetUpdateChannel = jest.fn(() => Promise.resolve());
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
            'settings.appearanceDescription':
              'Choose how BGist should look on this device.',
            'settings.themeSystem': 'System',
            'settings.themeLight': 'Light',
            'settings.themeDark': 'Dark',
            'settings.themePresetDefault': 'Default',
            'settings.themePresetOcean': 'Ocean',
            'settings.themePresetForest': 'Forest',
            'settings.themePresetSunset': 'Sunset',
            'settings.themePresetCurrent': 'Current',
            'settings.themePresetDefaultDescription':
              'Neutral GitHub-inspired tones.',
            'settings.themePresetOceanDescription':
              'Cool teal accents with a quieter mood.',
            'settings.themePresetForestDescription':
              'Calm green accents with softer contrast.',
            'settings.themePresetSunsetDescription':
              'Warm amber accents with gentle highlights.',
            'settings.resetAppearance': 'Reset appearance',
            'settings.currentAppearance': 'Following system: {appearance}',
            'settings.themeCurrentSystemDark': 'Following system: dark',
            'settings.themeCurrentSystemLight': 'Following system: light',
            'settings.languageTitle': 'Language',
            'settings.language': 'Language',
            'settings.languageDescription':
              'Choose the language used throughout the app.',
            'settings.updatesTitle': 'Updates',
            'settings.updatesDescription':
              'Check new releases and choose whether BGist should look for them automatically.',
            'settings.updatesStatusIdle': 'Latest version unknown',
            'settings.updatesStatusChecking': 'Checking for updates…',
            'settings.updatesStatusDownloading': 'Downloading update…',
            'settings.updatesStatusInstalling': 'Opening installer…',
            'settings.updatesStatusAvailable': 'Update available: {version}',
            'settings.updatesStatusUpToDate': 'Up to date with {version}',
            'settings.updatesStatusFailed': 'Could not check for updates',
            'settings.updatesLastChecked': 'Last checked {date}',
            'settings.updateAvailableBanner':
              'A newer build ({version}) is available to download.',
            'settings.autoCheckEnabled': 'Automatic update checks are on',
            'settings.autoCheckDisabled': 'Automatic update checks are off',
            'settings.autoDownloadEnabled':
              'Automatic GitHub APK install is on',
            'settings.autoDownloadDisabled':
              'Automatic GitHub APK install is off',
            'settings.autoDownloadDescription':
              'When a newer GitHub release is found, BGist downloads the APK and opens the Android installer.',
            'settings.updateChannelLabel': 'Channel: {channel}',
            'settings.updateChannelStable': 'Stable',
            'settings.updateChannelPreview': 'Preview',
            'settings.updateChannelDescription':
              'Stable follows the latest GitHub release. Preview can include prereleases.',
            'settings.checkForUpdates': 'Check for updates',
            'settings.downloadLatest': 'Download latest',
            'settings.installLatest': 'Install latest',
            'settings.openLatestRelease': 'Open latest release',
            'settings.accountTitle': 'Account',
            'settings.account': 'Account',
            'settings.accountDescription':
              'Manage your GitHub session and open your public profile.',
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
      }).reduce(
        (result, [token, value]) => result.replace(`{${token}}`, value),
        template,
      );
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
    autoDownloadEnabled: false,
    autoCheckEnabled: true,
    checkForUpdates: mockCheckForUpdates,
    currentVersion: '0.2.3',
    downloadUrl: 'https://example.com/BGist-v0-2-4-arm64-v8a.apk',
    errorMessage: null,
    installStatus: 'idle',
    isChecking: false,
    lastCheckedAt: '2026-04-19T10:00:00.000Z',
    latestVersion: '0.2.4',
    openRelease: jest.fn(() => Promise.resolve()),
    openUpdate: mockOpenUpdate,
    releaseUrl: 'https://github.com/markbang/bgist/releases/tag/v0.2.4',
    setAutoDownloadEnabled: mockSetAutoDownloadEnabled,
    setAutoCheckEnabled: mockSetAutoCheckEnabled,
    setUpdateChannel: mockSetUpdateChannel,
    updateAvailable: true,
    updateChannel: 'stable',
  })),
}));

afterEach(() => {
  jest.clearAllMocks();
});

test('lets people change appearance and language from settings', () => {
  render(
    <SettingsScreen
      navigation={{ goBack: jest.fn(), navigate: jest.fn() } as never}
      route={{ key: 'Settings', name: 'Settings' } as never}
    />,
  );

  expect(screen.getByText('Settings')).toBeTruthy();
  expect(screen.getAllByText('Following system: dark').length).toBeGreaterThan(
    0,
  );
  expect(screen.getAllByText('Default').length).toBeGreaterThan(0);
  expect(screen.getAllByText('Current').length).toBeGreaterThan(0);
  expect(
    screen.getByText('Cool teal accents with a quieter mood.'),
  ).toBeTruthy();
  expect(screen.getByText('@octocat')).toBeTruthy();
  expect(screen.getByText('Signed in as @octocat')).toBeTruthy();
  expect(screen.getByText('Updates')).toBeTruthy();
  expect(screen.getByText('Update available: 0.2.4')).toBeTruthy();
  expect(
    screen.getByText('A newer build (0.2.4) is available to download.'),
  ).toBeTruthy();
  expect(screen.getByText('Automatic update checks are on')).toBeTruthy();
  expect(screen.getByText('Channel: Stable')).toBeTruthy();
  expect(screen.getByText('Automatic GitHub APK install is off')).toBeTruthy();
  expect(screen.getByText('Version 0.2.3')).toBeTruthy();

  fireEvent.press(screen.getByRole('button', { name: 'Dark' }));
  fireEvent.press(screen.getByRole('button', { name: 'Ocean' }));
  fireEvent.press(screen.getByRole('button', { name: 'Reset appearance' }));
  fireEvent.press(screen.getByRole('button', { name: '中文' }));
  fireEvent.press(screen.getAllByRole('button', { name: 'Off' })[0]);
  fireEvent.press(screen.getByRole('button', { name: 'Preview' }));
  fireEvent.press(screen.getAllByRole('button', { name: 'On' })[1]);
  fireEvent.press(screen.getByRole('button', { name: 'Check for updates' }));
  fireEvent.press(screen.getByRole('button', { name: 'Install latest' }));

  expect(mockSetThemePreference).toHaveBeenCalledWith('dark');
  expect(mockSetThemePreference).toHaveBeenCalledWith('system');
  expect(mockSetThemePreset).toHaveBeenCalledWith('ocean');
  expect(mockSetThemePreset).toHaveBeenCalledWith('default');
  expect(mockSetLanguage).toHaveBeenCalledWith('zh');
  expect(mockSetAutoCheckEnabled).toHaveBeenCalledWith(false);
  expect(mockSetUpdateChannel).toHaveBeenCalledWith('preview');
  expect(mockSetAutoDownloadEnabled).toHaveBeenCalledWith(true);
  expect(mockCheckForUpdates).toHaveBeenCalledWith({ interactive: true });
  expect(mockOpenUpdate).toHaveBeenCalled();
});
