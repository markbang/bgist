import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  useColorScheme,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/types';
import {getUserInfo, getUserGists} from '../api/gistApi';
import type {Gist, UserInfo} from '../types/gist';
import {lightTheme, darkTheme} from '../constants/theme';
import {useI18n} from '../i18n/context';
import GistItem from '../components/GistItem';

type Props = NativeStackScreenProps<RootStackParamList, 'UserProfile'>;

export default function UserProfileScreen({route, navigation}: Props) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;
  const {colors} = theme;
  const {t} = useI18n();
  const {username} = route.params;

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [gists, setGists] = useState<Gist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [info, gistsData] = await Promise.all([
        getUserInfo(username),
        getUserGists(username, 1, 30),
      ]);
      setUserInfo(info);
      setGists(gistsData);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      fetchData();
    }, [username]),
  );

  const renderItem = ({item}: {item: Gist}) => (
    <GistItem
      gist={item}
      onPress={() => navigation.navigate('GistDetail', {gistId: item.id})}
    />
  );

  if (isLoading) {
    return (
      <View style={[styles.loading, {backgroundColor: colors.bgPrimary}]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!userInfo) return null;

  return (
    <View style={[styles.container, {backgroundColor: colors.bgPrimary}]}>
      <View style={[styles.header, {borderBottomColor: colors.border}]}>
        <Image source={{uri: userInfo.avatar_url}} style={styles.avatar} />
        <View style={styles.headerInfo}>
          <Text style={[styles.name, {color: colors.textPrimary}]}>
            {userInfo.name || userInfo.login}
          </Text>
          <Text style={[styles.username, {color: colors.textSecondary}]}>
            @{userInfo.login}
          </Text>
          {userInfo.bio && (
            <Text style={[styles.bio, {color: colors.textPrimary}]}>
              {userInfo.bio}
            </Text>
          )}
        </View>
      </View>

      <View style={[styles.statsRow, {borderBottomColor: colors.border}]}>
        <Text style={[styles.stat, {color: colors.textSecondary}]}>
          <Text style={[styles.statValue, {color: colors.textPrimary}]}>
            {userInfo.public_gists}
          </Text>{' '}
          {t('profile.gists')}
        </Text>
        <Text style={[styles.stat, {color: colors.textSecondary}]}>
          <Text style={[styles.statValue, {color: colors.textPrimary}]}>
            {userInfo.public_repos}
          </Text>{' '}
          {t('profile.repos')}
        </Text>
        <Text style={[styles.stat, {color: colors.textSecondary}]}>
          <Text style={[styles.statValue, {color: colors.textPrimary}]}>
            {userInfo.followers}
          </Text>{' '}
          {t('profile.followers')}
        </Text>
      </View>

      <FlatList
        data={gists}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, {borderColor: colors.border}]} />
        )}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              setIsRefreshing(true);
              fetchData();
            }}
            tintColor={colors.accent}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, {color: colors.textSecondary}]}>
              {t('user.noGists')}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  loading: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  header: {flexDirection: 'row', padding: 16, borderBottomWidth: 1},
  avatar: {width: 60, height: 60, borderRadius: 30, marginRight: 12},
  headerInfo: {flex: 1, justifyContent: 'center'},
  name: {fontSize: 18, fontWeight: '600'},
  username: {fontSize: 14, marginBottom: 4},
  bio: {fontSize: 14, lineHeight: 20},
  statsRow: {flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 16, borderBottomWidth: 1, gap: 16},
  stat: {fontSize: 13},
  statValue: {fontWeight: '600'},
  separator: {height: 1, marginLeft: 16},
  emptyContainer: {paddingVertical: 40, alignItems: 'center'},
  emptyText: {fontSize: 14},
});
