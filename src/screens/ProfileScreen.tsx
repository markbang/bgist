import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
  useColorScheme,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useAuth} from '../contexts/AuthContext';
import {getUserInfo} from '../api/gistApi';
import type {UserInfo} from '../types/gist';
import {lightTheme, darkTheme} from '../constants/theme';
import {useI18n} from '../i18n/context';

export default function ProfileScreen() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;
  const {colors} = theme;
  const {user, logout} = useAuth();
  const {t, language, setLanguage} = useI18n();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchUserInfo = async () => {
    if (!user?.login) return;
    try {
      const data = await getUserInfo(user.login);
      setUserInfo(data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserInfo();
    }, [user]),
  );

  const handleLogout = () => {
    Alert.alert(
      t('auth.signOut'),
      t('auth.signOutConfirm'),
      [
        {text: t('common.cancel'), style: 'cancel'},
        {text: t('auth.signOut'), style: 'destructive', onPress: logout},
      ],
    );
  };

  const toggleLang = () => {
    setLanguage(language === 'en' ? 'zh' : 'en');
  };

  const displayUser = userInfo || user;
  if (!displayUser) return null;

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: colors.bgPrimary}]}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => {
            setIsRefreshing(true);
            fetchUserInfo();
          }}
          tintColor={colors.accent}
        />
      }>
      {/* Header */}
      <View style={styles.header}>
        <Image source={{uri: displayUser.avatar_url}} style={styles.avatar} />
        <Text style={[styles.name, {color: colors.textPrimary}]}>
          {displayUser.name || displayUser.login}
        </Text>
        <Text style={[styles.username, {color: colors.textSecondary}]}>
          @{displayUser.login}
        </Text>
        {displayUser.bio && (
          <Text style={[styles.bio, {color: colors.textPrimary}]}>
            {displayUser.bio}
          </Text>
        )}
      </View>

      {/* Stats */}
      <View style={[styles.statsCard, {borderColor: colors.border}]}>
        <View style={styles.stat}>
          <Text style={[styles.statValue, {color: colors.textPrimary}]}>
            {displayUser.public_gists}
          </Text>
          <Text style={[styles.statLabel, {color: colors.textSecondary}]}>
            {t('profile.gists')}
          </Text>
        </View>
        <View style={[styles.statDivider, {backgroundColor: colors.border}]} />
        <View style={styles.stat}>
          <Text style={[styles.statValue, {color: colors.textPrimary}]}>
            {displayUser.public_repos}
          </Text>
          <Text style={[styles.statLabel, {color: colors.textSecondary}]}>
            {t('profile.repos')}
          </Text>
        </View>
        <View style={[styles.statDivider, {backgroundColor: colors.border}]} />
        <View style={styles.stat}>
          <Text style={[styles.statValue, {color: colors.textPrimary}]}>
            {displayUser.followers}
          </Text>
          <Text style={[styles.statLabel, {color: colors.textSecondary}]}>
            {t('profile.followers')}
          </Text>
        </View>
        <View style={[styles.statDivider, {backgroundColor: colors.border}]} />
        <View style={styles.stat}>
          <Text style={[styles.statValue, {color: colors.textPrimary}]}>
            {displayUser.following}
          </Text>
          <Text style={[styles.statLabel, {color: colors.textSecondary}]}>
            {t('profile.following')}
          </Text>
        </View>
      </View>

      {/* Details */}
      {(displayUser.location || displayUser.company || displayUser.blog) && (
        <View style={styles.details}>
          {displayUser.location && (
            <Text style={[styles.detail, {color: colors.textSecondary}]}>
              📍 {displayUser.location}
            </Text>
          )}
          {displayUser.company && (
            <Text style={[styles.detail, {color: colors.textSecondary}]}>
              🏢 {displayUser.company}
            </Text>
          )}
          {displayUser.blog && (
            <Text style={[styles.detail, {color: colors.textLink}]}>
              🔗 {displayUser.blog}
            </Text>
          )}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        {/* Language Toggle */}
        <TouchableOpacity
          style={[styles.actionBtn, {borderColor: colors.border}]}
          onPress={toggleLang}>
          <Text style={[styles.actionText, {color: colors.textPrimary}]}>
            {language === 'en' ? '🇨 中文' : '🇸 English'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, {borderColor: colors.border}]}
          onPress={() => {}}>
          <Text style={[styles.actionText, {color: colors.textPrimary}]}>
            {t('profile.openGitHub')}
          </Text>
          <Text style={{color: colors.textSecondary}}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.logoutBtn, {borderColor: colors.danger}]}
          onPress={handleLogout}>
          <Text style={[styles.logoutText, {color: colors.danger}]}>
            {t('auth.signOut')}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{height: 32}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {alignItems: 'center', paddingVertical: 24, paddingHorizontal: 16},
  avatar: {width: 80, height: 80, borderRadius: 40, marginBottom: 12},
  name: {fontSize: 20, fontWeight: '700', marginBottom: 2},
  username: {fontSize: 16, fontWeight: '400'},
  bio: {fontSize: 14, marginTop: 8, textAlign: 'center', lineHeight: 20},
  statsCard: {
    flexDirection: 'row',
    marginHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderRadius: 6,
  },
  stat: {flex: 1, alignItems: 'center'},
  statValue: {fontSize: 18, fontWeight: '600'},
  statLabel: {fontSize: 12, marginTop: 2},
  statDivider: {width: 1, marginVertical: 4},
  details: {marginHorizontal: 16, marginTop: 16, paddingVertical: 4},
  detail: {fontSize: 14, marginBottom: 6},
  actions: {marginHorizontal: 16, marginTop: 24},
  actionBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 12,
  },
  actionText: {fontSize: 14, fontWeight: '500'},
  logoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 6,
  },
  logoutText: {fontSize: 14, fontWeight: '600'},
});
