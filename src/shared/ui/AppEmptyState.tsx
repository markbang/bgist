import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {createThemedStyles} from '../../app/theme/tokens';
import {useAppTheme} from '../../app/theme/context';
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
  const {themeName} = useAppTheme();
  const styles = getStyles(themeName);

  return (
    <View style={styles.container}>
      {badgeLabel ? <AppBadge label={badgeLabel} tone="public" /> : null}
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {actionLabel && onAction ? (
        <AppButton fullWidth={false} label={actionLabel} onPress={onAction} variant="secondary" />
      ) : null}
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
      gap: theme.spacing.sm,
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: 22,
      fontWeight: '700',
      textAlign: 'center',
    },
    description: {
      color: theme.colors.textSecondary,
      fontSize: 15,
      lineHeight: 22,
      textAlign: 'center',
    },
  }),
);
