import React from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { RootStackScreenProps } from '../../../app/navigation/types';
import { useAppTheme, useThemePreference } from '../../../app/theme/context';
import {
  createThemedStyles,
  getTheme,
  type ThemePreset,
} from '../../../app/theme/tokens';
import {
  MaterialSymbolIcon,
  type MaterialSymbolName,
} from '../../../components/TabIcons';
import type { AppUpdateChannel } from '../../updates/api/appUpdates';
import { useSession } from '../../auth/session/SessionProvider';
import { useAppUpdate } from '../../updates/context/AppUpdateProvider';
import { useI18n } from '../../../i18n/context';
import { appRepositoryUrl, appVersion } from '../../../shared/appInfo';
import { AppBanner } from '../../../shared/ui/AppBanner';
import { AppButton } from '../../../shared/ui/AppButton';
import { AppCard } from '../../../shared/ui/AppCard';
import { AppPageHeader } from '../../../shared/ui/AppPageHeader';
import { AppSegmentedControl } from '../../../shared/ui/AppSegmentedControl';
import { AppScreen } from '../../../shared/ui/AppScreen';
const themePresetOrder: ThemePreset[] = [
  'default',
  'ocean',
  'forest',
  'sunset',
];

function SettingsSection({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: MaterialSymbolName;
  children: React.ReactNode;
}) {
  const { themeName } = useAppTheme();
  const styles = getStyles(themeName);

  return (
    <AppCard>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIcon}>
          <MaterialSymbolIcon icon={icon} size={20} />
        </View>
        <View style={styles.sectionCopy}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionDescription}>{description}</Text>
        </View>
      </View>
      {children}
    </AppCard>
  );
}

function SettingsRow({
  title,
  value,
  icon,
  onPress,
  tone = 'default',
  isLast = false,
}: {
  title: string;
  value?: string;
  icon: MaterialSymbolName;
  onPress?: () => void;
  tone?: 'default' | 'danger';
  isLast?: boolean;
}) {
  const { theme, themeName } = useAppTheme();
  const styles = getStyles(themeName);
  const isDanger = tone === 'danger';

  return (
    <Pressable
      accessibilityLabel={title}
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        isLast ? styles.rowLast : null,
        pressed && onPress ? styles.rowPressed : null,
      ]}
    >
      <View style={[styles.rowIcon, isDanger ? styles.rowIconDanger : null]}>
        <MaterialSymbolIcon
          color={isDanger ? theme.colors.danger : theme.colors.textPrimary}
          icon={icon}
          size={20}
        />
      </View>
      <View style={styles.rowCopy}>
        <Text
          style={[styles.rowTitle, isDanger ? styles.rowTitleDanger : null]}
        >
          {title}
        </Text>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      </View>
      {onPress ? (
        <MaterialSymbolIcon
          color={isDanger ? theme.colors.danger : theme.colors.textSecondary}
          icon="chevron-right-rounded"
          size={18}
        />
      ) : null}
    </Pressable>
  );
}

function ThemePresetCard({
  label,
  description,
  isSelected,
  previewColors,
  onPress,
  selectedLabel,
}: {
  label: string;
  description: string;
  isSelected: boolean;
  previewColors: readonly [string, string, string];
  onPress: () => void;
  selectedLabel: string;
}) {
  const { theme, themeName } = useAppTheme();
  const styles = getStyles(themeName);

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.presetCard,
        isSelected ? styles.presetCardSelected : null,
        pressed ? styles.presetCardPressed : null,
      ]}
    >
      <View
        style={[
          styles.presetPreview,
          {
            backgroundColor: previewColors[0],
            borderColor: isSelected ? theme.colors.accent : theme.colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.presetPreviewTop,
            {
              backgroundColor: previewColors[1],
            },
          ]}
        >
          <View
            style={[
              styles.presetPreviewDot,
              { backgroundColor: previewColors[2] },
            ]}
          />
          <View
            style={[
              styles.presetPreviewAccent,
              {
                backgroundColor: isSelected
                  ? theme.colors.accent
                  : previewColors[2],
              },
            ]}
          />
        </View>
        <View style={styles.presetPreviewBody}>
          <View
            style={[
              styles.presetPreviewLine,
              { backgroundColor: previewColors[1] },
            ]}
          />
          <View
            style={[
              styles.presetPreviewLine,
              styles.presetPreviewLineShort,
              { backgroundColor: previewColors[2] },
            ]}
          />
        </View>
      </View>
      <View style={styles.presetCardHeader}>
        <Text style={styles.presetCardTitle}>{label}</Text>
        {isSelected ? (
          <View style={styles.presetSelectedBadge}>
            <Text style={styles.presetSelectedBadgeText}>{selectedLabel}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.presetCardDescription}>{description}</Text>
    </Pressable>
  );
}

