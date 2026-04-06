import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {appTheme} from '../../app/theme/tokens';

interface AppSegment<T extends string> {
  label: string;
  value: T;
}

interface AppSegmentedControlProps<T extends string> {
  options: AppSegment<T>[];
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

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: appTheme.spacing.xs,
    borderRadius: appTheme.radius.lg,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    backgroundColor: appTheme.colors.surfaceMuted,
    padding: appTheme.spacing.xs,
  },
  containerDisabled: {
    opacity: 0.6,
  },
  segment: {
    flex: 1,
    minHeight: 44,
    borderRadius: appTheme.radius.md,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: appTheme.spacing.sm,
  },
  segmentSelected: {
    backgroundColor: appTheme.colors.surface,
    ...appTheme.shadow.card,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  segmentPressed: {
    opacity: 0.8,
  },
  label: {
    color: appTheme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  labelSelected: {
    color: appTheme.colors.textPrimary,
  },
});
