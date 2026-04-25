import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { createThemedStyles } from '../../app/theme/tokens';
import { useAppTheme } from '../../app/theme/context';

type AppBadgeTone = 'public' | 'secret';

interface AppBadgeProps {
  label: string;
  tone?: AppBadgeTone;
}

export function AppBadge({ label, tone = 'public' }: AppBadgeProps) {
  const { theme, themeName } = useAppTheme();
  const styles = getStyles(themeName);
  const colors = {
    public: {
      backgroundColor: theme.colors.accentSoft,
      borderColor: theme.colors.accentSoft,
      textColor: theme.colors.accent,
    },
    secret: {
      backgroundColor: theme.colors.secretSoft,
      borderColor: theme.colors.secretBorder,
      textColor: theme.colors.secretText,
    },
  }[tone];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.backgroundColor,
          borderColor: colors.borderColor,
        },
      ]}
    >
      <Text style={[styles.label, { color: colors.textColor }]}>{label}</Text>
    </View>
  );
}

const getStyles = createThemedStyles(() =>
  StyleSheet.create({
    badge: {
      alignSelf: 'flex-start',
      borderRadius: 999,
      borderWidth: 1,
      paddingHorizontal: 9,
      paddingVertical: 5,
    },
    label: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0,
      textTransform: 'uppercase',
    },
  }),
);
