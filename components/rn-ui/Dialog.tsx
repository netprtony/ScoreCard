import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { DesignSystem } from '../../constants/designSystem';
import { mergeStyles } from './utils';

interface DialogProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const Dialog: React.FC<DialogProps> = ({
  visible,
  onClose,
  children,
  style,
}) => {
  const { theme, isDark } = useTheme();
  const colors = isDark ? DesignSystem.dark : DesignSystem.light;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View
          style={mergeStyles(
            styles.content,
            { backgroundColor: colors.card },
            DesignSystem.shadows.xl,
            style
          )}
        >
          {children}
        </View>
      </View>
    </Modal>
  );
};

interface DialogHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const DialogHeader: React.FC<DialogHeaderProps> = ({ children, style }) => {
  return <View style={mergeStyles(styles.header, style)}>{children}</View>;
};

interface DialogTitleProps {
  children: React.ReactNode;
}

export const DialogTitle: React.FC<DialogTitleProps> = ({ children }) => {
  const { theme, isDark } = useTheme();
  const colors = isDark ? DesignSystem.dark : DesignSystem.light;

  return (
    <Text style={mergeStyles(styles.title, { color: colors.foreground })}>
      {children}
    </Text>
  );
};

interface DialogDescriptionProps {
  children: React.ReactNode;
}

export const DialogDescription: React.FC<DialogDescriptionProps> = ({ children }) => {
  const { theme, isDark } = useTheme();
  const colors = isDark ? DesignSystem.dark : DesignSystem.light;

  return (
    <Text style={mergeStyles(styles.description, { color: colors.mutedForeground })}>
      {children}
    </Text>
  );
};

interface DialogContentProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
}

export const DialogContent: React.FC<DialogContentProps> = ({
  children,
  scrollable = false,
  style,
}) => {
  if (scrollable) {
    return (
      <ScrollView
        style={mergeStyles(styles.scrollContent, style)}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    );
  }

  return <View style={mergeStyles(styles.dialogContent, style)}>{children}</View>;
};

interface DialogFooterProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const DialogFooter: React.FC<DialogFooterProps> = ({ children, style }) => {
  return <View style={mergeStyles(styles.footer, style)}>{children}</View>;
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    width: '85%',
    maxWidth: 500,
    maxHeight: '85%',
    borderRadius: DesignSystem.radius['2xl'],
    overflow: 'hidden',
  },
  header: {
    padding: DesignSystem.spacing.lg,
    paddingBottom: DesignSystem.spacing.md,
    gap: DesignSystem.spacing.xs,
  },
  title: {
    fontSize: DesignSystem.typography.fontSizes.xl,
    fontWeight: DesignSystem.typography.fontWeights.semibold,
  },
  description: {
    fontSize: DesignSystem.typography.fontSizes.sm,
    lineHeight: DesignSystem.typography.fontSizes.sm * DesignSystem.typography.lineHeights.normal,
  },
  dialogContent: {
    padding: DesignSystem.spacing.lg,
  },
  scrollContent: {
    maxHeight: 400,
    padding: DesignSystem.spacing.lg,
  },
  footer: {
    padding: DesignSystem.spacing.lg,
    paddingTop: DesignSystem.spacing.md,
    flexDirection: 'row',
    gap: DesignSystem.spacing.md,
  },
});
