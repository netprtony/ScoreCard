import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { PlayerCard } from '../components/Card';
import { Player, GameType } from '../types/models';
import { MatchStackParamList } from '../types/navigation';
import { getAllPlayers } from '../services/playerService';
import i18n from '../utils/i18n';
import { showWarning } from '../utils/toast';
import { Badge } from '../components/rn-ui';
import { Card } from '../components/Card';
import { WallpaperBackground } from '../components/WallpaperBackground';
import { useNavigationVisibility } from '../contexts/NavigationContext';
type PlayerSelectionNavigationProp = NativeStackNavigationProp<MatchStackParamList, 'PlayerSelection'>;

export const PlayerSelectionScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<PlayerSelectionNavigationProp>();
  const route = useRoute();
  const gameType = (route.params as any)?.gameType as GameType;
  const { setTabBarVisible } = useNavigationVisibility();

  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);

  // Hide tab bar when entering match creation flow
  useEffect(() => {
    setTabBarVisible(false);
  }, [setTabBarVisible]);

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
      const maxPlayers = gameType?.id === 'sac_te' ? 5 : 4;
      if (selectedPlayers.length < maxPlayers) {
        setSelectedPlayers([...selectedPlayers, player]);
      } else {
        showWarning('Lỗi', `Chỉ được chọn tối đa ${maxPlayers} người chơi`);
      }
    }
  };

  const handleNext = () => {
    const minPlayers = gameType?.id === 'sac_te' ? 2 : 4;
    const maxPlayers = gameType?.id === 'sac_te' ? 5 : 4;
    
    if (selectedPlayers.length < minPlayers || selectedPlayers.length > maxPlayers) {
      if (minPlayers === maxPlayers) {
        showWarning('Lỗi', `Vui lòng chọn đúng ${minPlayers} người chơi`);
      } else {
        showWarning('Lỗi', `Vui lòng chọn ${minPlayers}-${maxPlayers} người chơi`);
      }
      return;
    }

    // Route to appropriate config screen based on game type
    if (gameType?.id === 'sac_te') {
      navigation.navigate('SacTeConfigSetup', {
        gameType,
        playerIds: selectedPlayers.map(p => p.id)
      });
    } else {
      navigation.navigate('ConfigSetup', {
        gameType,
        playerIds: selectedPlayers.map(p => p.id)
      });
    }
  };

  return (
    <WallpaperBackground>
      <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={theme.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 16 }}>
          <Text style={[styles.title, { color: theme.text }]}>
            {gameType?.name || 'Chọn Người Chơi'}
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {gameType?.id === 'sac_te' ? 'Chọn 2-5 người chơi' : 'Chọn 4 người chơi'}
          </Text>
        </View>
      </View>

      <Card  style={{ marginHorizontal: 20, marginBottom: 12 }}>
        <View style={{ padding: 4 }}>
          <Text style={[styles.selectedTitle, { color: theme.text }]}>
            Đã chọn: {selectedPlayers.length}/{gameType?.id === 'sac_te' ? '2-5' : '4'}
          </Text>
          <View style={styles.selectedPlayers}>
            {selectedPlayers.map((player) => (
              <Badge key={player.id} variant="default">
                {player.name}
              </Badge>
            ))}
          </View>
        </View>
      </Card>

      <ScrollView 
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={true}
      >
        {players.map(player => (
          <PlayerCard
            key={player.id}
            player={player}
            selected={!!selectedPlayers.find(p => p.id === player.id)}
            onPress={() => togglePlayerSelection(player)}
            showActions={false}
          />
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.fab,
          {
            backgroundColor: (() => {
              const minPlayers = gameType?.id === 'sac_te' ? 2 : 4;
              const maxPlayers = gameType?.id === 'sac_te' ? 5 : 4;
              const isValid = selectedPlayers.length >= minPlayers && selectedPlayers.length <= maxPlayers;
              return isValid ? theme.primary : theme.disabled;
            })(),
          },
        ]}
        onPress={handleNext}
        disabled={(() => {
          const minPlayers = gameType?.id === 'sac_te' ? 2 : 4;
          const maxPlayers = gameType?.id === 'sac_te' ? 5 : 4;
          return selectedPlayers.length < minPlayers || selectedPlayers.length > maxPlayers;
        })()}
      >
        <Ionicons name="arrow-forward" size={24} color="#FFF" />
      </TouchableOpacity>
      </SafeAreaView>
    </WallpaperBackground>
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
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  listContent: {
    paddingBottom: 80,
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
