import React from 'react';
import {StyleSheet, View, ViewProps} from 'react-native';
import {appTheme} from '../../app/theme/tokens';

export function AppCard({children, style, ...props}: ViewProps) {
  return (
    <View {...props} style={[styles.card, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: appTheme.radius.lg,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    backgroundColor: appTheme.colors.surface,
    padding: appTheme.spacing.md,
    gap: appTheme.spacing.md,
    ...appTheme.shadow.card,
  },
});
