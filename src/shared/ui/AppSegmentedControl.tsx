import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
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
  const {themeName} = useAppTheme();
  const styles = getStyles(themeName);

  return (
    <View style={[styles.container, disabled ? styles.containerDisabled : null]}>
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
              isSelected ? styles.segmentSelected : null,
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
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      borderRadius: theme.radius.lg,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceMuted,
      padding: theme.spacing.xs,
    },
    containerDisabled: {
      opacity: 0.6,
    },
    segment: {
      flex: 1,
      minHeight: 44,
      borderRadius: theme.radius.md,
      borderCurve: 'continuous',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.sm,
    },
    segmentSelected: {
      backgroundColor: theme.colors.surface,
      ...theme.shadow.card,
      shadowOpacity: themeNameShadowOpacity(theme.colors.canvas),
      shadowRadius: 10,
      elevation: 2,
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
