import React from 'react';
import {render} from '@testing-library/react-native';
import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import type {MainTabParamList} from '../../src/app/navigation/types';

const captured: {
  screenOptions: ((args: {route: {name: keyof MainTabParamList}}) => Record<string, unknown>) | null;
  tabBar:
    | ((props: BottomTabBarProps) => React.ReactNode)
    | null;
  screens: Array<{name: keyof MainTabParamList; options?: Record<string, unknown>}>;
} = {
  screenOptions: null,
  tabBar: null,
  screens: [],
};

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({
      children,
      screenOptions,
      tabBar,
    }: {
      children: React.ReactNode;
      screenOptions: (args: {route: {name: keyof MainTabParamList}}) => Record<string, unknown>;
      tabBar?: (props: BottomTabBarProps) => React.ReactNode;
    }) => {
      captured.screenOptions = screenOptions;
      captured.tabBar = tabBar ?? null;
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
    captured.tabBar = null;
    captured.screens = [];
  });

  test('provides translated labels and renders a custom bottom tab bar', () => {
    const {MainTabs} = require('../../src/app/navigation/MainTabs') as typeof import('../../src/app/navigation/MainTabs');

    render(<MainTabs />);

    expect(typeof captured.screenOptions).toBe('function');
    expect(typeof captured.tabBar).toBe('function');

    const screenOptions = captured.screenOptions!;
    const homeOptions = screenOptions({route: {name: 'Home'}});
    const exploreOptions = screenOptions({route: {name: 'Explore'}});
    const composeOptions = screenOptions({route: {name: 'Compose'}});
    const profileOptions = screenOptions({route: {name: 'Profile'}});

    expect(homeOptions.tabBarLabel).toBe('首页');
    expect(exploreOptions.tabBarLabel).toBe('探索');
    expect(composeOptions.tabBarLabel).toBe('创作');
    expect(profileOptions.tabBarLabel).toBe('我的');

    const routes = captured.screens.map(screen => ({
      key: `${screen.name.toLowerCase()}-key`,
      name: screen.name,
    }));
    const descriptors = Object.fromEntries(
      routes.map(route => [
        route.key,
        {
          key: route.key,
          navigation: {} as never,
          options: {},
          render: () => <></>,
          route,
        },
      ]),
    ) as BottomTabBarProps['descriptors'];
    const tabBarElement = captured.tabBar!({
      state: {
        index: 2,
        key: 'main-tabs',
        routeNames: routes.map(route => route.name),
        routes,
        history: [],
        stale: false,
        type: 'tab',
        preloadedRouteKeys: [],
      },
      descriptors,
      insets: {top: 0, right: 0, bottom: 0, left: 0},
      navigation: {
        emit: jest.fn(() => ({defaultPrevented: false})),
        navigate: jest.fn(),
      } as never,
    }) as React.ReactElement;

    const tabBar = render(tabBarElement);

    expect(tabBar.getByTestId('main-tab-bar')).toBeTruthy();
    expect(tabBar.getByTestId('main-tab-home').props.accessibilityState).toEqual({});
    expect(tabBar.getByTestId('main-tab-compose').props.accessibilityState).toEqual({
      selected: true,
    });
    expect(tabBar.queryByText('首页')).toBeNull();
    expect(tabBar.queryByText('探索')).toBeNull();
    expect(tabBar.queryByText('创作')).toBeNull();
    expect(tabBar.queryByText('我的')).toBeNull();
    expect(tabBar.getByRole('tab', {name: '首页'})).toBeTruthy();
    expect(tabBar.getByRole('tab', {name: '探索'})).toBeTruthy();
    expect(tabBar.getByRole('tab', {name: '创作'})).toBeTruthy();
    expect(tabBar.getByRole('tab', {name: '我的'})).toBeTruthy();
    expect(tabBar.getByTestId('main-tab-compose-active-backdrop')).toBeTruthy();
    expect(tabBar.getByTestId('main-tab-compose-indicator')).toBeTruthy();
  });

  test('renders icon-only tab items without decorative icon backgrounds', () => {
    const {MainTabs} = require('../../src/app/navigation/MainTabs') as typeof import('../../src/app/navigation/MainTabs');

    render(<MainTabs />);

    const routes = captured.screens.map(screen => ({
      key: `${screen.name.toLowerCase()}-key`,
      name: screen.name,
    }));
    const descriptors = Object.fromEntries(
      routes.map(route => [
        route.key,
        {
          key: route.key,
          navigation: {} as never,
          options: {},
          render: () => <></>,
          route,
        },
      ]),
    ) as BottomTabBarProps['descriptors'];
    const tabBarElement = captured.tabBar!({
      state: {
        index: 0,
        key: 'main-tabs',
        routeNames: routes.map(route => route.name),
        routes,
        history: [],
        stale: false,
        type: 'tab',
        preloadedRouteKeys: [],
      },
      descriptors,
      insets: {top: 0, right: 0, bottom: 0, left: 0},
      navigation: {
        emit: jest.fn(() => ({defaultPrevented: false})),
        navigate: jest.fn(),
      } as never,
    }) as React.ReactElement;

    const tabBar = render(tabBarElement);
    const composeIconSlot = tabBar.getByTestId('main-tab-compose-icon-slot');

    expect(composeIconSlot.props.style.backgroundColor).toBeUndefined();
    expect(tabBar.getByTestId('main-tab-compose-active-backdrop')).toBeTruthy();
    expect(tabBar.getByTestId('main-tab-compose-indicator')).toBeTruthy();
  });
});
