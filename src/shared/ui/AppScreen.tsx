import React from 'react';
import {StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {appTheme} from '../../app/theme/tokens';

export function AppScreen({children}: {children: React.ReactNode}) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: appTheme.colors.canvas},
  content: {flex: 1, backgroundColor: appTheme.colors.canvas},
});
