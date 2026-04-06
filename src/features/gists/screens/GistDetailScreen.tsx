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
import {useAppTheme} from '../../../app/theme/context';
import {createThemedStyles} from '../../../app/theme/tokens';
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
import {AppPageHeader} from '../../../shared/ui/AppPageHeader';
import {AppScreen} from '../../../shared/ui/AppScreen';
import {useI18n} from '../../../i18n/context';
import {useGistDetail} from '../hooks/useGistDetail';
import {useGistMutations} from '../hooks/useGistMutations';

function formatDate(value: string, locale: string, fallback: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return date.toLocaleDateString(locale, {
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
  openLabel,
}: {
  filename: string;
  language: string | null;
  preview: string;
  onPress: () => void;
  openLabel: string;
}) {
  const {themeName} = useAppTheme();
  const styles = getStyles(themeName);

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={filename} onPress={onPress}>
      <AppCard>
        <View style={styles.fileHeader}>
          <View style={styles.fileHeaderText}>
            <Text style={styles.fileName}>{filename}</Text>
            {language ? <Text style={styles.fileLanguage}>{language}</Text> : null}
          </View>
          <Text style={styles.fileLink}>{openLabel}</Text>
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
  const {themeName} = useAppTheme();
  const styles = getStyles(themeName);

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
  const {theme, themeName} = useAppTheme();
  const {language, t} = useI18n();
  const styles = getStyles(themeName);
  const locale = language === 'zh' ? 'zh-CN' : 'en-US';
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
  const owner = gist?.owner ?? gist?.user ?? null;
  const ownerLogin = owner?.login ?? t('common.unknown').toLowerCase();
  const isOwner = user?.login === owner?.login;
  const files = gist ? Object.values(gist.files) : [];
  const comments = support?.comments ?? [];
  const isSupportLoading = supportQuery.isLoading && !support;
  const starredErrorMessage =
    support?.starredError ??
    (supportQuery.isError ? 'Star status is unavailable right now.' : null);
  const commentsErrorMessage =
    support?.commentsError ?? (supportQuery.isError ? t('gistDetail.commentsUnavailable') : null);
  const canToggleStar = typeof support?.starred === 'boolean';
  const gistUrl = gist?.html_url ?? '';

  const openShare = React.useCallback(async () => {
    try {
      if (!gistUrl) {
        return;
      }

      await Share.share({message: gistUrl});
    } catch {
      Alert.alert(t('gistDetail.shareErrorTitle'), t('gistDetail.shareErrorDescription'));
    }
  }, [gistUrl, t]);

  const copyLink = React.useCallback(() => {
    if (!gistUrl) {
      return;
    }

    Clipboard.setString(gistUrl);
    Alert.alert(t('common.copied'), t('gistDetail.copyLinkLabel'));
  }, [gistUrl, t]);

  const handleToggleStar = React.useCallback(async () => {
    try {
      if (!canToggleStar || !support) {
        return;
      }

      if (support.starred) {
        await unstarGistMutation.mutateAsync({gistId});
        return;
      }

      await starGistMutation.mutateAsync({gistId});
    } catch {
      Alert.alert(t('gistDetail.starErrorTitle'), t('gistDetail.shareErrorDescription'));
    }
  }, [canToggleStar, gistId, starGistMutation, support, t, unstarGistMutation]);

  const handleAddComment = React.useCallback(async () => {
    try {
      const trimmed = commentBody.trim();

      if (!trimmed) {
        return;
      }

      await addCommentMutation.mutateAsync({gistId, body: trimmed});
      setCommentBody('');
    } catch {
      Alert.alert(t('gistDetail.commentErrorTitle'), t('gistDetail.shareErrorDescription'));
    }
  }, [addCommentMutation, commentBody, gistId, t]);

  const handleDelete = React.useCallback(() => {
    Alert.alert(t('gistDetail.deleteTitle'), t('gistDetail.deleteDescription'), [
      {text: t('common.cancel'), style: 'cancel'},
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => {
          (async () => {
            try {
              await deleteGistMutation.mutateAsync({gistId});
              navigation.goBack();
            } catch {
              Alert.alert(t('gistDetail.deleteErrorTitle'), t('gistDetail.shareErrorDescription'));
            }
          })().catch(() => {});
        },
      },
    ]);
  }, [deleteGistMutation, gistId, navigation, t]);

  if (gistQuery.isLoading) {
    return (
      <AppScreen>
        <AppLoadingState
          label={t('gistDetail.loadingTitle')}
          description={t('gistDetail.loadingDescription')}
        />
      </AppScreen>
    );
  }

  if (gistQuery.isError || !gist) {
    return (
      <AppScreen>
        <AppErrorState
          title={t('gistDetail.errorTitle')}
          description={t('gistDetail.errorDescription')}
          onRetry={() => {
            gistQuery.refetch();
          }}
        />
      </AppScreen>
    );
  }

  const sheetActions = [
    {
      label: t('gistDetail.copyLink'),
      onPress: copyLink,
    },
    {
      label: t('gistDetail.shareLink'),
      onPress: () => {
        openShare().catch(() => {});
      },
    },
    ...(isOwner
      ? [
          {
            label: t('gistDetail.edit'),
            onPress: () => {
              navigation.navigate('GistEditor', {
                mode: 'edit',
                gistId: gist.id,
              });
            },
          },
          {
            label: t('gistDetail.delete'),
            onPress: handleDelete,
            tone: 'danger' as const,
          },
        ]
      : []),
  ];

  return (
    <AppScreen>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <AppPageHeader title={gist.description?.trim() || t('gistDetail.titleFallback')} />

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
                {t('gistDetail.metaSummary', {
                  date: formatDate(gist.updated_at, locale, t('gistDetail.unknownUpdate')),
                  count: files.length,
                  fileLabel:
                    files.length === 1 ? t('gistDetail.fileSingular') : t('gistDetail.filePlural'),
                })}
              </Text>
            </View>
            <AppBadge
              label={gist.public ? t('common.public') : t('common.secret')}
              tone={gist.public ? 'public' : 'secret'}
            />
          </View>

          <View style={styles.actions}>
            <AppButton
              fullWidth={false}
              disabled={!canToggleStar}
              label={
                isSupportLoading
                  ? t('gistDetail.loadingStar')
                  : !canToggleStar
                    ? t('gistDetail.starUnavailable')
                    : support?.starred
                      ? t('gistDetail.unstar')
                      : t('common.star')
              }
              loading={starGistMutation.isPending || unstarGistMutation.isPending}
              onPress={() => {
                handleToggleStar().catch(() => {});
              }}
              variant="secondary"
            />
            <AppButton
              fullWidth={false}
              label={t('gistDetail.fork')}
              loading={forkGistMutation.isPending}
              onPress={() => {
                (async () => {
                  try {
                    const nextGist = await forkGistMutation.mutateAsync({gistId});
                    navigation.navigate('GistDetail', {gistId: nextGist.id});
                  } catch {
                    Alert.alert(t('gistDetail.forkErrorTitle'), t('gistDetail.shareErrorDescription'));
                  }
                })().catch(() => {});
              }}
              variant="secondary"
            />
            <AppButton
              fullWidth={false}
              label={t('gistDetail.history')}
              onPress={() => navigation.navigate('GistHistory', {gistId})}
              variant="secondary"
            />
            <AppButton
              fullWidth={false}
              label={t('gistDetail.more')}
              onPress={() => setSheetVisible(true)}
              variant="secondary"
            />
          </View>

          {starredErrorMessage ? <AppBanner message={starredErrorMessage} tone="warning" /> : null}
        </AppCard>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('gistDetail.filesTitle')}</Text>
          <View style={styles.sectionContent}>
            {files.map(file => (
              <FilePreviewCard
                key={file.filename}
                filename={file.filename}
                language={file.language}
                openLabel={t('common.open')}
                preview={
                  file.truncated
                    ? t('gistDetail.largePreview')
                    : file.content ?? ''
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
          <Text style={styles.sectionTitle}>{t('gistDetail.commentsTitle')}</Text>
          {commentsErrorMessage ? (
            <View style={styles.commentsError}>
              <AppBanner message={commentsErrorMessage} tone="warning" />
              <AppButton
                fullWidth={false}
                label={t('gistDetail.retryComments')}
                onPress={() => {
                  supportQuery.refetch();
                }}
                variant="secondary"
              />
            </View>
          ) : isSupportLoading ? (
            <AppLoadingState
              label={t('gistDetail.commentsLoadingTitle')}
              description={t('gistDetail.commentsLoadingDescription')}
            />
          ) : comments.length === 0 ? (
            <AppEmptyState
              badgeLabel={t('gistDetail.commentsTitle')}
              title={t('gistDetail.commentsEmptyTitle')}
              description={t('gistDetail.commentsEmptyDescription')}
            />
          ) : (
            <View style={styles.sectionContent}>
              {comments.map(comment => (
                <CommentRow
                  key={comment.id}
                  author={comment.user?.login ?? 'unknown'}
                  body={comment.body}
                  dateLabel={formatDate(comment.created_at, locale, t('gistDetail.unknownUpdate'))}
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
          <Text style={styles.sectionTitle}>{t('gistDetail.addComment')}</Text>
          <TextInput
            multiline
            numberOfLines={4}
            onChangeText={setCommentBody}
            placeholder={t('gistDetail.commentPlaceholder')}
            placeholderTextColor={theme.colors.textSecondary}
            style={styles.commentInput}
            textAlignVertical="top"
            value={commentBody}
          />
          <AppButton
            fullWidth={false}
            label={t('gistDetail.postComment')}
            loading={addCommentMutation.isPending}
            onPress={() => {
              handleAddComment().catch(() => {});
            }}
          />
        </AppCard>
      </ScrollView>

      <AppActionSheet
        actions={sheetActions}
        onClose={() => setSheetVisible(false)}
        title={t('gistDetail.actionsTitle')}
        visible={sheetVisible}
      />
    </AppScreen>
  );
}

export default GistDetailScreen;

const getStyles = createThemedStyles(theme =>
  StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.xl,
      gap: theme.spacing.md,
    },
    metaHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
    },
    metaHeaderText: {
      flex: 1,
      gap: theme.spacing.xs,
    },
    owner: {
      color: theme.colors.accent,
      fontSize: 15,
      fontWeight: '700',
    },
    metaText: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
    },
    actions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    section: {
      gap: theme.spacing.sm,
    },
    sectionTitle: {
      color: theme.colors.textPrimary,
      fontSize: 20,
      fontWeight: '800',
    },
    sectionContent: {
      gap: theme.spacing.md,
    },
    fileHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
    },
    fileHeaderText: {
      flex: 1,
      gap: theme.spacing.xs,
    },
    fileName: {
      color: theme.colors.textPrimary,
      fontSize: 16,
      fontWeight: '700',
    },
    fileLanguage: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      fontWeight: '600',
    },
    fileLink: {
      color: theme.colors.accent,
      fontSize: 14,
      fontWeight: '700',
    },
    filePreview: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      lineHeight: 20,
      fontFamily: 'monospace',
    },
    commentsError: {
      gap: theme.spacing.sm,
    },
    commentAuthor: {
      color: theme.colors.accent,
      fontSize: 14,
      fontWeight: '700',
    },
    commentDate: {
      color: theme.colors.textSecondary,
      fontSize: 12,
    },
    commentBody: {
      color: theme.colors.textPrimary,
      fontSize: 14,
      lineHeight: 22,
    },
    commentInput: {
      minHeight: 112,
      borderRadius: theme.radius.md,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceMuted,
      color: theme.colors.textPrimary,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      fontSize: 15,
      lineHeight: 22,
    },
  }),
);