export function SettingsScreen({}: RootStackScreenProps<'Settings'>) {
  const { themeName, themePreset } = useAppTheme();
  const { colorMode, preset, resolvedScheme, setColorMode, setPreset } =
    useThemePreference();
  const { language, setLanguage, t } = useI18n();
  const { user, signOut } = useSession();
  const {
    autoDownloadEnabled,
    autoCheckEnabled,
    checkForUpdates,
    currentVersion,
    errorMessage,
    installStatus,
    isChecking,
    lastCheckedAt,
    latestVersion,
    openRelease,
    openUpdate,
    setAutoDownloadEnabled,
    setAutoCheckEnabled,
    setUpdateChannel,
    updateAvailable,
    updateChannel,
  } = useAppUpdate();
  const styles = getStyles(themeName);
  const locale = language === 'zh' ? 'zh-CN' : 'en-US';
  const appearanceOptions: Array<{
    label: string;
    value: 'system' | 'light' | 'dark';
  }> = [
    { label: t('settings.themeSystem'), value: 'system' },
    { label: t('settings.themeLight'), value: 'light' },
    { label: t('settings.themeDark'), value: 'dark' },
  ];
  const languageOptions: Array<{
    label: string;
    value: 'en' | 'zh';
  }> = [
    { label: t('common.languageEnglish'), value: 'en' },
    { label: t('common.languageChinese'), value: 'zh' },
  ];
  const autoUpdateOptions: Array<{
    label: string;
    value: 'on' | 'off';
  }> = [
    { label: t('common.on'), value: 'on' },
    { label: t('common.off'), value: 'off' },
  ];
  const updateChannelOptions: Array<{
    label: string;
    value: AppUpdateChannel;
  }> = [
    { label: t('settings.updateChannelStable'), value: 'stable' },
    { label: t('settings.updateChannelPreview'), value: 'preview' },
  ];
  const presetOptions = React.useMemo(
    () =>
      themePresetOrder.map(value => ({
        label:
          value === 'ocean'
            ? t('settings.themePresetOcean')
            : value === 'forest'
            ? t('settings.themePresetForest')
            : value === 'sunset'
            ? t('settings.themePresetSunset')
            : t('settings.themePresetDefault'),
        value,
        description:
          value === 'ocean'
            ? t('settings.themePresetOceanDescription')
            : value === 'forest'
            ? t('settings.themePresetForestDescription')
            : value === 'sunset'
            ? t('settings.themePresetSunsetDescription')
            : t('settings.themePresetDefaultDescription'),
        previewColors: getPresetPreviewColors(value, resolvedScheme),
      })),
    [resolvedScheme, t],
  );
  const profileUrl = user?.login ? `https://github.com/${user.login}` : null;
  const currentAppearanceLabel =
    colorMode === 'system'
      ? resolvedScheme === 'dark'
        ? t('settings.themeCurrentSystemDark')
        : t('settings.themeCurrentSystemLight')
      : colorMode === 'dark'
      ? t('settings.themeCurrentDark')
      : t('settings.themeCurrentLight');
  const currentLanguageLabel =
    language === 'zh'
      ? t('common.languageChinese')
      : t('common.languageEnglish');
  const currentPresetLabel =
    themePreset === 'ocean'
      ? t('settings.themePresetOcean')
      : themePreset === 'forest'
      ? t('settings.themePresetForest')
      : themePreset === 'sunset'
      ? t('settings.themePresetSunset')
      : t('settings.themePresetDefault');
  const updateStatusLabel = isChecking
    ? t('settings.updatesStatusChecking')
    : installStatus === 'downloading'
    ? t('settings.updatesStatusDownloading')
    : installStatus === 'installing'
    ? t('settings.updatesStatusInstalling')
    : updateAvailable && latestVersion
    ? t('settings.updatesStatusAvailable', { version: latestVersion })
    : latestVersion
    ? t('settings.updatesStatusUpToDate', { version: latestVersion })
    : errorMessage
    ? t('settings.updatesStatusFailed')
    : t('settings.updatesStatusIdle');
  const lastCheckedLabel = lastCheckedAt
    ? new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(lastCheckedAt))
    : null;

  const openExternal = React.useCallback((url: string) => {
    Linking.openURL(url).catch(() => {});
  }, []);

  return (
    <AppScreen>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <AppPageHeader
          eyebrow={t('settings.appearance')}
          title={t('settings.title')}
          subtitle={t('settings.appearanceDescription')}
          accessory={
            <View style={styles.versionBadge}>
              <Text style={styles.versionBadgeText}>{appVersion}</Text>
            </View>
          }
        />

        <AppCard style={styles.overviewCard}>
          <View style={styles.overviewGrid}>
            <View style={styles.overviewTile}>
              <View style={styles.overviewIcon}>
                <MaterialSymbolIcon
                  icon={
                    colorMode === 'system'
                      ? 'auto-mode-rounded'
                      : colorMode === 'dark'
                      ? 'dark-mode-rounded'
                      : 'light-mode-rounded'
                  }
                  size={18}
                />
              </View>
              <Text style={styles.overviewLabel}>
                {t('settings.appearanceTitle')}
              </Text>
              <Text style={styles.overviewValue}>{currentAppearanceLabel}</Text>
            </View>
            <View style={styles.overviewTile}>
              <View style={styles.overviewIcon}>
                <MaterialSymbolIcon icon="g-translate" size={18} />
              </View>
              <Text style={styles.overviewLabel}>
                {t('settings.languageTitle')}
              </Text>
              <Text style={styles.overviewValue}>{currentLanguageLabel}</Text>
            </View>
            <View style={styles.overviewTile}>
              <View style={styles.overviewIcon}>
                <MaterialSymbolIcon icon="person-rounded" size={18} />
              </View>
              <Text style={styles.overviewLabel}>
                {t('settings.accountTitle')}
              </Text>
              <Text style={styles.overviewValue}>
                {user?.login ? `@${user.login}` : '—'}
              </Text>
            </View>
            <View style={styles.overviewTile}>
              <View style={styles.overviewIcon}>
                <MaterialSymbolIcon icon="code-rounded" size={18} />
              </View>
              <Text style={styles.overviewLabel}>
                {t('settings.aboutTitle')}
              </Text>
              <Text style={styles.overviewValue}>{appVersion}</Text>
            </View>
          </View>
        </AppCard>

        <SettingsSection
          description={t('settings.appearanceDescription')}
          icon="palette-outline"
          title={t('settings.appearanceTitle')}
        >
          <View style={styles.optionBlock}>
            <View style={styles.optionLabelRow}>
              <View style={styles.optionPill}>
                <MaterialSymbolIcon
                  icon={
                    colorMode === 'system'
                      ? 'auto-mode-rounded'
                      : colorMode === 'dark'
                      ? 'dark-mode-rounded'
                      : 'light-mode-rounded'
                  }
                  size={16}
                />
                <Text style={styles.optionPillText}>
                  {currentAppearanceLabel}
                </Text>
              </View>
            </View>
          </View>
          <AppSegmentedControl
            options={appearanceOptions}
            value={colorMode}
            onChange={value => {
              Promise.resolve(setColorMode(value)).catch(() => {});
            }}
          />
          <View style={styles.optionBlock}>
            <View style={styles.optionLabelRow}>
              <View style={styles.optionPill}>
                <MaterialSymbolIcon icon="palette-outline" size={16} />
                <Text style={styles.optionPillText}>{currentPresetLabel}</Text>
              </View>
            </View>
          </View>
          <View style={styles.presetGrid}>
            {presetOptions.map(option => (
              <ThemePresetCard
                key={option.value}
                description={option.description}
                isSelected={option.value === preset}
                label={option.label}
                onPress={() => {
                  if (option.value !== preset) {
                    Promise.resolve(setPreset(option.value)).catch(() => {});
                  }
                }}
                previewColors={option.previewColors}
                selectedLabel={t('settings.themePresetCurrent')}
              />
            ))}
          </View>
          <View style={styles.actionRow}>
            <AppButton
              fullWidth={false}
              label={t('settings.resetAppearance')}
              onPress={() => {
                Promise.all([
                  setColorMode('system'),
                  setPreset('default'),
                ]).catch(() => {});
              }}
              size="compact"
              variant="secondary"
            />
          </View>
        </SettingsSection>

        <SettingsSection
          description={t('settings.languageDescription')}
          icon="g-translate"
          title={t('settings.languageTitle')}
        >
          <View style={styles.optionBlock}>
            <View style={styles.optionLabelRow}>
              <View style={styles.optionPill}>
                <MaterialSymbolIcon icon="g-translate" size={16} />
                <Text style={styles.optionPillText}>
                  {currentLanguageLabel}
                </Text>
              </View>
            </View>
          </View>
          <AppSegmentedControl
            options={languageOptions}
            value={language}
            onChange={value => {
              Promise.resolve(setLanguage(value)).catch(() => {});
            }}
          />
        </SettingsSection>

        <SettingsSection
          description={t('settings.updatesDescription')}
          icon="settings-outline-rounded"
          title={t('settings.updatesTitle')}
        >
          <View style={styles.optionBlock}>
            <View style={styles.optionLabelRow}>
              <View style={styles.optionPill}>
                <MaterialSymbolIcon icon="code-rounded" size={16} />
                <Text style={styles.optionPillText}>{updateStatusLabel}</Text>
              </View>
            </View>
            {lastCheckedLabel ? (
              <Text style={styles.optionMeta}>
                {t('settings.updatesLastChecked', { date: lastCheckedLabel })}
              </Text>
            ) : null}
          </View>
          {updateAvailable && latestVersion ? (
            <AppBanner
              message={t('settings.updateAvailableBanner', {
                version: latestVersion,
              })}
            />
          ) : errorMessage ? (
            <AppBanner message={errorMessage} tone="warning" />
          ) : null}
          <View style={styles.optionBlock}>
            <View style={styles.optionLabelRow}>
              <View style={styles.optionPill}>
                <MaterialSymbolIcon icon="settings-outline-rounded" size={16} />
                <Text style={styles.optionPillText}>
                  {autoCheckEnabled
                    ? t('settings.autoCheckEnabled')
                    : t('settings.autoCheckDisabled')}
                </Text>
              </View>
            </View>
          </View>
          <AppSegmentedControl
            options={autoUpdateOptions}
            value={autoCheckEnabled ? 'on' : 'off'}
            onChange={value => {
              Promise.resolve(setAutoCheckEnabled(value === 'on')).catch(
                () => {},
              );
            }}
          />
          <View style={styles.optionBlock}>
            <View style={styles.optionLabelRow}>
              <View style={styles.optionPill}>
                <MaterialSymbolIcon icon="explore-outline-rounded" size={16} />
                <Text style={styles.optionPillText}>
                  {t('settings.updateChannelLabel', {
                    channel:
                      updateChannel === 'preview'
                        ? t('settings.updateChannelPreview')
                        : t('settings.updateChannelStable'),
                  })}
                </Text>
              </View>
            </View>
            <Text style={styles.optionMeta}>
              {t('settings.updateChannelDescription')}
            </Text>
          </View>
          <AppSegmentedControl
            options={updateChannelOptions}
            value={updateChannel}
            onChange={value => {
              Promise.resolve(setUpdateChannel(value)).catch(() => {});
            }}
          />
          <View style={styles.optionBlock}>
            <View style={styles.optionLabelRow}>
              <View style={styles.optionPill}>
                <MaterialSymbolIcon icon="auto-mode-rounded" size={16} />
                <Text style={styles.optionPillText}>
                  {autoDownloadEnabled
                    ? t('settings.autoDownloadEnabled')
                    : t('settings.autoDownloadDisabled')}
                </Text>
              </View>
            </View>
            <Text style={styles.optionMeta}>
              {t('settings.autoDownloadDescription')}
            </Text>
          </View>
          <AppSegmentedControl
            options={autoUpdateOptions}
            value={autoDownloadEnabled ? 'on' : 'off'}
            onChange={value => {
              Promise.resolve(setAutoDownloadEnabled(value === 'on')).catch(
                () => {},
              );
            }}
          />
          <View style={styles.actionRow}>
            <AppButton
              fullWidth={false}
              label={t('settings.checkForUpdates')}
              loading={isChecking}
              onPress={() => {
                Promise.resolve(checkForUpdates({ interactive: true })).catch(
                  () => {},
                );
              }}
              size="compact"
            />
            {updateAvailable ? (
              <AppButton
                fullWidth={false}
                label={t('settings.installLatest')}
                loading={installStatus === 'downloading'}
                onPress={() => {
                  Promise.resolve(openUpdate()).catch(() => {});
                }}
                size="compact"
                variant="secondary"
              />
            ) : latestVersion ? (
              <AppButton
                fullWidth={false}
                label={t('settings.openLatestRelease')}
                onPress={() => {
                  Promise.resolve(openRelease()).catch(() => {});
                }}
                size="compact"
                variant="secondary"
              />
            ) : null}
          </View>
        </SettingsSection>

        <SettingsSection
          description={t('settings.accountDescription')}
          icon="person-rounded"
          title={t('settings.accountTitle')}
        >
          <View style={styles.rowGroup}>
            <SettingsRow
              icon="account-circle"
              title={t('settings.accountSignedInAs', {
                login: user?.login ?? '—',
              })}
              value={profileUrl ? 'GitHub' : undefined}
            />
            <SettingsRow
              icon="account-circle-outline"
              onPress={
                profileUrl
                  ? () => {
                      openExternal(profileUrl);
                    }
                  : undefined
              }
              title={t('settings.openGitHubProfile')}
            />
            <SettingsRow
              icon="logout-rounded"
              onPress={() => {
                signOut().catch(() => {});
              }}
              title={t('settings.signOut')}
              tone="danger"
              isLast
            />
          </View>
        </SettingsSection>

        <SettingsSection
          description={t('settings.aboutDescription', {
            version: currentVersion,
          })}
          icon="code-rounded"
          title={t('settings.aboutTitle')}
        >
          <View style={styles.rowGroup}>
            <SettingsRow
              icon="description-rounded"
              title={t('settings.versionLabel', { version: currentVersion })}
              value="BGist"
            />
            <SettingsRow
              icon="code-rounded"
              onPress={() => openExternal(appRepositoryUrl)}
              title={t('settings.openRepository')}
              isLast
            />
          </View>
        </SettingsSection>
      </ScrollView>
    </AppScreen>
  );
}

