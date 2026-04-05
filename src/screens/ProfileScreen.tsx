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

export default function ProfileScreen() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;
  const {colors} = theme;
  const {user, logout} = useAuth();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchUserInfo = async () => {
    if (!user?.login) return;
    try {
      const data = await getUserInfo(user.login);
      setUserInfo(data);
    } catch (error) {
      console.error('Failed to fetch user info:', error);
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
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: logout,
        },
      ],
    );
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchUserInfo();
  };

  const displayUser = userInfo || user;

  if (!displayUser) return null;

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: colors.bgPrimary}]}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={colors.accent}
        />
      }>
      {/* Profile Header */}
      <View style={[styles.header, {backgroundColor: colors.bgPrimary}]}>
        <Image
          source={{uri: displayUser.avatar_url}}
          style={styles.avatar}
        />
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
      <View style={[styles.statsContainer, {borderColor: colors.border}]}>
        <View style={styles.stat}>
          <Text style={[styles.statValue, {color: colors.textPrimary}]}>
            {displayUser.public_gists}
          </Text>
          <Text style={[styles.statLabel, {color: colors.textSecondary}]}>
            Gists
          </Text>
        </View>
        <View style={[styles.statDivider, {backgroundColor: colors.border}]} />
        <View style={styles.stat}>
          <Text style={[styles.statValue, {color: colors.textPrimary}]}>
            {displayUser.public_repos}
          </Text>
          <Text style={[styles.statLabel, {color: colors.textSecondary}]}>
            Repos
          </Text>
        </View>
        <View style={[styles.statDivider, {backgroundColor: colors.border}]} />
        <View style={styles.stat}>
          <Text style={[styles.statValue, {color: colors.textPrimary}]}>
            {displayUser.followers}
          </Text>
          <Text style={[styles.statLabel, {color: colors.textSecondary}]}>
            Followers
          </Text>
        </View>
        <View style={[styles.statDivider, {backgroundColor: colors.border}]} />
        <View style={styles.stat}>
          <Text style={[styles.statValue, {color: colors.textPrimary}]}>
            {displayUser.following}
          </Text>
          <Text style={[styles.statLabel, {color: colors.textSecondary}]}>
            Following
          </Text>
        </View>
      </View>

      {/* Details */}
      {(displayUser.location || displayUser.company || displayUser.blog) && (
        <View style={styles.detailsContainer}>
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
            <Text
              style={[styles.detail, {color: colors.textLink}]}>
              🔗 {displayUser.blog}
            </Text>
          )}
          {displayUser.email && (
            <Text style={[styles.detail, {color: colors.textSecondary}]}>
              📧 {displayUser.email}
            </Text>
          )}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, {borderColor: colors.border}]}
          onPress={() => {
            // Open gist on web
          }}>
          <Text style={[styles.actionText, {color: colors.textPrimary}]}>
            Open GitHub Profile
          </Text>
          <Text style={{color: colors.textSecondary}}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.logoutButton,
            {borderColor: colors.danger},
          ]}
          onPress={handleLogout}>
          <Text style={[styles.logoutText, {color: colors.danger}]}>
            Sign Out
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{height: 32}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  username: {
    fontSize: 16,
    fontWeight: '400',
  },
  bio: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderRadius: 6,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    marginVertical: 4,
  },
  detailsContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 4,
  },
  detail: {
    fontSize: 14,
    marginBottom: 6,
  },
  actionsContainer: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 6,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
