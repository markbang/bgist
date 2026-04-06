import React from 'react';
import {StyleProp, StyleSheet, Text, View, ViewStyle} from 'react-native';
import {appTheme} from '../../app/theme/tokens';

interface AppCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function AppCard({children, title, subtitle, footer, style}: AppCardProps) {
  const hasHeader = Boolean(title || subtitle);

  return (
    <View style={[styles.card, style]}>
      {hasHeader ? (
        <View style={styles.header}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      ) : null}
      <View style={styles.body}>{children}</View>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: appTheme.radius.lg,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    backgroundColor: appTheme.colors.surface,
    padding: appTheme.spacing.md,
    gap: appTheme.spacing.md,
    ...appTheme.shadow.card,
  },
  header: {
    gap: appTheme.spacing.xs,
  },
  title: {
    color: appTheme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    color: appTheme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  body: {
    gap: appTheme.spacing.md,
  },
  footer: {
    paddingTop: appTheme.spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: appTheme.colors.border,
  },
});
