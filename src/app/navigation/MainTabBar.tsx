import React from 'react';
import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useAppTheme} from '../theme/context';
import {createThemedStyles} from '../theme/tokens';
import type {MainTabParamList} from './types';
import {MaterialSymbolIcon, type MaterialSymbolName} from '../../components/TabIcons';

export type MainTabBarItemConfig = {
  label: string;
  activeIcon: MaterialSymbolName;
  inactiveIcon: MaterialSymbolName;
  tone?: 'default' | 'accent';
};

type MainTabBarProps = BottomTabBarProps & {
  config: Record<keyof MainTabParamList, MainTabBarItemConfig>;
};

export function MainTabBar({state, descriptors, navigation, config}: MainTabBarProps) {
  const insets = useSafeAreaInsets();
  const {theme, themeName} = useAppTheme();
  const styles = getStyles(themeName);

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.outer,
        {
          paddingBottom: Math.max(insets.bottom, theme.spacing.sm),
        },
      ]}>
      <View style={styles.inner} testID="main-tab-bar">
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const options = descriptors[route.key]?.options;
          const itemConfig = config[route.name as keyof MainTabParamList];
          const isAccent = itemConfig.tone === 'accent';
          const iconColor = isFocused
            ? isAccent
              ? theme.colors.accentContrast
              : theme.colors.textPrimary
            : isAccent
              ? theme.colors.accent
              : theme.colors.textSecondary;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name as keyof MainTabParamList);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <Pressable
              key={route.key}
              accessibilityLabel={options?.tabBarAccessibilityLabel ?? itemConfig.label}
              accessibilityRole="tab"
              accessibilityState={isFocused ? {selected: true} : {}}
              onLongPress={onLongPress}
              onPress={onPress}
              style={({pressed}) => [
                styles.item,
                isFocused
                  ? isAccent
                    ? styles.itemAccentFocused
                    : styles.itemFocused
                  : null,
                pressed ? styles.itemPressed : null,
              ]}
              testID={options?.tabBarButtonTestID ?? `main-tab-${route.name.toLowerCase()}`}>
              <View
                testID={`main-tab-${route.name.toLowerCase()}-icon-slot`}
                style={[
                  styles.iconSlot,
                  isFocused && !isAccent ? styles.iconSlotFocused : null,
                ]}>
                <MaterialSymbolIcon
                  color={iconColor}
                  icon={isFocused ? itemConfig.activeIcon : itemConfig.inactiveIcon}
                  size={route.name === 'Compose' ? 24 : 23}
                />
              </View>
              <Text
                numberOfLines={1}
                style={[
                  styles.label,
                  isFocused
                    ? isAccent
                      ? styles.labelAccentFocused
                      : styles.labelFocused
                    : null,
                ]}>
                {itemConfig.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const getStyles = createThemedStyles(theme =>
  StyleSheet.create({
    outer: {
      backgroundColor: theme.colors.canvas,
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.xs,
    },
    inner: {
      flexDirection: 'row',
      alignItems: 'stretch',
      gap: theme.spacing.xs,
      borderRadius: 26,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.xs,
      ...theme.shadow.card,
      shadowOpacity: theme.colors.canvas === lightCanvas ? 0.08 : 0.26,
      shadowRadius: theme.colors.canvas === lightCanvas ? 18 : 24,
      elevation: theme.colors.canvas === lightCanvas ? 8 : 12,
    },
    item: {
      flex: 1,
      minHeight: 58,
      borderRadius: 20,
      borderCurve: 'continuous',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: theme.spacing.xs,
    },
    itemFocused: {
      backgroundColor: theme.colors.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    itemAccentFocused: {
      backgroundColor: theme.colors.accent,
      borderWidth: 1,
      borderColor: theme.colors.accent,
    },
    itemPressed: {
      opacity: 0.9,
      transform: [{scale: 0.98}],
    },
    iconSlot: {
      width: 34,
      height: 34,
      borderRadius: 17,
      borderCurve: 'continuous',
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconSlotFocused: {
      backgroundColor: theme.colors.surface,
    },
    label: {
      color: theme.colors.textSecondary,
      fontSize: 11,
      fontWeight: '700',
    },
    labelFocused: {
      color: theme.colors.textPrimary,
    },
    labelAccentFocused: {
      color: theme.colors.accentContrast,
    },
  }),
);

const lightCanvas = '#f5f7fb';
