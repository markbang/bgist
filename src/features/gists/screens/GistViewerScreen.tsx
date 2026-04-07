import React from 'react';
import {Alert, Pressable, ScrollView, Share, StyleSheet, View} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import {useQuery} from '@tanstack/react-query';
import Svg, {Circle, Path} from 'react-native-svg';
import {WebView} from 'react-native-webview';
import {useAppTheme} from '../../../app/theme/context';
import {createThemedStyles} from '../../../app/theme/tokens';
import {AppCard} from '../../../shared/ui/AppCard';
import {AppCodeBlock} from '../../../shared/ui/AppCodeBlock';
import {AppErrorState} from '../../../shared/ui/AppErrorState';
import {AppLoadingState} from '../../../shared/ui/AppLoadingState';
import {AppPageHeader} from '../../../shared/ui/AppPageHeader';
import {AppScreen} from '../../../shared/ui/AppScreen';
import type {RootStackScreenProps} from '../../../app/navigation/types';
import {useI18n} from '../../../i18n/context';
import {renderCodePreviewDocument, wrapPreviewDocument} from '../utils/renderCodePreview';

function createFileAnchor(filename: string) {
  return filename
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function isMarkdownFile(filename: string) {
  return /\.(md|markdown|mdown|mkd|mkdn)$/i.test(filename);
}

function isHtmlFile(filename: string) {
  return /\.(html?|xhtml)$/i.test(filename);
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderInlineMarkdown(value: string) {
  let result = escapeHtml(value);

  result = result.replace(/`([^`]+)`/g, '<code>$1</code>');
  result = result.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2">$1</a>');
  result = result.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  result = result.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  result = result.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  result = result.replace(/_([^_]+)_/g, '<em>$1</em>');

  return result;
}

function renderMarkdownDocument(markdown: string) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks: string[] = [];
  const paragraphBuffer: string[] = [];
  const listBuffer: string[] = [];
  const codeBuffer: string[] = [];
  let inCodeBlock = false;

  const flushParagraph = () => {
    if (paragraphBuffer.length === 0) {
      return;
    }

    blocks.push(`<p>${renderInlineMarkdown(paragraphBuffer.join('<br />'))}</p>`);
    paragraphBuffer.length = 0;
  };

  const flushList = () => {
    if (listBuffer.length === 0) {
      return;
    }

    blocks.push(`<ul>${listBuffer.map(item => `<li>${renderInlineMarkdown(item)}</li>`).join('')}</ul>`);
    listBuffer.length = 0;
  };

  const flushCode = () => {
    if (codeBuffer.length === 0) {
      return;
    }

    blocks.push(`<pre><code>${escapeHtml(codeBuffer.join('\n'))}</code></pre>`);
    codeBuffer.length = 0;
  };

  lines.forEach(line => {
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    const listMatch = line.match(/^\s*[-*+]\s+(.+)$/);

    if (line.startsWith('```')) {
      if (inCodeBlock) {
        flushCode();
      } else {
        flushParagraph();
        flushList();
      }

      inCodeBlock = !inCodeBlock;
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    if (line.trim().length === 0) {
      flushParagraph();
      flushList();
      return;
    }

    if (headingMatch) {
      flushParagraph();
      flushList();
      const level = headingMatch[1].length;
      blocks.push(`<h${level}>${renderInlineMarkdown(headingMatch[2])}</h${level}>`);
      return;
    }

    if (listMatch) {
      flushParagraph();
      listBuffer.push(listMatch[1]);
      return;
    }

    paragraphBuffer.push(line);
  });

  flushParagraph();
  flushList();
  flushCode();

  return blocks.join('');
}

async function buildPreviewDocument(
  filename: string,
  language: string | null | undefined,
  content: string,
  theme: ReturnType<typeof useAppTheme>['theme'],
  isDark: boolean,
) {
  if (isMarkdownFile(filename)) {
    return wrapPreviewDocument(filename, renderMarkdownDocument(content), theme, isDark);
  }

  if (isHtmlFile(filename)) {
    if (/<html[\s>]/i.test(content) || /<!doctype/i.test(content)) {
      return content;
    }

    return wrapPreviewDocument(filename, content, theme, isDark);
  }

  return renderCodePreviewDocument({
    filename,
    language,
    content,
    theme,
    isDark,
  });
}

