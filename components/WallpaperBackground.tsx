import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useWallpaper } from '../contexts/WallpaperContext';
import { useTheme } from '../contexts/ThemeContext';

interface WallpaperBackgroundProps {
  children: ReactNode;
  style?: ViewStyle;
}

/**
 * WallpaperBackground component wraps screen content with the selected wallpaper.
 * Use this for all screens except onboarding screens (Splash, Welcome, TermsPrivacy).
 */
export const WallpaperBackground: React.FC<WallpaperBackgroundProps> = ({ children, style }) => {
  const { wallpaper } = useWallpaper();
  const { theme } = useTheme();

  // Default background (no wallpaper)
  if (wallpaper.type === 'default' || !wallpaper.source) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }, style]}>
        {children}
      </View>
    );
  }

  // Image wallpaper
  if (wallpaper.type === 'image') {
    const { ImageBackground } = require('react-native');
    return (
      <ImageBackground
        source={wallpaper.source}
        style={[styles.container, style]}
        resizeMode="cover"
      >
        {children}
      </ImageBackground>
    );
  }

  // Fallback
  return (
    <View style={[styles.container, { backgroundColor: theme.background }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
