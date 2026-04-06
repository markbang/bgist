import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LoginScreen from '../../features/auth/screens/LoginScreen';
import {useSession} from '../../features/auth/session/SessionProvider';
import {GistDetailScreen} from '../../features/gists/screens/GistDetailScreen';
import {GistEditorScreen} from '../../features/gists/screens/GistEditorScreen';
import {GistHistoryScreen} from '../../features/gists/screens/GistHistoryScreen';
import {GistViewerScreen} from '../../features/gists/screens/GistViewerScreen';
import {UserProfileScreen} from '../../features/profile/screens/UserProfileScreen';
import {appTheme} from '../theme/tokens';
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
  const {status} = useSession();

  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: appTheme.colors.canvas,
          card: appTheme.colors.surface,
          border: appTheme.colors.border,
          primary: appTheme.colors.accent,
          text: appTheme.colors.textPrimary,
        },
      }}>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {status === 'signedIn' ? (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
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
  );
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appTheme.colors.canvas,
    paddingHorizontal: appTheme.spacing.lg,
    gap: appTheme.spacing.sm,
  },
  placeholderTitle: {
    color: appTheme.colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  placeholderDescription: {
    color: appTheme.colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
});
