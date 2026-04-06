import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import type {MainTabScreenProps} from '../../../app/navigation/types';
import {appTheme} from '../../../app/theme/tokens';
import {AppButton} from '../../../shared/ui/AppButton';
import {AppCard} from '../../../shared/ui/AppCard';
import {AppEmptyState} from '../../../shared/ui/AppEmptyState';
import {AppScreen} from '../../../shared/ui/AppScreen';
import {useI18n} from '../../../i18n/context';

export function ComposeScreen({navigation}: MainTabScreenProps<'Compose'>) {
  const {t} = useI18n();

  return (
    <AppScreen>
      <View style={styles.container}>
        <Text style={styles.eyebrow}>{t('compose.eyebrow')}</Text>
        <Text style={styles.title}>{t('compose.title')}</Text>
        <Text style={styles.subtitle}>{t('compose.subtitle')}</Text>

        <AppButton
          label={t('compose.cta')}
          onPress={() => navigation.navigate('GistEditor', {mode: 'create'})}
        />

        <AppCard>
          <AppEmptyState
            badgeLabel={t('compose.badge')}
            title={t('compose.emptyTitle')}
            description={t('compose.emptyDescription')}
          />
        </AppCard>
      </View>
    </AppScreen>
  );
}

export default ComposeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: appTheme.spacing.md,
    paddingTop: appTheme.spacing.md,
    gap: appTheme.spacing.sm,
  },
  eyebrow: {
    color: appTheme.colors.accent,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  title: {
    color: appTheme.colors.textPrimary,
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    color: appTheme.colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
});
