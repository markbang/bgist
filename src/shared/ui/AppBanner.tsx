import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {appTheme} from '../../app/theme/tokens';

type AppBannerTone = 'info' | 'success' | 'warning' | 'danger';

interface AppBannerProps {
  title: string;
  description?: string;
  tone?: AppBannerTone;
  actionLabel?: string;
  onAction?: () => void;
}

const BANNER_TONES = {
  info: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    accentColor: appTheme.colors.accent,
  },
  success: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    accentColor: appTheme.colors.success,
  },
  warning: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
    accentColor: appTheme.colors.warning,
  },
  danger: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    accentColor: appTheme.colors.danger,
  },
} as const;

export function AppBanner({
  title,
  description,
  tone = 'info',
  actionLabel,
  onAction,
}: AppBannerProps) {
  const colors = BANNER_TONES[tone];

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: colors.backgroundColor,
          borderColor: colors.borderColor,
        },
      ]}>
      <View style={[styles.accent, {backgroundColor: colors.accentColor}]} />
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
        {actionLabel && onAction ? (
          <Pressable accessibilityRole="button" onPress={onAction} style={styles.action}>
            <Text style={[styles.actionLabel, {color: colors.accentColor}]}>
              {actionLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: appTheme.radius.lg,
    borderCurve: 'continuous',
    borderWidth: 1,
    padding: appTheme.spacing.md,
    gap: appTheme.spacing.md,
  },
  accent: {
    width: 6,
    alignSelf: 'stretch',
    borderRadius: 999,
  },
  content: {
    flex: 1,
    gap: appTheme.spacing.xs,
  },
  title: {
    color: appTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  description: {
    color: appTheme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  action: {
    alignSelf: 'flex-start',
    marginTop: appTheme.spacing.xs,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
});
