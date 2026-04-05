/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {
  Text,
  View,
  StyleSheet,
  useColorScheme,
  ScrollView,
  TouchableOpacity,
  Clipboard,
  Alert,
} from 'react-native';
import {NewAppScreen} from '@react-native/new-app-screen';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <Text style={[styles.title, isDarkMode && styles.darkText]}>
        BGist
      </Text>
      <Text style={[styles.subtitle, isDarkMode && styles.darkSubtitle]}>
        A beautiful GitHub Gist client
      </Text>
      <Text style={[styles.info, isDarkMode && styles.darkSubtitle]}>
        If you can see this, the app is working!
      </Text>
      <TouchableOpacity
        style={styles.testButton}
        onPress={() => {
          Alert.alert('Test', 'Button pressed successfully!');
        }}>
        <Text style={styles.testButtonText}>Test Button</Text>
      </TouchableOpacity>
      <Text style={[styles.version, isDarkMode && styles.darkSubtitle]}>
        React Native 0.84.1
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
    marginBottom: 16,
  },
  darkSubtitle: {
    color: '#8b949e',
  },
  info: {
    fontSize: 14,
    color: '#656d76',
    marginBottom: 24,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  testButton: {
    backgroundColor: '#1f883d',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  testButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    fontSize: 12,
    color: '#8c959f',
    marginTop: 16,
  },
});

export default App;
