import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {appTheme} from '../../../app/theme/tokens';
import {AppCard} from '../../../shared/ui/AppCard';
import {AppEmptyState} from '../../../shared/ui/AppEmptyState';
import {AppScreen} from '../../../shared/ui/AppScreen';

export function ComposeScreen() {
  return (
    <AppScreen>
      <View style={styles.container}>
        <Text style={styles.eyebrow}>Create</Text>
        <Text style={styles.title}>Compose</Text>
        <Text style={styles.subtitle}>
          The editor flow is not part of Task 5, but this tab is now part of the signed-in shell.
        </Text>

        <AppCard>
          <AppEmptyState
            badgeLabel="Coming soon"
            title="Compose will land in a follow-up task"
            description="This placeholder reserves the tab and keeps the shell complete for the first mobile feed pass."
          />
        </AppCard>
      </View>
    </AppScreen>
  );
}

export default ComposeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: appTheme.spacing.md,
    paddingTop: appTheme.spacing.md,
    gap: appTheme.spacing.sm,
  },
  eyebrow: {
    color: appTheme.colors.accent,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  title: {
    color: appTheme.colors.textPrimary,
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    color: appTheme.colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
});
