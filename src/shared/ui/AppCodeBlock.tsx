import React from 'react';
import {Platform, ScrollView, StyleSheet, Text, View} from 'react-native';
import {appTheme} from '../../app/theme/tokens';

interface AppCodeBlockProps {
  filename?: string;
  content: string;
  showLines?: boolean;
}

const monoFont = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'monospace',
});

export function AppCodeBlock({
  filename,
  content,
  showLines = false,
}: AppCodeBlockProps) {
  const lines = content.length > 0 ? content.split('\n') : [''];

  return (
    <View style={styles.shell}>
      {filename ? (
        <View style={styles.header}>
          <Text ellipsizeMode="middle" numberOfLines={1} style={styles.filename}>
            {filename}
          </Text>
        </View>
      ) : null}
      <ScrollView
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        style={styles.viewport}
        testID="app-code-block-vertical-scroll">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.content}>
            {lines.map((line, index) => (
              <View key={`${index}-${line}`} style={styles.row}>
                {showLines ? <Text style={styles.lineNumber}>{index + 1}</Text> : null}
                <Text ellipsizeMode="clip" numberOfLines={1} style={styles.line}>
                  {line || ' '}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
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
  filename: {
    color: '#93c5fd',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  viewport: {
    minHeight: 0,
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
    flexShrink: 0,
    color: appTheme.colors.codeText,
    fontFamily: monoFont,
    fontSize: 13,
    lineHeight: 20,
  },
});
