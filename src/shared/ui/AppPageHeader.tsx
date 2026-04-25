import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../../app/theme/context';
import { createThemedStyles } from '../../app/theme/tokens';

interface AppPageHeaderProps {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  accessory?: React.ReactNode;
  numberOfLines?: number;
}

export function AppPageHeader({
  title,
  eyebrow,
  subtitle,
  accessory,
  numberOfLines = 2,
}: AppPageHeaderProps) {
  const { themeName, themePreset } = useAppTheme();
  const styles = getStyles(themeName, themePreset);

  return (
    <View style={styles.header}>
      <View style={styles.row}>
        <View style={styles.copy}>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          <Text numberOfLines={numberOfLines} style={styles.title}>
            {title}
          </Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {accessory ? <View style={styles.accessory}>{accessory}</View> : null}
      </View>
    </View>
  );
}

const getStyles = createThemedStyles(theme =>
  StyleSheet.create({
    header: {
      gap: theme.spacing.sm,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
    },
    copy: {
      flex: 1,
      gap: theme.spacing.xs,
    },
    eyebrow: {
      color: theme.colors.accent,
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0,
      textTransform: 'uppercase',
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: 28,
      lineHeight: 33,
      fontWeight: '900',
      letterSpacing: 0,
    },
    subtitle: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
    },
    accessory: {
      flexShrink: 0,
      paddingTop: 2,
    },
  }),
);
