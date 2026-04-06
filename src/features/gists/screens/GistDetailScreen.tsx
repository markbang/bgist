import React from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import {appTheme} from '../../../app/theme/tokens';
import type {RootStackScreenProps} from '../../../app/navigation/types';
import {useSession} from '../../auth/session/SessionProvider';
import {AppActionSheet} from '../../../shared/ui/AppActionSheet';
import {AppBadge} from '../../../shared/ui/AppBadge';
import {AppBanner} from '../../../shared/ui/AppBanner';
import {AppButton} from '../../../shared/ui/AppButton';
import {AppCard} from '../../../shared/ui/AppCard';
import {AppEmptyState} from '../../../shared/ui/AppEmptyState';
import {AppErrorState} from '../../../shared/ui/AppErrorState';
import {AppLoadingState} from '../../../shared/ui/AppLoadingState';
import {AppScreen} from '../../../shared/ui/AppScreen';
import {useGistDetail} from '../hooks/useGistDetail';
import {useGistMutations} from '../hooks/useGistMutations';

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown update';
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function FilePreviewCard({
  filename,
  language,
  preview,
  onPress,
}: {
  filename: string;
  language: string | null;
  preview: string;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={filename} onPress={onPress}>
      <AppCard>
        <View style={styles.fileHeader}>
          <View style={styles.fileHeaderText}>
            <Text style={styles.fileName}>{filename}</Text>
            {language ? <Text style={styles.fileLanguage}>{language}</Text> : null}
          </View>
          <Text style={styles.fileLink}>Open</Text>
        </View>
        <Text numberOfLines={6} style={styles.filePreview}>
          {preview || ' '}
        </Text>
      </AppCard>
    </Pressable>
  );
}

function CommentRow({
  author,
  body,
  dateLabel,
  onPressAuthor,
}: {
  author: string;
  body: string;
  dateLabel: string;
  onPressAuthor?: () => void;
}) {
  return (
    <AppCard>
      {onPressAuthor ? (
        <Pressable accessibilityRole="button" accessibilityLabel={`Open ${author} profile`} onPress={onPressAuthor}>
          <Text style={styles.commentAuthor}>@{author}</Text>
        </Pressable>
      ) : (
        <Text style={styles.commentAuthor}>@{author}</Text>
      )}
      <Text style={styles.commentDate}>{dateLabel}</Text>
      <Text style={styles.commentBody}>{body}</Text>
    </AppCard>
  );
}

