import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useMatch } from '../contexts/MatchContext';
import { ScoreTable } from '../components/ScoreTable';
import { CountdownTimer } from '../components/CountdownTimer';
import i18n from '../utils/i18n';

export const ActiveMatchScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { activeMatch, endMatch } = useMatch();

  const handleAddRound = () => {
    // Navigate to round input screen
    navigation.navigate('RoundInput' as never);
  };

  const handleEditConfig = () => {
    Alert.alert(
      'Sửa Cấu Hình',
      'Tính năng sửa cấu hình trong lúc chơi sẽ được thêm sau',
      [{ text: 'OK' }]
    );
  };

  const handleEndMatch = () => {
    Alert.alert(
      i18n.t('endMatch'),
      'Bạn có chắc muốn kết thúc trận đấu?',
      [
        { text: i18n.t('cancel'), style: 'cancel' },
        {
          text: i18n.t('confirm'),
          style: 'destructive',
          onPress: () => {
            endMatch();
            navigation.navigate('Matches' as never);
          },
        },
      ]
    );
  };

  if (!activeMatch) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.emptyContainer}>
          <Ionicons name="game-controller-outline" size={64} color={theme.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            Chưa có trận đấu nào đang diễn ra
          </Text>
          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate('GameSelection' as never)}
          >
            <Text style={styles.startButtonText}>Bắt Đầu Trận Mới</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.text }]}>
            Trận Đấu Đang Diễn Ra
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Ván {activeMatch.rounds.length + 1}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: theme.surface }]}
          onPress={handleEditConfig}
        >
          <Ionicons name="settings-outline" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Countdown Timer */}
      <View style={styles.timerContainer}>
        <CountdownTimer />
      </View>

      {/* Score Table */}
      <View style={[styles.tableContainer, { backgroundColor: theme.card }]}>
        <Text style={[styles.tableTitle, { color: theme.text }]}>Bảng Điểm</Text>
        {activeMatch.rounds.length > 0 ? (
          <ScoreTable match={activeMatch} />
        ) : (
          <View style={styles.noRoundsContainer}>
            <Text style={[styles.noRoundsText, { color: theme.textSecondary }]}>
              Chưa có ván nào. Nhấn "Nhập Ván Mới" để bắt đầu!
            </Text>
          </View>
        )}
      </View>

      {/* Players Info */}
      <ScrollView style={styles.playersContainer}>
        <Text style={[styles.playersTitle, { color: theme.text }]}>Người Chơi</Text>
        {activeMatch.playerNames.map((name, index) => {
          const playerId = activeMatch.playerIds[index];
          const totalScore = activeMatch.totalScores[playerId] || 0;
          return (
            <View
              key={playerId}
              style={[styles.playerCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            >
              <View style={[styles.playerAvatar, { backgroundColor: theme.primary }]}>
                <Text style={styles.playerAvatarText}>{name.charAt(0).toUpperCase()}</Text>
              </View>
              <Text style={[styles.playerName, { color: theme.text }]}>{name}</Text>
              <Text
                style={[
                  styles.playerScore,
                  { color: totalScore >= 0 ? theme.success : theme.error },
                ]}
              >
                {totalScore >= 0 ? '+' : ''}
                {totalScore}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.endButton, { backgroundColor: theme.error }]}
          onPress={handleEndMatch}
        >
          <Ionicons name="stop-circle-outline" size={24} color="#FFF" />
          <Text style={styles.buttonText}>Kết Thúc</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.addButton, { backgroundColor: theme.primary }]}
          onPress={handleAddRound}
        >
          <Ionicons name="add-circle-outline" size={24} color="#FFF" />
          <Text style={styles.buttonText}>Nhập Ván Mới</Text>
        </TouchableOpacity>
      </View>
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
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  tableContainer: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
  },
  tableTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  noRoundsContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  noRoundsText: {
    fontSize: 14,
    textAlign: 'center',
  },
  playersContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  playersTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  playerAvatarText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  playerName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  playerScore: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  endButton: {},
  addButton: {},
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  startButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
