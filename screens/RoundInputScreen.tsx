import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  SafeAreaView,
  Alert,
  Modal,
  Vibration,
  Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useMatch } from '../contexts/MatchContext';
import { Player, PlayerAction, PlayerActionType, PenaltyType, ChatHeoType } from '../types/models';
import { getPlayerById } from '../services/playerService';
import { calculateRoundScores, validateScores } from '../utils/scoringEngine';
import i18n from '../utils/i18n';
import { showSuccess, showWarning } from '../utils/toast';
type PenaltyModalStep = 'select_type' | 'heo' | 'chong' | 'giet' | 'dut_ba_tep';

export const RoundInputScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { activeMatch, addRound } = useMatch();

  const [rankings, setRankings] = useState<{ [playerId: string]: 1 | 2 | 3 | 4 | undefined }>({});
  const [toiTrangWinner, setToiTrangWinner] = useState<string | undefined>();
  const [actions, setActions] = useState<PlayerAction[]>([]);
  const [players, setPlayers] = useState<{ [playerId: string]: Player }>({});
  
  // Penalty Modal State
  const [showPenaltyModal, setShowPenaltyModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [modalStep, setModalStep] = useState<PenaltyModalStep>('select_type');
  const [penaltyType, setPenaltyType] = useState<'heo' | 'chong' | 'giet' | 'dut_ba_tep' | null>(null);
  
  // Heo state
  const [heoType, setHeoType] = useState<'den' | 'do'>('den');
  const [heoCount, setHeoCount] = useState(1);
  const [heoTarget, setHeoTarget] = useState<string | null>(null);
  
  // Chồng state
  const [chongTypes, setChongTypes] = useState<ChatHeoType[]>([]);
  const [chongCounts, setChongCounts] = useState<{ [key in ChatHeoType]?: number }>({});
  const [chongTarget, setChongTarget] = useState<string | null>(null);
  
  // Giết state
  const [gietTarget, setGietTarget] = useState<string | null>(null);
  const [gietPenalties, setGietPenalties] = useState<{ type: PenaltyType; count: number }[]>([]);

  // Đút 3 Tép state
  const [dutBaTepTarget, setDutBaTepTarget] = useState<string | null>(null);

  // Load player data for colors
  useEffect(() => {
    if (activeMatch) {
      const loadPlayers = async () => {
        const playerData: { [playerId: string]: Player } = {};
        for (const playerId of activeMatch.playerIds) {
          const player = getPlayerById(playerId);
          if (player) {
            playerData[playerId] = player;
          }
        }
        setPlayers(playerData);
      };
      loadPlayers();
    }
  }, [activeMatch]);

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
  
  // Shake animation for duplicate rank
  const shakeAnim = useRef(new Animated.Value(0)).current;
  
  const triggerShake = () => {
    Vibration.vibrate(100);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const setPlayerRank = (playerId: string, rank: 1 | 2 | 3 | 4) => {
    // Toggle: if already has this rank, remove it
    if (rankings[playerId] === rank) {
      const { [playerId]: removed, ...rest } = rankings;
      setRankings(rest as { [playerId: string]: 1 | 2 | 3 | 4 | undefined });
      if (toiTrangWinner === playerId) {
        setToiTrangWinner(undefined);
      }
      return;
    }
    
    // Check duplicate rank (except rank 4 which can have multiple)
    if (rank !== 4) {
      const existingPlayer = Object.entries(rankings).find(([id, r]) => r === rank && id !== playerId);
      if (existingPlayer) {
        // Shake instead of Alert
        showWarning('Lỗi', 'Không thể gán hai người cùng một hạng');
        triggerShake();
        return;
      }
    }
    setRankings({ ...rankings, [playerId]: rank });
    if (rank !== 1 && toiTrangWinner === playerId) {
      setToiTrangWinner(undefined);
    }
  };

  const toggleToiTrang = (playerId: string) => {
    if (rankings[playerId] !== 1) {
      showWarning('Lỗi', 'Chỉ người về nhất mới có thể Tới Trắng');
      return;
    }
    setToiTrangWinner(toiTrangWinner === playerId ? undefined : playerId);
  };

  const openPenaltyModal = (playerId: string) => {
    setSelectedPlayer(playerId);
    setModalStep('select_type');
    setPenaltyType(null);
    setShowPenaltyModal(true);
  };

  const closePenaltyModal = () => {
    setShowPenaltyModal(false);
    setSelectedPlayer(null);
    setModalStep('select_type');
    setPenaltyType(null);
    // Reset states
    setHeoType('den');
    setHeoCount(1);
    setHeoTarget(null);
    setChongTypes([]);
    setChongCounts({});
    setChongTarget(null);
    setGietTarget(null);
    setGietPenalties([]);
    setDutBaTepTarget(null);
  };

  const selectPenaltyType = (type: 'heo' | 'chong' | 'giet' | 'dut_ba_tep') => {
    setPenaltyType(type);
    setModalStep(type);
  };

  const getAvailableTargets = () => {
    // For Giết: show ALL players except current player (no rank requirement)
    if (penaltyType === 'giet') {
      return activeMatch.playerIds.filter(id => id !== selectedPlayer);
    }
    // For Heo/Chồng: only players who have ranks
    return activeMatch.playerIds.filter(id => id !== selectedPlayer && rankings[id] !== undefined);
  };

  const openGietModal = (playerId: string) => {
    setSelectedPlayer(playerId);
    setModalStep('giet');
    setPenaltyType('giet');
    setShowPenaltyModal(true);
  };

  const toggleChongType = (type: ChatHeoType) => {
    if (chongTypes.includes(type)) {
      setChongTypes(chongTypes.filter(t => t !== type));
      const newCounts = { ...chongCounts };
      delete newCounts[type];
      setChongCounts(newCounts);
    } else {
      setChongTypes([...chongTypes, type]);
      setChongCounts({ ...chongCounts, [type]: 1 });
    }
  };

  const updateChongCount = (type: ChatHeoType, delta: number) => {
    const current = chongCounts[type] || 1;
    const newCount = Math.max(1, current + delta);
    setChongCounts({ ...chongCounts, [type]: newCount });
  };

  const addGietPenalty = (type: PenaltyType) => {
    const existing = gietPenalties.find(p => p.type === type);
    if (existing) {
      setGietPenalties(gietPenalties.map(p => 
        p.type === type ? { ...p, count: p.count + 1 } : p
      ));
    } else {
      setGietPenalties([...gietPenalties, { type, count: 1 }]);
    }
  };

  const removeGietPenalty = (type: PenaltyType) => {
    const existing = gietPenalties.find(p => p.type === type);
    if (existing && existing.count > 1) {
      setGietPenalties(gietPenalties.map(p => 
        p.type === type ? { ...p, count: p.count - 1 } : p
      ));
    } else {
      setGietPenalties(gietPenalties.filter(p => p.type !== type));
    }
  };

  const saveAction = () => {
    if (!selectedPlayer) return;

    const newAction: PlayerAction = {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      roundId: '', // Will be set when round is created
      actionType: penaltyType as PlayerActionType,
      actorId: selectedPlayer,
      createdAt: Date.now(),
    };

    if (penaltyType === 'heo') {
      if (!heoTarget) {
        showWarning('Lỗi', 'Vui lòng chọn người bị phạt');
        return;
      }
      newAction.targetId = heoTarget;
      newAction.heoType = heoType;
      newAction.heoCount = heoCount;
    } else if (penaltyType === 'chong') {
      if (!chongTarget || chongTypes.length === 0) {
        showWarning('Lỗi', 'Vui lòng chọn loại chồng và người bị phạt');
        return;
      }
      newAction.targetId = chongTarget;
      newAction.chongTypes = chongTypes;
      newAction.chongCounts = chongCounts;
    } else if (penaltyType === 'giet') {
      if (!gietTarget) {
        showWarning('Lỗi', 'Vui lòng chọn người bị giết');
        return;
      }
      newAction.targetId = gietTarget;
      newAction.killedPenalties = gietPenalties;
      
      // Auto-assign ranks: Victim = 4 (can have multiple rank 4)
      const newRankings = { ...rankings };
      newRankings[gietTarget] = 4;
      setRankings(newRankings);
      
      // Note: Dealer must manually assign:
      // - Killer to rank 1
      // - Other players to rank 2 (if double kill, neutral player)
    } else if (penaltyType === 'dut_ba_tep') {
      if (!dutBaTepTarget) {
        showWarning('Lỗi', 'Vui lòng chọn người bị phạt');
        return;
      }
      newAction.targetId = dutBaTepTarget;
    }

    setActions([...actions, newAction]);
    closePenaltyModal();
    showSuccess('Thành công', 'Đã thêm phạt');
  };

  const calculateAndSave = () => {
    // Validate: If Tới Trắng, only need rank 1
    if (toiTrangWinner) {
      if (rankings[toiTrangWinner] !== 1) {
        showWarning('Lỗi', 'Người Tới Trắng phải về nhất');
        return;
      }
      // Don't need all ranks for Tới Trắng
    } else {
      // Validate all players have ranks
      const allRanked = activeMatch.playerIds.every(id => rankings[id] !== undefined);
      if (!allRanked) {
        showWarning('Lỗi', 'Vui lòng chọn hạng cho tất cả người chơi');
        return;
      }
    
    }

    // Use scoring engine to calculate scores
    const rankingsArray = activeMatch.playerIds.map(id => ({
      playerId: id,
      rank: rankings[id] || 4,
    }));

    const scoringResult = calculateRoundScores(
      activeMatch.playerIds,
      rankingsArray,
      toiTrangWinner,
      actions,
      config
    );

    // Validate scores sum to zero
    if (!validateScores(scoringResult.roundScores)) {
      Alert.alert(
        'Cảnh báo',
        `Tổng điểm không bằng 0 (${Object.values(scoringResult.roundScores).reduce((a: number, b: number) => a + b, 0)}). Vẫn muốn lưu?`,
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Lưu', onPress: () => saveRound(scoringResult.roundScores) },
        ]
      );
    } else {
      saveRound(scoringResult.roundScores);
    }
  };

  const saveRound = (roundScores: { [playerId: string]: number }) => {
    const roundData = {
      roundNumber: activeMatch.rounds.length + 1,
      rankings: activeMatch.playerIds.map(id => ({
        playerId: id,
        rank: rankings[id] || 4,
      })),
      toiTrangWinner,
      actions,
      penalties: [],
      chatHeoChains: [],
      dutBaTepPlayers: [],
      roundScores,
    };

    try {
      addRound(roundData);
      showSuccess('Thành công', 'Đã lưu ván đấu');
      navigation.goBack();
    } catch (error) {
      console.error('Error saving round:', error);
      showWarning('Lỗi', 'Không thể lưu ván đấu');
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return '#FFD700';
      case 2: return '#C0C0C0';
      case 3: return '#CD7F32';
      case 4: return '#8B4513';
      default: return theme.border;
    }
  };

  const getPlayerActions = (playerId: string) => {
    return actions.filter(a => a.actorId === playerId);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={theme.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 16 }}>
          <Text style={[styles.title, { color: theme.text }]}>
            Ván {activeMatch.rounds.length + 1}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeMatch.playerIds.map((playerId, index) => {
          const playerName = activeMatch.playerNames[index];
          const rank = rankings[playerId];
          const playerActions = getPlayerActions(playerId);
          const player = players[playerId];
          const playerColor = player?.color || theme.primary;

          return (
            <View key={playerId} style={[styles.playerCard, { backgroundColor: theme.card }]}>
              <View style={styles.playerHeader}>
                <View style={[styles.playerAvatar, { backgroundColor: playerColor }]}>
                  <Text style={styles.playerAvatarText}>{playerName.charAt(0).toUpperCase()}</Text>
                </View>
                <Text style={[styles.playerName, { color: playerColor }]}>{playerName}</Text>
                {playerActions.length > 0 && (
                  <View style={[styles.actionBadge, { backgroundColor: theme.error }]}>
                    <Text style={styles.actionBadgeText}>{playerActions.length}</Text>
                  </View>
                )}
              </View>

              <Animated.View style={[styles.rankRow, { transform: [{ translateX: shakeAnim }] }]}>
                {[1, 2, 3, 4].map(r => (
                  <TouchableOpacity
                    key={r}
                    style={[
                      styles.rankButton,
                      {
                        backgroundColor: rank === r ? getRankColor(r) : theme.surface,
                        borderColor: rank === r ? getRankColor(r) : theme.border,
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
              </Animated.View>

              {/* 2-Column Row for Tới Trắng and Giết - Only for rank 1 */}
              {rank === 1 && !toiTrangWinner && (
                <View style={styles.twoColumnRow}>
                  {config.enableToiTrang && (
                    <TouchableOpacity
                      style={[styles.twoColumnButton, { backgroundColor: theme.warning }]}
                      onPress={() => toggleToiTrang(playerId)}
                    >
                      <Ionicons name="star-outline" size={20} color="#FFF" />
                      <Text style={styles.twoColumnButtonText}>Tới Trắng</Text>
                    </TouchableOpacity>
                  )}
                  {config.enableKill && (
                    <TouchableOpacity
                      style={[styles.twoColumnButton, { backgroundColor: theme.error }]}
                      onPress={() => openGietModal(playerId)}
                    >
                      <Ionicons name="skull" size={20} color="#FFF" />
                      <Text style={styles.twoColumnButtonText}>Giết</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Tới Trắng active state - Only for rank 1 */}
              {config.enableToiTrang && rank === 1 && toiTrangWinner === playerId && (
                <TouchableOpacity
                  style={[styles.toiTrangButton, { backgroundColor: theme.warning }]}
                  onPress={() => toggleToiTrang(playerId)}
                >
                  <Ionicons name="star" size={20} color="#FFF" />
                  <Text style={styles.toiTrangText}>Tới Trắng</Text>
                </TouchableOpacity>
              )}

              {/* Penalty Button - Only if not Tới Trắng and has rank */}
              {!toiTrangWinner && rank && (
                <TouchableOpacity
                  style={[styles.penaltyButton, { backgroundColor: theme.primary }]}
                  onPress={() => openPenaltyModal(playerId)}
                >
                  <Ionicons name="warning" size={20} color="#FFF" />
                  <Text style={styles.penaltyButtonText}>Phạt ai đó</Text>
                </TouchableOpacity>
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

      {/* Penalty Modal */}
      <Modal
        visible={showPenaltyModal}
        animationType="fade"
        transparent={true}
        onRequestClose={closePenaltyModal}
      >
        <TouchableWithoutFeedback onPress={closePenaltyModal}>
          <BlurView intensity={50} style={styles.modalOverlay} tint="dark">
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            {modalStep === 'select_type' && (
              <>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Chọn Loại Phạt</Text>
                {config.enableChatHeo && (
                  <TouchableOpacity
                    style={[styles.modalOption, { backgroundColor: theme.surface }]}
                    onPress={() => selectPenaltyType('heo')}
                  >
                    <Text style={[styles.modalOptionText, { color: theme.text }]}>Chặt Heo</Text>
                  </TouchableOpacity>
                )}
                {config.enablePenalties && (
                  <TouchableOpacity
                    style={[styles.modalOption, { backgroundColor: theme.surface }]}
                    onPress={() => selectPenaltyType('chong')}
                  >
                    <Text style={[styles.modalOptionText, { color: theme.text }]}>Chồng/Thúi</Text>
                  </TouchableOpacity>
                )}
                {/* {config.enableDutBaTep && (
                  <TouchableOpacity
                    style={[styles.modalOption, { backgroundColor: theme.surface }]}
                    onPress={() => selectPenaltyType('dut_ba_tep')}
                  >
                    <Text style={[styles.modalOptionText, { color: theme.text }]}>3 Tép</Text>
                  </TouchableOpacity>
                )} */}
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: theme.border }]}
                  onPress={closePenaltyModal}
                >
                  <Text style={styles.modalButtonText}>Hủy</Text>
                </TouchableOpacity>
              </>
            )}

            {modalStep === 'heo' && (
              <ScrollView>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Heo</Text>
                
                <Text style={[styles.label, { color: theme.textSecondary }]}>Loại:</Text>
                <View style={styles.heoTypeRow}>
                  <TouchableOpacity
                    style={[
                      styles.heoTypeButton,
                      { backgroundColor: heoType === 'den' ? '#333' : theme.surface },
                    ]}
                    onPress={() => setHeoType('den')}
                  >
                    <Text style={[styles.heoTypeText, { color: heoType === 'den' ? '#FFF' : theme.text }]}>
                      Đen
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.heoTypeButton,
                      { backgroundColor: heoType === 'do' ? '#DC143C' : theme.surface },
                    ]}
                    onPress={() => setHeoType('do')}
                  >
                    <Text style={[styles.heoTypeText, { color: heoType === 'do' ? '#FFF' : theme.text }]}>
                      Đỏ
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={[styles.label, { color: theme.textSecondary, marginTop: 16 }]}>Số lượng:</Text>
                <View style={styles.counterRow}>
                  <TouchableOpacity
                    style={[styles.counterButton, { backgroundColor: theme.error }]}
                    onPress={() => setHeoCount(Math.max(1, heoCount - 1))}
                  >
                    <Ionicons name="remove" size={20} color="#FFF" />
                  </TouchableOpacity>
                  <Text style={[styles.counterValue, { color: theme.text }]}>{heoCount}</Text>
                  <TouchableOpacity
                    style={[styles.counterButton, { backgroundColor: theme.success }]}
                    onPress={() => setHeoCount(heoCount + 1)}
                  >
                    <Ionicons name="add" size={20} color="#FFF" />
                  </TouchableOpacity>
                </View>

                <Text style={[styles.label, { color: theme.textSecondary, marginTop: 16 }]}>Người bị phạt:</Text>
                {getAvailableTargets().map(targetId => {
                  const targetIndex = activeMatch.playerIds.indexOf(targetId);
                  const targetName = activeMatch.playerNames[targetIndex];
                  return (
                    <TouchableOpacity
                      key={targetId}
                      style={[
                        styles.targetButton,
                        {
                          backgroundColor: heoTarget === targetId ? theme.primary : theme.surface,
                        },
                      ]}
                      onPress={() => setHeoTarget(targetId)}
                    >
                      <Text
                        style={[
                          styles.targetButtonText,
                          { color: heoTarget === targetId ? '#FFF' : theme.text },
                        ]}
                      >
                        {targetName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: theme.border, flex: 1, marginRight: 8 }]}
                    onPress={() => setModalStep('select_type')}
                  >
                    <Text style={styles.modalButtonText}>Quay lại</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: theme.primary, flex: 1 }]}
                    onPress={saveAction}
                  >
                    <Text style={styles.modalButtonText}>Lưu</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}

            {modalStep === 'chong' && (
              <ScrollView>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Chồng</Text>
                
                <Text style={[styles.label, { color: theme.textSecondary }]}>Chọn loại chồng:</Text>
                {(['heo_den', 'heo_do', 'tu_quy', 'ba_doi_thong'] as ChatHeoType[]).map(type => {
                  const isSelected = chongTypes.includes(type);
                  const count = chongCounts[type] || 1;
                  return (
                    <View key={type} style={styles.chongTypeRow}>
                      <TouchableOpacity
                        style={[
                          styles.chongTypeButton,
                          {
                            backgroundColor: isSelected ? theme.primary : theme.surface,
                            flex: 1,
                          },
                        ]}
                        onPress={() => toggleChongType(type)}
                      >
                        <Text
                          style={[
                            styles.chongTypeText,
                            { color: isSelected ? '#FFF' : theme.text },
                          ]}
                        >
                          {i18n.t(type)}
                        </Text>
                      </TouchableOpacity>
                      {isSelected && (
                        <View style={styles.chongCountRow}>
                          <TouchableOpacity
                            style={[styles.smallCounterButton, { backgroundColor: theme.error }]}
                            onPress={() => updateChongCount(type, -1)}
                          >
                            <Ionicons name="remove" size={16} color="#FFF" />
                          </TouchableOpacity>
                          <Text style={[styles.smallCounterValue, { color: theme.text }]}>
                            {count}
                          </Text>
                          <TouchableOpacity
                            style={[styles.smallCounterButton, { backgroundColor: theme.success }]}
                            onPress={() => updateChongCount(type, 1)}
                          >
                            <Ionicons name="add" size={16} color="#FFF" />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  );
                })}

                <Text style={[styles.label, { color: theme.textSecondary, marginTop: 16 }]}>
                  Người bị chồng:
                </Text>
                {getAvailableTargets().map(targetId => {
                  const targetIndex = activeMatch.playerIds.indexOf(targetId);
                  const targetName = activeMatch.playerNames[targetIndex];
                  return (
                    <TouchableOpacity
                      key={targetId}
                      style={[
                        styles.targetButton,
                        {
                          backgroundColor: chongTarget === targetId ? theme.primary : theme.surface,
                        },
                      ]}
                      onPress={() => setChongTarget(targetId)}
                    >
                      <Text
                        style={[
                          styles.targetButtonText,
                          { color: chongTarget === targetId ? '#FFF' : theme.text },
                        ]}
                      >
                        {targetName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: theme.border, flex: 1, marginRight: 8 }]}
                    onPress={() => setModalStep('select_type')}
                  >
                    <Text style={styles.modalButtonText}>Quay lại</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: theme.primary, flex: 1 }]}
                    onPress={saveAction}
                  >
                    <Text style={styles.modalButtonText}>Lưu</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}

            {modalStep === 'giet' && (
              <ScrollView>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Giết</Text>
                
                <Text style={[styles.label, { color: theme.textSecondary }]}>Người bị giết:</Text>
                {getAvailableTargets().map(targetId => {
                  const targetIndex = activeMatch.playerIds.indexOf(targetId);
                  const targetName = activeMatch.playerNames[targetIndex];
                  return (
                    <TouchableOpacity
                      key={targetId}
                      style={[
                        styles.targetButton,
                        {
                          backgroundColor: gietTarget === targetId ? theme.error : theme.surface,
                        },
                      ]}
                      onPress={() => setGietTarget(targetId)}
                    >
                      <Text
                        style={[
                          styles.targetButtonText,
                          { color: gietTarget === targetId ? '#FFF' : theme.text },
                        ]}
                      >
                        {targetName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}

                {gietTarget && config.enablePenalties && (
                  <>
                    <Text style={[styles.label, { color: theme.textSecondary, marginTop: 16 }]}>
                      Phạt thêm cho người bị giết:
                    </Text>
                    {(['heo_den', 'heo_do', 'ba_tep', 'ba_doi_thong', 'tu_quy'] as PenaltyType[]).map(type => {
                      const penalty = gietPenalties.find(p => p.type === type);
                      const count = penalty?.count || 0;
                      return (
                        <View key={type} style={styles.penaltyRow}>
                          <Text style={[styles.penaltyLabel, { color: theme.text }]}>
                            {i18n.t(type)}
                          </Text>
                          <View style={styles.penaltyCountRow}>
                            <TouchableOpacity
                              style={[styles.smallCounterButton, { backgroundColor: theme.error }]}
                              onPress={() => removeGietPenalty(type)}
                              disabled={count === 0}
                            >
                              <Ionicons name="remove" size={16} color="#FFF" />
                            </TouchableOpacity>
                            <Text style={[styles.smallCounterValue, { color: theme.text }]}>
                              {count}
                            </Text>
                            <TouchableOpacity
                              style={[styles.smallCounterButton, { backgroundColor: theme.success }]}
                              onPress={() => addGietPenalty(type)}
                            >
                              <Ionicons name="add" size={16} color="#FFF" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })}
                  </>
                )}

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: theme.border, flex: 1, marginRight: 8 }]}
                    onPress={() => setModalStep('select_type')}
                  >
                    <Text style={styles.modalButtonText}>Quay lại</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: theme.primary, flex: 1 }]}
                    onPress={saveAction}
                  >
                    <Text style={styles.modalButtonText}>Lưu</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}

            {modalStep === 'dut_ba_tep' && (
              <ScrollView>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Đút 3 Tép</Text>
                
                <Text style={[styles.label, { color: theme.textSecondary }]}>Người bị phạt:</Text>
                {getAvailableTargets().map(targetId => {
                  const targetIndex = activeMatch.playerIds.indexOf(targetId);
                  const targetName = activeMatch.playerNames[targetIndex];
                  return (
                    <TouchableOpacity
                      key={targetId}
                      style={[
                        styles.targetButton,
                        {
                          backgroundColor: dutBaTepTarget === targetId ? theme.primary : theme.surface,
                        },
                      ]}
                      onPress={() => setDutBaTepTarget(targetId)}
                    >
                      <Text
                        style={[
                          styles.targetButtonText,
                          { color: dutBaTepTarget === targetId ? '#FFF' : theme.text },
                        ]}
                      >
                        {targetName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: theme.border, flex: 1, marginRight: 8 }]}
                    onPress={() => setModalStep('select_type')}
                  >
                    <Text style={styles.modalButtonText}>Quay lại</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: theme.primary, flex: 1 }]}
                    onPress={saveAction}
                  >
                    <Text style={styles.modalButtonText}>Lưu</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
              </View>
            </TouchableWithoutFeedback>
          </BlurView>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: 'bold' },
  content: { padding: 12, paddingBottom: 100 },
  playerCard: { borderRadius: 10, padding: 12, marginBottom: 8 },
  playerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  playerAvatar: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  playerAvatarText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  playerName: { fontSize: 16, fontWeight: 'bold', flex: 1 },
  actionBadge: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  actionBadgeText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  rankRow: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  rankButton: { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 2, alignItems: 'center' },
  rankButtonText: { fontSize: 16, fontWeight: 'bold' },
  twoColumnRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  twoColumnButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 8, gap: 8 },
  twoColumnButtonText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  toiTrangButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 8, marginBottom: 8, gap: 8 },
  toiTrangText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  penaltyButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 8, gap: 8 },
  penaltyButtonText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  saveButton: { position: 'absolute', bottom: 20, left: 20, right: 20, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  saveButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  modalSubtitle: { fontSize: 14, marginBottom: 16 },
  modalOption: { paddingVertical: 16, paddingHorizontal: 20, borderRadius: 12, marginBottom: 12 },
  modalOptionText: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
  modalButton: { paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  modalButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  modalActions: { flexDirection: 'row', marginTop: 16 },
  label: { fontSize: 14, marginBottom: 8, fontWeight: '600' },
  heoTypeRow: { flexDirection: 'row', gap: 12 },
  heoTypeButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  heoTypeText: { fontSize: 16, fontWeight: '600' },
  counterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 },
  counterButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  counterValue: { fontSize: 24, fontWeight: 'bold', minWidth: 40, textAlign: 'center' },
  targetButton: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, marginBottom: 8 },
  targetButtonText: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
  chongTypeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  chongTypeButton: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8 },
  chongTypeText: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
  chongCountRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  smallCounterButton: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  smallCounterValue: { fontSize: 16, fontWeight: 'bold', minWidth: 30, textAlign: 'center' },
  penaltyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  penaltyLabel: { fontSize: 14, fontWeight: '600' },
  penaltyCountRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
