import React, {useEffect, useRef, useState} from 'react';
import Clipboard from '@react-native-clipboard/clipboard';
import {Linking, StyleSheet, Text, View} from 'react-native';
import {AppButton} from '../../../shared/ui/AppButton';
import {AppCard} from '../../../shared/ui/AppCard';
import {useSession} from '../session/SessionProvider';
import {AppScreen} from '../../../shared/ui/AppScreen';
import {useAppTheme} from '../../../app/theme/context';
import {createThemedStyles} from '../../../app/theme/tokens';

type VerificationState = {
  userCode: string;
  verificationUri: string;
  expiresAt: number;
  intervalSeconds: number;
};

function getSignInErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return 'Sign in failed';
  }

  switch (error.message) {
    case 'GITHUB_DEVICE_ACCESS_DENIED':
      return 'GitHub authorization was denied. Start again to request a new code.';
    case 'GITHUB_DEVICE_CODE_EXPIRED':
      return 'This GitHub device code expired. Start again for a fresh code.';
    case 'GITHUB_DEVICE_FLOW_DISABLED':
      return 'Enable Device Flow in your GitHub OAuth App settings and try again.';
    default:
      return 'Sign in failed';
  }
}

export default function LoginScreen() {
  const {themeName} = useAppTheme();
  const styles = getStyles(themeName);
  const {signIn} = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verification, setVerification] = useState<VerificationState | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return (
    <AppScreen>
      <View style={styles.container}>
        <Text style={styles.title}>BGist</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <AppButton
          disabled={isSubmitting}
          label={
            isSubmitting && verification
              ? 'Waiting for GitHub authorization…'
              : isSubmitting
                ? 'Starting GitHub device sign-in…'
                : 'Sign in with GitHub'
          }
          loading={isSubmitting && !verification}
          onPress={() => {
            if (isSubmitting) {
              return;
            }

            setError(null);
            setVerification(null);
            setIsSubmitting(true);
            (async () => {
              try {
                await signIn({
                  onVerification: nextVerification => {
                    if (!isMountedRef.current) {
                      return;
                    }

                    setVerification({
                      userCode: nextVerification.userCode,
                      verificationUri: nextVerification.verificationUri,
                      expiresAt: nextVerification.expiresAt,
                      intervalSeconds: nextVerification.intervalSeconds,
                    });
                  },
                });
              } catch (nextError) {
                if (isMountedRef.current) {
                  setVerification(null);
                  setError(getSignInErrorMessage(nextError));
                }
              } finally {
                if (isMountedRef.current) {
                  setIsSubmitting(false);
                }
              }
            })().catch(() => {});
          }}
        />

        {verification ? (
          <AppCard>
            <Text style={styles.cardTitle}>Authorize on GitHub</Text>
            <Text style={styles.helper}>
              Open GitHub, enter this one-time code, and keep this screen open while BGist waits for approval.
            </Text>
            <Text style={styles.codeLabel}>Your code</Text>
            <Text style={styles.codeValue}>{verification.userCode}</Text>
            <Text style={styles.helper}>
              GitHub verification page: {verification.verificationUri}
            </Text>
            <Text style={styles.helper}>
              Polling every {verification.intervalSeconds} seconds until the code expires.
            </Text>
            <View style={styles.actions}>
              <AppButton
                fullWidth={false}
                label="Copy code"
                onPress={() => {
                  Clipboard.setString(verification.userCode);
                }}
                variant="secondary"
              />
              <AppButton
                fullWidth={false}
                label="Open GitHub verification"
                onPress={() => {
                  Linking.openURL(verification.verificationUri).catch(() => {
                    setError('Could not open the GitHub verification page.');
                  });
                }}
                variant="secondary"
              />
            </View>
          </AppCard>
        ) : null}
      </View>
    </AppScreen>
  );
}

const getStyles = createThemedStyles(theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    title: {
      fontSize: 36,
      fontWeight: '800',
      color: theme.colors.textPrimary,
    },
    error: {
      color: theme.colors.danger,
      fontSize: 14,
      lineHeight: 20,
    },
    cardTitle: {
      color: theme.colors.textPrimary,
      fontSize: 18,
      fontWeight: '800',
    },
    codeLabel: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    codeValue: {
      color: theme.colors.textPrimary,
      fontSize: 30,
      fontWeight: '900',
      letterSpacing: 1.4,
    },
    helper: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      lineHeight: 21,
    },
    actions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
  }),
);
