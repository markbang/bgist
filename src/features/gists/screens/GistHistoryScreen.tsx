import React from 'react';
import {Alert, FlatList, Linking, StyleSheet, Text, View} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import {appTheme} from '../../../app/theme/tokens';
import type {GistHistoryEntry} from '../../../types/gist';
import type {RootStackScreenProps} from '../../../app/navigation/types';
import {queryKeys} from '../../../shared/api/queryKeys';
import {AppButton} from '../../../shared/ui/AppButton';
import {AppCard} from '../../../shared/ui/AppCard';
import {AppEmptyState} from '../../../shared/ui/AppEmptyState';
import {AppErrorState} from '../../../shared/ui/AppErrorState';
import {AppLoadingState} from '../../../shared/ui/AppLoadingState';
import {AppScreen} from '../../../shared/ui/AppScreen';
import {useI18n} from '../../../i18n/context';
import {getGist} from '../api/gists';

function formatDateTime(value: string, locale: string, fallback: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return date.toLocaleString(locale);
}

function HistoryCard({
  entry,
  gistUrl,
  t,
  locale,
}: {
  entry: GistHistoryEntry;
  gistUrl: string;
  t: (key: string, values?: Record<string, string | number>) => string;
  locale: string;
}) {
  const revisionUrl = `${gistUrl}/${entry.version}`;

  return (
    <AppCard>
      <View style={styles.historyHeader}>
        <View style={styles.historyTitleWrap}>
          <Text style={styles.historyTitle}>
            {t('history.revisionTitle', {version: entry.version.slice(0, 7)})}
          </Text>
          <Text style={styles.historyMeta}>
            {formatDateTime(entry.committed_at, locale, t('history.unknownDate'))}
          </Text>
        </View>
        <View style={styles.historyChangeWrap}>
          <Text style={styles.historyAddition}>+{entry.change_status.additions}</Text>
          <Text style={styles.historyDeletion}>-{entry.change_status.deletions}</Text>
        </View>
      </View>

      <Text style={styles.historyAuthor}>@{entry.user?.login ?? 'unknown'}</Text>

      <AppButton
        fullWidth={false}
        label={t('history.openRevision')}
        onPress={() => {
          void Linking.openURL(revisionUrl).catch(() => {
            Alert.alert(t('history.openErrorTitle'), t('history.openErrorDescription'));
          });
        }}
        variant="secondary"
      />
    </AppCard>
  );
}

export function GistHistoryScreen({route}: RootStackScreenProps<'GistHistory'>) {
  const {language, t} = useI18n();
  const locale = language === 'zh' ? 'zh-CN' : 'en-US';
  const {gistId} = route.params;
  const historyQuery = useQuery({
    queryKey: queryKeys.gistHistory(gistId),
    queryFn: async () => {
      const gist = await getGist(gistId);
      return {
        gistUrl: gist.html_url,
        history: gist.history ?? [],
      };
    },
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
          void historyQuery.refetch();
        }}
      />
    );
  } else if ((historyQuery.data?.history ?? []).length === 0) {
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
        data={historyQuery.data?.history ?? []}
        keyExtractor={item => item.version}
        renderItem={({item}) => (
          <HistoryCard
            entry={item}
            gistUrl={historyQuery.data?.gistUrl ?? `https://gist.github.com/${gistId}`}
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
          <Text style={styles.eyebrow}>{t('history.eyebrow')}</Text>
          <Text style={styles.title}>{t('history.title')}</Text>
          <Text style={styles.subtitle}>{t('history.subtitle')}</Text>
        </View>

        <View style={styles.content}>{content}</View>
      </View>
    </AppScreen>
  );
}

export default GistHistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: appTheme.spacing.md,
    paddingTop: appTheme.spacing.md,
    gap: appTheme.spacing.md,
  },
  header: {
    gap: appTheme.spacing.sm,
  },
  eyebrow: {
    color: appTheme.colors.accent,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  title: {
    color: appTheme.colors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: appTheme.colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  content: {
    flex: 1,
  },
  listContent: {
    paddingBottom: appTheme.spacing.xl,
    gap: appTheme.spacing.md,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: appTheme.spacing.sm,
  },
  historyTitleWrap: {
    flex: 1,
    gap: appTheme.spacing.xs,
  },
  historyTitle: {
    color: appTheme.colors.textPrimary,
    fontSize: 17,
    fontWeight: '800',
  },
  historyMeta: {
    color: appTheme.colors.textSecondary,
    fontSize: 13,
  },
  historyChangeWrap: {
    flexDirection: 'row',
    gap: appTheme.spacing.xs,
  },
  historyAddition: {
    color: appTheme.colors.success,
    fontSize: 13,
    fontWeight: '700',
  },
  historyDeletion: {
    color: appTheme.colors.danger,
    fontSize: 13,
    fontWeight: '700',
  },
  historyAuthor: {
    color: appTheme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});
