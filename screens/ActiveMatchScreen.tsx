import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useMatch } from '../contexts/MatchContext';
import { ScoreTable } from '../components/ScoreTable';
import { CountdownTimer } from '../components/CountdownTimer';
import { ScoringConfig } from '../types/models';
import i18n from '../utils/i18n';

export const ActiveMatchScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { activeMatch, endMatch, refreshMatch, updateConfig } = useMatch();
  
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [editedConfig, setEditedConfig] = useState<ScoringConfig | null>(null);

  const handleAddRound = () => {
    navigation.navigate('RoundInput' as never);
  };

  const handleEditConfig = () => {
    if (activeMatch) {
      setEditedConfig({ ...activeMatch.configSnapshot });
      setShowConfigModal(true);
    }
  };

  const handleSaveConfig = () => {
    if (!editedConfig || !activeMatch) return;

    // Validate config
    if (editedConfig.baseRatioFirst <= editedConfig.baseRatioSecond) {
      Alert.alert('Lỗi', 'Hệ số 1 phải lớn hơn hệ số 2');
      return;
    }

    if (editedConfig.penaltyHeoDo <= editedConfig.penaltyHeoDen) {
      Alert.alert('Lỗi', 'Phạt heo đỏ phải lớn hơn heo đen');
      return;
    }

    Alert.alert(
      'Xác nhận',
      'Thay đổi cấu hình sẽ áp dụng cho các ván tiếp theo. Bạn có chắc chắn?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Lưu',
          onPress: () => {
            updateConfig(editedConfig);
            setShowConfigModal(false);
            Alert.alert('Thành công', 'Đã cập nhật cấu hình');
          },
        },
      ]
    );
  };

  const updateConfigField = (field: keyof ScoringConfig, value: any) => {
    if (!editedConfig) return;
    setEditedConfig({ ...editedConfig, [field]: value });
  };

  const handleUpdateRound = async (roundId: string, scores: { [playerId: string]: number }) => {
    if (!activeMatch) return;

    try {
      const { updateRoundScores } = require('../services/matchService');
      await updateRoundScores(activeMatch.id, roundId, scores);
      await refreshMatch();
      Alert.alert('Thành công', 'Đã cập nhật điểm');
    } catch (error) {
      console.error('Error updating round:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật điểm');
    }
  };

  const handleDeleteRound = async (roundId: string) => {
    if (!activeMatch) return;

    try {
      const { deleteRound } = require('../services/matchService');
      await deleteRound(activeMatch.id, roundId);
      await refreshMatch();
      Alert.alert('Thành công', 'Đã xóa ván');
    } catch (error) {
      console.error('Error deleting round:', error);
      Alert.alert('Lỗi', 'Không thể xóa ván');
    }
  };

  const handleEndMatch = () => {
    Alert.alert(
      i18n.t('endMatch'),
      'Bạn có chắc muốn kết thúc trận đấu?',
      [
        { text: i18n.t('cancel'), style: 'cancel' },
        {
          text: i18n.t('confirm'),
          style: 'destructive',
          onPress: () => {
            endMatch();
            navigation.navigate('Matches' as never);
          },
        },
      ]
    );
  };

  if (!activeMatch) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.emptyContainer}>
          <Ionicons name="game-controller-outline" size={64} color={theme.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            Chưa có trận đấu nào đang diễn ra
          </Text>
          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate('GameSelection' as never)}
          >
            <Text style={styles.startButtonText}>Bắt Đầu Trận Mới</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.text }]}>
            Trận Đấu Đang Diễn Ra
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Ván {activeMatch.rounds.length + 1}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: theme.surface }]}
          onPress={handleEditConfig}
        >
          <Ionicons name="settings-outline" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Countdown Timer */}
      <View style={styles.timerContainer}>
        <CountdownTimer />
      </View>

      {/* Score Table */}
      <View style={[styles.tableContainer, { backgroundColor: theme.card }]}>
        <Text style={[styles.tableTitle, { color: theme.text }]}>Bảng Điểm</Text>
        {activeMatch.rounds.length > 0 ? (
          <ScoreTable 
            match={activeMatch} 
            editable={true}
            onUpdateRound={handleUpdateRound}
            onDeleteRound={handleDeleteRound}
          />
        ) : (
          <View style={styles.noRoundsContainer}>
            <Text style={[styles.noRoundsText, { color: theme.textSecondary }]}>
              Chưa có ván nào. Nhấn &quot;Nhập Ván Mới&quot; để bắt đầu!
            </Text>
          </View>
        )}
      </View>

      {/* Players Info */}
      <ScrollView style={styles.playersContainer}>
        <Text style={[styles.playersTitle, { color: theme.text }]}>Người Chơi</Text>
        {activeMatch.playerNames.map((name, index) => {
          const playerId = activeMatch.playerIds[index];
          const totalScore = activeMatch.totalScores[playerId] || 0;
          return (
            <View
              key={playerId}
              style={[styles.playerCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            >
              <View style={[styles.playerAvatar, { backgroundColor: theme.primary }]}>
                <Text style={styles.playerAvatarText}>{name.charAt(0).toUpperCase()}</Text>
              </View>
              <Text style={[styles.playerName, { color: theme.text }]}>{name}</Text>
              <Text
                style={[
                  styles.playerScore,
                  { color: totalScore >= 0 ? theme.success : theme.error },
                ]}
              >
                {totalScore >= 0 ? '+' : ''}
                {totalScore}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.endButton, { backgroundColor: theme.error }]}
          onPress={handleEndMatch}
        >
          <Ionicons name="stop-circle-outline" size={24} color="#FFF" />
          <Text style={styles.buttonText}>Kết Thúc</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.addButton, { backgroundColor: theme.primary }]}
          onPress={handleAddRound}
        >
          <Ionicons name="add-circle-outline" size={24} color="#FFF" />
          <Text style={styles.buttonText}>Nhập Ván Mới</Text>
        </TouchableOpacity>
      </View>

      {/* Config Edit Modal */}
      <Modal
        visible={showConfigModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowConfigModal(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowConfigModal(false)}>
              <Ionicons name="close" size={28} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Sửa Cấu Hình</Text>
            <TouchableOpacity onPress={handleSaveConfig}>
              <Ionicons name="checkmark" size={28} color={theme.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            {editedConfig && (
              <>
                {/* Hệ số cơ bản */}
                <View style={[styles.section, { backgroundColor: theme.card }]}>
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>Hệ Số Cơ Bản</Text>
                  
                  <View style={styles.inputRow}>
                    <Text style={[styles.label, { color: theme.textSecondary }]}>Hệ số 1:</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                      value={editedConfig.baseRatioFirst.toString()}
                      onChangeText={(text) => updateConfigField('baseRatioFirst', parseInt(text) || 0)}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={styles.inputRow}>
                    <Text style={[styles.label, { color: theme.textSecondary }]}>Hệ số 2:</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                      value={editedConfig.baseRatioSecond.toString()}
                      onChangeText={(text) => updateConfigField('baseRatioSecond', parseInt(text) || 0)}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                {/* Tới Trắng */}
                <View style={[styles.section, { backgroundColor: theme.card }]}>
                  <View style={styles.switchRow}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Tới Trắng</Text>
                    <Switch
                      value={editedConfig.enableToiTrang}
                      onValueChange={(value) => updateConfigField('enableToiTrang', value)}
                      trackColor={{ false: theme.border, true: theme.primary }}
                      thumbColor="#FFF"
                    />
                  </View>
                  
                  {editedConfig.enableToiTrang && (
                    <View style={styles.inputRow}>
                      <Text style={[styles.label, { color: theme.textSecondary }]}>Hệ số nhân:</Text>
                      <TextInput
                        style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                        value={editedConfig.toiTrangMultiplier.toString()}
                        onChangeText={(text) => updateConfigField('toiTrangMultiplier', parseInt(text) || 0)}
                        keyboardType="numeric"
                      />
                    </View>
                  )}
                </View>

                {/* Giết */}
                <View style={[styles.section, { backgroundColor: theme.card }]}>
                  <View style={styles.switchRow}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Giết</Text>
                    <Switch
                      value={editedConfig.enableKill}
                      onValueChange={(value) => updateConfigField('enableKill', value)}
                      trackColor={{ false: theme.border, true: theme.primary }}
                      thumbColor="#FFF"
                    />
                  </View>
                  
                  {editedConfig.enableKill && (
                    <View style={styles.inputRow}>
                      <Text style={[styles.label, { color: theme.textSecondary }]}>Hệ số nhân:</Text>
                      <TextInput
                        style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                        value={editedConfig.killMultiplier.toString()}
                        onChangeText={(text) => updateConfigField('killMultiplier', parseInt(text) || 0)}
                        keyboardType="numeric"
                      />
                    </View>
                  )}
                </View>

                {/* Phạt Thối */}
                <View style={[styles.section, { backgroundColor: theme.card }]}>
                  <View style={styles.switchRow}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Phạt Thối</Text>
                    <Switch
                      value={editedConfig.enablePenalties}
                      onValueChange={(value) => updateConfigField('enablePenalties', value)}
                      trackColor={{ false: theme.border, true: theme.primary }}
                      thumbColor="#FFF"
                    />
                  </View>
                  
                  {editedConfig.enablePenalties && (
                    <>
                      <View style={styles.inputRow}>
                        <Text style={[styles.label, { color: theme.textSecondary }]}>Heo đen:</Text>
                        <TextInput
                          style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                          value={editedConfig.penaltyHeoDen.toString()}
                          onChangeText={(text) => updateConfigField('penaltyHeoDen', parseInt(text) || 0)}
                          keyboardType="numeric"
                        />
                      </View>

                      <View style={styles.inputRow}>
                        <Text style={[styles.label, { color: theme.textSecondary }]}>Heo đỏ:</Text>
                        <TextInput
                          style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                          value={editedConfig.penaltyHeoDo.toString()}
                          onChangeText={(text) => updateConfigField('penaltyHeoDo', parseInt(text) || 0)}
                          keyboardType="numeric"
                        />
                      </View>
                    </>
                  )}
                </View>

                {/* Chặt Heo */}
                <View style={[styles.section, { backgroundColor: theme.card }]}>
                  <View style={styles.switchRow}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Chặt Heo</Text>
                    <Switch
                      value={editedConfig.enableChatHeo}
                      onValueChange={(value) => updateConfigField('enableChatHeo', value)}
                      trackColor={{ false: theme.border, true: theme.primary }}
                      thumbColor="#FFF"
                    />
                  </View>
                  
                  {editedConfig.enableChatHeo && (
                    <>
                      <View style={styles.inputRow}>
                        <Text style={[styles.label, { color: theme.textSecondary }]}>Heo đen:</Text>
                        <TextInput
                          style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                          value={editedConfig.chatHeoBlack.toString()}
                          onChangeText={(text) => updateConfigField('chatHeoBlack', parseInt(text) || 0)}
                          keyboardType="numeric"
                        />
                      </View>

                      <View style={styles.inputRow}>
                        <Text style={[styles.label, { color: theme.textSecondary }]}>Hệ số chồng:</Text>
                        <TextInput
                          style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                          value={editedConfig.chongHeoMultiplier.toString()}
                          onChangeText={(text) => updateConfigField('chongHeoMultiplier', parseInt(text) || 0)}
                          keyboardType="numeric"
                        />
                      </View>
                    </>
                  )}
                </View>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  tableContainer: {
    marginHorizontal: 8,
    marginBottom: 12,
    borderRadius: 12,
    padding: 12,
  },
  tableTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  noRoundsContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  noRoundsText: {
    fontSize: 14,
    textAlign: 'center',
  },
  playersContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  playersTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  playerAvatarText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  playerName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  playerScore: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  endButton: {},
  addButton: {},
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  startButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    flex: 1,
  },
  input: {
    width: 100,
    padding: 10,
    borderRadius: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
});
