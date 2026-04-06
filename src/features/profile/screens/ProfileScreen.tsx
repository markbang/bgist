import React from 'react';
import {Image, Linking, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import {appTheme} from '../../../app/theme/tokens';
import {useSession} from '../../auth/session/SessionProvider';
import {getUserInfo} from '../../gists/api/gists';
import {useI18n} from '../../../i18n/context';
import {queryKeys} from '../../../shared/api/queryKeys';
import {AppButton} from '../../../shared/ui/AppButton';
import {AppCard} from '../../../shared/ui/AppCard';
import {AppEmptyState} from '../../../shared/ui/AppEmptyState';
import {AppLoadingState} from '../../../shared/ui/AppLoadingState';
import {AppScreen} from '../../../shared/ui/AppScreen';

export function ProfileScreen() {
  const {language, setLanguage, t} = useI18n();
  const {status, user, signOut} = useSession();
  const userQuery = useQuery({
    queryKey: queryKeys.userProfile(user?.login ?? 'me'),
    queryFn: () => getUserInfo(),
    enabled: status === 'signedIn' && Boolean(user?.login),
  });

  const profile = userQuery.data;
  const displayName = profile?.name ?? user?.name ?? user?.login ?? t('profile.defaultDisplayName');
  const profileUrl = profile?.html_url ?? (user?.login ? `https://github.com/${user.login}` : null);

  if (status === 'loading' && !user) {
    return (
      <AppScreen>
        <AppLoadingState
          label={t('profile.loadingTitle')}
          description={t('profile.loadingDescription')}
        />
      </AppScreen>
    );
  }

  if (!user) {
    return (
      <AppScreen>
        <AppEmptyState
          badgeLabel={t('nav.profile')}
          title={t('profile.emptyTitle')}
          description={t('profile.emptyDescription')}
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <AppCard>
          <View style={styles.identity}>
            {user.avatar_url ? <Image source={{uri: user.avatar_url}} style={styles.avatar} /> : null}
            <View style={styles.identityText}>
              <Text style={styles.name}>{displayName}</Text>
              <Text style={styles.login}>@{user.login}</Text>
              {profile?.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}
            </View>
          </View>

          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{profile?.public_gists ?? '—'}</Text>
              <Text style={styles.statLabel}>{t('profile.publicGists')}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{profile?.followers ?? '—'}</Text>
              <Text style={styles.statLabel}>{t('profile.followers')}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{profile?.following ?? '—'}</Text>
              <Text style={styles.statLabel}>{t('profile.following')}</Text>
            </View>
          </View>
        </AppCard>

        <AppCard>
          <Text style={styles.sectionTitle}>{t('profile.preferences')}</Text>
          <AppButton
            label={t('profile.languageToggle', {
              language: language === 'en' ? t('common.languageEnglish') : t('common.languageChinese'),
            })}
            onPress={() => {
              void setLanguage(language === 'en' ? 'zh' : 'en');
            }}
            variant="secondary"
          />
        </AppCard>

        <AppCard>
          <Text style={styles.sectionTitle}>{t('profile.account')}</Text>
          <AppButton
            disabled={!profileUrl}
            label={t('profile.openGitHubButton')}
            onPress={() => {
              if (profileUrl) {
                void Linking.openURL(profileUrl);
              }
            }}
            variant="secondary"
          />
          <AppButton
            label={t('auth.signOut')}
            onPress={() => {
              void signOut();
            }}
            variant="danger"
          />
        </AppCard>

        {userQuery.isLoading ? (
          <AppLoadingState
            label={t('profile.refreshingTitle')}
            description={t('profile.refreshingDescription')}
          />
        ) : null}
      </ScrollView>
    </AppScreen>
  );
}

export default ProfileScreen;

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: appTheme.spacing.md,
    paddingTop: appTheme.spacing.md,
    paddingBottom: appTheme.spacing.xl,
    gap: appTheme.spacing.md,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: appTheme.spacing.md,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  identityText: {
    flex: 1,
    gap: appTheme.spacing.xs,
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
    color: appTheme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: appTheme.spacing.sm,
  },
  stat: {
    flex: 1,
    borderRadius: appTheme.radius.md,
    borderCurve: 'continuous',
    backgroundColor: appTheme.colors.surfaceMuted,
    paddingVertical: appTheme.spacing.sm,
    paddingHorizontal: appTheme.spacing.sm,
    gap: appTheme.spacing.xs,
  },
  statValue: {
    color: appTheme.colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    color: appTheme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  sectionTitle: {
    color: appTheme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
});
