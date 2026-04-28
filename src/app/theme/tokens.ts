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
      shadowOffset: { width: number; height: number };
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
export type ThemePreset = 'default' | 'ocean' | 'forest' | 'sunset';

let activeThemePreset: ThemePreset = 'default';

const sharedRadius = {
  sm: 6,
  md: 8,
  lg: 12,
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
    canvas: '#f7f8fa',
    surface: '#ffffff',
    surfaceMuted: '#f1f3f5',
    border: '#d8dee4',
    textPrimary: '#101418',
    textSecondary: '#68717d',
    placeholder: '#8c959f',
    accent: '#0969da',
    accentSoft: '#ddf4ff',
    accentContrast: '#ffffff',
    success: '#047857',
    successSoft: '#daf8e7',
    warning: '#b45309',
    warningSoft: '#fff7df',
    warningBorder: '#f6df99',
    danger: '#dc2626',
    dangerSoft: '#fee2e2',
    dangerBorder: '#fecaca',
    infoSoft: '#eaf2ff',
    infoBorder: '#c4d7fb',
    secretSoft: '#f2f4f7',
    secretBorder: '#dfe4ec',
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
    codeBg: '#0a1020',
    codeText: '#edf3ff',
    overlay: 'rgba(8, 13, 27, 0.5)',
  },
  shadow: {
    card: {
      shadowColor: '#0f172a',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.02,
      shadowRadius: 3,
      elevation: 0,
    },
  },
  radius: sharedRadius,
  spacing: sharedSpacing,
};

export const darkAppTheme: AppTheme = {
  colors: {
    canvas: '#0d1117',
    surface: '#161b22',
    surfaceMuted: '#21262d',
    border: '#30363d',
    textPrimary: '#f0f6fc',
    textSecondary: '#8b949e',
    placeholder: '#6e7681',
    accent: '#58a6ff',
    accentSoft: '#10233a',
    accentContrast: '#06101a',
    success: '#57d364',
    successSoft: '#132619',
    warning: '#f2cc60',
    warningSoft: '#2d2410',
    warningBorder: '#5e4b1d',
    danger: '#ff7b72',
    dangerSoft: '#31191b',
    dangerBorder: '#6e2c2f',
    infoSoft: '#10233a',
    infoBorder: '#27435f',
    secretSoft: '#161f2a',
    secretBorder: '#303b48',
    secretText: '#c8d1da',
    badgeSecretBg: '#161f2a',
    badgeSecretBorder: '#303b48',
    badgeSecretText: '#c8d1da',
    bannerInfoBg: '#10233a',
    bannerInfoBorder: '#27435f',
    bannerWarningBg: '#2d2410',
    bannerWarningBorder: '#5e4b1d',
    bannerDangerBg: '#31191b',
    bannerDangerBorder: '#6e2c2f',
    errorSurface: '#31191b',
    codeBg: '#07111b',
    codeText: '#d6deeb',
    overlay: 'rgba(3, 7, 12, 0.78)',
  },
  shadow: {
    card: {
      shadowColor: '#020617',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
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

type ThemeOverride = Partial<AppTheme['colors']>;

const presetOverrides: Record<ThemePreset, Record<ThemeName, ThemeOverride>> = {
  default: {
    light: {},
    dark: {},
  },
  ocean: {
    light: {
      canvas: '#f1f8fb',
      surfaceMuted: '#e0eef4',
      border: '#c7dbe6',
      accent: '#0f766e',
      accentSoft: '#ccefeb',
      infoSoft: '#e0f2fe',
      infoBorder: '#bae6fd',
    },
    dark: {
      canvas: '#09161b',
      surface: '#102027',
      surfaceMuted: '#132a33',
      border: '#284551',
      accent: '#4fd1c5',
      accentSoft: '#12343b',
      accentContrast: '#062021',
      infoSoft: '#12343b',
      infoBorder: '#215865',
    },
  },
  forest: {
    light: {
      canvas: '#f4f8f2',
      surfaceMuted: '#e6efe2',
      border: '#cad8c1',
      accent: '#2f6f4f',
      accentSoft: '#dbeedf',
      success: '#2f6f4f',
      successSoft: '#dbeedf',
    },
    dark: {
      canvas: '#0d1510',
      surface: '#121d16',
      surfaceMuted: '#18261c',
      border: '#2d4232',
      accent: '#7cd992',
      accentSoft: '#18311f',
      accentContrast: '#0d190f',
      success: '#7cd992',
      successSoft: '#18311f',
    },
  },
  sunset: {
    light: {
      canvas: '#fbf6f1',
      surfaceMuted: '#f4e6db',
      border: '#e4cdb9',
      accent: '#c2612d',
      accentSoft: '#fde4d5',
      warning: '#c2612d',
      warningSoft: '#fff1e7',
    },
    dark: {
      canvas: '#16100d',
      surface: '#221813',
      surfaceMuted: '#2d1f18',
      border: '#493027',
      accent: '#f6a66f',
      accentSoft: '#3b2318',
      accentContrast: '#24150f',
      warning: '#f6a66f',
      warningSoft: '#3b2318',
    },
  },
};

export function getTheme(
  themeName: ThemeName,
  preset: ThemePreset = 'default',
) {
  activeThemePreset = preset;
  const baseTheme = themeMap[themeName];
  const overrides = presetOverrides[preset]?.[themeName] ?? {};

  if (Object.keys(overrides).length === 0) {
    return baseTheme;
  }

  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      ...overrides,
    },
  };
}

export function createThemedStyles<T>(factory: (theme: AppTheme) => T) {
  const cache = new Map<string, T>();

  return (themeName: ThemeName, preset: ThemePreset = activeThemePreset) => {
    const cacheKey = `${themeName}:${preset}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      return cached;
    }

    const nextStyles = factory(getTheme(themeName, preset));
    cache.set(cacheKey, nextStyles);
    return nextStyles;
  };
}
