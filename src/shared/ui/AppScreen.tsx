import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createThemedStyles } from '../../app/theme/tokens';
import { useAppTheme } from '../../app/theme/context';
import { AppReveal } from './AppReveal';

export function AppScreen({ children }: { children: React.ReactNode }) {
  const { themeName } = useAppTheme();
  const styles = getStyles(themeName);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View pointerEvents="none" style={styles.topBand} />
      <AppReveal style={styles.content}>{children}</AppReveal>
    </SafeAreaView>
  );
}

const getStyles = createThemedStyles(theme =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.canvas,
    },
    topBand: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 118,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      opacity: 0.58,
    },
    content: {
      flex: 1,
    },
  }),
);
