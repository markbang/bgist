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

function createFileAnchor(filename: string) {
  return filename
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function GistViewerScreen({route}: RootStackScreenProps<'GistViewer'>) {
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
    Alert.alert('Copied', `${label} copied to the clipboard.`);
  }, []);

  return (
    <AppScreen>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Code viewer</Text>
          <Text style={styles.title}>{filename}</Text>
          <Text style={styles.subtitle}>
            Read the file content, toggle line numbers, and share the source link.
          </Text>
        </View>

        <View style={styles.actions}>
          <AppButton
            fullWidth={false}
            label={showLines ? 'Hide lines' : 'Show lines'}
            onPress={() => setShowLines(current => !current)}
            variant="secondary"
          />
          <AppButton
            fullWidth={false}
            label="Copy content"
            disabled={!canCopyContent}
            onPress={() => {
              if (!canCopyContent) {
                return;
              }

              copyValue(resolvedContent, 'Content');
            }}
            variant="secondary"
          />
          <AppButton
            fullWidth={false}
            label="Copy gist link"
            onPress={() => copyValue(resolvedGistUrl, 'Gist link')}
            variant="secondary"
          />
          <AppButton
            fullWidth={false}
            label="Copy file link"
            onPress={() => copyValue(fileUrl, 'File link')}
            variant="secondary"
          />
          <AppButton
            fullWidth={false}
            label="Share link"
            onPress={() => {
              void Share.share({message: fileUrl}).catch(() => {
                Alert.alert('Could not share link', 'Try again in a moment.');
              });
            }}
            variant="secondary"
          />
        </View>

        <AppCard style={styles.codeShell}>
          {needsRemoteContent && fileContentQuery.isLoading ? (
            <AppLoadingState
              label="Loading full file"
              description="Fetching the complete file contents from GitHub."
            />
          ) : needsRemoteContent && fileContentQuery.isError ? (
            <AppErrorState
              title="Could not load this file"
              description="Retry to fetch the full file contents."
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
