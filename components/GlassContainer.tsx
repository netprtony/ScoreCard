import React from 'react';
import { BlurView } from 'expo-blur';
import { View, StyleSheet, Platform } from 'react-native';

export const GlassContainer: React.FC<{
  children: React.ReactNode;
  intensity?: number;
  isDark?: boolean;
  style?: any;
  vibrancy?: boolean;
  vibrancyStrength?: 'low' | 'medium' | 'high';
  materialType?: 'thin' | 'regular' | 'thick' | 'chrome';
}> = ({ 
  children, 
  intensity = 40, 
  isDark = false, 
  style,
  vibrancy = false,
  vibrancyStrength = 'medium',
  materialType = 'regular',
}) => {
  // Tính toán opacity dựa trên intensity (0-100)
  // Intensity càng cao, background càng mờ (opacity thấp hơn)
  const calculateOpacity = (int: number) => {
    // intensity 0 = opacity 0.95 (gần như không trong suốt)
    // intensity 100 = opacity 0.5 (rất trong suốt)
    return Math.max(0.5, Math.min(0.95, 0.95 - (int / 100) * 0.45));
  };

  const opacity = calculateOpacity(intensity);

  // Map material type to iOS tint
  const getMaterialTint = (): 'systemThinMaterial' | 'systemMaterial' | 'systemThickMaterial' | 'systemChromeMaterial' | 'light' | 'dark' => {
    if (Platform.OS !== 'ios') {
      return isDark ? 'dark' : 'light';
    }
    
    switch (materialType) {
      case 'thin':
        return 'systemThinMaterial';
      case 'thick':
        return 'systemThickMaterial';
      case 'chrome':
        return 'systemChromeMaterial';
      default:
        return 'systemMaterial';
    }
  };

  // Calculate vibrancy overlay opacity based on strength
  const getVibrancyOpacity = () => {
    if (!vibrancy) return 0;
    
    const baseOpacity = isDark ? 0.08 : 0.05;
    switch (vibrancyStrength) {
      case 'low':
        return baseOpacity * 0.5;
      case 'high':
        return baseOpacity * 1.5;
      default:
        return baseOpacity;
    }
  };

  return (
    <View style={[styles.wrapper, style]}>
      {Platform.OS === 'ios' ? (
        <>
          {/* iOS: Native BlurView with material type */}
          <BlurView
            intensity={intensity}
            tint={getMaterialTint()}
            style={StyleSheet.absoluteFill}
          />
          
          {/* Additional color layer for depth */}
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: isDark
                  ? `rgba(30, 30, 35, ${0.3 + (intensity / 100) * 0.2})`
                  : `rgba(255, 255, 255, ${0.2 + (intensity / 100) * 0.3})`,
              },
            ]}
          />

          {/* Vibrancy overlay for text/icon contrast */}
          {vibrancy && (
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: isDark
                    ? `rgba(255, 255, 255, ${getVibrancyOpacity()})`
                    : `rgba(0, 0, 0, ${getVibrancyOpacity()})`,
                },
              ]}
            />
          )}

          {/* Subtle border for iOS native feel */}
          <View
            style={[
              styles.border,
              {
                borderColor: isDark
                  ? 'rgba(255, 255, 255, 0.15)'
                  : 'rgba(255, 255, 255, 0.3)',
              },
            ]}
          />
        </>
      ) : (
        <>
          {/* Android: Fallback with background blur */}
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: isDark
                  ? `rgba(30, 30, 35, ${opacity})`
                  : `rgba(255, 255, 255, ${opacity})`,
              },
            ]}
          />
          
          {/* Texture overlay for Android */}
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: isDark
                  ? 'rgba(255, 255, 255, 0.02)'
                  : 'rgba(0, 0, 0, 0.03)',
              },
            ]}
          />

          {/* Vibrancy for Android */}
          {vibrancy && (
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: isDark
                    ? `rgba(255, 255, 255, ${getVibrancyOpacity()})`
                    : `rgba(0, 0, 0, ${getVibrancyOpacity()})`,
                },
              ]}
            />
          )}
        </>
      )}

      {/* Shimmer overlay */}
      <View
        style={[
          styles.overlay,
          {
            backgroundColor: isDark
              ? 'rgba(255, 255, 255, 0.04)'
              : 'rgba(255, 255, 255, 0.25)',
          },
        ]}
      />

      {/* Content */}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    borderWidth: 0.5,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
});
