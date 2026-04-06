import React from 'react';
import {StyleSheet, View, ViewProps} from 'react-native';
import {createThemedStyles} from '../../app/theme/tokens';
import {useAppTheme} from '../../app/theme/context';

export function AppCard({children, style, ...props}: ViewProps) {
  const {themeName} = useAppTheme();
  const styles = getStyles(themeName);

  return (
    <View {...props} style={[styles.card, style]}>
      {children}
    </View>
  );
}

const getStyles = createThemedStyles(theme =>
  StyleSheet.create({
    card: {
      borderRadius: theme.radius.lg,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      gap: theme.spacing.md,
      ...theme.shadow.card,
    },
  }),
);
