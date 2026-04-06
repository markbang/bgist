import React from 'react';
import {StatusBar, StyleSheet, Text, View} from 'react-native';
import {NavigationContainer, DarkTheme, DefaultTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LoginScreen from '../../features/auth/screens/LoginScreen';
import {useSession} from '../../features/auth/session/SessionProvider';
import {GistDetailScreen} from '../../features/gists/screens/GistDetailScreen';
import {GistEditorScreen} from '../../features/gists/screens/GistEditorScreen';
import {GistHistoryScreen} from '../../features/gists/screens/GistHistoryScreen';
import {GistViewerScreen} from '../../features/gists/screens/GistViewerScreen';
import {SettingsScreen} from '../../features/profile/screens/SettingsScreen';
import {UserProfileScreen} from '../../features/profile/screens/UserProfileScreen';
import {useAppTheme} from '../theme/context';
import {createThemedStyles} from '../theme/tokens';
import {MainTabs} from './MainTabs';
import type {RootStackParamList} from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

function PlaceholderScreen({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const {themeName} = useAppTheme();
  const styles = getStyles(themeName);

  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderTitle}>{title}</Text>
      <Text style={styles.placeholderDescription}>{description}</Text>
    </View>
  );
}

function LoadingScreen() {
  return (
    <PlaceholderScreen
      title="Restoring session"
      description="Checking for a saved GitHub session before loading the app."
    />
  );
}

export function RootNavigator() {
  const {theme, themeName, isDark} = useAppTheme();
  const {status} = useSession();

  return (
    <>
      <StatusBar
        animated
        backgroundColor={theme.colors.canvas}
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />
      <NavigationContainer
        theme={{
          ...(themeName === 'dark' ? DarkTheme : DefaultTheme),
          colors: {
            ...(themeName === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
            background: theme.colors.canvas,
            card: theme.colors.surface,
            border: theme.colors.border,
            primary: theme.colors.accent,
            text: theme.colors.textPrimary,
          },
        }}>
        <Stack.Navigator screenOptions={{headerShown: false}}>
          {status === 'signedIn' ? (
            <>
              <Stack.Screen name="MainTabs" component={MainTabs} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
              <Stack.Screen name="GistDetail" component={GistDetailScreen} />
              <Stack.Screen name="GistEditor" component={GistEditorScreen} />
              <Stack.Screen name="GistViewer" component={GistViewerScreen} />
              <Stack.Screen name="UserProfile" component={UserProfileScreen} />
              <Stack.Screen name="GistHistory" component={GistHistoryScreen} />
            </>
          ) : status === 'signedOut' ? (
            <Stack.Screen name="Auth" component={LoginScreen} />
          ) : (
            <Stack.Screen name="Loading" component={LoadingScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

const getStyles = createThemedStyles(theme =>
  StyleSheet.create({
    placeholder: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.canvas,
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    placeholderTitle: {
      color: theme.colors.textPrimary,
      fontSize: 24,
      fontWeight: '800',
      textAlign: 'center',
    },
    placeholderDescription: {
      color: theme.colors.textSecondary,
      fontSize: 15,
      lineHeight: 22,
      textAlign: 'center',
    },
  }),
);
