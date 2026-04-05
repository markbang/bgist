import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Platform,
} from 'react-native';
import {lightTheme, darkTheme} from '../constants/theme';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {hasError: false, error: null};
  }

  static getDerivedStateFromError(error: Error): State {
    return {hasError: true, error};
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('BGist Error Boundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({hasError: false, error: null});
  };

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }
    return this.props.children;
  }
}

function ErrorFallback({error, onReset}: {error: Error | null; onReset: () => void}) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;
  const {colors} = theme;

  return (
    <View style={[styles.container, {backgroundColor: colors.bgPrimary}]}>
      <View style={styles.content}>
        <Text style={{fontSize: 48, marginBottom: 16}}>⚠️</Text>
        <Text style={[styles.title, {color: colors.textPrimary}]}>
          应用出错了
        </Text>
        <Text style={[styles.subtitle, {color: colors.textSecondary}]}>
          请截图以下错误信息并反馈
        </Text>

        <View style={[styles.errorBox, {borderColor: colors.border}]}>
          <ScrollView style={styles.errorScroll}>
            <Text style={[styles.errorText, {color: colors.textSecondary}]}>
              {error?.toString() || 'Unknown error'}
            </Text>
          </ScrollView>
        </View>

        <TouchableOpacity
          style={[styles.resetBtn, {backgroundColor: colors.btnPrimaryBg}]}
          onPress={onReset}>
          <Text style={[styles.resetText, {color: colors.btnPrimaryText}]}>
            重试
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  content: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24},
  title: {fontSize: 22, fontWeight: '700', marginBottom: 8},
  subtitle: {fontSize: 14, textAlign: 'center', marginBottom: 24},
  errorBox: {
    width: '100%',
    maxHeight: 200,
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 24,
  },
  errorScroll: {padding: 12},
  errorText: {
    fontSize: 12,
    fontFamily: Platform.select({ios: 'Menlo', android: 'monospace'}),
    lineHeight: 18,
  },
  resetBtn: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 6,
  },
  resetText: {fontSize: 16, fontWeight: '600'},
});
