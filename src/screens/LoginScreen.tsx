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
            <Text style={{fontSize: 24}}>🐙</Text>
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
