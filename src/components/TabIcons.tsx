import React from 'react';
import {useColorScheme, View} from 'react-native';
import {lightTheme, darkTheme} from '../constants/theme';

interface IconProps {
  size?: number;
  color?: string;
}

// File/Gist icon
export function FileIcon({size = 24, color}: IconProps) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;
  const c = color || theme.colors.tabIcon;

  return (
    <View style={{width: size, height: size}}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path
          d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z"
          stroke={c}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14 2V8H20"
          stroke={c}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 13H16"
          stroke={c}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M8 17H13"
          stroke={c}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </View>
  );
}

// Search icon
export function SearchIcon({size = 24, color}: IconProps) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;
  const c = color || theme.colors.tabIcon;

  return (
    <View style={{width: size, height: size}}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="7" stroke={c} strokeWidth="1.5" />
        <path
          d="M16 16L21 21"
          stroke={c}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </View>
  );
}

// Plus icon
export function PlusIcon({size = 24, color}: IconProps) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;
  const c = color || theme.colors.tabIcon;

  return (
    <View style={{width: size, height: size}}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path
          d="M12 5V19M5 12H19"
          stroke={c}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </View>
  );
}

// Star icon
export function StarIcon({size = 24, color}: IconProps) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;
  const c = color || theme.colors.tabIcon;

  return (
    <View style={{width: size, height: size}}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
          stroke={c}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </View>
  );
}

// User icon
export function UserIcon({size = 24, color}: IconProps) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;
  const c = color || theme.colors.tabIcon;

  return (
    <View style={{width: size, height: size}}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" stroke={c} strokeWidth="1.5" />
        <path
          d="M6 21V19C6 16.79 7.79 15 10 15H14C16.21 15 18 16.79 18 19V21"
          stroke={c}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </View>
  );
}
