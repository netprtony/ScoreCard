import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { MatchProvider } from './contexts/MatchContext';
import { AppNavigator } from './navigation/AppNavigator';
import { initDatabase } from './services/database';

const AppContent: React.FC = () => {
  const { theme, isDark } = useTheme();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      initDatabase();
      setIsReady(true);
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  };

  if (!isReady) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AppNavigator />
    </>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <MatchProvider>
        <AppContent />
      </MatchProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
