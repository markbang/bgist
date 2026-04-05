import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import type {CompositeNavigationProp} from '@react-navigation/native';
import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {MainTabParamList, RootStackParamList} from '../navigation/types';
import {lightTheme, darkTheme} from '../constants/theme';

type Props = {
  navigation: CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList, 'CreateGist'>,
    NativeStackNavigationProp<RootStackParamList>
  >;
};

export default function CreateGistScreen({navigation}: Props) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;
  const {colors} = theme;

  // No layout effect needed for tab screen

  return (
    <View style={[styles.container, {backgroundColor: colors.bgPrimary}]}>
      <View style={styles.content}>
        <Text style={[styles.icon, {fontSize: 48}]}>✏️</Text>
        <Text style={[styles.title, {color: colors.textPrimary}]}>
          Create a new Gist
        </Text>
        <Text style={[styles.subtitle, {color: colors.textSecondary}]}>
          Add description, files, and choose visibility
        </Text>

        <TouchableOpacity
          style={[
            styles.button,
            {backgroundColor: colors.btnPrimaryBg},
          ]}
          onPress={() =>
            navigation.navigate('GistEditor', {mode: 'create'})
          }>
          <Text
            style={[
              styles.buttonText,
              {color: colors.btnPrimaryText},
            ]}>
            Start Writing
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
