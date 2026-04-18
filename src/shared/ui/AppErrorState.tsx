import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {createThemedStyles} from '../../app/theme/tokens';
import {useAppTheme} from '../../app/theme/context';
import {AppButton} from './AppButton';

interface AppErrorStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onRetry?: () => void;
}

export function AppErrorState({
  title = 'Something went wrong',
  description = 'Try again in a moment. If the problem keeps happening, pull to refresh or restart the app.',
  actionLabel = 'Try again',
  onRetry,
}: AppErrorStateProps) {
  const {themeName} = useAppTheme();
  const styles = getStyles(themeName);

  return (
    <View style={styles.container}>
      <View style={styles.panel}>
        <View style={styles.icon}>
          <Text style={styles.iconText}>!</Text>
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      {onRetry ? (
        <AppButton fullWidth={false} label={actionLabel} onPress={onRetry} variant="danger" />
      ) : null}
    </View>
  );
}

const getStyles = createThemedStyles(theme =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.lg,
      gap: theme.spacing.xs + 2,
    },
    panel: {
      width: '100%',
      maxWidth: 340,
      alignItems: 'center',
      gap: theme.spacing.xs + 2,
      borderRadius: theme.radius.md,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.dangerBorder,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.sm + 2,
      paddingVertical: theme.spacing.sm + 2,
    },
    icon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      borderCurve: 'continuous',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.dangerSoft,
    },
    iconText: {
      color: theme.colors.danger,
      fontSize: 18,
      fontWeight: '800',
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: 17,
      fontWeight: '800',
      textAlign: 'center',
    },
    description: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
      textAlign: 'center',
    },
  }),
);
