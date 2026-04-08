import React from 'react';
import {
  ActivityIndicator,
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
import Svg, {Circle, Path} from 'react-native-svg';
import {WebView} from 'react-native-webview';
import {useQuery} from '@tanstack/react-query';
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
import {renderCodePreviewDocument} from '../utils/renderCodePreview';
import {buildRichTextPreviewDocument} from '../utils/renderRichTextPreview';

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

function formatCompactCount(value: number | null | undefined) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1).replace(/\.0$/, '')}k`;
  }

  return String(value);
}

function stripMarkup(value: string) {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function estimateDocumentHeight(sourceText?: string) {
  const normalized = (sourceText ?? '').trim();
  const lineCount = normalized.length > 0 ? normalized.split('\n').length : 1;
  const characterWeight = Math.min(Math.ceil(stripMarkup(normalized).length / 72), 10);
  const estimatedLines = Math.max(lineCount, characterWeight);

  return Math.min(Math.max(72, estimatedLines * 22 + 18), 720);
}

const webViewHeightScript = `
  (function() {
    function postHeight() {
      var body = document.body;
      var html = document.documentElement;
      var height = Math.max(
        body ? body.scrollHeight : 0,
        body ? body.offsetHeight : 0,
        html ? html.clientHeight : 0,
        html ? html.scrollHeight : 0,
        html ? html.offsetHeight : 0
      );
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(String(height));
      }
    }
    postHeight();
    setTimeout(postHeight, 80);
    setTimeout(postHeight, 240);
    true;
  })();
