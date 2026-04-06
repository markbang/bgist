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

interface AppButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  label: string;
  onPress?: () => void;
  variant?: AppButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
  accessibilityLabel,
  accessibilityRole,
  accessibilityState,
  ...pressableProps
}: AppButtonProps) {
  const {theme, themeName} = useAppTheme();
  const styles = getStyles(themeName);
  const isDisabled = disabled || loading;
  const buttonColors = {
    primary: {
      backgroundColor: theme.colors.accent,
      borderColor: theme.colors.accent,
      textColor: '#ffffff',
      spinnerColor: '#ffffff',
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

const getStyles = createThemedStyles(theme =>
  StyleSheet.create({
    button: {
      minHeight: 52,
      borderWidth: 1,
      borderRadius: theme.radius.md,
      borderCurve: 'continuous',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm + 2,
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
      gap: theme.spacing.sm,
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
  }),
);