export function GistDetailScreen({navigation, route}: RootStackScreenProps<'GistDetail'>) {
  const {gistId} = route.params;
  const {user} = useSession();
  const {gistQuery, supportQuery, gist, support} = useGistDetail(gistId);
  const {
    addCommentMutation,
    deleteGistMutation,
    forkGistMutation,
    starGistMutation,
    unstarGistMutation,
  } = useGistMutations();
  const [commentBody, setCommentBody] = React.useState('');
  const [sheetVisible, setSheetVisible] = React.useState(false);

  if (gistQuery.isLoading) {
    return (
      <AppScreen>
        <AppLoadingState
          label="Loading gist"
          description="Fetching the latest gist details from GitHub."
        />
      </AppScreen>
    );
  }

  if (gistQuery.isError || !gist) {
    return (
      <AppScreen>
        <AppErrorState
          title="Could not load this gist"
          description="Retry to fetch the gist details and try again."
          onRetry={() => {
            void gistQuery.refetch();
          }}
        />
      </AppScreen>
    );
  }

  const owner = gist.owner ?? gist.user ?? null;
  const ownerLogin = owner?.login ?? 'unknown';
  const isOwner = user?.login === owner?.login;
  const files = Object.values(gist.files);
  const comments = support?.comments ?? [];
  const isSupportLoading = supportQuery.isLoading && !support;
  const starredErrorMessage =
    support?.starredError ?? (supportQuery.isError ? 'Star status is unavailable right now.' : null);
  const commentsErrorMessage =
    support?.commentsError ?? (supportQuery.isError ? 'Comments failed to load.' : null);
  const canToggleStar = typeof support?.starred === 'boolean';

  const openShare = React.useCallback(async () => {
    try {
      await Share.share({message: gist.html_url});
    } catch {
      Alert.alert('Could not share link', 'Try again in a moment.');
    }
  }, [gist.html_url]);

  const copyLink = React.useCallback(() => {
    Clipboard.setString(gist.html_url);
    Alert.alert('Copied', 'Gist link copied to the clipboard.');
  }, [gist.html_url]);

  const handleToggleStar = React.useCallback(async () => {
    try {
      if (!canToggleStar) {
        return;
      }

      if (support.starred) {
        await unstarGistMutation.mutateAsync({gistId});
        return;
      }

      await starGistMutation.mutateAsync({gistId});
    } catch {
      Alert.alert('Could not update star', 'Try again in a moment.');
    }
  }, [canToggleStar, gistId, starGistMutation, support, unstarGistMutation]);

  const handleAddComment = React.useCallback(async () => {
    try {
      const trimmed = commentBody.trim();

      if (!trimmed) {
        return;
      }

      await addCommentMutation.mutateAsync({gistId, body: trimmed});
      setCommentBody('');
    } catch {
      Alert.alert('Could not post comment', 'Try again in a moment.');
    }
  }, [addCommentMutation, commentBody, gistId]);

  const handleDelete = React.useCallback(() => {
    Alert.alert('Delete gist', 'This action cannot be undone.', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await deleteGistMutation.mutateAsync({gistId});
              navigation.goBack();
            } catch {
              Alert.alert('Could not delete gist', 'Try again in a moment.');
            }
          })();
        },
      },
    ]);
  }, [deleteGistMutation, gistId, navigation]);

  const sheetActions = [
    {
      label: 'Copy gist link',
      onPress: copyLink,
    },
    {
      label: 'Share gist link',
      onPress: () => {
        void openShare();
      },
    },
    ...(isOwner
      ? [
          {
            label: 'Edit gist',
            onPress: () => {
              navigation.navigate('GistEditor', {
                mode: 'edit',
                gistId: gist.id,
              });
            },
          },
          {
            label: 'Delete gist',
            onPress: handleDelete,
            tone: 'danger' as const,
          },
        ]
      : []),
  ];

  return (
    <AppScreen>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Gist detail</Text>
          <Text style={styles.title}>{gist.description?.trim() || 'Untitled gist'}</Text>
          <Text style={styles.subtitle}>
            Review files, comments, and quick actions without leaving the new mobile shell.
          </Text>
        </View>

        <AppCard>
          <View style={styles.metaHeader}>
            <View style={styles.metaHeaderText}>
              {owner ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${ownerLogin} profile`}
                  onPress={() => navigation.navigate('UserProfile', {username: ownerLogin})}>
                  <Text style={styles.owner}>@{ownerLogin}</Text>
                </Pressable>
              ) : (
                <Text style={styles.owner}>@{ownerLogin}</Text>
              )}
              <Text style={styles.metaText}>
                Updated {formatDate(gist.updated_at)} · {files.length} file{files.length === 1 ? '' : 's'}
              </Text>
            </View>
            <AppBadge label={gist.public ? 'Public' : 'Secret'} tone={gist.public ? 'public' : 'secret'} />
          </View>

          <View style={styles.actions}>
            <AppButton
              fullWidth={false}
              disabled={!canToggleStar}
              label={
                isSupportLoading
                  ? 'Loading star…'
                  : !canToggleStar
                    ? 'Star unavailable'
                    : support?.starred
                      ? 'Unstar'
                      : 'Star'
              }
              loading={starGistMutation.isPending || unstarGistMutation.isPending}
              onPress={() => {
                void handleToggleStar();
              }}
              variant="secondary"
            />
            <AppButton
              fullWidth={false}
              label="Fork"
              loading={forkGistMutation.isPending}
              onPress={() => {
                void (async () => {
                  try {
                    const nextGist = await forkGistMutation.mutateAsync({gistId});
                    navigation.navigate('GistDetail', {gistId: nextGist.id});
                  } catch {
                    Alert.alert('Could not fork gist', 'Try again in a moment.');
                  }
                })();
              }}
              variant="secondary"
            />
            <AppButton
              fullWidth={false}
              label="History"
              onPress={() => navigation.navigate('GistHistory', {gistId})}
              variant="secondary"
            />
            <AppButton
              fullWidth={false}
              label="More"
              onPress={() => setSheetVisible(true)}
              variant="secondary"
            />
          </View>

          {starredErrorMessage ? <AppBanner message={starredErrorMessage} tone="warning" /> : null}
        </AppCard>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Files</Text>
          <View style={styles.sectionContent}>
            {files.map(file => (
              <FilePreviewCard
                key={file.filename}
                filename={file.filename}
                language={file.language}
                preview={
                  file.truncated
                    ? 'Preview unavailable for large files. Open the viewer to load the full content.'
                    : file.content
                }
                onPress={() =>
                  navigation.navigate('GistViewer', {
                    gistId: gist.id,
                    filename: file.filename,
                    content: file.truncated ? undefined : file.content,
                    gistUrl: gist.html_url,
                    rawUrl: file.raw_url,
                    truncated: file.truncated,
                  })
                }
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comments</Text>
          {commentsErrorMessage ? (
            <View style={styles.commentsError}>
              <AppBanner message={commentsErrorMessage} tone="warning" />
              <AppButton
                fullWidth={false}
                label="Retry comments"
                onPress={() => {
                  void supportQuery.refetch();
                }}
                variant="secondary"
              />
            </View>
          ) : isSupportLoading ? (
            <AppLoadingState
              label="Loading comments"
              description="Checking the latest comments for this gist."
            />
          ) : comments.length === 0 ? (
            <AppEmptyState
              badgeLabel="Comments"
              title="No comments yet"
              description="Start the discussion by leaving the first comment."
            />
          ) : (
            <View style={styles.sectionContent}>
              {comments.map(comment => (
                <CommentRow
                  key={comment.id}
                  author={comment.user?.login ?? 'unknown'}
                  body={comment.body}
                  dateLabel={formatDate(comment.created_at)}
                  onPressAuthor={
                    comment.user?.login
                      ? () => navigation.navigate('UserProfile', {username: comment.user.login})
                      : undefined
                  }
                />
              ))}
            </View>
          )}
        </View>

        <AppCard>
          <Text style={styles.sectionTitle}>Add comment</Text>
          <TextInput
            multiline
            numberOfLines={4}
            onChangeText={setCommentBody}
            placeholder="Write a comment"
            placeholderTextColor={appTheme.colors.textSecondary}
            style={styles.commentInput}
            textAlignVertical="top"
            value={commentBody}
          />
          <AppButton
            fullWidth={false}
            label="Post comment"
            loading={addCommentMutation.isPending}
            onPress={() => {
              void handleAddComment();
            }}
          />
        </AppCard>
      </ScrollView>

      <AppActionSheet
        actions={sheetActions}
        onClose={() => setSheetVisible(false)}
        title="Gist actions"
        visible={sheetVisible}
      />
    </AppScreen>
  );
}

export default GistDetailScreen;

const styles = StyleSheet.create({
  container: {
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
  metaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: appTheme.spacing.sm,
  },
  metaHeaderText: {
    flex: 1,
    gap: appTheme.spacing.xs,
  },
  owner: {
    color: appTheme.colors.accent,
    fontSize: 15,
    fontWeight: '700',
  },
  metaText: {
    color: appTheme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: appTheme.spacing.sm,
  },
  section: {
    gap: appTheme.spacing.sm,
  },
  sectionTitle: {
    color: appTheme.colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
  },
  sectionContent: {
    gap: appTheme.spacing.md,
  },
  fileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: appTheme.spacing.sm,
  },
  fileHeaderText: {
    flex: 1,
    gap: appTheme.spacing.xs,
  },
  fileName: {
    color: appTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  fileLanguage: {
    color: appTheme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  fileLink: {
    color: appTheme.colors.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  filePreview: {
    color: appTheme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: 'monospace',
  },
  commentsError: {
    gap: appTheme.spacing.sm,
  },
  commentAuthor: {
    color: appTheme.colors.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  commentDate: {
    color: appTheme.colors.textSecondary,
    fontSize: 12,
  },
  commentBody: {
    color: appTheme.colors.textPrimary,
    fontSize: 14,
    lineHeight: 22,
  },
  commentInput: {
    minHeight: 112,
    borderRadius: appTheme.radius.md,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    backgroundColor: appTheme.colors.surfaceMuted,
    color: appTheme.colors.textPrimary,
    paddingHorizontal: appTheme.spacing.md,
    paddingVertical: appTheme.spacing.sm,
    fontSize: 15,
    lineHeight: 22,
  },
});
