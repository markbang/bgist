import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import type {MainTabScreenProps} from '../../../app/navigation/types';
import {useAppTheme} from '../../../app/theme/context';
import {createThemedStyles} from '../../../app/theme/tokens';
import {MaterialSymbolIcon} from '../../../components/TabIcons';
import {AppButton} from '../../../shared/ui/AppButton';
import {AppCard} from '../../../shared/ui/AppCard';
import {AppEmptyState} from '../../../shared/ui/AppEmptyState';
import {AppPageHeader} from '../../../shared/ui/AppPageHeader';
import {AppScreen} from '../../../shared/ui/AppScreen';
import {useI18n} from '../../../i18n/context';

export function ComposeScreen({navigation}: MainTabScreenProps<'Compose'>) {
  const {themeName} = useAppTheme();
  const {t} = useI18n();
  const styles = getStyles(themeName);

  return (
    <AppScreen>
      <View style={styles.container}>
        <AppPageHeader title={t('compose.title')} />

        <AppCard style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.heroIcon}>
              <MaterialSymbolIcon icon="add-circle" size={22} />
            </View>
            <View style={styles.heroCopy}>
              <Text style={styles.heroTitle}>{t('compose.emptyTitle')}</Text>
              <Text style={styles.heroDescription}>{t('compose.emptyDescription')}</Text>
            </View>
          </View>

          <View style={styles.heroMetrics}>
            <View style={styles.metricPill}>
              <Text style={styles.metricLabel}>{t('compose.badge')}</Text>
            </View>
            <View style={styles.metricPill}>
              <Text style={styles.metricLabel}>{t('compose.title')}</Text>
            </View>
          </View>

          <AppButton
            label={t('compose.cta')}
            onPress={() => navigation.navigate('GistEditor', {mode: 'create'})}
          />
        </AppCard>

        <AppEmptyState
          badgeLabel={t('compose.badge')}
          title={t('compose.emptyTitle')}
          description={t('compose.emptyDescription')}
        />
      </View>
    </AppScreen>
  );
}

export default ComposeScreen;

const getStyles = createThemedStyles(theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
    heroCard: {
      gap: theme.spacing.sm,
    },
    heroHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.sm,
    },
    heroIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroCopy: {
      flex: 1,
      gap: theme.spacing.xs,
    },
    heroTitle: {
      color: theme.colors.textPrimary,
      fontSize: 18,
      fontWeight: '800',
    },
    heroDescription: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
    },
    heroMetrics: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
    },
    metricPill: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceMuted,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },
    metricLabel: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      fontWeight: '700',
    },
  }),
);
