import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {AppScreen} from '../../../shared/ui/AppScreen';
import {appTheme} from '../../../app/theme/tokens';

export default function LoginScreen() {
  return (
    <AppScreen>
      <View style={styles.container}>
        <Text style={styles.title}>BGist</Text>
        <Text style={styles.subtitle}>GitHub Gist client for mobile</Text>
        <View style={styles.button}>
          <Text style={styles.buttonText}>Sign in with GitHub</Text>
        </View>
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
    alignItems: 'center',
  },
  buttonText: {color: '#ffffff', fontSize: 16, fontWeight: '600'},
});
