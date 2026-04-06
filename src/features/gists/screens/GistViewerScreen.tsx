import React from 'react';
import {Alert, Share, StyleSheet, Text, View} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import {useQuery} from '@tanstack/react-query';
import {appTheme} from '../../../app/theme/tokens';
import {AppButton} from '../../../shared/ui/AppButton';
import {AppCard} from '../../../shared/ui/AppCard';
import {AppCodeBlock} from '../../../shared/ui/AppCodeBlock';
import {AppErrorState} from '../../../shared/ui/AppErrorState';
import {AppLoadingState} from '../../../shared/ui/AppLoadingState';
import {AppScreen} from '../../../shared/ui/AppScreen';
import type {RootStackScreenProps} from '../../../app/navigation/types';
import {useI18n} from '../../../i18n/context';

function createFileAnchor(filename: string) {
  return filename
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function GistViewerScreen({route}: RootStackScreenProps<'GistViewer'>) {
  const {t} = useI18n();
  const {gistId, filename, content, gistUrl, rawUrl, truncated = false} = route.params;
  const [showLines, setShowLines] = React.useState(true);
  const resolvedGistUrl = gistUrl ?? `https://gist.github.com/${gistId}`;
  const fileUrl = `${resolvedGistUrl}#file-${createFileAnchor(filename)}`;
  const needsRemoteContent = truncated || typeof content !== 'string';
  const fileContentQuery = useQuery({
    queryKey: ['gists', 'file', gistId, filename, rawUrl],
    queryFn: async () => {
      const response = await fetch(rawUrl);

      if (!response.ok) {
        throw new Error('GIST_FILE_FETCH_FAILED');
      }

      return response.text();
    },
    enabled: needsRemoteContent,
  });
  const resolvedContent = fileContentQuery.data ?? content ?? '';
  const canCopyContent = !needsRemoteContent || fileContentQuery.isSuccess;

  const copyValue = React.useCallback((value: string, label: string) => {
    Clipboard.setString(value);
    Alert.alert(t('common.copied'), `${label} ${t('common.copied').toLowerCase()}`);
  }, [t]);

  return (
    <AppScreen>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>{t('viewer.eyebrow')}</Text>
          <Text style={styles.title}>{filename}</Text>
          <Text style={styles.subtitle}>{t('viewer.subtitle')}</Text>
        </View>

        <View style={styles.actions}>
          <AppButton
            fullWidth={false}
            label={showLines ? t('viewer.hideLines') : t('viewer.showLines')}
            onPress={() => setShowLines(current => !current)}
            variant="secondary"
          />
          <AppButton
            fullWidth={false}
            label={t('viewer.copyContent')}
            disabled={!canCopyContent}
            onPress={() => {
              if (!canCopyContent) {
                return;
              }

              copyValue(resolvedContent, t('viewer.copyContentLabel'));
            }}
            variant="secondary"
          />
          <AppButton
            fullWidth={false}
            label={t('viewer.copyGistLink')}
            onPress={() => copyValue(resolvedGistUrl, t('viewer.copyGistLinkLabel'))}
            variant="secondary"
          />
          <AppButton
            fullWidth={false}
            label={t('viewer.copyFileLink')}
            onPress={() => copyValue(fileUrl, t('viewer.copyFileLinkLabel'))}
            variant="secondary"
          />
          <AppButton
            fullWidth={false}
            label={t('viewer.shareLink')}
            onPress={() => {
              void Share.share({message: fileUrl}).catch(() => {
                Alert.alert(t('viewer.shareErrorTitle'), t('viewer.shareErrorDescription'));
              });
            }}
            variant="secondary"
          />
        </View>

        <AppCard style={styles.codeShell}>
          {needsRemoteContent && fileContentQuery.isLoading ? (
            <AppLoadingState
              label={t('viewer.loadingTitle')}
              description={t('viewer.loadingDescription')}
            />
          ) : needsRemoteContent && fileContentQuery.isError ? (
            <AppErrorState
              title={t('viewer.errorTitle')}
              description={t('viewer.errorDescription')}
              onRetry={() => {
                void fileContentQuery.refetch();
              }}
            />
          ) : (
            <AppCodeBlock filename={filename} content={resolvedContent} showLines={showLines} />
          )}
        </AppCard>
      </View>
    </AppScreen>
  );
}

export default GistViewerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: appTheme.spacing.md,
    paddingTop: appTheme.spacing.md,
    paddingBottom: appTheme.spacing.xl,
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
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: appTheme.spacing.sm,
  },
  codeShell: {
    flex: 1,
    padding: appTheme.spacing.sm,
  },
});
