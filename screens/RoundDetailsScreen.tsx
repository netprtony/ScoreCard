import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Match, Round } from '../types/models';
import { formatActionDescription, formatToiTrangAction } from '../utils/actionFormatter';

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
      Alert.alert('Lỗi', 'Vui lòng nhập số hợp lệ');
      return;
    }

    // Validate sum equals zero
    const sum = Object.values(scores).reduce((a, b) => a + b, 0);
    
    if (sum !== 0) {
      Alert.alert(
        'Cảnh báo',
        `Tổng điểm không bằng 0 (hiện tại: ${sum}). Bạn có chắc muốn lưu?`,
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Lưu',
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
      'Xác nhận xóa',
      'Bạn có chắc muốn xóa ván này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
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
          Ván {round.roundNumber}
        </Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Ionicons name="trash" size={24} color={theme.error} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Actions Section */}
        {(round.toiTrangWinner || round.actions.length > 0) && (
          <View style={[styles.section, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              📊 Hành Động
            </Text>
            
            <ScrollView style={styles.actionsList} nestedScrollEnabled showsVerticalScrollIndicator={true}>
              {/* Tới Trắng */}
              {round.toiTrangWinner && (() => {
                const winnerIndex = match.playerIds.indexOf(round.toiTrangWinner);
                const winnerName = match.playerNames[winnerIndex];
                const winnerScore = round.roundScores[round.toiTrangWinner] || 0;
                const formatted = formatToiTrangAction(winnerName, winnerScore);
                
                return (
                  <View key="toi-trang" style={[styles.actionItem, { borderLeftColor: formatted.color }]}>
                    <Text style={styles.actionIcon}>{formatted.icon}</Text>
                    <View style={styles.actionContent}>
                      <Text style={[styles.actionText, { color: theme.text }]}>
                        {formatted.text}
                      </Text>
                    </View>
                    <Text style={[styles.actionScore, { color: formatted.color }]}>
                      {formatted.score}
                    </Text>
                  </View>
                );
              })()}
              
              {/* Other Actions */}
              {round.actions.map((action, idx) => {
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
                
                return (
                  <View key={`action-${idx}`} style={[styles.actionItem, { borderLeftColor: formatted.color }]}>
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
                    </View>
                    <Text style={[styles.actionScore, { color: formatted.color }]}>
                      {formatted.score}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Scores Section */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            📝 Điểm Số
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
          <Text style={styles.saveButtonText}>Lưu Thay Đổi</Text>
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
    backgroundColor: '#F5F5F5',
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