function ActionIcon({
  name,
  color,
  size = 18,
}: {
  name: 'lines' | 'copy' | 'gist-link' | 'file-link' | 'share' | 'preview' | 'source';
  color: string;
  size?: number;
}) {
  switch (name) {
    case 'lines':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M9 6H20M9 12H20M9 18H20M4 6H4.01M4 12H4.01M4 18H4.01" stroke={color} strokeLinecap="round" strokeWidth="1.8" />
        </Svg>
      );
    case 'copy':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M9 9H6.8C5.81 9 5 9.81 5 10.8V17.2C5 18.19 5.81 19 6.8 19H13.2C14.19 19 15 18.19 15 17.2V15" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
          <Path d="M10.8 5H17.2C18.19 5 19 5.81 19 6.8V13.2C19 14.19 18.19 15 17.2 15H10.8C9.81 15 9 14.19 9 13.2V6.8C9 5.81 9.81 5 10.8 5Z" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </Svg>
      );
    case 'gist-link':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M10 13.5L14 9.5M8.5 7H7A4 4 0 0 0 7 15H8.5M15.5 9H17A4 4 0 0 1 17 17H15.5M9 15H15" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </Svg>
      );
    case 'file-link':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M14 3H7C5.9 3 5 3.9 5 5V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V8L14 3Z" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
          <Path d="M14 3V8H19" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
          <Path d="M9 13H15M9 17H13" stroke={color} strokeLinecap="round" strokeWidth="1.8" />
        </Svg>
      );
    case 'share':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="18" cy="5" r="2.5" stroke={color} strokeWidth="1.8" />
          <Circle cx="6" cy="12" r="2.5" stroke={color} strokeWidth="1.8" />
          <Circle cx="18" cy="19" r="2.5" stroke={color} strokeWidth="1.8" />
          <Path d="M8.2 10.8L15.8 6.2M8.2 13.2L15.8 17.8" stroke={color} strokeLinecap="round" strokeWidth="1.8" />
        </Svg>
      );
    case 'preview':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M2 12C3.73 8.11 7.52 5.5 12 5.5C16.48 5.5 20.27 8.11 22 12C20.27 15.89 16.48 18.5 12 18.5C7.52 18.5 3.73 15.89 2 12Z" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
          <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.8" />
        </Svg>
      );
    case 'source':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M8 8L4 12L8 16M16 8L20 12L16 16M13.5 5L10.5 19" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </Svg>
      );
    default:
      return null;
  }
}

function ViewerActionButton({
  accessibilityLabel,
  active = false,
  disabled = false,
  icon,
  onPress,
}: {
  accessibilityLabel: string;
  active?: boolean;
  disabled?: boolean;
  icon: React.ReactNode;
  onPress: () => void;
}) {
  const {themeName} = useAppTheme();
  const styles = getStyles(themeName);

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{disabled, selected: active}}
      disabled={disabled}
      onPress={onPress}
      style={({pressed}) => [
        styles.actionButton,
        active ? styles.actionButtonActive : null,
        disabled ? styles.actionButtonDisabled : null,
        pressed && !disabled ? styles.actionButtonPressed : null,
      ]}>
      {icon}
    </Pressable>
  );
}

