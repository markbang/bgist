import React from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import {appTheme} from '../../../app/theme/tokens';
import type {
  GistEditorDraftFile,
  RootStackScreenProps,
} from '../../../app/navigation/types';
import type {EditGistParams, GistFile} from '../../../types/gist';
import {queryKeys} from '../../../shared/api/queryKeys';
import {AppBadge} from '../../../shared/ui/AppBadge';
import {AppButton} from '../../../shared/ui/AppButton';
import {AppCard} from '../../../shared/ui/AppCard';
import {AppErrorState} from '../../../shared/ui/AppErrorState';
import {AppLoadingState} from '../../../shared/ui/AppLoadingState';
import {AppScreen} from '../../../shared/ui/AppScreen';
import {useI18n} from '../../../i18n/context';
import {getGist} from '../api/gists';
import {useGistMutations} from '../hooks/useGistMutations';

type DraftFile = {
  id: string;
  originalFilename: string | null;
  filename: string;
  content: string;
};

let nextDraftId = 0;

function createDraftId() {
  nextDraftId += 1;
  return `draft-${nextDraftId}`;
}

function createBlankFile(): DraftFile {
  return {
    id: createDraftId(),
    originalFilename: null,
    filename: '',
    content: '',
  };
}

function createDraftFilesFromRoute(files?: GistEditorDraftFile[]): DraftFile[] {
  if (!files?.length) {
    return [];
  }

  return files.map(file => ({
    id: createDraftId(),
    originalFilename: file.filename,
    filename: file.filename,
    content: file.content,
  }));
}

function createDraftFilesFromGist(files: Record<string, GistFile>): DraftFile[] {
  return Object.values(files).map(file => ({
    id: createDraftId(),
    originalFilename: file.filename,
    filename: file.filename,
    content: file.content ?? '',
  }));
}

function buildEditFilesPayload(files: DraftFile[], deletedOriginalFilenames: string[]): EditGistParams['files'] {
  const payload: EditGistParams['files'] = {};

  deletedOriginalFilenames.forEach(filename => {
    payload[filename] = null;
  });

  files.forEach(file => {
    const nextFilename = file.filename.trim();

    if (!nextFilename) {
      return;
    }

    if (file.originalFilename && file.originalFilename !== nextFilename) {
      payload[file.originalFilename] = {
        filename: nextFilename,
        content: file.content,
      };
      return;
    }

    payload[nextFilename] = {
      content: file.content,
    };
  });

  return payload;
}

