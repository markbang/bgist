import React from 'react';
import { FlatList, StyleSheet, type ListRenderItem, View } from 'react-native';
import { useAppTheme } from '../../../app/theme/context';
import { createThemedStyles } from '../../../app/theme/tokens';
import { AppEmptyState } from '../../../shared/ui/AppEmptyState';
import { AppErrorState } from '../../../shared/ui/AppErrorState';
import { AppLoadingState } from '../../../shared/ui/AppLoadingState';
import { AppPageHeader } from '../../../shared/ui/AppPageHeader';
import { AppScreen } from '../../../shared/ui/AppScreen';
import { AppSegmentedControl } from '../../../shared/ui/AppSegmentedControl';
import { appFeedListProps } from '../../../shared/ui/listPresets';
import { useI18n } from '../../../i18n/context';
import type { Gist } from '../../../types/gist';
import { GistCard } from '../components/GistCard';
import { type HomeFeedSegment, useHomeFeed } from '../hooks/useHomeFeed';

interface HomeScreenProps {
  navigation: {
    navigate: (name: string, params?: object) => void;
  };
}

export function HomeScreen({ navigation }: HomeScreenProps) {
  const { themeName } = useAppTheme();
  const { t } = useI18n();
  const styles = getStyles(themeName);
  const [isSegmentPending, startSegmentTransition] = React.useTransition();
  const {
    segment,
    setSegment,
    items,
    isLoading,
    isRefreshing,
    isError,
    refetch,
  } = useHomeFeed();
  const segments = React.useMemo(
    () =>
      [
        { label: t('home.segmentMine'), value: 'my' },
        { label: t('home.segmentStarred'), value: 'starred' },
      ] satisfies { label: string; value: HomeFeedSegment }[],
    [t],
  );
  const keyExtractor = React.useCallback((item: Gist) => item.id, []);
  const handleOpenGist = React.useCallback(
    (gistId: string) => {
      navigation.navigate('GistDetail', { gistId });
    },
    [navigation],
  );
  const renderItem = React.useCallback<ListRenderItem<Gist>>(
    ({ item }) => <GistCard gist={item} onPressGist={handleOpenGist} />,
    [handleOpenGist],
  );
  const handleRefresh = React.useCallback(() => {
    refetch();
  }, [refetch]);
  const handleSegmentChange = React.useCallback(
    (nextSegment: HomeFeedSegment) => {
      startSegmentTransition(() => {
        setSegment(nextSegment);
      });
    },
    [setSegment],
  );

  let content: React.ReactNode;

  if (isLoading) {
    content = (
      <AppLoadingState
        label={
          segment === 'my' ? t('home.loadingMine') : t('home.loadingStarred')
        }
        description={t('home.loadingDescription')}
      />
    );
  } else if (isError) {
    content = (
      <AppErrorState
        title={t('home.errorTitle')}
        description={t('home.errorDescription')}
        onRetry={() => {
          refetch();
        }}
      />
    );
  } else if (items.length === 0) {
    content = (
      <AppEmptyState
        badgeLabel={
          segment === 'my' ? t('home.badgeMine') : t('home.badgeStarred')
        }
        title={
          segment === 'my'
            ? t('home.emptyMineTitle')
            : t('home.emptyStarredTitle')
        }
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
        {...appFeedListProps}
        testID="home-feed-list"
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    );
  }

  return (
    <AppScreen>
      <View style={styles.container}>
        <View style={styles.header}>
          <AppPageHeader
            eyebrow={t('home.eyebrow')}
            title={t('home.title')}
            subtitle={t('home.subtitle')}
          />
          <AppSegmentedControl
            options={segments}
            value={segment}
            onChange={handleSegmentChange}
            disabled={isSegmentPending}
          />
        </View>

        <View style={styles.content}>{content}</View>
      </View>
    </AppScreen>
  );
}

export default HomeScreen;

const getStyles = createThemedStyles(theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.md,
      gap: theme.spacing.md,
    },
    header: {
      gap: theme.spacing.md,
    },
    content: {
      flex: 1,
    },
    listContent: {
      paddingBottom: theme.spacing.xl,
      gap: 0,
    },
  }),
);
