import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createThemedStyles } from '../../app/theme/tokens';
import { useAppTheme } from '../../app/theme/context';
import { AppButton } from './AppButton';

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
  const { themeName } = useAppTheme();
  const styles = getStyles(themeName);

  return (
    <Modal
      transparent
      animationType="fade"
      presentationStyle="overFullScreen"
      statusBarTranslucent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <SafeAreaView
          edges={['bottom', 'left', 'right']}
          style={styles.safeArea}
        >
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
                    style={({ pressed }) => [
                      styles.action,
                      pressed ? styles.actionPressed : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.actionLabel,
                        action.tone === 'danger'
                          ? styles.actionLabelDanger
                          : null,
                      ]}
                    >
                      {action.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <AppButton label="Cancel" onPress={onClose} variant="secondary" />
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const getStyles = createThemedStyles(theme =>
  StyleSheet.create({
    root: {
      flex: 1,
    },
    safeArea: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.colors.overlay,
    },
    sheetWrap: {
      paddingHorizontal: theme.spacing.sm,
      paddingBottom: theme.spacing.sm,
    },
    sheet: {
      borderRadius: theme.radius.md,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.sm,
      gap: theme.spacing.sm,
      ...theme.shadow.card,
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: 16,
      fontWeight: '700',
    },
    actions: {
      gap: theme.spacing.xs,
    },
    action: {
      minHeight: 42,
      borderRadius: theme.radius.sm,
      borderCurve: 'continuous',
      backgroundColor: theme.colors.surfaceMuted,
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.sm + 2,
    },
    actionPressed: {
      opacity: 0.88,
    },
    actionLabel: {
      color: theme.colors.textPrimary,
      fontSize: 14,
      fontWeight: '600',
    },
    actionLabelDanger: {
      color: theme.colors.danger,
    },
  }),
);
