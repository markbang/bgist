import React, {useState} from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {useSession} from '../session/SessionProvider';
import {AppScreen} from '../../../shared/ui/AppScreen';
import {appTheme} from '../../../app/theme/tokens';

export default function LoginScreen() {
  const {signIn} = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <AppScreen>
      <View style={styles.container}>
        <Text style={styles.title}>BGist</Text>
        <Text style={styles.subtitle}>Sign in with GitHub OAuth to continue.</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Text
          accessibilityRole="button"
          style={styles.button}
          onPress={async () => {
            setError(null);
            setIsSubmitting(true);
            try {
              await signIn();
            } catch (nextError) {
              setError(nextError instanceof Error ? nextError.message : 'Sign in failed');
            } finally {
              setIsSubmitting(false);
            }
          }}>
          {isSubmitting ? 'Signing in…' : 'Sign in with GitHub'}
        </Text>
        {isSubmitting ? <ActivityIndicator color={appTheme.colors.accent} /> : null}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 24, justifyContent: 'center'},
  title: {fontSize: 36, fontWeight: '700', color: appTheme.colors.textPrimary},
  subtitle: {marginTop: 8, fontSize: 16, color: appTheme.colors.textSecondary},
  button: {
    marginTop: 24,
    borderRadius: appTheme.radius.md,
    backgroundColor: appTheme.colors.accent,
    paddingVertical: 14,
    textAlign: 'center',
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {marginTop: 16, color: appTheme.colors.danger},
});
