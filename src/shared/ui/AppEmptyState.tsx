import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {appTheme} from '../../app/theme/tokens';
import {AppBadge} from './AppBadge';
import {AppButton} from './AppButton';

interface AppEmptyStateProps {
  title: string;
  description?: string;
  badgeLabel?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function AppEmptyState({
  title,
  description,
  badgeLabel,
  actionLabel,
  onAction,
}: AppEmptyStateProps) {
  return (
    <View style={styles.container}>
      {badgeLabel ? <AppBadge label={badgeLabel} tone="accent" /> : null}
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {actionLabel && onAction ? (
        <AppButton fullWidth={false} label={actionLabel} onPress={onAction} variant="secondary" />
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
