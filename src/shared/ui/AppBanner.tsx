import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {appTheme} from '../../app/theme/tokens';

type AppBannerTone = 'info' | 'warning' | 'danger';

interface AppBannerProps {
  message: string;
  tone?: AppBannerTone;
}

const BANNER_TONES = {
  info: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    accentColor: appTheme.colors.accent,
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
  message,
  tone = 'info',
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
        <Text style={styles.message}>{message}</Text>
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
  },
  message: {
    color: appTheme.colors.textSecondary,
    fontSize: 15,
    lineHeight: 20,
  },
});
