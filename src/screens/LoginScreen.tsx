import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useColorScheme,
  Alert,
} from 'react-native';
import {useAuth} from '../contexts/AuthContext';
import {lightTheme, darkTheme} from '../constants/theme';
import {useI18n} from '../i18n/context';

export default function LoginScreen() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;
  const {colors} = theme;
  const {login} = useAuth();
  const {t} = useI18n();
  const [patToken, setPatToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!patToken.trim()) {
      Alert.alert(t('common.error'), t('auth.enterToken'));
      return;
    }
    setIsLoading(true);
    try {
      await login(patToken.trim());
    } catch {
      Alert.alert(t('common.error'), t('auth.invalidToken'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, {backgroundColor: colors.bgPrimary}]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={styles.logoSection}>
          <View style={[styles.octocat, {backgroundColor: colors.textPrimary}]}>
            <Text style={{fontSize: 36}}>🐙</Text>
          </View>
          <Text style={[styles.title, {color: colors.textPrimary}]}>
            BGist
          </Text>
          <Text style={[styles.subtitle, {color: colors.textSecondary}]}>
            GitHub Gist 客户端
          </Text>
        </View>

        {/* Login Form */}
        <View style={styles.formSection}>
          <View style={[styles.card, {borderColor: colors.border}]}>
            <Text style={[styles.cardTitle, {color: colors.textPrimary}]}>
              {t('auth.signInTitle')}
            </Text>

            <Text style={[styles.helpText, {color: colors.textSecondary}]}>
              {t('auth.patHelp')}{' '}
              <Text style={{color: colors.textLink, fontWeight: '500'}}>
                github.com/settings/tokens
              </Text>{' '}
              {t('auth.patScope')}{' '}
              <Text
                style={[
                  styles.code,
                  {backgroundColor: colors.bgCode, color: colors.textPrimary},
                ]}>
                gist
              </Text>
            </Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, {color: colors.textPrimary}]}>
                {t('auth.patLabel')}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.bgPrimary,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  },
                ]}
                value={patToken}
                onChangeText={setPatToken}
                secureTextEntry
                placeholder={t('auth.patPlaceholder')}
                placeholderTextColor={colors.placeholder}
                autoCapitalize="none"
                autoCorrect={false}
                selectTextOnFocus
              />
            </View>

            <TouchableOpacity
              style={[
                styles.primaryBtn,
                {
                  backgroundColor: colors.btnPrimaryBg,
                  opacity: isLoading ? 0.6 : 1,
                },
              ]}
              onPress={handleLogin}
              disabled={isLoading}>
              <Text
                style={[
                  styles.primaryBtnText,
                  {color: colors.btnPrimaryText},
                ]}>
                {isLoading ? t('auth.signingIn') : t('auth.signIn')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  logoSection: {
    alignItems: 'center',
    paddingTop: 100,
    paddingBottom: 48,
  },
  octocat: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  formSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  code: {
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 4,
    fontSize: 13,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  primaryBtn: {
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
