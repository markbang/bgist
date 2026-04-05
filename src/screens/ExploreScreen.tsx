import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
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

  const [gists, setGists] = useState<Gist[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Gist[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchPublicGists = async (pageNum = 1) => {
    try {
      const data = await getPublicGists(pageNum, 30);
      if (pageNum === 1) {
        setGists(data);
      } else {
        setGists(prev => [...prev, ...data]);
      }
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
    } catch (error) {
      console.error('Search failed:', error);
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
      onPress={() =>
        navigation.navigate('GistDetail', {gistId: item.id})
      }
    />
  );

  return (
    <View style={[styles.container, {backgroundColor: colors.bgPrimary}]}>
      {/* Search Bar */}
      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor: colors.bgPrimary,
            borderBottomColor: colors.border,
          },
        ]}>
        <View
          style={[
            styles.searchInputContainer,
            {
              backgroundColor: colors.bgSecondary,
              borderColor: colors.border,
            },
          ]}>
          <Text style={{fontSize: 16, marginRight: 8, color: colors.textSecondary}}>
            🔍
          </Text>
          <TextInput
            style={[
              styles.searchInput,
              {color: colors.textPrimary},
            ]}
            placeholder="Search gists..."
            placeholderTextColor={colors.placeholder}
            value={searchQuery}
            onChangeText={handleSearch}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => handleSearch('')}>
              <Text style={{color: colors.textSecondary, fontSize: 16}}>
                ✕
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : isSearching && searchResults.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={{fontSize: 32, marginBottom: 12}}>🔍</Text>
          <Text style={[styles.emptyTitle, {color: colors.textPrimary}]}>
            No results found
          </Text>
          <Text style={[styles.emptyText, {color: colors.textSecondary}]}>
            Try different search terms
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
              <Text
                style={[
                  styles.searchHeader,
                  {color: colors.textSecondary},
                ]}>
                Search results for "{searchQuery}"
              </Text>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 4,
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
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
  },
  searchHeader: {
    fontSize: 13,
    paddingVertical: 8,
    paddingHorizontal: 16,
    fontStyle: 'italic',
  },
});
