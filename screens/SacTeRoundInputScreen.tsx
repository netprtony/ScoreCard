import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Image,
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useMatch } from '../contexts/MatchContext';
import { Player, SacTeRoundOutcome, SacTeMatch, SacTeConfig } from '../types/models';
import { getPlayerById } from '../services/playerService';
import { calculateSacTeRoundScores } from '../utils/sacTeScoringEngine';
import { showSuccess, showWarning } from '../utils/toast';
import { updateSacTeConfig } from '../services/sacTeMatchService';
import { Button } from '../components/rn-ui';
import { WallpaperBackground } from '../components/WallpaperBackground';
import { Card } from '../components/Card';

export const SacTeRoundInputScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const navigation = useNavigation();
  const { activeMatch, refreshMatch } = useMatch();

  // Player data
  const [players, setPlayers] = useState<{ [playerId: string]: Player }>({});

  // Round outcome state
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [isWhiteWin, setIsWhiteWin] = useState(false);
  const [playerStatuses, setPlayerStatuses] = useState<{
    [playerId: string]: { isGuc: boolean; hasTon: boolean };
  }>({});
  const [caNuocWinnerId, setCaNuocWinnerId] = useState<string | null>(null);
  const [caHeoWinnerId, setCaHeoWinnerId] = useState<string | null>(null);

  // Track if statuses have been initialized to prevent resets
  const statusesInitialized = React.useRef(false);

  // Config editing state
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [editedConfig, setEditedConfig] = useState<SacTeConfig | null>(null);


  // Load players when activeMatch changes
  useEffect(() => {
    if (activeMatch) {
      loadPlayers();
    }
  }, [activeMatch]);

  // Initialize statuses ONLY ONCE on mount
  useEffect(() => {
    if (activeMatch && !statusesInitialized.current) {
      initializeStatuses();
      statusesInitialized.current = true;
    }
  }, [activeMatch]);

  const loadPlayers = () => {
    if (!activeMatch) return;
    const playerData: { [playerId: string]: Player } = {};
    for (const playerId of activeMatch.playerIds) {
      const player = getPlayerById(playerId);
      if (player) {
        playerData[playerId] = player;
      }
    }
    setPlayers(playerData);
  };

  const initializeStatuses = () => {
    if (!activeMatch) return;
    const statuses: { [playerId: string]: { isGuc: boolean; hasTon: boolean } } = {};
    activeMatch.playerIds.forEach(id => {
      statuses[id] = { isGuc: false, hasTon: false };
    });
    setPlayerStatuses(statuses);
  };

  if (!activeMatch) {
    return (
      <WallpaperBackground>
        <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.text }]}>Không có trận đấu</Text>
        </View>
        </SafeAreaView>
      </WallpaperBackground>
    );
  }

  const sacTeMatch = activeMatch as unknown as SacTeMatch;
  const config = sacTeMatch.configSnapshot;

  const toggleWinner = (playerId: string) => {
    if (winnerId === playerId) {
      setWinnerId(null);
      setIsWhiteWin(false);
      // Clear cá nước winner if it was this player
      if (caNuocWinnerId === playerId) {
        setCaNuocWinnerId(null);
      }
    } else {
      setWinnerId(playerId);
      // Auto-set cá nước winner for normal win
      if (!isWhiteWin) {
        setCaNuocWinnerId(playerId);
      }
    }
  };

  const toggleWhiteWin = () => {
    if (!winnerId) {
      showWarning('Lỗi', 'Vui lòng chọn người thắng trước');
      return;
    }
    const newWhiteWin = !isWhiteWin;
    setIsWhiteWin(newWhiteWin);
    
    if (newWhiteWin) {
      // White Win: Clear all statuses (all become gục automatically)
      // Dealer must manually select Cá Nước winner
      setPlayerStatuses(prevStatuses => {
        const clearedStatuses: { [playerId: string]: { isGuc: boolean; hasTon: boolean } } = {};
        Object.keys(prevStatuses).forEach(id => {
          clearedStatuses[id] = { isGuc: false, hasTon: false };
        });
        return clearedStatuses;
      });
    }
  };

  const toggleGuc = (playerId: string) => {
    if (isWhiteWin) {
      showWarning('Lỗi', 'Tới Trắng tự động gục tất cả');
      return;
    }
    if (playerId === winnerId) {
      showWarning('Lỗi', 'Người thắng không thể bị gục');
      return;
    }
    setPlayerStatuses(prevStatuses => {
      const currentStatus = prevStatuses[playerId] ?? { isGuc: false, hasTon: false };
      const newIsGuc = !currentStatus.isGuc;
      return {
        ...prevStatuses,
        [playerId]: {
          isGuc: newIsGuc,
          hasTon: newIsGuc ? false : currentStatus.hasTon, // Only clear tồn if setting gục to true
        },
      };
    });
  };

  const toggleTon = (playerId: string) => {
    if (isWhiteWin) {
      showWarning('Lỗi', 'Tới Trắng tự động gục tất cả');
      return;
    }
    if (playerId === winnerId) {
      showWarning('Lỗi', 'Người thắng không thể có tồn');
      return;
    }
    setPlayerStatuses(prevStatuses => {
      const currentStatus = prevStatuses[playerId] ?? { isGuc: false, hasTon: false };
      const newHasTon = !currentStatus.hasTon;
      return {
        ...prevStatuses,
        [playerId]: {
          isGuc: newHasTon ? false : currentStatus.isGuc, // Only clear gục if setting tồn to true
          hasTon: newHasTon,
        },
      };
    });
  };

  const toggleCaNuoc = (playerId: string) => {
    if (!config.caNuoc.enabled) return;
    setCaNuocWinnerId(caNuocWinnerId === playerId ? null : playerId);
  };

  const toggleCaHeo = (playerId: string) => {
    if (!config.caHeo.enabled) return;
    setCaHeoWinnerId(caHeoWinnerId === playerId ? null : playerId);
  };

  const calculateAndSave = () => {
    // Validation 1: Check winner selected
    if (!winnerId) {
      showWarning('Lỗi', 'Vui lòng chọn người thắng');
      return;
    }

    // Validation 2: Check all non-winner players have Gục or Tồn (unless Tới Trắng)
    if (!isWhiteWin) {
      const playersWithoutStatus = activeMatch.playerIds.filter(id => {
        if (id === winnerId) return false; // Skip winner
        const status = playerStatuses[id] ?? { isGuc: false, hasTon: false };
        return !status.isGuc && !status.hasTon; // Neither Gục nor Tồn
      });

      if (playersWithoutStatus.length > 0) {
        const playerNames = playersWithoutStatus.map(id => {
          const index = activeMatch.playerIds.indexOf(id);
          return activeMatch.playerNames[index];
        }).join(', ');
        
        showWarning(
          'Thiếu thông tin', 
          `Vui lòng chọn Gục hoặc Tồn cho: ${playerNames}`
        );
        return;
      }
    }

    // Validation 3: Check Cá Nước winner selected (if enabled)
    if (config.caNuoc.enabled && !caNuocWinnerId) {
      showWarning('Lỗi', 'Vui lòng chọn người ăn Cá Nước (bắt buộc)');
      return;
    }

    // Build outcome
    const outcome: SacTeRoundOutcome = {
      winnerId,
      isWhiteWin,
      playerStatuses: activeMatch.playerIds.map(id => ({
        playerId: id,
        isGuc: isWhiteWin ? (id !== winnerId) : (playerStatuses[id]?.isGuc ?? false),
        hasTon: isWhiteWin ? false : (playerStatuses[id]?.hasTon ?? false),
      })),
      caNuocWinnerId: caNuocWinnerId || undefined,
      caHeoWinnerId: caHeoWinnerId || undefined,
    };

    // Calculate scores
    const caHeoAccumulated = sacTeMatch.caHeoCurrentPot ?? 0;
    const caHeoRoundsAccumulated = sacTeMatch.caHeoRoundsAccumulated ?? 0;

    const scoringResult = calculateSacTeRoundScores(
      activeMatch.playerIds,
      outcome,
      config,
      caHeoAccumulated,
      caHeoRoundsAccumulated
    );

    // Show confirmation with score preview
    const scorePreview = activeMatch.playerIds
      .map(id => {
        const playerIndex = activeMatch.playerIds.indexOf(id);
        const playerName = activeMatch.playerNames[playerIndex];
        const score = scoringResult.roundScores[id];
        return `${playerName}: ${score > 0 ? '+' : ''}${score}`;
      })
      .join('\n');

    Alert.alert(
      'Xác nhận lưu ván',
      `Điểm ván này:\n\n${scorePreview}\n\nBạn có chắc muốn lưu?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Lưu', onPress: () => saveRound(outcome, scoringResult.roundScores) },
      ]
    );
  };

  const saveRound = async (outcome: SacTeRoundOutcome, roundScores: { [playerId: string]: number }) => {
    if (!activeMatch) {
      showWarning('Lỗi', 'Không tìm thấy trận đấu');
      return;
    }

    try {
      const sacTeMatch = activeMatch as unknown as SacTeMatch;
      const caHeoAccumulated = sacTeMatch.caHeoCurrentPot ?? 0;
      const caHeoRoundsAccumulated = sacTeMatch.caHeoRoundsAccumulated ?? 0;

      // Import and call addSacTeRound service
      const { addSacTeRound } = require('../services/sacTeMatchService');
      addSacTeRound(
        activeMatch.id,
        outcome,
        roundScores,
        caHeoAccumulated,
        caHeoRoundsAccumulated
      );

      // Refresh match to show updated data
      await refreshMatch();

      showSuccess('Thành công', 'Đã lưu ván đấu');
      navigation.goBack();
    } catch (error) {
      console.error('Error saving round:', error);
      showWarning('Lỗi', 'Không thể lưu ván đấu');
    }
  };

  const openConfigModal = () => {
    setEditedConfig({ ...config });
    setShowConfigModal(true);
  };

  const saveConfigChanges = async () => {
    if (!editedConfig || !activeMatch) return;

    // Validation
    if (editedConfig.heSoGuc <= 0 || editedConfig.heSoTon <= 0 || editedConfig.whiteWinMultiplier <= 0) {
      showWarning('Lỗi', 'Tất cả hệ số phải lớn hơn 0');
      return;
    }

    if (editedConfig.caNuoc.enabled && editedConfig.caNuoc.heSo <= 0) {
      showWarning('Lỗi', 'Hệ số Cá Nước phải lớn hơn 0');
      return;
    }

    if (editedConfig.caHeo.enabled && editedConfig.caHeo.heSo <= 0) {
      showWarning('Lỗi', 'Hệ số Cá Heo phải lớn hơn 0');
      return;
    }

    try {
      updateSacTeConfig(activeMatch.id, editedConfig);
      await refreshMatch();
      setShowConfigModal(false);
      showSuccess('Thành công', 'Đã cập nhật cấu hình');
    } catch (error) {
      console.error('Error updating config:', error);
      showWarning('Lỗi', 'Không thể cập nhật cấu hình');
    }
  };

  const updateConfigField = (field: keyof SacTeConfig, value: any) => {
    if (!editedConfig) return;
    setEditedConfig({ ...editedConfig, [field]: value });
  };

  const updateCaNuocConfig = (field: 'enabled' | 'heSo', value: any) => {
    if (!editedConfig) return;
    setEditedConfig({
      ...editedConfig,
      caNuoc: { ...editedConfig.caNuoc, [field]: value },
    });
  };

  const updateCaHeoConfig = (field: 'enabled' | 'heSo', value: any) => {
    if (!editedConfig) return;
    setEditedConfig({
      ...editedConfig,
      caHeo: { ...editedConfig.caHeo, [field]: value },
    });
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
            Ván {(sacTeMatch.rounds?.length || 0) + 1}
          </Text>
          {config.caHeo.enabled && (sacTeMatch.caHeoCurrentPot ?? 0) > 0 && (
            <Text style={[styles.subtitle, { color: theme.warning }]}>
              🐷 Cá Heo: {sacTeMatch.caHeoCurrentPot ?? 0} điểm ({sacTeMatch.caHeoRoundsAccumulated ?? 0} ván)
            </Text>
          )}
        </View>
        <TouchableOpacity onPress={openConfigModal} style={{ marginLeft: 12 }}>
          <Ionicons name="settings-outline" size={28} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeMatch.playerIds.map((playerId, index) => {
          const playerName = activeMatch.playerNames[index];
          const player = players[playerId];
          const playerColor = player?.color || theme.primary;
          const isWinner = winnerId === playerId;
          const status = playerStatuses[playerId] ?? { isGuc: false, hasTon: false };

          return (
            <Card key={playerId} accentColor={playerColor}>
              {/* Player Header */}
              <View style={styles.playerHeader}>
                <View style={[styles.playerAvatar, { backgroundColor: playerColor }]}>
                  {player?.avatar ? (
                    <Image source={{ uri: player.avatar }} style={styles.playerAvatarImage} />
                  ) : (
                    <Text style={styles.playerAvatarText}>{playerName.charAt(0).toUpperCase()}</Text>
                  )}
                </View>
                <Text style={[styles.playerName, { color: playerColor }]}>{playerName}</Text>
              </View>

              {/* Winner Selection */}
              <View style={styles.checkboxRow}>
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    { borderColor: theme.border },
                    isWinner && { backgroundColor: theme.success, borderColor: theme.success },
                  ]}
                  onPress={() => toggleWinner(playerId)}
                >
                  {isWinner && <Ionicons name="checkmark" size={20} color="#FFF" />}
                </TouchableOpacity>
                <Text style={[styles.checkboxLabel, { color: theme.text }]}>
                  {isWhiteWin ? '🌟 Tới Trắng' : '✅ Chiến Thắng'}
                </Text>
              </View>

              {/* White Win Toggle (only for winner) */}
              {isWinner && (
                <TouchableOpacity
                  style={[
                    styles.specialButton,
                    { backgroundColor: isWhiteWin ? theme.warning : theme.surface },
                  ]}
                  onPress={toggleWhiteWin}
                >
                  <Ionicons
                    name={isWhiteWin ? 'star' : 'star-outline'}
                    size={20}
                    color={isWhiteWin ? '#FFF' : theme.text}
                  />
                  <Text
                    style={[
                      styles.specialButtonText,
                      { color: isWhiteWin ? '#FFF' : theme.text },
                    ]}
                  >
                    Tới Trắng
                  </Text>
                </TouchableOpacity>
              )}

              {/* Status Checkboxes (not for winner, not for white win) */}
              {!isWinner && !isWhiteWin && (
                <View style={styles.statusRow}>
                  <TouchableOpacity
                    style={[
                      styles.statusButton,
                      { borderColor: theme.border },
                      status.isGuc && { backgroundColor: theme.error, borderColor: theme.error },
                    ]}
                    onPress={() => toggleGuc(playerId)}
                  >
                    <Text style={[styles.statusText, { color: theme.text }, status.isGuc && { color: '#FFF' }]}>
                      {status.isGuc ? '☠️ Gục' : 'Gục'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.statusButton,
                      { borderColor: theme.border },
                      status.hasTon && { backgroundColor: theme.warning, borderColor: theme.warning },
                    ]}
                    onPress={() => toggleTon(playerId)}
                  >
                    <Text style={[styles.statusText, { color: theme.text }, status.hasTon && { color: '#FFF' }]}>
                      {status.hasTon ? '⚠️ Tồn' : 'Tồn'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Pot Winners */}
              <View style={styles.potRow}>
                {config.caNuoc.enabled && (
                  <TouchableOpacity
                    style={[
                      styles.potButton,
                      { borderColor: theme.border },
                      caNuocWinnerId === playerId && { backgroundColor: theme.primary, borderColor: theme.primary },
                    ]}
                    onPress={() => toggleCaNuoc(playerId)}
                  >
                    <Text
                      style={[
                        styles.potText,
                        { color: theme.text },
                        caNuocWinnerId === playerId && { color: '#FFF' },
                      ]}
                    >
                      {caNuocWinnerId === playerId ? '💰 Cá Nước' : 'Cá Nước'}
                    </Text>
                  </TouchableOpacity>
                )}

                {config.caHeo.enabled && (
                  <TouchableOpacity
                    style={[
                      styles.potButton,
                      { borderColor: theme.border },
                      caHeoWinnerId === playerId && { backgroundColor: theme.success, borderColor: theme.success },
                    ]}
                    onPress={() => toggleCaHeo(playerId)}
                  >
                    <Text
                      style={[
                        styles.potText,
                        { color: theme.text },
                        caHeoWinnerId === playerId && { color: '#FFF' },
                      ]}
                    >
                      {caHeoWinnerId === playerId ? '🐷 Cá Heo' : 'Cá Heo'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </Card>
          );
        })}
      </ScrollView>

      <View style={styles.buttonWrapper}>
        <Button
          onPress={calculateAndSave}
          size="lg"
          style={{ width: '100%' }}
        >
          Tính điểm và lưu
        </Button>
      </View>

      {/* Config Modal */}
      <Modal
        visible={showConfigModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowConfigModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Cấu hình luật chơi</Text>
              <TouchableOpacity onPress={() => setShowConfigModal(false)}>
                <Ionicons name="close" size={28} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {editedConfig && (
                <>
                  {/* Hệ số Gục */}
                  <View style={styles.configRow}>
                    <Text style={[styles.configLabel, { color: theme.text }]}>Hệ số Gục</Text>
                    <TextInput
                      style={[styles.configInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                      value={editedConfig.heSoGuc.toString()}
                      onChangeText={(text) => updateConfigField('heSoGuc', parseInt(text) || 0)}
                      keyboardType="numeric"
                    />
                  </View>

                  {/* Hệ số Tồn */}
                  <View style={styles.configRow}>
                    <Text style={[styles.configLabel, { color: theme.text }]}>Hệ số Tồn</Text>
                    <TextInput
                      style={[styles.configInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                      value={editedConfig.heSoTon.toString()}
                      onChangeText={(text) => updateConfigField('heSoTon', parseInt(text) || 0)}
                      keyboardType="numeric"
                    />
                  </View>

                  {/* Hệ số Tới Trắng */}
                  <View style={styles.configRow}>
                    <Text style={[styles.configLabel, { color: theme.text }]}>Hệ số Tới Trắng</Text>
                    <TextInput
                      style={[styles.configInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                      value={editedConfig.whiteWinMultiplier.toString()}
                      onChangeText={(text) => updateConfigField('whiteWinMultiplier', parseInt(text) || 0)}
                      keyboardType="numeric"
                    />
                  </View>

                  {/* Cá Nước */}
                  <View style={styles.configSection}>
                    <View style={styles.configRowSwitch}>
                      <Text style={[styles.configLabel, { color: theme.text }]}>Cá Nước</Text>
                      <Switch
                        value={editedConfig.caNuoc.enabled}
                        onValueChange={(value) => updateCaNuocConfig('enabled', value)}
                        trackColor={{ false: theme.border, true: theme.primary }}
                      />
                    </View>
                    {editedConfig.caNuoc.enabled && (
                      <View style={styles.configRow}>
                        <Text style={[styles.configSubLabel, { color: theme.textSecondary }]}>Hệ số</Text>
                        <TextInput
                          style={[styles.configInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                          value={editedConfig.caNuoc.heSo.toString()}
                          onChangeText={(text) => updateCaNuocConfig('heSo', parseInt(text) || 0)}
                          keyboardType="numeric"
                        />
                      </View>
                    )}
                  </View>

                  {/* Cá Heo */}
                  <View style={styles.configSection}>
                    <View style={styles.configRowSwitch}>
                      <Text style={[styles.configLabel, { color: theme.text }]}>Cá Heo</Text>
                      <Switch
                        value={editedConfig.caHeo.enabled}
                        onValueChange={(value) => updateCaHeoConfig('enabled', value)}
                        trackColor={{ false: theme.border, true: theme.primary }}
                      />
                    </View>
                    {editedConfig.caHeo.enabled && (
                      <View style={styles.configRow}>
                        <Text style={[styles.configSubLabel, { color: theme.textSecondary }]}>Hệ số</Text>
                        <TextInput
                          style={[styles.configInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                          value={editedConfig.caHeo.heSo.toString()}
                          onChangeText={(text) => updateCaHeoConfig('heSo', parseInt(text) || 0)}
                          keyboardType="numeric"
                        />
                      </View>
                    )}
                  </View>
                </>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                variant="outline"
                onPress={() => setShowConfigModal(false)}
                style={{ flex: 1 }}
              >
                Hủy
              </Button>
              <Button
                onPress={saveConfigChanges}
                style={{ flex: 1 }}
              >
                Lưu
              </Button>
            </View>
          </View>
        </View>
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
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  playerCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  playerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  playerAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  playerAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  specialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  specialButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  statusButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  potRow: {
    flexDirection: 'row',
    gap: 8,
  },
  potButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  potText: {
    fontSize: 14,
    fontWeight: '600',
  },
  buttonWrapper: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  configRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  configRowSwitch: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  configLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  configSubLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  configInput: {
    width: 80,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    textAlign: 'center',
  },
  configSection: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
});
