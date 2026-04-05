import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useColorScheme, Text, View, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AuthProvider, useAuth} from './src/contexts/AuthContext';
import {I18nProvider} from './src/i18n/context';
import {lightTheme, darkTheme} from './src/constants/theme';
import {FileIcon, SearchIcon, PlusIcon, StarIcon, UserIcon} from './src/components/TabIcons';
import ErrorBoundary from './src/components/ErrorBoundary';
import LoginScreen from './src/screens/LoginScreen';
import MyGistsScreen from './src/screens/MyGistsScreen';
import ExploreScreen from './src/screens/ExploreScreen';
import CreateGistScreen from './src/screens/CreateGistScreen';
import StarredScreen from './src/screens/StarredScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import GistDetailScreen from './src/screens/GistDetailScreen';
import GistEditorScreen from './src/screens/GistEditorScreen';
import GistViewerScreen from './src/screens/GistViewerScreen';
import UserProfileScreen from './src/screens/UserProfileScreen';
import GistHistoryScreen from './src/screens/GistHistoryScreen';
import type {RootStackParamList, MainTabParamList} from './src/navigation/types';
import {useI18n} from './src/i18n/context';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function TabIcon({label, focused, color}: {label: string; focused: boolean; color: string}) {
  const size = 24;
  switch (label) {
    case 'MyGists':
      return <FileIcon size={size} color={color} />;
    case 'Explore':
      return <SearchIcon size={size} color={color} />;
    case 'CreateGist':
      return <PlusIcon size={size} color={color} />;
    case 'Starred':
      return <StarIcon size={size} color={color} />;
    case 'Profile':
      return <UserIcon size={size} color={color} />;
    default:
      return <FileIcon size={size} color={color} />;
  }
}

function MainTabs() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;
  const {colors} = theme;
  const {t} = useI18n();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerStyle: {backgroundColor: colors.headerBg},
        headerTintColor: colors.headerText,
        headerTitleStyle: {fontWeight: '600'},
        tabBarStyle: {
          backgroundColor: colors.bgPrimary,
          borderTopColor: colors.border,
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 4,
        },
        tabBarActiveTintColor: colors.tabIconActive,
        tabBarInactiveTintColor: colors.tabIcon,
        tabBarIcon: ({focused, color}) => (
          <TabIcon label={route.name} focused={focused} color={color} />
        ),
        tabBarLabel: ({focused, color}) => {
          const labels: Record<string, string> = {
            MyGists: t('nav.myGists'),
            Explore: t('nav.explore'),
            CreateGist: t('nav.create'),
            Starred: t('nav.starred'),
            Profile: t('nav.profile'),
          };
          return (
            <Text style={[styles.tabLabel, {color, fontWeight: focused ? '600' : '400'}]}>
              {labels[route.name] || route.name}
            </Text>
          );
        },
      })}>
      <Tab.Screen
        name="MyGists"
        component={MyGistsScreen}
        options={{title: 'My Gists'}}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{title: 'Explore'}}
      />
      <Tab.Screen
        name="CreateGist"
        component={CreateGistScreen}
        options={{title: 'Create'}}
      />
      <Tab.Screen
        name="Starred"
        component={StarredScreen}
        options={{title: 'Starred'}}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{title: 'Profile'}}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const {isAuthenticated, isLoading} = useAuth();
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;
  const {colors} = theme;

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, {backgroundColor: colors.bgPrimary}]}>
        <Text style={{color: colors.textPrimary, fontSize: 16}}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {backgroundColor: colors.headerBg},
          headerTintColor: colors.headerText,
          headerTitleStyle: {fontWeight: '600'},
        }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen
              name="MainTabs"
              component={MainTabs}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="GistDetail"
              component={GistDetailScreen}
              options={{title: 'Gist'}}
            />
            <Stack.Screen
              name="GistEditor"
              component={GistEditorScreen}
              options={({route}) => ({
                title: route.params?.mode === 'edit' ? 'Edit Gist' : 'Create Gist',
              })}
            />
            <Stack.Screen
              name="GistViewer"
              component={GistViewerScreen}
              options={{title: 'File'}}
            />
            <Stack.Screen
              name="UserProfile"
              component={UserProfileScreen}
              options={({route}) => ({title: route.params.username})}
            />
            <Stack.Screen
              name="GistHistory"
              component={GistHistoryScreen}
              options={{title: 'Revisions'}}
            />
          </>
        ) : (
          <Stack.Screen
            name="Auth"
            component={LoginScreen}
            options={{headerShown: false}}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <I18nProvider>
          <AppNavigator />
        </I18nProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
  },
});
