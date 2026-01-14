import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  SafeAreaView,
  Image,
  ScrollView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useTheme } from '../contexts/ThemeContext';
import { PlayerCard } from '../components/PlayerCard';
import { Player } from '../types/models';
import {
  getAllPlayers,
  createPlayer,
  updatePlayer,
  deletePlayer,
  getPlayerCount,
} from '../services/playerService';
import { Fonts } from '../constants/fonts';
import i18n from '../utils/i18n';
import { showSuccess, showWarning } from '../utils/toast';

// Helper function to convert HSL to Hex
const hslToHex = (h: number, s: number, l: number): string => {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
};

// Avatar directory
const AVATAR_DIR = FileSystem.documentDirectory + 'avatars/';

export const PlayerListScreen: React.FC = () => {
  const { theme } = useTheme();
  const [players, setPlayers] = useState<Player[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(70);
  const [lightness, setLightness] = useState(60);
  const [selectedColor, setSelectedColor] = useState<string>(hslToHex(0, 70, 60));
  const [selectedAvatar, setSelectedAvatar] = useState<string | undefined>(undefined);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(false);

  // Update selectedColor when HSL values change
  useEffect(() => {
    setSelectedColor(hslToHex(hue, saturation, lightness));
  }, [hue, saturation, lightness]);

  useFocusEffect(
    useCallback(() => {
      loadPlayers();
      ensureAvatarDirectory();
    }, [])
  );

  const ensureAvatarDirectory = async () => {
    const dirInfo = await FileSystem.getInfoAsync(AVATAR_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(AVATAR_DIR, { intermediates: true });
    }
  };

  const loadPlayers = async () => {
    try {
      const data = await getAllPlayers();
      setPlayers(data);
    } catch (error) {
      console.error('Error loading players:', error);
    }
  };

  const saveAvatarToLocal = async (uri: string): Promise<string> => {
    const filename = `avatar_${Date.now()}.jpg`;
    const destPath = AVATAR_DIR + filename;
    await FileSystem.copyAsync({ from: uri, to: destPath });
    return destPath;
  };

  const pickImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showWarning('Lỗi', 'Cần cấp quyền truy cập thư viện ảnh');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const localUri = await saveAvatarToLocal(result.assets[0].uri);
      setSelectedAvatar(localUri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showWarning('Lỗi', 'Cần cấp quyền truy cập camera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const localUri = await saveAvatarToLocal(result.assets[0].uri);
      setSelectedAvatar(localUri);
    }
  };

  const removeAvatar = () => {
    setSelectedAvatar(undefined);
  };

  const handleAddPlayer = async () => {
    if (!playerName.trim()) {
      showWarning('Lỗi', i18n.t('errorPlayerName'));
      return;
    }

    const count = await getPlayerCount();
    if (count >= 10) {
      showWarning('Lỗi', i18n.t('maxPlayers'));
      return;
    }

    setLoading(true);
    try {
      await createPlayer(playerName.trim(), selectedColor, selectedAvatar);
      setPlayerName('');
      setHue(0);
      setSaturation(70);
      setLightness(60);
      setSelectedAvatar(undefined);
      setShowAddModal(false);
      await loadPlayers();
    } catch (error) {
      console.error('Error adding player:', error);
      showWarning('Lỗi', 'Không thể thêm người chơi');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPlayer = async () => {
    if (!playerName.trim() || !editingPlayer) {
      showWarning('Lỗi', i18n.t('errorPlayerName'));
      return;
    }

    setLoading(true);
    try {
      await updatePlayer(editingPlayer.id, playerName.trim(), selectedColor, selectedAvatar);
      setPlayerName('');
      setHue(0);
      setSaturation(70);
      setLightness(60);
      setSelectedAvatar(undefined);
      setEditingPlayer(null);
      setShowEditModal(false);
      await loadPlayers();
    } catch (error) {
      console.error('Error updating player:', error);
      showWarning('Lỗi', 'Không thể cập nhật người chơi');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlayer = (player: Player) => {
    Alert.alert(
      i18n.t('deletePlayer'),
      `${i18n.t('confirmDelete')} "${player.name}"?`,
      [
        { text: i18n.t('cancel'), style: 'cancel' },
        {
          text: i18n.t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePlayer(player.id);
              await loadPlayers();
            } catch (error) {
              console.error('Error deleting player:', error);
              showWarning('Lỗi', 'Không thể xóa người chơi');
            }
          },
        },
      ]
    );
  };

  const openEditModal = (player: Player) => {
    setEditingPlayer(player);
    setPlayerName(player.name);
    // Try to keep the existing color or use default
    if (player.color) {
      setSelectedColor(player.color);
      // Set HSL to default values when editing (user can adjust)
      setHue(0);
      setSaturation(70);
      setLightness(60);
    }
    setSelectedAvatar(player.avatar);
    setShowEditModal(true);
  };

  const renderAvatarPicker = () => (
    <View style={styles.avatarPickerContainer}>
      <Text style={[styles.colorPickerLabel, { color: theme.textSecondary }]}>
        Ảnh đại diện:
      </Text>
      <View style={styles.avatarPickerRow}>
        {/* Avatar Preview */}
        <View style={[styles.avatarPreview, { backgroundColor: selectedColor }]}>
          {selectedAvatar ? (
            <Image source={{ uri: selectedAvatar }} style={styles.avatarPreviewImage} />
          ) : (
            <Text style={styles.avatarPreviewText}>
              {playerName ? playerName.charAt(0).toUpperCase() : '?'}
            </Text>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.avatarActions}>
          <TouchableOpacity
            style={[styles.avatarButton, { backgroundColor: theme.primary }]}
            onPress={pickImageFromGallery}
          >
            <Ionicons name="images" size={20} color="#FFF" />
            <Text style={styles.avatarButtonText}>Thư viện</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.avatarButton, { backgroundColor: theme.success || '#52B788' }]}
            onPress={takePhoto}
          >
            <Ionicons name="camera" size={20} color="#FFF" />
            <Text style={styles.avatarButtonText}>Chụp ảnh</Text>
          </TouchableOpacity>

          {selectedAvatar && (
            <TouchableOpacity
              style={[styles.avatarButton, { backgroundColor: theme.error }]}
              onPress={removeAvatar}
            >
              <Ionicons name="trash" size={20} color="#FFF" />
              <Text style={styles.avatarButtonText}>Xóa</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  const renderColorPicker = () => (
    <View style={styles.colorPickerContainer}>
      <Text style={[styles.colorPickerLabel, { color: theme.textSecondary }]}>
        Chọn màu:
      </Text>
      
      {/* Color Preview */}
      <View style={styles.colorPreviewContainer}>
        <View style={[styles.colorPreview, { backgroundColor: selectedColor }]} />
        <Text style={[styles.colorHexText, { color: theme.text }]}>{selectedColor}</Text>
      </View>

      {/* Hue Slider */}
      <View style={styles.sliderContainer}>
        <Text style={[styles.sliderLabel, { color: theme.textSecondary }]}>
          Màu sắc (Hue: {Math.round(hue)}°)
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={360}
          value={hue}
          onValueChange={setHue}
          minimumTrackTintColor={hslToHex(hue, 100, 50)}
          maximumTrackTintColor={theme.border}
          thumbTintColor={hslToHex(hue, 100, 50)}
        />
      </View>

      {/* Saturation Slider */}
      <View style={styles.sliderContainer}>
        <Text style={[styles.sliderLabel, { color: theme.textSecondary }]}>
          Độ bão hòa: {Math.round(saturation)}%
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={100}
          value={saturation}
          onValueChange={setSaturation}
          minimumTrackTintColor={selectedColor}
          maximumTrackTintColor={theme.border}
          thumbTintColor={selectedColor}
        />
      </View>

      {/* Lightness Slider */}
      <View style={styles.sliderContainer}>
        <Text style={[styles.sliderLabel, { color: theme.textSecondary }]}>
          Độ sáng: {Math.round(lightness)}%
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={100}
          value={lightness}
          onValueChange={setLightness}
          minimumTrackTintColor={selectedColor}
          maximumTrackTintColor={theme.border}
          thumbTintColor={selectedColor}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>
          {i18n.t('playerList')}
        </Text>
        <Text style={[styles.count, { color: theme.textSecondary }]}>
          {players.length}/10 {i18n.t('players').toLowerCase()}
        </Text>
      </View>

      <FlatList
        data={players}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PlayerCard
            player={item}
            onEdit={() => openEditModal(item)}
            onDelete={() => handleDeletePlayer(item)}
            showActions
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color={theme.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Chưa có người chơi nào
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
              Nhấn nút + để thêm người chơi
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => setShowAddModal(true)}
      >
        <Ionicons name="add" size={32} color="#FFF" />
      </TouchableOpacity>

      {/* Add Player Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {i18n.t('addPlayer')}
            </Text>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              style={styles.modalScrollView}
            >
              <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.surface,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              placeholder={i18n.t('playerName')}
              placeholderTextColor={theme.placeholder}
              value={playerName}
              onChangeText={setPlayerName}
              autoFocus
            />

            {/* Avatar Picker */}
            {renderAvatarPicker()}

            {/* Color Picker */}
            {renderColorPicker()}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.surface }]}
                onPress={() => {
                  setPlayerName('');
                  setSelectedAvatar(undefined);
                  setShowAddModal(false);
                }}
              >
                <Text style={[styles.buttonText, { color: theme.text }]}>
                  {i18n.t('cancel')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.primary }]}
                onPress={handleAddPlayer}
                disabled={loading}
              >
                <Text style={[styles.buttonText, { color: '#FFF' }]}>
                  {i18n.t('save')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Player Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {i18n.t('editPlayer')}
            </Text>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              style={styles.modalScrollView}
            >
              <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.surface,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              placeholder={i18n.t('playerName')}
              placeholderTextColor={theme.placeholder}
              value={playerName}
              onChangeText={setPlayerName}
              autoFocus
            />

            {/* Avatar Picker */}
            {renderAvatarPicker()}

            {/* Color Picker */}
            {renderColorPicker()}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.surface }]}
                onPress={() => {
                  setPlayerName('');
                  setSelectedAvatar(undefined);
                  setEditingPlayer(null);
                  setShowEditModal(false);
                }}
              >
                <Text style={[styles.buttonText, { color: theme.text }]}>
                  {i18n.t('cancel')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.primary }]}
                onPress={handleEditPlayer}
                disabled={loading}
              >
                <Text style={[styles.buttonText, { color: '#FFF' }]}>
                  {i18n.t('save')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginBottom: 4,
  },
  count: {
    fontSize: 14,
  },
  list: {
    padding: 20,
    paddingTop: 8,
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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    borderRadius: 16,
    padding: 20,
    paddingBottom: 10,
    maxHeight: '85%',
  },
  modalScrollView: {
    maxHeight: '100%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  colorPickerScrollView: {
    maxHeight: 300,
  },
  colorPickerContainer: {
    marginBottom: 16,
  },
  colorPickerLabel: {
    fontSize: 14,
    marginBottom: 12,
    fontWeight: '500',
  },
  colorPreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  colorPreview: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  colorHexText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Fonts.medium,
  },
  sliderContainer: {
    marginBottom: 10,
  },
  sliderLabel: {
    fontSize: 13,
    marginBottom: 8,
    fontWeight: '500',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderRow: {
    position: 'relative',
    height: 40,
    justifyContent: 'center',
  },
  sliderTrack: {
    height: 8,
    borderRadius: 4,
    width: '100%',
  },
  hueGradient: {
    height: 8,
    borderRadius: 4,
  },
  sliderThumb: {
    position: 'absolute',
    width: '100%',
    height: 40,
  },
  sliderThumbInner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#333',
    top: 10,
    marginLeft: -10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  avatarPickerContainer: {
    marginBottom: 16,
  },
  avatarPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarPreview: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarPreviewImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarPreviewText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  avatarActions: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  avatarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  avatarButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
