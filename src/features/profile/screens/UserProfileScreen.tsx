import React from 'react';
import {FlatList, Image, Linking, StyleSheet, Text, View} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import type {RootStackScreenProps} from '../../../app/navigation/types';
import {appTheme} from '../../../app/theme/tokens';
import {queryKeys} from '../../../shared/api/queryKeys';
import {AppBadge} from '../../../shared/ui/AppBadge';
import {AppButton} from '../../../shared/ui/AppButton';
import {AppCard} from '../../../shared/ui/AppCard';
import {AppEmptyState} from '../../../shared/ui/AppEmptyState';
import {AppErrorState} from '../../../shared/ui/AppErrorState';
import {AppLoadingState} from '../../../shared/ui/AppLoadingState';
import {AppScreen} from '../../../shared/ui/AppScreen';
import {useI18n} from '../../../i18n/context';
import type {UserInfo} from '../../../types/gist';
import {GistCard} from '../../gists/components/GistCard';
import {getUserGists, getUserInfo} from '../../gists/api/gists';

function StatCard({label, value}: {label: string; value: number}) {
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
  const metaItems = [profile.company, profile.location, profile.blog].filter(Boolean) as string[];

  return (
    <View style={styles.header}>
      <Text style={styles.eyebrow}>{t('userProfile.eyebrow')}</Text>
      <Text style={styles.title}>{profile.name ?? username}</Text>
      <Text style={styles.subtitle}>{t('userProfile.subtitle')}</Text>

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
            void Linking.openURL(profile.html_url);
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
  const {t} = useI18n();
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
    void profileQuery.refetch();
    void gistsQuery.refetch();
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

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: appTheme.spacing.md,
    paddingTop: appTheme.spacing.md,
    paddingBottom: appTheme.spacing.xl,
    gap: appTheme.spacing.md,
  },
  header: {
    gap: appTheme.spacing.md,
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
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: appTheme.spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: appTheme.colors.surfaceMuted,
  },
  identityCopy: {
    flex: 1,
    gap: appTheme.spacing.xs,
  },
  identityHeading: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: appTheme.spacing.sm,
  },
  name: {
    color: appTheme.colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
  },
  login: {
    color: appTheme.colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  bio: {
    color: appTheme.colors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: appTheme.spacing.sm,
  },
  metaPill: {
    borderRadius: appTheme.radius.md,
    borderCurve: 'continuous',
    backgroundColor: appTheme.colors.surfaceMuted,
    paddingHorizontal: appTheme.spacing.sm,
    paddingVertical: appTheme.spacing.xs,
  },
  metaText: {
    color: appTheme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: appTheme.spacing.sm,
  },
  statCard: {
    flexGrow: 1,
    minWidth: '47%',
    borderRadius: appTheme.radius.md,
    borderCurve: 'continuous',
    backgroundColor: appTheme.colors.surfaceMuted,
    paddingHorizontal: appTheme.spacing.sm,
    paddingVertical: appTheme.spacing.sm,
    gap: appTheme.spacing.xs,
  },
  statValue: {
    color: appTheme.colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    color: appTheme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  sectionHeader: {
    gap: appTheme.spacing.xs,
  },
  sectionTitle: {
    color: appTheme.colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
  },
  sectionSubtitle: {
    color: appTheme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
});
