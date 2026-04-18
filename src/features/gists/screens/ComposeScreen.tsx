import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import type {MainTabScreenProps} from '../../../app/navigation/types';
import {createThemedStyles} from '../../../app/theme/tokens';
import {useAppTheme} from '../../../app/theme/context';
import {MaterialSymbolIcon} from '../../../components/TabIcons';
import {useI18n} from '../../../i18n/context';
import {AppBadge} from '../../../shared/ui/AppBadge';
import {AppButton} from '../../../shared/ui/AppButton';
import {AppCard} from '../../../shared/ui/AppCard';
import {AppEmptyState} from '../../../shared/ui/AppEmptyState';
import {AppPageHeader} from '../../../shared/ui/AppPageHeader';
import {AppScreen} from '../../../shared/ui/AppScreen';

function ComposeDetail({title, description}: {title: string; description: string}) {
  const {themeName} = useAppTheme();
  const styles = getStyles(themeName);

  return (
    <View style={styles.detailTile}>
      <Text style={styles.detailTitle}>{title}</Text>
      <Text style={styles.detailDescription}>{description}</Text>
    </View>
  );
}

export function ComposeScreen({navigation}: MainTabScreenProps<'Compose'>) {
  const {themeName} = useAppTheme();
  const {t} = useI18n();
  const styles = getStyles(themeName);
  const handleCreate = React.useCallback(() => {
    navigation.navigate('GistEditor', {mode: 'create'});
  }, [navigation]);

  return (
    <AppScreen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <AppPageHeader
            title={t('compose.title')}
            accessory={<AppBadge label={t('compose.badge')} tone="public" />}
          />
          <Text style={styles.subtitle}>{t('compose.subtitle')}</Text>
        </View>

        <AppCard style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.heroIcon}>
              <MaterialSymbolIcon icon="add-circle" size={22} />
            </View>
            <View style={styles.heroCopy}>
              <AppBadge label={t('compose.eyebrow')} tone="public" />
              <Text style={styles.heroTitle}>{t('compose.emptyTitle')}</Text>
              <Text style={styles.heroDescription}>{t('compose.emptyDescription')}</Text>
            </View>
          </View>

          <View style={styles.detailsGrid}>
            <ComposeDetail title={t('compose.badge')} description={t('compose.subtitle')} />
            <ComposeDetail title={t('compose.title')} description={t('compose.emptyDescription')} />
          </View>

          <AppButton label={t('compose.cta')} onPress={handleCreate} />
        </AppCard>

        <AppEmptyState
          badgeLabel={t('compose.badge')}
          title={t('compose.emptyTitle')}
          description={t('compose.emptyDescription')}
        />
      </ScrollView>
    </AppScreen>
  );
}

export default ComposeScreen;

const getStyles = createThemedStyles(theme =>
  StyleSheet.create({
    content: {
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    header: {
      gap: theme.spacing.xs,
    },
    subtitle: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
    },
    heroCard: {
      gap: theme.spacing.md,
    },
    heroHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.sm,
    },
    heroIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
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
      fontSize: 20,
      fontWeight: '800',
    },
    heroDescription: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
    },
    detailsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    detailTile: {
      flexGrow: 1,
      minWidth: '47%',
      borderRadius: theme.radius.md,
      borderCurve: 'continuous',
      backgroundColor: theme.colors.surfaceMuted,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
      gap: theme.spacing.xs,
    },
    detailTitle: {
      color: theme.colors.textPrimary,
      fontSize: 14,
      fontWeight: '700',
    },
    detailDescription: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },
  }),
);
