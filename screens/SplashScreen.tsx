import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';

export const SplashScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();

  useEffect(() => {
    // Auto-navigate after 2 seconds
    const timer = setTimeout(() => {
      navigation.navigate('Welcome' as never);
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.primary }]}>
      <View style={styles.content}>
        {/* Logo placeholder - replace with actual logo if available */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>🎴</Text>
        </View>
        
        <Text style={styles.appName}>Koya Score</Text>
        
        <Text style={styles.tagline}>
          Tính điểm nhanh – Công bằng – Offline
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontSize: 64,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  tagline: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
  },
});
