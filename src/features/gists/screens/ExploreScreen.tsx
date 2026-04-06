import React from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import {appTheme} from '../../../app/theme/tokens';
import {queryKeys} from '../../../shared/api/queryKeys';
import {AppButton} from '../../../shared/ui/AppButton';
import {AppCard} from '../../../shared/ui/AppCard';
import {AppEmptyState} from '../../../shared/ui/AppEmptyState';
import {AppErrorState} from '../../../shared/ui/AppErrorState';
import {AppInput} from '../../../shared/ui/AppInput';
import {AppLoadingState} from '../../../shared/ui/AppLoadingState';
import {AppScreen} from '../../../shared/ui/AppScreen';
import {GistCard} from '../components/GistCard';
import {getPublicGists} from '../api/gists';
import {parseGistReference} from '../utils/parseGistReference';

interface ExploreScreenProps {
  navigation: {
    navigate: (name: string, params?: object) => void;
  };
}

export function ExploreScreen({navigation}: ExploreScreenProps) {
  const [query, setQuery] = React.useState('');
  const publicGistsQuery = useQuery({
    queryKey: queryKeys.publicGists,
    queryFn: () => getPublicGists(),
  });

  const gistReference = parseGistReference(query);
  const normalizedQuery = query.trim().toLowerCase();
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
        label="Loading public gists"
        description="Fetching the latest public feed from GitHub."
      />
    );
  } else if (publicGistsQuery.isError) {
    content = (
      <AppErrorState
        title="Could not load public gists"
        description="Retry to refresh the explore feed."
        onRetry={() => {
          void publicGistsQuery.refetch();
        }}
      />
    );
  } else if (filteredGists.length === 0) {
    content = (
      <AppEmptyState
        badgeLabel={gistReference ? 'Gist ID' : 'Explore'}
        title={gistReference ? 'That gist is not in this page of results' : 'No matching public gists'}
        description={
          gistReference
            ? 'Use the detected gist reference below to jump to the detail route directly.'
            : 'Try a different owner, description, or filename search.'
        }
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
          <Text style={styles.eyebrow}>Discover</Text>
          <Text style={styles.title}>Explore</Text>
          <Text style={styles.subtitle}>
            Search the public feed by description, owner, filename, or paste a gist URL.
          </Text>
          <AppInput
            label="Search public gists"
            placeholder="Paste a gist URL or search by keyword"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {gistReference ? (
          <AppCard>
            <Text style={styles.referenceEyebrow}>Detected gist reference</Text>
            <Text style={styles.referenceId}>{gistReference.gistId}</Text>
            <Text style={styles.referenceDescription}>
              Open the placeholder detail screen directly for this gist ID.
            </Text>
            <AppButton
              fullWidth={false}
              label="Open gist"
              onPress={() => navigation.navigate('GistDetail', {gistId: gistReference.gistId})}
              variant="secondary"
            />
          </AppCard>
        ) : null}

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
  referenceEyebrow: {
    color: appTheme.colors.accent,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  referenceId: {
    color: appTheme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  referenceDescription: {
    color: appTheme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
});