export function GistEditorScreen({navigation, route}: RootStackScreenProps<'GistEditor'>) {
  const {t} = useI18n();
  const isEditMode = route.params.mode === 'edit';
  const editGistId = isEditMode ? route.params.gistId : null;
  const routeDraftFiles = route.params.files;
  const [description, setDescription] = React.useState(route.params.description ?? '');
  const [isPublic, setIsPublic] = React.useState(route.params.isPublic ?? true);
  const [files, setFiles] = React.useState<DraftFile[]>(() => {
    const seededFiles = createDraftFilesFromRoute(routeDraftFiles);

    if (seededFiles.length > 0) {
      return seededFiles;
    }

    return isEditMode ? [] : [createBlankFile()];
  });
  const [deletedOriginalFilenames, setDeletedOriginalFilenames] = React.useState<string[]>([]);
  const [hasHydratedEditState, setHasHydratedEditState] = React.useState(
    !isEditMode || Boolean(routeDraftFiles?.length),
  );
  const {createGistMutation, editGistMutation} = useGistMutations();

  const existingGistQuery = useQuery({
    queryKey: editGistId ? queryKeys.gistDetail(editGistId) : ['gists', 'detail', 'create'],
    queryFn: () => getGist(editGistId as string),
    enabled: Boolean(editGistId) && !hasHydratedEditState,
  });

  React.useEffect(() => {
    if (!isEditMode || hasHydratedEditState || !existingGistQuery.data) {
      return;
    }

    setDescription(current => current || existingGistQuery.data?.description || '');
    setIsPublic(existingGistQuery.data.public);
    setFiles(createDraftFilesFromGist(existingGistQuery.data.files));
    setHasHydratedEditState(true);
  }, [existingGistQuery.data, hasHydratedEditState, isEditMode]);

  const updateFile = React.useCallback((fileId: string, updates: Partial<DraftFile>) => {
    setFiles(current =>
      current.map(file => (file.id === fileId ? {...file, ...updates} : file)),
    );
  }, []);

  const addFile = React.useCallback(() => {
    setFiles(current => [...current, createBlankFile()]);
  }, []);

  const removeFile = React.useCallback((fileId: string) => {
    setFiles(current => {
      if (current.length <= 1) {
        Alert.alert(t('editor.keepOneFileTitle'), t('editor.keepOneFileDescription'));
        return current;
      }

      const nextFile = current.find(file => file.id === fileId);

      if (nextFile?.originalFilename) {
        setDeletedOriginalFilenames(previous =>
          previous.includes(nextFile.originalFilename!)
            ? previous
            : [...previous, nextFile.originalFilename!],
        );
      }

      return current.filter(file => file.id !== fileId);
    });
  }, [t]);

  const handleSubmit = React.useCallback(async () => {
    const trimmedDescription = description.trim();
    const normalizedFilenames = files.map(file => file.filename.trim());

    if (normalizedFilenames.some(name => !name)) {
      Alert.alert(t('editor.missingFilenameTitle'), t('editor.missingFilenameDescription'));
      return;
    }

    if (new Set(normalizedFilenames).size !== normalizedFilenames.length) {
      Alert.alert(t('editor.duplicateFilenameTitle'), t('editor.duplicateFilenameDescription'));
      return;
    }

    try {
      if (isEditMode) {
        const filesPayload = buildEditFilesPayload(files, deletedOriginalFilenames);
        const result = await editGistMutation.mutateAsync({
          gistId: route.params.gistId,
          params: {
            description: trimmedDescription,
            files: filesPayload,
          },
        });

        navigation.navigate('GistDetail', {gistId: result.id});
        return;
      }

      const result = await createGistMutation.mutateAsync({
        description: trimmedDescription,
        public: isPublic,
        files: Object.fromEntries(
          files.map(file => [
            file.filename.trim(),
            {
              content: file.content,
            },
          ]),
        ),
      });

      navigation.navigate('GistDetail', {gistId: result.id});
    } catch {
      Alert.alert(t('editor.saveErrorTitle'), t('editor.saveErrorDescription'));
    }
  }, [
    createGistMutation,
    deletedOriginalFilenames,
    description,
    editGistMutation,
    files,
    isEditMode,
    isPublic,
    navigation,
    route.params,
    t,
  ]);

  if (isEditMode && !hasHydratedEditState && existingGistQuery.isLoading) {
    return (
      <AppScreen>
        <AppLoadingState
          label={t('editor.loadingDraftTitle')}
          description={t('editor.loadingDraftDescription')}
        />
      </AppScreen>
    );
  }

  if (isEditMode && !hasHydratedEditState && existingGistQuery.isError) {
    return (
      <AppScreen>
        <AppErrorState
          title={t('editor.errorDraftTitle')}
          description={t('editor.errorDraftDescription')}
          onRetry={() => {
            void existingGistQuery.refetch();
          }}
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}>
        <View style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <Text style={styles.eyebrow}>{isEditMode ? t('editor.editEyebrow') : t('editor.createEyebrow')}</Text>
              <Text style={styles.title}>{isEditMode ? t('editor.editTitle') : t('editor.createTitle')}</Text>
              <Text style={styles.subtitle}>
                {isEditMode
                  ? t('editor.editSubtitle')
                  : t('editor.createSubtitle')}
              </Text>
            </View>

            <AppCard>
              <Text style={styles.sectionTitle}>{t('editor.detailsTitle')}</Text>
              <TextInput
                accessibilityLabel="Gist description"
                onChangeText={setDescription}
                placeholder={t('editor.descriptionPlaceholder')}
                placeholderTextColor={appTheme.colors.textSecondary}
                style={styles.descriptionInput}
                value={description}
              />

              <View style={styles.visibilityHeader}>
                <Text style={styles.label}>{t('editor.visibility')}</Text>
                <AppBadge
                  label={isPublic ? t('common.public') : t('common.secret')}
                  tone={isPublic ? 'public' : 'secret'}
                />
              </View>

              {isEditMode ? (
                <Text style={styles.helperText}>{t('editor.visibilityLocked')}</Text>
              ) : (
                <View style={styles.visibilityButtons}>
                  <AppButton
                    fullWidth={false}
                    label={t('common.public')}
                    onPress={() => setIsPublic(true)}
                    variant={isPublic ? 'primary' : 'secondary'}
                  />
                  <AppButton
                    fullWidth={false}
                    label={t('common.secret')}
                    onPress={() => setIsPublic(false)}
                    variant={!isPublic ? 'primary' : 'secondary'}
                  />
                </View>
              )}
            </AppCard>

            <View style={styles.fileSectionHeader}>
              <Text style={styles.sectionTitle}>{t('common.files')}</Text>
              <AppButton fullWidth={false} label={t('editor.addFile')} onPress={addFile} variant="secondary" />
            </View>

            {files.map((file, index) => (
              <AppCard key={file.id}>
                <View style={styles.fileHeader}>
                  <View style={styles.fileHeaderText}>
                    <Text style={styles.fileTitle}>{t('editor.fileTitle', {index: index + 1})}</Text>
                    <Text style={styles.fileMeta}>
                      {file.originalFilename
                        ? t('editor.editingFile', {filename: file.originalFilename})
                        : t('editor.newFile')}
                    </Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('editor.removeFileLabel', {index: index + 1})}
                    onPress={() => removeFile(file.id)}
                    style={({pressed}) => [styles.removeButton, pressed ? styles.removePressed : null]}>
                    <Text style={styles.removeButtonText}>{t('editor.remove')}</Text>
                  </Pressable>
                </View>

                <TextInput
                  accessibilityLabel={`Filename ${index + 1}`}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onChangeText={value => updateFile(file.id, {filename: value})}
                  placeholder={t('editor.filenamePlaceholder')}
                  placeholderTextColor={appTheme.colors.textSecondary}
                  style={styles.filenameInput}
                  value={file.filename}
                />
                <TextInput
                  accessibilityLabel={`Content ${index + 1}`}
                  autoCapitalize="none"
                  autoCorrect={false}
                  multiline
                  onChangeText={value => updateFile(file.id, {content: value})}
                  placeholder={t('editor.contentPlaceholder')}
                  placeholderTextColor={appTheme.colors.textSecondary}
                  spellCheck={false}
                  style={styles.contentInput}
                  textAlignVertical="top"
                  value={file.content}
                />
              </AppCard>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <AppButton
              label={isEditMode ? t('editor.saveChanges') : t('gist.createGist')}
              loading={createGistMutation.isPending || editGistMutation.isPending}
              onPress={() => {
                void handleSubmit();
              }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

export default GistEditorScreen;

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: appTheme.spacing.md,
    paddingTop: appTheme.spacing.md,
    paddingBottom: 120,
    gap: appTheme.spacing.md,
  },
  header: {
    gap: appTheme.spacing.sm,
  },
  eyebrow: {
    color: appTheme.colors.accent,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  title: {
    color: appTheme.colors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: appTheme.colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  sectionTitle: {
    color: appTheme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  label: {
    color: appTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  helperText: {
    color: appTheme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  descriptionInput: {
    minHeight: 52,
    borderRadius: appTheme.radius.md,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    backgroundColor: appTheme.colors.canvas,
    color: appTheme.colors.textPrimary,
    fontSize: 15,
    paddingHorizontal: appTheme.spacing.md,
    paddingVertical: appTheme.spacing.sm + 2,
  },
  visibilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: appTheme.spacing.sm,
  },
  visibilityButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: appTheme.spacing.sm,
  },
  fileSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: appTheme.spacing.sm,
  },
  fileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: appTheme.spacing.sm,
  },
  fileHeaderText: {
    flex: 1,
    gap: appTheme.spacing.xs,
  },
  fileTitle: {
    color: appTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  fileMeta: {
    color: appTheme.colors.textSecondary,
    fontSize: 13,
  },
  removeButton: {
    borderRadius: appTheme.radius.md,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
    paddingHorizontal: appTheme.spacing.sm + 2,
    paddingVertical: appTheme.spacing.xs + 2,
  },
  removePressed: {
    opacity: 0.85,
  },
  removeButtonText: {
    color: appTheme.colors.danger,
    fontSize: 13,
    fontWeight: '700',
  },
  filenameInput: {
    minHeight: 52,
    borderRadius: appTheme.radius.md,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    backgroundColor: appTheme.colors.canvas,
    color: appTheme.colors.textPrimary,
    fontSize: 15,
    paddingHorizontal: appTheme.spacing.md,
    paddingVertical: appTheme.spacing.sm + 2,
  },
  contentInput: {
    minHeight: 220,
    borderRadius: appTheme.radius.md,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    backgroundColor: appTheme.colors.codeBg,
    color: appTheme.colors.codeText,
    fontFamily: Platform.select({ios: 'Menlo', android: 'monospace', default: 'monospace'}),
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: appTheme.spacing.md,
    paddingVertical: appTheme.spacing.md,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: appTheme.colors.border,
    backgroundColor: 'rgba(245, 247, 251, 0.96)',
    paddingHorizontal: appTheme.spacing.md,
    paddingTop: appTheme.spacing.sm,
    paddingBottom: appTheme.spacing.md,
  },
});
