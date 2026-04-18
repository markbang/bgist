import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Alert, Linking} from 'react-native';
import {useI18n} from '../../../i18n/context';
import {appVersion} from '../../../shared/appInfo';
import {checkForAppUpdate, type AppUpdateSnapshot} from '../api/appUpdates';

type UpdateCheckOptions = {
  interactive?: boolean;
};

type AppUpdateContextValue = {
  autoCheckEnabled: boolean;
  currentVersion: string;
  downloadUrl: string | null;
  errorMessage: string | null;
  isChecking: boolean;
  lastCheckedAt: string | null;
  latestVersion: string | null;
  openRelease: () => Promise<void>;
  openUpdate: () => Promise<void>;
  releaseUrl: string | null;
  setAutoCheckEnabled: (enabled: boolean) => Promise<void>;
  updateAvailable: boolean;
  checkForUpdates: (options?: UpdateCheckOptions) => Promise<AppUpdateSnapshot | null>;
};

const AUTO_CHECK_STORAGE_KEY = 'app_update_auto_check_enabled';
const LAST_PROMPTED_VERSION_STORAGE_KEY = 'app_update_last_prompted_version';

const AppUpdateContext = React.createContext<AppUpdateContextValue>({
  autoCheckEnabled: true,
  currentVersion: appVersion,
  downloadUrl: null,
  errorMessage: null,
  isChecking: false,
  lastCheckedAt: null,
  latestVersion: null,
  openRelease: async () => {},
  openUpdate: async () => {},
  releaseUrl: null,
  setAutoCheckEnabled: async () => {},
  updateAvailable: false,
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

export function AppUpdateProvider({children}: {children: React.ReactNode}) {
  const {t} = useI18n();
  const isTestEnv = Boolean(
    (globalThis as {process?: {env?: Record<string, string | undefined>}}).process?.env
      ?.JEST_WORKER_ID,
  );
  const [autoCheckEnabled, setAutoCheckEnabledState] = React.useState(true);
  const [lastPromptedVersion, setLastPromptedVersion] = React.useState<string | null>(null);
  const [preferencesReady, setPreferencesReady] = React.useState(isTestEnv);
  const [isChecking, setIsChecking] = React.useState(false);
  const [lastCheckedAt, setLastCheckedAt] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [snapshot, setSnapshot] = React.useState<AppUpdateSnapshot | null>(null);
  const didAutoCheckRef = React.useRef(false);

  React.useEffect(() => {
    if (isTestEnv) {
      return;
    }

    Promise.all([
      AsyncStorage.getItem(AUTO_CHECK_STORAGE_KEY),
      AsyncStorage.getItem(LAST_PROMPTED_VERSION_STORAGE_KEY),
    ])
      .then(([autoCheckValue, lastPromptedValue]) => {
        if (autoCheckValue === 'false') {
          setAutoCheckEnabledState(false);
        }

        if (lastPromptedValue) {
          setLastPromptedVersion(lastPromptedValue);
        }
      })
      .finally(() => {
        setPreferencesReady(true);
      });
  }, [isTestEnv]);

  const persistPromptedVersion = React.useCallback(async (version: string | null) => {
    setLastPromptedVersion(version);

    if (version) {
      await AsyncStorage.setItem(LAST_PROMPTED_VERSION_STORAGE_KEY, version);
      return;
    }

    await AsyncStorage.removeItem(LAST_PROMPTED_VERSION_STORAGE_KEY);
  }, []);

  const openRelease = React.useCallback(async () => {
    await openExternal(snapshot?.releaseUrl ?? null);
  }, [snapshot?.releaseUrl]);

  const openUpdate = React.useCallback(async () => {
    await openExternal(snapshot?.downloadUrl ?? snapshot?.releaseUrl ?? null);
  }, [snapshot?.downloadUrl, snapshot?.releaseUrl]);

  const checkForUpdates = React.useCallback(
    async ({interactive = false}: UpdateCheckOptions = {}) => {
      setIsChecking(true);
      setErrorMessage(null);

      try {
        const nextSnapshot = await checkForAppUpdate(appVersion);
        setSnapshot(nextSnapshot);
        setLastCheckedAt(new Date().toISOString());

        if (nextSnapshot.updateAvailable) {
          const shouldShowAutomaticPrompt =
            !interactive &&
            autoCheckEnabled &&
            nextSnapshot.latestVersion !== lastPromptedVersion;

          if (interactive || shouldShowAutomaticPrompt) {
            if (shouldShowAutomaticPrompt) {
              persistPromptedVersion(nextSnapshot.latestVersion).catch(() => {});
            }

            Alert.alert(
              t('settings.updateAlertTitle'),
              t('settings.updateAlertMessage', {version: nextSnapshot.latestVersion}),
              [
                {
                  text: t('settings.updateLater'),
                  style: 'cancel',
                },
                {
                  text: t('settings.downloadLatest'),
                  onPress: () => {
                    openExternal(nextSnapshot.downloadUrl ?? nextSnapshot.releaseUrl).catch(
                      () => {},
                    );
                  },
                },
              ],
            );
          }
        } else if (interactive) {
          Alert.alert(
            t('settings.updateUpToDateTitle'),
            t('settings.updateUpToDateMessage', {version: appVersion}),
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
    [autoCheckEnabled, lastPromptedVersion, persistPromptedVersion, t],
  );

  const setAutoCheckEnabled = React.useCallback(async (enabled: boolean) => {
    setAutoCheckEnabledState(enabled);
    await AsyncStorage.setItem(AUTO_CHECK_STORAGE_KEY, enabled ? 'true' : 'false');
  }, []);

  React.useEffect(() => {
    if (!preferencesReady || !autoCheckEnabled || didAutoCheckRef.current || isTestEnv) {
      return;
    }

    didAutoCheckRef.current = true;
    checkForUpdates().catch(() => {});
  }, [autoCheckEnabled, checkForUpdates, isTestEnv, preferencesReady]);

  const value = React.useMemo(
    () => ({
      autoCheckEnabled,
      currentVersion: appVersion,
      downloadUrl: snapshot?.downloadUrl ?? null,
      errorMessage,
      isChecking,
      lastCheckedAt,
      latestVersion: snapshot?.latestVersion ?? null,
      openRelease,
      openUpdate,
      releaseUrl: snapshot?.releaseUrl ?? null,
      setAutoCheckEnabled,
      updateAvailable: snapshot?.updateAvailable ?? false,
      checkForUpdates,
    }),
    [
      autoCheckEnabled,
      checkForUpdates,
      errorMessage,
      isChecking,
      lastCheckedAt,
      openRelease,
      openUpdate,
      setAutoCheckEnabled,
      snapshot,
    ],
  );

  return <AppUpdateContext.Provider value={value}>{children}</AppUpdateContext.Provider>;
}

export function useAppUpdate() {
  return React.useContext(AppUpdateContext);
}