`;

function GistActionGlyph({
  color,
  name,
  size = 20,
}: {
  color: string;
  name: 'star' | 'fork' | 'history' | 'comments' | 'more';
  size?: number;
}) {
  switch (name) {
    case 'star':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 3.75L14.55 8.92L20.25 9.75L16.13 13.76L17.1 19.42L12 16.74L6.9 19.42L7.87 13.76L3.75 9.75L9.45 8.92L12 3.75Z"
            stroke={color}
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </Svg>
      );
    case 'fork':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="7" cy="6" r="2.4" stroke={color} strokeWidth="1.8" />
          <Circle cx="17" cy="6" r="2.4" stroke={color} strokeWidth="1.8" />
          <Circle cx="12" cy="18" r="2.4" stroke={color} strokeWidth="1.8" />
          <Path d="M7 8.6V10.2C7 11.3 7.9 12.2 9 12.2H12C13.1 12.2 14 11.3 14 10.2V8.6" stroke={color} strokeLinecap="round" strokeWidth="1.8" />
          <Path d="M12 15.6V12.2" stroke={color} strokeLinecap="round" strokeWidth="1.8" />
        </Svg>
      );
    case 'history':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M4.5 12A7.5 7.5 0 1 0 7 6.4" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
          <Path d="M4.5 4.75V9H8.75" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
          <Path d="M12 8.5V12L14.75 13.7" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </Svg>
      );
    case 'comments':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M6.8 18.5L4.5 20.5V7.8C4.5 6.81 5.31 6 6.3 6H17.7C18.69 6 19.5 6.81 19.5 7.8V15.2C19.5 16.19 18.69 17 17.7 17H8.3L6.8 18.5Z"
            stroke={color}
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
          <Path d="M8 10H16M8 13.5H13" stroke={color} strokeLinecap="round" strokeWidth="1.8" />
        </Svg>
      );
    case 'more':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="6.5" cy="12" r="1.5" fill={color} />
          <Circle cx="12" cy="12" r="1.5" fill={color} />
          <Circle cx="17.5" cy="12" r="1.5" fill={color} />
        </Svg>
      );
    default:
      return null;
  }
}

function GistActionButton({
  active = false,
  count,
  disabled = false,
  icon,
  label,
  loading = false,
  onPress,
  testID,
}: {
  active?: boolean;
  count?: string | null;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
  loading?: boolean;
  onPress: () => void;
  testID?: string;
}) {
  const {themeName} = useAppTheme();
  const styles = getStyles(themeName);

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{disabled, selected: active, busy: loading}}
      disabled={disabled}
      onPress={onPress}
      style={({pressed}) => [
        styles.actionIconButton,
        active ? styles.actionIconButtonActive : null,
        disabled ? styles.actionIconButtonDisabled : null,
        pressed && !disabled ? styles.actionIconButtonPressed : null,
      ]}
      testID={testID}>
      <View style={styles.actionIconRow}>
        <View style={styles.actionIconShell}>
          {loading ? <ActivityIndicator size="small" /> : icon}
        </View>
        {count ? (
          <Text
            numberOfLines={1}
            style={[styles.actionIconCount, active ? styles.actionIconCountActive : null]}
            testID={testID ? `${testID}-count` : undefined}>
            {count}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

function AutoHeightDocument({
  baseUrl,
  content,
  sourceText,
  testID,
}: {
  baseUrl?: string;
  content: string;
  sourceText?: string;
  testID: string;
}) {
  const {themeName} = useAppTheme();
  const styles = getStyles(themeName);
  const [height, setHeight] = React.useState(() => estimateDocumentHeight(sourceText));

  const handleMessage = React.useCallback((event: {nativeEvent: {data: string}}) => {
    const nextHeight = Number.parseInt(event.nativeEvent.data, 10);

    if (Number.isFinite(nextHeight) && nextHeight > 0) {
      setHeight(Math.max(120, nextHeight));
    }
  }, []);

  return (
    <View style={styles.filePreviewWebViewShell} testID={`${testID}-shell`}>
      <WebView
        injectedJavaScript={webViewHeightScript}
        nestedScrollEnabled={false}
        onMessage={handleMessage}
        originWhitelist={['*']}
        scrollEnabled={false}
        source={{html: content, baseUrl}}
        style={[styles.filePreviewWebView, {height}]}
        testID={testID}
      />
    </View>
  );
}

function FilePreviewCard({
  baseUrl,
  filename,
  language,
  content,
  emptyPreviewText,
  renderedHtml,
  onPress,
  openLabel,
}: {
  baseUrl?: string;
  filename: string;
  language: string | null;
  content?: string;
  emptyPreviewText: string;
  renderedHtml?: string;
  onPress: () => void;
  openLabel: string;
}) {
  const {theme, themeName, isDark} = useAppTheme();
  const styles = getStyles(themeName);
  const richPreviewDocument = React.useMemo(
    () =>
      buildRichTextPreviewDocument({
        filename,
        content,
        renderedHtml,
        theme,
        isDark,
      }),
    [content, filename, isDark, renderedHtml, theme],
  );
  const codePreviewQuery = useQuery({
    queryKey: [
      'gists',
      'detail-preview',
      filename,
      language ?? '',
      content?.length ?? 0,
      content?.slice(0, 120) ?? '',
      themeName,
    ],
    queryFn: () =>
      renderCodePreviewDocument({
        filename,
        language,
        content: content ?? '',
        theme,
        isDark,
      }),
    enabled: !richPreviewDocument && typeof content === 'string',
    staleTime: Infinity,
  });
  const previewDocument = richPreviewDocument ?? codePreviewQuery.data ?? null;
  const previewFallbackText =
    typeof content === 'string' && content.trim().length > 0 ? content : emptyPreviewText;

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={filename} onPress={onPress}>
      <AppCard style={styles.fileCard}>
        <View style={styles.fileHeader}>
          <View style={styles.fileHeaderText}>
            <Text style={styles.fileName}>{filename}</Text>
            {language ? <Text style={styles.fileLanguage}>{language}</Text> : null}
          </View>
          <Text style={styles.fileLink}>{openLabel}</Text>
        </View>
        {previewDocument ? (
          <AutoHeightDocument
            baseUrl={baseUrl}
            content={previewDocument}
            sourceText={content ?? renderedHtml ?? ''}
            testID={`gist-file-preview-${filename}`}
          />
        ) : (
          <Text numberOfLines={6} style={styles.filePreview}>
            {previewFallbackText}
          </Text>
        )}
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
  const [commentsEnabled, setCommentsEnabled] = React.useState(false);
  const {gistQuery, supportQuery, commentsQuery, gist, support, comments} = useGistDetail(gistId, {
    loadComments: commentsEnabled,
  });
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
  const isSupportLoading = supportQuery.isLoading && !support;
  const starredErrorMessage =
    support?.starredError ??
    (supportQuery.isError ? 'Star status is unavailable right now.' : null);
  const commentsErrorMessage = commentsQuery.isError ? t('gistDetail.commentsUnavailable') : null;
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
      setCommentsEnabled(true);
      commentsQuery.refetch();
    } catch {
      Alert.alert(t('gistDetail.commentErrorTitle'), t('gistDetail.shareErrorDescription'));
    }
  }, [addCommentMutation, commentBody, commentsQuery, gistId, t]);

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

  const starCountLabel = formatCompactCount(support?.starCount);
  const forkCountLabel = formatCompactCount(support?.forkCount);
  const historyCountLabel = formatCompactCount(gist.history.length);
  const commentsCountLabel = formatCompactCount(gist.comments);
  const starActionLabel = !canToggleStar
    ? t('gistDetail.starUnavailable')
    : support?.starred
      ? t('gistDetail.unstar')
      : t('common.star');

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

        <AppCard style={styles.metaCard}>
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

          <View style={styles.metaStatsRow}>
            <View style={styles.metaStatPill}>
              <Text style={styles.metaStatText}>
                {files.length}{' '}
                {files.length === 1 ? t('gistDetail.fileSingular') : t('gistDetail.filePlural')}
              </Text>
            </View>
            <View style={styles.metaStatPill}>
              <Text style={styles.metaStatText}>
                {commentsCountLabel ?? '0'} {t('gistDetail.commentsTitle')}
              </Text>
            </View>
            <View style={styles.metaStatPill}>
              <Text style={styles.metaStatText}>
                {historyCountLabel ?? '0'} {t('gistDetail.history')}
              </Text>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={styles.actions}
            horizontal
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}>
            <GistActionButton
              active={support?.starred === true}
              count={starCountLabel}
              disabled={!canToggleStar}
              icon={
                <GistActionGlyph
                  color={
                    support?.starred === true ? theme.colors.accentContrast : theme.colors.textPrimary
                  }
                  name="star"
                />
              }
              label={starActionLabel}
              loading={isSupportLoading || starGistMutation.isPending || unstarGistMutation.isPending}
              onPress={() => {
                handleToggleStar().catch(() => {});
              }}
              testID="gist-action-star"
            />
            <GistActionButton
              count={forkCountLabel}
              icon={<GistActionGlyph color={theme.colors.textPrimary} name="fork" />}
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
              testID="gist-action-fork"
            />
            <GistActionButton
              count={historyCountLabel}
              icon={<GistActionGlyph color={theme.colors.textPrimary} name="history" />}
              label={t('gistDetail.history')}
              onPress={() => navigation.navigate('GistHistory', {gistId})}
              testID="gist-action-history"
            />
            <GistActionButton
              count={commentsCountLabel}
              icon={<GistActionGlyph color={theme.colors.textPrimary} name="comments" />}
              label={t('common.comments')}
              onPress={() => setCommentsEnabled(true)}
              testID="gist-action-comments"
            />
            <GistActionButton
              icon={<GistActionGlyph color={theme.colors.textPrimary} name="more" />}
              label={t('gistDetail.more')}
              onPress={() => setSheetVisible(true)}
              testID="gist-action-more"
            />
          </ScrollView>

          {starredErrorMessage ? <AppBanner message={starredErrorMessage} tone="warning" /> : null}
        </AppCard>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('gistDetail.filesTitle')}</Text>
          <View style={styles.sectionContent}>
            {files.map(file => (
              <FilePreviewCard
                key={file.filename}
                baseUrl={gist.html_url}
                filename={file.filename}
                language={file.language}
                content={file.content}
                emptyPreviewText={t('gistDetail.largePreview')}
                openLabel={t('common.open')}
                renderedHtml={file.renderedHtml}
                onPress={() =>
                  navigation.navigate('GistViewer', {
                    gistId: gist.id,
                    filename: file.filename,
                    language: file.language,
                    content: file.content,
                    renderedHtml: file.renderedHtml,
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
                  setCommentsEnabled(true);
                  commentsQuery.refetch();
                }}
                variant="secondary"
              />
            </View>
          ) : !commentsEnabled && (gist.comments ?? 0) > 0 ? (
            <AppButton
              fullWidth={false}
              label={t('gistDetail.loadComments')}
              onPress={() => setCommentsEnabled(true)}
              variant="secondary"
            />
          ) : commentsQuery.isLoading ? (
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
      gap: theme.spacing.sm,
    },
    metaHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
    },
    metaCard: {
      gap: theme.spacing.sm,
      paddingTop: theme.spacing.xs + 2,
      paddingBottom: theme.spacing.xs + 2,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.canvas,
      shadowOpacity: 0,
      elevation: 0,
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
    metaStatsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
    },
    metaStatPill: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceMuted,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },
    metaStatText: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      fontWeight: '700',
    },
    actions: {
      alignItems: 'stretch',
      gap: theme.spacing.xs,
      paddingRight: theme.spacing.xs,
    },
    actionIconButton: {
      minHeight: 40,
      borderRadius: 999,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.sm + 2,
      paddingVertical: theme.spacing.xs + 2,
    },
    actionIconButtonActive: {
      borderColor: theme.colors.accent,
      backgroundColor: theme.colors.accentSoft,
    },
    actionIconButtonDisabled: {
      opacity: 0.55,
    },
    actionIconButtonPressed: {
      opacity: 0.9,
      transform: [{scale: 0.98}],
    },
    actionIconRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    actionIconShell: {
      width: 18,
      height: 18,
      borderRadius: 9,
      borderCurve: 'continuous',
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionIconCount: {
      color: theme.colors.textPrimary,
      fontSize: 13,
      fontWeight: '800',
    },
    actionIconCountActive: {
      color: theme.colors.accent,
    },
    section: {
      gap: theme.spacing.xs,
    },
    sectionTitle: {
      color: theme.colors.textPrimary,
      fontSize: 18,
      fontWeight: '800',
    },
    sectionContent: {
      gap: theme.spacing.sm,
    },
    fileHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
    },
    fileCard: {
      gap: theme.spacing.sm,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.canvas,
      shadowOpacity: 0,
      elevation: 0,
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
    filePreviewWebViewShell: {
      overflow: 'hidden',
      borderRadius: 0,
      borderCurve: 'continuous',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      backgroundColor: 'transparent',
    },
    filePreviewWebView: {
      backgroundColor: 'transparent',
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
