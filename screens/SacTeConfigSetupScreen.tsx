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
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Player, GameType, SacTeConfig } from '../types/models';
import { getDefaultSacTeConfig } from '../services/sacTeConfigService';
import { getPlayerById } from '../services/playerService';
import { showSuccess, showWarning } from '../utils/toast';
import { Button } from '../components/rn-ui';
import { Card } from '../components/Card';
import { WallpaperBackground } from '../components/WallpaperBackground';

export const SacTeConfigSetupScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const navigation = useNavigation();
  const route = useRoute();
  const { gameType, playerIds } = (route.params as any) || {};

  const [config, setConfig] = useState<SacTeConfig | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    loadDefaultConfig();
    loadPlayers();
  }, []);

  const loadDefaultConfig = () => {
    try {
      const defaultConfig = getDefaultSacTeConfig();
      if (defaultConfig) {
        setConfig(defaultConfig);
      }
    } catch (error) {
      console.error('Error loading config:', error);
    }
  };

  const loadPlayers = () => {
    if (!playerIds || playerIds.length < 2 || playerIds.length > 5) {
      console.error('Invalid playerIds:', playerIds);
      showWarning(t('error'), 'Số người chơi không hợp lệ (2-5 người)');
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
      
      if (loadedPlayers.length < 2) {
        showWarning(t('error'), 'Không thể tải thông tin người chơi');
        return;
      }
      
      setPlayers(loadedPlayers);
    } catch (error) {
      console.error('Error loading players:', error);
      showWarning(t('error'), 'Không thể tải thông tin người chơi');
    }
  };

  const updateConfig = (field: keyof SacTeConfig, value: any) => {
    if (!config) return;
    setConfig({ ...config, [field]: value });
  };

  const updateCaNuoc = (field: 'enabled' | 'heSo', value: any) => {
    if (!config) return;
    setConfig({
      ...config,
      caNuoc: { ...config.caNuoc, [field]: value }
    });
  };

  const updateCaHeo = (field: 'enabled' | 'heSo', value: any) => {
    if (!config) return;
    setConfig({
      ...config,
      caHeo: { ...config.caHeo, [field]: value }
    });
  };

  const handleStartMatch = () => {
    if (!config || !players || players.length < 2) {
      showWarning(t('error'), 'Thiếu thông tin cấu hình hoặc người chơi');
      return;
    }

    // Validate config
    if (config.heSoGuc <= 0 || config.heSoTon <= 0) {
      showWarning(t('error'), 'Hệ số phải lớn hơn 0');
      return;
    }

    try {
      const playerIdList = players.map((p: Player) => p.id);
      const playerNames = players.map((p: Player) => p.name);

      // Import and use createSacTeMatch
      const { createSacTeMatch } = require('../services/sacTeMatchService');
      createSacTeMatch(playerIdList, playerNames, config);
      
      showSuccess('Thành công', 'Đã tạo trận đấu Sắc Tê');
      navigation.navigate('ActiveMatch' as never);
    } catch (error) {
      console.error('Error creating match:', error);
      showWarning(t('error'), 'Không thể tạo trận đấu');
    }
  };

  if (!config) {
    return (
      <WallpaperBackground>
        <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.text }]}>Đang tải...</Text>
        </View>
        </SafeAreaView>
      </WallpaperBackground>
    );
  }

  return (
    <WallpaperBackground>
      <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={theme.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 16 }}>
          <Text style={[styles.title, { color: theme.text }]}>
            Cấu hình Sắc Tê
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {players.length} người chơi
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Hệ số cơ bản */}
        <Card  style={{ marginBottom: 16 }}>
          <View style={{ padding: 4 }}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Hệ số cơ bản</Text>
            
            <View style={styles.inputRow}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Hệ số Gục:</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                value={(config.heSoGuc ?? 0).toString()}
                onChangeText={(text) => updateConfig('heSoGuc', parseInt(text) || 0)}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputRow}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Hệ số Tồn:</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                value={(config.heSoTon ?? 0).toString()}
                onChangeText={(text) => updateConfig('heSoTon', parseInt(text) || 0)}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputRow}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Hệ số Tới Trắng:</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                value={(config.whiteWinMultiplier ?? 0).toString()}
                onChangeText={(text) => updateConfig('whiteWinMultiplier', parseInt(text) || 0)}
                keyboardType="numeric"
              />
            </View>
          </View>
        </Card>

        {/* Cá Nước */}
        <Card  style={{ marginBottom: 16 }}>
          <View style={{ padding: 4 }}>
            <View style={styles.switchRow}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Cá Nước</Text>
              <Switch
                value={config.caNuoc.enabled}
                onValueChange={(value) => updateCaNuoc('enabled', value)}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="#FFF"
              />
            </View>
            
            {config.caNuoc.enabled && (
              <View style={styles.inputRow}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Hệ số:</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                  value={(config.caNuoc?.heSo ?? 0).toString()}
                  onChangeText={(text) => updateCaNuoc('heSo', parseInt(text) || 0)}
                  keyboardType="numeric"
                />
              </View>
            )}
          </View>
        </Card>

        {/* Cá Heo */}
        <Card style={{ marginBottom: 16 }}>
          <View style={{ padding: 4 }}>
            <View style={styles.switchRow}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Cá Heo</Text>
              <Switch
                value={config.caHeo.enabled}
                onValueChange={(value) => updateCaHeo('enabled', value)}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="#FFF"
              />
            </View>
            
            {config.caHeo.enabled && (
              <View style={styles.inputRow}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Hệ số:</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                  value={(config.caHeo?.heSo ?? 0).toString()}
                  onChangeText={(text) => updateCaHeo('heSo', parseInt(text) || 0)}
                  keyboardType="numeric"
                />
              </View>
            )}
          </View>
        </Card>
      </ScrollView>

      <View style={styles.buttonWrapper}>
        <Button
          onPress={handleStartMatch}
          size="lg"
          style={{ width: '100%' }}
        >
          {t('start_match')}
        </Button>
      </View>
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
  buttonWrapper: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
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
