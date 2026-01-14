import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { Match } from '../types/models';
import { MatchStackParamList } from '../types/navigation';

interface ScoreTableProps {
  match: Match;
  onUpdateRound?: (roundId: string, scores: { [playerId: string]: number }) => void;
  onDeleteRound?: (roundId: string) => void;
  editable?: boolean;
  caHeoEnabled?: boolean;
}

type NavigationProp = NativeStackNavigationProp<MatchStackParamList, 'RoundDetails'>;

export const ScoreTable: React.FC<ScoreTableProps> = ({ 
  match, 
  onUpdateRound,
  onDeleteRound,
  editable = false,
  caHeoEnabled = false
}) => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  // Calculate sum for each round
  const getRoundSum = (roundIndex: number): number => {
    const round = match.rounds[roundIndex];
    return Object.values(round.roundScores).reduce((sum, score) => sum + score, 0);
  };

  // Extract Cá Heo pot from round data
  const getCaHeoPotForRound = (round: any): number => {
    // For Sắc Tê rounds, pot info is stored in actions field
    if (round.actions && typeof round.actions === 'object') {
      const actions = round.actions as any;
      if (actions.outcome?.caHeoWinnerId) {
        // Someone won the pot this round, show 0
        return 0;
      }
      // Check if pot data is stored
      return actions.caHeoPot ?? 0;
    }
    return 0;
  };

  const handleRowPress = (roundId: string) => {
    if (!editable) return;
    
    const round = match.rounds.find(r => r.id === roundId);
    if (!round) return;

    // Navigate to RoundDetailsScreen
    navigation.navigate('RoundDetails', {
      match,
      round,
      onUpdateRound,
      onDeleteRound,
    });
  };

  return (
    <View style={styles.tableWrapper}>
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
      >
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={true}
          contentContainerStyle={styles.contentContainer}
        >
          <View>
            {/* Header Row */}
            <View style={styles.row}>
              <View style={[styles.cell, styles.headerCell, { backgroundColor: theme.surface }]}>
                <Text style={[styles.headerText, { color: theme.text }]}>Ván</Text>
              </View>
              <View style={[styles.cell, styles.headerCell, { backgroundColor: theme.warning + '20' }]}>
                <Text style={[styles.headerText, { color: theme.warning }]}>Sum</Text>
              </View>
              
              {/* Heo column */}
              {caHeoEnabled && (
                <View style={[styles.cell, styles.headerCell, { backgroundColor: theme.success + '20' }]}>
                  <Text style={[styles.headerText, { color: theme.success }]}>🐷 Heo</Text>
                </View>
              )}
              
              {match.playerNames.map((name, index) => (
                <View
                  key={index}
                  style={[styles.cell, styles.headerCell, { backgroundColor: theme.surface }]}
                >
                  <Text style={[styles.headerText, { color: theme.text }]} numberOfLines={1}>
                    {name}
                  </Text>
                </View>
              ))}
            </View>

            {/* Round Rows */}
            {match.rounds.map((round, roundIndex) => (
              <View
                key={round.id}
                style={styles.row}
              >
                {/* Only the first column (Ván) is touchable */}
                <TouchableOpacity 
                  style={[styles.cell, { backgroundColor: theme.surface }]}
                  onPress={() => handleRowPress(round.id)}
                  disabled={!editable}
                >
                  <Text style={[styles.cellText, { color: theme.text }]}>
                    Ván {round.roundNumber}
                  </Text>
                </TouchableOpacity>
                
                {/* Sum column - not touchable */}
                <View style={[styles.cell, { backgroundColor: theme.warning + '10' }]}>
                  <Text
                    style={[
                      styles.cellText,
                      styles.sumText,
                      { color: getRoundSum(roundIndex) === 0 ? theme.success : theme.error },
                    ]}
                  >
                    {getRoundSum(roundIndex)}
                  </Text>
                </View>
                
                {/* Heo column - not touchable */}
                {caHeoEnabled && (
                  <View style={[styles.cell, { backgroundColor: theme.success + '10' }]}>
                    <Text style={[styles.cellText, { color: theme.success, fontWeight: '600' }]}>
                      {getCaHeoPotForRound(round)}
                    </Text>
                  </View>
                )}
                
                {/* Player score columns - not touchable */}
                {match.playerIds.map((playerId, playerIndex) => {
                  const score = round.roundScores[playerId] || 0;
                  return (
                    <View key={playerIndex} style={[styles.cell, { backgroundColor: theme.card }]}>
                      <Text
                        style={[
                          styles.cellText,
                          styles.scoreText,
                          { color: score >= 0 ? theme.success : theme.error },
                        ]}
                      >
                        {score >= 0 ? '+' : ''}
                        {score}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ))}

            {/* Total Row */}
            <View style={[styles.row, styles.totalRow]}>
              <View style={[styles.cell, styles.totalCell, { backgroundColor: theme.primary + '20' }]}>
                <Text style={[styles.headerText, { color: theme.primary }]}>Tổng</Text>
              </View>
              <View style={[styles.cell, styles.totalCell, { backgroundColor: theme.primary + '10' }]}>
                <Text style={[styles.cellText, styles.totalText, { color: theme.primary }]}>
                  {Object.values(match.totalScores).reduce((sum, score) => sum + score, 0)}
                </Text>
              </View>
              {caHeoEnabled && (
                <View style={[styles.cell, styles.totalCell, { backgroundColor: theme.primary + '10' }]}>
                  <Text style={[styles.cellText, styles.totalText, { color: theme.success }]}>
                    {match.rounds.reduce((sum, round) => sum + getCaHeoPotForRound(round), 0)}
                  </Text>
                </View>
              )}
              {match.playerIds.map((playerId, index) => {
                const total = match.totalScores[playerId] || 0;
                return (
                  <View key={index} style={[styles.cell, styles.totalCell, { backgroundColor: theme.primary + '10' }]}>
                    <Text
                      style={[
                        styles.cellText,
                        styles.totalText,
                        { color: total >= 0 ? theme.success : theme.error },
                      ]}
                    >
                      {total >= 0 ? '+' : ''}
                      {total}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  tableWrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 4,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  cell: {
    width: 70,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderColor: '#E0E0E0',
  },
  headerCell: {
    paddingVertical: 12,
  },
  totalCell: {
    paddingVertical: 12,
  },
  totalRow: {
    borderTopWidth: 2,
    borderColor: '#2196F3',
  },
  headerText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  cellText: {
    fontSize: 13,
  },
  scoreText: {
    fontWeight: '600',
  },
  sumText: {
    fontWeight: 'bold',
  },
  totalText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
});
