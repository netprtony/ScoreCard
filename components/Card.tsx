import React, { ReactNode, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  ViewStyle,
  Modal,
  Pressable,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../contexts/ThemeContext';
import { LongPressGestureHandler, State } from 'react-native-gesture-handler';
import { Animated } from 'react-native';

import { GlassContainer } from './GlassContainer';

/* =========================
   TYPES
========================= */
export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: string; // Ionicons name
  destructive?: boolean;
  disabled?: boolean;
}

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  selected?: boolean;
  accentColor?: string;
  style?: ViewStyle;
  blurIntensity?: number;
  contextMenuItems?: ContextMenuItem[];
  onContextMenuPress?: (itemId: string) => void;
  contextMenuPosition?: 'top' | 'bottom' | 'auto';
}

interface PlayerCardProps {
  player: {
    name: string;
    avatar?: string;
    color?: string;
  };
  onEdit?: () => void;
  onDelete?: () => void;
  onPress?: () => void;
  selected?: boolean;
  showActions?: boolean;
  blurIntensity?: number;
}

/* =========================
   CARD – LIQUID GLASS
========================= */
export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  selected = false,
  accentColor,
  style,
  blurIntensity,
  contextMenuItems,
  onContextMenuPress,
  contextMenuPosition = 'auto',
}) => {
  const { theme, isDark } = useTheme();
  const baseColor = accentColor || theme.primary;
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<View>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const hasContextMenu = contextMenuItems && contextMenuItems.length > 0;

  const handleLongPress = (event: any) => {
    if (!hasContextMenu) return;

    // Measure card position
    cardRef.current?.measure((x, y, width, height, pageX, pageY) => {
      const screenHeight = Dimensions.get('window').height;
      let posY = pageY;

      // Auto-position logic
      if (contextMenuPosition === 'auto') {
        const spaceBelow = screenHeight - (pageY + height);
        const menuHeight = contextMenuItems.length * 56 + 16; // Approximate
        if (spaceBelow < menuHeight && pageY > menuHeight) {
          posY = pageY - menuHeight - 8;
        } else {
          posY = pageY + height + 8;
        }
      } else if (contextMenuPosition === 'top') {
        posY = pageY - (contextMenuItems.length * 56 + 16) - 8;
      } else {
        posY = pageY + height + 8;
      }

      setMenuPosition({ x: pageX, y: posY });
      setMenuVisible(true);
    });

    // Haptic feedback (iOS)
    if (Platform.OS === 'ios') {
      // Note: You may want to add expo-haptics for this
      // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const onGestureEvent = (event: any) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    } else if (event.nativeEvent.state === State.BEGAN) {
      // Long press started
    } else if (event.nativeEvent.state === State.END) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
      if (event.nativeEvent.duration >= 500) {
        handleLongPress(event);
      }
    } else {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleMenuDismiss = () => {
    setMenuVisible(false);
  };

  const handleMenuItemPress = (itemId: string) => {
    setMenuVisible(false);
    onContextMenuPress?.(itemId);
  };

  const Wrapper = onPress ? TouchableOpacity : View;
  const CardContent = (
    <Wrapper
      activeOpacity={0.75}
      onPress={onPress}
      style={[styles.wrapper, style]}
    >
      {/* ===== GLASS BORDER ===== */}
      <LinearGradient
        colors={
          selected
            ? [baseColor + 'AA', baseColor + '44', baseColor + 'AA']
            : isDark
            ? [
                'rgba(255,255,255,0.2)',
                'rgba(255,255,255,0.05)',
                'rgba(255,255,255,0.2)',
              ]
            : [
                'rgba(255,255,255,0.8)',
                'rgba(255,255,255,0.3)',
                'rgba(255,255,255,0.8)',
              ]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.border}
      >
        {/* ===== GLASS BODY USING GlassContainer ===== */}
        <GlassContainer
          intensity={blurIntensity ?? (selected ? 80 : 60)}
          isDark={isDark}
          style={styles.glass}
        >
          {/* Shimmer Highlight Overlay */}
          <LinearGradient
            colors={[
              'rgba(255,255,255,0)',
              isDark
                ? 'rgba(255,255,255,0.06)'
                : 'rgba(255,255,255,0.4)',
              'rgba(255,255,255,0)',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.shimmer}
          />

          {/* CONTENT */}
          <View style={styles.content}>{children}</View>
        </GlassContainer>
      </LinearGradient>
    </Wrapper>
  );

  if (!hasContextMenu) {
    return CardContent;
  }

  return (
    <>
      <LongPressGestureHandler
        onHandlerStateChange={onGestureEvent}
        minDurationMs={500}
      >
        <Animated.View ref={cardRef} style={{ transform: [{ scale: scaleAnim }] }}>
          {CardContent}
        </Animated.View>
      </LongPressGestureHandler>

      <ContextMenu
        visible={menuVisible}
        items={contextMenuItems}
        position={menuPosition}
        onDismiss={handleMenuDismiss}
        onItemPress={handleMenuItemPress}
        isDark={isDark}
        theme={theme}
      />
    </>
  );
};

/* =========================
   PLAYER CARD
========================= */
export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  onEdit,
  onDelete,
  onPress,
  selected = false,
  showActions = true,
  blurIntensity,
}) => {
  const { theme } = useTheme();
  const color = player.color || theme.primary;

  return (
    <Card onPress={onPress} selected={selected} accentColor={color} blurIntensity={blurIntensity}>
      <View style={styles.playerRow}>
        {/* Avatar */}
        <LinearGradient
          colors={[color + 'EE', color + 'BB']}
          style={styles.avatar}
        >
          {player.avatar ? (
            <Image source={{ uri: player.avatar }} style={styles.avatarImg} />
          ) : (
            <Text style={styles.avatarText}>
              {player.name[0].toUpperCase()}
            </Text>
          )}
        </LinearGradient>

        {/* Info */}
        <View style={styles.info}>
          <Text
            style={[
              styles.name,
              { color: theme.text, fontWeight: selected ? '700' : '600' },
            ]}
            numberOfLines={1}
          >
            {player.name}
          </Text>

          <LinearGradient
            colors={[color + '00', color + 'AA', color + '00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.accentLine}
          />
        </View>

        {/* Actions */}
        {showActions && (
          <View style={styles.actions}>
            {onEdit && (
              <GlassIcon
                icon="pencil"
                color={theme.primary}
                onPress={onEdit}
              />
            )}
            {onDelete && (
              <GlassIcon
                icon="trash"
                color={theme.error}
                onPress={onDelete}
              />
            )}
          </View>
        )}
      </View>
    </Card>
  );
};

/* =========================
   GLASS ICON
========================= */
const GlassIcon = ({
  icon,
  color,
  onPress,
}: {
  icon: any;
  color: string;
  onPress: () => void;
}) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
    <LinearGradient
      colors={[color + 'EE', color + 'AA']}
      style={styles.iconBtn}
    >
      <Ionicons name={icon} size={16} color="#FFF" />
    </LinearGradient>
  </TouchableOpacity>
);

/* =========================
   CONTEXT MENU
========================= */
interface ContextMenuProps {
  visible: boolean;
  items: ContextMenuItem[];
  position: { x: number; y: number };
  onDismiss: () => void;
  onItemPress: (itemId: string) => void;
  isDark: boolean;
  theme: any;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  visible,
  items,
  position,
  onDismiss,
  onItemPress,
  isDark,
  theme,
}) => {
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const translateYAnim = useRef(new Animated.Value(-4)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.spring(translateYAnim, {
          toValue: 0,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.85,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: -4,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      {/* Backdrop with blur and dimming */}
      <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss}>
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: opacityAnim }]}>
          {Platform.OS === 'ios' ? (
            <BlurView
              intensity={35}
              tint={isDark ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />
          ) : null}
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: 'rgba(0,0,0,0.3)' },
            ]}
          />
        </Animated.View>
      </Pressable>

      {/* Context Menu */}
      <Animated.View
        style={[
          menuStyles.menuContainer,
          {
            top: position.y,
            left: 16,
            right: 16,
            opacity: opacityAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: translateYAnim },
            ],
          },
        ]}
      >
        <GlassContainer
          intensity={98}
          isDark={isDark}
          vibrancy={true}
          vibrancyStrength="high"
          materialType="regular"
          style={menuStyles.menu}
        >
          {items.map((item, index) => (
            <React.Fragment key={item.id}>
              <TouchableOpacity
                style={[
                  menuStyles.menuItem,
                  item.disabled && menuStyles.menuItemDisabled,
                ]}
                onPress={() => !item.disabled && onItemPress(item.id)}
                activeOpacity={0.6}
                disabled={item.disabled}
              >
                {item.icon && (
                  <Ionicons
                    name={item.icon as any}
                    size={24}
                    color={
                      item.disabled
                        ? isDark
                          ? 'rgba(255,255,255,0.3)'
                          : 'rgba(0,0,0,0.3)'
                        : item.destructive
                        ? '#FF3B30'
                        : isDark
                        ? '#FFFFFF'
                        : '#000000'
                    }
                    style={menuStyles.menuIcon}
                  />
                )}
                <Text
                  style={[
                    menuStyles.menuLabel,
                    {
                      color: item.disabled
                        ? isDark
                          ? 'rgba(255,255,255,0.4)'
                          : 'rgba(0,0,0,0.4)'
                        : item.destructive
                        ? '#FF3B30'
                        : isDark
                        ? '#FFFFFF'
                        : '#000000',
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
              {index < items.length - 1 && (
                <View
                  style={[
                    menuStyles.separator,
                    {
                      backgroundColor: isDark
                        ? 'rgba(255,255,255,0.15)'
                        : 'rgba(0,0,0,0.1)',
                    },
                  ]}
                />
              )}
            </React.Fragment>
          ))}
        </GlassContainer>
      </Animated.View>
    </Modal>
  );
};

/* =========================
   STYLES
========================= */
const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 14 },
    elevation: 10,
  },

  border: {
    borderRadius: 22,
    padding: 1.2,
  },

  glass: {
    borderRadius: 20.5,
    overflow: 'hidden',
  },

  shimmer: {
    ...StyleSheet.absoluteFillObject,
  },

  content: {
    padding: 12,
  },

  /* Player */
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarImg: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },

  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
  },

  info: {
    flex: 1,
    gap: 6,
  },

  name: {
    fontSize: 17,
    letterSpacing: 0.3,
  },

  accentLine: {
    height: 2,
    borderRadius: 1,
  },

  actions: {
    flexDirection: 'row',
    gap: 10,
  },

  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

/* =========================
   MENU STYLES
========================= */
const menuStyles = StyleSheet.create({
  menuContainer: {
    position: 'absolute',
    zIndex: 1000,
  },
  menu: {
    borderRadius: 18,
    overflow: 'hidden',
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 56,
  },
  menuItemDisabled: {
    opacity: 0.5,
  },
  menuIcon: {
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 17,
    fontWeight: '400',
    letterSpacing: -0.4,
  },
  separator: {
    height: 0.5,
    marginHorizontal: 16,
  },
});
