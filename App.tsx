import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import FlashMessage from 'react-native-flash-message';
import { useFonts } from 'expo-font';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { MatchProvider } from './contexts/MatchContext';
import { AppNavigator } from './navigation/AppNavigator';
import { initDatabase } from './services/database';

const AppContent: React.FC = () => {
  const { theme, isDark } = useTheme();
  const [isReady, setIsReady] = useState(false);

  // Load custom fonts
  const [fontsLoaded] = useFonts({
    'RobotoSlab': require('./assets/fonts/RobotoSlab-VariableFont_wght.ttf'),
    'RobotoSlab-Thin': require('./assets/fonts/static/RobotoSlab-Thin.ttf'),
    'RobotoSlab-ExtraLight': require('./assets/fonts/static/RobotoSlab-ExtraLight.ttf'),
    'RobotoSlab-Light': require('./assets/fonts/static/RobotoSlab-Light.ttf'),
    'RobotoSlab-Regular': require('./assets/fonts/static/RobotoSlab-Regular.ttf'),
    'RobotoSlab-Medium': require('./assets/fonts/static/RobotoSlab-Medium.ttf'),
    'RobotoSlab-SemiBold': require('./assets/fonts/static/RobotoSlab-SemiBold.ttf'),
    'RobotoSlab-Bold': require('./assets/fonts/static/RobotoSlab-Bold.ttf'),
    'RobotoSlab-ExtraBold': require('./assets/fonts/static/RobotoSlab-ExtraBold.ttf'),
    'RobotoSlab-Black': require('./assets/fonts/static/RobotoSlab-Black.ttf'),
  });

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

  if (!fontsLoaded || !isReady) {
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
      <FlashMessage position="top" />
    </>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <MatchProvider>
          <AppContent />
        </MatchProvider>
      </LanguageProvider>
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
