import React from 'react';
import {Alert, FlatList, Linking, Pressable, StyleSheet, Text, View} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import type {RootStackScreenProps} from '../../../app/navigation/types';
import {useAppTheme} from '../../../app/theme/context';
import {createThemedStyles} from '../../../app/theme/tokens';
import {AppEmptyState} from '../../../shared/ui/AppEmptyState';
import {AppErrorState} from '../../../shared/ui/AppErrorState';
import {AppLoadingState} from '../../../shared/ui/AppLoadingState';
import {AppPageHeader} from '../../../shared/ui/AppPageHeader';
import {AppScreen} from '../../../shared/ui/AppScreen';
import {useI18n} from '../../../i18n/context';
import {getGist} from '../api/gists';
import {AppCard} from '../../../shared/ui/AppCard';
import type {GistHistoryEntry} from '../../../types/gist';

function HistoryCard({
  entry,
  gistUrl,
  locale,
  t,
}: {
  entry: GistHistoryEntry;
  gistUrl: string;
  locale: string;
  t: (key: string, values?: Record<string, string | number>) => string;
}) {
  const {themeName} = useAppTheme();
  const styles = getStyles(themeName);

  return (
    <AppCard>
      <View style={styles.historyHeader}>
        <View style={styles.historyTitleWrap}>
          <Text style={styles.historyTitle}>
            {t('history.revisionTitle', {version: entry.version.slice(0, 7)})}
          </Text>
          <Text style={styles.historyMeta}>
            {new Date(entry.committed_at).toLocaleString(locale, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </Text>
        </View>
        <Text style={styles.historyMeta}>
          @{entry.user?.login ?? t('common.unknown')}
        </Text>
      </View>

      <View style={styles.historyBody}>
        <Text style={styles.historyMeta}>
          +{entry.change_status.additions} / -{entry.change_status.deletions}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('history.openRevision')}
          onPress={() => {
            Linking.openURL(`${gistUrl}/${entry.version}`).catch(() => {
              Alert.alert(t('history.openErrorTitle'), t('history.openErrorDescription'));
            });
          }}>
          <Text style={styles.historyLink}>{t('history.openRevision')}</Text>
        </Pressable>
      </View>
    </AppCard>
  );
}

export function GistHistoryScreen({route}: RootStackScreenProps<'GistHistory'>) {
  const {themeName} = useAppTheme();
  const {t, language} = useI18n();
  const styles = getStyles(themeName);
  const locale = language === 'zh' ? 'zh-CN' : 'en-US';
  const {gistId} = route.params;
  const historyQuery = useQuery({
    queryKey: ['gists', 'history', gistId],
    queryFn: () => getGist(gistId),
  });

  let content: React.ReactNode;

  if (historyQuery.isLoading) {
    content = (
      <AppLoadingState
        label={t('history.loadingTitle')}
        description={t('history.loadingDescription')}
      />
    );
  } else if (historyQuery.isError) {
    content = (
      <AppErrorState
        title={t('history.errorTitle')}
        description={t('history.errorDescription')}
        onRetry={() => {
          historyQuery.refetch();
        }}
      />
    );
  } else if (!historyQuery.data || historyQuery.data.history.length === 0) {
    content = (
      <AppEmptyState
        badgeLabel={t('history.title')}
        title={t('history.emptyTitle')}
        description={t('history.emptyDescription')}
      />
    );
  } else {
    content = (
      <FlatList
        data={historyQuery.data.history}
        keyExtractor={item => item.version}
        renderItem={({item}) => (
          <HistoryCard
            entry={item}
            gistUrl={historyQuery.data?.html_url ?? `https://gist.github.com/${gistId}`}
            locale={locale}
            t={t}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    );
  }

  return (
    <AppScreen>
      <View style={styles.container}>
        <View style={styles.header}>
          <AppPageHeader title={t('history.title')} />
        </View>

        <View style={styles.content}>{content}</View>
      </View>
    </AppScreen>
  );
}

export default GistHistoryScreen;

const getStyles = createThemedStyles(theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.md,
      gap: theme.spacing.md,
    },
    header: {
      gap: theme.spacing.sm,
    },
    content: {
      flex: 1,
    },
    listContent: {
      paddingBottom: theme.spacing.xl,
      gap: theme.spacing.md,
    },
    historyHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
    },
    historyTitleWrap: {
      flex: 1,
      gap: theme.spacing.xs,
    },
    historyTitle: {
      color: theme.colors.textPrimary,
      fontSize: 17,
      fontWeight: '800',
    },
    historyMeta: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
    },
    historyBody: {
      gap: theme.spacing.xs,
    },
    historyLink: {
      color: theme.colors.accent,
      fontSize: 14,
      fontWeight: '700',
    },
  }),
);
