/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useState, useEffect} from 'react';
import {
  Text,
  View,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  Alert,
  Platform,
  Dimensions,
  ScrollView,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

function App() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

class ErrorBoundary extends React.Component<
  {children: React.ReactNode},
  {hasError: boolean; error: Error | null; errorInfo: React.ErrorInfo | null}
> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = {hasError: false, error: null, errorInfo: null};
  }

  static getDerivedStateFromError(error: Error) {
    return {hasError: true, error};
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('BGist Error:', error, errorInfo);
    this.setState({error, errorInfo});
  }

  render() {
    if (this.state.hasError) {
      return <ErrorScreen error={this.state.error} errorInfo={this.state.errorInfo} />;
    }
    return this.props.children;
  }
}

function ErrorScreen({error, errorInfo}: {error: Error | null; errorInfo: React.ErrorInfo | null}) {
  const isDarkMode = useColorScheme() === 'dark';
  
  return (
    <View style={[styles.errorContainer, isDarkMode && styles.darkContainer]}>
      <Text style={[styles.errorTitle, isDarkMode && styles.darkText]}>
        ⚠️ App Error
      </Text>
      <Text style={[styles.errorSubtitle, isDarkMode && styles.darkSubtitle]}>
        An error occurred in the app
      </Text>
      <ScrollView style={styles.errorLogContainer}>
        <Text style={[styles.errorLog, isDarkMode && styles.darkSubtitle]}>
          {error ? error.toString() : 'Unknown error'}
        </Text>
        {errorInfo && errorInfo.componentStack && (
          <Text style={[styles.errorLog, isDarkMode && styles.darkSubtitle]}>
            {'\n'}{errorInfo.componentStack}
          </Text>
        )}
      </ScrollView>
      <Text style={[styles.info, isDarkMode && styles.darkSubtitle]}>
        Please screenshot this and report the issue.
      </Text>
    </View>
  );
}

function AppContent() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState('');
  const isDarkMode = useColorScheme() === 'dark';
  const safeAreaInsets = useSafeAreaInsets();

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setIsLoaded(true);
      setDeviceInfo(`
Platform: ${Platform.OS} ${Platform.Version}
Dimensions: ${Dimensions.get('window').width}x${Dimensions.get('window').height}
Safe Area: top=${safeAreaInsets.top}, bottom=${safeAreaInsets.bottom}
      `);
    }, 1000);
  }, []);

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <Text style={[styles.title, isDarkMode && styles.darkText]}>
        BGist
      </Text>
      <Text style={[styles.subtitle, isDarkMode && styles.darkSubtitle]}>
        A beautiful GitHub Gist client
      </Text>
      
      {!isLoaded ? (
        <Text style={[styles.loading, isDarkMode && styles.darkSubtitle]}>
          Loading...
        </Text>
      ) : (
        <>
          <Text style={[styles.success, {color: '#1a7f37'}]}>
            ✅ App loaded successfully!
          </Text>
          <Text style={[styles.deviceInfo, isDarkMode && styles.darkSubtitle]}>
            {deviceInfo}
          </Text>
          
          <TouchableOpacity
            style={styles.testButton}
            onPress={() => {
              Alert.alert('Success!', 'React Native is working correctly on your device.');
            }}>
            <Text style={styles.testButtonText}>Test Alert</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {
              setDeviceInfo(prev => prev + '\n\nButton pressed at: ' + new Date().toISOString());
            }}>
            <Text style={[styles.secondaryButtonText, isDarkMode && styles.darkSubtitle]}>
              Update Info
            </Text>
          </TouchableOpacity>
        </>
      )}
      
      <Text style={[styles.version, isDarkMode && styles.darkSubtitle]}>
        React Native 0.84.1 • Build 9
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    padding: 24,
  },
  darkContainer: {
    backgroundColor: '#0d1117',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1f2328',
    marginBottom: 8,
  },
  darkText: {
    color: '#e6edf3',
  },
  subtitle: {
    fontSize: 16,
    color: '#656d76',
    marginBottom: 24,
    textAlign: 'center',
  },
  darkSubtitle: {
    color: '#8b949e',
  },
  loading: {
    fontSize: 18,
    color: '#656d76',
    marginTop: 16,
  },
  success: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  deviceInfo: {
    fontSize: 12,
    fontFamily: Platform.select({ios: 'Menlo', android: 'monospace'}),
    color: '#656d76',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 18,
  },
  testButton: {
    backgroundColor: '#1f883d',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
    marginBottom: 12,
    minWidth: 150,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d0d7de',
    minWidth: 150,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#656d76',
    fontSize: 16,
    fontWeight: '500',
  },
  version: {
    fontSize: 12,
    color: '#8c959f',
    marginTop: 32,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    padding: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#cf222e',
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 16,
    color: '#656d76',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorLogContainer: {
    width: '100%',
    maxHeight: 300,
    backgroundColor: '#f6f8fa',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
  },
  errorLog: {
    fontSize: 12,
    fontFamily: Platform.select({ios: 'Menlo', android: 'monospace'}),
    color: '#656d76',
    lineHeight: 18,
  },
  info: {
    fontSize: 14,
    color: '#656d76',
    textAlign: 'center',
  },
});

export default App;
