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
                isFocused ? styles.itemFocused : null,
                pressed ? styles.itemPressed : null,
              ]}
              testID={options?.tabBarButtonTestID ?? `main-tab-${route.name.toLowerCase()}`}>
              <View
                style={[
                  styles.focusIndicator,
                  isFocused ? (isAccent ? styles.focusIndicatorAccent : styles.focusIndicatorShown) : null,
                ]}
              />
              <View
                testID={`main-tab-${route.name.toLowerCase()}-icon-slot`}
                style={[
                  styles.iconSlot,
                  isFocused ? (isAccent ? styles.iconSlotAccentFocused : styles.iconSlotFocused) : null,
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
      borderRadius: 24,
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
      position: 'relative',
      minHeight: 56,
      borderRadius: 18,
      borderCurve: 'continuous',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 3,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: theme.spacing.xs,
    },
    itemFocused: {
      backgroundColor: theme.colors.surfaceMuted,
    },
    itemPressed: {
      opacity: 0.9,
      transform: [{scale: 0.98}],
    },
    focusIndicator: {
      position: 'absolute',
      top: 0,
      width: 18,
      height: 3,
      borderRadius: 999,
      opacity: 0,
      backgroundColor: theme.colors.border,
    },
    focusIndicatorShown: {
      opacity: 1,
      backgroundColor: theme.colors.textPrimary,
    },
    focusIndicatorAccent: {
      opacity: 1,
      backgroundColor: theme.colors.accent,
    },
    iconSlot: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderCurve: 'continuous',
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconSlotFocused: {
      backgroundColor: theme.colors.surface,
    },
    iconSlotAccentFocused: {
      backgroundColor: theme.colors.accent,
    },
    label: {
      color: theme.colors.textSecondary,
      fontSize: 10,
      fontWeight: '700',
    },
    labelFocused: {
      color: theme.colors.textPrimary,
    },
    labelAccentFocused: {
      color: theme.colors.accent,
    },
  }),
);

const lightCanvas = '#f5f7fb';
