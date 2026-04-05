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

type Props = NativeStackScreenProps<RootStackParamList, 'GistDetail'>;

export default function GistDetailScreen({route, navigation}: Props) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;
  const {colors} = theme;
  const {user} = useAuth();
  const {gistId} = route.params;

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
      Alert.alert('Error', 'Failed to load gist');
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

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  const handleStar = async () => {
    try {
      if (isStarred) {
        await unstarGist(gistId);
      } else {
        await starGist(gistId);
      }
      setIsStarred(!isStarred);
    } catch (error) {
      Alert.alert('Error', 'Failed to update star');
    }
  };

  const handleFork = async () => {
    try {
      const forkedGist = await forkGist(gistId);
      Alert.alert('Success', 'Gist forked!');
      navigation.navigate('GistDetail', {gistId: forkedGist.id});
    } catch (error) {
      Alert.alert('Error', 'Failed to fork gist');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Gist',
      'Are you sure you want to delete this gist? This action cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGist(gistId);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete gist');
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
    } catch (error) {
      Alert.alert('Error', 'Failed to add comment');
    }
  };

  const isOwner = gist?.owner?.login === user?.login;

  // Update header buttons
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
              <Text style={{color: colors.headerText, fontSize: 16}}>
                ✏️
              </Text>
            </TouchableOpacity>
          )}
          {isOwner && (
            <TouchableOpacity onPress={handleDelete}>
              <Text style={{color: colors.headerText, fontSize: 16}}>
                🗑️
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ),
    });
  }, [navigation, gist, isOwner, colors.headerText]);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, {backgroundColor: colors.bgPrimary}]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!gist) return null;

  const fileEntries = Object.entries(gist.files);
  const fileNames = fileEntries.map(([_, f]) => f.filename).join(', ');

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: colors.bgPrimary}]}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={colors.accent}
        />
      }>
      {/* Header Info */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text
            style={[
              styles.description,
              {color: colors.textPrimary},
            ]}>
            {gist.description || 'No description'}
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

        <View style={styles.metaRow}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('UserProfile', {
                username: gist.owner.login,
              })
            }>
            <Text style={[styles.ownerName, {color: colors.textLink}]}>
              {gist.owner.login}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.metaText, {color: colors.textSecondary}]}>
            · {timeAgo(gist.created_at)}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <Text style={[styles.statsText, {color: colors.textSecondary}]}>
            {fileEntries.length} file{fileEntries.length !== 1 ? 's' : ''}
          </Text>
          <Text style={[styles.statsText, {color: colors.textSecondary}]}>
            · {gist.forks_url ? 'Forks' : ''} {gist.comments} comment{gist.comments !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, {borderColor: colors.border}]}
            onPress={handleStar}>
            <Text style={{fontSize: 14, marginRight: 4}}>
              {isStarred ? '★' : '☆'}
            </Text>
            <Text style={[styles.actionBtnText, {color: colors.textPrimary}]}>
              {isStarred ? 'Starred' : 'Star'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, {borderColor: colors.border}]}
            onPress={handleFork}>
            <Text style={{fontSize: 14, marginRight: 4}}>🍴</Text>
            <Text style={[styles.actionBtnText, {color: colors.textPrimary}]}>
              Fork
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Files */}
      <View style={styles.filesContainer}>
        {fileEntries.map(([key, file]: [string, any]) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.fileCard,
              {backgroundColor: colors.bgPrimary, borderColor: colors.border},
            ]}
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
              <Text
                style={[
                  styles.filename,
                  {color: colors.textLink},
                ]}>
                {file.filename}
              </Text>
              <View style={{flex: 1}} />
              {file.language && (
                <Text style={[styles.language, {color: colors.textSecondary}]}>
                  {file.language}
                </Text>
              )}
              <Text style={[styles.fileSize, {color: colors.textTertiary}]}>
                {(file.size / 1024).toFixed(1)} KB
              </Text>
            </View>
            {/* Preview */}
            <View
              style={[
                styles.codePreview,
                {backgroundColor: colors.bgCode},
              ]}>
              <Text
                style={[
                  styles.previewText,
                  {color: colors.textPrimary},
                ]}
                numberOfLines={6}>
                {truncate(file.content, 300)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Comments */}
      {comments.length > 0 && (
        <View style={[styles.commentsContainer, {borderColor: colors.border}]}>
          <Text style={[styles.sectionTitle, {color: colors.textPrimary}]}>
            Comments ({comments.length})
          </Text>
          {comments.map(comment => (
            <View key={comment.id} style={styles.commentItem}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('UserProfile', {
                    username: comment.user.login,
                  })
                }>
                <Text
                  style={[
                    styles.commentAuthor,
                    {color: colors.textLink},
                  ]}>
                  {comment.user.login}
                </Text>
              </TouchableOpacity>
              <Text style={[styles.commentDate, {color: colors.textSecondary}]}>
                commented {timeAgo(comment.created_at)}
              </Text>
              <Text style={[styles.commentBody, {color: colors.textPrimary}]}>
                {comment.body}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Add Comment */}
      <View style={styles.addCommentContainer}>
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
            styles.commentSubmitBtn,
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
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  description: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  visibilityBadge: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  visibilityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ownerName: {
    fontSize: 14,
    fontWeight: '500',
  },
  metaText: {
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsText: {
    fontSize: 13,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 6,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '500',
  },
  filesContainer: {
    paddingHorizontal: 16,
  },
  fileCard: {
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 12,
    overflow: 'hidden',
  },
  fileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  filename: {
    fontSize: 14,
    fontWeight: '600',
  },
  language: {
    fontSize: 12,
    marginLeft: 8,
  },
  fileSize: {
    fontSize: 12,
  },
  codePreview: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  previewText: {
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  commentsContainer: {
    marginTop: 16,
    borderTopWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  commentItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
  },
  commentDate: {
    fontSize: 12,
    marginBottom: 6,
  },
  commentBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  addCommentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  commentInput: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    minHeight: 80,
    marginBottom: 8,
  },
  commentSubmitBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-end',
  },
  commentSubmitText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
