import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import type {MainTabParamList} from './types';
import {HomeScreen} from '../../features/gists/screens/HomeScreen';
import {ExploreScreen} from '../../features/gists/screens/ExploreScreen';
import {ComposeScreen} from '../../features/gists/screens/ComposeScreen';
import {ProfileScreen} from '../../features/profile/screens/ProfileScreen';
import {FileIcon, PlusIcon, SearchIcon, UserIcon} from '../../components/TabIcons';
import {useI18n} from '../../i18n/context';
import {useAppTheme} from '../theme/context';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  const {t} = useI18n();
  const {theme} = useAppTheme();

  const tabConfig: Record<
    keyof MainTabParamList,
    {
      label: string;
      Icon: typeof FileIcon;
    }
  > = {
    Home: {
      label: t('nav.home'),
      Icon: FileIcon,
    },
    Explore: {
      label: t('nav.explore'),
      Icon: SearchIcon,
    },
    Compose: {
      label: t('nav.compose'),
      Icon: PlusIcon,
    },
    Profile: {
      label: t('nav.profile'),
      Icon: UserIcon,
    },
  };

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({route}) => {
        const config = tabConfig[route.name];

        return {
          headerShown: false,
          tabBarActiveTintColor: theme.colors.accent,
          tabBarInactiveTintColor: theme.colors.textSecondary,
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
            height: 68,
            paddingTop: theme.spacing.xs,
            paddingBottom: theme.spacing.sm,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '700',
          },
          tabBarLabel: config.label,
          title: config.label,
          tabBarIcon: ({color, size}) => React.createElement(config.Icon, {color, size}),
          sceneStyle: {
            backgroundColor: theme.colors.canvas,
          },
        };
      }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Compose" component={ComposeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
