import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, LayoutAnimation, Platform, UIManager, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Match, Round, Player } from '../types/models';
import { formatActionDescription, formatToiTrangAction } from '../utils/actionFormatter';
import { showSuccess, showWarning } from '../utils/toast';
import { getPlayerById } from '../services/playerService';
import i18n from '../utils/i18n';
// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const RoundDetailsScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { match, round, onUpdateRound, onDeleteRound } = route.params as {
    match: Match;
    round: Round;
    onUpdateRound: (roundId: string, scores: { [playerId: string]: number }) => void;
    onDeleteRound: (roundId: string) => void;
  };

  const [editedScores, setEditedScores] = useState<{ [playerId: string]: string }>(() => {
    const scores: { [playerId: string]: string } = {};
    match.playerIds.forEach(id => {
      scores[id] = (round.roundScores[id] || 0).toString();
    });
    return scores;
  });
  
  const [expandedActionId, setExpandedActionId] = useState<string | null>(null);
  const [players, setPlayers] = useState<{ [playerId: string]: Player }>({});

  // Load player data for avatars
  useEffect(() => {
    const playerData: { [playerId: string]: Player } = {};
    match.playerIds.forEach(id => {
      const player = getPlayerById(id);
      if (player) {
        playerData[id] = player;
      }
    });
    setPlayers(playerData);
  }, [match.playerIds]);

  const toggleActionExpand = (actionId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedActionId(expandedActionId === actionId ? null : actionId);
  };

  // Calculate score breakdown for an action
  const getActionScoreBreakdown = (actionId: string): { playerId: string; playerName: string; score: number }[] => {
    if (actionId === 'toi-trang' && round.toiTrangWinner) {
      // Tới Trắng: winner gets positive, others split negative
      const winnerScore = round.roundScores[round.toiTrangWinner] || 0;
      const totalLoss = -winnerScore;
      const losersCount = match.playerIds.length - 1;
      const lossPerPlayer = losersCount > 0 ? Math.floor(totalLoss / losersCount) : 0;
      
      return match.playerIds.map((id, idx) => ({
        playerId: id,
        playerName: match.playerNames[idx],
        score: id === round.toiTrangWinner ? winnerScore : -lossPerPlayer,
      }));
    }
    
    // For other actions, find the action and calculate
    const actionIndex = parseInt(actionId.replace('action-', ''));
    const action = round.actions[actionIndex];
    if (!action) return [];
    
    const config = match.configSnapshot;
    const breakdown: { playerId: string; playerName: string; score: number }[] = [];
    
    match.playerIds.forEach((id, idx) => {
      let score = 0;
      
      if (action.actionType === 'heo') {
        // Chặt Heo: actor gains, target loses
        const penaltyValue = action.heoType === 'den' ? config.chatHeoBlack : config.chatHeoRed;
        const totalPenalty = penaltyValue * (action.heoCount || 1);
        
        if (id === action.actorId) score = totalPenalty;
        else if (id === action.targetId) score = -totalPenalty;
      } else if (action.actionType === 'chong') {
        // Chồng: actor gains, target loses
        let totalPenalty = 0;
        action.chongTypes?.forEach(type => {
          const count = action.chongCounts?.[type] || 1;
          const baseValue = type === 'heo_den' ? config.penaltyHeoDen : 
                           type === 'heo_do' ? config.penaltyHeoDo :
                           type === 'ba_doi_thong' ? config.penaltyBaDoiThong :
                           type === 'tu_quy' ? config.penaltyTuQuy : 0;
          totalPenalty += baseValue * count;
        });
        
        if (id === action.actorId) score = totalPenalty;
        else if (id === action.targetId) score = -totalPenalty;
      } else if (action.actionType === 'dut_ba_tep') {
        const penalty = config.penaltyBaTep || 0;
        if (id === action.actorId) score = penalty;
        else if (id === action.targetId) score = -penalty;
      } else if (action.actionType === 'giet') {
        // Giết: more complex, use round scores
        score = round.roundScores[id] || 0;
      }
      
      breakdown.push({
        playerId: id,
        playerName: match.playerNames[idx],
        score,
      });
    });
    
    return breakdown.filter(b => b.score !== 0);
  };

  const handleSave = () => {
    // Convert strings to numbers
    const scores: { [playerId: string]: number } = {};
    let hasError = false;
    
    match.playerIds.forEach(id => {
      const value = parseInt(editedScores[id]);
      if (isNaN(value)) {
        hasError = true;
      } else {
        scores[id] = value;
      }
    });

    if (hasError) {
      showWarning(i18n.t('error'), 'Vui lòng nhập số hợp lệ');
      return;
    }

    // Validate sum equals zero
    const sum = Object.values(scores).reduce((a, b) => a + b, 0);
    
    if (sum !== 0) {
      Alert.alert(
        i18n.t('warning'),
        `${i18n.t('scoreSumNotZero')} (${i18n.t('roundTotal')}: ${sum}). ${i18n.t('stillWantToSave')}`,
        [
          { text: i18n.t('cancel'), style: 'cancel' },
          {
            text: i18n.t('save'),
            onPress: () => {
              onUpdateRound(round.id, scores);
              navigation.goBack();
            },
          },
        ]
      );
    } else {
      onUpdateRound(round.id, scores);
      navigation.goBack();
    }
  };

  const handleDelete = () => {
    Alert.alert(
      i18n.t('deleteRound'),
      i18n.t('confirmDeleteRound'),
      [
        { text: i18n.t('cancel'), style: 'cancel' },
        {
          text: i18n.t('delete'),
          style: 'destructive',
          onPress: () => {
            onDeleteRound(round.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {i18n.t('round')} {round.roundNumber}
        </Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Ionicons name="trash" size={24} color={theme.error} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Actions Section */}
        {(round.toiTrangWinner || (Array.isArray(round.actions) && round.actions.length > 0)) && (
          <View style={[styles.section, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              📊 {i18n.t('actions')}
            </Text>
            
            <ScrollView style={styles.actionsList} nestedScrollEnabled showsVerticalScrollIndicator={true}>
              {/* Tới Trắng */}
              {round.toiTrangWinner && (() => {
                const winnerIndex = match.playerIds.indexOf(round.toiTrangWinner);
                const winnerName = match.playerNames[winnerIndex];
                const winnerScore = round.roundScores[round.toiTrangWinner] || 0;
                const formatted = formatToiTrangAction(winnerName, winnerScore);
                const isExpanded = expandedActionId === 'toi-trang';
                const breakdown = isExpanded ? getActionScoreBreakdown('toi-trang') : [];
                
                return (
                  <View key="toi-trang">
                    <TouchableOpacity 
                      style={[styles.actionItem, { borderLeftColor: formatted.color, backgroundColor: theme.surface }]}
                      onPress={() => toggleActionExpand('toi-trang')}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.actionIcon}>{formatted.icon}</Text>
                      <View style={styles.actionContent}>
                        <Text style={[styles.actionText, { color: theme.text }]}>
                          {formatted.text}
                        </Text>
                        <Text style={[styles.tapHint, { color: theme.textSecondary }]}>
                          {i18n.t('tapToViewDetails')}
                        </Text>
                      </View>
                      <Ionicons 
                        name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                        size={20} 
                        color={theme.textSecondary} 
                      />
                    </TouchableOpacity>
                    {isExpanded && (
                      <View style={[styles.breakdownContainer, { backgroundColor: theme.background }]}>
                        {breakdown.map(item => (
                          <View key={item.playerId} style={styles.breakdownRow}>
                            <Text style={[styles.breakdownName, { color: theme.text }]}>{item.playerName}</Text>
                            <Text style={[styles.breakdownScore, { color: item.score >= 0 ? '#4CAF50' : '#F44336' }]}>
                              {item.score >= 0 ? `+${item.score}` : item.score}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })()}
              
              {/* Other Actions */}
              {Array.isArray(round.actions) && round.actions.map((action, idx) => {
                const actorIndex = match.playerIds.indexOf(action.actorId);
                const actorName = match.playerNames[actorIndex];
                const targetIndex = action.targetId ? match.playerIds.indexOf(action.targetId) : -1;
                const targetName = targetIndex >= 0 ? match.playerNames[targetIndex] : '';
                
                // Calculate score change for this action
                let scoreChange = 0;
                if (action.actionType === 'giet' && action.targetId) {
                  scoreChange = round.roundScores[action.actorId] || 0;
                } else if (action.targetId) {
                  scoreChange = round.roundScores[action.actorId] || 0;
                }
                
                const formatted = formatActionDescription(action, actorName, targetName, scoreChange);
                const actionId = `action-${idx}`;
                const isExpanded = expandedActionId === actionId;
                const breakdown = isExpanded ? getActionScoreBreakdown(actionId) : [];
                
                return (
                  <View key={actionId}>
                    <TouchableOpacity 
                      style={[styles.actionItem, { borderLeftColor: formatted.color, backgroundColor: theme.surface }]}
                      onPress={() => toggleActionExpand(actionId)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.actionIcon}>{formatted.icon}</Text>
                      <View style={styles.actionContent}>
                        <Text style={[styles.actionText, { color: theme.text }]}>
                          {formatted.text}
                        </Text>
                        {formatted.details && (
                          <Text style={[styles.actionDetails, { color: theme.textSecondary }]}>
                            {formatted.details}
                          </Text>
                        )}
                        <Text style={[styles.tapHint, { color: theme.textSecondary }]}>
                          {i18n.t('tapToViewDetails')}
                        </Text>
                      </View>
                      <Ionicons 
                        name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                        size={20} 
                        color={theme.textSecondary} 
                      />
                    </TouchableOpacity>
                    {isExpanded && breakdown.length > 0 && (
                      <View style={[styles.breakdownContainer, { backgroundColor: theme.background }]}>
                        {breakdown.map(item => (
                          <View key={item.playerId} style={styles.breakdownRow}>
                            <Text style={[styles.breakdownName, { color: theme.text }]}>{item.playerName}</Text>
                            <Text style={[styles.breakdownScore, { color: item.score >= 0 ? '#4CAF50' : '#F44336' }]}>
                              {item.score >= 0 ? `+${item.score}` : item.score}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
              
              {/* Sắc Tê Actions: Cá Nước & Cá Heo */}
              {!Array.isArray(round.actions) && round.actions && typeof round.actions === 'object' && (() => {
                const actions = round.actions as any;
                const outcome = actions.outcome;
                
                if (!outcome) return null;
                
                const sacTeActions = [];
                
                // Cá Nước Action
                if (outcome.caNuocWinnerId) {
                  const winnerIndex = match.playerIds.indexOf(outcome.caNuocWinnerId);
                  const winnerName = match.playerNames[winnerIndex];
                  const numberOfPlayers = match.playerIds.length;
                  const config = match.configSnapshot as any;
                  const caNuocBonus = (numberOfPlayers - 1) * (config.caNuoc?.heSo || 5);
                  
                  sacTeActions.push(
                    <View key="ca-nuoc">
                      <TouchableOpacity 
                        style={[styles.actionItem, { borderLeftColor: theme.primary, backgroundColor: theme.surface }]}
                        onPress={() => toggleActionExpand('ca-nuoc')}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.actionIcon}>💰</Text>
                        <View style={styles.actionContent}>
                          <Text style={[styles.actionText, { color: theme.text }]}>
                            {winnerName} ăn Cá Nước
                          </Text>
                          <Text style={[styles.actionDetails, { color: theme.textSecondary }]}>
                            +{caNuocBonus} điểm
                          </Text>
                          <Text style={[styles.tapHint, { color: theme.textSecondary }]}>
                            {i18n.t('tapToViewDetails')}
                          </Text>
                        </View>
                        <Ionicons 
                          name={expandedActionId === 'ca-nuoc' ? 'chevron-up' : 'chevron-down'} 
                          size={20} 
                          color={theme.textSecondary} 
                        />
                      </TouchableOpacity>
                      {expandedActionId === 'ca-nuoc' && (
                        <View style={[styles.breakdownContainer, { backgroundColor: theme.background }]}>
                          {match.playerIds.map((playerId, idx) => {
                            const playerName = match.playerNames[idx];
                            const score = playerId === outcome.caNuocWinnerId 
                              ? caNuocBonus 
                              : -(config.caNuoc?.heSo || 5);
                            return (
                              <View key={playerId} style={styles.breakdownRow}>
                                <Text style={[styles.breakdownName, { color: theme.text }]}>{playerName}</Text>
                                <Text style={[styles.breakdownScore, { color: score >= 0 ? '#4CAF50' : '#F44336' }]}>
                                  {score >= 0 ? `+${score}` : score}
                                </Text>
                              </View>
                            );
                          })}
                        </View>
                      )}
                    </View>
                  );
                }
                
                // Cá Heo Action
                if (outcome.caHeoWinnerId) {
                  const winnerIndex = match.playerIds.indexOf(outcome.caHeoWinnerId);
                  const winnerName = match.playerNames[winnerIndex];
                  const config = match.configSnapshot as any;
                  const caHeoPot = actions.caHeoPot || 0;
                  
                  sacTeActions.push(
                    <View key="ca-heo">
                      <TouchableOpacity 
                        style={[styles.actionItem, { borderLeftColor: theme.success, backgroundColor: theme.surface }]}
                        onPress={() => toggleActionExpand('ca-heo')}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.actionIcon}>🐷</Text>
                        <View style={styles.actionContent}>
                          <Text style={[styles.actionText, { color: theme.text }]}>
                            {winnerName} ăn Cá Heo
                          </Text>
                          <Text style={[styles.actionDetails, { color: theme.textSecondary }]}>
                            Pot: {caHeoPot} điểm
                          </Text>
                          <Text style={[styles.tapHint, { color: theme.textSecondary }]}>
                            {i18n.t('tapToViewDetails')}
                          </Text>
                        </View>
                        <Ionicons 
                          name={expandedActionId === 'ca-heo' ? 'chevron-up' : 'chevron-down'} 
                          size={20} 
                          color={theme.textSecondary} 
                        />
                      </TouchableOpacity>
                      {expandedActionId === 'ca-heo' && (
                        <View style={[styles.breakdownContainer, { backgroundColor: theme.background }]}>
                          <Text style={[styles.breakdownName, { color: theme.textSecondary, marginBottom: 8 }]}>
                            Pot đã reset về 0 sau ván này
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                }
                
                return sacTeActions;
              })()}
            </ScrollView>
          </View>
        )}

        {/* Rank Results Section */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            🏆 {i18n.t('matchResults')}
          </Text>
          
          {(() => {
            // Helper to get rank label
            const getRankLabel = (rank: number) => {
              switch(rank) {
                case 1: return i18n.t('first');
                case 2: return i18n.t('second');
                case 3: return i18n.t('third');
                case 4: return i18n.t('fourth');
                default: return '';
              }
            };

            // Get rank color
            const getRankColor = (rank: number) => {
              switch(rank) {
                case 1: return '#FFD700';
                case 2: return '#C0C0C0';
                case 3: return '#CD7F32';
                case 4: return '#666666';
                default: return theme.text;
              }
            };

            // Build sorted players by rank
            const sortedPlayers = match.playerIds
              .map((id, idx) => {
                const rankEntry = round.rankings?.find(r => r.playerId === id);
                return {
                  id,
                  name: match.playerNames[idx],
                  score: round.roundScores[id] || 0,
                  rank: rankEntry?.rank || 4,
                };
              })
              .sort((a, b) => a.rank - b.rank);

            return sortedPlayers.map((player, idx) => {
              const playerInfo = players[player.id];
              return (
                <View key={player.id} style={[styles.rankResultRow, { borderBottomColor: theme.border }]}>
                  <View style={[styles.rankBadge, { backgroundColor: getRankColor(player.rank) }]}>
                    <Text style={styles.rankBadgeText}>{player.rank}</Text>
                  </View>
                  <View style={[styles.playerAvatar, { backgroundColor: playerInfo?.color || theme.primary }]}>
                    {playerInfo?.avatar ? (
                      <Image source={{ uri: playerInfo.avatar }} style={styles.playerAvatarImage} />
                    ) : (
                      <Text style={styles.playerAvatarText}>{player.name.charAt(0).toUpperCase()}</Text>
                    )}
                  </View>
                  <View style={styles.rankResultInfo}>
                    <Text style={[styles.rankResultName, { color: playerInfo?.color || theme.text }]}>{player.name}</Text>
                    <Text style={[styles.rankResultLabel, { color: theme.textSecondary }]}>
                      ({getRankLabel(player.rank)})
                    </Text>
                  </View>
                  <Text style={[styles.rankResultScore, { color: player.score >= 0 ? '#4CAF50' : '#F44336' }]}>
                    {player.score >= 0 ? `+${player.score}` : player.score}
                  </Text>
                </View>
              );
            });
          })()}
        </View>

        {/* Scores Section */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            📝 {i18n.t('totalScoreChange')}
          </Text>
          
          {match.playerIds.map((playerId, index) => {
            const playerName = match.playerNames[index];
            return (
              <View key={playerId} style={styles.scoreInputRow}>
                <Text style={[styles.playerLabel, { color: theme.text }]}>{playerName}:</Text>
                <TextInput
                  style={[styles.scoreInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                  value={editedScores[playerId] || '0'}
                  onChangeText={(text) => setEditedScores({ ...editedScores, [playerId]: text })}
                  keyboardType="numeric"
                />
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={[styles.footer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.primary }]}
          onPress={handleSave}
        >
          <Ionicons name="checkmark" size={24} color="#FFF" />
          <Text style={styles.saveButtonText}>{i18n.t('save')} {i18n.t('edit')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  deleteButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  actionsList: {
    maxHeight: 300,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  actionIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  actionDetails: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  actionScore: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  tapHint: {
    fontSize: 11,
    marginTop: 2,
  },
  breakdownContainer: {
    marginLeft: 40,
    marginRight: 12,
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  breakdownName: {
    fontSize: 14,
    fontWeight: '500',
  },
  breakdownScore: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  rankResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankBadgeText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  playerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  playerAvatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  playerAvatarText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  rankResultInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rankResultName: {
    fontSize: 16,
    fontWeight: '600',
  },
  rankResultLabel: {
    fontSize: 14,
  },
  rankResultScore: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scoreInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  playerLabel: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  scoreInput: {
    width: 100,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    textAlign: 'center',
    borderWidth: 1,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
