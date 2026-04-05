import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/types';
import {createGist, editGist} from '../api/gistApi';
import {lightTheme, darkTheme} from '../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'GistEditor'>;

interface EditorFile {
  id: string;
  filename: string;
  content: string;
}

export default function GistEditorScreen({route, navigation}: Props) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;
  const {colors} = theme;

  const {
    mode = 'create',
    gistId,
    description: initialDescription = '',
    isPublic: initialIsPublic = true,
    files: initialFiles,
  } = route.params || {};

  const [description, setDescription] = useState(initialDescription);
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [files, setFiles] = useState<EditorFile[]>(() => {
    if (initialFiles) {
      return Object.entries(initialFiles).map(([filename, file], index) => ({
        id: `file-${index}`,
        filename,
        content: file.content,
      }));
    }
    return [{id: 'file-0', filename: '', content: ''}];
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateFile = (id: string, updates: Partial<EditorFile>) => {
    setFiles(prev => prev.map(f => (f.id === id ? {...f, ...updates} : f)));
  };

  const addFile = () => {
    const newId = `file-${Date.now()}`;
    setFiles(prev => [...prev, {id: newId, filename: '', content: ''}]);
  };

  const removeFile = (id: string) => {
    if (files.length <= 1) {
      Alert.alert('Error', 'Gist must have at least one file');
      return;
    }
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleSubmit = async () => {
    // Validate
    const emptyFile = files.find(f => !f.filename.trim() && !f.content.trim());
    if (emptyFile) {
      Alert.alert('Error', 'Each file needs a filename or content');
      return;
    }

    const noFilename = files.find(f => !f.filename.trim());
    if (noFilename) {
      Alert.alert('Error', 'All files must have a filename');
      return;
    }

    setIsSubmitting(true);

    try {
      const gistFiles = Object.fromEntries(
        files.map(f => [f.filename, {content: f.content}]),
      );

      let result;
      if (mode === 'edit' && gistId) {
        result = await editGist(gistId, {
          description,
          files: gistFiles,
        });
      } else {
        result = await createGist({
          description,
          public: isPublic,
          files: gistFiles,
        });
      }

      navigation.navigate('GistDetail', {gistId: result.id});
    } catch (error: any) {
      console.error('Failed to save gist:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to save gist',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, {backgroundColor: colors.bgPrimary}]}>
      <ScrollView style={styles.scrollView}>
        {/* Title / Description */}
        <View style={styles.section}>
          <TextInput
            style={[
              styles.descriptionInput,
              {
                backgroundColor: colors.bgSecondary,
                borderColor: colors.border,
                color: colors.textPrimary,
              },
            ]}
            placeholder="Gist description (optional)"
            placeholderTextColor={colors.placeholder}
            value={description}
            onChangeText={setDescription}
            autoCapitalize="sentences"
          />
        </View>

        {/* Visibility Toggle */}
        <View style={[styles.visibilityRow, {borderColor: colors.border}]}>
          <TouchableOpacity
            style={[
              styles.visibilityBtn,
              isPublic
                ? {backgroundColor: colors.btnPrimaryBg}
                : {backgroundColor: colors.bgSecondary},
            ]}
            onPress={() => setIsPublic(true)}>
            <Text
              style={[
                styles.visibilityBtnText,
                {color: isPublic ? colors.btnPrimaryText : colors.textSecondary},
              ]}>
              🔓 Public
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.visibilityBtn,
              !isPublic
                ? {backgroundColor: colors.btnPrimaryBg}
                : {backgroundColor: colors.bgSecondary},
            ]}
            onPress={() => setIsPublic(false)}>
            <Text
              style={[
                styles.visibilityBtnText,
                {color: !isPublic ? colors.btnPrimaryText : colors.textSecondary},
              ]}>
              🔒 Secret
            </Text>
          </TouchableOpacity>
        </View>

        {/* File Editors */}
        {files.map((file, index) => (
          <View
            key={file.id}
            style={[styles.fileSection, {borderColor: colors.border}]}>
            <View style={styles.fileHeader}>
              <Text style={[styles.fileLabel, {color: colors.textSecondary}]}>
                File {index + 1}
              </Text>
              <TouchableOpacity
                onPress={() => removeFile(file.id)}
                style={styles.removeFileBtn}>
                <Text style={{color: colors.danger, fontSize: 14}}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={[
                styles.filenameInput,
                {
                  backgroundColor: colors.bgSecondary,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                },
              ]}
              placeholder="filename.ext (e.g. script.js)"
              placeholderTextColor={colors.placeholder}
              value={file.filename}
              onChangeText={text => updateFile(file.id, {filename: text})}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TextInput
              style={[
                styles.codeInput,
                {
                  backgroundColor: colors.bgCode,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                },
              ]}
              placeholder="Write your code here..."
              placeholderTextColor={colors.placeholder}
              value={file.content}
              onChangeText={text => updateFile(file.id, {content: text})}
              multiline
              textAlignVertical="top"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="off"
              spellCheck={false}
              // Use monospace font for code editing
              // Note: fontFamily might need adjustment per platform
            />
          </View>
        ))}

        {/* Add File Button */}
        <TouchableOpacity
          style={[styles.addFileBtn, {borderColor: colors.border}]}
          onPress={addFile}>
          <Text style={[styles.addFileText, {color: colors.textLink}]}>
            + Add another file
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Submit Button */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.bgPrimary,
            borderTopColor: colors.border,
          },
        ]}>
        <TouchableOpacity
          style={[
            styles.submitBtn,
            {
              backgroundColor: colors.btnPrimaryBg,
              opacity: isSubmitting ? 0.7 : 1,
            },
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}>
          <Text
            style={[
              styles.submitBtnText,
              {color: colors.btnPrimaryText},
            ]}>
            {isSubmitting
              ? 'Saving...'
              : mode === 'edit'
              ? 'Update Gist'
              : 'Create Gist'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  descriptionInput: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  visibilityRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 6,
    overflow: 'hidden',
  },
  visibilityBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  visibilityBtnText: {
    fontSize: 14,
    fontWeight: '500',
  },
  fileSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 6,
    overflow: 'hidden',
  },
  fileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  fileLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  removeFileBtn: {
    padding: 4,
  },
  filenameInput: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: Platform.select({ios: 'Menlo', android: 'monospace'}),
  },
  codeInput: {
    borderWidth: 1,
    borderTopWidth: 0,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 13,
    minHeight: 200,
    fontFamily: Platform.select({ios: 'Menlo', android: 'monospace'}),
    lineHeight: 20,
  },
  addFileBtn: {
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 6,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  addFileText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  submitBtn: {
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
