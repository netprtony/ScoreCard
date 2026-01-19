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
import { useLanguage } from '../contexts/LanguageContext';
import { GameType } from '../types/models';
import { MatchStackParamList } from '../types/navigation';
import { getAllGameTypes } from '../services/gameTypeService';
import { Badge } from '../components/rn-ui';
import { Card } from '../components/Card';
import { WallpaperBackground } from '../components/WallpaperBackground';
import { useNavigationVisibility } from '../contexts/NavigationContext';

type GameSelectionNavigationProp = NativeStackNavigationProp<MatchStackParamList, 'GameSelection'>;

export const GameSelectionScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const navigation = useNavigation<GameSelectionNavigationProp>();
  const [gameTypes, setGameTypes] = useState<GameType[]>([]);
  const { setTabBarVisible } = useNavigationVisibility();

  // Hide tab bar when entering match creation flow
  useEffect(() => {
    setTabBarVisible(false);
  }, [setTabBarVisible]);

  // Show tab bar when leaving this screen (back navigation, including swipe gesture)
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // Only show tab bar if going back (not forward to PlayerSelection)
      if (e.data.action.type === 'GO_BACK' || e.data.action.type === 'POP') {
        setTabBarVisible(true);
      }
    });
    return unsubscribe;
  }, [navigation, setTabBarVisible]);

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

  // Handle back button - show tab bar again
  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleSelectGame = (gameType: GameType) => {
    if (!gameType.isActive) {
      return; // Don't allow selection of inactive games
    }
    // Navigate to player selection with game type
    navigation.navigate('PlayerSelection', { gameType });
  };

  const renderGameCard = ({ item }: { item: GameType }) => (
    <Card
      onPress={item.isActive ? () => handleSelectGame(item) : undefined}
      selected={false}
      accentColor={item.isActive ? theme.primary : theme.border}
      style={{ opacity: item.isActive ? 1 : 0.6 }}
    >
      <View style={styles.cardContent}>
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
          <Badge variant="outline" style={{ backgroundColor: theme.warning + '20' }}>
            {t('comingSoon')}
          </Badge>
        )}
      </View>
    </Card>
  );

  return (
    <WallpaperBackground>
      <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={{ marginRight: 16 }}>
          <Ionicons name="arrow-back" size={28} color={theme.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.text }]}>
            {t('selectGame')}
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {t('selectGameType')}
          </Text>
        </View>
      </View>

      <FlatList
        data={gameTypes}
        keyExtractor={(item) => item.id}
        renderItem={renderGameCard}
        contentContainerStyle={styles.list}
      />
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
    gap: 16,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
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
