import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import type {MainTabScreenProps} from '../../../app/navigation/types';
import {appTheme} from '../../../app/theme/tokens';
import {AppButton} from '../../../shared/ui/AppButton';
import {AppCard} from '../../../shared/ui/AppCard';
import {AppEmptyState} from '../../../shared/ui/AppEmptyState';
import {AppScreen} from '../../../shared/ui/AppScreen';

export function ComposeScreen({navigation}: MainTabScreenProps<'Compose'>) {
  return (
    <AppScreen>
      <View style={styles.container}>
        <Text style={styles.eyebrow}>Create</Text>
        <Text style={styles.title}>Compose</Text>
        <Text style={styles.subtitle}>
          Start a new gist draft from the tab bar, then edit files in a phone-first composer.
        </Text>

        <AppButton
          label="Create a gist"
          onPress={() => navigation.navigate('GistEditor', {mode: 'create'})}
        />

        <AppCard>
          <AppEmptyState
            badgeLabel="Mobile flow"
            title="Draft first, publish when ready"
            description="Jump into the new editor with one tap, add one or more files, and save directly back into the gist stack."
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
