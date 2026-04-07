import React from 'react';
import {Linking, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import type {RootStackScreenProps} from '../../../app/navigation/types';
import {useAppTheme, useThemePreference} from '../../../app/theme/context';
import {createThemedStyles} from '../../../app/theme/tokens';
import {MaterialSymbolIcon, type MaterialSymbolName} from '../../../components/TabIcons';
import {useSession} from '../../auth/session/SessionProvider';
import {useI18n} from '../../../i18n/context';
import {AppCard} from '../../../shared/ui/AppCard';
import {AppPageHeader} from '../../../shared/ui/AppPageHeader';
import {AppSegmentedControl} from '../../../shared/ui/AppSegmentedControl';
import {AppScreen} from '../../../shared/ui/AppScreen';

const appVersion = (require('../../../../package.json') as {version: string}).version;
const appRepositoryUrl = 'https://github.com/markbang/bgist';

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
  const {themeName} = useAppTheme();
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
}: {
  title: string;
  value?: string;
  icon: MaterialSymbolName;
  onPress?: () => void;
  tone?: 'default' | 'danger';
}) {
  const {theme, themeName} = useAppTheme();
  const styles = getStyles(themeName);
  const isDanger = tone === 'danger';

  return (
    <Pressable
      accessibilityLabel={title}
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({pressed}) => [
        styles.row,
        pressed && onPress ? styles.rowPressed : null,
      ]}>
      <View style={[styles.rowIcon, isDanger ? styles.rowIconDanger : null]}>
        <MaterialSymbolIcon
          color={isDanger ? theme.colors.danger : theme.colors.textPrimary}
          icon={icon}
          size={20}
        />
      </View>
      <View style={styles.rowCopy}>
        <Text style={[styles.rowTitle, isDanger ? styles.rowTitleDanger : null]}>{title}</Text>
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

export function SettingsScreen({}: RootStackScreenProps<'Settings'>) {
  const {themeName, themePreset} = useAppTheme();
  const {colorMode, preset, resolvedScheme, setColorMode, setPreset} = useThemePreference();
  const {language, setLanguage, t} = useI18n();
  const {user, signOut} = useSession();
  const styles = getStyles(themeName);
  const appearanceOptions: Array<{
    label: string;
    value: 'system' | 'light' | 'dark';
  }> = [
    {label: t('settings.themeSystem'), value: 'system'},
    {label: t('settings.themeLight'), value: 'light'},
    {label: t('settings.themeDark'), value: 'dark'},
  ];
  const languageOptions: Array<{
    label: string;
    value: 'en' | 'zh';
  }> = [
    {label: t('common.languageEnglish'), value: 'en'},
    {label: t('common.languageChinese'), value: 'zh'},
  ];
  const presetOptions: Array<{
    label: string;
    value: 'default' | 'ocean' | 'forest' | 'sunset';
  }> = [
    {label: t('settings.themePresetDefault'), value: 'default'},
    {label: t('settings.themePresetOcean'), value: 'ocean'},
    {label: t('settings.themePresetForest'), value: 'forest'},
    {label: t('settings.themePresetSunset'), value: 'sunset'},
  ];
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
    language === 'zh' ? t('common.languageChinese') : t('common.languageEnglish');
  const currentPresetLabel =
    themePreset === 'ocean'
      ? t('settings.themePresetOcean')
      : themePreset === 'forest'
        ? t('settings.themePresetForest')
        : themePreset === 'sunset'
          ? t('settings.themePresetSunset')
          : t('settings.themePresetDefault');

  const openExternal = React.useCallback((url: string) => {
    Linking.openURL(url).catch(() => {});
  }, []);

  return (
    <AppScreen>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <AppPageHeader
          title={t('settings.title')}
          accessory={
            <View style={styles.versionBadge}>
              <Text style={styles.versionBadgeText}>{appVersion}</Text>
            </View>
          }
        />

        <SettingsSection
          description={t('settings.appearanceDescription')}
          icon="palette-outline"
          title={t('settings.appearanceTitle')}>
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
                <Text style={styles.optionPillText}>{currentAppearanceLabel}</Text>
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
          <AppSegmentedControl
            options={presetOptions}
            value={preset}
            onChange={value => {
              Promise.resolve(setPreset(value)).catch(() => {});
            }}
          />
        </SettingsSection>

        <SettingsSection
          description={t('settings.languageDescription')}
          icon="g-translate"
          title={t('settings.languageTitle')}>
          <View style={styles.optionBlock}>
            <View style={styles.optionLabelRow}>
              <View style={styles.optionPill}>
                <MaterialSymbolIcon icon="g-translate" size={16} />
                <Text style={styles.optionPillText}>{currentLanguageLabel}</Text>
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
          description={t('settings.accountDescription')}
          icon="person-rounded"
          title={t('settings.accountTitle')}>
          <View style={styles.rowGroup}>
            <SettingsRow
              icon="account-circle"
              title={t('settings.accountSignedInAs', {login: user?.login ?? '—'})}
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
            />
          </View>
        </SettingsSection>

        <SettingsSection
          description={t('settings.aboutDescription', {version: appVersion})}
          icon="code-rounded"
          title={t('settings.aboutTitle')}>
          <View style={styles.rowGroup}>
            <SettingsRow
              icon="description-rounded"
              title={t('settings.versionLabel', {version: appVersion})}
              value="BGist"
            />
            <SettingsRow
              icon="code-rounded"
              onPress={() => openExternal(appRepositoryUrl)}
              title={t('settings.openRepository')}
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
