import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LoginScreen from '../../features/auth/screens/LoginScreen';
import {useSession} from '../../features/auth/session/SessionProvider';
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
            <Stack.Screen name="GistDetail">
              {() => (
                <PlaceholderScreen
                  title="Gist detail"
                  description="Task 5 wires the signed-in shell to the detail route. Detail content can land in a later task."
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="GistEditor">
              {() => (
                <PlaceholderScreen
                  title="Gist editor"
                  description="Compose flows are reserved for later work. This route exists so navigation can already target it."
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="GistViewer">
              {() => (
                <PlaceholderScreen
                  title="File viewer"
                  description="Viewer routes are registered and ready for future gist file browsing."
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="UserProfile">
              {() => (
                <PlaceholderScreen
                  title="User profile"
                  description="Profile drill-down is registered here as a placeholder route for the new shell."
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="GistHistory">
              {() => (
                <PlaceholderScreen
                  title="Gist history"
                  description="History drill-down is registered as part of the Task 5 signed-in navigation tree."
                />
              )}
            </Stack.Screen>
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
