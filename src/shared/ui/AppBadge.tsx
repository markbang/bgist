import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {appTheme} from '../../app/theme/tokens';

type AppBadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

interface AppBadgeProps {
  label: string;
  tone?: AppBadgeTone;
}

const BADGE_TONES = {
  neutral: {
    backgroundColor: appTheme.colors.surfaceMuted,
    borderColor: appTheme.colors.border,
    textColor: appTheme.colors.textSecondary,
  },
  accent: {
    backgroundColor: appTheme.colors.accentSoft,
    borderColor: appTheme.colors.accentSoft,
    textColor: appTheme.colors.accent,
  },
  success: {
    backgroundColor: '#dff8ee',
    borderColor: '#b8edd7',
    textColor: appTheme.colors.success,
  },
  warning: {
    backgroundColor: '#fef3c7',
    borderColor: '#fde68a',
    textColor: appTheme.colors.warning,
  },
  danger: {
    backgroundColor: '#fee2e2',
    borderColor: '#fecaca',
    textColor: appTheme.colors.danger,
  },
} as const;

export function AppBadge({label, tone = 'neutral'}: AppBadgeProps) {
  const colors = BADGE_TONES[tone];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.backgroundColor,
          borderColor: colors.borderColor,
        },
      ]}>
      <Text style={[styles.label, {color: colors.textColor}]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});
