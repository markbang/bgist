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
      <ActivityIndicator color={theme.colors.accent} size="large" />
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const getStyles = createThemedStyles(theme =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xl,
      gap: theme.spacing.xs,
    },
    label: {
      color: theme.colors.textPrimary,
      fontSize: 18,
      fontWeight: '700',
    },
    description: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
      textAlign: 'center',
    },
  }),
);
