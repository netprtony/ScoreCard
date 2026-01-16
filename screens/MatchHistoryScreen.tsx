import React, { useState, useCallback, useEffect } from 'react';
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
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useMatch } from '../contexts/MatchContext';
import { Match, Player } from '../types/models';
import { getCompletedMatches, deleteMatch } from '../services/matchService';
import { getPlayerById } from '../services/playerService';
import i18n from '../utils/i18n';
import { showSuccess, showWarning } from '../utils/toast';
import { Button } from '../components/rn-ui';
import { Card } from '../components/Card';
import { WallpaperBackground } from '../components/WallpaperBackground';
export const MatchHistoryScreen: React.FC = () => {
  const { theme } = useTheme();
  const { resumeMatch } = useMatch();
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [players, setPlayers] = useState<{ [playerId: string]: Player }>({});

  // Load player data for avatars when matches change
  useEffect(() => {
    const playerData: { [playerId: string]: Player } = {};
    matches.forEach(match => {
      match.playerIds.forEach(id => {
        if (!playerData[id]) {
          const player = getPlayerById(id);
          if (player) {
            playerData[id] = player;
          }
        }
      });
    });
    setPlayers(playerData);
  }, [matches]);

  useFocusEffect(
    useCallback(() => {
      loadMatches();
    }, [])
  );

  const loadMatches = () => {
    try {
      // Only load completed matches for history
      const data = getCompletedMatches();
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
              showWarning('Lỗi', 'Không thể xóa trận đấu');
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

  const handleContinueMatch = (match: Match) => {
    Alert.alert(
      i18n.t('continueMatch'),
      'Bạn có chắc muốn tiếp tục trận đấu này? Trận đấu sẽ trở thành trận đang diễn ra.',
      [
        { text: i18n.t('cancel'), style: 'cancel' },
        {
          text: i18n.t('continue'),
          onPress: () => {
            try {
              resumeMatch(match.id);
              setShowDetailModal(false);
              setSelectedMatch(null);
              loadMatches();
              showSuccess('Thành công', 'Đã tiếp tục trận đấu');
            } catch (error) {
              console.error('Error continuing match:', error);
              showWarning('Lỗi', 'Không thể tiếp tục trận đấu');
            }
          },
        },
      ]
    );
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
    // Check if match has any scores
    const hasScores = Object.keys(item.totalScores).length > 0;
    
    if (!hasScores) {
      // Handle matches with no scores yet
      return (
        <Card onPress={() => openMatchDetail(item)}>
          <View style={styles.matchHeader}>
            <View style={styles.matchInfo}>
              <Text style={[styles.matchDate, { color: theme.text }]}>
                {formatDate(item.createdAt)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteMatch(item)}
            >
              <Ionicons name="trash-outline" size={20} color={theme.error} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
            Chưa có điểm số
          </Text>
        </Card>
      );
    }

    // Find winner (player with highest score)
    const winnerEntry = Object.entries(item.totalScores).reduce((max, current) => 
      current[1] > max[1] ? current : max
    );
    const winnerPlayerId = winnerEntry[0];
    const winnerScore = winnerEntry[1];
    const winnerIndex = item.playerIds.indexOf(winnerPlayerId);
    const winnerName = item.playerNames[winnerIndex];
    
    const totalSum = getTotalScoreSum(item);

    // Create player results for display (sorted by score descending)
    const playerResults = item.playerIds.map((playerId, index) => ({
      playerId,
      playerName: item.playerNames[index],
      score: item.totalScores[playerId]
    })).sort((a, b) => b.score - a.score);

    return (
      <Card onPress={() => openMatchDetail(item)}>
        <View style={styles.matchHeader}>
          <View style={styles.matchInfo}>
            <Text style={[styles.matchDate, { color: theme.text }]}>
              {formatDate(item.createdAt)}
            </Text>
            {item.completedAt && (
              <View style={styles.durationBadge}>
                <Ionicons name="time-outline" size={12} color={theme.textSecondary} />
                <Text style={[styles.durationText, { color: theme.textSecondary }]}>
                  {formatDuration(Math.floor((item.completedAt - item.createdAt) / 1000))}
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
            {winnerName}
          </Text>
          <Text style={[styles.winnerScore, { color: theme.success }]}>
            {winnerScore > 0 ? '+' : ''}{(winnerScore ?? 0).toLocaleString('vi-VN')}
          </Text>
        </View>

        <View style={styles.playersRow}>
          {playerResults.map((result, index) => {
            const playerInfo = players[result.playerId];
            return (
              <View key={result.playerId} style={styles.playerChip}>
                <View style={[styles.playerChipAvatar, { backgroundColor: playerInfo?.color || getRankColor(index + 1, theme) }]}>
                  {playerInfo?.avatar ? (
                    <Image source={{ uri: playerInfo.avatar }} style={styles.playerChipAvatarImage} />
                  ) : (
                    <Text style={styles.playerChipAvatarText}>{result.playerName.charAt(0).toUpperCase()}</Text>
                  )}
                </View>
                <Text style={[styles.playerChipText, { color: playerInfo?.color || theme.textSecondary }]} numberOfLines={1}>
                  {result.playerName}
                </Text>
              </View>
            );
          })}
        </View>

        {totalSum !== 0 && (
          <View style={[styles.warningBadge, { backgroundColor: theme.warning + '20' }]}>
            <Ionicons name="warning-outline" size={14} color={theme.warning} />
            <Text style={[styles.warningText, { color: theme.warning }]}>
              Tổng điểm: {totalSum > 0 ? '+' : ''}{totalSum}
            </Text>
          </View>
        )}
      </Card>
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
    <WallpaperBackground>
      <SafeAreaView style={styles.container}>
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
              <Card>
                <View style={styles.infoRow}>
                  <Ionicons name="calendar-outline" size={20} color={theme.textSecondary} />
                  <Text style={[styles.infoText, { color: theme.text }]}>
                    {formatDate(selectedMatch.createdAt)}
                  </Text>
                </View>

                {selectedMatch.completedAt && (
                  <View style={styles.infoRow}>
                    <Ionicons name="time-outline" size={20} color={theme.textSecondary} />
                    <Text style={[styles.infoText, { color: theme.text }]}>
                      Thời gian: {formatDuration(Math.floor((selectedMatch.completedAt - selectedMatch.createdAt) / 1000))}
                    </Text>
                  </View>
                )}
              </Card>
              <Card style={{ marginTop: 12 }}>
                <View style={styles.infoRow}>
                  <Ionicons name="settings-outline" size={20} color={theme.textSecondary} />
                  <Text style={[styles.infoText, { color: theme.text }]}>
                    {selectedMatch.configSnapshot.name}
                  </Text>
                </View>
              </Card>

              {/* Continue Match Button */}
              <Button
                onPress={() => handleContinueMatch(selectedMatch)}
                icon={<Ionicons name="play" size={24} color="#FFF" />}
                variant="default"
                size="lg"
                style={{ marginVertical: 16, backgroundColor: theme.success }}
              >
                Tiếp tục trận đấu
              </Button>

              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Kết quả cuối cùng
              </Text>

              {/* Display final scores sorted by rank */}
              {Object.entries(selectedMatch.totalScores)
                .map(([playerId, score]) => {
                  const playerIndex = selectedMatch.playerIds.indexOf(playerId);
                  const playerInfo = players[playerId];
                  return {
                    playerId,
                    playerName: selectedMatch.playerNames[playerIndex],
                    playerColor: playerInfo?.color,
                    playerAvatar: playerInfo?.avatar,
                    score
                  };
                })
                .sort((a, b) => b.score - a.score)
                .map((player, index) => (
                  <Card key={player.playerId} accentColor={player.playerColor || theme.primary} style={{ marginBottom: 8 }}>
                    <View style={styles.playerScoreHeader}>
                      <View style={styles.playerScoreRank}>
                        <View style={[styles.modalPlayerAvatar, { backgroundColor: player.playerColor || getRankColor(index + 1, theme) }]}>
                          {player.playerAvatar ? (
                            <Image source={{ uri: player.playerAvatar }} style={styles.modalPlayerAvatarImage} />
                          ) : (
                            <Text style={styles.modalPlayerAvatarText}>{player.playerName.charAt(0).toUpperCase()}</Text>
                          )}
                        </View>
                        <Text style={[styles.playerScoreName, { color: player.playerColor || theme.text }]}>
                          {player.playerName}
                        </Text>
                      </View>
                      <Text style={[
                        styles.playerScoreValue,
                        { color: player.score >= 0 ? theme.success : theme.error }
                      ]}>
                        {player.score > 0 ? '+' : ''}{(player.score ?? 0).toLocaleString('vi-VN')}
                      </Text>
                    </View>
                  </Card>
                ))}

              {/* Display rounds if any */}
              {selectedMatch.rounds.length > 0 && (
                <>
                  <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 20 }]}>
                    Chi tiết các ván ({selectedMatch.rounds.length} ván)
                  </Text>
                  {selectedMatch.rounds.map((round, roundIndex) => (
                    <Card key={round.id} style={{ marginBottom: 8 }}>
                      <Text style={[styles.roundTitle, { color: theme.text }]}>
                        Ván {round.roundNumber}
                      </Text>
                      {Object.entries(round.roundScores).map(([playerId, score]) => {
                        const playerIndex = selectedMatch.playerIds.indexOf(playerId);
                        const playerName = selectedMatch.playerNames[playerIndex];
                        return (
                          <View key={playerId} style={styles.roundScoreRow}>
                            <Text style={[styles.roundPlayerName, { color: theme.textSecondary }]}>
                              {playerName}
                            </Text>
                            <Text style={[
                              styles.roundScore,
                              { color: score >= 0 ? theme.success : theme.error }
                            ]}>
                              {score > 0 ? '+' : ''}{score}
                            </Text>
                          </View>
                        );
                      })}
                    </Card>
                  ))}
                </>
              )}

              {/* Config display based on game type */}
              {selectedMatch.gameType === 'sac_te' ? (
                <Card style={{ marginTop: 20 }}>
                  <Text style={[styles.configTitle, { color: theme.text }]}>
                    Cấu hình đã dùng (Sắc Tê)
                  </Text>
                  <View style={styles.configRow}>
                    <Text style={[styles.configLabel, { color: theme.textSecondary }]}>
                      Hệ số Gục:
                    </Text>
                    <Text style={[styles.configValue, { color: theme.text }]}>
                      {(selectedMatch.configSnapshot as any).heSoGuc ?? 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.configRow}>
                    <Text style={[styles.configLabel, { color: theme.textSecondary }]}>
                      Hệ số Tồn:
                    </Text>
                    <Text style={[styles.configValue, { color: theme.text }]}>
                      {(selectedMatch.configSnapshot as any).heSoTon ?? 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.configRow}>
                    <Text style={[styles.configLabel, { color: theme.textSecondary }]}>
                      Hệ số Tới Trắng:
                    </Text>
                    <Text style={[styles.configValue, { color: theme.text }]}>
                      ×{(selectedMatch.configSnapshot as any).whiteWinMultiplier ?? 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.configRow}>
                    <Text style={[styles.configLabel, { color: theme.textSecondary }]}>
                      Cá Nước:
                    </Text>
                    <Text style={[styles.configValue, { color: theme.text }]}>
                      {(selectedMatch.configSnapshot as any).caNuoc?.enabled ? `Bật (${(selectedMatch.configSnapshot as any).caNuoc.heSo})` : 'Tắt'}
                    </Text>
                  </View>
                  <View style={styles.configRow}>
                    <Text style={[styles.configLabel, { color: theme.textSecondary }]}>
                      Cá Heo:
                    </Text>
                    <Text style={[styles.configValue, { color: theme.text }]}>
                      {(selectedMatch.configSnapshot as any).caHeo?.enabled ? `Bật (${(selectedMatch.configSnapshot as any).caHeo.heSo})` : 'Tắt'}
                    </Text>
                  </View>
                </Card>
              ) : (
                <Card style={{ marginTop: 20 }}>
                  <Text style={[styles.configTitle, { color: theme.text }]}>
                    Cấu hình đã dùng (Tiến Lên)
                  </Text>
                  <View style={styles.configRow}>
                    <Text style={[styles.configLabel, { color: theme.textSecondary }]}>
                      Hệ số cơ bản:
                    </Text>
                    <Text style={[styles.configValue, { color: theme.text }]}>
                      {(selectedMatch.configSnapshot as any).baseRatioFirst ?? 'N/A'}:{(selectedMatch.configSnapshot as any).baseRatioSecond ?? 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.configRow}>
                    <Text style={[styles.configLabel, { color: theme.textSecondary }]}>
                      Hệ số tới trắng:
                    </Text>
                    <Text style={[styles.configValue, { color: theme.text }]}>
                      ×{(selectedMatch.configSnapshot as any).toiTrangMultiplier ?? 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.configRow}>
                    <Text style={[styles.configLabel, { color: theme.textSecondary }]}>
                      Hệ số giết:
                    </Text>
                    <Text style={[styles.configValue, { color: theme.text }]}>
                      ×{(selectedMatch.configSnapshot as any).killMultiplier ?? 'N/A'}
                    </Text>
                  </View>
                </Card>
              )}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
      </SafeAreaView>
    </WallpaperBackground>
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
  playerChipAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerChipAvatarImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  playerChipAvatarText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
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
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
    gap: 10,
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
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
  playerScoreCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  playerScoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playerScoreRank: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playerScoreName: {
    fontSize: 16,
    fontWeight: '600',
  },
  playerScoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalPlayerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalPlayerAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  modalPlayerAvatarText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  roundCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  roundTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  roundScoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  roundPlayerName: {
    fontSize: 14,
  },
  roundScore: {
    fontSize: 14,
    fontWeight: '600',
  },
});
