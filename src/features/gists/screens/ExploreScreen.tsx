import React from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import {appTheme} from '../../../app/theme/tokens';
import {queryKeys} from '../../../shared/api/queryKeys';
import {AppEmptyState} from '../../../shared/ui/AppEmptyState';
import {AppErrorState} from '../../../shared/ui/AppErrorState';
import {AppInput} from '../../../shared/ui/AppInput';
import {AppLoadingState} from '../../../shared/ui/AppLoadingState';
import {AppScreen} from '../../../shared/ui/AppScreen';
import {useI18n} from '../../../i18n/context';
import {GistCard} from '../components/GistCard';
import {getPublicGists} from '../api/gists';
import {parseGistReference} from '../utils/parseGistReference';

interface ExploreScreenProps {
  navigation: {
    navigate: (name: string, params?: object) => void;
  };
}

export function ExploreScreen({navigation}: ExploreScreenProps) {
  const {t} = useI18n();
  const [query, setQuery] = React.useState('');
  const lastAutoNavigatedQueryRef = React.useRef<string | null>(null);
  const publicGistsQuery = useQuery({
    queryKey: queryKeys.publicGists,
    queryFn: () => getPublicGists(1),
  });

  const gistReference = parseGistReference(query);
  const normalizedQuery = query.trim().toLowerCase();
  const gistReferenceId = gistReference?.gistId;

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

  const publicGists = publicGistsQuery.data ?? [];
  const filteredGists = publicGists.filter(gist => {
    if (!normalizedQuery) {
      return true;
    }

    if (gistReference) {
      return gist.id.toLowerCase() === gistReference.gistId.toLowerCase();
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

    return searchSpace.includes(normalizedQuery);
  });

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
          void publicGistsQuery.refetch();
        }}
      />
    );
  } else if (filteredGists.length === 0 && !gistReference) {
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
          <Text style={styles.eyebrow}>{t('explore.eyebrow')}</Text>
          <Text style={styles.title}>{t('explore.title')}</Text>
          <Text style={styles.subtitle}>{t('explore.subtitle')}</Text>
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
