import React from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {createThemedStyles} from '../../app/theme/tokens';
import {useAppTheme} from '../../app/theme/context';

interface AppLoadingStateProps {
  label?: string;
  description?: string;
}

export function AppLoadingState({
  label = 'Loading',
  description = 'Fetching the latest data for this screen.',
}: AppLoadingStateProps) {
  const {theme, themeName} = useAppTheme();
  const styles = getStyles(themeName);

  return (
    <View style={styles.container}>
      <View style={styles.panel}>
        <View style={styles.spinnerWrap}>
          <ActivityIndicator color={theme.colors.accent} size="small" />
        </View>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
}

const getStyles = createThemedStyles(theme =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.lg,
      gap: theme.spacing.xs,
    },
    panel: {
      width: '100%',
      maxWidth: 340,
      alignItems: 'center',
      gap: theme.spacing.xs,
      borderRadius: theme.radius.md,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.sm + 2,
      paddingVertical: theme.spacing.sm + 2,
    },
    spinnerWrap: {
      width: 36,
      height: 36,
      borderRadius: 10,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      color: theme.colors.textPrimary,
      fontSize: 16,
      fontWeight: '800',
    },
    description: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
      textAlign: 'center',
    },
  }),
);
