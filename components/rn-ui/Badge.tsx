import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { DesignSystem } from '../../constants/designSystem';
import { mergeStyles } from './utils';

export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  style,
  textStyle,
}) => {
  const { theme, isDark } = useTheme();
  const colors = isDark ? DesignSystem.dark : DesignSystem.light;

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'default':
        return {
          container: { backgroundColor: colors.primary },
          text: { color: colors.primaryForeground },
        };
      case 'secondary':
        return {
          container: { backgroundColor: colors.secondary },
          text: { color: colors.secondaryForeground },
        };
      case 'destructive':
        return {
          container: { backgroundColor: colors.destructive },
          text: { color: colors.destructiveForeground },
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: colors.border,
          },
          text: { color: colors.foreground },
        };
      case 'success':
        return {
          container: { backgroundColor: '#52B788' },
          text: { color: '#ffffff' },
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <View style={mergeStyles(styles.container, variantStyles.container, style)}>
      <Text style={mergeStyles(styles.text, variantStyles.text, textStyle)}>
        {children}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.xs,
    borderRadius: DesignSystem.radius.sm,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: DesignSystem.typography.fontSizes.xs,
    fontWeight: DesignSystem.typography.fontWeights.medium,
  },
});
