import React from 'react';
import {StyleSheet, View, ViewProps} from 'react-native';
import {createThemedStyles} from '../../app/theme/tokens';
import {useAppTheme} from '../../app/theme/context';

export function AppCard({children, style, ...props}: ViewProps) {
  const {themeName, themePreset} = useAppTheme();
  const styles = getStyles(themeName, themePreset);

  return (
    <View {...props} style={[styles.card, style]}>
      {children}
    </View>
  );
}

const getStyles = createThemedStyles(theme =>
  StyleSheet.create({
    card: {
      borderRadius: theme.radius.md,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm + 2,
      gap: theme.spacing.sm + 2,
      ...theme.shadow.card,
    },
  }),
);
