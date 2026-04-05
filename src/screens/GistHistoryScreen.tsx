import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  useColorScheme,
  Linking,
  Platform,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/types';
import {getGist} from '../api/gistApi';
import type {GistHistoryEntry} from '../types/gist';
import {lightTheme, darkTheme} from '../constants/theme';
import {formatDateTime} from '../utils/format';
import {useI18n} from '../i18n/context';

type Props = NativeStackScreenProps<RootStackParamList, 'GistHistory'>;

export default function GistHistoryScreen({route}: Props) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;
  const {colors} = theme;
  const {t} = useI18n();
  const {gistId} = route.params;

  const [history, setHistory] = useState<GistHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const gist = await getGist(gistId);
      setHistory(gist.history || []);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [gistId]),
  );

  const handleOpenRevision = (url: string) => {
    Linking.openURL(url);
  };

  const renderItem = ({item}: {item: GistHistoryEntry}) => (
    <View style={[styles.historyItem, {borderColor: colors.border}]}>
      <View style={styles.historyHeader}>
        <View>
          <Text style={[styles.version, {color: colors.textPrimary}]}>
            {t('history.version')} {item.version.slice(0, 7)}
          </Text>
          <Text style={[styles.date, {color: colors.textSecondary}]}>
            {formatDateTime(item.committed_at)}
          </Text>
        </View>
        {item.change_status.total > 0 && (
          <View style={styles.changeStatus}>
            {item.change_status.additions > 0 && (
              <Text style={[styles.addition, {color: colors.success}]}>
                +{item.change_status.additions}
              </Text>
            )}
            {item.change_status.deletions > 0 && (
              <Text style={[styles.deletion, {color: colors.danger}]}>
                -{item.change_status.deletions}
              </Text>
            )}
          </View>
        )}
      </View>
      <View style={styles.historyFooter}>
        <Text style={[styles.author, {color: colors.textLink}]}>
          {item.user?.login}
        </Text>
      </View>
    </View>
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
      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, {color: colors.textSecondary}]}>
            {t('history.empty')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={item => item.version}
          renderItem={renderItem}
          ItemSeparatorComponent={() => (
            <View style={{height: 1, backgroundColor: colors.border, marginLeft: 16}} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  loading: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  historyItem: {paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1},
  historyHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4},
  version: {fontSize: 14, fontWeight: '600', fontFamily: Platform.select({ios: 'Menlo', android: 'monospace'})},
  date: {fontSize: 12, marginTop: 2},
  changeStatus: {flexDirection: 'row', gap: 8},
  addition: {fontSize: 13, fontWeight: '500'},
  deletion: {fontSize: 13, fontWeight: '500'},
  historyFooter: {marginTop: 4},
  author: {fontSize: 13, fontWeight: '500'},
  emptyContainer: {flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32},
  emptyText: {fontSize: 14, textAlign: 'center'},
});
