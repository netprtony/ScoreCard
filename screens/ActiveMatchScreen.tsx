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
import { showSuccess, showWarning } from '../utils/toast';
import { Button } from '../components/rn-ui';
import { WallpaperBackground } from '../components/WallpaperBackground';
export const ActiveMatchScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { activeMatch, ongoingMatches, endMatch, refreshMatch, updateConfig, pauseMatch, resumeMatch } = useMatch();
  
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [editedConfig, setEditedConfig] = useState<ScoringConfig | null>(null);
  const [showOngoingModal, setShowOngoingModal] = useState(false);
  const [showTimer, setShowTimer] = useState(false);

  const handleAddRound = () => {
    if (activeMatch?.gameType === 'sac_te') {
      navigation.navigate('SacTeRoundInput' as never);
    } else {
      navigation.navigate('RoundInput' as never);
    }
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
      showWarning('Lỗi', 'Hệ số 1 phải lớn hơn hệ số 2');
      return;
    }

    if (editedConfig.penaltyHeoDo <= editedConfig.penaltyHeoDen) {
      showWarning('Lỗi', 'Phạt heo đỏ phải lớn hơn heo đen');
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
            showSuccess('Thành công', 'Đã cập nhật cấu hình');
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
      showSuccess('Thành công', 'Đã cập nhật điểm');
    } catch (error) {
      console.error('Error updating round:', error);
      showWarning('Lỗi', 'Không thể cập nhật điểm');
    }
  };

  const handleDeleteRound = async (roundId: string) => {
    if (!activeMatch) return;

    try {
      const { deleteRound } = require('../services/matchService');
      await deleteRound(activeMatch.id, roundId);
      await refreshMatch();
      showSuccess('Thành công', 'Đã xóa ván');
    } catch (error) {
      console.error('Error deleting round:', error);
      showWarning('Lỗi', 'Không thể xóa ván');
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

  const handlePauseMatch = () => {
    Alert.alert(
      'Tạm hoãn trận đấu',
      'Trận đấu sẽ được lưu và bạn có thể tiếp tục bất cứ lúc nào.',
      [
        { text: i18n.t('cancel'), style: 'cancel' },
        {
          text: 'Tạm hoãn',
          onPress: () => {
            pauseMatch();
            showSuccess('Đã tạm hoãn trận đấu');
            navigation.navigate('Matches' as never);
          },
        },
      ]
    );
  };

  const handleResumeMatch = (matchId: string) => {
    resumeMatch(matchId);
    setShowOngoingModal(false);
    showSuccess('Đã tiếp tục trận đấu');
  };

  const handleEditTimer = () => {
    setShowTimer(!showTimer);
  };

  // Get paused matches (excluding current active)
  const pausedMatches = ongoingMatches.filter(m => m.status === 'paused');

  if (!activeMatch) {
    return (
      <WallpaperBackground>
        <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="game-controller-outline" size={64} color={theme.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            {i18n.t('no_match_found')}
          </Text>
          <Button
            onPress={() => navigation.navigate('GameSelection' as never)}
            size="lg"
            style={{ paddingHorizontal: 32 }}
          >
            {i18n.t('start_match_new')}
          </Button>
          
          {/* Show paused matches */}
          {pausedMatches.length > 0 && (
            <View style={styles.pausedSection}>
              <Text style={[styles.pausedTitle, { color: theme.text }]}>
                Trận đang tạm hoãn ({pausedMatches.length})
              </Text>
              {pausedMatches.map(match => (
                <TouchableOpacity
                  key={match.id}
                  style={[styles.pausedMatchCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                  onPress={() => handleResumeMatch(match.id)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.pausedMatchPlayers, { color: theme.text }]}>
                      {match.playerNames.join(' • ')}
                    </Text>
                    <Text style={[styles.pausedMatchInfo, { color: theme.textSecondary }]}>
                      {match.rounds.length} {i18n.t('rounds')}
                    </Text>
                  </View>
                  <Ionicons name="play-circle" size={32} color={theme.primary} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        </SafeAreaView>
      </WallpaperBackground>
    );
  }

  return (
    <WallpaperBackground>
      <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.text }]}>
            {i18n.t('match_happening')}
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {i18n.t('rounds')} {activeMatch.rounds.length + 1}
            {pausedMatches.length > 0 && ` • ${pausedMatches.length} ${i18n.t('paused_matches')}`}
          </Text>
        </View>
        
       
      </View>

      <View style={[styles.timerContainer, { display: showTimer ? 'flex' : 'none' }]}>
        <CountdownTimer initialEnabled={true} />
      </View>
      {/* Score Table */}
      <View style={styles.tableContainer}>
        <Text style={[styles.tableTitle, { color: theme.text, paddingHorizontal: 20 }]}>{i18n.t('score_table')}</Text>
        {activeMatch.rounds.length > 0 ? (
          <ScoreTable 
            match={activeMatch} 
            editable={true}
            onUpdateRound={handleUpdateRound}
            onDeleteRound={handleDeleteRound}
            caHeoEnabled={(activeMatch.configSnapshot as any).caHeo?.enabled ?? false}
          />
        ) : (
          <View style={styles.noRoundsContainer}>
            <Text style={[styles.noRoundsText, { color: theme.textSecondary }]}>
              {i18n.t('no_rounds')}
            </Text>
          </View>
        )}
      </View>

      {/* Players Info
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
      </ScrollView> */}

      {/* Action Buttons */}
      <View style={[styles.buttonContainer, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
        <Button
          shape = "pill"
          size = "md"
          variant="secondary"
          onPress={handleEndMatch}
          icon={<Ionicons name="stop-circle-outline" size={24} color='#ff0000ff' />}
          style={{ flex: 1 }}
        >
          {i18n.t('end_match')}
        </Button>

       
        <Button
          icon={<Ionicons name="pause" size={20} color= '#ffffffff' />}
          shape="circle"
          size="md"
          variant="primary"
          onPress={handlePauseMatch}
          style={{ backgroundColor: theme.warning, marginRight: 8 }}
        />
         {activeMatch.gameType !== 'sac_te' && (
          <Button
            icon={<Ionicons name="settings-outline" size={20} color={theme.text} />}
            shape="circle"
            size="md"
            variant="secondary"
            onPress={handleEditConfig}
          />
        )}
         <Button
          shape = "pill"
          size = "md"
          variant="secondary"
          onPress={handleAddRound}
          icon={<Ionicons name="add-circle-outline" size={24} color="#62aa10ff" />}
          style={{ flex: 1 }}
        >
          {i18n.t('new_round')}
        </Button>
        <Button
          icon={<Ionicons name="timer-outline" size={20} color={showTimer ? "#62aa10ff" : theme.text} />}
          shape="circle"
          size="md"
          variant="secondary"
          onPress={handleEditTimer}
          style={showTimer ? { backgroundColor: theme.surface } : {}}
        />
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
            <Button
              icon={<Ionicons name="close" size={24} color={theme.text} />}
              shape="circle"
              size="sm"
              variant="ghost"
              onPress={() => setShowConfigModal(false)}
            />
            <Text style={[styles.modalTitle, { color: theme.text }]}>{i18n.t('edit_config')}</Text>
            <Button
              icon={<Ionicons name="checkmark" size={24} color={theme.primary} />}
              shape="circle"
              size="sm"
              variant="ghost"
              onPress={handleSaveConfig}
            />
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            {editedConfig && (
              <>
                {/* Hệ số cơ bản */}
                <View style={[styles.section, { backgroundColor: theme.card }]}>
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>{i18n.t('baseRatio')}</Text>
                  
                  <View style={styles.inputRow}>
                    <Text style={[styles.label, { color: theme.textSecondary }]}>{i18n.t('ratio1')}</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                      value={editedConfig.baseRatioFirst.toString()}
                      onChangeText={(text) => updateConfigField('baseRatioFirst', parseInt(text) || 0)}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={styles.inputRow}>
                    <Text style={[styles.label, { color: theme.textSecondary }]}>{i18n.t('ratio2')}</Text>
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
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>{i18n.t('toiTrang')}</Text>
                    <Switch
                      value={editedConfig.enableToiTrang}
                      onValueChange={(value) => updateConfigField('enableToiTrang', value)}
                      trackColor={{ false: theme.border, true: theme.primary }}
                      thumbColor="#FFF"
                    />
                  </View>
                  
                  {editedConfig.enableToiTrang && (
                    <View style={styles.inputRow}>
                      <Text style={[styles.label, { color: theme.textSecondary }]}>{i18n.t('multipliers')}</Text>
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
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>{i18n.t('kill')}</Text>
                    <Switch
                      value={editedConfig.enableKill}
                      onValueChange={(value) => updateConfigField('enableKill', value)}
                      trackColor={{ false: theme.border, true: theme.primary }}
                      thumbColor="#FFF"
                    />
                  </View>
                  
                  {editedConfig.enableKill && (
                    <View style={styles.inputRow}>
                      <Text style={[styles.label, { color: theme.textSecondary }]}>{i18n.t('multipliers')}</Text>
                      <TextInput
                        style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                        value={editedConfig.killMultiplier.toString()}
                        onChangeText={(text) => updateConfigField('killMultiplier', parseInt(text) || 0)}
                        keyboardType="numeric"
                      />
                    </View>
                  )}
                </View>

                {/* Phạt Thối/Chồng */}
                <View style={[styles.section, { backgroundColor: theme.card }]}>
                  <View style={styles.switchRow}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>{i18n.t('penalties')}</Text>
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
                        <Text style={[styles.label, { color: theme.textSecondary }]}>{i18n.t('heo_den')}</Text>
                        <TextInput
                          style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                          value={editedConfig.penaltyHeoDen.toString()}
                          onChangeText={(text) => updateConfigField('penaltyHeoDen', parseInt(text) || 0)}
                          keyboardType="numeric"
                        />
                      </View>

                      <View style={styles.inputRow}>
                        <Text style={[styles.label, { color: theme.textSecondary }]}>{i18n.t('heo_do')}</Text>
                        <TextInput
                          style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                          value={editedConfig.penaltyHeoDo.toString()}
                          onChangeText={(text) => updateConfigField('penaltyHeoDo', parseInt(text) || 0)}
                          keyboardType="numeric"
                        />
                      </View>

                      <View style={styles.inputRow}>
                        <Text style={[styles.label, { color: theme.textSecondary }]}>{i18n.t('ba_doi_thong')}</Text>
                        <TextInput
                          style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                          value={editedConfig.penaltyBaDoiThong.toString()}
                          onChangeText={(text) => updateConfigField('penaltyBaDoiThong', parseInt(text) || 0)}
                          keyboardType="numeric"
                        />
                      </View>

                      <View style={styles.inputRow}>
                        <Text style={[styles.label, { color: theme.textSecondary }]}>Tứ quý:</Text>
                        <TextInput
                          style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                          value={editedConfig.penaltyTuQuy.toString()}
                          onChangeText={(text) => updateConfigField('penaltyTuQuy', parseInt(text) || 0)}
                          keyboardType="numeric"
                        />
                      </View>
                    </>
                  )}
                </View>

                {/* Chặt Heo */}
                <View style={[styles.section, { backgroundColor: theme.card }]}>
                  <View style={styles.switchRow}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>{i18n.t('chatHeo')}</Text>
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
                        <Text style={[styles.label, { color: theme.textSecondary }]}>{i18n.t('heo_den')}</Text>
                        <TextInput
                          style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                          value={editedConfig.chatHeoBlack.toString()}
                          onChangeText={(text) => updateConfigField('chatHeoBlack', parseInt(text) || 0)}
                          keyboardType="numeric"
                        />
                      </View>

                      <View style={styles.inputRow}>
                        <Text style={[styles.label, { color: theme.textSecondary }]}>{i18n.t('heo_do')}</Text>
                        <TextInput
                          style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                          value={editedConfig.chatHeoRed.toString()}
                          onChangeText={(text) => updateConfigField('chatHeoRed', parseInt(text) || 0)}
                          keyboardType="numeric"
                        />
                      </View>
                    </>
                  )}
                </View>

                {/* Đút 3 Tép */}
                {/* <View style={[styles.section, { backgroundColor: theme.card }]}>
                  <View style={styles.switchRow}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Đút 3 Tép</Text>
                    <Switch
                      value={editedConfig.enableDutBaTep}
                      onValueChange={(value) => updateConfigField('enableDutBaTep', value)}
                      trackColor={{ false: theme.border, true: theme.primary }}
                      thumbColor="#FFF"
                    />
                  </View>
                  
                  {editedConfig.enableDutBaTep && (
                    <>
                      <View style={styles.inputRow}>
                        <Text style={[styles.label, { color: theme.textSecondary }]}>Điểm đút:</Text>
                        <TextInput
                          style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                          value={editedConfig.dutBaTep.toString()}
                          onChangeText={(text) => updateConfigField('dutBaTep', parseInt(text) || 0)}
                          keyboardType="numeric"
                        />
                      </View>

                      <View style={styles.inputRow}>
                        <Text style={[styles.label, { color: theme.textSecondary }]}>Phạt thối 3 tép:</Text>
                        <TextInput
                          style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                          value={editedConfig.penaltyBaTep.toString()}
                          onChangeText={(text) => updateConfigField('penaltyBaTep', parseInt(text) || 0)}
                          keyboardType="numeric"
                        />
                      </View>
                    </>
                  )}
                </View> */}
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
      </SafeAreaView>
    </WallpaperBackground>
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
    flex: 1,
    marginBottom: 80,
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 24,
    gap: 12,
    borderTopWidth: 1,
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
  pausedSection: {
    width: '100%',
    marginTop: 32,
    paddingHorizontal: 20,
  },
  pausedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  pausedMatchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  pausedMatchPlayers: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  pausedMatchInfo: {
    fontSize: 13,
  },
});
