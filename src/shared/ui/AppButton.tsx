import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import {createThemedStyles} from '../../app/theme/tokens';
import {useAppTheme} from '../../app/theme/context';

type AppButtonVariant = 'primary' | 'secondary' | 'danger';
type AppButtonSize = 'default' | 'compact';

interface AppButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  label: string;
  onPress?: () => void;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  size = 'default',
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
  accessibilityLabel,
  accessibilityRole,
  accessibilityState,
  ...pressableProps
}: AppButtonProps) {
  const {theme, themeName, themePreset} = useAppTheme();
  const styles = getStyles(themeName, themePreset);
  const isDisabled = disabled || loading;
  const buttonColors = {
    primary: {
      backgroundColor: theme.colors.accent,
      borderColor: theme.colors.accent,
      textColor: theme.colors.accentContrast,
      spinnerColor: theme.colors.accentContrast,
    },
    secondary: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      textColor: theme.colors.textPrimary,
      spinnerColor: theme.colors.accent,
    },
    danger: {
      backgroundColor: theme.colors.danger,
      borderColor: theme.colors.danger,
      textColor: '#ffffff',
      spinnerColor: '#ffffff',
    },
  }[variant];

  return (
    <Pressable
      {...pressableProps}
      accessibilityRole={accessibilityRole ?? 'button'}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{
        ...accessibilityState,
        disabled: isDisabled,
        busy: loading,
      }}
      disabled={isDisabled}
      onPress={onPress}
      style={({pressed}) => [
        styles.buttonBase,
        fullWidth ? styles.fullWidth : styles.autoWidth,
        size === 'compact' ? styles.buttonCompact : styles.buttonDefault,
        {
          backgroundColor: buttonColors.backgroundColor,
          borderColor: buttonColors.borderColor,
        },
        pressed && !isDisabled ? styles.buttonPressed : null,
        isDisabled ? styles.buttonDisabled : null,
        style,
      ]}>
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={buttonColors.spinnerColor} size="small" />
        ) : null}
        <Text
          style={[
            styles.labelBase,
            size === 'compact' ? styles.labelCompact : styles.labelDefault,
            {color: buttonColors.textColor},
          ]}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const getStyles = createThemedStyles(theme =>
  StyleSheet.create({
    buttonBase: {
      borderWidth: 1,
      borderRadius: theme.radius.md,
      borderCurve: 'continuous',
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonDefault: {
      minHeight: 48,
      paddingHorizontal: theme.spacing.md + 2,
      paddingVertical: theme.spacing.sm + 1,
    },
    buttonCompact: {
      minHeight: 40,
      paddingHorizontal: theme.spacing.sm + 4,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radius.sm,
    },
    fullWidth: {
      alignSelf: 'stretch',
    },
    autoWidth: {
      alignSelf: 'flex-start',
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.xs + 2,
    },
    labelBase: {
      fontWeight: '700',
      letterSpacing: 0,
    },
    labelDefault: {
      fontSize: 15,
    },
    labelCompact: {
      fontSize: 13,
    },
    buttonPressed: {
      opacity: 0.9,
      transform: [{scale: 0.98}],
    },
    buttonDisabled: {
      opacity: 0.6,
    },
  }),
);
