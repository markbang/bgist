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
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
      paddingBottom: theme.spacing.sm,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
    },
    copy: {
      flex: 1,
      gap: theme.spacing.xs,
    },
    eyebrow: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0,
      textTransform: 'uppercase',
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: 18,
      lineHeight: 24,
      fontWeight: '800',
      letterSpacing: 0,
    },
    subtitle: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },
    accessory: {
      flexShrink: 0,
      paddingTop: 2,
    },
  }),
);
