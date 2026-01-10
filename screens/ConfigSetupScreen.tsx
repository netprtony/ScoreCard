import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Player, GameType, ScoringConfig } from '../types/models';
import { getDefaultConfig } from '../services/configService';
import { createMatch } from '../services/matchService';
import { getPlayerById } from '../services/playerService';
import i18n from '../utils/i18n';

export const ConfigSetupScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { gameType, playerIds } = (route.params as any) || {};

  const [config, setConfig] = useState<ScoringConfig | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    loadDefaultConfig();
    loadPlayers();
  }, []);

  const loadDefaultConfig = () => {
    try {
      const defaultConfig = getDefaultConfig();
      if (defaultConfig) {
        setConfig(defaultConfig);
      }
    } catch (error) {
      console.error('Error loading config:', error);
    }
  };

  const loadPlayers = () => {
    if (!playerIds || playerIds.length !== 4) {
      console.error('Invalid playerIds:', playerIds);
      Alert.alert('Lỗi', 'Thông tin người chơi không hợp lệ');
      return;
    }

    try {
      const loadedPlayers: Player[] = [];
      for (const id of playerIds) {
        const player = getPlayerById(id);
        if (player) {
          loadedPlayers.push(player);
        }
      }
      
      if (loadedPlayers.length !== 4) {
        Alert.alert('Lỗi', 'Không thể tải thông tin người chơi');
        return;
      }
      
      setPlayers(loadedPlayers);
    } catch (error) {
      console.error('Error loading players:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin người chơi');
    }
  };

  const updateConfig = (field: keyof ScoringConfig, value: any) => {
    if (!config) return;
    setConfig({ ...config, [field]: value });
  };

  const handleStartMatch = () => {
    if (!config || !players || players.length !== 4) {
      Alert.alert('Lỗi', 'Thiếu thông tin cấu hình hoặc người chơi');
      return;
    }

    // Validate config
    if (config.baseRatioFirst <= config.baseRatioSecond) {
      Alert.alert('Lỗi', 'Hệ số 1 phải lớn hơn hệ số 2');
      return;
    }

    if (config.penaltyHeoDo <= config.penaltyHeoDen) {
      Alert.alert('Lỗi', 'Phạt heo đỏ phải lớn hơn heo đen');
      return;
    }

    try {
      const playerIdList = players.map((p: Player) => p.id);
      const playerNames = players.map((p: Player) => p.name);

      createMatch(gameType.id, playerIdList, playerNames, config);
      
      // Navigate to active match
      navigation.navigate('ActiveMatch' as never);
    } catch (error) {
      console.error('Error creating match:', error);
      Alert.alert('Lỗi', 'Không thể tạo trận đấu');
    }
  };

  if (!config) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.text }]}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={theme.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 16 }}>
          <Text style={[styles.title, { color: theme.text }]}>
            Cấu Hình Luật Chơi
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Tùy chỉnh hệ số và luật phạt
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Hệ số cơ bản */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Hệ Số Cơ Bản</Text>
          
          <View style={styles.inputRow}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Hệ số 1 (1st vs 4th):</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
              value={config.baseRatioFirst.toString()}
              onChangeText={(text) => updateConfig('baseRatioFirst', parseInt(text) || 0)}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputRow}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Hệ số 2 (2nd vs 3rd):</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
              value={config.baseRatioSecond.toString()}
              onChangeText={(text) => updateConfig('baseRatioSecond', parseInt(text) || 0)}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Tới Trắng */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <View style={styles.switchRow}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Tới Trắng</Text>
            <Switch
              value={config.enableToiTrang}
              onValueChange={(value) => updateConfig('enableToiTrang', value)}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFF"
            />
          </View>
          
          {config.enableToiTrang && (
            <View style={styles.inputRow}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Hệ số nhân:</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                value={config.toiTrangMultiplier.toString()}
                onChangeText={(text) => updateConfig('toiTrangMultiplier', parseInt(text) || 0)}
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
              value={config.enableKill}
              onValueChange={(value) => updateConfig('enableKill', value)}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFF"
            />
          </View>
          
          {config.enableKill && (
            <View style={styles.inputRow}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Hệ số nhân:</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                value={config.killMultiplier.toString()}
                onChangeText={(text) => updateConfig('killMultiplier', parseInt(text) || 0)}
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
              value={config.enablePenalties}
              onValueChange={(value) => updateConfig('enablePenalties', value)}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFF"
            />
          </View>
          
          {config.enablePenalties && (
            <>
              <View style={styles.inputRow}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Heo đen:</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                  value={config.penaltyHeoDen.toString()}
                  onChangeText={(text) => updateConfig('penaltyHeoDen', parseInt(text) || 0)}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputRow}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Heo đỏ:</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                  value={config.penaltyHeoDo.toString()}
                  onChangeText={(text) => updateConfig('penaltyHeoDo', parseInt(text) || 0)}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputRow}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>3 tép:</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                  value={config.penaltyBaTep.toString()}
                  onChangeText={(text) => updateConfig('penaltyBaTep', parseInt(text) || 0)}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputRow}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>3 đôi thông:</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                  value={config.penaltyBaDoiThong.toString()}
                  onChangeText={(text) => updateConfig('penaltyBaDoiThong', parseInt(text) || 0)}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputRow}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Tứ quý:</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                  value={config.penaltyTuQuy.toString()}
                  onChangeText={(text) => updateConfig('penaltyTuQuy', parseInt(text) || 0)}
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
              value={config.enableChatHeo}
              onValueChange={(value) => updateConfig('enableChatHeo', value)}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFF"
            />
          </View>
          
          {config.enableChatHeo && (
            <>
              <View style={styles.inputRow}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Heo đen:</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                  value={config.chatHeoBlack.toString()}
                  onChangeText={(text) => updateConfig('chatHeoBlack', parseInt(text) || 0)}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputRow}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Heo đỏ:</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                  value={config.chatHeoRed.toString()}
                  onChangeText={(text) => updateConfig('chatHeoRed', parseInt(text) || 0)}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputRow}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Hệ số chồng:</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                  value={config.chongHeoMultiplier.toString()}
                  onChangeText={(text) => updateConfig('chongHeoMultiplier', parseInt(text) || 0)}
                  keyboardType="numeric"
                />
              </View>
            </>
          )}
        </View>

        {/* Đút 3 Tép */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <View style={styles.switchRow}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Đút 3 Tép</Text>
            <Switch
              value={config.enableDutBaTep}
              onValueChange={(value) => updateConfig('enableDutBaTep', value)}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFF"
            />
          </View>
          
          {config.enableDutBaTep && (
            <View style={styles.inputRow}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Điểm:</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                value={config.dutBaTep.toString()}
                onChangeText={(text) => updateConfig('dutBaTep', parseInt(text) || 0)}
                keyboardType="numeric"
              />
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.startButton, { backgroundColor: theme.primary }]}
        onPress={handleStartMatch}
      >
        <Text style={styles.startButtonText}>Bắt Đầu Trận Đấu</Text>
      </TouchableOpacity>
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
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
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
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    textAlign: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  startButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
});
