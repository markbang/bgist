import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { createThemedStyles } from '../../app/theme/tokens';
import { useAppTheme } from '../../app/theme/context';

interface AppInputProps extends TextInputProps {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export function AppInput({
  label,
  helperText,
  errorMessage,
  containerStyle,
  editable = true,
  multiline = false,
  style,
  placeholderTextColor,
  selectionColor,
  accessibilityLabel,
  accessibilityHint,
  ...props
}: AppInputProps) {
  const { theme, themeName } = useAppTheme();
  const styles = getStyles(themeName);
  const message = errorMessage ?? helperText;
  const inputAccessibilityLabel =
    accessibilityLabel ?? label ?? props.placeholder;
  const inputAccessibilityHint = accessibilityHint ?? message;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        {...props}
        accessibilityHint={inputAccessibilityHint}
        accessibilityLabel={inputAccessibilityLabel}
        editable={editable}
        multiline={multiline}
        placeholderTextColor={
          placeholderTextColor ?? theme.colors.textSecondary
        }
        selectionColor={selectionColor ?? theme.colors.accent}
        style={[
          styles.input,
          multiline ? styles.inputMultiline : null,
          !editable ? styles.inputDisabled : null,
          errorMessage ? styles.inputError : null,
          style,
        ]}
      />
      {message ? (
        <Text
          style={[styles.message, errorMessage ? styles.messageError : null]}
        >
          {message}
        </Text>
      ) : null}
    </View>
  );
}

const getStyles = createThemedStyles(theme =>
  StyleSheet.create({
    container: {
      gap: theme.spacing.xs,
    },
    label: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0,
    },
    input: {
      minHeight: 38,
      borderRadius: theme.radius.sm,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      color: theme.colors.textPrimary,
      paddingHorizontal: theme.spacing.sm + 2,
      paddingVertical: theme.spacing.xs + 2,
      fontSize: 14,
      fontWeight: '500',
    },
    inputMultiline: {
      minHeight: 120,
      paddingTop: theme.spacing.sm,
      textAlignVertical: 'top',
    },
    inputDisabled: {
      backgroundColor: theme.colors.surfaceMuted,
      color: theme.colors.textSecondary,
    },
    inputError: {
      borderColor: theme.colors.danger,
    },
    message: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      lineHeight: 17,
    },
    messageError: {
      color: theme.colors.danger,
    },
  }),
);
