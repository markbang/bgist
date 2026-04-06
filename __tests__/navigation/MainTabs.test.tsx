import React from 'react';
import {render} from '@testing-library/react-native';
import type {MainTabParamList} from '../../src/app/navigation/types';

const captured: {
  screenOptions: ((args: {route: {name: keyof MainTabParamList}}) => Record<string, unknown>) | null;
  screens: Array<{name: keyof MainTabParamList; options?: Record<string, unknown>}>;
} = {
  screenOptions: null,
  screens: [],
};

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({
      children,
      screenOptions,
    }: {
      children: React.ReactNode;
      screenOptions: (args: {route: {name: keyof MainTabParamList}}) => Record<string, unknown>;
    }) => {
      captured.screenOptions = screenOptions;
      return <>{children}</>;
    },
    Screen: ({
      name,
      options,
    }: {
      name: keyof MainTabParamList;
      options?: Record<string, unknown>;
    }) => {
      captured.screens.push({name, options});
      return null;
    },
  }),
}));

jest.mock('../../src/i18n/context', () => ({
  useI18n: () => ({
    language: 'zh',
    setLanguage: jest.fn(),
    t: (key: string) =>
      (
        {
          'nav.home': '首页',
          'nav.explore': '探索',
          'nav.compose': '创作',
          'nav.profile': '我的',
        } as Record<string, string>
      )[key] ?? key,
  }),
}));

jest.mock('../../src/features/gists/screens/HomeScreen', () => ({
  HomeScreen: () => null,
}));

jest.mock('../../src/features/gists/screens/ExploreScreen', () => ({
  ExploreScreen: () => null,
}));

jest.mock('../../src/features/gists/screens/ComposeScreen', () => ({
  ComposeScreen: () => null,
}));

jest.mock('../../src/features/profile/screens/ProfileScreen', () => ({
  ProfileScreen: () => null,
}));

describe('MainTabs', () => {
  beforeEach(() => {
    captured.screenOptions = null;
    captured.screens = [];
  });

  test('provides translated labels and tab icons for each main tab', () => {
    const {MainTabs} = require('../../src/app/navigation/MainTabs') as typeof import('../../src/app/navigation/MainTabs');

    render(<MainTabs />);

    expect(typeof captured.screenOptions).toBe('function');

    const screenOptions = captured.screenOptions!;
    const homeOptions = screenOptions({route: {name: 'Home'}});
    const exploreOptions = screenOptions({route: {name: 'Explore'}});
    const composeOptions = screenOptions({route: {name: 'Compose'}});
    const profileOptions = screenOptions({route: {name: 'Profile'}});

    expect(homeOptions.tabBarLabel).toBe('首页');
    expect(exploreOptions.tabBarLabel).toBe('探索');
    expect(composeOptions.tabBarLabel).toBe('创作');
    expect(profileOptions.tabBarLabel).toBe('我的');
    expect(typeof homeOptions.tabBarIcon).toBe('function');
    expect(typeof exploreOptions.tabBarIcon).toBe('function');
    expect(typeof composeOptions.tabBarIcon).toBe('function');
    expect(typeof profileOptions.tabBarIcon).toBe('function');
  });
});
