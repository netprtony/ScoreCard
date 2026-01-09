import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Match } from '../types/models';

interface ScoreTableProps {
  match: Match;
}

export const ScoreTable: React.FC<ScoreTableProps> = ({ match }) => {
  const { theme } = useTheme();

  // Calculate sum for each round
  const getRoundSum = (roundIndex: number): number => {
    const round = match.rounds[roundIndex];
    return Object.values(round.roundScores).reduce((sum, score) => sum + score, 0);
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.container}>
      <View>
        {/* Header Row */}
        <View style={styles.row}>
          <View style={[styles.cell, styles.headerCell, { backgroundColor: theme.surface }]}>
            <Text style={[styles.headerText, { color: theme.text }]}>Ván</Text>
          </View>
          {match.playerNames.map((name, index) => (
            <View key={index} style={[styles.cell, styles.headerCell, { backgroundColor: theme.surface }]}>
              <Text style={[styles.headerText, { color: theme.text }]} numberOfLines={1}>
                {name}
              </Text>
            </View>
          ))}
          <View style={[styles.cell, styles.headerCell, { backgroundColor: theme.warning + '20' }]}>
            <Text style={[styles.headerText, { color: theme.warning }]}>Sum</Text>
          </View>
        </View>

        {/* Round Rows */}
        {match.rounds.map((round, roundIndex) => (
          <View key={round.id} style={styles.row}>
            <View style={[styles.cell, { backgroundColor: theme.surface }]}>
              <Text style={[styles.cellText, { color: theme.text }]}>
                Ván {round.roundNumber}
              </Text>
            </View>
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
            <View style={[styles.cell, { backgroundColor: theme.warning + '10' }]}>
              <Text
                style={[
                  styles.cellText,
                  { color: getRoundSum(roundIndex) === 0 ? theme.success : theme.error },
                ]}
              >
                {getRoundSum(roundIndex)}
              </Text>
            </View>
          </View>
        ))}

        {/* Total Row */}
        <View style={[styles.row, styles.totalRow]}>
          <View style={[styles.cell, styles.totalCell, { backgroundColor: theme.primary + '20' }]}>
            <Text style={[styles.headerText, { color: theme.primary }]}>Tổng</Text>
          </View>
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
          <View style={[styles.cell, styles.totalCell, { backgroundColor: theme.primary + '10' }]}>
            <Text style={[styles.cellText, { color: theme.primary }]}>
              {Object.values(match.totalScores).reduce((sum, score) => sum + score, 0)}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: 400,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  cell: {
    width: 80,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderColor: '#E0E0E0',
  },
  headerCell: {
    paddingVertical: 16,
  },
  totalCell: {
    paddingVertical: 16,
  },
  totalRow: {
    borderTopWidth: 2,
    borderColor: '#2196F3',
  },
  headerText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  cellText: {
    fontSize: 14,
  },
  scoreText: {
    fontWeight: '600',
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
