import React from 'react';
import {FlatList, Image, Linking, StyleSheet, Text, View} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import type {RootStackScreenProps} from '../../../app/navigation/types';
import {useAppTheme} from '../../../app/theme/context';
import {createThemedStyles} from '../../../app/theme/tokens';
import {queryKeys} from '../../../shared/api/queryKeys';
import {AppBadge} from '../../../shared/ui/AppBadge';
import {AppButton} from '../../../shared/ui/AppButton';
import {AppCard} from '../../../shared/ui/AppCard';
import {AppEmptyState} from '../../../shared/ui/AppEmptyState';
import {AppErrorState} from '../../../shared/ui/AppErrorState';
import {AppLoadingState} from '../../../shared/ui/AppLoadingState';
import {AppPageHeader} from '../../../shared/ui/AppPageHeader';
import {AppScreen} from '../../../shared/ui/AppScreen';
import {useI18n} from '../../../i18n/context';
import type {UserInfo} from '../../../types/gist';
import {GistCard} from '../../gists/components/GistCard';
import {getUserGists, getUserInfo} from '../../gists/api/gists';

function StatCard({label, value}: {label: string; value: number}) {
  const {themeName} = useAppTheme();
  const styles = getStyles(themeName);

  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ProfileHero({
  profile,
  username,
  t,
}: {
  profile: UserInfo;
  username: string;
  t: (key: string) => string;
}) {
  const {themeName} = useAppTheme();
  const styles = getStyles(themeName);
  const metaItems = [profile.company, profile.location, profile.blog].filter(Boolean) as string[];

  return (
    <View style={styles.header}>
      <AppPageHeader title={profile.name ?? username} />

      <AppCard>
        <View style={styles.identity}>
          <Image source={{uri: profile.avatar_url}} style={styles.avatar} />
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
          <StatCard label={t('profile.publicGists')} value={profile.public_gists} />
          <StatCard label={t('profile.followers')} value={profile.followers} />
          <StatCard label={t('profile.following')} value={profile.following} />
          <StatCard label={t('userProfile.publicRepos')} value={profile.public_repos} />
        </View>

        <AppButton
          fullWidth={false}
          label={t('userProfile.openGitHub')}
          onPress={() => {
            Linking.openURL(profile.html_url).catch(() => {});
          }}
          variant="secondary"
        />
      </AppCard>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('userProfile.sectionTitle')}</Text>
        <Text style={styles.sectionSubtitle}>{t('userProfile.sectionSubtitle')}</Text>
      </View>
    </View>
  );
}

export function UserProfileScreen({navigation, route}: RootStackScreenProps<'UserProfile'>) {
  const {themeName} = useAppTheme();
  const {t} = useI18n();
  const styles = getStyles(themeName);
  const {username} = route.params;
  const profileQuery = useQuery({
    queryKey: queryKeys.userProfile(username),
    queryFn: () => getUserInfo(username),
  });
  const gistsQuery = useQuery({
    queryKey: queryKeys.userGists(username),
    queryFn: () => getUserGists(username, 1, 30),
  });

  const handleRetry = React.useCallback(() => {
    profileQuery.refetch();
    gistsQuery.refetch();
  }, [gistsQuery, profileQuery]);

  if ((profileQuery.isLoading && !profileQuery.data) || (gistsQuery.isLoading && !gistsQuery.data)) {
    return (
      <AppScreen>
        <AppLoadingState
          label={t('userProfile.loadingTitle')}
          description={t('userProfile.loadingDescription')}
        />
      </AppScreen>
    );
  }

  if (profileQuery.isError || gistsQuery.isError || !profileQuery.data || !gistsQuery.data) {
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
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <GistCard
            gist={item}
            onPress={() => navigation.navigate('GistDetail', {gistId: item.id})}
          />
        )}
        ListHeaderComponent={<ProfileHero profile={profileQuery.data} username={username} t={t} />}
        ListEmptyComponent={
          <AppEmptyState
            badgeLabel={t('userProfile.sectionTitle')}
            title={t('userProfile.emptyTitle')}
            description={t('userProfile.emptyDescription')}
          />
        }
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
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.xl,
      gap: theme.spacing.md,
    },
    header: {
      gap: theme.spacing.md,
    },
    identity: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
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
      gap: theme.spacing.sm,
    },
    name: {
      color: theme.colors.textPrimary,
      fontSize: 22,
      fontWeight: '800',
    },
    login: {
      color: theme.colors.textSecondary,
      fontSize: 15,
      fontWeight: '600',
    },
    bio: {
      color: theme.colors.textPrimary,
      fontSize: 15,
      lineHeight: 22,
    },
    metaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    metaPill: {
      borderRadius: theme.radius.md,
      borderCurve: 'continuous',
      backgroundColor: theme.colors.surfaceMuted,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },
    metaText: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      fontWeight: '600',
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    statCard: {
      flexGrow: 1,
      minWidth: '47%',
      borderRadius: theme.radius.md,
      borderCurve: 'continuous',
      backgroundColor: theme.colors.surfaceMuted,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
      gap: theme.spacing.xs,
    },
    statValue: {
      color: theme.colors.textPrimary,
      fontSize: 22,
      fontWeight: '800',
    },
    statLabel: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      fontWeight: '600',
    },
    sectionHeader: {
      gap: theme.spacing.xs,
    },
    sectionTitle: {
      color: theme.colors.textPrimary,
      fontSize: 20,
      fontWeight: '800',
    },
    sectionSubtitle: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
    },
  }),
);
