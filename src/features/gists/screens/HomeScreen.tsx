import React from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import {appTheme} from '../../../app/theme/tokens';
import {AppEmptyState} from '../../../shared/ui/AppEmptyState';
import {AppErrorState} from '../../../shared/ui/AppErrorState';
import {AppLoadingState} from '../../../shared/ui/AppLoadingState';
import {AppScreen} from '../../../shared/ui/AppScreen';
import {AppSegmentedControl} from '../../../shared/ui/AppSegmentedControl';
import {useI18n} from '../../../i18n/context';
import {GistCard} from '../components/GistCard';
import {type HomeFeedSegment, useHomeFeed} from '../hooks/useHomeFeed';

interface HomeScreenProps {
  navigation: {
    navigate: (name: string, params?: object) => void;
  };
}

export function HomeScreen({navigation}: HomeScreenProps) {
  const {t} = useI18n();
  const {segment, setSegment, items, isLoading, isError, refetch} = useHomeFeed();
  const segments = [
    {label: t('home.segmentMine'), value: 'my'},
    {label: t('home.segmentStarred'), value: 'starred'},
  ] satisfies {label: string; value: HomeFeedSegment}[];

  let content: React.ReactNode;

  if (isLoading) {
    content = (
      <AppLoadingState
        label={segment === 'my' ? t('home.loadingMine') : t('home.loadingStarred')}
        description={t('home.loadingDescription')}
      />
    );
  } else if (isError) {
    content = (
      <AppErrorState
        title={t('home.errorTitle')}
        description={t('home.errorDescription')}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  } else if (items.length === 0) {
    content = (
      <AppEmptyState
        badgeLabel={segment === 'my' ? t('home.badgeMine') : t('home.badgeStarred')}
        title={segment === 'my' ? t('home.emptyMineTitle') : t('home.emptyStarredTitle')}
        description={
          segment === 'my'
            ? t('home.emptyMineDescription')
            : t('home.emptyStarredDescription')
        }
      />
    );
  } else {
    content = (
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <GistCard
            gist={item}
            onPress={() => navigation.navigate('GistDetail', {gistId: item.id})}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    );
  }

  return (
    <AppScreen>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>{t('home.eyebrow')}</Text>
          <Text style={styles.title}>{t('home.title')}</Text>
          <Text style={styles.subtitle}>{t('home.subtitle')}</Text>
          <AppSegmentedControl options={segments} value={segment} onChange={setSegment} />
        </View>

        <View style={styles.content}>{content}</View>
      </View>
    </AppScreen>
  );
}

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: appTheme.spacing.md,
    paddingTop: appTheme.spacing.md,
    gap: appTheme.spacing.md,
  },
  header: {
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
  content: {
    flex: 1,
  },
  listContent: {
    paddingBottom: appTheme.spacing.xl,
    gap: appTheme.spacing.md,
  },
});
