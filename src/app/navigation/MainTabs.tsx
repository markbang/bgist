import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {appTheme} from '../theme/tokens';
import type {MainTabParamList} from './types';
import {HomeScreen} from '../../features/gists/screens/HomeScreen';
import {ExploreScreen} from '../../features/gists/screens/ExploreScreen';
import {ComposeScreen} from '../../features/gists/screens/ComposeScreen';
import {ProfileScreen} from '../../features/profile/screens/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: appTheme.colors.accent,
        tabBarInactiveTintColor: appTheme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: appTheme.colors.surface,
          borderTopColor: appTheme.colors.border,
          height: 68,
          paddingTop: appTheme.spacing.xs,
          paddingBottom: appTheme.spacing.sm,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        },
        sceneStyle: {
          backgroundColor: appTheme.colors.canvas,
        },
      }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Compose" component={ComposeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
