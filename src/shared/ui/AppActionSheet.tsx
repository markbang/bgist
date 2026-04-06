import React from 'react';
import {
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {appTheme} from '../../app/theme/tokens';
import {AppButton} from './AppButton';

type AppActionSheetTone = 'default' | 'danger';

interface AppActionSheetOption {
  label: string;
  onPress: () => void;
  tone?: AppActionSheetTone;
  disabled?: boolean;
}

interface AppActionSheetProps {
  visible: boolean;
  title?: string;
  description?: string;
  options: AppActionSheetOption[];
  cancelLabel?: string;
  onClose: () => void;
}

export function AppActionSheet({
  visible,
  title,
  description,
  options,
  cancelLabel = 'Cancel',
  onClose,
}: AppActionSheetProps) {
  return (
    <Modal
      transparent
      animationType="fade"
      presentationStyle="overFullScreen"
      statusBarTranslucent
      visible={visible}
      onRequestClose={onClose}>
      <SafeAreaView style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View accessibilityViewIsModal style={styles.sheetWrap}>
          <View style={styles.sheet}>
            {title ? <Text style={styles.title}>{title}</Text> : null}
            {description ? <Text style={styles.description}>{description}</Text> : null}
            <View style={styles.options}>
              {options.map(option => (
                <Pressable
                  key={option.label}
                  accessibilityRole="button"
                  accessibilityLabel={option.label}
                  accessibilityState={{disabled: option.disabled}}
                  disabled={option.disabled}
                  onPress={() => {
                    option.onPress();
                    onClose();
                  }}
                  style={({pressed}) => [
                    styles.option,
                    pressed && !option.disabled ? styles.optionPressed : null,
                    option.disabled ? styles.optionDisabled : null,
                  ]}>
                  <Text
                    style={[
                      styles.optionLabel,
                      option.tone === 'danger' ? styles.optionLabelDanger : null,
                    ]}>
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <AppButton label={cancelLabel} onPress={onClose} variant="secondary" />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: appTheme.overlay.backdrop,
  },
  sheetWrap: {
    paddingHorizontal: appTheme.spacing.md,
    paddingBottom: appTheme.spacing.md,
  },
  sheet: {
    borderRadius: 28,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    backgroundColor: appTheme.colors.surface,
    padding: appTheme.spacing.md,
    gap: appTheme.spacing.md,
    ...appTheme.shadow.card,
  },
  title: {
    color: appTheme.colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  description: {
    color: appTheme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  options: {
    gap: appTheme.spacing.xs,
  },
  option: {
    minHeight: 52,
    borderRadius: appTheme.radius.md,
    borderCurve: 'continuous',
    backgroundColor: appTheme.colors.surfaceMuted,
    justifyContent: 'center',
    paddingHorizontal: appTheme.spacing.md,
  },
  optionPressed: {
    opacity: 0.88,
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionLabel: {
    color: appTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  optionLabelDanger: {
    color: appTheme.colors.danger,
  },
});
