import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useMatch } from '../contexts/MatchContext';
import { PenaltyType } from '../types/models';
import i18n from '../utils/i18n';

export const RoundInputScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { activeMatch, addRound } = useMatch();

  const [rankings, setRankings] = useState<{ [playerId: string]: 1 | 2 | 3 | 4 | undefined }>({});
  const [toiTrangWinner, setToiTrangWinner] = useState<string | undefined>();
  const [penalties, setPenalties] = useState<{ [playerId: string]: { [key in PenaltyType]?: number } }>({});
  const [dutBaTep, setDutBaTep] = useState<{ [playerId: string]: boolean }>({});

  if (!activeMatch) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.text }]}>Không có trận đấu nào</Text>
        </View>
      </SafeAreaView>
    );
  }

  const config = activeMatch.configSnapshot;

  const setPlayerRank = (playerId: string, rank: 1 | 2 | 3 | 4) => {
    // Check if rank is already taken
    const existingPlayer = Object.entries(rankings).find(([id, r]) => r === rank && id !== playerId);
    if (existingPlayer) {
      Alert.alert('Lỗi', `Hạng ${rank} đã được chọn bởi người chơi khác`);
      return;
    }

    setRankings({ ...rankings, [playerId]: rank });

    // If player is rank 1 and Tới Trắng is enabled, allow setting
    if (rank === 1 && config.enableToiTrang) {
      // Can set tới trắng
    } else if (toiTrangWinner === playerId) {
      setToiTrangWinner(undefined);
    }
  };

  const toggleToiTrang = (playerId: string) => {
    if (rankings[playerId] !== 1) {
      Alert.alert('Lỗi', 'Chỉ người về nhất mới có thể Tới Trắng');
      return;
    }
    setToiTrangWinner(toiTrangWinner === playerId ? undefined : playerId);
  };

  const addPenalty = (playerId: string, type: PenaltyType) => {
    const current = penalties[playerId] || {};
    const count = (current[type] || 0) + 1;
    setPenalties({
      ...penalties,
      [playerId]: { ...current, [type]: count },
    });
  };

  const removePenalty = (playerId: string, type: PenaltyType) => {
    const current = penalties[playerId] || {};
    const count = Math.max(0, (current[type] || 0) - 1);
    setPenalties({
      ...penalties,
      [playerId]: { ...current, [type]: count },
    });
  };

  const calculateAndSave = () => {
    // Validate all players have ranks
    const allRanked = activeMatch.playerIds.every(id => rankings[id] !== undefined);
    if (!allRanked) {
      Alert.alert('Lỗi', 'Vui lòng chọn hạng cho tất cả người chơi');
      return;
    }

    // Simple scoring calculation (will be improved with full scoring engine)
    const roundScores: { [playerId: string]: number } = {};
    
    if (toiTrangWinner) {
      // Tới Trắng: winner gets positive, all others get negative
      const winnerScore = config.baseRatioFirst * config.toiTrangMultiplier;
      activeMatch.playerIds.forEach(id => {
        roundScores[id] = id === toiTrangWinner ? winnerScore : -winnerScore;
      });
    } else {
      // Basic scoring
      const sorted = activeMatch.playerIds.sort((a, b) => (rankings[a] || 5) - (rankings[b] || 5));
      roundScores[sorted[0]] = config.baseRatioFirst;
      roundScores[sorted[1]] = config.baseRatioSecond;
      roundScores[sorted[2]] = -config.baseRatioSecond;
      roundScores[sorted[3]] = -config.baseRatioFirst;

      // Add penalties (simplified)
      if (config.enablePenalties) {
        activeMatch.playerIds.forEach(playerId => {
          const playerPenalties = penalties[playerId] || {};
          let penaltyTotal = 0;
          
          Object.entries(playerPenalties).forEach(([type, count]) => {
            if (!count) return;
            let value = 0;
            switch (type as PenaltyType) {
              case 'heo_den': value = config.penaltyHeoDen; break;
              case 'heo_do': value = config.penaltyHeoDo; break;
              case 'ba_tep': value = config.penaltyBaTep; break;
              case 'ba_doi_thong': value = config.penaltyBaDoiThong; break;
              case 'tu_quy': value = config.penaltyTuQuy; break;
            }
            penaltyTotal += value * count;
          });

          if (penaltyTotal > 0) {
            roundScores[playerId] -= penaltyTotal;
            // Give to 3rd place
            roundScores[sorted[2]] += penaltyTotal;
          }
        });
      }
    }

    // Create round
    const roundData = {
      roundNumber: activeMatch.rounds.length + 1,
      rankings: activeMatch.playerIds.map(id => ({
        playerId: id,
        rank: rankings[id]!,
      })),
      toiTrangWinner,
      penalties: Object.entries(penalties).flatMap(([playerId, penaltyMap]) =>
        Object.entries(penaltyMap)
          .filter(([_, count]) => count && count > 0)
          .map(([type, count]) => ({
            playerId,
            type: type as PenaltyType,
            count: count!,
          }))
      ),
      chatHeoChains: [], // Simplified for now
      dutBaTepPlayers: Object.entries(dutBaTep)
        .filter(([_, enabled]) => enabled)
        .map(([playerId]) => playerId),
      roundScores,
    };

    try {
      addRound(roundData);
      Alert.alert('Thành công', 'Đã lưu ván đấu', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Error saving round:', error);
      Alert.alert('Lỗi', 'Không thể lưu ván đấu');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={theme.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 16 }}>
          <Text style={[styles.title, { color: theme.text }]}>
            Nhập Kết Quả Ván {activeMatch.rounds.length + 1}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeMatch.playerIds.map((playerId, index) => {
          const playerName = activeMatch.playerNames[index];
          const rank = rankings[playerId];

          return (
            <View key={playerId} style={[styles.playerSection, { backgroundColor: theme.card }]}>
              <Text style={[styles.playerName, { color: theme.text }]}>{playerName}</Text>

              {/* Rank Selection */}
              <View style={styles.rankRow}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Hạng:</Text>
                <View style={styles.rankButtons}>
                  {[1, 2, 3, 4].map(r => (
                    <TouchableOpacity
                      key={r}
                      style={[
                        styles.rankButton,
                        {
                          backgroundColor: rank === r ? theme.primary : theme.surface,
                          borderColor: theme.border,
                        },
                      ]}
                      onPress={() => setPlayerRank(playerId, r as 1 | 2 | 3 | 4)}
                    >
                      <Text
                        style={[
                          styles.rankButtonText,
                          { color: rank === r ? '#FFF' : theme.text },
                        ]}
                      >
                        {r}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Tới Trắng */}
              {config.enableToiTrang && rank === 1 && (
                <View style={styles.switchRow}>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>
                    {i18n.t('toiTrang')}
                  </Text>
                  <Switch
                    value={toiTrangWinner === playerId}
                    onValueChange={() => toggleToiTrang(playerId)}
                    trackColor={{ false: theme.border, true: theme.primary }}
                    thumbColor="#FFF"
                  />
                </View>
              )}

              {/* Penalties */}
              {config.enablePenalties && !toiTrangWinner && (
                <View style={styles.penaltiesSection}>
                  <Text style={[styles.sectionLabel, { color: theme.text }]}>Phạt:</Text>
                  {(['heo_den', 'heo_do', 'ba_tep', 'ba_doi_thong', 'tu_quy'] as PenaltyType[]).map(type => {
                    const count = penalties[playerId]?.[type] || 0;
                    return (
                      <View key={type} style={styles.penaltyRow}>
                        <Text style={[styles.penaltyLabel, { color: theme.textSecondary }]}>
                          {i18n.t(type)}
                        </Text>
                        <View style={styles.counterButtons}>
                          <TouchableOpacity
                            style={[styles.counterButton, { backgroundColor: theme.error }]}
                            onPress={() => removePenalty(playerId, type)}
                          >
                            <Ionicons name="remove" size={16} color="#FFF" />
                          </TouchableOpacity>
                          <Text style={[styles.counterValue, { color: theme.text }]}>
                            {count}
                          </Text>
                          <TouchableOpacity
                            style={[styles.counterButton, { backgroundColor: theme.success }]}
                            onPress={() => addPenalty(playerId, type)}
                          >
                            <Ionicons name="add" size={16} color="#FFF" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}

              {/* Đút 3 Tép */}
              {config.enableDutBaTep && !toiTrangWinner && (
                <View style={styles.switchRow}>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>
                    {i18n.t('dutBaTep')}
                  </Text>
                  <Switch
                    value={dutBaTep[playerId] || false}
                    onValueChange={(value) => setDutBaTep({ ...dutBaTep, [playerId]: value })}
                    trackColor={{ false: theme.border, true: theme.primary }}
                    thumbColor="#FFF"
                  />
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: theme.primary }]}
        onPress={calculateAndSave}
      >
        <Text style={styles.saveButtonText}>Tính Điểm và Lưu</Text>
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
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  playerSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  rankRow: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  rankButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  rankButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  rankButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  penaltiesSection: {
    marginTop: 8,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  penaltyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  penaltyLabel: {
    fontSize: 14,
  },
  counterButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  counterButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterValue: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 24,
    textAlign: 'center',
  },
  saveButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
});