export default SettingsScreen;

const getStyles = createThemedStyles(theme =>
  StyleSheet.create({
    content: {
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.xl,
      gap: theme.spacing.lg,
    },
    overviewCard: {
      padding: theme.spacing.sm,
    },
    overviewGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    overviewTile: {
      flexBasis: '48%',
      flexGrow: 1,
      borderRadius: theme.radius.md,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceMuted,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      gap: theme.spacing.xs,
    },
    overviewIcon: {
      width: 32,
      height: 32,
      borderRadius: 10,
      borderCurve: 'continuous',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
    },
    overviewLabel: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    overviewValue: {
      color: theme.colors.textPrimary,
      fontSize: 14,
      fontWeight: '800',
      lineHeight: 20,
    },
    versionBadge: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },
    versionBadgeText: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      fontWeight: '800',
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.md,
    },
    sectionIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceMuted,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 2,
    },
    sectionCopy: {
      flex: 1,
      gap: theme.spacing.xs,
    },
    sectionTitle: {
      color: theme.colors.textPrimary,
      fontSize: 18,
      fontWeight: '800',
    },
    sectionDescription: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      lineHeight: 21,
    },
    optionBlock: {
      gap: theme.spacing.sm,
    },
    optionLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    optionMeta: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      lineHeight: 18,
      marginTop: theme.spacing.sm,
    },
    optionPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceMuted,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },
    optionPillText: {
      color: theme.colors.textPrimary,
      fontSize: 13,
      fontWeight: '700',
    },
    presetGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    presetCard: {
      flexBasis: '48%',
      flexGrow: 1,
      minWidth: 140,
      borderRadius: theme.radius.md,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceMuted,
      padding: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
    presetCardSelected: {
      borderColor: theme.colors.accent,
      backgroundColor: theme.colors.surface,
      ...theme.shadow.card,
      shadowOpacity: 0.12,
      elevation: 3,
    },
    presetCardPressed: {
      opacity: 0.9,
    },
    presetPreview: {
      borderRadius: theme.radius.sm,
      borderCurve: 'continuous',
      borderWidth: 1,
      overflow: 'hidden',
      minHeight: 72,
    },
    presetPreviewTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },
    presetPreviewDot: {
      width: 10,
      height: 10,
      borderRadius: 999,
    },
    presetPreviewAccent: {
      width: 28,
      height: 8,
      borderRadius: 999,
    },
    presetPreviewBody: {
      flex: 1,
      justifyContent: 'center',
      gap: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      paddingBottom: theme.spacing.sm,
    },
    presetPreviewLine: {
      height: 8,
      borderRadius: 999,
    },
    presetPreviewLineShort: {
      width: '72%',
    },
    presetCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
    },
    presetCardTitle: {
      color: theme.colors.textPrimary,
      fontSize: 14,
      fontWeight: '800',
      flexShrink: 1,
    },
    presetSelectedBadge: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.colors.accentSoft,
      backgroundColor: theme.colors.accentSoft,
      paddingHorizontal: theme.spacing.xs + 2,
      paddingVertical: 4,
    },
    presetSelectedBadgeText: {
      color: theme.colors.accent,
      fontSize: 11,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    presetCardDescription: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      lineHeight: 18,
    },
    actionRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    rowGroup: {
      borderRadius: theme.radius.lg,
      borderCurve: 'continuous',
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceMuted,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    rowLast: {
      borderBottomWidth: 0,
    },
    rowPressed: {
      opacity: 0.88,
    },
    rowIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      borderCurve: 'continuous',
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowIconDanger: {
      backgroundColor: theme.colors.dangerSoft,
    },
    rowCopy: {
      flex: 1,
      gap: 2,
    },
    rowTitle: {
      color: theme.colors.textPrimary,
      fontSize: 14,
      fontWeight: '700',
    },
    rowTitleDanger: {
      color: theme.colors.danger,
    },
    rowValue: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      lineHeight: 18,
    },
    metaRow: {
      borderRadius: theme.radius.md,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceMuted,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm + 2,
    },
    metaLabel: {
      color: theme.colors.textPrimary,
      fontSize: 14,
      fontWeight: '700',
    },
    helperText: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },
  }),
);

function getPresetPreviewColors(
  preset: ThemePreset,
  themeName: 'light' | 'dark',
): [string, string, string] {
  const previewTheme = getTheme(themeName, preset);

  return [
    previewTheme.colors.canvas,
    previewTheme.colors.surfaceMuted,
    previewTheme.colors.accent,
  ];
}
