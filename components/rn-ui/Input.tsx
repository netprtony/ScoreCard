import React from 'react';
import {
  TextInput as RNTextInput,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps as RNTextInputProps,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { DesignSystem } from '../../constants/designSystem';
import { mergeStyles } from './utils';

interface InputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  disabled?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  inputStyle,
  disabled = false,
  ...props
}) => {
  const { theme, isDark } = useTheme();
  const colors = isDark ? DesignSystem.dark : DesignSystem.light;

  return (
    <View style={mergeStyles(styles.container, containerStyle)}>
      {label && (
        <Text style={mergeStyles(styles.label, { color: colors.foreground })}>
          {label}
        </Text>
      )}
      <RNTextInput
        style={mergeStyles(
          styles.input,
          {
            backgroundColor: colors.input,
            borderColor: error ? colors.destructive : colors.inputBorder,
            color: colors.foreground,
          },
          disabled && styles.disabled,
          inputStyle
        )}
        placeholderTextColor={colors.mutedForeground}
        editable={!disabled}
        {...props}
      />
      {error && (
        <Text style={mergeStyles(styles.error, { color: colors.destructive })}>
          {error}
        </Text>
      )}
    </View>
  );
};

interface TextAreaProps extends RNTextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  disabled?: boolean;
  rows?: number;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  containerStyle,
  inputStyle,
  disabled = false,
  rows = 4,
  ...props
}) => {
  const { theme, isDark } = useTheme();
  const colors = isDark ? DesignSystem.dark : DesignSystem.light;

  return (
    <View style={mergeStyles(styles.container, containerStyle)}>
      {label && (
        <Text style={mergeStyles(styles.label, { color: colors.foreground })}>
          {label}
        </Text>
      )}
      <RNTextInput
        style={mergeStyles(
          styles.input,
          styles.textarea,
          {
            backgroundColor: colors.input,
            borderColor: error ? colors.destructive : colors.inputBorder,
            color: colors.foreground,
            height: rows * 24,
          },
          disabled && styles.disabled,
          inputStyle
        )}
        placeholderTextColor={colors.mutedForeground}
        editable={!disabled}
        multiline
        numberOfLines={rows}
        textAlignVertical="top"
        {...props}
      />
      {error && (
        <Text style={mergeStyles(styles.error, { color: colors.destructive })}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: DesignSystem.spacing.sm,
  },
  label: {
    fontSize: DesignSystem.typography.fontSizes.sm,
    fontWeight: DesignSystem.typography.fontWeights.medium,
  },
  input: {
    height: DesignSystem.components.input.height,
    paddingHorizontal: DesignSystem.components.input.paddingHorizontal,
    borderRadius: DesignSystem.radius.md,
    borderWidth: 1,
    fontSize: DesignSystem.typography.fontSizes.base,
  },
  textarea: {
    paddingTop: DesignSystem.spacing.md,
    paddingBottom: DesignSystem.spacing.md,
  },
  disabled: {
    opacity: 0.5,
  },
  error: {
    fontSize: DesignSystem.typography.fontSizes.sm,
  },
});
