import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Platform,
} from 'react-native';
import type {Gist} from '../types/gist';
import {lightTheme, darkTheme} from '../constants/theme';
import {timeAgo, getFileIcon, truncate} from '../utils/format';

interface GistItemProps {
  gist: Gist;
  onPress: () => void;
}

export default function GistItem({gist, onPress}: GistItemProps) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;
  const {colors} = theme;

  const fileEntries = Object.entries(gist.files);
  const firstFile = fileEntries[0];
  const fileCount = fileEntries.length;

  return (
    <TouchableOpacity
      style={[styles.container, {backgroundColor: colors.bgPrimary}]}
      onPress={onPress}
      activeOpacity={0.6}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.description, {color: colors.textPrimary}]}>
          {gist.description || (
            <Text style={{color: colors.textTertiary, fontStyle: 'italic'}}>
              No description
            </Text>
          )}
        </Text>
        <View
          style={[
            styles.visibilityBadge,
            {
              backgroundColor: gist.public
                ? colors.greenBg
                : colors.yellowBg,
              borderColor: gist.public
                ? colors.greenBorder
                : colors.yellowBorder,
            },
          ]}>
          <Text
            style={[
              styles.visibilityText,
              {
                color: gist.public ? colors.success : colors.warning,
              },
            ]}>
            {gist.public ? 'Public' : 'Secret'}
          </Text>
        </View>
      </View>

      {/* Meta info */}
      <View style={styles.metaRow}>
        <Text style={[styles.owner, {color: colors.textLink}]}>
          {gist.owner.login}
        </Text>
        <Text style={[styles.dot, {color: colors.textSecondary}]}>·</Text>
        <Text style={[styles.time, {color: colors.textSecondary}]}>
          Updated {timeAgo(gist.updated_at)}
        </Text>
      </View>

      {/* Files */}
      <View style={styles.filesContainer}>
        {fileEntries.slice(0, 3).map(([key, file]) => (
          <View key={key} style={styles.fileRow}>
            <Text style={{fontSize: 14, marginRight: 6}}>
              {getFileIcon(file.filename)}
            </Text>
            <Text
              style={[
                styles.filename,
                {color: colors.textPrimary},
              ]}>
              {file.filename}
            </Text>
            {file.language && (
              <Text style={[styles.language, {color: colors.textSecondary}]}>
                {file.language}
              </Text>
            )}
          </View>
        ))}
        {fileCount > 3 && (
          <Text style={[styles.moreFiles, {color: colors.textLink}]}>
            +{fileCount - 3} more file{fileCount - 3 > 1 ? 's' : ''}
          </Text>
        )}

        {/* Stats */}
        <View style={styles.statsRow}>
          <Text style={[styles.stat, {color: colors.textSecondary}]}>
            ★ 0
          </Text>
          <Text style={[styles.stat, {color: colors.textSecondary}]}>
            💬 {gist.comments}
          </Text>
          <Text style={[styles.stat, {color: colors.textSecondary}]}>
            📄 {fileCount}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  description: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    marginRight: 8,
  },
  visibilityBadge: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginTop: 2,
  },
  visibilityText: {
    fontSize: 11,
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  owner: {
    fontSize: 13,
    fontWeight: '500',
  },
  dot: {
    fontSize: 13,
    marginHorizontal: 4,
  },
  time: {
    fontSize: 13,
  },
  filesContainer: {
    paddingLeft: 0,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  filename: {
    fontSize: 14,
    fontFamily: Platform.select({ios: 'Menlo', android: 'monospace'}),
  },
  language: {
    fontSize: 12,
    marginLeft: 8,
  },
  moreFiles: {
    fontSize: 13,
    marginTop: 2,
    marginBottom: 6,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  stat: {
    fontSize: 12,
  },
});
