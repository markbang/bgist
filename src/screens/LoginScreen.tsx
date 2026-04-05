import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {useAuth} from '../contexts/AuthContext';
import {lightTheme, darkTheme} from '../constants/theme';

export default function LoginScreen() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;
  const {colors} = theme;
  const {login} = useAuth();
  const [patToken, setPatToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePatLogin = async () => {
    if (!patToken.trim()) {
      Alert.alert('Error', 'Please enter a Personal Access Token');
      return;
    }
    setIsLoading(true);
    try {
      await login(patToken.trim());
    } catch (error) {
      Alert.alert('Error', 'Invalid token. Please check and try again.');
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
        {/* GitHub-style Logo */}
        <View style={styles.logoContainer}>
          <View style={[styles.logoCircle, {backgroundColor: colors.textPrimary}]}>
            <svg width={40} height={40} viewBox="0 0 24 24" fill={colors.bgPrimary}>
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </View>
          <Text style={[styles.title, {color: colors.textPrimary}]}>
            BGist
          </Text>
          <Text style={[styles.subtitle, {color: colors.textSecondary}]}>
            A beautiful GitHub Gist client
          </Text>
        </View>

        {/* Login Form */}
        <View style={styles.formContainer}>
          <Text style={[styles.sectionTitle, {color: colors.textPrimary}]}>
            Sign in to GitHub
          </Text>

          <Text style={[styles.helpText, {color: colors.textSecondary}]}>
            Create a token at{' '}
            <Text style={{color: colors.textLink, fontWeight: '500'}}>
              github.com/settings/tokens
            </Text>{' '}
            with the{' '}
            <Text
              style={[
                styles.code,
                {backgroundColor: colors.bgCode, color: colors.textPrimary},
              ]}>
              gist
            </Text>{' '}
            scope
          </Text>

          <View style={styles.inputContainer}>
            <Text
              style={[
                styles.inputLabel,
                {color: colors.textSecondary},
              ]}>
              Personal Access Token
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.bgSecondary,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                },
              ]}
              value={patToken}
              onChangeText={setPatToken}
              secureTextEntry
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              placeholderTextColor={colors.placeholder}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              {
                backgroundColor: colors.btnPrimaryBg,
                opacity: isLoading ? 0.7 : 1,
              },
            ]}
            onPress={handlePatLogin}
            disabled={isLoading}>
            <Text
              style={[
                styles.primaryButtonText,
                {color: colors.btnPrimaryText},
              ]}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Text>
          </TouchableOpacity>
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
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 100,
    marginBottom: 48,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
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
  formContainer: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  helpText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  code: {
    fontSize: 13,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  inputContainer: {
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
    paddingVertical: 10,
    fontSize: 14,
  },
  primaryButton: {
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
