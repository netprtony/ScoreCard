import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle, ImageSourcePropType } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { DesignSystem } from '../../constants/designSystem';
import { mergeStyles } from './utils';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  source?: ImageSourcePropType | { uri: string };
  fallback?: string;
  size?: AvatarSize;
  backgroundColor?: string;
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  fallback,
  size = 'md',
  backgroundColor,
  style,
}) => {
  const { theme, isDark } = useTheme();
  const colors = isDark ? DesignSystem.dark : DesignSystem.light;

  const getSizeStyles = () => {
    const sizes = {
      sm: { width: 32, height: 32, fontSize: 14 },
      md: { width: 40, height: 40, fontSize: 16 },
      lg: { width: 56, height: 56, fontSize: 22 },
      xl: { width: 80, height: 80, fontSize: 32 },
    };
    return sizes[size];
  };

  const sizeStyles = getSizeStyles();

  return (
    <View
      style={mergeStyles(
        styles.container,
        {
          width: sizeStyles.width,
          height: sizeStyles.height,
          backgroundColor: backgroundColor || colors.muted,
        },
        style
      )}
    >
      {source ? (
        <Image
          source={source}
          style={{
            width: sizeStyles.width,
            height: sizeStyles.height,
            borderRadius: sizeStyles.width / 2,
          }}
        />
      ) : (
        <Text
          style={mergeStyles(styles.fallback, {
            fontSize: sizeStyles.fontSize,
            color: colors.mutedForeground,
          })}
        >
          {fallback || '?'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: DesignSystem.radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  fallback: {
    fontWeight: DesignSystem.typography.fontWeights.semibold,
  },
});
