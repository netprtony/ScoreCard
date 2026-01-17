import React, { useRef, ReactNode } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';

// Create animated version of LinearGradient
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export type ButtonShape = 'pill' | 'circle' | 'rounded';
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'green';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label?: string;
  children?: ReactNode;
  icon?: ReactNode;
  onPress: () => void;
  shape?: ButtonShape;
  size?: ButtonSize;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

const SIZE_CONFIG = {
  sm: { height: 36, paddingH: 16, iconSize: 18, fontSize: 14, gap: 8, borderRadius: 12 },
  md: { height: 44, paddingH: 20, iconSize: 20, fontSize: 16, gap: 20, borderRadius: 14 },
  lg: { height: 52, paddingH: 24, iconSize: 24, fontSize: 18, gap: 12, borderRadius: 16 }
};

export const Button: React.FC<ButtonProps> = ({
  label,
  children,
  icon,
  onPress,
  shape = 'rounded',
  size = 'md',
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}) => {
  const { theme, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const scaleXAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const sizeConfig = SIZE_CONFIG[size];
  const isIconOnly = icon && !label;

  // Calculate border radius based on shape
  const getBorderRadius = (): number => {
    switch (shape) {
      case 'pill':
        return sizeConfig.height / 2;
      case 'circle':
        return 999;
      case 'rounded':
        return sizeConfig.borderRadius;
    }
  };

  // Calculate width for circle shape
  const getWidth = (): number | undefined => {
    if (shape === 'circle' || isIconOnly) {
      return sizeConfig.height; // Square/circle
    }
    return undefined; // Auto width
  };

  // Get variant colors
  const getVariantColors = (): {
    gradientColors?: readonly [string, string, ...string[]];
    backgroundColor?: string;
    textColor: string;
    borderColor?: string;
    usesGradient: boolean;
  } => {
    switch (variant) {
      case 'primary':
        return {
          gradientColors: ['#007AFF', '#0064DC'] as const,
          textColor: '#FFFFFF',
          usesGradient: true,
        };
      case 'secondary':
        return {
          backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(218, 218, 218, 0.9)',
          textColor: theme.text,
          borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(218, 218, 218, 0.9)',
          usesGradient: false,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          textColor: theme.text,
          usesGradient: false,
        };
      case 'green':
        return {
          backgroundColor: '#00ff15ff',
          textColor: '#000000',
          usesGradient: false,
        };
    }
  };

  const colors = getVariantColors();

  // Press animations
  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        useNativeDriver: true,
      }),
      Animated.spring(scaleXAnim, {
        toValue: 0.98,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.spring(scaleXAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const containerStyle: ViewStyle = {
    height: sizeConfig.height,
    width: getWidth(),
    paddingHorizontal: isIconOnly ? 0 : sizeConfig.paddingH,
    borderRadius: getBorderRadius(),
    backgroundColor: colors.usesGradient ? undefined : colors.backgroundColor,
    borderWidth: variant === 'secondary' ? 0.5 : 0,
    borderColor: colors.borderColor,
  };

  const textStyle: TextStyle = {
    color: colors.textColor,
    fontSize: sizeConfig.fontSize,
    fontWeight: '600',
    letterSpacing: size === 'sm' ? -0.2 : size === 'md' ? -0.3 : -0.4,
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size="small"
          color={colors.textColor}
        />
      );
    }

    // Use children if provided, otherwise use label
    const displayText = children || label;

    if (isIconOnly) {
      return <View style={styles.iconContainer}>{icon}</View>;
    }

    if (icon && displayText) {
      return (
        <View style={[styles.content, { gap: sizeConfig.gap }]}>
          <View style={styles.iconContainer}>{icon}</View>
          {typeof displayText === 'string' ? (
            <Text style={textStyle}>{displayText}</Text>
          ) : (
            displayText
          )}
        </View>
      );
    }

    return typeof displayText === 'string' ? (
      <Text style={textStyle}>{displayText}</Text>
    ) : (
      displayText
    );
  };

  const buttonContent = (
    <Animated.View
      style={[
        styles.container,
        containerStyle,
        {
          transform: [{ scale: scaleAnim }, { scaleX: scaleXAnim }],
          opacity: opacityAnim,
        },
        disabled && styles.disabled,
        style,
      ]}
    >
      {renderContent()}
    </Animated.View>
  );

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={({ pressed }) => [
        variant === 'primary' && !isDark && styles.shadow,
      ]}
    >
      {colors.usesGradient ? (
        <AnimatedLinearGradient
          colors={colors.gradientColors!}
          style={[
            styles.container,
            containerStyle,
            {
              transform: [{ scale: scaleAnim }, { scaleX: scaleXAnim }],
              opacity: opacityAnim,
            },
            disabled && styles.disabled,
            style,
          ]}
        >
          {renderContent()}
        </AnimatedLinearGradient>
      ) : (
        buttonContent
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  disabled: {
    opacity: 0.4,
  },
});
