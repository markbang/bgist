import React from 'react';
import {createBottomTabNavigator, type BottomTabBarProps} from '@react-navigation/bottom-tabs';
import type {MainTabParamList} from './types';
import {HomeScreen} from '../../features/gists/screens/HomeScreen';
import {ExploreScreen} from '../../features/gists/screens/ExploreScreen';
import {ComposeScreen} from '../../features/gists/screens/ComposeScreen';
import {ProfileScreen} from '../../features/profile/screens/ProfileScreen';
import {useI18n} from '../../i18n/context';
import {useAppTheme} from '../theme/context';
import {MainTabBar, type MainTabBarItemConfig} from './MainTabBar';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  const {t} = useI18n();
  const {theme} = useAppTheme();

  const tabConfig = React.useMemo<Record<keyof MainTabParamList, MainTabBarItemConfig>>(
    () => ({
      Home: {
        label: t('nav.home'),
        icon: 'gists',
      },
      Explore: {
        label: t('nav.explore'),
        icon: 'search',
      },
      Compose: {
        label: t('nav.compose'),
        icon: 'compose',
      },
      Profile: {
        label: t('nav.profile'),
        icon: 'profile',
      },
    }),
    [t],
  );
  const renderTabBar = React.useCallback(
    (props: BottomTabBarProps) => <MainTabBar {...props} config={tabConfig} />,
    [tabConfig],
  );

  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={renderTabBar}
      screenOptions={({route}) => {
        const config = tabConfig[route.name];

        return {
          headerShown: false,
          tabBarLabel: config.label,
          title: config.label,
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
