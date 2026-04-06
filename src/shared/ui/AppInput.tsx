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
import {appTheme} from '../../app/theme/tokens';

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
  ...props
}: AppInputProps) {
  const message = errorMessage ?? helperText;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        {...props}
        editable={editable}
        multiline={multiline}
        placeholderTextColor={appTheme.colors.textSecondary}
        selectionColor={appTheme.colors.accent}
        style={[
          styles.input,
          multiline ? styles.inputMultiline : null,
          !editable ? styles.inputDisabled : null,
          errorMessage ? styles.inputError : null,
          style,
        ]}
      />
      {message ? (
        <Text style={[styles.message, errorMessage ? styles.messageError : null]}>
          {message}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: appTheme.spacing.xs,
  },
  label: {
    color: appTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    minHeight: 52,
    borderRadius: appTheme.radius.md,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    backgroundColor: appTheme.colors.surface,
    color: appTheme.colors.textPrimary,
    paddingHorizontal: appTheme.spacing.md,
    paddingVertical: appTheme.spacing.sm + 2,
    fontSize: 16,
  },
  inputMultiline: {
    minHeight: 120,
    paddingTop: appTheme.spacing.md,
    textAlignVertical: 'top',
  },
  inputDisabled: {
    backgroundColor: appTheme.colors.surfaceMuted,
    color: appTheme.colors.textSecondary,
  },
  inputError: {
    borderColor: appTheme.colors.danger,
  },
  message: {
    color: appTheme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  messageError: {
    color: appTheme.colors.danger,
  },
});
