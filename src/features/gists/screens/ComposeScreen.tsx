import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { MainTabScreenProps } from '../../../app/navigation/types';
import { createThemedStyles } from '../../../app/theme/tokens';
import { useAppTheme } from '../../../app/theme/context';
import { MaterialSymbolIcon } from '../../../components/TabIcons';
import { useI18n } from '../../../i18n/context';
import { AppButton } from '../../../shared/ui/AppButton';
import { AppScreen } from '../../../shared/ui/AppScreen';
import { GistMobileHeader } from '../../../shared/ui/GistMobileHeader';

function ComposeRow({
  icon,
  title,
  description,
}: {
  icon: React.ComponentProps<typeof MaterialSymbolIcon>['icon'];
  title: string;
  description: string;
}) {
  const { themeName } = useAppTheme();
  const styles = getStyles(themeName);

  return (
    <View style={styles.composeRow}>
      <View style={styles.composeRowIcon}>
        <MaterialSymbolIcon icon={icon} size={18} />
      </View>
      <View style={styles.composeRowCopy}>
        <Text style={styles.composeRowTitle}>{title}</Text>
        <Text style={styles.composeRowDescription}>{description}</Text>
      </View>
    </View>
  );
}

export function ComposeScreen({ navigation }: MainTabScreenProps<'Compose'>) {
  const { themeName } = useAppTheme();
  const { t } = useI18n();
  const styles = getStyles(themeName);
  const handleCreate = React.useCallback(() => {
    navigation.navigate('GistEditor', { mode: 'create' });
  }, [navigation]);

  return (
    <AppScreen>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <GistMobileHeader
          leftAction={{
            label: 'x',
            onPress: () => navigation.navigate('Home'),
          }}
          rightAction={{
            label: '+',
            onPress: handleCreate,
          }}
          showMark
          title="Gist"
        />

        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>{t('compose.title')}</Text>
            <Text style={styles.panelDescription}>{t('compose.subtitle')}</Text>
          </View>

          <View style={styles.composeList}>
            <ComposeRow
              icon="description-outline-rounded"
              title={t('compose.badge')}
              description={t('compose.subtitle')}
            />
            <ComposeRow
              icon="lock-rounded"
              title={t('compose.title')}
              description={t('compose.emptyDescription')}
            />
          </View>

          <AppButton
            icon="add-circle-outline-rounded"
            label={t('compose.cta')}
            onPress={handleCreate}
            style={styles.primaryAction}
          />
        </View>
      </ScrollView>
    </AppScreen>
  );
}

export default ComposeScreen;

const getStyles = createThemedStyles(theme =>
  StyleSheet.create({
    content: {
      paddingHorizontal: theme.spacing.sm,
      paddingTop: 0,
      paddingBottom: theme.spacing.xl,
      gap: theme.spacing.sm,
    },
    panel: {
      borderRadius: theme.radius.sm,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      overflow: 'hidden',
    },
    panelHeader: {
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.sm,
      gap: theme.spacing.xs,
    },
    panelTitle: {
      color: theme.colors.textPrimary,
      fontSize: 17,
      lineHeight: 23,
      fontWeight: '800',
      letterSpacing: 0,
    },
    panelDescription: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },
    composeList: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
    },
    composeRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    composeRowIcon: {
      width: 26,
      alignItems: 'center',
      paddingTop: 1,
    },
    composeRowCopy: {
      flex: 1,
      gap: 2,
    },
    composeRowTitle: {
      color: theme.colors.textPrimary,
      fontSize: 14,
      fontWeight: '700',
    },
    composeRowDescription: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      lineHeight: 17,
    },
    primaryAction: {
      margin: theme.spacing.sm,
    },
  }),
);
