import React, { useEffect, useRef, useState } from 'react';
import Clipboard from '@react-native-clipboard/clipboard';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { createThemedStyles } from '../../../app/theme/tokens';
import { useAppTheme } from '../../../app/theme/context';
import { MaterialSymbolIcon } from '../../../components/TabIcons';
import { AppBadge } from '../../../shared/ui/AppBadge';
import { AppButton } from '../../../shared/ui/AppButton';
import { AppCard } from '../../../shared/ui/AppCard';
import { AppScreen } from '../../../shared/ui/AppScreen';
import { useSession } from '../session/SessionProvider';

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

function AuthStep({
  index,
  title,
  description,
}: {
  index: string;
  title: string;
  description: string;
}) {
  const { themeName } = useAppTheme();
  const styles = getStyles(themeName);

  return (
    <View style={styles.stepRow}>
      <View style={styles.stepIndex}>
        <Text style={styles.stepIndexText}>{index}</Text>
      </View>
      <View style={styles.stepCopy}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepDescription}>{description}</Text>
      </View>
    </View>
  );
}

export default function LoginScreen() {
  const { themeName } = useAppTheme();
  const styles = getStyles(themeName);
  const { signIn } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verification, setVerification] = useState<VerificationState | null>(
    null,
  );
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return (
    <AppScreen>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroBadge}>
            <MaterialSymbolIcon icon="description-rounded" size={18} />
            <Text style={styles.heroBadgeText}>GitHub Gist client</Text>
          </View>
          <Text style={styles.title}>BGist</Text>
          <Text style={styles.subtitle}>
            Sign in once, then browse, search, read, and edit gists with a
            compact native workflow.
          </Text>
        </View>

        {error ? (
          <AppCard style={styles.errorCard}>
            <View style={styles.errorHeader}>
              <View style={styles.errorIcon}>
                <Text style={styles.errorIconText}>!</Text>
              </View>
              <View style={styles.errorCopy}>
                <Text style={styles.errorTitle}>Sign-in issue</Text>
                <Text style={styles.errorMessage}>{error}</Text>
              </View>
            </View>
          </AppCard>
        ) : null}

        <AppCard style={styles.authCard}>
          <View style={styles.cardHeader}>
            <AppBadge label="Device flow" tone="public" />
            <Text style={styles.cardTitle}>Connect your GitHub account</Text>
            <Text style={styles.helper}>
              BGist uses GitHub Device Flow, so you can approve login from the
              browser and come back here instantly.
            </Text>
          </View>

          <View style={styles.stepsCard}>
            <AuthStep
              index="1"
              title="Start on this device"
              description="BGist requests a one-time code without asking you to paste a personal access token."
            />
            <AuthStep
              index="2"
              title="Approve in GitHub"
              description="Open the GitHub verification page in your browser, then enter the code shown below."
            />
            <AuthStep
              index="3"
              title="Come back automatically"
              description="Keep this screen open while BGist waits for approval and restores your signed-in session."
            />
          </View>

          <AppButton
            disabled={isSubmitting}
            icon="account-circle-outline"
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
        </AppCard>

        {verification ? (
          <AppCard style={styles.verificationCard}>
            <View style={styles.cardHeader}>
              <AppBadge label="Authorize now" tone="secret" />
              <Text style={styles.cardTitle}>Authorize on GitHub</Text>
              <Text style={styles.helper}>
                Open GitHub, enter this one-time code, and keep this screen open
                while BGist waits for approval.
              </Text>
            </View>

            <View style={styles.codePanel}>
              <Text style={styles.codeLabel}>Your code</Text>
              <Text style={styles.codeValue}>{verification.userCode}</Text>
            </View>

            <View style={styles.metaRow}>
              <View style={styles.metaPill}>
                <Text style={styles.metaPillTitle}>Verification page</Text>
                <Text numberOfLines={1} style={styles.metaPillValue}>
                  {verification.verificationUri}
                </Text>
              </View>
              <View style={styles.metaPill}>
                <Text style={styles.metaPillTitle}>Polling cadence</Text>
                <Text style={styles.metaPillValue}>
                  Every {verification.intervalSeconds} seconds
                </Text>
              </View>
            </View>

            <View style={styles.actions}>
              <AppButton
                fullWidth={false}
                icon="code-rounded"
                label="Copy code"
                onPress={() => {
                  Clipboard.setString(verification.userCode);
                }}
                variant="secondary"
              />
              <AppButton
                fullWidth={false}
                icon="explore-outline-rounded"
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
      </ScrollView>
    </AppScreen>
  );
}

const getStyles = createThemedStyles(theme =>
  StyleSheet.create({
    content: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    hero: {
      borderRadius: theme.radius.sm,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      gap: theme.spacing.xs,
    },
    heroBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: theme.spacing.xs,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs - 1,
    },
    heroBadgeText: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      fontWeight: '700',
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: theme.colors.textPrimary,
    },
    subtitle: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },
    errorCard: {
      borderColor: theme.colors.dangerBorder,
      backgroundColor: theme.colors.surface,
    },
    errorHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.sm,
    },
    errorIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      borderCurve: 'continuous',
      backgroundColor: theme.colors.dangerSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    errorIconText: {
      color: theme.colors.danger,
      fontSize: 20,
      fontWeight: '800',
    },
    errorCopy: {
      flex: 1,
      gap: theme.spacing.xs,
    },
    errorTitle: {
      color: theme.colors.textPrimary,
      fontSize: 16,
      fontWeight: '800',
    },
    errorMessage: {
      color: theme.colors.danger,
      fontSize: 14,
      lineHeight: 20,
    },
    authCard: {
      gap: theme.spacing.sm,
    },
    verificationCard: {
      gap: theme.spacing.sm,
    },
    cardHeader: {
      gap: theme.spacing.xs,
    },
    cardTitle: {
      color: theme.colors.textPrimary,
      fontSize: 16,
      fontWeight: '800',
    },
    helper: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },
    stepsCard: {
      gap: theme.spacing.sm,
      borderRadius: theme.radius.sm,
      borderCurve: 'continuous',
      backgroundColor: theme.colors.surfaceMuted,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
    },
    stepRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.sm,
    },
    stepIndex: {
      width: 26,
      height: 26,
      borderRadius: 13,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepIndexText: {
      color: theme.colors.textPrimary,
      fontSize: 12,
      fontWeight: '800',
    },
    stepCopy: {
      flex: 1,
      gap: 2,
    },
    stepTitle: {
      color: theme.colors.textPrimary,
      fontSize: 14,
      fontWeight: '700',
    },
    stepDescription: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },
    codePanel: {
      borderRadius: theme.radius.md,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceMuted,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      gap: theme.spacing.xs,
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
      fontSize: 28,
      fontWeight: '900',
      letterSpacing: 1.4,
    },
    metaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    metaPill: {
      flexGrow: 1,
      minWidth: '47%',
      borderRadius: theme.radius.sm,
      borderCurve: 'continuous',
      backgroundColor: theme.colors.surfaceMuted,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
      gap: theme.spacing.xs,
    },
    metaPillTitle: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    metaPillValue: {
      color: theme.colors.textPrimary,
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '600',
    },
    actions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
  }),
);
