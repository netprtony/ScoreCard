import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { MatchPlayerResult } from '../types/models';
import i18n from '../utils/i18n';

interface ScoreDisplayProps {
  result: MatchPlayerResult;
  showDetails?: boolean;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  result,
  showDetails = false,
}) => {
  const { theme } = useTheme();

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return theme.rank1;
      case 2:
        return theme.rank2;
      case 3:
        return theme.rank3;
      case 4:
        return theme.rank4;
      default:
        return theme.text;
    }
  };

  const getRankLabel = (rank: number) => {
    const labels = ['', '1st', '2nd', '3rd', '4th'];
    return labels[rank];
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.header}>
        <View style={styles.playerInfo}>
          <View style={[styles.rankBadge, { backgroundColor: getRankColor(result.rank) }]}>
            <Text style={styles.rankText}>{result.rank}</Text>
          </View>
          <Text style={[styles.playerName, { color: theme.text }]} numberOfLines={1}>
            {result.playerName}
          </Text>
        </View>

        <View style={styles.scoreContainer}>
          <Text
            style={[
              styles.scoreText,
              { color: result.scoreChange >= 0 ? theme.success : theme.error },
            ]}
          >
            {result.scoreChange >= 0 ? '+' : ''}
            {result.scoreChange.toLocaleString('vi-VN')}
          </Text>
        </View>
      </View>

      {showDetails && (
        <View style={styles.details}>
          {result.isToiTrang && (
            <View style={[styles.badge, { backgroundColor: theme.warning + '30' }]}>
              <Text style={[styles.badgeText, { color: theme.warning }]}>
                {i18n.t('toiTrang')}
              </Text>
            </View>
          )}

          {result.isKilled && (
            <View style={[styles.badge, { backgroundColor: theme.error + '30' }]}>
              <Text style={[styles.badgeText, { color: theme.error }]}>
                {i18n.t('killed')}
              </Text>
            </View>
          )}

          {result.penalties.length > 0 && (
            <View style={styles.penaltiesContainer}>
              {result.penalties.map((penalty, index) => (
                <View
                  key={index}
                  style={[styles.badge, { backgroundColor: theme.primary + '30' }]}
                >
                  <Text style={[styles.badgeText, { color: theme.primary }]}>
                    {i18n.t(penalty.type)} ×{penalty.count}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {result.chatHeo && (
            <View style={[styles.badge, { backgroundColor: theme.success + '30' }]}>
              <Text style={[styles.badgeText, { color: theme.success }]}>
                {i18n.t('chatHeo')} {result.chatHeo.type === 'black' ? i18n.t('heoDen') : i18n.t('heoDo')} ×{result.chatHeo.count}
              </Text>
            </View>
          )}

          {result.dutBaTep && (
            <View style={[styles.badge, { backgroundColor: theme.warning + '30' }]}>
              <Text style={[styles.badgeText, { color: theme.warning }]}>
                {i18n.t('dutBaTep')}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  details: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  penaltiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
