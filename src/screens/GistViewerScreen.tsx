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
import Clipboard from '@react-native-clipboard/clipboard';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/types';
import {lightTheme, darkTheme} from '../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'GistViewer'>;

export default function GistViewerScreen({route}: Props) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;
  const {colors} = theme;
  const {filename, content} = route.params;

  const [showLineNumbers, setShowLineNumbers] = useState(true);

  const lines = content.split('\n');

  const handleCopy = () => {
    Clipboard.setString(content);
    Alert.alert('Copied', 'Code copied to clipboard');
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.bgCode}]}>
      {/* Toolbar */}
      <View
        style={[
          styles.toolbar,
          {backgroundColor: colors.bgSecondary, borderBottomColor: colors.border},
        ]}>
        <Text
          style={[styles.filename, {color: colors.textPrimary}]}>
          {filename}
        </Text>
        <View style={{flexDirection: 'row', gap: 12}}>
          <TouchableOpacity
            onPress={() => setShowLineNumbers(prev => !prev)}
            style={[
              styles.toolBtn,
              {backgroundColor: showLineNumbers ? colors.accent : 'transparent'},
            ]}>
            <Text
              style={[
                styles.toolBtnText,
                {color: showLineNumbers ? '#fff' : colors.textSecondary},
              ]}>
              #
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleCopy} style={styles.toolBtn}>
            <Text style={[styles.toolBtnText, {color: colors.textSecondary}]}>
              📋
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Code Content */}
      <ScrollView
        horizontal
        style={styles.codeScrollView}
        contentContainerStyle={styles.codeContainer}>
        <View style={styles.codeContent}>
          {lines.map((line: string, index: number) => (
            <View key={index} style={styles.codeLine}>
              {showLineNumbers && (
                <Text
                  style={[
                    styles.lineNumber,
                    {color: colors.textTertiary},
                  ]}>
                  {String(index + 1).padStart(
                    String(lines.length).length,
                    ' ',
                  )}
                </Text>
              )}
              <Text
                style={[
                  styles.lineContent,
                  {color: colors.textPrimary},
                ]}>
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
  container: {
    flex: 1,
  },
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
  toolBtn: {
    padding: 6,
    borderRadius: 4,
  },
  toolBtnText: {
    fontSize: 14,
  },
  codeScrollView: {
    flex: 1,
  },
  codeContainer: {
    paddingVertical: 8,
  },
  codeContent: {
    paddingHorizontal: 8,
  },
  codeLine: {
    flexDirection: 'row',
    paddingVertical: 1,
  },
  lineNumber: {
    fontSize: 12,
    fontFamily: Platform.select({ios: 'Menlo', android: 'monospace'}),
    textAlign: 'right',
    width: 36,
    marginRight: 16,
    userSelect: 'none',
  },
  lineContent: {
    fontSize: 13,
    fontFamily: Platform.select({ios: 'Menlo', android: 'monospace'}),
    lineHeight: 20,
    flex: 1,
  },
});
