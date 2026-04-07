import React from 'react';
import {View} from 'react-native';
import Svg, {Circle, Path} from 'react-native-svg';
import {SvgXml} from 'react-native-svg';
import {useAppTheme} from '../app/theme/context';
import {materialSymbols, type MaterialSymbolName} from './materialSymbols';

export interface IconProps {
  size?: number;
  color?: string;
}

interface MaterialSymbolIconProps extends IconProps {
  icon: MaterialSymbolName;
}

export type {MaterialSymbolName};

export type AppTabGlyphName = 'gists' | 'search' | 'compose' | 'profile';

export function MaterialSymbolIcon({icon, size = 24, color}: MaterialSymbolIconProps) {
  const {theme} = useAppTheme();
  const resolvedColor = color || theme.colors.textSecondary;
  const definition = materialSymbols[icon];
  const xml = React.useMemo(() => {
    const body = definition.body.replace(/currentColor/g, resolvedColor);
    const height = definition.height ?? 24;
    const width = definition.width ?? 24;

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">${body}</svg>`;
  }, [definition, resolvedColor]);

  return (
    <View style={{width: size, height: size}}>
      <SvgXml height={size} width={size} xml={xml} />
    </View>
  );
}

export function TabBarIcon({
  icon,
  size = 24,
  color,
  active = false,
}: IconProps & {
  icon: AppTabGlyphName;
  active?: boolean;
}) {
  const strokeWidth = active ? 2.1 : 1.9;

  switch (icon) {
    case 'gists':
      return (
        <Svg fill="none" height={size} viewBox="0 0 24 24" width={size}>
          <Path
            d="M8 4.75h6l2.75 2.75V19a1.25 1.25 0 0 1-1.25 1.25H8A1.25 1.25 0 0 1 6.75 19V6A1.25 1.25 0 0 1 8 4.75Z"
            stroke={color}
            strokeLinejoin="round"
            strokeWidth={strokeWidth}
          />
          <Path
            d="M14 4.75V8h3.25M9.5 11h5M9.5 14h5M9.5 17h3.25"
            stroke={color}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={strokeWidth}
          />
        </Svg>
      );
    case 'search':
      return (
        <Svg fill="none" height={size} viewBox="0 0 24 24" width={size}>
          <Circle cx="10.5" cy="10.5" r="4.75" stroke={color} strokeWidth={strokeWidth} />
          <Path
            d="m14.25 14.25 4 4"
            stroke={color}
            strokeLinecap="round"
            strokeWidth={strokeWidth}
          />
        </Svg>
      );
    case 'compose':
      return (
        <Svg fill="none" height={size} viewBox="0 0 24 24" width={size}>
          <Path
            d="M7.75 4.75h8.5A2.5 2.5 0 0 1 18.75 7.25v8.5a2.5 2.5 0 0 1-2.5 2.5h-8.5a2.5 2.5 0 0 1-2.5-2.5v-8.5a2.5 2.5 0 0 1 2.5-2.5Z"
            stroke={color}
            strokeLinejoin="round"
            strokeWidth={strokeWidth}
          />
          <Path
            d="M12 8.25v6.5M8.75 11.5h6.5"
            stroke={color}
            strokeLinecap="round"
            strokeWidth={strokeWidth}
          />
        </Svg>
      );
    case 'profile':
      return (
        <Svg fill="none" height={size} viewBox="0 0 24 24" width={size}>
          <Circle cx="12" cy="8.5" r="2.75" stroke={color} strokeWidth={strokeWidth} />
          <Path
            d="M6.75 18a5.25 5.25 0 0 1 10.5 0"
            stroke={color}
            strokeLinecap="round"
            strokeWidth={strokeWidth}
          />
        </Svg>
      );
    default:
      return null;
  }
}

// File/Gist icon
export function FileIcon({size = 24, color}: IconProps) {
  return <MaterialSymbolIcon color={color} icon="description-outline-rounded" size={size} />;
}

// Search icon
export function SearchIcon({size = 24, color}: IconProps) {
  return <MaterialSymbolIcon color={color} icon="search-rounded" size={size} />;
}

// Plus icon
export function PlusIcon({size = 24, color}: IconProps) {
  return <MaterialSymbolIcon color={color} icon="add-circle-outline-rounded" size={size} />;
}

// Star icon
export function StarIcon({size = 24, color}: IconProps) {
  return <MaterialSymbolIcon color={color} icon="star-outline-rounded" size={size} />;
}

// User icon
export function UserIcon({size = 24, color}: IconProps) {
  return <MaterialSymbolIcon color={color} icon="account-circle-outline" size={size} />;
}

export function SettingsIcon({size = 24, color}: IconProps) {
  return <MaterialSymbolIcon color={color} icon="settings-outline-rounded" size={size} />;
}
