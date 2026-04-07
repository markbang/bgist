import React from 'react';
import {Animated, Pressable, StyleSheet, Text, View} from 'react-native';
import {createThemedStyles} from '../../app/theme/tokens';
import {useAppTheme} from '../../app/theme/context';

interface AppSegment<T extends string> {
  label: string;
  value: T;
}

interface AppSegmentedControlProps<T extends string> {
  options: ReadonlyArray<AppSegment<T>>;
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
}

export function AppSegmentedControl<T extends string>({
  options,
  value,
  onChange,
  disabled = false,
}: AppSegmentedControlProps<T>) {
  const {theme, themeName} = useAppTheme();
  const styles = getStyles(themeName);
  const thumbTranslateX = React.useRef(new Animated.Value(0)).current;
  const thumbOpacity = React.useRef(new Animated.Value(0)).current;
  const [containerWidth, setContainerWidth] = React.useState(0);
  const selectedIndex = React.useMemo(
    () => Math.max(0, options.findIndex(segment => segment.value === value)),
    [options, value],
  );
  const segmentGap = theme.spacing.xs;
  const segmentWidth = React.useMemo(() => {
    if (containerWidth <= 0 || options.length === 0) {
      return 0;
    }

    return (
      (containerWidth - theme.spacing.xs * 2 - segmentGap * Math.max(0, options.length - 1)) /
      options.length
    );
  }, [containerWidth, options.length, segmentGap, theme.spacing.xs]);

  React.useEffect(() => {
    if (!segmentWidth) {
      return;
    }

    const targetX = theme.spacing.xs + selectedIndex * (segmentWidth + segmentGap);
    const animation = Animated.parallel([
      Animated.spring(thumbTranslateX, {
        toValue: targetX,
        damping: 20,
        mass: 0.9,
        stiffness: 240,
        useNativeDriver: true,
      }),
      Animated.timing(thumbOpacity, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    return () => {
      animation.stop();
    };
  }, [segmentGap, segmentWidth, selectedIndex, theme.spacing.xs, thumbOpacity, thumbTranslateX]);

  return (
    <View
      onLayout={event => {
        setContainerWidth(event.nativeEvent.layout.width);
      }}
      style={[styles.container, disabled ? styles.containerDisabled : null]}>
      {segmentWidth ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.thumb,
            {
              width: segmentWidth,
              opacity: thumbOpacity,
              transform: [{translateX: thumbTranslateX}],
            },
          ]}
        />
      ) : null}
      {options.map(segment => {
        const isSelected = segment.value === value;

        return (
          <Pressable
            key={segment.value}
            accessibilityRole="button"
            accessibilityLabel={segment.label}
            accessibilityState={{disabled, selected: isSelected}}
            disabled={disabled}
            onPress={() => {
              if (!isSelected) {
                onChange(segment.value);
              }
            }}
            style={({pressed}) => [
              styles.segment,
              pressed && !disabled && !isSelected ? styles.segmentPressed : null,
            ]}>
            <Text style={[styles.label, isSelected ? styles.labelSelected : null]}>
              {segment.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const getStyles = createThemedStyles(theme =>
  StyleSheet.create({
    container: {
      position: 'relative',
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      borderRadius: theme.radius.lg,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceMuted,
      padding: theme.spacing.xs,
      overflow: 'hidden',
    },
    containerDisabled: {
      opacity: 0.6,
    },
    thumb: {
      position: 'absolute',
      top: theme.spacing.xs,
      bottom: theme.spacing.xs,
      left: 0,
      borderRadius: theme.radius.md,
      borderCurve: 'continuous',
      backgroundColor: theme.colors.surface,
      ...theme.shadow.card,
      shadowOpacity: themeNameShadowOpacity(theme.colors.canvas),
      shadowRadius: 10,
      elevation: 2,
    },
    segment: {
      zIndex: 1,
      flex: 1,
      minHeight: 44,
      borderRadius: theme.radius.md,
      borderCurve: 'continuous',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.sm,
    },
    segmentPressed: {
      opacity: 0.8,
    },
    label: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      fontWeight: '600',
    },
    labelSelected: {
      color: theme.colors.textPrimary,
    },
  }),
);

function themeNameShadowOpacity(canvas: string) {
  return canvas === lightCanvas ? 0.06 : 0.18;
}

const lightCanvas = '#f5f7fb';
