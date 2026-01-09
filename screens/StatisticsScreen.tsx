import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { PlayerStats } from '../types/models';
import { getAllPlayerStats } from '../services/statsService';
import i18n from '../utils/i18n';

export const StatisticsScreen: React.FC = () => {
  const { theme } = useTheme();
  const [stats, setStats] = useState<PlayerStats[]>([]);
  const [sortBy, setSortBy] = useState<'score' | 'wins' | 'matches'>('score');

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  const loadStats = () => {
    try {
      const data = getAllPlayerStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const getSortedStats = () => {
    return [...stats].sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.totalScore - a.totalScore;
        case 'wins':
          return b.winCount - a.winCount;
        case 'matches':
          return b.totalMatches - a.totalMatches;
        default:
          return 0;
      }
    });
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}`;
  };

  const getWinRate = (stat: PlayerStats) => {
    if (stat.totalMatches === 0) return 0;
    return Math.round((stat.winCount / stat.totalMatches) * 100);
  };

  const renderStatCard = ({ item, index }: { item: PlayerStats; index: number }) => (
    <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.rankContainer}>
        <Text style={[styles.rankText, { color: theme.text }]}>
          {getRankIcon(index)}
        </Text>
      </View>

      <View style={styles.playerInfo}>
        <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
          <Text style={styles.avatarText}>
            {item.playerName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.nameContainer}>
          <Text style={[styles.playerName, { color: theme.text }]} numberOfLines={1}>
            {item.playerName}
          </Text>
          <Text style={[styles.winRate, { color: theme.textSecondary }]}>
            {getWinRate(item)}% thắng
          </Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: item.totalScore >= 0 ? theme.success : theme.error }]}>
            {item.totalScore >= 0 ? '+' : ''}
            {item.totalScore.toLocaleString('vi-VN')}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            {i18n.t('totalScore')}
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.text }]}>
            {item.winCount}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            {i18n.t('winCount')}
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.text }]}>
            {item.totalMatches}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            {i18n.t('totalMatches')}
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.warning }]}>
            {item.killCount}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            {i18n.t('killCount')}
          </Text>
        </View>
      </View>
    </View>
  );

  const sortedStats = getSortedStats();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>
          {i18n.t('statistics')}
        </Text>
      </View>

      <View style={styles.sortContainer}>
        <TouchableOpacity
          style={[
            styles.sortButton,
            {
              backgroundColor: sortBy === 'score' ? theme.primary : theme.surface,
              borderColor: theme.border,
            },
          ]}
          onPress={() => setSortBy('score')}
        >
          <Text
            style={[
              styles.sortButtonText,
              { color: sortBy === 'score' ? '#FFF' : theme.text },
            ]}
          >
            Điểm cao nhất
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.sortButton,
            {
              backgroundColor: sortBy === 'wins' ? theme.primary : theme.surface,
              borderColor: theme.border,
            },
          ]}
          onPress={() => setSortBy('wins')}
        >
          <Text
            style={[
              styles.sortButtonText,
              { color: sortBy === 'wins' ? '#FFF' : theme.text },
            ]}
          >
            Nhiều thắng nhất
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.sortButton,
            {
              backgroundColor: sortBy === 'matches' ? theme.primary : theme.surface,
              borderColor: theme.border,
            },
          ]}
          onPress={() => setSortBy('matches')}
        >
          <Text
            style={[
              styles.sortButtonText,
              { color: sortBy === 'matches' ? '#FFF' : theme.text },
            ]}
          >
            Nhiều trận nhất
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={sortedStats}
        keyExtractor={(item) => item.playerId}
        renderItem={renderStatCard}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="stats-chart-outline" size={64} color={theme.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Chưa có dữ liệu thống kê
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
              Chơi một vài trận để xem thống kê
            </Text>
          </View>
        }
      />
    </SafeAreaView>
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
  },
  sortContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 8,
  },
  sortButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  list: {
    padding: 20,
    paddingTop: 8,
  },
  statCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  rankContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  rankText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  nameContainer: {
    flex: 1,
  },
  playerName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  winRate: {
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    textAlign: 'center',
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
});
