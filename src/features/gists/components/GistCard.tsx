import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import type {Gist} from '../../../types/gist';
import {useAppTheme} from '../../../app/theme/context';
import {createThemedStyles} from '../../../app/theme/tokens';
import {AppBadge} from '../../../shared/ui/AppBadge';
import {AppCard} from '../../../shared/ui/AppCard';

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

function GistCardComponent({gist, onPressGist}: GistCardProps) {
  const {themeName} = useAppTheme();
  const styles = getStyles(themeName);
  const files = Object.values(gist.files);
  const owner = gist.owner?.login ?? gist.user?.login ?? 'Unknown';
  const description = gist.description?.trim() || 'Untitled gist';
  const fileNames = files.map(file => file.filename).filter(Boolean);
  const handlePress = React.useCallback(() => {
    onPressGist?.(gist.id);
  }, [gist.id, onPressGist]);

  return (
    <Pressable
      accessibilityRole={onPressGist ? 'button' : undefined}
      accessibilityLabel={description}
      onPress={onPressGist ? handlePress : undefined}
      style={({pressed}) => [pressed && onPressGist ? styles.pressed : null]}>
      <AppCard>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>{description}</Text>
            <Text style={styles.owner}>@{owner}</Text>
          </View>
          <AppBadge label={gist.public ? 'Public' : 'Secret'} tone={gist.public ? 'public' : 'secret'} />
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>
            {files.length} file{files.length === 1 ? '' : 's'}
          </Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.metaText}>{gist.comments} comments</Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.metaText}>Updated {formatDate(gist.updated_at)}</Text>
        </View>

        <View style={styles.files}>
          {fileNames.slice(0, 3).map(filename => (
            <Text key={filename} style={styles.fileName}>
              {filename}
            </Text>
          ))}
          {fileNames.length > 3 ? (
            <Text style={styles.moreFiles}>+{fileNames.length - 3} more files</Text>
          ) : null}
        </View>
      </AppCard>
    </Pressable>
  );
}

export const GistCard = React.memo(GistCardComponent);

const getStyles = createThemedStyles(theme =>
  StyleSheet.create({
    pressed: {
      opacity: 0.92,
      transform: [{scale: 0.99}],
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
    },
    headerContent: {
      flex: 1,
      gap: theme.spacing.xs,
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: 17,
      fontWeight: '800',
    },
    owner: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      fontWeight: '600',
    },
    metaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    metaText: {
      color: theme.colors.textSecondary,
      fontSize: 13,
    },
    metaDot: {
      color: theme.colors.border,
      fontSize: 12,
    },
    files: {
      gap: theme.spacing.xs,
    },
    fileName: {
      color: theme.colors.textPrimary,
      fontSize: 14,
      fontWeight: '600',
    },
    moreFiles: {
      color: theme.colors.textSecondary,
      fontSize: 13,
    },
  }),
);
