import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { createThemedStyles } from '../../app/theme/tokens';
import { useAppTheme } from '../../app/theme/context';

type HeaderAction = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  testID?: string;
};

type GistMobileHeaderProps = {
  title: string;
  subtitle?: string;
  leftAction?: HeaderAction;
  rightAction?: HeaderAction;
  showMark?: boolean;
};

function HeaderActionButton({
  action,
  align,
}: {
  action?: HeaderAction;
  align: 'left' | 'right';
}) {
  const { theme, themeName, themePreset } = useAppTheme();
  const styles = getStyles(themeName, themePreset);

  if (!action) {
    return <View style={styles.sideSlot} />;
  }

  const isDisabled = action.disabled || action.loading;

  return (
    <Pressable
      accessibilityLabel={action.label}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: action.loading }}
      disabled={isDisabled}
      onPress={action.onPress}
      style={({ pressed }) => [
        styles.sideSlot,
        align === 'right' ? styles.sideSlotRight : null,
        pressed && !isDisabled ? styles.actionPressed : null,
        isDisabled ? styles.actionDisabled : null,
      ]}
      testID={action.testID}
    >
      {action.loading ? (
        <ActivityIndicator color={theme.colors.accent} size="small" />
      ) : (
        <Text
          numberOfLines={1}
          style={[
            styles.actionText,
            align === 'right' ? styles.actionTextRight : null,
          ]}
        >
          {action.label}
        </Text>
      )}
    </Pressable>
  );
}

export function GistMobileHeader({
  title,
  subtitle,
  leftAction,
  rightAction,
  showMark = false,
}: GistMobileHeaderProps) {
  const { themeName, themePreset } = useAppTheme();
  const styles = getStyles(themeName, themePreset);

  return (
    <View style={styles.header}>
      <HeaderActionButton action={leftAction} align="left" />
      <View style={styles.center}>
        <View style={styles.titleRow}>
          {showMark ? (
            <View style={styles.mark}>
              <Text style={styles.markText}>G</Text>
            </View>
          ) : null}
          <Text numberOfLines={1} style={styles.title}>
            {title}
          </Text>
        </View>
        {subtitle ? (
          <Text numberOfLines={1} style={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <HeaderActionButton action={rightAction} align="right" />
    </View>
  );
}

const getStyles = createThemedStyles(theme =>
  StyleSheet.create({
    header: {
      minHeight: 46,
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.canvas,
      paddingHorizontal: theme.spacing.xs,
    },
    sideSlot: {
      width: 74,
      minHeight: 44,
      alignItems: 'flex-start',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.xs,
    },
    sideSlotRight: {
      alignItems: 'flex-end',
    },
    center: {
      flex: 1,
      minWidth: 0,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 1,
    },
    titleRow: {
      maxWidth: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.xs,
    },
    mark: {
      width: 18,
      height: 18,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.textPrimary,
    },
    markText: {
      color: theme.colors.canvas,
      fontSize: 11,
      fontWeight: '900',
      lineHeight: 14,
    },
    title: {
      flexShrink: 1,
      color: theme.colors.textPrimary,
      fontSize: 14,
      lineHeight: 18,
      fontWeight: '800',
      textAlign: 'center',
      letterSpacing: 0,
    },
    subtitle: {
      maxWidth: '100%',
      color: theme.colors.textSecondary,
      fontSize: 11,
      lineHeight: 14,
      fontWeight: '600',
      textAlign: 'center',
    },
    actionText: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '700',
    },
    actionTextRight: {
      color: theme.colors.accent,
      fontWeight: '800',
    },
    actionPressed: {
      opacity: 0.72,
    },
    actionDisabled: {
      opacity: 0.45,
    },
  }),
);
