import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Player } from '../types/models';

interface PlayerCardProps {
  player: Player;
  onEdit?: () => void;
  onDelete?: () => void;
  onPress?: () => void;
  selected?: boolean;
  showActions?: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  onEdit,
  onDelete,
  onPress,
  selected = false,
  showActions = true,
}) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: selected ? theme.primary + '20' : theme.card,
          borderColor: selected ? theme.primary : theme.border,
        },
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.content}>
        <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
          <Text style={styles.avatarText}>
            {player.name.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.info}>
          <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
            {player.name}
          </Text>
        </View>

        {showActions && (
          <View style={styles.actions}>
            {onEdit && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.primary }]}
                onPress={onEdit}
              >
                <Ionicons name="pencil" size={16} color="#FFF" />
              </TouchableOpacity>
            )}

            {onDelete && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.error }]}
                onPress={onDelete}
              >
                <Ionicons name="trash" size={16} color="#FFF" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {selected && (
          <Ionicons name="checkmark-circle" size={24} color={theme.primary} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
