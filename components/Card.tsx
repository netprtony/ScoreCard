import React, { ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../contexts/ThemeContext';

import { GlassContainer } from './GlassContainer';

/* =========================
   TYPES
========================= */
interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  selected?: boolean;
  accentColor?: string;
  style?: ViewStyle;
  blurIntensity?: number;
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
}) => {
  const { theme, isDark } = useTheme();
  const baseColor = accentColor || theme.primary;

  const Wrapper = onPress ? TouchableOpacity : View;

  return (
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
            : [
                'rgba(255,255,255,0.6)',
                'rgba(255,255,255,0.15)',
                'rgba(255,255,255,0.6)',
              ]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.border}
      >
        {/* ===== GLASS BODY USING GlassContainer ===== */}
        <GlassContainer
          intensity={blurIntensity ?? (selected ? 85 : 70)}
          isDark={isDark}
          style={styles.glass}
        >
          {/* Shimmer Highlight Overlay */}
          <LinearGradient
            colors={[
              'rgba(255,255,255,0)',
              isDark
                ? 'rgba(255,255,255,0.08)'
                : 'rgba(255,255,255,0.45)',
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
}) => {
  const { theme } = useTheme();
  const color = player.color || theme.primary;

  return (
    <Card onPress={onPress} selected={selected} accentColor={color}>
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
