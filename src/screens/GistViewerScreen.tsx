import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/types';
import {lightTheme, darkTheme} from '../constants/theme';
import {useI18n} from '../i18n/context';

type Props = NativeStackScreenProps<RootStackParamList, 'GistViewer'>;

export default function GistViewerScreen({route}: Props) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;
  const {colors} = theme;
  const {t} = useI18n();
  const {filename, content} = route.params;

  const [showLines, setShowLines] = useState(true);
  const lines = content.split('\n');

  const handleCopy = () => {
    const {Clipboard} = require('react-native');
    Clipboard.setString(content);
    Alert.alert(t('common.copy'), t('common.copied'));
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.bgCode}]}>
      {/* Toolbar */}
      <View style={[styles.toolbar, {borderBottomColor: colors.border}]}>
        <Text style={[styles.filename, {color: colors.textPrimary}]}>
          {filename}
        </Text>
        <View style={{flexDirection: 'row', gap: 8}}>
          <TouchableOpacity
            onPress={() => setShowLines(p => !p)}
            style={[styles.toolBtn, showLines && {backgroundColor: colors.accent}]}>
            <Text
              style={[
                styles.toolText,
                {color: showLines ? '#fff' : colors.textSecondary},
              ]}>
              #
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleCopy} style={styles.toolBtn}>
            <Text style={[styles.toolText, {color: colors.textSecondary}]}>
              📋
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Code */}
      <ScrollView horizontal style={styles.scroll}>
        <View style={styles.content}>
          {lines.map((line: string, index: number) => (
            <View key={index} style={styles.line}>
              {showLines && (
                <Text style={[styles.lineNum, {color: colors.textTertiary}]}>
                  {String(index + 1).padStart(String(lines.length).length, ' ')}
                </Text>
              )}
              <Text style={[styles.lineText, {color: colors.textPrimary}]}>
                {line || ' '}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  filename: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Platform.select({ios: 'Menlo', android: 'monospace'}),
  },
  toolBtn: {padding: 6, borderRadius: 4},
  toolText: {fontSize: 14},
  scroll: {flex: 1},
  content: {paddingVertical: 8, paddingHorizontal: 8},
  line: {flexDirection: 'row', paddingVertical: 1},
  lineNum: {
    fontSize: 12,
    fontFamily: Platform.select({ios: 'Menlo', android: 'monospace'}),
    textAlign: 'right',
    width: 36,
    marginRight: 16,
  },
  lineText: {
    fontSize: 13,
    fontFamily: Platform.select({ios: 'Menlo', android: 'monospace'}),
    lineHeight: 20,
    flex: 1,
  },
});
