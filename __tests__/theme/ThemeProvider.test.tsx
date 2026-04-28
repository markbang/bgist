import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ReactNative from 'react-native';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import {
  ThemeProvider,
  useAppTheme,
  useThemePreference,
} from '../../src/app/theme/context';
import { createThemedStyles } from '../../src/app/theme/tokens';

function ThemeProbe() {
  const theme = useAppTheme();
  const { colorMode, preset, resolvedScheme, setColorMode, setPreset } =
    useThemePreference();

  return (
    <>
      <ReactNative.Text>{`${colorMode}:${preset}:${resolvedScheme}:${theme.colors.canvas}`}</ReactNative.Text>
      <ReactNative.Pressable
        accessibilityRole="button"
        accessibilityLabel="set-dark"
        onPress={() => setColorMode('dark')}
      >
        <ReactNative.Text>Set dark</ReactNative.Text>
      </ReactNative.Pressable>
      <ReactNative.Pressable
        accessibilityRole="button"
        accessibilityLabel="set-light"
        onPress={() => setColorMode('light')}
      >
        <ReactNative.Text>Set light</ReactNative.Text>
      </ReactNative.Pressable>
      <ReactNative.Pressable
        accessibilityRole="button"
        accessibilityLabel="set-ocean"
        onPress={() => setPreset('ocean')}
      >
        <ReactNative.Text>Set ocean</ReactNative.Text>
      </ReactNative.Pressable>
    </>
  );
}

const getStyledProbeStyles = createThemedStyles(theme =>
  ReactNative.StyleSheet.create({
    box: {
      backgroundColor: theme.colors.surfaceMuted,
      borderColor: theme.colors.border,
      borderWidth: 1,
    },
  }),
);

function ThemeStyleProbe() {
  const { themeName } = useAppTheme();
  const styles = getStyledProbeStyles(themeName);
  const resolved = ReactNative.StyleSheet.flatten(styles.box);

  return (
    <ReactNative.Text>{`styled:${resolved.backgroundColor}:${resolved.borderColor}`}</ReactNative.Text>
  );
}

afterEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

test('persists the selected appearance mode and resolves the active theme', async () => {
  jest.spyOn(ReactNative, 'useColorScheme').mockReturnValue('dark');
  jest.spyOn(AsyncStorage, 'getItem').mockResolvedValue('system');
  const setItemSpy = jest.spyOn(AsyncStorage, 'setItem').mockResolvedValue();
  const setColorSchemeSpy = jest
    .spyOn(ReactNative.Appearance, 'setColorScheme')
    .mockImplementation(jest.fn());
  jest
    .spyOn(ReactNative.Appearance, 'addChangeListener')
    .mockReturnValue({ remove: jest.fn() } as never);

  render(
    <ThemeProvider>
      <ThemeProbe />
      <ThemeStyleProbe />
    </ThemeProvider>,
  );

  await waitFor(() => {
    expect(screen.getByText('system:default:dark:#0d1117')).toBeTruthy();
    expect(screen.getByText('styled:#21262d:#30363d')).toBeTruthy();
  });

  fireEvent.press(screen.getByRole('button', { name: 'set-light' }));

  await waitFor(() => {
    expect(screen.getByText('light:default:light:#f7f8fa')).toBeTruthy();
    expect(screen.getByText('styled:#f1f3f5:#d8dee4')).toBeTruthy();
  });

  fireEvent.press(screen.getByRole('button', { name: 'set-dark' }));

  await waitFor(() => {
    expect(screen.getByText('dark:default:dark:#0d1117')).toBeTruthy();
    expect(screen.getByText('styled:#21262d:#30363d')).toBeTruthy();
  });

  fireEvent.press(screen.getByRole('button', { name: 'set-ocean' }));

  await waitFor(() => {
    expect(screen.getByText('dark:ocean:dark:#09161b')).toBeTruthy();
    expect(screen.getByText('styled:#132a33:#284551')).toBeTruthy();
  });

  expect(setItemSpy).toHaveBeenCalledWith('app_theme_preference', 'dark');
  expect(setItemSpy).toHaveBeenCalledWith('app_theme_preset', 'ocean');
  expect(setColorSchemeSpy).toHaveBeenLastCalledWith('dark');
});
