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
import {useI18n} from '../i18n/context';

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
  const {t} = useI18n();

  return (
    <View style={[styles.container, {backgroundColor: colors.bgPrimary}]}>
      <View style={styles.content}>
        <Text style={{fontSize: 48, marginBottom: 16}}>✏️</Text>
        <Text style={[styles.title, {color: colors.textPrimary}]}>
          {t('gist.createGist')}
        </Text>
        <Text style={[styles.subtitle, {color: colors.textSecondary}]}>
          {t('gist.description')}
        </Text>
        <TouchableOpacity
          style={[styles.btn, {backgroundColor: colors.btnPrimaryBg}]}
          onPress={() => navigation.navigate('GistEditor', {mode: 'create'})}>
          <Text style={[styles.btnText, {color: colors.btnPrimaryText}]}>
            {t('gist.createGist')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  content: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32},
  title: {fontSize: 22, fontWeight: '600', marginBottom: 8, textAlign: 'center'},
  subtitle: {fontSize: 14, textAlign: 'center', marginBottom: 32, lineHeight: 20},
  btn: {paddingHorizontal: 24, paddingVertical: 12, borderRadius: 6},
  btnText: {fontSize: 16, fontWeight: '600'},
});
