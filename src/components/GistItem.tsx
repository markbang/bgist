import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useColorScheme,
  Platform,
} from 'react-native';
import type {Gist} from '../types/gist';
import {lightTheme, darkTheme} from '../constants/theme';
import {timeAgo, getFileIcon, truncate} from '../utils/format';
import {useI18n} from '../i18n/context';

interface GistItemProps {
  gist: Gist;
  onPress: () => void;
}

export default function GistItem({gist, onPress}: GistItemProps) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;
  const {colors} = theme;
  const {t} = useI18n();

  const fileEntries = Object.entries(gist.files);
  const fileCount = fileEntries.length;

  return (
    <Pressable
      style={({pressed}) => [
        styles.container,
        {
          backgroundColor: pressed ? colors.bgTertiary : colors.bgPrimary,
        },
      ]}
      onPress={onPress}>
      {/* Header row */}
      <View style={styles.header}>
        <Text
          style={[
            styles.description,
            {color: colors.textPrimary},
          ]}
          numberOfLines={1}>
          {gist.description || (
            <Text style={{color: colors.textTertiary}}>
              {t('gist.noDescription')}
            </Text>
          )}
        </Text>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: gist.public
                ? colors.greenBg
                : colors.yellowBg,
            },
          ]}>
          <Text
            style={[
              styles.badgeText,
              {
                color: gist.public ? colors.success : colors.warning,
              },
            ]}>
            {gist.public ? t('common.public') : t('common.secret')}
          </Text>
        </View>
      </View>

      {/* Meta row */}
      <View style={styles.metaRow}>
        <Text style={[styles.owner, {color: colors.textLink}]}>
          {gist.owner.login}
        </Text>
        <Text style={[styles.dot, {color: colors.textTertiary}]}>·</Text>
        <Text style={[styles.time, {color: colors.textSecondary}]}>
          {t('common.updated')} {timeAgo(gist.updated_at)}
        </Text>
      </View>

      {/* Files preview */}
      <View style={styles.filesSection}>
        {fileEntries.slice(0, 2).map(([_, file]) => (
          <View key={file.filename} style={styles.fileRow}>
            <Text style={styles.fileIcon}>
              {getFileIcon(file.filename)}
            </Text>
            <Text
              style={[
                styles.filename,
                {color: colors.textPrimary},
              ]}
              numberOfLines={1}>
              {file.filename}
            </Text>
            {file.language && (
              <View style={[styles.langDot, {backgroundColor: '#8b949e'}]} />
            )}
          </View>
        ))}
        {fileCount > 2 && (
          <Text style={[styles.moreFiles, {color: colors.textSecondary}]}>
            +{fileCount - 2} {t('gist.moreFiles')}
          </Text>
        )}
      </View>

      {/* Bottom stats */}
      <View style={styles.statsRow}>
        <Text style={[styles.stat, {color: colors.textTertiary}]}>
          ★ {gist.comments > 0 ? gist.comments : 0}
        </Text>
        <Text style={[styles.stat, {color: colors.textTertiary}]}>
          💬 {gist.comments}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  description: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    marginRight: 8,
  },
  badge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
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
  filesSection: {
    marginBottom: 6,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  fileIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  filename: {
    fontSize: 13,
    fontFamily: Platform.select({ios: 'Menlo', android: 'monospace'}),
    flex: 1,
  },
  langDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 8,
  },
  moreFiles: {
    fontSize: 12,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  stat: {
    fontSize: 12,
  },
});
