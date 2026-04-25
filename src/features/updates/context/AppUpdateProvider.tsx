import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Linking } from 'react-native';
import { useI18n } from '../../../i18n/context';
import { appVersion } from '../../../shared/appInfo';
import {
  checkForAppUpdate,
  type AppUpdateChannel,
  type AppUpdateSnapshot,
} from '../api/appUpdates';
import {
  createUpdateApkFileName,
  downloadAndInstallApk,
  openInstallPermissionSettings,
  supportsNativeApkInstall,
} from '../native/AppUpdateInstaller';

type UpdateCheckOptions = {
  interactive?: boolean;
};

type AppUpdateContextValue = {
  autoDownloadEnabled: boolean;
  autoCheckEnabled: boolean;
  currentVersion: string;
  downloadUrl: string | null;
  errorMessage: string | null;
  installStatus: 'idle' | 'downloading' | 'installing' | 'failed';
  isChecking: boolean;
  lastCheckedAt: string | null;
  latestVersion: string | null;
  openRelease: () => Promise<void>;
  openUpdate: () => Promise<void>;
  releaseUrl: string | null;
  setAutoDownloadEnabled: (enabled: boolean) => Promise<void>;
  setAutoCheckEnabled: (enabled: boolean) => Promise<void>;
  setUpdateChannel: (channel: AppUpdateChannel) => Promise<void>;
  updateAvailable: boolean;
  updateChannel: AppUpdateChannel;
  checkForUpdates: (
    options?: UpdateCheckOptions,
  ) => Promise<AppUpdateSnapshot | null>;
};

const AUTO_CHECK_STORAGE_KEY = 'app_update_auto_check_enabled';
const AUTO_DOWNLOAD_STORAGE_KEY = 'app_update_auto_download_enabled';
const UPDATE_CHANNEL_STORAGE_KEY = 'app_update_channel';
const LAST_PROMPTED_VERSION_STORAGE_KEY = 'app_update_last_prompted_version';

const AppUpdateContext = React.createContext<AppUpdateContextValue>({
  autoDownloadEnabled: false,
  autoCheckEnabled: true,
  currentVersion: appVersion,
  downloadUrl: null,
  errorMessage: null,
  installStatus: 'idle',
  isChecking: false,
  lastCheckedAt: null,
  latestVersion: null,
  openRelease: async () => {},
  openUpdate: async () => {},
  releaseUrl: null,
  setAutoDownloadEnabled: async () => {},
  setAutoCheckEnabled: async () => {},
  setUpdateChannel: async () => {},
  updateAvailable: false,
  updateChannel: 'stable',
  checkForUpdates: async () => null,
});

async function openExternal(url: string | null) {
  if (!url) {
    return;
  }

  try {
    await Linking.openURL(url);
  } catch {}
}

