import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { createThemedStyles } from '../../app/theme/tokens';
import { useAppTheme } from '../../app/theme/context';
import { MaterialSymbolIcon } from '../../components/TabIcons';
import { AppBadge } from './AppBadge';
import { AppButton } from './AppButton';

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
  const { themeName } = useAppTheme();
  const styles = getStyles(themeName);

  return (
    <View style={styles.container}>
      <View style={styles.panel}>
        <View style={styles.iconWrap}>
          <MaterialSymbolIcon icon="description-outline-rounded" size={18} />
        </View>
        {badgeLabel ? <AppBadge label={badgeLabel} tone="public" /> : null}
        <Text style={styles.title}>{title}</Text>
        {description ? (
          <Text style={styles.description}>{description}</Text>
        ) : null}
      </View>
      {actionLabel && onAction ? (
        <AppButton
          fullWidth={false}
          label={actionLabel}
          onPress={onAction}
          size="compact"
          variant="secondary"
        />
      ) : null}
    </View>
  );
}

const getStyles = createThemedStyles(theme =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      gap: theme.spacing.xs + 2,
    },
    panel: {
      width: '100%',
      maxWidth: 360,
      alignItems: 'center',
      gap: theme.spacing.xs + 2,
      borderRadius: theme.radius.sm,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.sm + 2,
      paddingVertical: theme.spacing.sm + 2,
    },
    iconWrap: {
      width: 32,
      height: 32,
      borderRadius: theme.radius.sm,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: 15,
      fontWeight: '800',
      textAlign: 'center',
    },
    description: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      lineHeight: 17,
      textAlign: 'center',
    },
  }),
);
