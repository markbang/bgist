import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {appTheme} from '../../app/theme/tokens';

type AppBadgeTone = 'public' | 'secret';

interface AppBadgeProps {
  label: string;
  tone?: AppBadgeTone;
}

const BADGE_TONES = {
  public: {
    backgroundColor: appTheme.colors.accentSoft,
    borderColor: appTheme.colors.accentSoft,
    textColor: appTheme.colors.accent,
  },
  secret: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
    textColor: '#374151',
  },
} as const;

export function AppBadge({label, tone = 'public'}: AppBadgeProps) {
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
