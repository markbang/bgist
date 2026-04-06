import React from 'react';
import {Platform, ScrollView, StyleSheet, Text, View} from 'react-native';
import {appTheme} from '../../app/theme/tokens';

interface AppCodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
}

const monoFont = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'monospace',
});

export function AppCodeBlock({
  code,
  language,
  showLineNumbers = false,
}: AppCodeBlockProps) {
  const lines = code.length > 0 ? code.split('\n') : [''];

  return (
    <View style={styles.shell}>
      {language ? (
        <View style={styles.header}>
          <Text style={styles.language}>{language}</Text>
        </View>
      ) : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.content}>
          {lines.map((line, index) => (
            <View key={`${index}-${line}`} style={styles.row}>
              {showLineNumbers ? <Text style={styles.lineNumber}>{index + 1}</Text> : null}
              <Text style={styles.line}>{line || ' '}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderRadius: appTheme.radius.lg,
    borderCurve: 'continuous',
    overflow: 'hidden',
    backgroundColor: appTheme.colors.codeBg,
  },
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(226, 232, 240, 0.16)',
    paddingHorizontal: appTheme.spacing.md,
    paddingVertical: appTheme.spacing.sm,
  },
  language: {
    color: '#93c5fd',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  content: {
    minWidth: '100%',
    paddingHorizontal: appTheme.spacing.md,
    paddingVertical: appTheme.spacing.sm,
    gap: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  lineNumber: {
    width: 28,
    paddingRight: appTheme.spacing.sm,
    color: 'rgba(226, 232, 240, 0.45)',
    fontFamily: monoFont,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'right',
  },
  line: {
    flexShrink: 1,
    color: appTheme.colors.codeText,
    fontFamily: monoFont,
    fontSize: 13,
    lineHeight: 20,
  },
});
