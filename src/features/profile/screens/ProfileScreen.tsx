import React from 'react';
import {Image, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import type {MainTabScreenProps} from '../../../app/navigation/types';
import {useAppTheme} from '../../../app/theme/context';
import {createThemedStyles} from '../../../app/theme/tokens';
import {SettingsIcon} from '../../../components/TabIcons';
import {useSession} from '../../auth/session/SessionProvider';
import {getUserInfo} from '../../gists/api/gists';
import {useI18n} from '../../../i18n/context';
import {queryKeys} from '../../../shared/api/queryKeys';
import {AppCard} from '../../../shared/ui/AppCard';
import {AppEmptyState} from '../../../shared/ui/AppEmptyState';
import {AppLoadingState} from '../../../shared/ui/AppLoadingState';
import {AppPageHeader} from '../../../shared/ui/AppPageHeader';
import {AppScreen} from '../../../shared/ui/AppScreen';

export function ProfileScreen({navigation}: MainTabScreenProps<'Profile'>) {
  const {theme, themeName} = useAppTheme();
  const {t} = useI18n();
  const styles = getStyles(themeName);
  const {status, user} = useSession();
  const userQuery = useQuery({
    queryKey: queryKeys.userProfile(user?.login ?? 'me'),
    queryFn: () => getUserInfo(),
    enabled: status === 'signedIn' && Boolean(user?.login),
  });

  const profile = userQuery.data;
  const displayName = profile?.name ?? user?.name ?? user?.login ?? t('profile.defaultDisplayName');

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
        <AppPageHeader
          title={t('profile.title')}
          accessory={
            <Pressable
              accessibilityLabel={t('profile.settings')}
              accessibilityRole="button"
              onPress={() => navigation.navigate('Settings')}
              style={({pressed}) => [
                styles.settingsButton,
                pressed ? styles.settingsButtonPressed : null,
              ]}>
              <SettingsIcon color={theme.colors.textPrimary} size={18} />
            </Pressable>
          }
        />

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

const getStyles = createThemedStyles(theme =>
  StyleSheet.create({
    content: {
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.xl,
      gap: theme.spacing.md,
    },
    settingsButton: {
      width: 42,
      height: 42,
      borderRadius: theme.radius.md,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    settingsButtonPressed: {
      opacity: 0.88,
      transform: [{scale: 0.96}],
    },
    identity: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    avatar: {
      width: 72,
      height: 72,
      borderRadius: 36,
    },
    identityText: {
      flex: 1,
      gap: theme.spacing.xs,
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
      color: theme.colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
    },
    stats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
    },
    stat: {
      flex: 1,
      borderRadius: theme.radius.md,
      borderCurve: 'continuous',
      backgroundColor: theme.colors.surfaceMuted,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.sm,
      gap: theme.spacing.xs,
    },
    statValue: {
      color: theme.colors.textPrimary,
      fontSize: 20,
      fontWeight: '800',
    },
    statLabel: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      fontWeight: '600',
    },
  }),
);
