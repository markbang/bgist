import React from 'react';
import {Linking, ScrollView, StyleSheet, Text, View} from 'react-native';
import type {RootStackScreenProps} from '../../../app/navigation/types';
import {useAppTheme, useThemePreference} from '../../../app/theme/context';
import {createThemedStyles} from '../../../app/theme/tokens';
import {useSession} from '../../auth/session/SessionProvider';
import {useI18n} from '../../../i18n/context';
import {AppButton} from '../../../shared/ui/AppButton';
import {AppCard} from '../../../shared/ui/AppCard';
import {AppPageHeader} from '../../../shared/ui/AppPageHeader';
import {AppSegmentedControl} from '../../../shared/ui/AppSegmentedControl';
import {AppScreen} from '../../../shared/ui/AppScreen';

const appVersion = (require('../../../../package.json') as {version: string}).version;
const appRepositoryUrl = 'https://github.com/markbang/bgist';

export function SettingsScreen({}: RootStackScreenProps<'Settings'>) {
  const {themeName} = useAppTheme();
  const {colorMode, resolvedScheme, setColorMode} = useThemePreference();
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
  const profileUrl = user?.login ? `https://github.com/${user.login}` : null;

  const openExternal = React.useCallback((url: string) => {
    Linking.openURL(url).catch(() => {});
  }, []);

  return (
    <AppScreen>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <AppPageHeader title={t('settings.title')} />

        <AppCard>
          <View style={styles.sectionCopy}>
            <Text style={styles.sectionTitle}>{t('settings.appearanceTitle')}</Text>
            <Text style={styles.sectionDescription}>{t('settings.appearanceDescription')}</Text>
          </View>
          <AppSegmentedControl
            options={appearanceOptions}
            value={colorMode}
            onChange={value => {
              void setColorMode(value);
            }}
          />
          <Text style={styles.helperText}>
            {colorMode === 'system'
              ? resolvedScheme === 'dark'
                ? t('settings.themeCurrentSystemDark')
                : t('settings.themeCurrentSystemLight')
              : colorMode === 'dark'
                ? t('settings.themeCurrentDark')
                : t('settings.themeCurrentLight')}
          </Text>
        </AppCard>

        <AppCard>
          <View style={styles.sectionCopy}>
            <Text style={styles.sectionTitle}>{t('settings.languageTitle')}</Text>
            <Text style={styles.sectionDescription}>{t('settings.languageDescription')}</Text>
          </View>
          <AppSegmentedControl
            options={languageOptions}
            value={language}
            onChange={value => {
              void setLanguage(value);
            }}
          />
        </AppCard>

        <AppCard>
          <View style={styles.sectionCopy}>
            <Text style={styles.sectionTitle}>{t('settings.accountTitle')}</Text>
            <Text style={styles.sectionDescription}>{t('settings.accountDescription')}</Text>
          </View>
          <AppButton
            disabled={!profileUrl}
            label={t('settings.openGitHubProfile')}
            onPress={() => {
              if (profileUrl) {
                openExternal(profileUrl);
              }
            }}
            variant="secondary"
          />
          <AppButton
            label={t('settings.signOut')}
            onPress={() => {
              signOut().catch(() => {});
            }}
            variant="danger"
          />
        </AppCard>

        <AppCard>
          <View style={styles.sectionCopy}>
            <Text style={styles.sectionTitle}>{t('settings.aboutTitle')}</Text>
            <Text style={styles.sectionDescription}>
              {t('settings.aboutDescription', {version: appVersion})}
            </Text>
          </View>
          <AppButton
            label={t('settings.openRepository')}
            onPress={() => openExternal(appRepositoryUrl)}
            variant="secondary"
          />
        </AppCard>
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
      gap: theme.spacing.md,
    },
    sectionCopy: {
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
    helperText: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },
  }),
);
