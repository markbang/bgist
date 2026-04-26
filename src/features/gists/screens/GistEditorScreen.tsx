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
import { useQuery } from '@tanstack/react-query';
import { useAppTheme } from '../../../app/theme/context';
import { createThemedStyles } from '../../../app/theme/tokens';
import type {
  GistEditorDraftFile,
  RootStackScreenProps,
} from '../../../app/navigation/types';
import type { EditGistParams, GistFile } from '../../../types/gist';
import { queryKeys } from '../../../shared/api/queryKeys';
import { AppErrorState } from '../../../shared/ui/AppErrorState';
import { AppLoadingState } from '../../../shared/ui/AppLoadingState';
import { AppScreen } from '../../../shared/ui/AppScreen';
import { GistMobileHeader } from '../../../shared/ui/GistMobileHeader';
import { useI18n } from '../../../i18n/context';
import { getGist } from '../api/gists';
import { useGistMutations } from '../hooks/useGistMutations';

type DraftFile = {
  id: string;
  originalFilename: string | null;
  filename: string;
  content: string;
};

type DraftState = {
  files: DraftFile[];
  activeFileId: string | null;
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

function createDraftFilesFromGist(
  files: Record<string, GistFile>,
): DraftFile[] {
  return Object.values(files).map(file => ({
    id: createDraftId(),
    originalFilename: file.filename,
    filename: file.filename,
    content: file.content ?? '',
  }));
}

function createInitialDraftState(
  files: GistEditorDraftFile[] | undefined,
  isEditMode: boolean,
): DraftState {
  const seededFiles = createDraftFilesFromRoute(files);

  if (seededFiles.length > 0) {
    return {
      files: seededFiles,
      activeFileId: seededFiles[0].id,
    };
  }

  if (isEditMode) {
    return {
      files: [],
      activeFileId: null,
    };
  }

  const blankFile = createBlankFile();

  return {
    files: [blankFile],
    activeFileId: blankFile.id,
  };
}

function getDraftFileLabel(
  file: DraftFile,
  index: number,
  t: (key: string, values?: Record<string, string | number>) => string,
) {
  const trimmedFilename = file.filename.trim();

  if (trimmedFilename) {
    return trimmedFilename;
  }

  return t('editor.untitledFile', { index: index + 1 });
}

function getFileExtension(filename: string) {
  const trimmedFilename = filename.trim();
  const extensionIndex = trimmedFilename.lastIndexOf('.');

  if (extensionIndex <= 0 || extensionIndex === trimmedFilename.length - 1) {
    return 'TXT';
  }

  return trimmedFilename.slice(extensionIndex + 1).toUpperCase();
}

function buildEditFilesPayload(
  files: DraftFile[],
  deletedOriginalFilenames: string[],
): EditGistParams['files'] {
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

export function GistEditorScreen({
  navigation,
  route,
}: RootStackScreenProps<'GistEditor'>) {
  const { theme, themeName } = useAppTheme();
  const { t } = useI18n();
  const styles = getStyles(themeName);
  const isEditMode = route.params.mode === 'edit';
  const editGistId = isEditMode ? route.params.gistId : null;
  const routeDraftFiles = route.params.files;
  const initialDraftStateRef = React.useRef<DraftState | null>(null);

  if (!initialDraftStateRef.current) {
    initialDraftStateRef.current = createInitialDraftState(
      routeDraftFiles,
      isEditMode,
    );
  }

  const initialDraftState = initialDraftStateRef.current;
  const [description, setDescription] = React.useState(
    route.params.description ?? '',
  );
  const [isPublic, setIsPublic] = React.useState(route.params.isPublic ?? true);
  const [files, setFiles] = React.useState<DraftFile[]>(
    initialDraftState.files,
  );
  const [activeFileId, setActiveFileId] = React.useState<string | null>(
    initialDraftState.activeFileId,
  );
  const [deletedOriginalFilenames, setDeletedOriginalFilenames] =
    React.useState<string[]>([]);
  const [hasHydratedEditState, setHasHydratedEditState] = React.useState(
    !isEditMode || Boolean(routeDraftFiles?.length),
  );
  const { createGistMutation, editGistMutation } = useGistMutations();

  const existingGistQuery = useQuery({
    queryKey: editGistId
      ? queryKeys.gistDetail(editGistId)
      : ['gists', 'detail', 'create'],
    queryFn: ({ signal }) => getGist(editGistId as string, signal),
    enabled: Boolean(editGistId) && !hasHydratedEditState,
  });

  React.useEffect(() => {
    if (!isEditMode || hasHydratedEditState || !existingGistQuery.data) {
      return;
    }

    setDescription(
      current => current || existingGistQuery.data?.description || '',
    );
    setIsPublic(existingGistQuery.data.public);
    const hydratedFiles = createDraftFilesFromGist(
      existingGistQuery.data.files,
    );

    setFiles(hydratedFiles);
    setActiveFileId(hydratedFiles[0]?.id ?? null);
    setHasHydratedEditState(true);
  }, [existingGistQuery.data, hasHydratedEditState, isEditMode]);

  React.useEffect(() => {
    if (files.length === 0) {
      if (activeFileId !== null) {
        setActiveFileId(null);
      }

      return;
    }

    if (!activeFileId || !files.some(file => file.id === activeFileId)) {
      setActiveFileId(files[0].id);
    }
  }, [activeFileId, files]);

  const updateFile = React.useCallback(
    (fileId: string, updates: Partial<DraftFile>) => {
      setFiles(current =>
        current.map(file =>
          file.id === fileId ? { ...file, ...updates } : file,
        ),
      );
    },
    [],
  );

  const addFile = React.useCallback(() => {
    const nextFile = createBlankFile();

    setFiles(current => [...current, nextFile]);
    setActiveFileId(nextFile.id);
  }, []);

  const removeFile = React.useCallback(
    (fileId: string) => {
      setFiles(current => {
        if (current.length <= 1) {
          Alert.alert(
            t('editor.keepOneFileTitle'),
            t('editor.keepOneFileDescription'),
          );
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
    },
    [t],
  );

  const currentFile =
    files.find(file => file.id === activeFileId) ?? files[0] ?? null;
  const currentFileIndex = currentFile
    ? files.findIndex(file => file.id === currentFile.id)
    : -1;
  const isSaving = createGistMutation.isPending || editGistMutation.isPending;

  const handleSubmit = React.useCallback(async () => {
    const trimmedDescription = description.trim();
    const normalizedFilenames = files.map(file => file.filename.trim());

    if (normalizedFilenames.some(name => !name)) {
      Alert.alert(
        t('editor.missingFilenameTitle'),
        t('editor.missingFilenameDescription'),
      );
      return;
    }

    if (new Set(normalizedFilenames).size !== normalizedFilenames.length) {
      Alert.alert(
        t('editor.duplicateFilenameTitle'),
        t('editor.duplicateFilenameDescription'),
      );
      return;
    }

    try {
      if (isEditMode) {
        const filesPayload = buildEditFilesPayload(
          files,
          deletedOriginalFilenames,
        );
        const result = await editGistMutation.mutateAsync({
          gistId: route.params.gistId,
          params: {
            description: trimmedDescription,
            files: filesPayload,
          },
        });

        navigation.navigate('GistDetail', { gistId: result.id });
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

      navigation.navigate('GistDetail', { gistId: result.id });
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
            existingGistQuery.refetch();
          }}
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        <View style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <GistMobileHeader
              leftAction={{
                label: t('common.cancel'),
                onPress: () => navigation.goBack(),
              }}
              rightAction={{
                label: isEditMode
                  ? t('editor.saveChanges')
                  : t('gist.createGist'),
                loading: isSaving,
                onPress: () => {
                  handleSubmit().catch(() => {});
                },
              }}
              showMark={!isEditMode}
              title={
                isEditMode ? t('editor.editTitle') : t('editor.createTitle')
              }
              subtitle={
                isEditMode ? t('editor.editEyebrow') : t('editor.createEyebrow')
              }
            />

            <View style={styles.formSection}>
              <Text style={styles.fieldLabel}>{t('editor.detailsTitle')}</Text>
              <TextInput
                accessibilityLabel="Gist description"
                onChangeText={setDescription}
                placeholder={t('editor.descriptionPlaceholder')}
                placeholderTextColor={theme.colors.textSecondary}
                style={styles.descriptionInput}
                value={description}
              />
            </View>

            <View style={styles.formSection}>
              <Pressable
                accessibilityLabel={t('editor.visibility')}
                accessibilityRole={isEditMode ? undefined : 'switch'}
                accessibilityState={
                  isEditMode ? { disabled: true } : { checked: isPublic }
                }
                disabled={isEditMode}
                onPress={() => setIsPublic(current => !current)}
                style={({ pressed }) => [
                  styles.visibilityRow,
                  pressed && !isEditMode ? styles.rowPressed : null,
                ]}
              >
                <View style={styles.visibilityCopy}>
                  <Text style={styles.rowTitle}>
                    {isPublic
                      ? t('editor.publicGistLabel')
                      : t('editor.secretGistLabel')}
                  </Text>
                  <Text style={styles.helperText}>
                    {isEditMode
                      ? t('editor.visibilityLocked')
                      : isPublic
                      ? t('editor.publicGistDescription')
                      : t('editor.secretGistDescription')}
                  </Text>
                </View>
                <View
                  style={[
                    styles.switchTrack,
                    isPublic ? styles.switchTrackEnabled : null,
                  ]}
                >
                  <View
                    style={[
                      styles.switchThumb,
                      isPublic ? styles.switchThumbEnabled : null,
                    ]}
                  />
                </View>
              </Pressable>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.fieldLabel}>{t('editor.addFile')}</Text>
              {files.map((file, index) => {
                const isActive = file.id === currentFile?.id;
                const label = getDraftFileLabel(file, index, t);

                return (
                  <View
                    key={file.id}
                    style={[
                      styles.fileRow,
                      isActive ? styles.fileTabActive : null,
                    ]}
                  >
                    <Pressable
                      accessibilityLabel={label}
                      accessibilityRole="button"
                      accessibilityState={isActive ? { selected: true } : {}}
                      onPress={() => setActiveFileId(file.id)}
                      style={({ pressed }) => [
                        styles.fileSelectButton,
                        pressed ? styles.rowPressed : null,
                      ]}
                    >
                      <Text
                        style={[
                          styles.fileRowText,
                          isActive ? styles.fileTabLabelActive : null,
                        ]}
                      >
                        {label}
                      </Text>
                    </Pressable>
                    <Pressable
                      accessibilityLabel={
                        isActive
                          ? t('editor.removeCurrentFile')
                          : t('editor.removeFileLabel', {
                              index: index + 1,
                            })
                      }
                      accessibilityRole="button"
                      onPress={() => removeFile(file.id)}
                      style={({ pressed }) => [
                        styles.removeFileButton,
                        pressed ? styles.rowPressed : null,
                      ]}
                    >
                      <Text style={styles.removeFileText}>x</Text>
                    </Pressable>
                  </View>
                );
              })}
              <Pressable
                accessibilityLabel={t('editor.addFile')}
                accessibilityRole="button"
                onPress={addFile}
                style={({ pressed }) => [
                  styles.addFileRow,
                  pressed ? styles.rowPressed : null,
                ]}
              >
                <Text style={styles.addFileText}>+ {t('editor.addFile')}</Text>
              </Pressable>
            </View>

            {currentFile ? (
              <View style={styles.editorSection}>
                <View style={styles.editorMetaRow}>
                  <Text style={styles.editorSectionTitle}>
                    {t('editor.fileTitle', { index: currentFileIndex + 1 })}
                  </Text>
                  <View style={styles.editorMetaPill}>
                    <Text style={styles.editorMetaPillText}>
                      {getFileExtension(currentFile.filename)}
                    </Text>
                  </View>
                  {currentFile.originalFilename &&
                  currentFile.originalFilename !==
                    currentFile.filename.trim() ? (
                    <View style={styles.editorMetaPill}>
                      <Text style={styles.editorMetaPillText}>
                        {currentFile.originalFilename}
                      </Text>
                    </View>
                  ) : null}
                </View>

                <TextInput
                  accessibilityLabel={t('editor.currentFilenameLabel')}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onChangeText={value =>
                    updateFile(currentFile.id, { filename: value })
                  }
                  placeholder={t('editor.filenamePlaceholder')}
                  placeholderTextColor={theme.colors.textSecondary}
                  style={styles.filenameInput}
                  value={currentFile.filename}
                />
                <TextInput
                  accessibilityLabel={t('editor.currentContentLabel')}
                  autoCapitalize="none"
                  autoCorrect={false}
                  multiline
                  onChangeText={value =>
                    updateFile(currentFile.id, { content: value })
                  }
                  placeholder={t('editor.contentPlaceholder')}
                  placeholderTextColor={theme.colors.textSecondary}
                  spellCheck={false}
                  style={styles.contentInput}
                  textAlignVertical="top"
                  value={currentFile.content}
                />
              </View>
            ) : null}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

export default GistEditorScreen;

const getStyles = createThemedStyles(theme =>
  StyleSheet.create({
    keyboard: {
      flex: 1,
    },
    container: {
      flex: 1,
    },
    content: {
      paddingHorizontal: theme.spacing.sm,
      paddingTop: 0,
      paddingBottom: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    helperText: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      lineHeight: 17,
    },
    formSection: {
      gap: theme.spacing.xs,
    },
    fieldLabel: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      fontWeight: '800',
      paddingHorizontal: theme.spacing.xs,
    },
    descriptionInput: {
      minHeight: 44,
      borderRadius: theme.radius.sm,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceMuted,
      color: theme.colors.textPrimary,
      fontSize: 15,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm + 3,
    },
    visibilityRow: {
      minHeight: 56,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
      borderRadius: theme.radius.sm,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    visibilityCopy: {
      flex: 1,
      minWidth: 0,
      gap: 2,
    },
    rowTitle: {
      color: theme.colors.textPrimary,
      fontSize: 14,
      lineHeight: 19,
      fontWeight: '800',
    },
    switchTrack: {
      width: 42,
      height: 24,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceMuted,
      padding: 2,
    },
    switchTrackEnabled: {
      borderColor: theme.colors.success,
      backgroundColor: theme.colors.success,
    },
    switchThumb: {
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: theme.colors.surface,
    },
    switchThumbEnabled: {
      transform: [{ translateX: 18 }],
    },
    fileRow: {
      minHeight: 40,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      borderRadius: theme.radius.sm,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      paddingLeft: theme.spacing.md,
      paddingRight: theme.spacing.xs,
      paddingVertical: theme.spacing.xs,
    },
    fileSelectButton: {
      flex: 1,
      minHeight: 32,
      justifyContent: 'center',
    },
    fileTabActive: {
      borderColor: theme.colors.accent,
      backgroundColor: theme.colors.surface,
    },
    rowPressed: {
      opacity: 0.82,
    },
    fileRowText: {
      flex: 1,
      color: theme.colors.textSecondary,
      fontSize: 14,
      lineHeight: 19,
      fontWeight: '700',
    },
    fileTabLabelActive: {
      color: theme.colors.textPrimary,
    },
    removeFileButton: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    removeFileText: {
      color: theme.colors.textSecondary,
      fontSize: 16,
      lineHeight: 20,
      fontWeight: '800',
    },
    addFileRow: {
      minHeight: 40,
      justifyContent: 'center',
      borderRadius: theme.radius.sm,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.canvas,
      paddingHorizontal: theme.spacing.md,
    },
    addFileText: {
      color: theme.colors.accent,
      fontSize: 14,
      fontWeight: '800',
    },
    editorSection: {
      gap: theme.spacing.xs,
    },
    editorSectionTitle: {
      color: theme.colors.textPrimary,
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '800',
    },
    editorMetaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    editorMetaPill: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceMuted,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },
    editorMetaPillText: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      fontWeight: '700',
    },
    filenameInput: {
      minHeight: 44,
      borderRadius: theme.radius.sm,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceMuted,
      color: theme.colors.textPrimary,
      fontSize: 15,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm + 3,
    },
    contentInput: {
      minHeight: 320,
      borderRadius: theme.radius.sm,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.codeBg,
      color: theme.colors.codeText,
      fontFamily: Platform.select({
        ios: 'Menlo',
        android: 'monospace',
        default: 'monospace',
      }),
      fontSize: 14,
      lineHeight: 20,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
    },
  }),
);