export function GistViewerScreen({route}: RootStackScreenProps<'GistViewer'>) {
  const {theme, themeName, isDark} = useAppTheme();
  const {t} = useI18n();
  const styles = getStyles(themeName);
  const {gistId, filename, language, content, gistUrl, rawUrl, truncated = false} = route.params;
  const [showLines, setShowLines] = React.useState(true);
  const [showPreview, setShowPreview] = React.useState(true);
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
  const previewDocumentQuery = useQuery({
    queryKey: ['gists', 'viewer-preview', filename, language ?? '', resolvedContent, themeName],
    queryFn: () => buildPreviewDocument(filename, language, resolvedContent, theme, isDark),
    enabled: showPreview && (!needsRemoteContent || fileContentQuery.isSuccess),
    staleTime: Infinity,
  });
  const previewDocument = previewDocumentQuery.data ?? null;
  const canCopyContent = !needsRemoteContent || fileContentQuery.isSuccess;
  const isShowingPreview = showPreview && Boolean(previewDocument);

  React.useEffect(() => {
    if (showPreview && previewDocumentQuery.isError) {
      setShowPreview(false);
    }
  }, [previewDocumentQuery.isError, showPreview]);

  const copyValue = React.useCallback((value: string, label: string) => {
    Clipboard.setString(value);
    Alert.alert(t('common.copied'), `${label} ${t('common.copied').toLowerCase()}`);
  }, [t]);

  return (
    <AppScreen>
      <View style={styles.container}>
        <AppPageHeader title={filename} />

        <ScrollView
          contentContainerStyle={styles.actions}
          horizontal
          showsHorizontalScrollIndicator={false}>
          <ViewerActionButton
            accessibilityLabel={showPreview ? t('viewer.showSource') : t('viewer.showPreview')}
            active={showPreview}
            icon={
              <ActionIcon
                color={showPreview ? theme.colors.accentContrast : theme.colors.textPrimary}
                name={showPreview ? 'source' : 'preview'}
              />
            }
            onPress={() => setShowPreview(current => !current)}
          />
          {!showPreview ? (
            <ViewerActionButton
              accessibilityLabel={showLines ? t('viewer.hideLines') : t('viewer.showLines')}
              active={showLines}
              icon={
                <ActionIcon
                  color={showLines ? theme.colors.accentContrast : theme.colors.textPrimary}
                  name="lines"
                />
              }
              onPress={() => setShowLines(current => !current)}
            />
          ) : null}
          <ViewerActionButton
            accessibilityLabel={t('viewer.copyContent')}
            disabled={!canCopyContent}
            icon={<ActionIcon color={theme.colors.textPrimary} name="copy" />}
            onPress={() => {
              if (!canCopyContent) {
                return;
              }

              copyValue(resolvedContent, t('viewer.copyContentLabel'));
            }}
          />
          <ViewerActionButton
            accessibilityLabel={t('viewer.copyGistLink')}
            icon={<ActionIcon color={theme.colors.textPrimary} name="gist-link" />}
            onPress={() => copyValue(resolvedGistUrl, t('viewer.copyGistLinkLabel'))}
          />
          <ViewerActionButton
            accessibilityLabel={t('viewer.copyFileLink')}
            icon={<ActionIcon color={theme.colors.textPrimary} name="file-link" />}
            onPress={() => copyValue(fileUrl, t('viewer.copyFileLinkLabel'))}
          />
          <ViewerActionButton
            accessibilityLabel={t('viewer.shareLink')}
            icon={<ActionIcon color={theme.colors.textPrimary} name="share" />}
            onPress={() => {
              Share.share({message: fileUrl}).catch(() => {
                Alert.alert(t('viewer.shareErrorTitle'), t('viewer.shareErrorDescription'));
              });
            }}
          />
        </ScrollView>

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
                fileContentQuery.refetch();
              }}
            />
          ) : showPreview && previewDocumentQuery.isLoading ? (
            <AppLoadingState
              label={t('viewer.renderingTitle')}
              description={t('viewer.renderingDescription')}
            />
          ) : isShowingPreview ? (
            <WebView
              nestedScrollEnabled
              originWhitelist={['*']}
              source={{html: previewDocument ?? '', baseUrl: resolvedGistUrl}}
              style={styles.preview}
              testID="gist-render-preview"
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

const getStyles = createThemedStyles(theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.xl,
      gap: theme.spacing.md,
    },
    actions: {
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingRight: theme.spacing.md,
    },
    actionButton: {
      width: 48,
      height: 48,
      borderRadius: theme.radius.md,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionButtonActive: {
      borderColor: theme.colors.accent,
      backgroundColor: theme.colors.accent,
    },
    actionButtonDisabled: {
      opacity: 0.45,
    },
    actionButtonPressed: {
      opacity: 0.88,
      transform: [{scale: 0.96}],
    },
    codeShell: {
      flex: 1,
      minHeight: 0,
      padding: theme.spacing.sm,
    },
    preview: {
      flex: 1,
      minHeight: 0,
      backgroundColor: theme.colors.surface,
    },
  }),
);
