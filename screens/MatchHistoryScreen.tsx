import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { ScoreDisplay } from '../components/ScoreDisplay';
import { Match } from '../types/models';
import { getAllMatches, deleteMatch } from '../services/matchService';
import i18n from '../utils/i18n';

export const MatchHistoryScreen: React.FC = () => {
  const { theme } = useTheme();
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadMatches();
    }, [])
  );

  const loadMatches = () => {
    try {
      const data = getAllMatches();
      setMatches(data);
    } catch (error) {
      console.error('Error loading matches:', error);
    }
  };

  const handleDeleteMatch = (match: Match) => {
    Alert.alert(
      'Xóa trận đấu',
      'Bạn có chắc muốn xóa trận đấu này?',
      [
        { text: i18n.t('cancel'), style: 'cancel' },
        {
          text: i18n.t('delete'),
          style: 'destructive',
          onPress: () => {
            try {
              deleteMatch(match.id);
              loadMatches();
              if (selectedMatch?.id === match.id) {
                setShowDetailModal(false);
                setSelectedMatch(null);
              }
            } catch (error) {
              console.error('Error deleting match:', error);
              Alert.alert('Lỗi', 'Không thể xóa trận đấu');
            }
          },
        },
      ]
    );
  };

  const openMatchDetail = (match: Match) => {
    setSelectedMatch(match);
    setShowDetailModal(true);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalScoreSum = (match: Match) => {
    return Object.values(match.totalScores).reduce((sum, score) => sum + score, 0);
  };

  const renderMatchCard = ({ item }: { item: Match }) => {
    const winner = item.playerResults.find(r => r.rank === 1);
    const totalSum = getTotalScoreSum(item);

    return (
      <TouchableOpacity
        style={[styles.matchCard, { backgroundColor: theme.card, borderColor: theme.border }]}
        onPress={() => openMatchDetail(item)}
      >
        <View style={styles.matchHeader}>
          <View style={styles.matchInfo}>
            <Text style={[styles.matchDate, { color: theme.text }]}>
              {formatDate(item.createdAt)}
            </Text>
            {item.duration && (
              <View style={styles.durationBadge}>
                <Ionicons name="time-outline" size={12} color={theme.textSecondary} />
                <Text style={[styles.durationText, { color: theme.textSecondary }]}>
                  {formatDuration(item.duration)}
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteMatch(item)}
          >
            <Ionicons name="trash-outline" size={20} color={theme.error} />
          </TouchableOpacity>
        </View>

        <View style={styles.winnerContainer}>
          <Ionicons name="trophy" size={20} color={theme.rank1} />
          <Text style={[styles.winnerText, { color: theme.text }]}>
            {winner?.playerName}
          </Text>
          <Text style={[styles.winnerScore, { color: theme.success }]}>
            +{winner?.scoreChange.toLocaleString('vi-VN')}
          </Text>
        </View>

        <View style={styles.playersRow}>
          {item.playerResults.map((result, index) => (
            <View key={index} style={styles.playerChip}>
              <View style={[styles.rankDot, { backgroundColor: getRankColor(result.rank, theme) }]} />
              <Text style={[styles.playerChipText, { color: theme.textSecondary }]} numberOfLines={1}>
                {result.playerName}
              </Text>
            </View>
          ))}
        </View>

        {totalSum !== 0 && (
          <View style={[styles.warningBadge, { backgroundColor: theme.warning + '20' }]}>
            <Ionicons name="warning-outline" size={14} color={theme.warning} />
            <Text style={[styles.warningText, { color: theme.warning }]}>
              Tổng điểm: {totalSum > 0 ? '+' : ''}{totalSum}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const getRankColor = (rank: number, theme: any) => {
    switch (rank) {
      case 1: return theme.rank1;
      case 2: return theme.rank2;
      case 3: return theme.rank3;
      case 4: return theme.rank4;
      default: return theme.text;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>
          {i18n.t('history')}
        </Text>
        <Text style={[styles.count, { color: theme.textSecondary }]}>
          {matches.length} trận
        </Text>
      </View>

      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        renderItem={renderMatchCard}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="time-outline" size={64} color={theme.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Chưa có lịch sử trận đấu
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
              Bắt đầu một trận mới để lưu lịch sử
            </Text>
          </View>
        }
      />

      {/* Match Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <TouchableOpacity onPress={() => setShowDetailModal(false)}>
              <Ionicons name="close" size={28} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Chi tiết trận đấu
            </Text>
            <TouchableOpacity
              onPress={() => selectedMatch && handleDeleteMatch(selectedMatch)}
            >
              <Ionicons name="trash-outline" size={24} color={theme.error} />
            </TouchableOpacity>
          </View>

          {selectedMatch && (
            <ScrollView contentContainerStyle={styles.modalContent}>
              <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
                <View style={styles.infoRow}>
                  <Ionicons name="calendar-outline" size={20} color={theme.textSecondary} />
                  <Text style={[styles.infoText, { color: theme.text }]}>
                    {formatDate(selectedMatch.createdAt)}
                  </Text>
                </View>

                {selectedMatch.duration && (
                  <View style={styles.infoRow}>
                    <Ionicons name="time-outline" size={20} color={theme.textSecondary} />
                    <Text style={[styles.infoText, { color: theme.text }]}>
                      Thời gian: {formatDuration(selectedMatch.duration)}
                    </Text>
                  </View>
                )}

                <View style={styles.infoRow}>
                  <Ionicons name="settings-outline" size={20} color={theme.textSecondary} />
                  <Text style={[styles.infoText, { color: theme.text }]}>
                    {selectedMatch.configSnapshot.name}
                  </Text>
                </View>
              </View>

              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Kết quả
              </Text>

              {selectedMatch.playerResults.map((result, index) => (
                <ScoreDisplay key={index} result={result} showDetails />
              ))}

              <View style={[styles.configCard, { backgroundColor: theme.card }]}>
                <Text style={[styles.configTitle, { color: theme.text }]}>
                  Cấu hình đã dùng
                </Text>
                <View style={styles.configRow}>
                  <Text style={[styles.configLabel, { color: theme.textSecondary }]}>
                    Hệ số cơ bản:
                  </Text>
                  <Text style={[styles.configValue, { color: theme.text }]}>
                    {selectedMatch.configSnapshot.baseRatioFirst}:{selectedMatch.configSnapshot.baseRatioSecond}
                  </Text>
                </View>
                <View style={styles.configRow}>
                  <Text style={[styles.configLabel, { color: theme.textSecondary }]}>
                    Hệ số tới trắng:
                  </Text>
                  <Text style={[styles.configValue, { color: theme.text }]}>
                    ×{selectedMatch.configSnapshot.toiTrangMultiplier}
                  </Text>
                </View>
                <View style={styles.configRow}>
                  <Text style={[styles.configLabel, { color: theme.textSecondary }]}>
                    Hệ số giết:
                  </Text>
                  <Text style={[styles.configValue, { color: theme.text }]}>
                    ×{selectedMatch.configSnapshot.killMultiplier}
                  </Text>
                </View>
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
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
  matchCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  matchInfo: {
    flex: 1,
  },
  matchDate: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 12,
  },
  deleteButton: {
    padding: 4,
  },
  winnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  winnerText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  winnerScore: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  playersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  playerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    maxWidth: '48%',
  },
  rankDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  playerChipText: {
    fontSize: 12,
    flex: 1,
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 8,
    marginTop: 12,
  },
  warningText: {
    fontSize: 12,
    fontWeight: '600',
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
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContent: {
    padding: 20,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  configCard: {
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  configTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  configRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  configLabel: {
    fontSize: 14,
  },
  configValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});
