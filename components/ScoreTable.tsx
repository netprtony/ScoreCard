import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
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

type NavigationProp = NativeStackNavigationProp<
  MatchStackParamList,
  'RoundDetails'
>;

export const ScoreTable: React.FC<ScoreTableProps> = ({
  match,
  onUpdateRound,
  onDeleteRound,
  editable = false,
  caHeoEnabled = false,
}) => {
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const getRoundSum = (roundIndex: number): number => {
    const round = match.rounds[roundIndex];
    return Object.values(round.roundScores).reduce(
      (sum, score) => sum + score,
      0
    );
  };

  const getCaHeoPotForRound = (round: any): number => {
    if (round.actions && typeof round.actions === 'object') {
      const actions = round.actions as any;
      if (actions.outcome?.caHeoWinnerId) return 0;
      return actions.caHeoPot ?? 0;
    }
    return 0;
  };

  const handleRowPress = (roundId: string) => {
    if (!editable) return;
    const round = match.rounds.find((r) => r.id === roundId);
    if (!round) return;

    navigation.navigate('RoundDetails', {
      match,
      round,
      onUpdateRound,
      onDeleteRound,
    });
  };

  return (
    <View style={styles.root}>
      {/* GLASS CARD */}
      <View style={[styles.glassWrapper, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.3)' }]}>
        <BlurView
          intensity={Platform.OS === 'ios' ? 60 : 40}
          tint={isDark ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />

        {/* Overlay để glass rõ hơn */}
        <View style={[
          styles.glassOverlay, 
          { backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.18)' }
        ]} />

        {/* CONTENT */}
        <ScrollView horizontal showsHorizontalScrollIndicator>
          <View>
            {/* HEADER */}
            <View style={[
              styles.row, 
              styles.headerRow, 
              { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.25)' }
            ]}>
              <Cell text="Ván" bold color={theme.text} />
              <Cell text="Sum" bold color={theme.warning} />
              {caHeoEnabled && <Cell text="🐷 Heo" bold color={theme.success} />}
              {match.playerNames.map((name, i) => (
                <Cell key={i} text={name} bold color={theme.text} />
              ))}
            </View>

            {/* BODY */}
            <ScrollView nestedScrollEnabled>
              {match.rounds.map((round, roundIndex) => (
                <View key={round.id} style={styles.row}>
                  <TouchableOpacity
                    disabled={!editable}
                    onPress={() => handleRowPress(round.id)}
                  >
                    <Cell text={`Ván ${round.roundNumber}`} color={theme.text} />
                  </TouchableOpacity>

                  <Cell
                    text={String(getRoundSum(roundIndex))}
                    color={
                      getRoundSum(roundIndex) === 0
                        ? theme.success
                        : theme.error
                    }
                    bold
                  />

                  {caHeoEnabled && (
                    <Cell
                      text={String(getCaHeoPotForRound(round))}
                      color={theme.success}
                      bold
                    />
                  )}

                  {match.playerIds.map((playerId, i) => {
                    const score = round.roundScores[playerId] || 0;
                    return (
                      <Cell
                        key={i}
                        text={`${score >= 0 ? '+' : ''}${score}`}
                        color={score >= 0 ? theme.success : theme.error}
                      />
                    );
                  })}
                </View>
              ))}

              {/* TOTAL */}
              <View style={[
                styles.row, 
                styles.totalRow, 
                { backgroundColor: isDark ? 'rgba(7, 194, 153, 0.2)' : 'rgba(7, 194, 153, 0.3)' }
              ]}>
                <Cell text="Tổng" bold color={theme.text} />
                <Cell
                  text={String(
                    Object.values(match.totalScores).reduce(
                      (s, v) => s + v,
                      0
                    )
                  )}
                  bold
                  color={theme.text}
                />
                {caHeoEnabled && (
                  <Cell
                    text={String(
                      match.rounds.reduce(
                        (s, r) => s + getCaHeoPotForRound(r),
                        0
                      )
                    )}
                    color={theme.success}
                    bold
                  />
                )}
                {match.playerIds.map((id, i) => {
                  const total = match.totalScores[id] || 0;
                  return (
                    <Cell
                      key={i}
                      text={`${total >= 0 ? '+' : ''}${total}`}
                      color={total >= 0 ? theme.success : theme.error}
                      bold
                    />
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

/* ===================== */
/* CELL COMPONENT */
/* ===================== */
const Cell: React.FC<{
  text: string;
  bold?: boolean;
  color?: string;
}> = ({ text, bold, color }) => (
  <View style={styles.cell}>
    <Text
      numberOfLines={1}
      style={[
        styles.cellText,
        bold && styles.bold,
        color && { color },
      ]}
    >
      {text}
    </Text>
  </View>
);

/* ===================== */
/* STYLES */
/* ===================== */
const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  glassWrapper: {
    overflow: 'hidden',
  },

  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
  },

  row: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.15)',
  },

  headerRow: {
  },

  totalRow: {
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },

  cell: {
    width: 85,
    paddingVertical: 14,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cellText: {
    fontSize: 13,
  },

  bold: {
    fontWeight: '700',
  },
});

