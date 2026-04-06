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

interface AppActionSheetAction {
  label: string;
  onPress: () => void;
  tone?: AppActionSheetTone;
}

interface AppActionSheetProps {
  visible: boolean;
  title?: string;
  actions: AppActionSheetAction[];
  onClose: () => void;
}

export function AppActionSheet({
  visible,
  title,
  actions,
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
            <View style={styles.actions}>
              {actions.map(action => (
                <Pressable
                  key={action.label}
                  accessibilityRole="button"
                  accessibilityLabel={action.label}
                  onPress={() => {
                    action.onPress();
                    onClose();
                  }}
                  style={({pressed}) => [
                    styles.action,
                    pressed ? styles.actionPressed : null,
                  ]}>
                  <Text
                    style={[
                      styles.actionLabel,
                      action.tone === 'danger' ? styles.actionLabelDanger : null,
                    ]}>
                    {action.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <AppButton label="Cancel" onPress={onClose} variant="secondary" />
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
    backgroundColor: appTheme.colors.overlay,
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
  actions: {
    gap: appTheme.spacing.xs,
  },
  action: {
    minHeight: 52,
    borderRadius: appTheme.radius.md,
    borderCurve: 'continuous',
    backgroundColor: appTheme.colors.surfaceMuted,
    justifyContent: 'center',
    paddingHorizontal: appTheme.spacing.md,
  },
  actionPressed: {
    opacity: 0.88,
  },
  actionLabel: {
    color: appTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  actionLabelDanger: {
    color: appTheme.colors.danger,
  },
});
