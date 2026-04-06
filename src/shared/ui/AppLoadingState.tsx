import React from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {appTheme} from '../../app/theme/tokens';

interface AppLoadingStateProps {
  label?: string;
  description?: string;
}

export function AppLoadingState({
  label = 'Loading',
  description = 'Fetching the latest data for this screen.',
}: AppLoadingStateProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={appTheme.colors.accent} size="large" />
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: appTheme.spacing.lg,
    paddingVertical: appTheme.spacing.xl,
    gap: appTheme.spacing.xs,
  },
  label: {
    color: appTheme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  description: {
    color: appTheme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
