import React from 'react';
import {Alert, FlatList, Linking, StyleSheet, Text, type ListRenderItem, View} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import type {RootStackScreenProps} from '../../../app/navigation/types';
import {useAppTheme} from '../../../app/theme/context';
import {createThemedStyles} from '../../../app/theme/tokens';
import {useI18n} from '../../../i18n/context';
import {queryKeys} from '../../../shared/api/queryKeys';
import {AppBadge} from '../../../shared/ui/AppBadge';
import {AppButton} from '../../../shared/ui/AppButton';
import {AppCard} from '../../../shared/ui/AppCard';
import {AppEmptyState} from '../../../shared/ui/AppEmptyState';
import {AppErrorState} from '../../../shared/ui/AppErrorState';
import {AppLoadingState} from '../../../shared/ui/AppLoadingState';
import {AppPageHeader} from '../../../shared/ui/AppPageHeader';
import {AppScreen} from '../../../shared/ui/AppScreen';
import {appFeedListProps} from '../../../shared/ui/listPresets';
import type {GistHistoryEntry} from '../../../types/gist';
import {getGist} from '../api/gists';

function formatRevisionDate(value: string, locale: string, fallback: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return date.toLocaleString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

const HistoryCard = React.memo(function HistoryCard({
  entry,
  locale,
  onOpenRevision,
  t,
}: {
  entry: GistHistoryEntry;
  locale: string;
  onOpenRevision: (version: string) => void;
  t: (key: string, values?: Record<string, string | number>) => string;
}) {
  const {themeName} = useAppTheme();
  const styles = getStyles(themeName);
  const committedAt = formatRevisionDate(entry.committed_at, locale, t('history.unknownDate'));

  return (
    <AppCard style={styles.historyCard}>
      <View style={styles.historyHeader}>
        <View style={styles.historyTitleWrap}>
          <AppBadge
            label={t('history.revisionTitle', {version: entry.version.slice(0, 7)})}
            tone="secret"
          />
          <Text style={styles.historyMeta}>{committedAt}</Text>
        </View>
        <Text style={styles.historyAuthor}>@{entry.user?.login ?? t('common.unknown')}</Text>
      </View>

      <View style={styles.changeRow}>
        <View style={styles.changePill}>
          <Text style={styles.changePillText}>+{entry.change_status.additions}</Text>
        </View>
        <View style={styles.changePill}>
          <Text style={styles.changePillText}>-{entry.change_status.deletions}</Text>
        </View>
        <View style={styles.changePill}>
          <Text style={styles.changePillText}>{entry.change_status.total}</Text>
        </View>
      </View>

      <AppButton
        fullWidth={false}
        label={t('history.openRevision')}
        onPress={() => {
          onOpenRevision(entry.version);
        }}
        size="compact"
        variant="secondary"
      />
    </AppCard>
  );
});

export function GistHistoryScreen({route}: RootStackScreenProps<'GistHistory'>) {
  const {themeName} = useAppTheme();
  const {t, language} = useI18n();
  const styles = getStyles(themeName);
  const locale = language === 'zh' ? 'zh-CN' : 'en-US';
  const {gistId} = route.params;
  const historyQuery = useQuery({
    queryKey: queryKeys.gistHistory(gistId),
    queryFn: ({signal}) => getGist(gistId, signal),
  });
  const gistUrl = historyQuery.data?.html_url ?? `https://gist.github.com/${gistId}`;
  const revisionCount = historyQuery.data?.history.length ?? 0;
  const latestRevision = historyQuery.data?.history[0];
  const handleOpenRevision = React.useCallback(
    (version: string) => {
      Linking.openURL(`${gistUrl}/${version}`).catch(() => {
        Alert.alert(t('history.openErrorTitle'), t('history.openErrorDescription'));
      });
    },
    [gistUrl, t],
  );
  const keyExtractor = React.useCallback((item: GistHistoryEntry) => item.version, []);
  const renderItem = React.useCallback<ListRenderItem<GistHistoryEntry>>(
    ({item}) => (
      <HistoryCard
        entry={item}
        locale={locale}
        onOpenRevision={handleOpenRevision}
        t={t}
      />
    ),
    [handleOpenRevision, locale, t],
  );
  const handleRefresh = React.useCallback(() => {
    historyQuery.refetch();
  }, [historyQuery]);

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
        {...appFeedListProps}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        refreshing={historyQuery.isRefetching}
        onRefresh={handleRefresh}
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
          <Text style={styles.subtitle}>{t('history.subtitle')}</Text>
          {historyQuery.data ? (
            <AppCard style={styles.summaryCard}>
              <AppBadge label={t('history.eyebrow')} tone="public" />
              <View style={styles.summaryRow}>
                <View style={styles.summaryPill}>
                  <Text style={styles.summaryPillValue}>{revisionCount}</Text>
                  <Text style={styles.summaryPillText}>{t('history.title')}</Text>
                </View>
                <View style={styles.summaryPill}>
                  <Text style={styles.summaryPillValue}>gist/{gistId.slice(0, 7)}</Text>
                  <Text style={styles.summaryPillText}>{t('history.version')}</Text>
                </View>
                {latestRevision ? (
                  <View style={styles.summaryPill}>
                    <Text style={styles.summaryPillValue}>@{latestRevision.user?.login ?? t('common.unknown')}</Text>
                    <Text style={styles.summaryPillText}>
                      {formatRevisionDate(latestRevision.committed_at, locale, t('history.unknownDate'))}
                    </Text>
                  </View>
                ) : null}
              </View>
            </AppCard>
          ) : null}
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
      paddingTop: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
    header: {
      gap: theme.spacing.xs,
    },
    subtitle: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
    },
    content: {
      flex: 1,
    },
    listContent: {
      paddingBottom: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    summaryCard: {
      gap: theme.spacing.sm,
    },
    summaryRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    summaryPill: {
      flexGrow: 1,
      minWidth: '47%',
      borderRadius: theme.radius.md,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceMuted,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
      gap: theme.spacing.xs,
    },
    summaryPillValue: {
      color: theme.colors.textPrimary,
      fontSize: 16,
      fontWeight: '800',
    },
    summaryPillText: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      lineHeight: 16,
    },
    historyCard: {
      gap: theme.spacing.sm,
    },
    historyHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: theme.spacing.sm,
    },
    historyTitleWrap: {
      flex: 1,
      gap: theme.spacing.xs,
    },
    historyMeta: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },
    historyAuthor: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      fontWeight: '700',
    },
    changeRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
    },
    changePill: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceMuted,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },
    changePillText: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      fontWeight: '700',
    },
  }),
);
