import React, {useCallback, useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  useColorScheme,
  RefreshControl,
  Platform,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/types';
import {
  getGist,
  starGist,
  unstarGist,
  isGistStarred,
  forkGist,
  deleteGist,
  getGistComments,
  addGistComment,
} from '../api/gistApi';
import type {GistWithHistory, GistComment} from '../types/gist';
import {lightTheme, darkTheme} from '../constants/theme';
import {timeAgo, truncate, getFileIcon} from '../utils/format';
import {useAuth} from '../contexts/AuthContext';
import {useI18n} from '../i18n/context';

type Props = NativeStackScreenProps<RootStackParamList, 'GistDetail'>;

export default function GistDetailScreen({route, navigation}: Props) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;
  const {colors} = theme;
  const {user} = useAuth();
  const {gistId} = route.params;
  const {t} = useI18n();

  const [gist, setGist] = useState<GistWithHistory | null>(null);
  const [comments, setComments] = useState<GistComment[]>([]);
  const [isStarred, setIsStarred] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newComment, setNewComment] = useState('');

  const fetchData = async () => {
    try {
      const [gistData, starred, commentsData] = await Promise.all([
        getGist(gistId),
        isGistStarred(gistId),
        getGistComments(gistId),
      ]);
      setGist(gistData);
      setIsStarred(starred);
      setComments(commentsData);
    } catch (error) {
      console.error('Failed to fetch gist:', error);
      Alert.alert(t('common.error'), t('gist.loadError'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      fetchData();
    }, [gistId]),
  );

  const handleStar = async () => {
    try {
      if (isStarred) await unstarGist(gistId);
      else await starGist(gistId);
      setIsStarred(!isStarred);
    } catch {
      Alert.alert(t('common.error'), t('gist.starError'));
    }
  };

  const handleFork = async () => {
    try {
      const forked = await forkGist(gistId);
      Alert.alert('', t('gist.forkSuccess'));
      navigation.navigate('GistDetail', {gistId: forked.id});
    } catch {
      Alert.alert(t('common.error'), t('gist.forkError'));
    }
  };

  const handleDelete = () => {
    Alert.alert(
      t('common.delete'),
      t('gist.deleteConfirm'),
      [
        {text: t('common.cancel'), style: 'cancel'},
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGist(gistId);
              navigation.goBack();
            } catch {
              Alert.alert(t('common.error'), t('gist.loadError'));
            }
          },
        },
      ],
    );
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const comment = await addGistComment(gistId, newComment.trim());
      setComments(prev => [...prev, comment]);
      setNewComment('');
    } catch {
      Alert.alert(t('common.error'), t('gist.loadError'));
    }
  };

  const isOwner = gist?.owner?.login === user?.login;

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{flexDirection: 'row', gap: 12}}>
          {isOwner && (
            <TouchableOpacity
              onPress={() => {
                if (!gist) return;
                navigation.navigate('GistEditor', {
                  mode: 'edit',
                  gistId: gist.id,
                  description: gist.description,
                  isPublic: gist.public,
                  files: Object.fromEntries(
                    Object.entries(gist.files).map(
                      ([_, file]) =>
                        [
                          (file as any).filename,
                          {content: (file as any).content, filename: (file as any).filename},
                        ] as [string, any],
                    ),
                  ),
                });
              }}>
              <Text style={{color: colors.headerText, fontSize: 16}}>✏️</Text>
            </TouchableOpacity>
          )}
          {isOwner && (
            <TouchableOpacity onPress={handleDelete}>
              <Text style={{color: colors.headerText, fontSize: 16}}>🗑️</Text>
            </TouchableOpacity>
          )}
        </View>
      ),
    });
  }, [navigation, gist, isOwner, colors.headerText]);

  if (isLoading) {
    return (
      <View style={[styles.loading, {backgroundColor: colors.bgPrimary}]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!gist) return null;

  const fileEntries = Object.entries(gist.files) as [string, any][];

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: colors.bgPrimary}]}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => {
            setIsRefreshing(true);
            fetchData();
          }}
          tintColor={colors.accent}
        />
      }>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={[styles.desc, {color: colors.textPrimary}]}>
            {gist.description || t('gist.noDescription')}
          </Text>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: gist.public ? colors.greenBg : colors.yellowBg,
              },
            ]}>
            <Text
              style={[
                styles.badgeText,
                {color: gist.public ? colors.success : colors.warning},
              ]}>
              {gist.public ? t('common.public') : t('common.secret')}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('UserProfile', {username: gist.owner.login})
            }>
            <Text style={[styles.owner, {color: colors.textLink}]}>
              {gist.owner.login}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.meta, {color: colors.textSecondary}]}>
            · {timeAgo(gist.created_at)}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <Text style={[styles.statText, {color: colors.textSecondary}]}>
            {fileEntries.length} {t('common.files')}
            {fileEntries.length !== 1 ? 's' : ''}
          </Text>
          <Text style={[styles.statText, {color: colors.textSecondary}]}>
            · {gist.comments} {t('common.comments').toLowerCase()}
          </Text>
        </View>

        {/* Action buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, {borderColor: colors.border}]}
            onPress={handleStar}>
            <Text style={{fontSize: 14, marginRight: 4}}>
              {isStarred ? '★' : '☆'}
            </Text>
            <Text style={[styles.actionBtnText, {color: colors.textPrimary}]}>
              {isStarred ? '★ ' + t('common.starred') : '☆ ' + t('common.star')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, {borderColor: colors.border}]}
            onPress={handleFork}>
            <Text style={{fontSize: 14, marginRight: 4}}>🍴</Text>
            <Text style={[styles.actionBtnText, {color: colors.textPrimary}]}>
              {t('common.forks')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Files */}
      <View style={styles.filesContainer}>
        {fileEntries.map(([_, file]) => (
          <TouchableOpacity
            key={file.filename}
            style={[styles.fileCard, {borderColor: colors.border}]}
            onPress={() =>
              navigation.navigate('GistViewer', {
                gistId: gist.id,
                filename: file.filename,
                content: file.content,
              })
            }>
            <View style={styles.fileHeader}>
              <Text style={{fontSize: 16, marginRight: 8}}>
                {getFileIcon(file.filename)}
              </Text>
              <Text style={[styles.filename, {color: colors.textLink}]}>
                {file.filename}
              </Text>
              <View style={{flex: 1}} />
              {file.language && (
                <Text style={[styles.lang, {color: colors.textSecondary}]}>
                  {file.language}
                </Text>
              )}
              <Text style={[styles.size, {color: colors.textTertiary}]}>
                {(file.size / 1024).toFixed(1)} KB
              </Text>
            </View>
            <View style={[styles.codePreview, {backgroundColor: colors.bgCode}]}>
              <Text
                style={[styles.previewText, {color: colors.textPrimary}]}
                numberOfLines={6}>
                {truncate(file.content, 300)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Comments */}
      {comments.length > 0 && (
        <View style={[styles.commentsSection, {borderColor: colors.border}]}>
          <Text style={[styles.sectionTitle, {color: colors.textPrimary}]}>
            {t('common.comments')} ({comments.length})
          </Text>
          {comments.map(comment => (
            <View key={comment.id} style={styles.commentItem}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('UserProfile', {
                    username: comment.user.login,
                  })
                }>
                <Text style={[styles.commentAuthor, {color: colors.textLink}]}>
                  {comment.user.login}
                </Text>
              </TouchableOpacity>
              <Text style={[styles.commentDate, {color: colors.textSecondary}]}>
                {timeAgo(comment.created_at)}
              </Text>
              <Text style={[styles.commentBody, {color: colors.textPrimary}]}>
                {comment.body}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Add Comment */}
      <View style={styles.addComment}>
        <TextInput
          style={[
            styles.commentInput,
            {
              backgroundColor: colors.bgSecondary,
              borderColor: colors.border,
              color: colors.textPrimary,
            },
          ]}
          placeholder="Add a comment..."
          placeholderTextColor={colors.placeholder}
          value={newComment}
          onChangeText={setNewComment}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
        <TouchableOpacity
          style={[
            styles.commentSubmit,
            {
              backgroundColor: newComment.trim()
                ? colors.btnPrimaryBg
                : colors.bgTertiary,
            },
          ]}
          onPress={handleAddComment}
          disabled={!newComment.trim()}>
          <Text
            style={[
              styles.commentSubmitText,
              {
                color: newComment.trim()
                  ? colors.btnPrimaryText
                  : colors.textTertiary,
              },
            ]}>
            Comment
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{height: 24}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  loading: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  header: {paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8},
  headerTop: {flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8},
  desc: {flex: 1, fontSize: 18, fontWeight: '600', lineHeight: 24, marginRight: 8},
  badge: {borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2, marginTop: 2},
  badgeText: {fontSize: 12, fontWeight: '500'},
  metaRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 4},
  owner: {fontSize: 14, fontWeight: '500'},
  meta: {fontSize: 14, marginHorizontal: 4},
  statsRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 12},
  statText: {fontSize: 13},
  actionsRow: {flexDirection: 'row', gap: 8, marginBottom: 8},
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 6,
  },
  actionBtnText: {fontSize: 13, fontWeight: '500'},
  filesContainer: {paddingHorizontal: 16},
  fileCard: {borderWidth: 1, borderRadius: 6, marginBottom: 12, overflow: 'hidden'},
  fileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  filename: {fontSize: 14, fontWeight: '600'},
  lang: {fontSize: 12, marginLeft: 8},
  size: {fontSize: 12},
  codePreview: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  previewText: {fontSize: 12, fontFamily: Platform.select({ios: 'Menlo', android: 'monospace'}), lineHeight: 18},
  commentsSection: {marginTop: 16, borderTopWidth: 1},
  sectionTitle: {fontSize: 16, fontWeight: '600', paddingVertical: 12, paddingHorizontal: 16},
  commentItem: {paddingHorizontal: 16, paddingVertical: 8},
  commentAuthor: {fontSize: 14, fontWeight: '600'},
  commentDate: {fontSize: 12, marginBottom: 6},
  commentBody: {fontSize: 14, lineHeight: 20},
  addComment: {paddingHorizontal: 16, paddingVertical: 12},
  commentInput: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    minHeight: 80,
    marginBottom: 8,
  },
  commentSubmit: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-end',
  },
  commentSubmitText: {fontSize: 14, fontWeight: '600'},
});
