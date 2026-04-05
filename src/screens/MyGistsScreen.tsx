import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  useColorScheme,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import type {CompositeNavigationProp} from '@react-navigation/native';
import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {MainTabParamList, RootStackParamList} from '../navigation/types';
import {getMyGists} from '../api/gistApi';
import type {Gist} from '../types/gist';
import {lightTheme, darkTheme} from '../constants/theme';
import {useI18n} from '../i18n/context';
import GistItem from '../components/GistItem';

type Props = {
  navigation: CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList, 'MyGists'>,
    NativeStackNavigationProp<RootStackParamList>
  >;
};

export default function MyGistsScreen({navigation}: Props) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;
  const {colors} = theme;
  const {t} = useI18n();

  const [gists, setGists] = useState<Gist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchGists = async (pageNum = 1, append = false) => {
    try {
      console.log('Fetching gists, page:', pageNum);
      const data = await getMyGists(pageNum, 30);
      console.log('Fetched gists count:', data.length);
      if (data.length < 30) setHasMore(false);
      if (append) {
        setGists(prev => [...prev, ...data]);
      } else {
        setGists(data);
      }
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to fetch gists:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      fetchGists(1);
    }, []),
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    setHasMore(true);
    fetchGists(1);
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      fetchGists(page + 1, true);
    }
  };

  const renderItem = ({item}: {item: Gist}) => (
    <GistItem
      gist={item}
      onPress={() => navigation.navigate('GistDetail', {gistId: item.id})}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={{fontSize: 48, marginBottom: 16}}>📝</Text>
      <Text style={[styles.emptyTitle, {color: colors.textPrimary}]}>
        {t('gist.emptyTitle')}
      </Text>
      <Text style={[styles.emptyText, {color: colors.textSecondary}]}>
        {t('gist.emptyText')}
      </Text>
      <TouchableOpacity
        style={[styles.createBtn, {backgroundColor: colors.btnPrimaryBg}]}
        onPress={() => navigation.navigate('GistEditor', {mode: 'create'})}>
        <Text style={[styles.createBtnText, {color: colors.btnPrimaryText}]}>
          {t('gist.createGist')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading && gists.length === 0) {
    return (
      <View style={[styles.loading, {backgroundColor: colors.bgPrimary}]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.container, {backgroundColor: colors.bgPrimary}]}>
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
            onRefresh={handleRefresh}
            tintColor={colors.accent}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={
          isLoading && gists.length > 0 ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  loading: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  separator: {height: 1, marginLeft: 16},
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {fontSize: 18, fontWeight: '600', marginBottom: 8},
  emptyText: {fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 24},
  createBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  createBtnText: {fontSize: 14, fontWeight: '600'},
  footerLoader: {paddingVertical: 16, alignItems: 'center'},
});