export function AppUpdateProvider({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const isTestEnv = Boolean(
    (globalThis as { process?: { env?: Record<string, string | undefined> } })
      .process?.env?.JEST_WORKER_ID,
  );
  const [autoCheckEnabled, setAutoCheckEnabledState] = React.useState(true);
  const [autoDownloadEnabled, setAutoDownloadEnabledState] =
    React.useState(false);
  const [updateChannel, setUpdateChannelState] =
    React.useState<AppUpdateChannel>('stable');
  const [lastPromptedVersion, setLastPromptedVersion] = React.useState<
    string | null
  >(null);
  const [preferencesReady, setPreferencesReady] = React.useState(isTestEnv);
  const [isChecking, setIsChecking] = React.useState(false);
  const [installStatus, setInstallStatus] =
    React.useState<AppUpdateContextValue['installStatus']>('idle');
  const [lastCheckedAt, setLastCheckedAt] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [snapshot, setSnapshot] = React.useState<AppUpdateSnapshot | null>(
    null,
  );
  const didAutoCheckRef = React.useRef(false);

  React.useEffect(() => {
    if (isTestEnv) {
      return;
    }

    Promise.all([
      AsyncStorage.getItem(AUTO_CHECK_STORAGE_KEY),
      AsyncStorage.getItem(AUTO_DOWNLOAD_STORAGE_KEY),
      AsyncStorage.getItem(UPDATE_CHANNEL_STORAGE_KEY),
      AsyncStorage.getItem(LAST_PROMPTED_VERSION_STORAGE_KEY),
    ])
      .then(
        ([
          autoCheckValue,
          autoDownloadValue,
          updateChannelValue,
          lastPromptedValue,
        ]) => {
          if (autoCheckValue === 'false') {
            setAutoCheckEnabledState(false);
          }

          if (autoDownloadValue === 'true') {
            setAutoDownloadEnabledState(true);
          }

          if (
            updateChannelValue === 'stable' ||
            updateChannelValue === 'preview'
          ) {
            setUpdateChannelState(updateChannelValue);
          }

          if (lastPromptedValue) {
            setLastPromptedVersion(lastPromptedValue);
          }
        },
      )
      .finally(() => {
        setPreferencesReady(true);
      });
  }, [isTestEnv]);

  const persistPromptedVersion = React.useCallback(
    async (version: string | null) => {
      setLastPromptedVersion(version);

      if (version) {
        await AsyncStorage.setItem(LAST_PROMPTED_VERSION_STORAGE_KEY, version);
        return;
      }

      await AsyncStorage.removeItem(LAST_PROMPTED_VERSION_STORAGE_KEY);
    },
    [],
  );

  const openRelease = React.useCallback(async () => {
    await openExternal(snapshot?.releaseUrl ?? null);
  }, [snapshot?.releaseUrl]);

  const openUpdateSnapshot = React.useCallback(
    async (nextSnapshot: AppUpdateSnapshot | null) => {
      if (!nextSnapshot) {
        return;
      }

      const fallbackUrl = nextSnapshot.downloadUrl ?? nextSnapshot.releaseUrl;

      if (!nextSnapshot.downloadUrl || !supportsNativeApkInstall) {
        await openExternal(fallbackUrl);
        return;
      }

      setInstallStatus('downloading');

      try {
        const fileName = createUpdateApkFileName(
          nextSnapshot.latestVersion,
          nextSnapshot.preferredAsset?.name,
        );
        await downloadAndInstallApk(nextSnapshot.downloadUrl, fileName);
        setInstallStatus('installing');
      } catch (error) {
        const code = (error as { code?: string }).code;
        setInstallStatus('failed');

        if (code === 'install_permission_required') {
          Alert.alert(
            t('settings.updateInstallPermissionTitle'),
            t('settings.updateInstallPermissionMessage'),
            [
              {
                text: t('common.cancel'),
                style: 'cancel',
              },
              {
                text: t('settings.openInstallSettings'),
                onPress: () => {
                  openInstallPermissionSettings().catch(() => {});
                },
              },
            ],
          );
          return;
        }

        Alert.alert(
          t('settings.updateInstallFailedTitle'),
          t('settings.updateInstallFailedMessage'),
        );
      }
    },
    [t],
  );

  const openUpdate = React.useCallback(async () => {
    await openUpdateSnapshot(snapshot);
  }, [openUpdateSnapshot, snapshot]);

  const checkForUpdates = React.useCallback(
    async ({ interactive = false }: UpdateCheckOptions = {}) => {
      setIsChecking(true);
      setErrorMessage(null);

      try {
        const nextSnapshot = await checkForAppUpdate(appVersion, updateChannel);
        setSnapshot(nextSnapshot);
        setLastCheckedAt(new Date().toISOString());

        if (nextSnapshot.updateAvailable) {
          const shouldAutoDownload =
            !interactive &&
            autoCheckEnabled &&
            autoDownloadEnabled &&
            nextSnapshot.latestVersion !== lastPromptedVersion;
          const shouldShowAutomaticPrompt =
            !interactive &&
            autoCheckEnabled &&
            !autoDownloadEnabled &&
            nextSnapshot.latestVersion !== lastPromptedVersion;

          if (shouldAutoDownload) {
            persistPromptedVersion(nextSnapshot.latestVersion).catch(() => {});
            openUpdateSnapshot(nextSnapshot).catch(() => {});
          }

          if (interactive || shouldShowAutomaticPrompt) {
            if (shouldShowAutomaticPrompt) {
              persistPromptedVersion(nextSnapshot.latestVersion).catch(
                () => {},
              );
            }

            Alert.alert(
              t('settings.updateAlertTitle'),
              t('settings.updateAlertMessage', {
                version: nextSnapshot.latestVersion,
              }),
              [
                {
                  text: t('settings.updateLater'),
                  style: 'cancel',
                },
                {
                  text: t('settings.installLatest'),
                  onPress: () => {
                    openUpdateSnapshot(nextSnapshot).catch(() => {});
                  },
                },
              ],
            );
          }
        } else if (interactive) {
          Alert.alert(
            t('settings.updateUpToDateTitle'),
            t('settings.updateUpToDateMessage', { version: appVersion }),
          );
        }

        return nextSnapshot;
      } catch {
        setErrorMessage(t('settings.updateCheckFailedMessage'));

        if (interactive) {
          Alert.alert(
            t('settings.updateCheckFailedTitle'),
            t('settings.updateCheckFailedMessage'),
          );
        }

        return null;
      } finally {
        setIsChecking(false);
      }
    },
    [
      autoCheckEnabled,
      autoDownloadEnabled,
      lastPromptedVersion,
      openUpdateSnapshot,
      persistPromptedVersion,
      t,
      updateChannel,
    ],
  );

  const setAutoCheckEnabled = React.useCallback(async (enabled: boolean) => {
    setAutoCheckEnabledState(enabled);
    await AsyncStorage.setItem(
      AUTO_CHECK_STORAGE_KEY,
      enabled ? 'true' : 'false',
    );
  }, []);

  const setAutoDownloadEnabled = React.useCallback(async (enabled: boolean) => {
    setAutoDownloadEnabledState(enabled);
    await AsyncStorage.setItem(
      AUTO_DOWNLOAD_STORAGE_KEY,
      enabled ? 'true' : 'false',
    );
  }, []);

  const setUpdateChannel = React.useCallback(
    async (channel: AppUpdateChannel) => {
      setUpdateChannelState(channel);
      setSnapshot(null);
      setLastCheckedAt(null);
      await AsyncStorage.setItem(UPDATE_CHANNEL_STORAGE_KEY, channel);
    },
    [],
  );

  React.useEffect(() => {
    if (
      !preferencesReady ||
      !autoCheckEnabled ||
      didAutoCheckRef.current ||
      isTestEnv
    ) {
      return;
    }

    didAutoCheckRef.current = true;
    checkForUpdates().catch(() => {});
  }, [autoCheckEnabled, checkForUpdates, isTestEnv, preferencesReady]);

  const value = React.useMemo(
    () => ({
      autoDownloadEnabled,
      autoCheckEnabled,
      currentVersion: appVersion,
      downloadUrl: snapshot?.downloadUrl ?? null,
      errorMessage,
      installStatus,
      isChecking,
      lastCheckedAt,
      latestVersion: snapshot?.latestVersion ?? null,
      openRelease,
      openUpdate,
      releaseUrl: snapshot?.releaseUrl ?? null,
      setAutoDownloadEnabled,
      setAutoCheckEnabled,
      setUpdateChannel,
      updateAvailable: snapshot?.updateAvailable ?? false,
      updateChannel,
      checkForUpdates,
    }),
    [
      autoDownloadEnabled,
      autoCheckEnabled,
      checkForUpdates,
      errorMessage,
      installStatus,
      isChecking,
      lastCheckedAt,
      openRelease,
      openUpdate,
      setAutoDownloadEnabled,
      setAutoCheckEnabled,
      setUpdateChannel,
      snapshot,
      updateChannel,
    ],
  );

  return (
    <AppUpdateContext.Provider value={value}>
      {children}
    </AppUpdateContext.Provider>
  );
}

export function useAppUpdate() {
  return React.useContext(AppUpdateContext);
}
