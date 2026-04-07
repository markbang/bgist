import React from 'react';
import {FlatList, StyleSheet, type ListRenderItem, View} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import {useAppTheme} from '../../../app/theme/context';
import {createThemedStyles} from '../../../app/theme/tokens';
import {queryKeys} from '../../../shared/api/queryKeys';
import {AppEmptyState} from '../../../shared/ui/AppEmptyState';
import {AppErrorState} from '../../../shared/ui/AppErrorState';
import {AppInput} from '../../../shared/ui/AppInput';
import {AppLoadingState} from '../../../shared/ui/AppLoadingState';
import {AppPageHeader} from '../../../shared/ui/AppPageHeader';
import {AppScreen} from '../../../shared/ui/AppScreen';
import {appFeedListProps} from '../../../shared/ui/listPresets';
import {useI18n} from '../../../i18n/context';
import type {Gist} from '../../../types/gist';
import {GistCard} from '../components/GistCard';
import {getPublicGists} from '../api/gists';
import {parseGistReference} from '../utils/parseGistReference';

interface ExploreScreenProps {
  navigation: {
    navigate: (name: string, params?: object) => void;
  };
}

export function ExploreScreen({navigation}: ExploreScreenProps) {
  const {themeName} = useAppTheme();
  const {t} = useI18n();
  const styles = getStyles(themeName);
  const [query, setQuery] = React.useState('');
  const deferredQuery = React.useDeferredValue(query);
  const lastAutoNavigatedQueryRef = React.useRef<string | null>(null);
  const publicGistsQuery = useQuery({
    queryKey: queryKeys.publicGists,
    queryFn: ({signal}) => getPublicGists(1, 30, signal),
  });

  const gistReference = React.useMemo(() => parseGistReference(query), [query]);
  const deferredGistReference = React.useMemo(
    () => parseGistReference(deferredQuery),
    [deferredQuery],
  );
  const normalizedQuery = query.trim().toLowerCase();
  const deferredNormalizedQuery = deferredQuery.trim().toLowerCase();
  const gistReferenceId = gistReference?.gistId;
  const handleOpenGist = React.useCallback(
    (gistId: string) => {
      navigation.navigate('GistDetail', {gistId});
    },
    [navigation],
  );
  const handleRefresh = React.useCallback(() => {
    publicGistsQuery.refetch();
  }, [publicGistsQuery]);
  const keyExtractor = React.useCallback((item: Gist) => item.id, []);

  React.useEffect(() => {
    if (!gistReferenceId) {
      lastAutoNavigatedQueryRef.current = null;
      return;
    }

    if (lastAutoNavigatedQueryRef.current === normalizedQuery) {
      return;
    }

    lastAutoNavigatedQueryRef.current = normalizedQuery;
    navigation.navigate('GistDetail', {gistId: gistReferenceId});
  }, [gistReferenceId, navigation, normalizedQuery]);

  const filteredGists = React.useMemo(() => {
    const publicGists = publicGistsQuery.data ?? [];

    return publicGists.filter(gist => {
      if (!deferredNormalizedQuery) {
        return true;
      }

      if (deferredGistReference) {
        return gist.id.toLowerCase() === deferredGistReference.gistId.toLowerCase();
      }

      const searchSpace = [
        gist.description,
        gist.owner?.login,
        gist.user?.login,
        ...Object.values(gist.files).map(file => file.filename),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchSpace.includes(deferredNormalizedQuery);
    });
  }, [deferredGistReference, deferredNormalizedQuery, publicGistsQuery.data]);
  const renderItem = React.useCallback<ListRenderItem<Gist>>(
    ({item}) => <GistCard gist={item} onPressGist={handleOpenGist} />,
    [handleOpenGist],
  );

  let content: React.ReactNode;

  if (publicGistsQuery.isLoading) {
    content = (
      <AppLoadingState
        label={t('explore.loadingTitle')}
        description={t('explore.loadingDescription')}
      />
    );
  } else if (publicGistsQuery.isError) {
    content = (
      <AppErrorState
        title={t('explore.errorTitle')}
        description={t('explore.errorDescription')}
        onRetry={() => {
          publicGistsQuery.refetch();
        }}
      />
    );
  } else if (filteredGists.length === 0 && !gistReference && !deferredGistReference) {
    content = (
      <AppEmptyState
        badgeLabel={t('explore.title')}
        title={t('explore.emptyTitle')}
        description={t('explore.emptyDescription')}
      />
    );
  } else {
    content = (
      <FlatList
        data={filteredGists}
        {...appFeedListProps}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        refreshing={publicGistsQuery.isRefetching}
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
          <AppPageHeader title={t('explore.title')} />
          <AppInput
            label={t('explore.inputLabel')}
            placeholder={t('explore.inputPlaceholder')}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.content}>{content}</View>
      </View>
    </AppScreen>
  );
}

export default ExploreScreen;

const getStyles = createThemedStyles(theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.md,
      gap: theme.spacing.md,
    },
    header: {
      gap: theme.spacing.sm,
    },
    content: {
      flex: 1,
    },
    listContent: {
      paddingBottom: theme.spacing.xl,
      gap: theme.spacing.md,
    },
  }),
);
