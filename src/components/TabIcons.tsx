import React from 'react';
import {View} from 'react-native';
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
