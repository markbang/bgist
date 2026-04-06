import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import {appTheme} from '../../app/theme/tokens';

type AppButtonVariant = 'primary' | 'secondary' | 'danger';

interface AppButtonProps {
  label: string;
  onPress?: () => void;
  variant?: AppButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

const BUTTON_VARIANTS = {
  primary: {
    backgroundColor: appTheme.colors.accent,
    borderColor: appTheme.colors.accent,
    textColor: '#ffffff',
    spinnerColor: '#ffffff',
  },
  secondary: {
    backgroundColor: appTheme.colors.surface,
    borderColor: appTheme.colors.border,
    textColor: appTheme.colors.textPrimary,
    spinnerColor: appTheme.colors.accent,
  },
  danger: {
    backgroundColor: appTheme.colors.danger,
    borderColor: appTheme.colors.danger,
    textColor: '#ffffff',
    spinnerColor: '#ffffff',
  },
} as const;

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
}: AppButtonProps) {
  const isDisabled = disabled || loading;
  const buttonColors = BUTTON_VARIANTS[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{disabled: isDisabled, busy: loading}}
      disabled={isDisabled}
      onPress={onPress}
      style={({pressed}) => [
        styles.button,
        fullWidth ? styles.fullWidth : styles.autoWidth,
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
        <Text style={[styles.label, {color: buttonColors.textColor}]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: appTheme.radius.md,
    borderCurve: 'continuous',
    paddingHorizontal: appTheme.spacing.md,
    paddingVertical: appTheme.spacing.sm + 2,
    justifyContent: 'center',
    alignItems: 'center',
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
    gap: appTheme.spacing.sm,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{scale: 0.98}],
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
