import React from 'react';
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import type { MainTabScreenProps } from '../../../app/navigation/types';
import { useAppTheme } from '../../../app/theme/context';
import { createThemedStyles } from '../../../app/theme/tokens';
import {
  MaterialSymbolIcon,
  type MaterialSymbolName,
} from '../../../components/TabIcons';
import { useSession } from '../../auth/session/SessionProvider';
import { getUserInfo } from '../../gists/api/gists';
import { useI18n } from '../../../i18n/context';
import { queryKeys } from '../../../shared/api/queryKeys';
import { AppEmptyState } from '../../../shared/ui/AppEmptyState';
import { AppLoadingState } from '../../../shared/ui/AppLoadingState';
import { AppScreen } from '../../../shared/ui/AppScreen';
import { GistMobileHeader } from '../../../shared/ui/GistMobileHeader';

function MenuSection({ children }: { children: React.ReactNode }) {
  const { themeName } = useAppTheme();
  const styles = getStyles(themeName);

  return <View style={styles.menuSection}>{children}</View>;
}

function MenuRow({
  icon,
  isLast = false,
  label,
  onPress,
}: {
  icon: MaterialSymbolName;
  isLast?: boolean;
  label: string;
  onPress?: () => void;
}) {
  const { theme, themeName } = useAppTheme();
  const styles = getStyles(themeName);

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuRow,
        isLast ? styles.menuRowLast : null,
        pressed && onPress ? styles.menuRowPressed : null,
      ]}
    >
      <View style={styles.menuIcon}>
        <MaterialSymbolIcon
          color={theme.colors.textSecondary}
          icon={icon}
          size={18}
        />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      {onPress ? (
        <MaterialSymbolIcon
          color={theme.colors.textSecondary}
          icon="chevron-right-rounded"
          size={18}
        />
      ) : null}
    </Pressable>
  );
}

export function ProfileScreen({ navigation }: MainTabScreenProps<'Profile'>) {
  const { themeName } = useAppTheme();
  const { t } = useI18n();
  const styles = getStyles(themeName);
  const { status, user } = useSession();
  const userQuery = useQuery({
    queryKey: queryKeys.userProfile(user?.login ?? 'me'),
    queryFn: ({ signal }) => getUserInfo(undefined, signal),
    enabled: status === 'signedIn' && Boolean(user?.login),
  });

  const profile = userQuery.data;
  const displayName =
    profile?.name ??
    user?.name ??
    user?.login ??
    t('profile.defaultDisplayName');
  const handleRefreshProfile = React.useCallback(() => {
    userQuery.refetch();
  }, [userQuery]);

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
        refreshControl={
          user ? (
            <RefreshControl
              refreshing={userQuery.isRefetching}
              onRefresh={handleRefreshProfile}
            />
          ) : undefined
        }
        showsVerticalScrollIndicator={false}
      >
        <GistMobileHeader
          leftAction={{
            label: 'x',
            onPress: () => navigation.navigate('Home'),
          }}
          rightAction={{
            label: '...',
            onPress: () => navigation.navigate('Settings'),
          }}
          showMark
          title="Gist"
        />

        <MenuSection>
          <Text style={styles.sectionLabel}>{t('profile.account')}</Text>
          <MenuRow
            icon="description-outline-rounded"
            label={t('home.segmentMine')}
            onPress={() => navigation.navigate('Home')}
          />
          <MenuRow
            icon="star-outline-rounded"
            label={t('home.segmentStarred')}
            onPress={() => navigation.navigate('Home')}
            isLast
          />
        </MenuSection>

        <MenuSection>
          <MenuRow icon="description-rounded" label={t('common.public')} />
          <MenuRow icon="lock-rounded" label={t('common.secret')} isLast />
        </MenuSection>

        <MenuSection>
          <MenuRow
            icon="explore-outline-rounded"
            label={t('explore.title')}
            onPress={() => navigation.navigate('Explore')}
          />
          <MenuRow
            icon="settings-outline-rounded"
            label={t('profile.settings')}
            onPress={() => navigation.navigate('Settings')}
            isLast
          />
        </MenuSection>

        <View style={styles.accountFooter}>
          {user.avatar_url ? (
            <Image
              source={{ uri: user.avatar_url }}
              style={styles.footerAvatar}
            />
          ) : (
            <View style={styles.footerAvatarFallback}>
              <MaterialSymbolIcon icon="account-circle-outline" size={24} />
            </View>
          )}
          <View style={styles.footerCopy}>
            <Text numberOfLines={1} style={styles.footerName}>
              {displayName}
            </Text>
            <Text numberOfLines={1} style={styles.footerLogin}>
              @{user.login}
            </Text>
            {profile?.bio ? (
              <Text numberOfLines={2} style={styles.footerBio}>
                {profile.bio}
              </Text>
            ) : null}
          </View>
          <Text style={styles.footerStat}>{profile?.public_gists ?? '-'}</Text>
        </View>

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
      paddingHorizontal: theme.spacing.sm,
      paddingTop: 0,
      paddingBottom: theme.spacing.xl,
      gap: theme.spacing.sm,
    },
    menuSection: {
      borderRadius: theme.radius.sm,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      overflow: 'hidden',
    },
    sectionLabel: {
      color: theme.colors.textSecondary,
      fontSize: 11,
      fontWeight: '800',
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.xs,
      textTransform: 'uppercase',
      letterSpacing: 0,
    },
    menuRow: {
      minHeight: 46,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    menuRowLast: {
      borderBottomWidth: 0,
    },
    menuRowPressed: {
      backgroundColor: theme.colors.surfaceMuted,
    },
    menuIcon: {
      width: 24,
      alignItems: 'center',
    },
    menuLabel: {
      flex: 1,
      color: theme.colors.textPrimary,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '700',
      letterSpacing: 0,
    },
    accountFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      borderRadius: theme.radius.sm,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
    },
    footerAvatar: {
      width: 34,
      height: 34,
      borderRadius: 17,
    },
    footerAvatarFallback: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceMuted,
    },
    footerCopy: {
      flex: 1,
      minWidth: 0,
      gap: 1,
    },
    footerName: {
      color: theme.colors.textPrimary,
      fontSize: 13,
      fontWeight: '800',
    },
    footerLogin: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      fontWeight: '600',
    },
    footerBio: {
      color: theme.colors.textSecondary,
      fontSize: 11,
      lineHeight: 15,
    },
    footerStat: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      fontWeight: '800',
    },
  }),
);
