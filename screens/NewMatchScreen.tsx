import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { PlayerCard } from '../components/Card';
import { ScoreDisplay } from '../components/ScoreDisplay';
import { CountdownTimer } from '../components/CountdownTimer';
import { Player, ScoringConfig, MatchPlayerResult, PenaltyType } from '../types/models';
import { getAllPlayers } from '../services/playerService';
import { getDefaultConfig, getAllConfigs } from '../services/configService';
import { createMatch } from '../services/matchService';
import { calculateRoundScores } from '../utils/scoringEngine';
import i18n from '../utils/i18n';
import { showSuccess, showWarning } from '../utils/toast';
import { Badge, Button } from '../components/rn-ui';
import { Card } from '../components/Card';
type MatchStep = 'select_players' | 'select_config' | 'input_results' | 'review';

export const NewMatchScreen: React.FC = () => {
  const { theme } = useTheme();
  const [step, setStep] = useState<MatchStep>('select_players');
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [configs, setConfigs] = useState<ScoringConfig[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<ScoringConfig | null>(null);
  const [matchResults, setMatchResults] = useState<Partial<MatchPlayerResult>[]>([]);
  const [startTime, setStartTime] = useState<number>(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const playerData = getAllPlayers();
      setPlayers(playerData);

      const configData = getAllConfigs();
      setConfigs(configData);

      const defaultConfig = getDefaultConfig();
      if (defaultConfig) {
        setSelectedConfig(defaultConfig);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const togglePlayerSelection = (player: Player) => {
    if (selectedPlayers.find(p => p.id === player.id)) {
      setSelectedPlayers(selectedPlayers.filter(p => p.id !== player.id));
    } else {
      if (selectedPlayers.length < 4) {
        setSelectedPlayers([...selectedPlayers, player]);
      } else {
        showWarning('Lỗi', 'Chỉ được chọn tối đa 4 người chơi');
      }
    }
  };

  const startMatch = () => {
    if (selectedPlayers.length !== 4) {
      showWarning('Lỗi', i18n.t('errorPlayerCount'));
      return;
    }
    if (!selectedConfig) {
      showWarning('Lỗi', 'Vui lòng chọn cấu hình');
      return;
    }

    // Initialize match results
    const initialResults: Partial<MatchPlayerResult>[] = selectedPlayers.map(player => ({
      playerId: player.id,
      playerName: player.name,
      rank: undefined,
      isToiTrang: false,
      isKilled: false,
      penalties: [],
      dutBaTep: false,
      scoreChange: 0,
    }));

    setMatchResults(initialResults);
    setStartTime(Date.now());
    setStep('input_results');
  };

  const updateResult = (index: number, updates: Partial<MatchPlayerResult>) => {
    const newResults = [...matchResults];
    newResults[index] = { ...newResults[index], ...updates };
    setMatchResults(newResults);
  };

  const addPenalty = (index: number, type: PenaltyType) => {
    const result = matchResults[index];
    const penalties = result.penalties || [];
    const existing = penalties.find(p => p.type === type);

    if (existing) {
      existing.count++;
    } else {
      penalties.push({ type, count: 1 });
    }

    updateResult(index, { penalties: [...penalties] });
  };

  const removePenalty = (index: number, type: PenaltyType) => {
    const result = matchResults[index];
    const penalties = result.penalties || [];
    const existing = penalties.find(p => p.type === type);

    if (existing && existing.count > 0) {
      existing.count--;
      if (existing.count === 0) {
        updateResult(index, { penalties: penalties.filter(p => p.type !== type) });
      } else {
        updateResult(index, { penalties: [...penalties] });
      }
    }
  };

  const calculateScores = () => {
    // Validate all ranks are set
    const ranks = matchResults.map(r => r.rank).filter(r => r !== undefined);
    if (ranks.length !== 4 || new Set(ranks).size !== 4) {
      showWarning('Lỗi', 'Vui lòng nhập đầy đủ hạng cho tất cả người chơi (1-4)');
      return;
    }

    // Calculate scores
    const completeResults = matchResults as MatchPlayerResult[];
    
    // Prepare parameters for calculateRoundScores
    const playerIds = completeResults.map(r => r.playerId);
    const rankings = completeResults.map(r => ({
      playerId: r.playerId,
      rank: r.rank!
    }));
    const toiTrangWinner = completeResults.find(r => r.isToiTrang)?.playerId;
    const actions: any[] = []; // Actions would be populated from match results if needed
    
    const { roundScores } = calculateRoundScores(
      playerIds,
      rankings,
      toiTrangWinner,
      actions,
      selectedConfig!
    );

    // Update results with calculated scores
    const updatedResults = completeResults.map(result => ({
      ...result,
      scoreChange: roundScores[result.playerId] || 0,
    }));

    setMatchResults(updatedResults);
    setStep('review');
  };

  const saveMatch = () => {
    try {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      const playerIds = selectedPlayers.map(p => p.id);
      const playerNames = selectedPlayers.map(p => p.name);
      createMatch(
        'tien_len', // gameType - you may want to make this configurable
        playerIds,
        playerNames,
        selectedConfig!
      );

      Alert.alert('Thành công', 'Đã lưu trận đấu', [
        {
          text: 'OK',
          onPress: () => {
            // Reset
            setSelectedPlayers([]);
            setMatchResults([]);
            setStep('select_players');
          },
        },
      ]);
    } catch (error) {
      console.error('Error saving match:', error);
      showWarning('Lỗi', 'Không thể lưu trận đấu');
    }
  };

  const restartMatch = () => {
    Alert.alert(
      i18n.t('restartMatch'),
      i18n.t('confirmRestart'),
      [
        { text: i18n.t('cancel'), style: 'cancel' },
        {
          text: i18n.t('confirm'),
          onPress: () => {
            // Save current match first
            if (step === 'review') {
              saveMatch();
            }
            // Restart with same players
            startMatch();
          },
        },
      ]
    );
  };

  const endMatch = () => {
    Alert.alert(
      i18n.t('endMatch'),
      i18n.t('confirmEnd'),
      [
        { text: i18n.t('cancel'), style: 'cancel' },
        {
          text: i18n.t('confirm'),
          onPress: () => {
            if (step === 'review') {
              saveMatch();
            } else {
              setSelectedPlayers([]);
              setMatchResults([]);
              setStep('select_players');
            }
          },
        },
      ]
    );
  };

  // Render different steps
  if (step === 'select_players') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            {i18n.t('newMatch')}
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Chọn 4 người chơi
          </Text>
        </View>

        <Card style={{ marginHorizontal: 20, marginBottom: 12 }}>
          <View style={{ padding: 4 }}>
            <Text style={[styles.selectedTitle, { color: theme.text }]}>
              Đã chọn: {selectedPlayers.length}/4
            </Text>
            <View style={styles.selectedPlayers}>
              {selectedPlayers.map((player, index) => (
                <Badge key={player.id} variant="default" style={{ backgroundColor: player.color || theme.primary }}>
                  {player.name}
                </Badge>
              ))}
            </View>
          </View>
        </Card>

        <ScrollView contentContainerStyle={styles.list}>
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
              backgroundColor: selectedPlayers.length === 4 ? theme.primary : theme.disabled,
            },
          ]}
          onPress={startMatch}
          disabled={selectedPlayers.length !== 4}
        >
          <Ionicons name="arrow-forward" size={24} color="#FFF" />
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (step === 'input_results') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            Nhập kết quả
          </Text>
          <CountdownTimer />
        </View>

        <ScrollView contentContainerStyle={styles.list}>
          {matchResults.map((result, index) => (
            <Card
              key={index}
              
              style={{ marginBottom: 12 }}
            >
              <View style={{ padding: 4 }}>
                <Text style={[styles.resultPlayerName, { color: theme.text }]}>
                  {result.playerName}
                </Text>

              {/* Rank */}
              <View style={styles.rankRow}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Hạng:</Text>
                <View style={styles.rankButtons}>
                  {[1, 2, 3, 4].map(rank => (
                    <TouchableOpacity
                      key={rank}
                      style={[
                        styles.rankButton,
                        {
                          backgroundColor: result.rank === rank ? theme.primary : theme.surface,
                          borderColor: theme.border,
                        },
                      ]}
                      onPress={() => updateResult(index, { rank: rank as 1 | 2 | 3 | 4 })}
                    >
                      <Text
                        style={[
                          styles.rankButtonText,
                          { color: result.rank === rank ? '#FFF' : theme.text },
                        ]}
                      >
                        {rank}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Special conditions */}
              {selectedConfig?.enableToiTrang && result.rank === 1 && (
                <View style={styles.switchRow}>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>
                    {i18n.t('toiTrang')}
                  </Text>
                  <Switch
                    value={result.isToiTrang}
                    onValueChange={(value) => updateResult(index, { isToiTrang: value })}
                    trackColor={{ false: theme.border, true: theme.primary }}
                    thumbColor="#FFF"
                  />
                </View>
              )}

              {selectedConfig?.enableKill && (
                <View style={styles.switchRow}>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>
                    {i18n.t('killed')}
                  </Text>
                  <Switch
                    value={result.isKilled}
                    onValueChange={(value) => updateResult(index, { isKilled: value })}
                    trackColor={{ false: theme.border, true: theme.primary }}
                    thumbColor="#FFF"
                  />
                </View>
              )}

              {/* Penalties */}
              {selectedConfig?.enablePenalties && (
                <View style={styles.penaltiesSection}>
                  <Text style={[styles.sectionLabel, { color: theme.text }]}>Phạt:</Text>
                  {(['heo_den', 'heo_do', 'ba_tep', 'ba_doi_thong', 'tuQuy'] as PenaltyType[]).map(type => {
                    const penalty = result.penalties?.find(p => p.type === type);
                    return (
                      <View key={type} style={styles.penaltyRow}>
                        <Text style={[styles.penaltyLabel, { color: theme.textSecondary }]}>
                          {i18n.t(type)}
                        </Text>
                        <View style={styles.counterButtons}>
                          <TouchableOpacity
                            style={[styles.counterButton, { backgroundColor: theme.error }]}
                            onPress={() => removePenalty(index, type)}
                          >
                            <Ionicons name="remove" size={16} color="#FFF" />
                          </TouchableOpacity>
                          <Text style={[styles.counterValue, { color: theme.text }]}>
                            {penalty?.count || 0}
                          </Text>
                          <TouchableOpacity
                            style={[styles.counterButton, { backgroundColor: theme.success }]}
                            onPress={() => addPenalty(index, type)}
                          >
                            <Ionicons name="add" size={16} color="#FFF" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}

              {selectedConfig?.enableDutBaTep && (
                <View style={styles.switchRow}>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>
                    {i18n.t('dutBaTep')}
                  </Text>
                  <Switch
                    value={result.dutBaTep}
                    onValueChange={(value) => updateResult(index, { dutBaTep: value })}
                    trackColor={{ false: theme.border, true: theme.primary }}
                    thumbColor="#FFF"
                  />
                </View>
              )}
              </View>
            </Card>
          ))}
        </ScrollView>

        <View style={styles.bottomButtons}>
          <TouchableOpacity
            style={[styles.bottomButton, { backgroundColor: theme.error }]}
            onPress={endMatch}
          >
            <Text style={styles.bottomButtonText}>{i18n.t('endMatch')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.bottomButton, { backgroundColor: theme.primary }]}
            onPress={calculateScores}
          >
            <Text style={styles.bottomButtonText}>Tính điểm</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (step === 'review') {
    const totalSum = matchResults.reduce((sum, r) => sum + (r.scoreChange || 0), 0);

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            Kết quả
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.list}>
          {(matchResults as MatchPlayerResult[]).map((result, index) => (
            <ScoreDisplay key={index} result={result} showDetails />
          ))}

          {totalSum !== 0 && (
            <View style={[styles.warningCard, { backgroundColor: theme.warning + '20', borderColor: theme.warning }]}>
              <Ionicons name="warning" size={24} color={theme.warning} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.warningTitle, { color: theme.warning }]}>
                  Cảnh báo
                </Text>
                <Text style={[styles.warningText, { color: theme.text }]}>
                  Tổng điểm không bằng 0: {totalSum > 0 ? '+' : ''}{totalSum}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.bottomButtons}>
          <TouchableOpacity
            style={[styles.bottomButton, { backgroundColor: theme.warning }]}
            onPress={restartMatch}
          >
            <Text style={styles.bottomButtonText}>{i18n.t('restartMatch')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.bottomButton, { backgroundColor: theme.success }]}
            onPress={saveMatch}
          >
            <Text style={styles.bottomButtonText}>Lưu trận</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return null;
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
  resultCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  resultPlayerName: {
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
  bottomButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  bottomButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  bottomButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  warningCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 12,
    marginTop: 8,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
  },
});
