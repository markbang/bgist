import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useColorScheme} from 'react-native';
import {AuthProvider, useAuth} from './src/contexts/AuthContext';
import {lightTheme, darkTheme} from './src/constants/theme';
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

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;
  const {colors} = theme;

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: colors.headerBg},
        headerTintColor: colors.headerText,
        headerTitleStyle: {fontWeight: '600'},
        tabBarStyle: {
          backgroundColor: colors.bgPrimary,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.tabIconActive,
        tabBarInactiveTintColor: colors.tabIcon,
      }}>
      <Tab.Screen
        name="MyGists"
        component={MyGistsScreen}
        options={{
          title: 'My Gists',
          tabBarIcon: ({color, size}) => (
            <GistIcon color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          title: 'Explore',
          tabBarIcon: ({color, size}) => (
            <SearchIcon color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="CreateGist"
        component={CreateGistScreen}
        options={{
          title: 'Create',
          tabBarIcon: ({color, size}) => (
            <PlusIcon color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Starred"
        component={StarredScreen}
        options={{
          title: 'Starred',
          tabBarIcon: ({color, size}) => (
            <StarIcon color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({color, size}) => (
            <UserIcon color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Simple icon components
function GistIcon({color, size}: {color: string; size: number}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M16 18L22 6L18 2L8 14L16 18Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 4L8 10"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 16L4 22L8 20L12 16H10Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon({color, size}: {color: string; size: number}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke={color} strokeWidth="2" />
      <path
        d="M16 16L21 21"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PlusIcon({color, size}: {color: string; size: number}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 5V19M5 12H19"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StarIcon({color, size}: {color: string; size: number}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UserIcon({color, size}: {color: string; size: number}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2" />
      <path
        d="M6 21V19C6 16.7909 7.79086 15 10 15H14C16.2091 15 18 16.7909 18 19V21"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AppNavigator() {
  const {isAuthenticated, isLoading} = useAuth();
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;
  const {colors} = theme;

  if (isLoading) {
    return null; // TODO: Add loading screen
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
                title:
                  route.params?.mode === 'edit' ? 'Edit Gist' : 'Create Gist',
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
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
