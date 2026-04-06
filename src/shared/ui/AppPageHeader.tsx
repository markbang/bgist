import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useAppTheme} from '../../app/theme/context';
import {createThemedStyles} from '../../app/theme/tokens';

interface AppPageHeaderProps {
  title: string;
  accessory?: React.ReactNode;
  numberOfLines?: number;
}

export function AppPageHeader({
  title,
  accessory,
  numberOfLines = 2,
}: AppPageHeaderProps) {
  const {themeName} = useAppTheme();
  const styles = getStyles(themeName);

  return (
    <View style={styles.header}>
      <View style={styles.row}>
        <Text numberOfLines={numberOfLines} style={styles.title}>
          {title}
        </Text>
        {accessory ? <View style={styles.accessory}>{accessory}</View> : null}
      </View>
    </View>
  );
}

const getStyles = createThemedStyles(theme =>
  StyleSheet.create({
    header: {
      gap: theme.spacing.sm,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
    },
    title: {
      flex: 1,
      color: theme.colors.textPrimary,
      fontSize: 30,
      fontWeight: '800',
    },
    accessory: {
      flexShrink: 0,
    },
  }),
);
