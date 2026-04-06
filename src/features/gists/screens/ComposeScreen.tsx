import React from 'react';
import {StyleSheet, View} from 'react-native';
import type {MainTabScreenProps} from '../../../app/navigation/types';
import {useAppTheme} from '../../../app/theme/context';
import {createThemedStyles} from '../../../app/theme/tokens';
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

const getStyles = createThemedStyles(theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.md,
      gap: theme.spacing.md,
    },
  }),
);
