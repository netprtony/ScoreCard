import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { PlayerCard } from '../components/PlayerCard';
import { Player, GameType } from '../types/models';
import { getAllPlayers } from '../services/playerService';
import i18n from '../utils/i18n';

export const PlayerSelectionScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const gameType = (route.params as any)?.gameType as GameType;

  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = () => {
    try {
      const data = getAllPlayers();
      setPlayers(data);
    } catch (error) {
      console.error('Error loading players:', error);
    }
  };

  const togglePlayerSelection = (player: Player) => {
    if (selectedPlayers.find(p => p.id === player.id)) {
      setSelectedPlayers(selectedPlayers.filter(p => p.id !== player.id));
    } else {
      if (selectedPlayers.length < 4) {
        setSelectedPlayers([...selectedPlayers, player]);
      } else {
        Alert.alert('Lỗi', 'Chỉ được chọn tối đa 4 người chơi');
      }
    }
  };

  const handleNext = () => {
    if (selectedPlayers.length !== 4) {
      Alert.alert('Lỗi', 'Vui lòng chọn đúng 4 người chơi');
      return;
    }

    navigation.navigate('ConfigSetup' as never, {
      gameType,
      selectedPlayers
    } as never);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={theme.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 16 }}>
          <Text style={[styles.title, { color: theme.text }]}>
            {gameType?.name || 'Chọn Người Chơi'}
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Chọn 4 người chơi
          </Text>
        </View>
      </View>

      <View style={[styles.selectedContainer, { backgroundColor: theme.surface }]}>
        <Text style={[styles.selectedTitle, { color: theme.text }]}>
          Đã chọn: {selectedPlayers.length}/4
        </Text>
        <View style={styles.selectedPlayers}>
          {selectedPlayers.map((player) => (
            <View key={player.id} style={[styles.selectedChip, { backgroundColor: theme.primary }]}>
              <Text style={styles.selectedChipText}>{player.name}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.list}>
        {players.map(player => (
          <PlayerCard
            key={player.id}
            player={player}
            selected={!!selectedPlayers.find(p => p.id === player.id)}
            onPress={() => togglePlayerSelection(player)}
            showActions={false}
          />
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.fab,
          {
            backgroundColor: selectedPlayers.length === 4 ? theme.primary : theme.disabled,
          },
        ]}
        onPress={handleNext}
        disabled={selectedPlayers.length !== 4}
      >
        <Ionicons name="arrow-forward" size={24} color="#FFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  selectedContainer: {
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
  },
  selectedTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  selectedPlayers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  selectedChipText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    flex: 1,
    padding: 20,
    paddingTop: 8,
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
});
