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
import {useAppTheme} from '../../../app/theme/context';
import {createThemedStyles} from '../../../app/theme/tokens';
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
import {AppPageHeader} from '../../../shared/ui/AppPageHeader';
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

function createDraftFilesFromGist(files: Record<string, GistFile>): DraftFile[] {
  return Object.values(files).map(file => ({
    id: createDraftId(),
    originalFilename: file.filename,
    filename: file.filename,
    content: file.content ?? '',
  }));
}

function createInitialDraftState(files: GistEditorDraftFile[] | undefined, isEditMode: boolean): DraftState {
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

function getDraftFileLabel(file: DraftFile, index: number, t: (key: string, values?: Record<string, string | number>) => string) {
  const trimmedFilename = file.filename.trim();

  if (trimmedFilename) {
    return trimmedFilename;
  }

  return t('editor.untitledFile', {index: index + 1});
}

function getFileExtension(filename: string) {
  const trimmedFilename = filename.trim();
  const extensionIndex = trimmedFilename.lastIndexOf('.');

  if (extensionIndex <= 0 || extensionIndex === trimmedFilename.length - 1) {
    return 'TXT';
  }

  return trimmedFilename.slice(extensionIndex + 1).toUpperCase();
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
  const {theme, themeName} = useAppTheme();
  const {t} = useI18n();
  const styles = getStyles(themeName);
  const isEditMode = route.params.mode === 'edit';
  const editGistId = isEditMode ? route.params.gistId : null;
  const routeDraftFiles = route.params.files;
  const initialDraftStateRef = React.useRef<DraftState | null>(null);

  if (!initialDraftStateRef.current) {
    initialDraftStateRef.current = createInitialDraftState(routeDraftFiles, isEditMode);
  }

  const initialDraftState = initialDraftStateRef.current;
  const [description, setDescription] = React.useState(route.params.description ?? '');
  const [isPublic, setIsPublic] = React.useState(route.params.isPublic ?? true);
  const [files, setFiles] = React.useState<DraftFile[]>(initialDraftState.files);
  const [activeFileId, setActiveFileId] = React.useState<string | null>(initialDraftState.activeFileId);
  const [deletedOriginalFilenames, setDeletedOriginalFilenames] = React.useState<string[]>([]);
  const [hasHydratedEditState, setHasHydratedEditState] = React.useState(
    !isEditMode || Boolean(routeDraftFiles?.length),
  );
  const {createGistMutation, editGistMutation} = useGistMutations();

  const existingGistQuery = useQuery({
    queryKey: editGistId ? queryKeys.gistDetail(editGistId) : ['gists', 'detail', 'create'],
    queryFn: ({signal}) => getGist(editGistId as string, signal),
    enabled: Boolean(editGistId) && !hasHydratedEditState,
  });

  React.useEffect(() => {
    if (!isEditMode || hasHydratedEditState || !existingGistQuery.data) {
      return;
    }

    setDescription(current => current || existingGistQuery.data?.description || '');
    setIsPublic(existingGistQuery.data.public);
    const hydratedFiles = createDraftFilesFromGist(existingGistQuery.data.files);

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

  const updateFile = React.useCallback((fileId: string, updates: Partial<DraftFile>) => {
    setFiles(current =>
      current.map(file => (file.id === fileId ? {...file, ...updates} : file)),
    );
  }, []);

  const addFile = React.useCallback(() => {
    const nextFile = createBlankFile();

    setFiles(current => [...current, nextFile]);
    setActiveFileId(nextFile.id);
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

  const currentFile = files.find(file => file.id === activeFileId) ?? files[0] ?? null;
  const currentFileIndex = currentFile ? files.findIndex(file => file.id === currentFile.id) : -1;

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
        style={styles.keyboard}>
        <View style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <AppPageHeader title={isEditMode ? t('editor.editTitle') : t('editor.createTitle')} />

            <AppCard>
              <Text style={styles.sectionTitle}>{t('editor.detailsTitle')}</Text>
              <TextInput
                accessibilityLabel="Gist description"
                onChangeText={setDescription}
                placeholder={t('editor.descriptionPlaceholder')}
                placeholderTextColor={theme.colors.textSecondary}
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
                    size="compact"
                    variant={isPublic ? 'primary' : 'secondary'}
                  />
                  <AppButton
                    fullWidth={false}
                    label={t('common.secret')}
                    onPress={() => setIsPublic(false)}
                    size="compact"
                    variant={!isPublic ? 'primary' : 'secondary'}
                  />
                </View>
              )}
            </AppCard>

            <View style={styles.fileSectionHeader}>
              <View style={styles.fileSectionCopy}>
                <Text style={styles.sectionTitle}>{t('common.files')}</Text>
                {currentFile ? (
                  <Text style={styles.helperText}>
                    {getDraftFileLabel(currentFile, currentFileIndex, t)}
                  </Text>
                ) : null}
              </View>
              <AppButton
                fullWidth={false}
                label={t('editor.addFile')}
                onPress={addFile}
                size="compact"
                variant="secondary"
              />
            </View>

            <ScrollView
              contentContainerStyle={styles.fileTabsContent}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.fileTabsScroll}>
              {files.map((file, index) => {
                const isActive = file.id === currentFile?.id;
                const label = getDraftFileLabel(file, index, t);

                return (
                  <Pressable
                    key={file.id}
                    accessibilityRole="tab"
                    accessibilityState={isActive ? {selected: true} : {}}
                    onPress={() => setActiveFileId(file.id)}
                    style={({pressed}) => [
                      styles.fileTab,
                      isActive ? styles.fileTabActive : null,
                      pressed ? styles.fileTabPressed : null,
                    ]}>
                    <Text style={[styles.fileTabLabel, isActive ? styles.fileTabLabelActive : null]}>
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {currentFile ? (
              <AppCard>
                <View style={styles.fileHeader}>
                  <View style={styles.fileHeaderText}>
                    <Text style={styles.fileTitle}>
                      {t('editor.fileTitle', {index: currentFileIndex + 1})}
                    </Text>
                    <Text style={styles.fileMeta}>
                      {currentFile.originalFilename
                        ? t('editor.editingFile', {filename: currentFile.originalFilename})
                        : t('editor.newFile')}
                    </Text>
                  </View>
                  <AppButton
                    accessibilityLabel={t('editor.removeCurrentFile')}
                    fullWidth={false}
                    label={t('editor.remove')}
                    onPress={() => removeFile(currentFile.id)}
                    size="compact"
                    variant="danger"
                  />
                </View>

                <View style={styles.editorMetaRow}>
                  <View style={styles.editorMetaPill}>
                    <Text style={styles.editorMetaPillText}>{getFileExtension(currentFile.filename)}</Text>
                  </View>
                  {currentFile.originalFilename && currentFile.originalFilename !== currentFile.filename.trim() ? (
                    <View style={styles.editorMetaPill}>
                      <Text style={styles.editorMetaPillText}>{currentFile.originalFilename}</Text>
                    </View>
                  ) : null}
                </View>

                <TextInput
                  accessibilityLabel={t('editor.currentFilenameLabel')}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onChangeText={value => updateFile(currentFile.id, {filename: value})}
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
                  onChangeText={value => updateFile(currentFile.id, {content: value})}
                  placeholder={t('editor.contentPlaceholder')}
                  placeholderTextColor={theme.colors.textSecondary}
                  spellCheck={false}
                  style={styles.contentInput}
                  textAlignVertical="top"
                  value={currentFile.content}
                />
              </AppCard>
            ) : null}
          </ScrollView>

          <View style={styles.footer}>
            <AppButton
              label={isEditMode ? t('editor.saveChanges') : t('gist.createGist')}
              loading={createGistMutation.isPending || editGistMutation.isPending}
              onPress={() => {
                handleSubmit().catch(() => {});
              }}
            />
          </View>
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
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.md,
      paddingBottom: 120,
      gap: theme.spacing.md,
    },
    sectionTitle: {
      color: theme.colors.textPrimary,
      fontSize: 18,
      fontWeight: '800',
    },
    label: {
      color: theme.colors.textPrimary,
      fontSize: 14,
      fontWeight: '700',
    },
    helperText: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      lineHeight: 20,
    },
    descriptionInput: {
      minHeight: 56,
      borderRadius: theme.radius.lg,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.canvas,
      color: theme.colors.textPrimary,
      fontSize: 15,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm + 3,
    },
    visibilityHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
    },
    visibilityButtons: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    fileSectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
    },
    fileSectionCopy: {
      flex: 1,
      gap: theme.spacing.xs,
    },
    fileTabsScroll: {
      marginHorizontal: -theme.spacing.xs,
    },
    fileTabsContent: {
      gap: theme.spacing.xs,
      paddingHorizontal: theme.spacing.xs,
    },
    fileTab: {
      minHeight: 42,
      borderRadius: theme.radius.md,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs + 2,
    },
    fileTabActive: {
      borderColor: theme.colors.accent,
      backgroundColor: theme.colors.accentSoft,
    },
    fileTabPressed: {
      opacity: 0.9,
    },
    fileTabLabel: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      fontWeight: '700',
    },
    fileTabLabelActive: {
      color: theme.colors.accent,
    },
    fileHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    fileHeaderText: {
      flex: 1,
      gap: theme.spacing.xs,
    },
    fileTitle: {
      color: theme.colors.textPrimary,
      fontSize: 16,
      fontWeight: '800',
    },
    fileMeta: {
      color: theme.colors.textSecondary,
      fontSize: 13,
    },
    editorMetaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
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
      minHeight: 56,
      borderRadius: theme.radius.lg,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.canvas,
      color: theme.colors.textPrimary,
      fontSize: 15,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm + 3,
    },
    contentInput: {
      minHeight: 320,
      borderRadius: theme.radius.lg,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.codeBg,
      color: theme.colors.codeText,
      fontFamily: Platform.select({ios: 'Menlo', android: 'monospace', default: 'monospace'}),
      fontSize: 14,
      lineHeight: 20,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
    },
    footer: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.md,
    },
  }),
);
