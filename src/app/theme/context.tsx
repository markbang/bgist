import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Appearance, useColorScheme} from 'react-native';
import {getTheme, type AppTheme, type ThemeName, type ThemePreset} from './tokens';

export type ThemeColorMode = 'system' | 'light' | 'dark';
export type ThemePreference = ThemeColorMode;
export type ResolvedThemeScheme = ThemeName;

type ThemePreferenceContextValue = {
  colorMode: ThemeColorMode;
  preset: ThemePreset;
  resolvedScheme: ResolvedThemeScheme;
  setColorMode: (nextMode: ThemeColorMode) => Promise<void>;
  setPreset: (nextPreset: ThemePreset) => Promise<void>;
};

const MODE_STORAGE_KEY = 'app_theme_preference';
const PRESET_STORAGE_KEY = 'app_theme_preset';

const ThemePreferenceContext = React.createContext<ThemePreferenceContextValue>({
  colorMode: 'system',
  preset: 'default',
  resolvedScheme: 'light',
  setColorMode: async () => {},
  setPreset: async () => {},
});

function resolveScheme(
  colorMode: ThemeColorMode,
  systemScheme: ReturnType<typeof useColorScheme>,
): ResolvedThemeScheme {
  if (colorMode === 'dark') {
    return 'dark';
  }

  if (colorMode === 'light') {
    return 'light';
  }

  return systemScheme === 'dark' ? 'dark' : 'light';
}

export function ThemeProvider({children}: {children: React.ReactNode}) {
  const systemScheme = useColorScheme();
  const [colorMode, setColorModeState] = React.useState<ThemeColorMode>('system');
  const [preset, setPresetState] = React.useState<ThemePreset>('default');

  React.useEffect(() => {
    AsyncStorage.getItem(MODE_STORAGE_KEY).then(savedMode => {
      if (savedMode === 'system' || savedMode === 'light' || savedMode === 'dark') {
        setColorModeState(savedMode);
      }
    });
    AsyncStorage.getItem(PRESET_STORAGE_KEY).then(savedPreset => {
      if (
        savedPreset === 'default' ||
        savedPreset === 'ocean' ||
        savedPreset === 'forest' ||
        savedPreset === 'sunset'
      ) {
        setPresetState(savedPreset);
      }
    });
  }, []);

  React.useEffect(() => {
    Appearance.setColorScheme(colorMode === 'system' ? 'unspecified' : colorMode);
  }, [colorMode]);

  const setColorMode = React.useCallback(async (nextMode: ThemeColorMode) => {
    setColorModeState(nextMode);
    await AsyncStorage.setItem(MODE_STORAGE_KEY, nextMode);
  }, []);

  const setPreset = React.useCallback(async (nextPreset: ThemePreset) => {
    setPresetState(nextPreset);
    await AsyncStorage.setItem(PRESET_STORAGE_KEY, nextPreset);
  }, []);

  const resolvedScheme = React.useMemo(
    () => resolveScheme(colorMode, systemScheme),
    [colorMode, systemScheme],
  );

  const value = React.useMemo(
    () => ({colorMode, preset, resolvedScheme, setColorMode, setPreset}),
    [colorMode, preset, resolvedScheme, setColorMode, setPreset],
  );

  return (
    <ThemePreferenceContext.Provider value={value}>
      {children}
    </ThemePreferenceContext.Provider>
  );
}

export function useThemePreference() {
  return React.useContext(ThemePreferenceContext);
}

export function useAppTheme() {
  const {colorMode, preset, resolvedScheme, setColorMode, setPreset} = useThemePreference();
  const theme = getTheme(resolvedScheme, preset);

  return {
    ...theme,
    isDark: resolvedScheme === 'dark',
    theme,
    themeName: resolvedScheme,
    themePreset: preset,
    themePreference: colorMode,
    resolvedScheme,
    setThemePreference: setColorMode,
    setThemePreset: setPreset,
  };
}

export function useThemedStyles<T>(factory: (theme: AppTheme) => T) {
  const {theme} = useAppTheme();

  return React.useMemo(() => factory(theme), [factory, theme]);
}
