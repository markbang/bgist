import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  useColorScheme,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import type {CompositeNavigationProp} from '@react-navigation/native';
import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {MainTabParamList, RootStackParamList} from '../navigation/types';
import {getStarredGists} from '../api/gistApi';
import type {Gist} from '../types/gist';
import {lightTheme, darkTheme} from '../constants/theme';
import GistItem from '../components/GistItem';

type Props = {
  navigation: CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList, 'Starred'>,
    NativeStackNavigationProp<RootStackParamList>
  >;
};

export default function StarredScreen({navigation}: Props) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;
  const {colors} = theme;

  const [gists, setGists] = useState<Gist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStarred = async () => {
    try {
      const data = await getStarredGists(1, 100);
      setGists(data);
    } catch (error) {
      console.error('Failed to fetch starred gists:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      fetchStarred();
    }, []),
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchStarred();
  };

  const renderItem = ({item}: {item: Gist}) => (
    <GistItem
      gist={item}
      onPress={() =>
        navigation.navigate('GistDetail', {gistId: item.id})
      }
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={{fontSize: 48, marginBottom: 16}}>⭐</Text>
      <Text style={[styles.emptyTitle, {color: colors.textPrimary}]}>
        No starred gists
      </Text>
      <Text style={[styles.emptyText, {color: colors.textSecondary}]}>
        Star gists to save them here for quick access
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, {backgroundColor: colors.bgPrimary}]}>
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
        ListEmptyComponent={renderEmpty}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  separator: {
    height: 1,
    marginLeft: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 4,
  },
});
