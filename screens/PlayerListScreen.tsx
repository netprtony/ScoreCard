import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { PlayerCard } from '../components/PlayerCard';
import { Player } from '../types/models';
import {
  getAllPlayers,
  createPlayer,
  updatePlayer,
  deletePlayer,
  getPlayerCount,
} from '../services/playerService';
import i18n from '../utils/i18n';

export const PlayerListScreen: React.FC = () => {
  const { theme } = useTheme();
  const [players, setPlayers] = useState<Player[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadPlayers();
    }, [])
  );

  const loadPlayers = async () => {
    try {
      const data = await getAllPlayers();
      setPlayers(data);
    } catch (error) {
      console.error('Error loading players:', error);
    }
  };

  const handleAddPlayer = async () => {
    if (!playerName.trim()) {
      Alert.alert('Lỗi', i18n.t('errorPlayerName'));
      return;
    }

    const count = await getPlayerCount();
    if (count >= 10) {
      Alert.alert('Lỗi', i18n.t('maxPlayers'));
      return;
    }

    setLoading(true);
    try {
      await createPlayer(playerName.trim());
      setPlayerName('');
      setShowAddModal(false);
      await loadPlayers();
    } catch (error) {
      console.error('Error adding player:', error);
      Alert.alert('Lỗi', 'Không thể thêm người chơi');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPlayer = async () => {
    if (!playerName.trim() || !editingPlayer) {
      Alert.alert('Lỗi', i18n.t('errorPlayerName'));
      return;
    }

    setLoading(true);
    try {
      await updatePlayer(editingPlayer.id, playerName.trim());
      setPlayerName('');
      setEditingPlayer(null);
      setShowEditModal(false);
      await loadPlayers();
    } catch (error) {
      console.error('Error updating player:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật người chơi');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlayer = (player: Player) => {
    Alert.alert(
      i18n.t('deletePlayer'),
      `${i18n.t('confirmDelete')} "${player.name}"?`,
      [
        { text: i18n.t('cancel'), style: 'cancel' },
        {
          text: i18n.t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePlayer(player.id);
              await loadPlayers();
            } catch (error) {
              console.error('Error deleting player:', error);
              Alert.alert('Lỗi', 'Không thể xóa người chơi');
            }
          },
        },
      ]
    );
  };

  const openEditModal = (player: Player) => {
    setEditingPlayer(player);
    setPlayerName(player.name);
    setShowEditModal(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>
          {i18n.t('playerList')}
        </Text>
        <Text style={[styles.count, { color: theme.textSecondary }]}>
          {players.length}/10 {i18n.t('players').toLowerCase()}
        </Text>
      </View>

      <FlatList
        data={players}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PlayerCard
            player={item}
            onEdit={() => openEditModal(item)}
            onDelete={() => handleDeletePlayer(item)}
            showActions
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color={theme.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Chưa có người chơi nào
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
              Nhấn nút + để thêm người chơi
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => setShowAddModal(true)}
      >
        <Ionicons name="add" size={32} color="#FFF" />
      </TouchableOpacity>

      {/* Add Player Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {i18n.t('addPlayer')}
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.surface,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              placeholder={i18n.t('playerName')}
              placeholderTextColor={theme.placeholder}
              value={playerName}
              onChangeText={setPlayerName}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.surface }]}
                onPress={() => {
                  setPlayerName('');
                  setShowAddModal(false);
                }}
              >
                <Text style={[styles.buttonText, { color: theme.text }]}>
                  {i18n.t('cancel')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.primary }]}
                onPress={handleAddPlayer}
                disabled={loading}
              >
                <Text style={[styles.buttonText, { color: '#FFF' }]}>
                  {i18n.t('save')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Player Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {i18n.t('editPlayer')}
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.surface,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              placeholder={i18n.t('playerName')}
              placeholderTextColor={theme.placeholder}
              value={playerName}
              onChangeText={setPlayerName}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.surface }]}
                onPress={() => {
                  setPlayerName('');
                  setEditingPlayer(null);
                  setShowEditModal(false);
                }}
              >
                <Text style={[styles.buttonText, { color: theme.text }]}>
                  {i18n.t('cancel')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.primary }]}
                onPress={handleEditPlayer}
                disabled={loading}
              >
                <Text style={[styles.buttonText, { color: '#FFF' }]}>
                  {i18n.t('save')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  count: {
    fontSize: 14,
  },
  list: {
    padding: 20,
    paddingTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
