import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {appTheme} from '../../app/theme/tokens';
import {AppButton} from './AppButton';

interface AppErrorStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onRetry?: () => void;
}

export function AppErrorState({
  title = 'Something went wrong',
  description = 'Try again in a moment. If the problem keeps happening, pull to refresh or restart the app.',
  actionLabel = 'Try again',
  onRetry,
}: AppErrorStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <Text style={styles.iconText}>!</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {onRetry ? (
        <AppButton fullWidth={false} label={actionLabel} onPress={onRetry} variant="danger" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: appTheme.spacing.lg,
    paddingVertical: appTheme.spacing.xl,
    gap: appTheme.spacing.sm,
  },
  icon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fee2e2',
  },
  iconText: {
    color: appTheme.colors.danger,
    fontSize: 24,
    fontWeight: '800',
  },
  title: {
    color: appTheme.colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    color: appTheme.colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
});
