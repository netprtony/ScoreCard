import React from 'react';
import {
  Switch as RNSwitch,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { DesignSystem } from '../../constants/designSystem';
import { mergeStyles } from './utils';

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
  containerStyle?: ViewStyle;
}

export const Switch: React.FC<SwitchProps> = ({
  value,
  onValueChange,
  label,
  disabled = false,
  containerStyle,
}) => {
  const { theme, isDark } = useTheme();
  const colors = isDark ? DesignSystem.dark : DesignSystem.light;

  const content = (
    <>
      {label && (
        <Text
          style={mergeStyles(
            styles.label,
            { color: colors.foreground },
            disabled && styles.disabledText
          )}
        >
          {label}
        </Text>
      )}
      <RNSwitch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{
          false: colors.muted,
          true: colors.primary,
        }}
        thumbColor="#ffffff"
        ios_backgroundColor={colors.muted}
      />
    </>
  );

  if (label) {
    return (
      <TouchableOpacity
        style={mergeStyles(styles.container, containerStyle)}
        onPress={() => !disabled && onValueChange(!value)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={containerStyle}>{content}</View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: DesignSystem.spacing.md,
  },
  label: {
    fontSize: DesignSystem.typography.fontSizes.base,
    fontWeight: DesignSystem.typography.fontWeights.medium,
    flex: 1,
  },
  disabledText: {
    opacity: 0.5,
  },
});
