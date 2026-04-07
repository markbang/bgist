import React from 'react';
import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {Animated, Pressable, StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useAppTheme} from '../theme/context';
import {createThemedStyles} from '../theme/tokens';
import type {MainTabParamList} from './types';
import {TabBarIcon, type AppTabGlyphName} from '../../components/TabIcons';

export type MainTabBarItemConfig = {
  label: string;
  icon: AppTabGlyphName;
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
          paddingBottom: Math.max(insets.bottom, theme.spacing.xs + 2),
        },
      ]}>
      <View style={styles.inner} testID="main-tab-bar">
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const options = descriptors[route.key]?.options;
          const itemConfig = config[route.name as keyof MainTabParamList];

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
            <MainTabBarItem
              key={route.key}
              icon={itemConfig.icon}
              isFocused={isFocused}
              label={itemConfig.label}
              onLongPress={onLongPress}
              onPress={onPress}
              options={options}
              testID={options?.tabBarButtonTestID ?? `main-tab-${route.name.toLowerCase()}`}
            />
          );
        })}
      </View>
    </View>
  );
}

function MainTabBarItem({
  icon,
  isFocused,
  label,
  onLongPress,
  onPress,
  options,
  testID,
}: {
  icon: AppTabGlyphName;
  isFocused: boolean;
  label: string;
  onLongPress: () => void;
  onPress: () => void;
  options: BottomTabBarProps['descriptors'][string]['options'];
  testID: string;
}) {
  const {theme, themeName} = useAppTheme();
  const styles = getStyles(themeName);
  const progress = React.useRef(new Animated.Value(isFocused ? 1 : 0)).current;

  React.useEffect(() => {
    const animation = Animated.spring(progress, {
      toValue: isFocused ? 1 : 0,
      damping: 16,
      stiffness: 220,
      mass: 0.85,
      useNativeDriver: true,
    });

    animation.start();

    return () => {
      animation.stop();
    };
  }, [isFocused, progress]);

  const iconColor = isFocused ? theme.colors.accent : theme.colors.textSecondary;
  const iconAnimatedStyle = {
    transform: [
      {
        translateY: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -1.5],
        }),
      },
      {
        scale: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.08],
        }),
      },
    ],
  };
  const indicatorAnimatedStyle = {
    opacity: progress,
    transform: [
      {
        scaleX: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0.4, 1],
        }),
      },
    ],
  };

  return (
    <Pressable
      accessibilityLabel={options?.tabBarAccessibilityLabel ?? label}
      accessibilityRole="tab"
      accessibilityState={isFocused ? {selected: true} : {}}
      onLongPress={onLongPress}
      onPress={onPress}
      style={({pressed}) => [
        styles.item,
        pressed ? styles.itemPressed : null,
      ]}
      testID={testID}>
      <Animated.View
        style={[styles.iconWrap, iconAnimatedStyle]}
        testID={`${testID}-icon-wrap`}>
        <View
          testID={`${testID}-icon-slot`}
          style={styles.iconSlot}>
          <TabBarIcon active={isFocused} color={iconColor} icon={icon} size={23} />
        </View>
      </Animated.View>
      <Animated.View
        style={[styles.indicator, indicatorAnimatedStyle]}
        testID={`${testID}-indicator`}
      />
    </Pressable>
  );
}

const getStyles = createThemedStyles(theme =>
  StyleSheet.create({
    outer: {
      backgroundColor: theme.colors.canvas,
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.xs,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
    },
    inner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.xs,
      paddingTop: theme.spacing.xs,
    },
    item: {
      flex: 1,
      minHeight: 48,
      borderRadius: 16,
      borderCurve: 'continuous',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.xs,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: theme.spacing.xs,
    },
    itemPressed: {
      opacity: 0.88,
    },
    iconWrap: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconSlot: {
      width: 28,
      height: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },
    indicator: {
      width: 16,
      height: 3,
      borderRadius: 999,
      backgroundColor: theme.colors.accent,
    },
  }),
);
