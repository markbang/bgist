import React from 'react';
import {StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {createThemedStyles} from '../../app/theme/tokens';
import {useAppTheme} from '../../app/theme/context';

export function AppScreen({children}: {children: React.ReactNode}) {
  const {themeName} = useAppTheme();
  const styles = getStyles(themeName);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

const getStyles = createThemedStyles(theme =>
  StyleSheet.create({
    safeArea: {flex: 1, backgroundColor: theme.colors.canvas},
    content: {flex: 1, backgroundColor: theme.colors.canvas},
  }),
);
