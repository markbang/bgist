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
import {useI18n} from '../i18n/context';

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
  const {t} = useI18n();

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
    setFiles(prev => [...prev, {id: `file-${Date.now()}`, filename: '', content: ''}]);
  };

  const removeFile = (id: string) => {
    if (files.length <= 1) {
      Alert.alert(t('common.error'), t('gist.fileError'));
      return;
    }
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleSubmit = async () => {
    const noFilename = files.find(f => !f.filename.trim());
    if (noFilename) {
      Alert.alert(t('common.error'), t('gist.filenameError'));
      return;
    }

    setIsSubmitting(true);
    try {
      const gistFiles = Object.fromEntries(
        files.map(f => [f.filename, {content: f.content}]),
      );

      console.log('Creating gist with files:', Object.keys(gistFiles));

      let result;
      if (mode === 'edit' && gistId) {
        console.log('Editing gist:', gistId);
        result = await editGist(gistId, {description, files: gistFiles});
      } else {
        console.log('Creating new gist...');
        result = await createGist({description, public: isPublic, files: gistFiles});
      }
      console.log('Gist created/edited, id:', result.id);
      navigation.navigate('GistDetail', {gistId: result.id});
    } catch (error: any) {
      console.error('Failed to save gist:', error);
      Alert.alert(t('common.error'), error.response?.data?.message || t('gist.saveError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, {backgroundColor: colors.bgPrimary}]}>
      <ScrollView style={styles.scrollView}>
        {/* Description */}
        <View style={styles.section}>
          <TextInput
            style={[
              styles.descInput,
              {
                backgroundColor: colors.bgPrimary,
                borderColor: colors.border,
                color: colors.textPrimary,
              },
            ]}
            placeholder={t('gist.description')}
            placeholderTextColor={colors.placeholder}
            value={description}
            onChangeText={setDescription}
            autoCapitalize="sentences"
          />
        </View>

        {/* Visibility */}
        <View style={[styles.visibilityRow, {borderColor: colors.border}]}>
          <TouchableOpacity
            style={[
              styles.visBtn,
              isPublic ? {backgroundColor: colors.btnPrimaryBg} : {backgroundColor: colors.bgSecondary},
            ]}
            onPress={() => setIsPublic(true)}>
            <Text
              style={[
                styles.visBtnText,
                {color: isPublic ? colors.btnPrimaryText : colors.textSecondary},
              ]}>
              🔓 {t('common.public')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.visBtn,
              !isPublic ? {backgroundColor: colors.btnPrimaryBg} : {backgroundColor: colors.bgSecondary},
            ]}
            onPress={() => setIsPublic(false)}>
            <Text
              style={[
                styles.visBtnText,
                {color: !isPublic ? colors.btnPrimaryText : colors.textSecondary},
              ]}>
              🔒 {t('common.secret')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* File Editors */}
        {files.map((file, index) => (
          <View key={file.id} style={[styles.fileSection, {borderColor: colors.border}]}>
            <View style={styles.fileHeader}>
              <Text style={[styles.fileLabel, {color: colors.textSecondary}]}>
                {t('gist.file')} {index + 1}
              </Text>
              <TouchableOpacity onPress={() => removeFile(file.id)} style={styles.removeBtn}>
                <Text style={{color: colors.danger, fontSize: 14}}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={[
                styles.filenameInput,
                {
                  backgroundColor: colors.bgPrimary,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                },
              ]}
              placeholder={t('gist.filename')}
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
              placeholder={t('gist.codePlaceholder')}
              placeholderTextColor={colors.placeholder}
              value={file.content}
              onChangeText={text => updateFile(file.id, {content: text})}
              multiline
              textAlignVertical="top"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="off"
              spellCheck={false}
            />
          </View>
        ))}

        <TouchableOpacity
          style={[styles.addFileBtn, {borderColor: colors.border}]}
          onPress={addFile}>
          <Text style={[styles.addFileText, {color: colors.textLink}]}>
            {t('gist.addFile')}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Submit */}
      <View style={[styles.footer, {borderTopColor: colors.border}]}>
        <TouchableOpacity
          style={[
            styles.submitBtn,
            {backgroundColor: colors.btnPrimaryBg, opacity: isSubmitting ? 0.7 : 1},
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}>
          <Text style={[styles.submitText, {color: colors.btnPrimaryText}]}>
            {isSubmitting
              ? t('gist.saving')
              : mode === 'edit'
              ? t('gist.updateGist')
              : t('gist.createGist')}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  scrollView: {flex: 1},
  section: {padding: 16},
  descInput: {
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
  visBtn: {flex: 1, paddingVertical: 10, alignItems: 'center'},
  visBtnText: {fontSize: 14, fontWeight: '500'},
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
  fileLabel: {fontSize: 13, fontWeight: '500'},
  removeBtn: {padding: 4},
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
  addFileText: {fontSize: 14, fontWeight: '500'},
  footer: {paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1},
  submitBtn: {borderRadius: 6, paddingVertical: 12, alignItems: 'center'},
  submitText: {fontSize: 16, fontWeight: '600'},
});
