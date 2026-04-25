import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Gist } from '../../../types/gist';
import { useAppTheme } from '../../../app/theme/context';
import { createThemedStyles } from '../../../app/theme/tokens';
import { AppBadge } from '../../../shared/ui/AppBadge';
import { AppCard } from '../../../shared/ui/AppCard';

interface GistCardProps {
  gist: Gist;
  onPressGist?: (gistId: string) => void;
}

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

function GistCardComponent({ gist, onPressGist }: GistCardProps) {
  const { themeName } = useAppTheme();
  const styles = getStyles(themeName);
  const files = Object.values(gist.files);
  const primaryFile = files[0];
  const owner = gist.owner?.login ?? gist.user?.login ?? 'Unknown';
  const description = gist.description?.trim() || 'Untitled gist';
  const fileNames = files.map(file => file.filename).filter(Boolean);
  const visibleFileNames = fileNames.slice(0, 3);
  const previewLine =
    primaryFile?.content
      ?.split('\n')
      .map(line => line.trim())
      .find(Boolean) ??
    primaryFile?.filename ??
    'No file preview';
  const handlePress = React.useCallback(() => {
    onPressGist?.(gist.id);
  }, [gist.id, onPressGist]);

  return (
    <Pressable
      accessibilityRole={onPressGist ? 'button' : undefined}
      accessibilityLabel={description}
      onPress={onPressGist ? handlePress : undefined}
      style={({ pressed }) => [pressed && onPressGist ? styles.pressed : null]}
    >
      <AppCard style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text numberOfLines={2} style={styles.title}>
              {description}
            </Text>
            <View style={styles.supportingRow}>
              <Text numberOfLines={1} style={styles.owner}>
                @{owner}
              </Text>
              <Text style={styles.supportingDot}>•</Text>
              <Text numberOfLines={1} style={styles.supportingText}>
                {formatDate(gist.updated_at)}
              </Text>
            </View>
          </View>
          <AppBadge
            label={gist.public ? 'Public' : 'Secret'}
            tone={gist.public ? 'public' : 'secret'}
          />
        </View>

        <View style={styles.previewPanel}>
          <View style={styles.previewRail} />
          <View style={styles.previewCopy}>
            <Text numberOfLines={1} style={styles.previewFile}>
              {primaryFile?.filename ?? 'gist'}
            </Text>
            <Text numberOfLines={2} style={styles.previewLine}>
              {previewLine}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.filePills}>
            {visibleFileNames.map(filename => (
              <View key={filename} style={styles.filePill}>
                <Text numberOfLines={1} style={styles.filePillText}>
                  {filename}
                </Text>
              </View>
            ))}
            {fileNames.length > 3 ? (
              <View style={styles.filePill}>
                <Text style={styles.moreFiles}>+{fileNames.length - 3}</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.metaText}>
              {files.length} file{files.length === 1 ? '' : 's'}
            </Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaText}>{gist.comments} comments</Text>
          </View>
        </View>
      </AppCard>
    </Pressable>
  );
}

export const GistCard = React.memo(GistCardComponent);

const getStyles = createThemedStyles(theme =>
  StyleSheet.create({
    card: {
      gap: theme.spacing.sm,
    },
    pressed: {
      opacity: 0.92,
      transform: [{ scale: 0.99 }],
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
    },
    headerContent: {
      flex: 1,
      gap: theme.spacing.xs + 2,
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: 17,
      lineHeight: 22,
      fontWeight: '900',
      letterSpacing: 0,
    },
    supportingRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: theme.spacing.xs + 2,
    },
    owner: {
      color: theme.colors.accent,
      fontSize: 13,
      fontWeight: '800',
    },
    supportingText: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      fontWeight: '600',
    },
    supportingDot: {
      color: theme.colors.border,
      fontSize: 12,
    },
    previewPanel: {
      flexDirection: 'row',
      overflow: 'hidden',
      borderRadius: theme.radius.sm,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.codeBg,
    },
    previewRail: {
      width: 4,
      backgroundColor: theme.colors.accent,
    },
    previewCopy: {
      flex: 1,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
      gap: theme.spacing.xs,
    },
    previewFile: {
      color: theme.colors.accent,
      fontSize: 12,
      fontWeight: '800',
    },
    previewLine: {
      color: theme.colors.codeText,
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '600',
    },
    footer: {
      gap: theme.spacing.sm,
    },
    statsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: theme.spacing.xs + 2,
    },
    metaText: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      fontWeight: '700',
    },
    metaDot: {
      color: theme.colors.border,
      fontSize: 12,
    },
    filePills: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs + 2,
    },
    filePill: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs - 1,
    },
    filePillText: {
      color: theme.colors.textPrimary,
      fontSize: 12,
      fontWeight: '800',
    },
    moreFiles: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      fontWeight: '700',
    },
  }),
);
