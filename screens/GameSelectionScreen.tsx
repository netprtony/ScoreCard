import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { GameType } from '../types/models';
import { MatchStackParamList } from '../types/navigation';
import { getAllGameTypes } from '../services/gameTypeService';
import i18n from '../utils/i18n';

type GameSelectionNavigationProp = NativeStackNavigationProp<MatchStackParamList, 'GameSelection'>;

export const GameSelectionScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<GameSelectionNavigationProp>();
  const [gameTypes, setGameTypes] = useState<GameType[]>([]);

  useEffect(() => {
    loadGameTypes();
  }, []);

  const loadGameTypes = () => {
    try {
      const types = getAllGameTypes();
      setGameTypes(types);
    } catch (error) {
      console.error('Error loading game types:', error);
    }
  };

  const handleSelectGame = (gameType: GameType) => {
    if (!gameType.isActive) {
      return; // Don't allow selection of inactive games
    }
    // Navigate to player selection with game type
    navigation.navigate('PlayerSelection', { gameType });
  };

  const renderGameCard = ({ item }: { item: GameType }) => (
    <TouchableOpacity
      style={[
        styles.gameCard,
        {
          backgroundColor: theme.card,
          borderColor: item.isActive ? theme.primary : theme.border,
          opacity: item.isActive ? 1 : 0.6,
        },
      ]}
      onPress={() => handleSelectGame(item)}
      disabled={!item.isActive}
    >
      <View style={styles.gameIconContainer}>
        <Text style={styles.gameIcon}>{item.icon}</Text>
      </View>

      <View style={styles.gameInfo}>
        <Text style={[styles.gameName, { color: theme.text }]}>
          {item.name}
        </Text>
        <Text style={[styles.gameDescription, { color: theme.textSecondary }]}>
          {item.description}
        </Text>
      </View>

      {item.isActive ? (
        <Ionicons name="chevron-forward" size={24} color={theme.primary} />
      ) : (
        <View style={[styles.comingSoonBadge, { backgroundColor: theme.warning + '20' }]}>
          <Text style={[styles.comingSoonText, { color: theme.warning }]}>
            Sắp ra mắt
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>
          Chọn Trò Chơi
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Chọn loại game bạn muốn chơi
        </Text>
      </View>

      <FlatList
        data={gameTypes}
        keyExtractor={(item) => item.id}
        renderItem={renderGameCard}
        contentContainerStyle={styles.list}
      />
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
  subtitle: {
    fontSize: 14,
  },
  list: {
    padding: 20,
    paddingTop: 8,
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 16,
  },
  gameIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  gameIcon: {
    fontSize: 36,
  },
  gameInfo: {
    flex: 1,
  },
  gameName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  gameDescription: {
    fontSize: 14,
  },
  comingSoonBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  comingSoonText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
