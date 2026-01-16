import React from 'react';
import { BlurView } from 'expo-blur';
import { View, StyleSheet, Platform } from 'react-native';

export const GlassContainer: React.FC<{
  children: React.ReactNode;
  intensity?: number;
  isDark?: boolean;
  style?: any;
}> = ({ children, intensity = 40, isDark = false, style }) => {
  return (
    <View style={[styles.wrapper, style]}>
      {Platform.OS === 'ios' ? (
        <BlurView
          intensity={intensity}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: isDark ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)' }
          ]}
        />
      )}

      {/* Overlay để tạo hiệu ứng kính đặc trưng */}
      <View style={[
        styles.overlay,
        { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.2)' }
      ]} />

      {/* Content */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    position: 'relative',
  },
});
