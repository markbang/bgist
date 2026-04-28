import React from 'react';
import {
  FlatList,
  Image,
  Linking,
  StyleSheet,
  type ListRenderItem,
  Text,
  View,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import type { RootStackScreenProps } from '../../../app/navigation/types';
import { useAppTheme } from '../../../app/theme/context';
import { createThemedStyles } from '../../../app/theme/tokens';
import { queryKeys } from '../../../shared/api/queryKeys';
import { AppBadge } from '../../../shared/ui/AppBadge';
import { AppButton } from '../../../shared/ui/AppButton';
import { AppEmptyState } from '../../../shared/ui/AppEmptyState';
import { AppErrorState } from '../../../shared/ui/AppErrorState';
import { AppLoadingState } from '../../../shared/ui/AppLoadingState';
import { AppPageHeader } from '../../../shared/ui/AppPageHeader';
import { AppScreen } from '../../../shared/ui/AppScreen';
import { appFeedListProps } from '../../../shared/ui/listPresets';
import { useI18n } from '../../../i18n/context';
import type { Gist, UserInfo } from '../../../types/gist';
import { GistCard } from '../../gists/components/GistCard';
import { getUserGists, getUserInfo } from '../../gists/api/gists';

const StatCard = React.memo(function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const { themeName } = useAppTheme();
  const styles = getStyles(themeName);

  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
});

const ProfileHero = React.memo(function ProfileHero({
  profile,
  username,
  t,
}: {
  profile: UserInfo;
  username: string;
  t: (key: string) => string;
}) {
  const { themeName } = useAppTheme();
  const styles = getStyles(themeName);
  const metaItems = [profile.company, profile.location, profile.blog].filter(
    Boolean,
  ) as string[];

  return (
    <View style={styles.header}>
      <AppPageHeader
        eyebrow={t('userProfile.eyebrow')}
        title={profile.name ?? username}
        subtitle={t('userProfile.subtitle')}
        accessory={<AppBadge label={`@${profile.login}`} tone="public" />}
      />

      <View style={styles.heroPanel}>
        <View style={styles.identity}>
          <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
          <View style={styles.identityCopy}>
            <View style={styles.identityHeading}>
              <Text style={styles.name}>{profile.name ?? username}</Text>
              <AppBadge label={t('userProfile.publicProfile')} tone="public" />
            </View>
            <Text style={styles.login}>@{profile.login}</Text>
            {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}
          </View>
        </View>

        {metaItems.length > 0 ? (
          <View style={styles.metaRow}>
            {metaItems.map(item => (
              <View key={item} style={styles.metaPill}>
                <Text style={styles.metaText}>{item}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.statsGrid}>
          <StatCard
            label={t('profile.publicGists')}
            value={profile.public_gists}
          />
          <StatCard label={t('profile.followers')} value={profile.followers} />
          <StatCard label={t('profile.following')} value={profile.following} />
          <StatCard
            label={t('userProfile.publicRepos')}
            value={profile.public_repos}
          />
        </View>

        <AppButton
          fullWidth={false}
          icon="explore-outline-rounded"
          label={t('userProfile.openGitHub')}
          onPress={() => {
            Linking.openURL(profile.html_url).catch(() => {});
          }}
          variant="secondary"
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('userProfile.sectionTitle')}</Text>
        <Text style={styles.sectionSubtitle}>
          {t('userProfile.sectionSubtitle')}
        </Text>
      </View>
    </View>
  );
});

export function UserProfileScreen({
  navigation,
  route,
}: RootStackScreenProps<'UserProfile'>) {
  const { themeName } = useAppTheme();
  const { t } = useI18n();
  const styles = getStyles(themeName);
  const { username } = route.params;
  const profileQuery = useQuery({
    queryKey: queryKeys.userProfile(username),
    queryFn: ({ signal }) => getUserInfo(username, signal),
  });
  const gistsQuery = useQuery({
    queryKey: queryKeys.userGists(username),
    queryFn: ({ signal }) => getUserGists(username, 1, 30, signal),
  });

  const handleRetry = React.useCallback(() => {
    profileQuery.refetch();
    gistsQuery.refetch();
  }, [gistsQuery, profileQuery]);
  const handleOpenGist = React.useCallback(
    (gistId: string) => {
      navigation.navigate('GistDetail', { gistId });
    },
    [navigation],
  );
  const keyExtractor = React.useCallback((item: Gist) => item.id, []);
  const renderItem = React.useCallback<ListRenderItem<Gist>>(
    ({ item }) => <GistCard gist={item} onPressGist={handleOpenGist} />,
    [handleOpenGist],
  );
  const listHeader = React.useMemo(
    () =>
      profileQuery.data ? (
        <ProfileHero profile={profileQuery.data} username={username} t={t} />
      ) : null,
    [profileQuery.data, t, username],
  );
  const listEmpty = React.useMemo(
    () => (
      <AppEmptyState
        badgeLabel={t('userProfile.sectionTitle')}
        title={t('userProfile.emptyTitle')}
        description={t('userProfile.emptyDescription')}
      />
    ),
    [t],
  );

  if (
    (profileQuery.isLoading && !profileQuery.data) ||
    (gistsQuery.isLoading && !gistsQuery.data)
  ) {
    return (
      <AppScreen>
        <AppLoadingState
          label={t('userProfile.loadingTitle')}
          description={t('userProfile.loadingDescription')}
        />
      </AppScreen>
    );
  }

  if (
    profileQuery.isError ||
    gistsQuery.isError ||
    !profileQuery.data ||
    !gistsQuery.data
  ) {
    return (
      <AppScreen>
        <AppErrorState
          title={t('userProfile.errorTitle')}
          description={t('userProfile.errorDescription')}
          onRetry={handleRetry}
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <FlatList
        data={gistsQuery.data}
        {...appFeedListProps}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        refreshing={profileQuery.isRefetching || gistsQuery.isRefetching}
        onRefresh={handleRetry}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />
    </AppScreen>
  );
}

export default UserProfileScreen;

const getStyles = createThemedStyles(theme =>
  StyleSheet.create({
    content: {
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    header: {
      gap: theme.spacing.sm,
    },
    heroPanel: {
      borderRadius: theme.radius.sm,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.sm + 2,
      paddingVertical: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
    identity: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.sm,
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.surfaceMuted,
    },
    identityCopy: {
      flex: 1,
      gap: theme.spacing.xs,
    },
    identityHeading: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    name: {
      color: theme.colors.textPrimary,
      fontSize: 16,
      fontWeight: '800',
    },
    login: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      fontWeight: '600',
    },
    bio: {
      color: theme.colors.textPrimary,
      fontSize: 12,
      lineHeight: 17,
    },
    metaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    metaPill: {
      borderRadius: theme.radius.sm,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceMuted,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs - 1,
    },
    metaText: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      fontWeight: '600',
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    statCard: {
      flexGrow: 1,
      minWidth: '48%',
      borderRadius: theme.radius.sm,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceMuted,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs + 2,
      gap: 2,
    },
    statValue: {
      color: theme.colors.textPrimary,
      fontSize: 16,
      fontWeight: '800',
    },
    statLabel: {
      color: theme.colors.textSecondary,
      fontSize: 11,
      fontWeight: '600',
    },
    sectionHeader: {
      gap: theme.spacing.xs,
    },
    sectionTitle: {
      color: theme.colors.textPrimary,
      fontSize: 17,
      fontWeight: '800',
    },
    sectionSubtitle: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      lineHeight: 17,
    },
  }),
);
