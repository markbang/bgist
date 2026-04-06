import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import type {Gist} from '../../../types/gist';
import {appTheme} from '../../../app/theme/tokens';
import {AppBadge} from '../../../shared/ui/AppBadge';
import {AppCard} from '../../../shared/ui/AppCard';

interface GistCardProps {
  gist: Gist;
  onPress?: () => void;
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

export function GistCard({gist, onPress}: GistCardProps) {
  const files = Object.values(gist.files);
  const owner = gist.owner?.login ?? gist.user?.login ?? 'Unknown';
  const description = gist.description?.trim() || 'Untitled gist';
  const fileNames = files.map(file => file.filename).filter(Boolean);

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={description}
      onPress={onPress}
      style={({pressed}) => [pressed && onPress ? styles.pressed : null]}>
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

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.92,
    transform: [{scale: 0.99}],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: appTheme.spacing.sm,
  },
  headerContent: {
    flex: 1,
    gap: appTheme.spacing.xs,
  },
  title: {
    color: appTheme.colors.textPrimary,
    fontSize: 17,
    fontWeight: '800',
  },
  owner: {
    color: appTheme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: appTheme.spacing.xs,
  },
  metaText: {
    color: appTheme.colors.textSecondary,
    fontSize: 13,
  },
  metaDot: {
    color: appTheme.colors.border,
    fontSize: 12,
  },
  files: {
    gap: appTheme.spacing.xs,
  },
  fileName: {
    color: appTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  moreFiles: {
    color: appTheme.colors.textSecondary,
    fontSize: 13,
  },
});
