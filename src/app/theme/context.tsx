import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Appearance, useColorScheme} from 'react-native';
import {getTheme, type AppTheme, type ThemeName} from './tokens';

export type ThemeColorMode = 'system' | 'light' | 'dark';
export type ThemePreference = ThemeColorMode;
export type ResolvedThemeScheme = ThemeName;

type ThemePreferenceContextValue = {
  colorMode: ThemeColorMode;
  resolvedScheme: ResolvedThemeScheme;
  setColorMode: (nextMode: ThemeColorMode) => Promise<void>;
};

const STORAGE_KEY = 'app_theme_preference';

const ThemePreferenceContext = React.createContext<ThemePreferenceContextValue>({
  colorMode: 'system',
  resolvedScheme: 'light',
  setColorMode: async () => {},
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

  React.useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(savedMode => {
      if (savedMode === 'system' || savedMode === 'light' || savedMode === 'dark') {
        setColorModeState(savedMode);
      }
    });
  }, []);

  React.useEffect(() => {
    Appearance.setColorScheme(colorMode === 'system' ? 'unspecified' : colorMode);
  }, [colorMode]);

  const setColorMode = React.useCallback(async (nextMode: ThemeColorMode) => {
    setColorModeState(nextMode);
    await AsyncStorage.setItem(STORAGE_KEY, nextMode);
  }, []);

  const resolvedScheme = React.useMemo(
    () => resolveScheme(colorMode, systemScheme),
    [colorMode, systemScheme],
  );

  const value = React.useMemo(
    () => ({colorMode, resolvedScheme, setColorMode}),
    [colorMode, resolvedScheme, setColorMode],
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
  const {colorMode, resolvedScheme, setColorMode} = useThemePreference();
  const theme = getTheme(resolvedScheme);

  return {
    ...theme,
    isDark: resolvedScheme === 'dark',
    theme,
    themeName: resolvedScheme,
    themePreference: colorMode,
    resolvedScheme,
    setThemePreference: setColorMode,
  };
}

export function useThemedStyles<T>(factory: (theme: AppTheme) => T) {
  const {theme} = useAppTheme();

  return React.useMemo(() => factory(theme), [factory, theme]);
}
