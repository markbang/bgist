import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import type {CompositeNavigationProp} from '@react-navigation/native';
import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {MainTabParamList, RootStackParamList} from '../navigation/types';
import {getPublicGists, searchGists} from '../api/gistApi';
import type {Gist} from '../types/gist';
import {lightTheme, darkTheme} from '../constants/theme';
import {useI18n} from '../i18n/context';
import GistItem from '../components/GistItem';

type Props = {
  navigation: CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList, 'Explore'>,
    NativeStackNavigationProp<RootStackParamList>
  >;
};

export default function ExploreScreen({navigation}: Props) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;
  const {colors} = theme;
  const {t} = useI18n();

  const [gists, setGists] = useState<Gist[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Gist[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchPublicGists = async (pageNum = 1) => {
    try {
      console.log('Fetching public gists, page:', pageNum);
      const data = await getPublicGists(pageNum, 30);
      console.log('Fetched public gists count:', data.length);
      if (pageNum === 1) setGists(data);
      else setGists(prev => [...prev, ...data]);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to fetch public gists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const results = await searchGists(query, 1, 30);
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      fetchPublicGists(1);
    }, []),
  );

  const displayGists = isSearching ? searchResults : gists;

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

  return (
    <View style={[styles.container, {backgroundColor: colors.bgPrimary}]}>
      {/* Search Bar */}
      <View style={[styles.searchBar, {borderBottomColor: colors.border}]}>
        <View
          style={[
            styles.searchInputWrap,
            {
              backgroundColor: colors.bgSecondary,
              borderColor: colors.border,
            },
          ]}>
          <Text style={{fontSize: 16, marginRight: 8, color: colors.textSecondary}}>
            🔍
          </Text>
          <TextInput
            style={[styles.searchInput, {color: colors.textPrimary}]}
            placeholder={t('explore.searchPlaceholder')}
            placeholderTextColor={colors.placeholder}
            value={searchQuery}
            onChangeText={handleSearch}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <Text
              style={{color: colors.textSecondary, fontSize: 16, marginLeft: 4}}
              onPress={() => handleSearch('')}>
              ✕
            </Text>
          )}
        </View>
      </View>

      {isSearching && searchResults.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={{fontSize: 32, marginBottom: 12}}>🔍</Text>
          <Text style={[styles.emptyTitle, {color: colors.textPrimary}]}>
            {t('common.noResults')}
          </Text>
          <Text style={[styles.emptyText, {color: colors.textSecondary}]}>
            {t('explore.tryDifferent')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayGists}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => (
            <View style={[styles.separator, {borderColor: colors.border}]} />
          )}
          onEndReached={
            !isSearching ? () => fetchPublicGists(page + 1) : undefined
          }
          onEndReachedThreshold={0.3}
          ListHeaderComponent={
            isSearching ? (
              <Text style={[styles.searchHeader, {color: colors.textSecondary}]}>
                {t('explore.searchResults')} "{searchQuery}"
              </Text>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  loading: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  searchBar: {paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1},
  searchInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  searchInput: {flex: 1, fontSize: 14, paddingVertical: 4},
  separator: {height: 1, marginLeft: 16},
  emptyContainer: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32},
  emptyTitle: {fontSize: 18, fontWeight: '600', marginBottom: 8},
  emptyText: {fontSize: 14, textAlign: 'center', lineHeight: 20},
  searchHeader: {fontSize: 13, paddingVertical: 8, paddingHorizontal: 16, fontStyle: 'italic'},
});
