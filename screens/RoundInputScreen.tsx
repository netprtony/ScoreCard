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
  Image,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useMatch } from '../contexts/MatchContext';
import { Player, PlayerAction, PlayerActionType, PenaltyType, ChatHeoType } from '../types/models';
import { getPlayerById } from '../services/playerService';
import { calculateRoundScores, validateScores } from '../utils/scoringEngine';
import { formatActionDescription, getActionIcon } from '../utils/actionFormatter';
import i18n from '../utils/i18n';
import { showSuccess, showWarning } from '../utils/toast';
import { Button } from '../components/rn-ui';
import { WallpaperBackground } from '../components/WallpaperBackground';
import { Card } from '../components/Card';
type PenaltyModalStep = 'select_type' | 'heo' | 'chong' | 'giet' | 'dut_ba_tep' | 'giet_select_victim' | 'giet_select_penalty' | 'giet_confirm_penalty';

// Type for tracking victim penalties in multi-kill flow
interface GietVictimData {
  targetId: string;
  penalties: { type: PenaltyType; count: number }[];
  completed: boolean;
}

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
  
  // Giết state (legacy - for single kill)
  const [gietTarget, setGietTarget] = useState<string | null>(null);
  const [gietPenalties, setGietPenalties] = useState<{ type: PenaltyType; count: number }[]>([]);

  // NEW: Multi-kill flow state
  const [gietVictims, setGietVictims] = useState<GietVictimData[]>([]);
  const [currentGietVictim, setCurrentGietVictim] = useState<string | null>(null);
  const [currentGietPenalties, setCurrentGietPenalties] = useState<{ type: PenaltyType; count: number }[]>([]);

  // Đút 3 Tép state
  const [dutBaTepTarget, setDutBaTepTarget] = useState<string | null>(null);

  // ============================================
  // HEO CONSTRAINTS HELPERS
  // ============================================
  
  // Calculate used heo counts from all actions in this round
  const getUsedHeoCount = (): { den: number; do: number } => {
    let usedDen = 0;
    let usedDo = 0;
    
    actions.forEach(action => {
      // From "heo" action type
      if (action.actionType === 'heo') {
        if (action.heoType === 'den') usedDen += action.heoCount || 0;
        if (action.heoType === 'do') usedDo += action.heoCount || 0;
      }
      // From "chong" action type
      if (action.actionType === 'chong' && action.chongCounts) {
        usedDen += action.chongCounts.heo_den || 0;
        usedDo += action.chongCounts.heo_do || 0;
      }
      // From "giet" action with killedPenalties
      if (action.actionType === 'giet' && action.killedPenalties) {
        action.killedPenalties.forEach(p => {
          if (p.type === 'heo_den') usedDen += p.count;
          if (p.type === 'heo_do') usedDo += p.count;
        });
      }
    });
    
    return { den: usedDen, do: usedDo };
  };

  // Get remaining heo counts (max 2 each)
  const getRemainingHeo = (): { den: number; do: number } => {
    const used = getUsedHeoCount();
    return {
      den: Math.max(0, 2 - used.den),
      do: Math.max(0, 2 - used.do),
    };
  };

  // Check if player is killed (has giet action targeting them)
  const isPlayerKilled = (playerId: string): boolean => {
    return actions.some(a => a.actionType === 'giet' && a.targetId === playerId);
  };

  // Get available targets (excluding current player and killed players)
  const getAvailableTargetsExcludeKilled = (): string[] => {
    return activeMatch ? activeMatch.playerIds.filter(id => 
      id !== selectedPlayer && !isPlayerKilled(id)
    ) : [];
  };

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

  // Exit confirmation when there are unsaved changes
  useEffect(() => {
    const hasChanges = actions.length > 0 || Object.keys(rankings).length > 0;
    
    // Handle back button navigation
    const unsubscribeBeforeRemove = navigation.addListener('beforeRemove', (e: any) => {
      // Allow navigation if saving or no changes
      if (isSavingRef.current || !hasChanges) {
        return;
      }

      // Prevent default behavior of leaving the screen
      e.preventDefault();

      // Show confirmation dialog
      Alert.alert(
        'Thoát nhập ván?',
        'Bạn có hành động hoặc xếp hạng chưa lưu. Bạn có chắc muốn thoát?',
        [
          { text: 'Ở lại', style: 'cancel', onPress: () => {} },
          {
            text: 'Thoát',
            style: 'destructive',
            onPress: () => navigation.dispatch(e.data.action),
          },
        ]
      );
    });

    // Handle tab navigation (when user taps on a different tab)
    const unsubscribeBlur = navigation.addListener('blur', () => {
      // Only show alert if there are unsaved changes and not currently saving
      if (hasChanges && !isSavingRef.current) {
        // Screen is about to lose focus (tab switch), show warning
        setTimeout(() => {
          Alert.alert(
            'Cảnh báo',
            'Bạn có hành động hoặc xếp hạng chưa lưu. Vui lòng quay lại để lưu.',
            [{ text: 'OK' }]
          );
        }, 100);
      }
    });

    return () => {
      unsubscribeBeforeRemove();
      unsubscribeBlur();
    };
  }, [navigation, actions, rankings]);

  if (!activeMatch) {
    return (
      <WallpaperBackground>
        <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.text }]}>{i18n.t('noMatch')}</Text>
        </View>
        </SafeAreaView>
      </WallpaperBackground>
    );
  }

  const config = activeMatch.configSnapshot;
  
  // Shake animation for duplicate rank
  const shakeAnim = useRef(new Animated.Value(0)).current;
  
  // Track if we're saving to bypass exit confirmation
  const isSavingRef = useRef(false);
  
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
    // Toggle: if already has this rank, remove it AND its pair to avoid auto-rank conflict
    if (rankings[playerId] === rank) {
      const newRankings = { ...rankings };
      delete newRankings[playerId];
      
      // Also remove paired rank to prevent auto-rank from triggering
      // Rank 1 or 2 → clear both 1 and 2
      // Rank 3 or 4 → clear both 3 and 4
      if (rank === 1 || rank === 2) {
        // Find and remove the player with rank 1 or 2
        Object.entries(rankings).forEach(([id, r]) => {
          if ((r === 1 || r === 2) && id !== playerId) {
            delete newRankings[id];
          }
        });
      } else if (rank === 3 || rank === 4) {
        // Find and remove the player with rank 3 or 4
        Object.entries(rankings).forEach(([id, r]) => {
          if ((r === 3 || r === 4) && id !== playerId) {
            delete newRankings[id];
          }
        });
      }
      
      setRankings(newRankings as { [playerId: string]: 1 | 2 | 3 | 4 | undefined });
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

  // Auto-rank last player when 3 out of 4 are ranked
  useEffect(() => {
    if (!activeMatch) return;

    const rankedPlayers = Object.entries(rankings);
    // Only proceed if we have exactly 3 players ranked
    if (rankedPlayers.length === 3) {
      const rankedPlayerIds = rankedPlayers.map(([id]) => id);
      const unrankedPlayer = activeMatch.playerIds.find(id => !rankedPlayerIds.includes(id));
      
      if (unrankedPlayer) {
        // Find which rank is missing (1, 2, 3, or 4)
        const assignedRanks = rankedPlayers.map(([, rank]) => rank);
        const allRanks = [1, 2, 3, 4] as const;
        const missingRank = allRanks.find(r => !assignedRanks.includes(r));
        
        if (missingRank) {
          // Auto-assign the missing rank to the unranked player
          setRankings(prev => ({ ...prev, [unrankedPlayer]: missingRank }));
          showSuccess('Tự động xếp hạng', `Đã xếp hạng ${missingRank} cho người chơi còn lại`);
        }
      }
    }
  }, [rankings, activeMatch]);

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
    // Reset multi-kill flow state
    setGietVictims([]);
    setCurrentGietVictim(null);
    setCurrentGietPenalties([]);
  };

  const selectPenaltyType = (type: 'heo' | 'chong' | 'giet' | 'dut_ba_tep') => {
    setPenaltyType(type);
    setModalStep(type);
    
    // Auto-fill heo counts when entering heo modal
    if (type === 'heo') {
      const remaining = getRemainingHeo();
      // Auto-select type based on availability
      if (remaining.den > 0) {
        setHeoType('den');
        setHeoCount(remaining.den);
      } else if (remaining.do > 0) {
        setHeoType('do');
        setHeoCount(remaining.do);
      } else {
        // No heo remaining
        setHeoType('den');
        setHeoCount(0);
      }
    }
  };

  const getAvailableTargets = () => {
    // Show ALL players except current player (no rank requirement)
    return activeMatch.playerIds.filter(id => id !== selectedPlayer);
  };

  const openGietModal = (playerId: string) => {
    setSelectedPlayer(playerId);
    setModalStep('giet_select_victim');
    setPenaltyType('giet');
    setGietVictims([]);
    setCurrentGietVictim(null);
    setCurrentGietPenalties([]);
    setShowPenaltyModal(true);
  };

  // NEW: Helper to get player name by ID
  const getPlayerName = (playerId: string): string => {
    const index = activeMatch.playerIds.indexOf(playerId);
    return index >= 0 ? activeMatch.playerNames[index] : 'Unknown';
  };

  // NEW: Select victim for penalty assignment
  const selectGietVictim = (victimId: string) => {
    setCurrentGietVictim(victimId);
    // Load existing penalties if victim was already selected
    const existing = gietVictims.find(v => v.targetId === victimId);
    setCurrentGietPenalties(existing?.penalties || []);
    setModalStep('giet_select_penalty');
  };

  // NEW: Add penalty for current victim
  const addCurrentGietPenalty = (type: PenaltyType) => {
    const existing = currentGietPenalties.find(p => p.type === type);
    if (existing) {
      setCurrentGietPenalties(currentGietPenalties.map(p => 
        p.type === type ? { ...p, count: p.count + 1 } : p
      ));
    } else {
      setCurrentGietPenalties([...currentGietPenalties, { type, count: 1 }]);
    }
  };

  // NEW: Remove penalty for current victim
  const removeCurrentGietPenalty = (type: PenaltyType) => {
    const existing = currentGietPenalties.find(p => p.type === type);
    if (existing && existing.count > 1) {
      setCurrentGietPenalties(currentGietPenalties.map(p => 
        p.type === type ? { ...p, count: p.count - 1 } : p
      ));
    } else {
      setCurrentGietPenalties(currentGietPenalties.filter(p => p.type !== type));
    }
  };

  // NEW: Show confirmation modal with penalty coefficients
  const confirmCurrentGietPenalty = () => {
    setModalStep('giet_confirm_penalty');
  };

  // NEW: Save current victim penalty and return to victim list
  const saveCurrentVictimPenalty = () => {
    if (!currentGietVictim) return;
    
    const existingIndex = gietVictims.findIndex(v => v.targetId === currentGietVictim);
    if (existingIndex >= 0) {
      // Update existing
      const updated = [...gietVictims];
      updated[existingIndex] = {
        targetId: currentGietVictim,
        penalties: currentGietPenalties,
        completed: true,
      };
      setGietVictims(updated);
    } else {
      // Add new
      setGietVictims([...gietVictims, {
        targetId: currentGietVictim,
        penalties: currentGietPenalties,
        completed: true,
      }]);
    }
    
    setCurrentGietVictim(null);
    setCurrentGietPenalties([]);
    setModalStep('giet_select_victim');
  };

  // NEW: Get penalty coefficient from config
  const getPenaltyCoefficient = (type: PenaltyType): number => {
    switch (type) {
      case 'heo_den': return config.penaltyHeoDen;
      case 'heo_do': return config.penaltyHeoDo;
      case 'ba_tep': return config.penaltyBaTep;
      case 'ba_doi_thong': return config.penaltyBaDoiThong;
      case 'tu_quy': return config.penaltyTuQuy;
      default: return 0;
    }
  };

  // NEW: Save all kills from multi-kill flow
  const saveAllGietActions = () => {
    if (!selectedPlayer || gietVictims.length === 0) {
      showWarning('Lỗi', 'Vui lòng chọn ít nhất một người bị giết');
      return;
    }

    const newActions: PlayerAction[] = [];
    const newRankings = { ...rankings };

    gietVictims.forEach(victim => {
      const newAction: PlayerAction = {
        id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        roundId: '',
        actionType: 'giet',
        actorId: selectedPlayer,
        targetId: victim.targetId,
        killedPenalties: victim.penalties,
        createdAt: Date.now(),
      };
      newActions.push(newAction);
      newRankings[victim.targetId] = 4;
    });

    // Handle double/triple kill rankings
    const rank4Players = Object.entries(newRankings).filter(([, r]) => r === 4);
    if (rank4Players.length === 2) {
      const killedPlayerIds = rank4Players.map(([id]) => id);
      const remainingPlayer = activeMatch.playerIds.find(
        id => id !== selectedPlayer && !killedPlayerIds.includes(id)
      );
      if (remainingPlayer) {
        newRankings[remainingPlayer] = 2;
        showSuccess('Tự động xếp hạng', 'Đã xếp hạng 2 cho người chơi còn lại');
      }
    }

    setRankings(newRankings);
    setActions([...actions, ...newActions]);
    closePenaltyModal();
    showSuccess('Thành công', `Đã thêm ${gietVictims.length} giết + phạt`);
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
      
      // Check if this is a double kill (2 players with rank 4)
      const rank4Players = Object.entries(newRankings).filter(([, r]) => r === 4);
      if (rank4Players.length === 2) {
        // Double kill: auto-assign rank 2 to the remaining player
        const killedPlayerIds = rank4Players.map(([id]) => id);
        const remainingPlayer = activeMatch.playerIds.find(
          id => id !== selectedPlayer && !killedPlayerIds.includes(id)
        );
        
        if (remainingPlayer) {
          newRankings[remainingPlayer] = 2;
          showSuccess('Tự động xếp hạng', 'Đã xếp hạng 2 cho người chơi còn lại');
        }
      }
      
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
      // Set flag to bypass exit confirmation
      isSavingRef.current = true;
      addRound(roundData);
      showSuccess('Thành công', 'Đã lưu ván đấu');
      navigation.goBack();
    } catch (error) {
      console.error('Error saving round:', error);
      showWarning('Lỗi', 'Không thể lưu ván đấu');
      // Reset flag if save failed
      isSavingRef.current = false;
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

  const deleteAction = (actionId: string) => {
    Alert.alert(
      'Xóa hành động',
      'Bạn có chắc muốn xóa hành động này?',
      [
        { text: i18n.t('cancel'), style: 'cancel' },
        {
          text: i18n.t('delete'),
          style: 'destructive',
          onPress: () => {
            // If it's a giet action, also remove the rank 4 for victim
            const actionToDelete = actions.find(a => a.id === actionId);
            if (actionToDelete?.actionType === 'giet' && actionToDelete.targetId) {
              const newRankings = { ...rankings };
              delete newRankings[actionToDelete.targetId];
              setRankings(newRankings as { [playerId: string]: 1 | 2 | 3 | 4 | undefined });
            }
            setActions(actions.filter(a => a.id !== actionId));
            showSuccess('Đã xóa', 'Đã xóa hành động');
          },
        },
      ]
    );
  };

  const getActionDescription = (action: PlayerAction) => {
    const actorIndex = activeMatch.playerIds.indexOf(action.actorId);
    const actorName = activeMatch.playerNames[actorIndex] || 'Unknown';
    const targetIndex = action.targetId ? activeMatch.playerIds.indexOf(action.targetId) : -1;
    const targetName = targetIndex >= 0 ? activeMatch.playerNames[targetIndex] : '';
    
    const formatted = formatActionDescription(action, actorName, targetName, 0);
    return formatted;
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
            <Card key={playerId} accentColor={playerColor}>
              <View style={styles.playerHeader}>
                <View style={[styles.playerAvatar, { backgroundColor: playerColor }]}>
                  {player?.avatar ? (
                    <Image source={{ uri: player.avatar }} style={styles.playerAvatarImage} />
                  ) : (
                    <Text style={styles.playerAvatarText}>{playerName.charAt(0).toUpperCase()}</Text>
                  )}
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
                      <Text style={styles.twoColumnButtonText}>{i18n.t('toiTrang')}</Text>
                    </TouchableOpacity>
                  )}
                  {config.enableKill && (
                    <TouchableOpacity
                      style={[styles.twoColumnButton, { backgroundColor: theme.error }]}
                      onPress={() => openGietModal(playerId)}
                    >
                      <Ionicons name="skull" size={20} color="#FFF" />
                      <Text style={styles.twoColumnButtonText}>{i18n.t('kill')}</Text>
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
                  <Text style={styles.toiTrangText}>{i18n.t('toiTrang')}</Text>
                </TouchableOpacity>
              )}

              {/* Penalty Button - Always show unless player is Tới Trắng winner */}
              {toiTrangWinner !== playerId && (
                <TouchableOpacity
                  style={[styles.penaltyButton, { backgroundColor: theme.success }]}
                  onPress={() => openPenaltyModal(playerId)}
                >
                  <Ionicons name="warning" size={20} color="#FFF" />
                  <Text style={styles.penaltyButtonText}>{i18n.t('penalty')}</Text>
                </TouchableOpacity>
              )}
            </Card>
          );
        })}

        {/* Actions List Section */}
        {actions.length > 0 && (
          <Card>
            <View style={styles.actionsListHeader}>
              <Text style={[styles.actionsListTitle, { color: theme.text }]}>
                📋 Danh sách hành động ({actions.length})
              </Text>
            </View>
            {actions.map((action, index) => {
              const formatted = getActionDescription(action);
              return (
                <View key={action.id} style={[styles.actionListItem, { borderBottomColor: theme.border }]}>
                  <Text style={styles.actionListIcon}>{formatted.icon}</Text>
                  <View style={styles.actionListContent}>
                    <Text style={[styles.actionListText, { color: theme.text }]} numberOfLines={2}>
                      {formatted.text}
                    </Text>
                    {formatted.details ? (
                      <Text style={[styles.actionListDetails, { color: theme.textSecondary }]}>
                        {formatted.details}
                      </Text>
                    ) : null}
                  </View>
                  <TouchableOpacity
                    style={[styles.actionDeleteButton, { backgroundColor: theme.error }]}
                    onPress={() => deleteAction(action.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#FFF" />
                  </TouchableOpacity>
                </View>
              );
            })}
          </Card>
        )}
      </ScrollView>

      <View style={styles.buttonWrapper}>
        <Button
          onPress={calculateAndSave}
          size="lg"
          style={{ width: '100%' }}
        >
          {i18n.t('calculateAndSave')}
        </Button>
      </View>

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
                <Text style={[styles.modalTitle, { color: theme.text }]}>{i18n.t('selectPenaltyType')}</Text>
                {config.enableChatHeo && (
                  <TouchableOpacity
                    style={[styles.modalOption, { backgroundColor: theme.surface }]}
                    onPress={() => selectPenaltyType('heo')}
                  >
                    <Text style={[styles.modalOptionText, { color: theme.text }]}>{i18n.t('chatHeoOption')}</Text>
                  </TouchableOpacity>
                )}
                {config.enablePenalties && (
                  <TouchableOpacity
                    style={[styles.modalOption, { backgroundColor: theme.surface }]}
                    onPress={() => selectPenaltyType('chong')}
                  >
                    <Text style={[styles.modalOptionText, { color: theme.text }]}>{i18n.t('chongOption')}</Text>
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
                  <Text style={styles.modalButtonText}>{i18n.t('cancel')}</Text>
                </TouchableOpacity>
              </>
            )}

            {modalStep === 'heo' && (() => {
              const remaining = getRemainingHeo();
              const maxForCurrentType = heoType === 'den' ? remaining.den : remaining.do;
              const noHeoLeft = remaining.den === 0 && remaining.do === 0;
              
              return (
              <ScrollView>
                <Text style={[styles.modalTitle, { color: theme.text }]}>{i18n.t('heo')}</Text>
                
                {noHeoLeft && (
                  <View style={styles.warningBox}>
                    <Ionicons name="warning" size={24} color={theme.warning || '#FFA500'} />
                    <Text style={[styles.warningText, { color: theme.warning || '#FFA500' }]}>
                      Đã hết heo trong ván này (2 đen, 2 đỏ)
                    </Text>
                  </View>
                )}
                
                <Text style={[styles.label, { color: theme.textSecondary }]}>{i18n.t('type')}</Text>
                <View style={styles.heoTypeRow}>
                  <TouchableOpacity
                    disabled={remaining.den === 0}
                    style={[
                      styles.heoTypeButton,
                      { 
                        backgroundColor: heoType === 'den' ? '#333' : theme.surface,
                        opacity: remaining.den === 0 ? 0.4 : 1,
                      },
                    ]}
                    onPress={() => {
                      setHeoType('den');
                      setHeoCount(Math.min(heoCount, remaining.den));
                    }}
                  >
                    <Text style={[styles.heoTypeText, { color: heoType === 'den' ? '#FFF' : theme.text }]}>
                      Đen
                    </Text>
                    <Text style={[styles.remainingBadge, { color: remaining.den === 0 ? '#999' : theme.textSecondary }]}>
                      {remaining.den}/2
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    disabled={remaining.do === 0}
                    style={[
                      styles.heoTypeButton,
                      { 
                        backgroundColor: heoType === 'do' ? '#DC143C' : theme.surface,
                        opacity: remaining.do === 0 ? 0.4 : 1,
                      },
                    ]}
                    onPress={() => {
                      setHeoType('do');
                      setHeoCount(Math.min(heoCount, remaining.do));
                    }}
                  >
                    <Text style={[styles.heoTypeText, { color: heoType === 'do' ? '#FFF' : theme.text }]}>
                      Đỏ
                    </Text>
                    <Text style={[styles.remainingBadge, { color: remaining.do === 0 ? '#999' : theme.textSecondary }]}>
                      {remaining.do}/2
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={[styles.label, { color: theme.textSecondary, marginTop: 16 }]}>Số lượng:</Text>
                <View style={styles.counterRow}>
                  <TouchableOpacity
                    style={[styles.counterButton, { backgroundColor: theme.error }]}
                    onPress={() => setHeoCount(Math.max(1, heoCount - 1))}
                    disabled={heoCount <= 1}
                  >
                    <Ionicons name="remove" size={20} color="#FFF" />
                  </TouchableOpacity>
                  <Text style={[styles.counterValue, { color: theme.text }]}>{heoCount}</Text>
                  <TouchableOpacity
                    style={[styles.counterButton, { backgroundColor: maxForCurrentType <= heoCount ? theme.border : theme.success }]}
                    onPress={() => setHeoCount(Math.min(heoCount + 1, maxForCurrentType))}
                    disabled={maxForCurrentType <= heoCount}
                  >
                    <Ionicons name="add" size={20} color="#FFF" />
                  </TouchableOpacity>
                </View>

                <Text style={[styles.label, { color: theme.textSecondary, marginTop: 16 }]}>Người bị phạt:</Text>
                {activeMatch.playerIds.filter(id => id !== selectedPlayer).map(targetId => {
                  const targetIndex = activeMatch.playerIds.indexOf(targetId);
                  const targetName = activeMatch.playerNames[targetIndex];
                  const isKilled = isPlayerKilled(targetId);
                  return (
                    <TouchableOpacity
                      key={targetId}
                      disabled={isKilled}
                      style={[
                        styles.targetButton,
                        {
                          backgroundColor: heoTarget === targetId ? theme.primary : theme.surface,
                          opacity: isKilled ? 0.5 : 1,
                        },
                      ]}
                      onPress={() => setHeoTarget(targetId)}
                    >
                      <View style={styles.targetButtonInner}>
                        {isKilled && <Ionicons name="skull" size={16} color="#999" style={{ marginRight: 8 }} />}
                        <Text
                          style={[
                            styles.targetButtonText,
                            { color: heoTarget === targetId ? '#FFF' : (isKilled ? '#999' : theme.text) },
                          ]}
                        >
                          {targetName}
                        </Text>
                        {isKilled && <Text style={styles.killedBadge}>Đã bị giết</Text>}
                      </View>
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
                    style={[styles.modalButton, { backgroundColor: noHeoLeft ? theme.border : theme.primary, flex: 1 }]}
                    onPress={saveAction}
                    disabled={noHeoLeft}
                  >
                    <Text style={styles.modalButtonText}>Lưu</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
              );
            })()}

            {modalStep === 'chong' && (() => {
              const remaining = getRemainingHeo();
              
              // Check if a heo type should be disabled
              const isHeoTypeDisabled = (type: ChatHeoType): boolean => {
                if (type === 'heo_den') return remaining.den === 0;
                if (type === 'heo_do') return remaining.do === 0;
                return false; // tu_quy, ba_doi_thong are always available
              };
              
              // Get max count for heo types
              const getMaxForType = (type: ChatHeoType): number => {
                if (type === 'heo_den') return remaining.den;
                if (type === 'heo_do') return remaining.do;
                return 99; // No limit for tu_quy, ba_doi_thong
              };
              
              return (
              <ScrollView>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Chồng</Text>
                
                <Text style={[styles.label, { color: theme.textSecondary }]}>Chọn loại chồng:</Text>
                {(['heo_den', 'heo_do', 'tu_quy', 'ba_doi_thong'] as ChatHeoType[]).map(type => {
                  const isSelected = chongTypes.includes(type);
                  const count = chongCounts[type] || 1;
                  const isDisabled = isHeoTypeDisabled(type);
                  const maxCount = getMaxForType(type);
                  const isHeoType = type === 'heo_den' || type === 'heo_do';
                  
                  return (
                    <View key={type} style={styles.chongTypeRow}>
                      <TouchableOpacity
                        disabled={isDisabled}
                        style={[
                          styles.chongTypeButton,
                          {
                            backgroundColor: isSelected ? theme.primary : theme.surface,
                            flex: 1,
                            opacity: isDisabled ? 0.4 : 1,
                          },
                        ]}
                        onPress={() => toggleChongType(type)}
                      >
                        <View style={styles.chongTypeLabelRow}>
                          <Text
                            style={[
                              styles.chongTypeText,
                              { color: isSelected ? '#FFF' : (isDisabled ? '#999' : theme.text) },
                            ]}
                          >
                            {i18n.t(type)}
                          </Text>
                          {isHeoType && (
                            <Text style={[styles.remainingBadge, { color: isDisabled ? '#999' : theme.textSecondary }]}>
                              {type === 'heo_den' ? remaining.den : remaining.do}/2
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>
                      {isSelected && (
                        <View style={styles.chongCountRow}>
                          <TouchableOpacity
                            style={[styles.smallCounterButton, { backgroundColor: theme.error }]}
                            onPress={() => updateChongCount(type, -1)}
                            disabled={count <= 1}
                          >
                            <Ionicons name="remove" size={16} color="#FFF" />
                          </TouchableOpacity>
                          <Text style={[styles.smallCounterValue, { color: theme.text }]}>
                            {count}
                          </Text>
                          <TouchableOpacity
                            style={[styles.smallCounterButton, { backgroundColor: count >= maxCount ? theme.border : theme.success }]}
                            onPress={() => updateChongCount(type, 1)}
                            disabled={count >= maxCount}
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
                {activeMatch.playerIds.filter(id => id !== selectedPlayer).map(targetId => {
                  const targetIndex = activeMatch.playerIds.indexOf(targetId);
                  const targetName = activeMatch.playerNames[targetIndex];
                  const isKilled = isPlayerKilled(targetId);
                  return (
                    <TouchableOpacity
                      key={targetId}
                      disabled={isKilled}
                      style={[
                        styles.targetButton,
                        {
                          backgroundColor: chongTarget === targetId ? theme.primary : theme.surface,
                          opacity: isKilled ? 0.5 : 1,
                        },
                      ]}
                      onPress={() => setChongTarget(targetId)}
                    >
                      <View style={styles.targetButtonInner}>
                        {isKilled && <Ionicons name="skull" size={16} color="#999" style={{ marginRight: 8 }} />}
                        <Text
                          style={[
                            styles.targetButtonText,
                            { color: chongTarget === targetId ? '#FFF' : (isKilled ? '#999' : theme.text) },
                          ]}
                        >
                          {targetName}
                        </Text>
                        {isKilled && <Text style={styles.killedBadge}>Đã bị giết</Text>}
                      </View>
                    </TouchableOpacity>
                  );
                })}

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: theme.border, flex: 1, marginRight: 8 }]}
                    onPress={() => setModalStep('select_type')}
                  >
                    <Text style={styles.modalButtonText}>{i18n.t('back')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: theme.primary, flex: 1 }]}
                    onPress={saveAction}
                  >
                    <Text style={styles.modalButtonText}>{i18n.t('save')}</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
              );
            })()}

            {/* NEW: Multi-step Giết Modal - Step 1: Select Victim */}
            {modalStep === 'giet_select_victim' && (
              <ScrollView>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Chọn người bị giết</Text>
                <Text style={[styles.label, { color: theme.textSecondary }]}>
                  Chọn nạn nhân để thêm phạt:
                </Text>
                
                {getAvailableTargets().map(targetId => {
                  const targetName = getPlayerName(targetId);
                  const victimData = gietVictims.find(v => v.targetId === targetId);
                  const isCompleted = victimData?.completed || false;
                  
                  return (
                    <TouchableOpacity
                      key={targetId}
                      style={[
                        styles.targetButton,
                        {
                          backgroundColor: isCompleted ? theme.success : theme.surface,
                          opacity: isCompleted ? 0.8 : 1,
                        },
                      ]}
                      onPress={() => selectGietVictim(targetId)}
                    >
                      <View style={styles.victimButtonContent}>
                        {isCompleted && (
                          <Ionicons name="checkmark-circle" size={20} color="#FFF" style={{ marginRight: 8 }} />
                        )}
                        <Text
                          style={[
                            styles.targetButtonText,
                            { color: isCompleted ? '#FFF' : theme.text, flex: 1 },
                          ]}
                        >
                          {targetName}
                        </Text>
                        {isCompleted && victimData?.penalties && victimData.penalties.length > 0 && (
                          <Text style={[styles.penaltyBadge, { color: '#FFF' }]}>
                            +{victimData.penalties.reduce((sum, p) => sum + p.count, 0)} phạt
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: theme.border, flex: 1, marginRight: 8 }]}
                    onPress={closePenaltyModal}
                  >
                    <Text style={styles.modalButtonText}>Quay lại</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modalButton, 
                      { 
                        backgroundColor: gietVictims.length > 0 ? theme.primary : theme.border, 
                        flex: 1,
                        opacity: gietVictims.length > 0 ? 1 : 0.5,
                      }
                    ]}
                    onPress={saveAllGietActions}
                    disabled={gietVictims.length === 0}
                  >
                    <Text style={styles.modalButtonText}>Lưu ({gietVictims.length})</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}

            {/* NEW: Multi-step Giết Modal - Step 2: Select Penalties */}
            {modalStep === 'giet_select_penalty' && currentGietVictim && (
              <ScrollView>
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  Phạt thêm cho {getPlayerName(currentGietVictim)}
                </Text>
                
                <Text style={[styles.label, { color: theme.textSecondary }]}>
                  Chọn loại phạt (nếu có):
                </Text>
                
                {config.enablePenalties && (() => {
                  const remaining = getRemainingHeo();
                  
                  // Check if penalty type is heo and if it's exhausted
                  const isHeoTypeDisabled = (type: PenaltyType): boolean => {
                    if (type === 'heo_den') return remaining.den === 0;
                    if (type === 'heo_do') return remaining.do === 0;
                    return false;
                  };
                  
                  const getMaxForType = (type: PenaltyType): number => {
                    if (type === 'heo_den') return remaining.den;
                    if (type === 'heo_do') return remaining.do;
                    return 99;
                  };
                  
                  return (
                  <>
                    {(['heo_den', 'heo_do', 'ba_tep', 'ba_doi_thong', 'tu_quy'] as PenaltyType[]).map(type => {
                      const penalty = currentGietPenalties.find(p => p.type === type);
                      const count = penalty?.count || 0;
                      const coefficient = getPenaltyCoefficient(type);
                      const isDisabled = isHeoTypeDisabled(type);
                      const maxCount = getMaxForType(type);
                      const isHeoType = type === 'heo_den' || type === 'heo_do';
                      
                      return (
                        <View key={type} style={[styles.penaltyRow, isDisabled && { opacity: 0.4 }]}>
                          <View style={{ flex: 1 }}>
                            <View style={styles.chongTypeLabelRow}>
                              <Text style={[styles.penaltyLabel, { color: isDisabled ? '#999' : theme.text }]}>
                                {i18n.t(type)}
                              </Text>
                              {isHeoType && (
                                <Text style={[styles.remainingBadge, { color: isDisabled ? '#999' : theme.textSecondary }]}>
                                  {type === 'heo_den' ? remaining.den : remaining.do}/2
                                </Text>
                              )}
                            </View>
                            <Text style={[styles.penaltyCoefficient, { color: theme.textSecondary }]}>
                              Hệ số: -{coefficient}
                            </Text>
                          </View>
                          <View style={styles.penaltyCountRow}>
                            <TouchableOpacity
                              style={[styles.smallCounterButton, { backgroundColor: count > 0 ? theme.error : theme.border }]}
                              onPress={() => removeCurrentGietPenalty(type)}
                              disabled={count === 0}
                            >
                              <Ionicons name="remove" size={16} color="#FFF" />
                            </TouchableOpacity>
                            <Text style={[styles.smallCounterValue, { color: theme.text }]}>
                              {count}
                            </Text>
                            <TouchableOpacity
                              style={[styles.smallCounterButton, { backgroundColor: (isDisabled || count >= maxCount) ? theme.border : theme.success }]}
                              onPress={() => addCurrentGietPenalty(type)}
                              disabled={isDisabled || count >= maxCount}
                            >
                              <Ionicons name="add" size={16} color="#FFF" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })}
                  </>
                  );
                })()}

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: theme.border, flex: 1, marginRight: 8 }]}
                    onPress={() => setModalStep('giet_select_victim')}
                  >
                    <Text style={styles.modalButtonText}>Thoát</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: theme.primary, flex: 1 }]}
                    onPress={confirmCurrentGietPenalty}
                  >
                    <Text style={styles.modalButtonText}>Lưu phạt</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}

            {/* NEW: Multi-step Giết Modal - Step 3: Confirm Penalties */}
            {modalStep === 'giet_confirm_penalty' && currentGietVictim && (
              <ScrollView>
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  Xác nhận phạt cho {getPlayerName(currentGietVictim)}
                </Text>
                
                {currentGietPenalties.length > 0 ? (
                  <>
                    <View style={styles.confirmPenaltyList}>
                      {currentGietPenalties.map(penalty => {
                        const coefficient = getPenaltyCoefficient(penalty.type);
                        const totalPoints = coefficient * penalty.count;
                        return (
                          <View key={penalty.type} style={styles.confirmPenaltyItem}>
                            <Text style={[styles.confirmPenaltyName, { color: theme.text }]}>
                              {i18n.t(penalty.type)}
                            </Text>
                            <Text style={[styles.confirmPenaltyDetails, { color: theme.textSecondary }]}>
                              x{penalty.count} = -{totalPoints} điểm
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                    
                    <View style={[styles.confirmTotalRow, { borderTopColor: theme.border }]}>
                      <Text style={[styles.confirmTotalLabel, { color: theme.text }]}>
                        Tổng phạt thêm:
                      </Text>
                      <Text style={[styles.confirmTotalValue, { color: theme.error }]}>
                        -{currentGietPenalties.reduce((sum, p) => sum + getPenaltyCoefficient(p.type) * p.count, 0)} điểm
                      </Text>
                    </View>
                  </>
                ) : (
                  <View style={styles.noPenaltyBox}>
                    <Ionicons name="checkmark-circle-outline" size={48} color={theme.success} />
                    <Text style={[styles.noPenaltyText, { color: theme.textSecondary }]}>
                      Không có phạt thêm
                    </Text>
                  </View>
                )}

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: theme.primary, flex: 1 }]}
                    onPress={saveCurrentVictimPenalty}
                  >
                    <Text style={styles.modalButtonText}>OK</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}

            {/* Legacy giet modal - kept for backwards compatibility */}
            {modalStep === 'giet' && (
              <ScrollView>
                <Text style={[styles.modalTitle, { color: theme.text }]}>{i18n.t('kill')}</Text>
                
                <Text style={[styles.label, { color: theme.textSecondary }]}>{i18n.t('killed')}</Text>
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
    </WallpaperBackground>
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
  playerAvatarImage: { width: 32, height: 32, borderRadius: 16 },
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
  buttonWrapper: { position: 'absolute', bottom: 20, left: 20, right: 20 },
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
  // Action list styles
  actionsListSection: { borderRadius: 10, padding: 12, marginTop: 12, marginBottom: 8 },
  actionsListHeader: { marginBottom: 12 },
  actionsListTitle: { fontSize: 16, fontWeight: 'bold' },
  actionListItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, gap: 10 },
  actionListIcon: { fontSize: 24 },
  actionListContent: { flex: 1 },
  actionListText: { fontSize: 14, fontWeight: '500' },
  actionListDetails: { fontSize: 12, marginTop: 2 },
  actionDeleteButton: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  // NEW: Multi-kill flow styles
  victimButtonContent: { flexDirection: 'row', alignItems: 'center' },
  penaltyBadge: { fontSize: 12, fontWeight: '500' },
  penaltyCoefficient: { fontSize: 12, marginTop: 2 },
  confirmPenaltyList: { marginVertical: 12 },
  confirmPenaltyItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, marginBottom: 8, backgroundColor: 'rgba(0,0,0,0.1)' },
  confirmPenaltyName: { fontSize: 14, fontWeight: '600' },
  confirmPenaltyDetails: { fontSize: 14 },
  confirmTotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, marginTop: 8, borderTopWidth: 1 },
  confirmTotalLabel: { fontSize: 16, fontWeight: '600' },
  confirmTotalValue: { fontSize: 18, fontWeight: 'bold' },
  noPenaltyBox: { alignItems: 'center', paddingVertical: 24 },
  noPenaltyText: { fontSize: 16, marginTop: 8 },
  // NEW: Heo constraint styles
  warningBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,165,0,0.15)', padding: 12, borderRadius: 8, marginBottom: 16, gap: 8 },
  warningText: { fontSize: 14, fontWeight: '500', flex: 1 },
  remainingBadge: { fontSize: 11, marginTop: 2 },
  targetButtonInner: { flexDirection: 'row', alignItems: 'center' },
  killedBadge: { fontSize: 11, color: '#999', marginLeft: 'auto' },
  chongTypeLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
});
