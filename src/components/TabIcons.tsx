import React from 'react';
import {View} from 'react-native';
import Svg, {Circle, Path} from 'react-native-svg';
import {useAppTheme} from '../app/theme/context';

interface IconProps {
  size?: number;
  color?: string;
}

// File/Gist icon
export function FileIcon({size = 24, color}: IconProps) {
  const {theme} = useAppTheme();
  const c = color || theme.colors.textSecondary;

  return (
    <View style={{width: size, height: size}}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z"
          stroke={c}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M14 2V8H20"
          stroke={c}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M8 13H16"
          stroke={c}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <Path
          d="M8 17H13"
          stroke={c}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

// Search icon
export function SearchIcon({size = 24, color}: IconProps) {
  const {theme} = useAppTheme();
  const c = color || theme.colors.textSecondary;

  return (
    <View style={{width: size, height: size}}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="11" cy="11" r="7" stroke={c} strokeWidth="1.5" />
        <Path
          d="M16 16L21 21"
          stroke={c}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

// Plus icon
export function PlusIcon({size = 24, color}: IconProps) {
  const {theme} = useAppTheme();
  const c = color || theme.colors.textSecondary;

  return (
    <View style={{width: size, height: size}}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 5V19M5 12H19"
          stroke={c}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

// Star icon
export function StarIcon({size = 24, color}: IconProps) {
  const {theme} = useAppTheme();
  const c = color || theme.colors.textSecondary;

  return (
    <View style={{width: size, height: size}}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
          stroke={c}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

// User icon
export function UserIcon({size = 24, color}: IconProps) {
  const {theme} = useAppTheme();
  const c = color || theme.colors.textSecondary;

  return (
    <View style={{width: size, height: size}}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="8" r="4" stroke={c} strokeWidth="1.5" />
        <Path
          d="M6 21V19C6 16.79 7.79 15 10 15H14C16.21 15 18 16.79 18 19V21"
          stroke={c}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

export function SettingsIcon({size = 24, color}: IconProps) {
  const {theme} = useAppTheme();
  const c = color || theme.colors.textSecondary;

  return (
    <View style={{width: size, height: size}}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="3" stroke={c} strokeWidth="1.7" />
        <Path
          d="M19.4 15A1.65 1.65 0 0 0 19.73 16.82L19.79 16.88A2 2 0 1 1 16.96 19.71L16.9 19.65A1.65 1.65 0 0 0 15.08 19.32A1.65 1.65 0 0 0 14 20.85V21A2 2 0 1 1 10 21V20.91A1.65 1.65 0 0 0 8.92 19.39A1.65 1.65 0 0 0 7.1 19.72L7.04 19.78A2 2 0 1 1 4.21 16.95L4.27 16.89A1.65 1.65 0 0 0 4.6 15.07A1.65 1.65 0 0 0 3.07 14H3A2 2 0 1 1 3 10H3.09A1.65 1.65 0 0 0 4.61 8.92A1.65 1.65 0 0 0 4.28 7.1L4.22 7.04A2 2 0 1 1 7.05 4.21L7.11 4.27A1.65 1.65 0 0 0 8.93 4.6H9A1.65 1.65 0 0 0 10 3.09V3A2 2 0 1 1 14 3V3.09A1.65 1.65 0 0 0 15.08 4.61A1.65 1.65 0 0 0 16.9 4.28L16.96 4.22A2 2 0 1 1 19.79 7.05L19.73 7.11A1.65 1.65 0 0 0 19.4 8.93V9A1.65 1.65 0 0 0 20.93 10H21A2 2 0 1 1 21 14H20.91A1.65 1.65 0 0 0 19.39 15.08L19.4 15Z"
          stroke={c}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
      </Svg>
    </View>
  );
}
