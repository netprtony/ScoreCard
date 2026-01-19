import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
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
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { PlayerCard } from '../components/Card';
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
import { Button, Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter, Input } from '../components/rn-ui';
import { WallpaperBackground } from '../components/WallpaperBackground';

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

// Generate color grid (12 columns x 8 rows)
const generateColorGrid = (rows: number, cols: number): string[][] => {
  const grid: string[][] = [];
  
  for (let row = 0; row < rows; row++) {
    const rowColors: string[] = [];
    for (let col = 0; col < cols; col++) {
      const hue = (col / cols) * 360;
      const lightness = 100 - (row / (rows - 1)) * 100;
      const saturation = row === 0 ? 0 : 100;
      rowColors.push(hslToHex(hue, saturation, lightness));
    }
    grid.push(rowColors);
  }
  
  return grid;
};

// Generate random vibrant color
const generateRandomColor = (): string => {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 70 + Math.floor(Math.random() * 20); // 70-90%
  const lightness = 50 + Math.floor(Math.random() * 20);  // 50-70%
  return hslToHex(hue, saturation, lightness);
};

// Avatar directory
const AVATAR_DIR = FileSystem.documentDirectory + 'avatars/';

export const PlayerListScreen: React.FC = () => {
  const { theme } = useTheme();
  const [players, setPlayers] = useState<Player[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkAddModal, setShowBulkAddModal] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [bulkPlayerNames, setBulkPlayerNames] = useState('');
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(70);
  const [lightness, setLightness] = useState(60);
  const [selectedColor, setSelectedColor] = useState<string>(hslToHex(0, 70, 60));
  const [selectedAvatar, setSelectedAvatar] = useState<string | undefined>(undefined);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Modern color picker state
  const [colorPickerTab, setColorPickerTab] = useState<'grid' | 'spectrum'>('grid');
  const [opacity, setOpacity] = useState(100);
  const [recentColors, setRecentColors] = useState<string[]>([
    '#FF5733', '#000000', '#0099FF', '#00FF66', '#FF6600', '#9B59B6', '#E74C3C', '#3498DB'
  ]);

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

  const handleBulkAddPlayers = async () => {
    if (!bulkPlayerNames.trim()) {
      showWarning('Lỗi', 'Vui lòng nhập tên người chơi');
      return;
    }

    // Parse comma-separated names
    const names = bulkPlayerNames
      .split(',')
      .map(name => {
        const trimmed = name.trim();
        return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
      })
      .filter(name => name.length > 0);

    if (names.length === 0) {
      showWarning('Lỗi', 'Vui lòng nhập ít nhất một tên người chơi');
      return;
    }

    const currentCount = await getPlayerCount();
    const totalCount = currentCount + names.length;

    if (totalCount > 10) {
      showWarning('Lỗi', `Không thể thêm ${names.length} người chơi. Chỉ còn ${10 - currentCount} chỗ trống.`);
      return;
    }

    setLoading(true);
    try {
      // Create all players with random colors
      for (const name of names) {
        const randomColor = generateRandomColor();
        await createPlayer(name, randomColor, undefined);
      }

      setBulkPlayerNames('');
      setShowBulkAddModal(false);
      await loadPlayers();
      showSuccess('Thành công', `Đã thêm ${names.length} người chơi`);
    } catch (error) {
      console.error('Error adding players:', error);
      showWarning('Lỗi', 'Không thể thêm người chơi');
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

  const renderColorPicker = () => {
    const colorGrid = generateColorGrid(8, 12);
    
    return (
      <View style={styles.colorPickerContainer}>
        <Text style={[styles.colorPickerLabel, { color: theme.textSecondary }]}>
          Chọn màu:
        </Text>
        
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, colorPickerTab === 'grid' && styles.tabActive]}
            onPress={() => setColorPickerTab('grid')}
          >
            <Text style={[styles.tabText, colorPickerTab === 'grid' && styles.tabTextActive]}>
              Grid
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, colorPickerTab === 'spectrum' && styles.tabActive]}
            onPress={() => setColorPickerTab('spectrum')}
          >
            <Text style={[styles.tabText, colorPickerTab === 'spectrum' && styles.tabTextActive]}>
              Spectrum
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {colorPickerTab === 'grid' && (
          <View style={styles.colorGrid}>
            {colorGrid.map((row, i) => (
              <View key={i} style={styles.colorRow}>
                {row.map((color, j) => (
                  <TouchableOpacity
                    key={j}
                    style={[
                      styles.colorCell, 
                      { backgroundColor: color },
                      selectedColor === color && styles.colorCellSelected
                    ]}
                    onPress={() => setSelectedColor(color)}
                  />
                ))}
              </View>
            ))}
          </View>
        )}

        {colorPickerTab === 'spectrum' && (
          <View style={styles.spectrumContainer}>
            {/* Hue Slider with Rainbow Gradient */}
            <View style={styles.sliderContainer}>
              <Text style={[styles.sliderLabel, { color: theme.textSecondary }]}>Màu sắc (Hue)</Text>
              <View style={{ height: 40, justifyContent: 'center' }}>
                <LinearGradient
                  colors={['#FF0000', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#FF00FF', '#FF0000']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ position: 'absolute', left: 0, right: 0, top: 10, bottom: 10, borderRadius: 10 }}
                />
                <Slider
                  style={{ width: '100%', height: 40 }}
                  minimumValue={0}
                  maximumValue={360}
                  step={1}
                  value={hue}
                  onValueChange={setHue}
                  minimumTrackTintColor="transparent"
                  maximumTrackTintColor="transparent"
                  thumbTintColor="#FFFFFF"
                />
              </View>
            </View>

            {/* Saturation Slider with Gradient */}
            <View style={styles.sliderContainer}>
              <Text style={[styles.sliderLabel, { color: theme.textSecondary }]}>Độ đậm (Saturation)</Text>
              <View style={{ height: 40, justifyContent: 'center' }}>
                <LinearGradient
                  colors={[hslToHex(hue, 0, lightness), hslToHex(hue, 100, lightness)]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ position: 'absolute', left: 0, right: 0, top: 10, bottom: 10, borderRadius: 10 }}
                />
                <Slider
                  style={{ width: '100%', height: 40 }}
                  minimumValue={0}
                  maximumValue={100}
                  step={1}
                  value={saturation}
                  onValueChange={setSaturation}
                  minimumTrackTintColor="transparent"
                  maximumTrackTintColor="transparent"
                  thumbTintColor="#FFFFFF"
                />
              </View>
            </View>

            {/* Lightness Slider with Gradient */}
            <View style={styles.sliderContainer}>
               <Text style={[styles.sliderLabel, { color: theme.textSecondary }]}>Độ sáng (Lightness)</Text>
               <View style={{ height: 40, justifyContent: 'center' }}>
                <LinearGradient
                  colors={['#000000', hslToHex(hue, saturation, 50), '#FFFFFF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ position: 'absolute', left: 0, right: 0, top: 10, bottom: 10, borderRadius: 10 }}
                />
                <Slider
                   style={{ width: '100%', height: 40 }}
                   minimumValue={0}
                   maximumValue={100}
                   step={1}
                   value={lightness}
                   onValueChange={setLightness}
                   minimumTrackTintColor="transparent"
                   maximumTrackTintColor="transparent"
                   thumbTintColor="#FFFFFF"
                />
              </View>
            </View>
          </View>
        )}



        {/* Opacity Slider */}
        <View style={styles.opacityContainer}>
          <Text style={[styles.sliderLabel, { color: theme.textSecondary }]}>
            Opacity
          </Text>
          <View style={styles.opacitySliderWrapper}>
            <View style={styles.opacityPreview}>
              <View style={[styles.opacityColor, { backgroundColor: selectedColor, opacity: opacity / 100 }]} />
            </View>
            <Slider
              style={styles.opacitySlider}
              minimumValue={0}
              maximumValue={100}
              step={1}
              value={opacity}
              onValueChange={setOpacity}
              minimumTrackTintColor={selectedColor}
              maximumTrackTintColor={theme.border}
              thumbTintColor={selectedColor}
            />
            <Text style={[styles.opacityText, { color: theme.text }]}>
              {Math.round(opacity)}%
            </Text>
          </View>
        </View>

        {/* Recent Colors */}
        <View style={styles.recentColorsContainer}>
          {recentColors.map((color, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.recentColorSwatch, { backgroundColor: color }]}
              onPress={() => setSelectedColor(color)}
            />
          ))}
          <TouchableOpacity 
            style={[styles.addColorButton, { borderColor: theme.border }]}
            onPress={() => {
              if (!recentColors.includes(selectedColor)) {
                setRecentColors([selectedColor, ...recentColors.slice(0, 7)]);
              }
            }}
          >
            <Ionicons name="add" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* Color Preview */}
        <View style={styles.colorPreviewContainer}>
          <View style={[styles.colorPreview, { backgroundColor: selectedColor }]} />
          <Text style={[styles.colorHexText, { color: theme.text }]}>{selectedColor}</Text>
        </View>
      </View>
    );
  };

  return (
    <WallpaperBackground>
      <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>
          {i18n.t('playerList')}
        </Text>
        <Text style={[styles.count, { color: theme.text }]}>
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
            blurIntensity={100}
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
        style={[styles.fab, { backgroundColor: '#6c757d', bottom: 90 }, { marginBottom: 50, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 4 }]}
        onPress={() => setShowBulkAddModal(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="people" size={28} color="#FFF" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }, { marginBottom: 50 }]}
        onPress={() => setShowAddModal(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color="#FFF" />
      </TouchableOpacity>

      {/* Bulk Add Player Modal */}
      <Dialog
        visible={showBulkAddModal}
        onClose={() => setShowBulkAddModal(false)}
      >
        <DialogHeader>
          <DialogTitle>Thêm nhiều người chơi</DialogTitle>
        </DialogHeader>

        <DialogContent>
          <Input
            placeholder={`Nhập tên người chơi, ngăn cách bởi dấu phẩy\nVí dụ: An, Bình, Chi, Dũng`}
            value={bulkPlayerNames}
            onChangeText={setBulkPlayerNames}
            autoFocus
            multiline
            numberOfLines={4}
            containerStyle={{ marginBottom: 8, height: 120 }}
            style={{ height: 120, textAlignVertical: 'top', color: theme.text }}
          />
          <Text style={{ color: theme.textSecondary, fontSize: 13, fontStyle: 'italic' }}>
            * Mỗi người chơi sẽ được tạo với màu ngẫu nhiên
          </Text>
        </DialogContent>

        <DialogFooter>
          <Button
            size="lg"
            shape="rounded"
            variant="secondary"
            onPress={() => {
              setBulkPlayerNames('');
              setShowBulkAddModal(false);
            }}
            style={{ flex: 1, minHeight: 56, marginBottom: 45 }}
          >
            {i18n.t('cancel')}
          </Button>

          <Button
            size="lg"
            shape="rounded"
            variant="primary"
            onPress={handleBulkAddPlayers}
            loading={loading}
            disabled={loading}
            style={{ flex: 1, minHeight: 56, marginBottom: 45 }}
          >
            Thêm
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Add Player Modal */}
      <Dialog
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
      >
        <DialogHeader>
          <DialogTitle>{i18n.t('addPlayer')}</DialogTitle>
        </DialogHeader>

        <DialogContent scrollable>
          <Input
            placeholder={i18n.t('playerName')}
            value={playerName}
            onChangeText={setPlayerName}
            autoFocus
            containerStyle={{ marginBottom: 16 }}
          />

          {/* Avatar Picker */}
          {renderAvatarPicker()}

          {/* Color Picker */}
          {renderColorPicker()}
        </DialogContent>

        <DialogFooter>
          <Button
            size="lg"
            shape="rounded"
            variant="secondary"
            onPress={() => {
              setPlayerName('');
              setSelectedAvatar(undefined);
              setShowAddModal(false);
            }}
            style={{ flex: 1, minHeight: 56, marginBottom: 45 }}
          >
            {i18n.t('cancel')}
          </Button>

          <Button
            size="lg"
            shape="rounded"
            variant="primary"
            onPress={handleAddPlayer}
            loading={loading}
            disabled={loading}
            style={{ flex: 1, minHeight: 56, marginBottom: 45 }}
          >
            {i18n.t('save')}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Edit Player Modal */}
      <Dialog
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
      >
        <DialogHeader>
          <DialogTitle>{i18n.t('editPlayer')}</DialogTitle>
        </DialogHeader>

        <DialogContent scrollable>
          <Input
            placeholder={i18n.t('playerName')}
            value={playerName}
            onChangeText={setPlayerName}
            autoFocus
            containerStyle={{ marginBottom: 16 }}
          />

          {/* Avatar Picker */}
          {renderAvatarPicker()}

          {/* Color Picker */}
          {renderColorPicker()}
        </DialogContent>

        <DialogFooter>
          <Button
            size="lg"
            shape="rounded"
            variant="secondary"
            onPress={() => {
              setPlayerName('');
              setSelectedAvatar(undefined);
              setEditingPlayer(null);
              setShowEditModal(false);
            }}
            style={{ flex: 1, minHeight: 56 , marginBottom: 45}}
          >
            {i18n.t('cancel')}
          </Button>

          <Button
            size="lg"
            shape="rounded"
            variant="primary"
            onPress={handleEditPlayer}
            loading={loading}
            disabled={loading}
            style={{ flex: 1, minHeight: 56 , marginBottom: 45}}
          >
            {i18n.t('save')}
          </Button>
        </DialogFooter>
      </Dialog>
      </SafeAreaView>
    </WallpaperBackground>
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
  // Modern Color Picker Styles
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    marginTop: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
  tabTextActive: {
    color: '#FFF',
  },
  colorGrid: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  colorRow: {
    flexDirection: 'row',
  },
  colorCell: {
    flex: 1,
    aspectRatio: 1,
    borderWidth: 0,
  },
  colorCellSelected: {
    borderWidth: 3,
    borderColor: '#FFF',
  },
  spectrumContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  comingSoonText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  opacityContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  opacitySliderWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  opacityPreview: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  opacityColor: {
    width: '100%',
    height: '100%',
  },
  opacitySlider: {
    flex: 1,
  },
  opacityText: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 50,
    textAlign: 'right',
  },
  recentColorsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    marginBottom: 16,
  },
  recentColorSwatch: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  addColorButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
