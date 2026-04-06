import React from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import {appTheme} from '../../../app/theme/tokens';
import {AppEmptyState} from '../../../shared/ui/AppEmptyState';
import {AppErrorState} from '../../../shared/ui/AppErrorState';
import {AppLoadingState} from '../../../shared/ui/AppLoadingState';
import {AppScreen} from '../../../shared/ui/AppScreen';
import {AppSegmentedControl} from '../../../shared/ui/AppSegmentedControl';
import {GistCard} from '../components/GistCard';
import {type HomeFeedSegment, useHomeFeed} from '../hooks/useHomeFeed';

interface HomeScreenProps {
  navigation: {
    navigate: (name: string, params?: object) => void;
  };
}

const SEGMENTS = [
  {label: 'My', value: 'my'},
  {label: 'Starred', value: 'starred'},
] satisfies {label: string; value: HomeFeedSegment}[];

export function HomeScreen({navigation}: HomeScreenProps) {
  const {segment, setSegment, items, isLoading, isError, refetch} = useHomeFeed();

  let content: React.ReactNode;

  if (isLoading) {
    content = (
      <AppLoadingState
        label={segment === 'my' ? 'Loading your gists' : 'Loading starred gists'}
        description="Pulling the latest items from GitHub."
      />
    );
  } else if (isError) {
    content = (
      <AppErrorState
        title="Could not load this feed"
        description="Try again to refresh the selected gist list."
        onRetry={() => {
          void refetch();
        }}
      />
    );
  } else if (items.length === 0) {
    content = (
      <AppEmptyState
        badgeLabel={segment === 'my' ? 'My Feed' : 'Starred'}
        title={segment === 'my' ? 'No gists yet' : 'No starred gists yet'}
        description={
          segment === 'my'
            ? 'Create your first gist to start building your personal feed.'
            : 'Star a few gists on GitHub and they will show up here.'
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
          <Text style={styles.eyebrow}>Your feeds</Text>
          <Text style={styles.title}>Home</Text>
          <Text style={styles.subtitle}>
            Switch between your own gists and the ones you have starred.
          </Text>
          <AppSegmentedControl options={SEGMENTS} value={segment} onChange={setSegment} />
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
