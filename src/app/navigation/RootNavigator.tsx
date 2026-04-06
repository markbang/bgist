import React from 'react';
import {Text} from 'react-native';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LoginScreen from '../../features/auth/screens/LoginScreen';
import {useSession} from '../../features/auth/session/SessionProvider';
import {appTheme} from '../theme/tokens';

const Stack = createNativeStackNavigator();

function SignedInPlaceholder() {
  return <Text>Session ready</Text>;
}

function LoadingScreen() {
  return <Text>Restoring session…</Text>;
}

export function RootNavigator() {
  const {status} = useSession();

  const screen =
    status === 'signedIn' ? (
      <Stack.Screen name="Ready" component={SignedInPlaceholder} />
    ) : status === 'signedOut' ? (
      <Stack.Screen name="Auth" component={LoginScreen} />
    ) : (
      <Stack.Screen name="Loading" component={LoadingScreen} />
    );

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
      <Stack.Navigator screenOptions={{headerShown: false}}>{screen}</Stack.Navigator>
    </NavigationContainer>
  );
}
