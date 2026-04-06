export type AppTheme = {
  colors: {
    canvas: string;
    surface: string;
    surfaceMuted: string;
    border: string;
    textPrimary: string;
    textSecondary: string;
    placeholder: string;
    accent: string;
    accentSoft: string;
    accentContrast: string;
    success: string;
    successSoft: string;
    warning: string;
    warningSoft: string;
    warningBorder: string;
    danger: string;
    dangerSoft: string;
    dangerBorder: string;
    infoSoft: string;
    infoBorder: string;
    secretSoft: string;
    secretBorder: string;
    secretText: string;
    badgeSecretBg: string;
    badgeSecretBorder: string;
    badgeSecretText: string;
    bannerInfoBg: string;
    bannerInfoBorder: string;
    bannerWarningBg: string;
    bannerWarningBorder: string;
    bannerDangerBg: string;
    bannerDangerBorder: string;
    errorSurface: string;
    codeBg: string;
    codeText: string;
    overlay: string;
  };
  shadow: {
    card: {
      shadowColor: string;
      shadowOffset: {width: number; height: number};
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
};

export type ThemeName = 'light' | 'dark';

const sharedRadius = {
  sm: 10,
  md: 14,
  lg: 18,
} as const;

const sharedSpacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const lightAppTheme: AppTheme = {
  colors: {
    canvas: '#f5f7fb',
    surface: '#ffffff',
    surfaceMuted: '#eef2f8',
    border: '#d5ddeb',
    textPrimary: '#111827',
    textSecondary: '#5b6474',
    placeholder: '#7b8797',
    accent: '#2563eb',
    accentSoft: '#dbeafe',
    accentContrast: '#ffffff',
    success: '#059669',
    successSoft: '#d1fae5',
    warning: '#d97706',
    warningSoft: '#fffbeb',
    warningBorder: '#fde68a',
    danger: '#dc2626',
    dangerSoft: '#fee2e2',
    dangerBorder: '#fecaca',
    infoSoft: '#eff6ff',
    infoBorder: '#bfdbfe',
    secretSoft: '#f3f4f6',
    secretBorder: '#e5e7eb',
    secretText: '#374151',
    badgeSecretBg: '#f3f4f6',
    badgeSecretBorder: '#e5e7eb',
    badgeSecretText: '#374151',
    bannerInfoBg: '#eff6ff',
    bannerInfoBorder: '#bfdbfe',
    bannerWarningBg: '#fffbeb',
    bannerWarningBorder: '#fde68a',
    bannerDangerBg: '#fee2e2',
    bannerDangerBorder: '#fecaca',
    errorSurface: '#fee2e2',
    codeBg: '#0f172a',
    codeText: '#e2e8f0',
    overlay: 'rgba(15, 23, 42, 0.48)',
  },
  shadow: {
    card: {
      shadowColor: '#0f172a',
      shadowOffset: {width: 0, height: 12},
      shadowOpacity: 0.1,
      shadowRadius: 24,
      elevation: 8,
    },
  },
  radius: sharedRadius,
  spacing: sharedSpacing,
};

export const darkAppTheme: AppTheme = {
  colors: {
    canvas: '#0b1220',
    surface: '#111827',
    surfaceMuted: '#172032',
    border: '#263349',
    textPrimary: '#f3f6fb',
    textSecondary: '#9aa6b6',
    placeholder: '#7d8898',
    accent: '#60a5fa',
    accentSoft: '#10233f',
    accentContrast: '#08111f',
    success: '#34d399',
    successSoft: '#0f2a24',
    warning: '#f59e0b',
    warningSoft: '#2f240d',
    warningBorder: '#7c5a10',
    danger: '#f87171',
    dangerSoft: '#35191c',
    dangerBorder: '#7f1d1d',
    infoSoft: '#10233f',
    infoBorder: '#234876',
    secretSoft: '#1b2433',
    secretBorder: '#334155',
    secretText: '#d7e0ec',
    badgeSecretBg: '#1b2433',
    badgeSecretBorder: '#334155',
    badgeSecretText: '#d7e0ec',
    bannerInfoBg: '#10233f',
    bannerInfoBorder: '#234876',
    bannerWarningBg: '#2f240d',
    bannerWarningBorder: '#7c5a10',
    bannerDangerBg: '#35191c',
    bannerDangerBorder: '#7f1d1d',
    errorSurface: '#35191c',
    codeBg: '#060b16',
    codeText: '#e2e8f0',
    overlay: 'rgba(2, 6, 23, 0.72)',
  },
  shadow: {
    card: {
      shadowColor: '#020617',
      shadowOffset: {width: 0, height: 10},
      shadowOpacity: 0.28,
      shadowRadius: 20,
      elevation: 10,
    },
  },
  radius: sharedRadius,
  spacing: sharedSpacing,
};

export const appTheme = lightAppTheme;

const themeMap: Record<ThemeName, AppTheme> = {
  light: lightAppTheme,
  dark: darkAppTheme,
};

export function getTheme(themeName: ThemeName) {
  return themeMap[themeName];
}

export function createThemedStyles<T>(factory: (theme: AppTheme) => T) {
  const cache = new Map<ThemeName, T>();

  return (themeName: ThemeName) => {
    const cached = cache.get(themeName);

    if (cached) {
      return cached;
    }

    const nextStyles = factory(getTheme(themeName));
    cache.set(themeName, nextStyles);
    return nextStyles;
  };
}
