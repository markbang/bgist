import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {createThemedStyles} from '../../app/theme/tokens';
import {useAppTheme} from '../../app/theme/context';

type AppBannerTone = 'info' | 'warning' | 'danger';

interface AppBannerProps {
  message: string;
  tone?: AppBannerTone;
}

export function AppBanner({
  message,
  tone = 'info',
}: AppBannerProps) {
  const {theme, themeName} = useAppTheme();
  const styles = getStyles(themeName);
  const colors = {
    info: {
      backgroundColor: theme.colors.infoSoft,
      borderColor: theme.colors.infoBorder,
      accentColor: theme.colors.accent,
    },
    warning: {
      backgroundColor: theme.colors.warningSoft,
      borderColor: theme.colors.warningBorder,
      accentColor: theme.colors.warning,
    },
    danger: {
      backgroundColor: theme.colors.dangerSoft,
      borderColor: theme.colors.dangerBorder,
      accentColor: theme.colors.danger,
    },
  }[tone];

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

const getStyles = createThemedStyles(theme =>
  StyleSheet.create({
    banner: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      borderRadius: theme.radius.lg,
      borderCurve: 'continuous',
      borderWidth: 1,
      padding: theme.spacing.md,
      gap: theme.spacing.md,
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
      color: theme.colors.textSecondary,
      fontSize: 15,
      lineHeight: 20,
    },
  }),
);
