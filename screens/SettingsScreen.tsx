import React, { useState, useEffect } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch as RNSwitch,
  SafeAreaView,
  Linking,
  Modal,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

import { useWallpaper, WALLPAPER_DEFINITIONS } from '../contexts/WallpaperContext';
import { getSettings, updateSettings } from '../services/settingsService';
import { AppSettings } from '../types/models';
import appJson from '../app.json';
import { Separator, Dialog, DialogHeader, DialogTitle, DialogContent } from '../components/rn-ui';
import { Card } from '../components/Card';
import { WallpaperBackground } from '../components/WallpaperBackground';

export const SettingsScreen: React.FC = () => {
  const { theme, themeMode, setThemeMode } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { wallpaper, setWallpaper } = useWallpaper();
  const [settings, setSettingsState] = useState<AppSettings | null>(null);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showWallpaperModal, setShowWallpaperModal] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (settings?.keepScreenAwake) {
      activateKeepAwakeAsync();
    } else {
      deactivateKeepAwake();
    }
  }, [settings?.keepScreenAwake]);

  const loadSettings = async () => {
    const data = await getSettings();
    setSettingsState(data);
  };

  const handleThemeChange = async (mode: 'light' | 'dark' | 'system') => {
    await setThemeMode(mode);
    await loadSettings();
  };

  const handleLanguageChange = async (lang: 'vi' | 'en') => {
    await setLanguage(lang);
    await loadSettings();
  };

  const handleKeepScreenAwake = async (value: boolean) => {
    await updateSettings({ keepScreenAwake: value });
    await loadSettings();
  };

  const handleWallpaperSelect = async (wallpaperId: string) => {
    await setWallpaper(wallpaperId);
    setShowWallpaperModal(false);
  };



  if (!settings) {
    return null;
  }

  return (
    <WallpaperBackground>
      <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            {t('settings')}
          </Text>
        </View>

        {/* Theme Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {t('theme')}
          </Text>

          <Card blurIntensity={20}>
            <TouchableOpacity
              style={styles.option}
              onPress={() => handleThemeChange('light')}
            >
              <View style={styles.optionLeft}>
                <Ionicons name="sunny" size={24} color={theme.text} />
                <Text style={[styles.optionText, { color: theme.text }]}>
                  {t('light')}
                </Text>
              </View>
              {themeMode === 'light' && (
                <Ionicons name="checkmark" size={24} color={theme.primary} />
              )}
            </TouchableOpacity>

            <Separator />

            <TouchableOpacity
              style={styles.option}
              onPress={() => handleThemeChange('dark')}
            >
              <View style={styles.optionLeft}>
                <Ionicons name="moon" size={24} color={theme.text} />
                <Text style={[styles.optionText, { color: theme.text }]}>
                  {t('dark')}
                </Text>
              </View>
              {themeMode === 'dark' && (
                <Ionicons name="checkmark" size={24} color={theme.primary} />
              )}
            </TouchableOpacity>

            <Separator />

            <TouchableOpacity
              style={styles.option}
              onPress={() => handleThemeChange('system')}
            >
              <View style={styles.optionLeft}>
                <Ionicons name="phone-portrait" size={24} color={theme.text} />
                <Text style={[styles.optionText, { color: theme.text }]}>
                  {t('system')}
                </Text>
              </View>
              {themeMode === 'system' && (
                <Ionicons name="checkmark" size={24} color={theme.primary} />
              )}
            </TouchableOpacity>
          </Card>
        </View>

        {/* Language Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {t('language')}
          </Text>

          <Card blurIntensity={15}>
            <TouchableOpacity
              style={styles.option}
              onPress={() => handleLanguageChange('vi')}
            >
              <View style={styles.optionLeft}>
                <Text style={[styles.optionText, { color: theme.text }]}>
                  {t('vietnamese')}
                </Text>
              </View>
              {language === 'vi' && (
                <Ionicons name="checkmark" size={24} color={theme.primary} />
              )}
            </TouchableOpacity>

            <Separator />

            <TouchableOpacity
              style={styles.option}
              onPress={() => handleLanguageChange('en')}
            >
              <View style={styles.optionLeft}>
                <Text style={[styles.optionText, { color: theme.text }]}>
                  {t('english')}
                </Text>
              </View>
              {language === 'en' && (
                <Ionicons name="checkmark" size={24} color={theme.primary} />
              )}
            </TouchableOpacity>
          </Card>
        </View>

        {/* Display Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {t('display')}
          </Text>

          <Card blurIntensity={15}>
            <TouchableOpacity
              style={styles.option}
              onPress={() => setShowWallpaperModal(true)}
            >
              <View style={styles.optionLeft}>
                <Ionicons name="image" size={24} color={theme.text} />
                <Text style={[styles.optionText, { color: theme.text }]}>
                  Hình nền
                </Text>
              </View>
              <View style={styles.optionRight}>
                <Text style={[styles.optionSubtext, { color: theme.textSecondary }]}>
                  {wallpaper.id === 'default' ? 'Mặc định' : 'Tùy chỉnh'}
                </Text>
                <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
              </View>
            </TouchableOpacity>

            <Separator />

            <View style={styles.option}>
              <View style={styles.optionLeft}>
                <Ionicons name="bulb" size={24} color={theme.text} />
                <Text style={[styles.optionText, { color: theme.text }]}>
                  {t('keepScreenOn')}
                </Text>
              </View>
              <RNSwitch
                value={settings.keepScreenAwake}
                onValueChange={handleKeepScreenAwake}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="#FFF"
              />
            </View>
          </Card>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {t('about')}
          </Text>

          <Card blurIntensity={20}>
            <View style={styles.option}>
              <View style={styles.optionLeft}>
                <Ionicons name="information-circle" size={24} color={theme.text} />
                <View>
                  <Text style={[styles.optionText, { color: theme.text }]}>
                    {appJson.expo.name}
                  </Text>
                  <Text style={[styles.optionSubtext, { color: theme.textSecondary }]}>
                    {t('appDescription')}
                  </Text>
                </View>
              </View>
            </View>

            <Separator />

            <View style={styles.option}>
              <View style={styles.optionLeft}>
                <Ionicons name="code-slash" size={24} color={theme.text} />
                <View>
                  <Text style={[styles.optionText, { color: theme.text }]}>
                    {t('version')}
                  </Text>
                  <Text style={[styles.optionSubtext, { color: theme.textSecondary }]}>
                    {appJson.expo.version}
                  </Text>
                </View>
              </View>
            </View>

            <Separator />

            <TouchableOpacity 
              style={styles.option}
              onPress={() => setShowPrivacyModal(true)}
            >
              <View style={styles.optionLeft}>
                <Ionicons name="shield-checkmark" size={24} color={theme.text} />
                <Text style={[styles.optionText, { color: theme.text }]}>
                  {t('privacyPolicy')}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={theme.textSecondary} />
            </TouchableOpacity>

            <Separator />

            <TouchableOpacity 
              style={styles.option}
              onPress={async () => {
                Alert.alert(
                  'Reset App',
                  'Xóa tất cả dữ liệu và reset về trạng thái ban đầu? (Dùng để test onboarding)',
                  [
                    { text: 'Hủy', style: 'cancel' },
                    {
                      text: 'Reset',
                      style: 'destructive',
                      onPress: async () => {
                        const { clearDatabase } = await import('../services/database');
                        clearDatabase();
                        if (typeof window !== 'undefined') {
                          window.location.reload();
                        }
                      }
                    }
                  ]
                );
              }}
            >
              <View style={styles.optionLeft}>
                <Ionicons name="refresh" size={24} color={theme.error} />
                <Text style={[styles.optionText, { color: theme.error }]}>
                  Reset App (Test Only)
                </Text>
              </View>
            </TouchableOpacity>
          </Card>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            {t('privacyContent')}
          </Text>
        </View>
      </ScrollView>

      {/* Privacy Policy Modal */}
      <Modal
        visible={showPrivacyModal}
        animationType="slide"
        onRequestClose={() => setShowPrivacyModal(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Privacy Policy</Text>
            <TouchableOpacity onPress={() => setShowPrivacyModal(false)}>
              <Ionicons name="close" size={28} color={theme.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Text style={[styles.lastUpdated, { color: theme.textSecondary }]}>
              Last updated: 12/01/2026
            </Text>

            <Text style={[styles.policyText, { color: theme.text }]}>
              The Koya Score application ("App", "we") respects and is committed to protecting user privacy. This Privacy Policy explains how information is handled when you use the App.
            </Text>

            <Text style={[styles.policyTitle, { color: theme.text }]}>
              1. Purpose of the App
            </Text>
            <Text style={[styles.policyText, { color: theme.text }]}>
              Koya Score is a score tracking application for popular card games in Vietnam, including Poker, Tiến Lên, Sắc Tê, Phỏm, and other recreational card games.
              {"\n"}{"\n"}
              The App is for entertainment purposes only and does not support, encourage, or involve gambling or real-money activities.
            </Text>

            <Text style={[styles.policyTitle, { color: theme.text }]}>
              2. Information Collection
            </Text>

            <Text style={[styles.policyText, { color: theme.text }]}>
              The App does not require account registration and does not directly collect personal information such as name, email, phone number, or address.
              {"\n"}{"\n"}
              All score data and game history are stored locally on the user's device.
            </Text>

            <Text style={[styles.policyText, { color: theme.text }]}>
              The App uses third-party advertising services (such as Google AdMob). These services may collect non-personal information, including Advertising ID, device information, and anonymized usage data, for the purpose of displaying and improving advertisements.
            </Text>

            <Text style={[styles.policyTitle, { color: theme.text }]}>
              3. Use of Information
            </Text>
            <Text style={[styles.policyText, { color: theme.text }]}>
              Information (if any) is used solely to display advertisements, improve app performance, and ensure stable operation. We do not sell or share personal data with third parties, except as required for advertising services.
            </Text>

            <Text style={[styles.policyTitle, { color: theme.text }]}>
              4. Data Storage and Security
            </Text>
            <Text style={[styles.policyText, { color: theme.text }]}>
              All game data is stored locally on the user's device. We do not store user data on external servers. Users may delete all data by clearing app data or uninstalling the App.
            </Text>

            <Text style={[styles.policyTitle, { color: theme.text }]}>
              5. Children
            </Text>
            <Text style={[styles.policyText, { color: theme.text }]}>
              The App is not intended for users under the age of 18. We do not knowingly collect personal information from children.
            </Text>

            <Text style={[styles.policyTitle, { color: theme.text }]}>
              6. Third-Party Links
            </Text>
            <Text style={[styles.policyText, { color: theme.text }]}>
              The App may display advertisements or links to third-party websites. We are not responsible for the content or privacy practices of these third parties.
            </Text>

            <Text style={[styles.policyTitle, { color: theme.text }]}>
              7. Policy Updates
            </Text>
            <Text style={[styles.policyText, { color: theme.text }]}>
              This Privacy Policy may be updated from time to time. Any changes will be reflected within the App or on its Google Play listing.
            </Text>

            <Text style={[styles.policyTitle, { color: theme.text }]}>
              8. Contact
            </Text>
            <Text style={[styles.policyText, { color: theme.text }]}>
              If you have any questions regarding this Privacy Policy, please contact:
            </Text>
          </ScrollView>

        </SafeAreaView>
      </Modal>

      {/* Wallpaper Selection Modal */}
      <Dialog
        visible={showWallpaperModal}
        onClose={() => setShowWallpaperModal(false)}
      >
        <DialogHeader>
          <DialogTitle>Chọn hình nền</DialogTitle>
        </DialogHeader>
        <DialogContent scrollable>
          {/* Default Option */}
          <TouchableOpacity
            style={[
              styles.wallpaperOption,
              {
                backgroundColor: theme.card,
                borderColor: wallpaper.id === 'default' ? theme.primary : theme.border,
                borderWidth: 2,
              }
            ]}
            onPress={() => handleWallpaperSelect('default')}
          >
            <View style={[styles.wallpaperPreview, { backgroundColor: theme.background }]}>
              <Ionicons name="close" size={32} color={theme.textSecondary} />
            </View>
            <Text style={[styles.wallpaperName, { color: theme.text }]}>Mặc định</Text>
            {wallpaper.id === 'default' && (
              <Ionicons name="checkmark-circle" size={24} color={theme.primary} style={styles.wallpaperCheck} />
            )}
          </TouchableOpacity>

          {/* Wallpaper Grid */}
          <View style={styles.wallpaperGrid}>
            {Object.values(WALLPAPER_DEFINITIONS)
              .filter(w => w.id !== 'default')
              .map((wallpaperItem) => (
                <TouchableOpacity
                  key={wallpaperItem.id}
                  style={[
                    styles.wallpaperOption,
                    {
                      backgroundColor: theme.card,
                      borderColor: wallpaper.id === wallpaperItem.id ? theme.primary : theme.border,
                      borderWidth: 2,
                      width: '48%', // 2 items per row with gap
                    }
                  ]}
                  onPress={() => handleWallpaperSelect(wallpaperItem.id)}
                >
                  <View style={styles.wallpaperPreview}>
                    <Image
                      source={wallpaperItem.source}
                      style={styles.imagePreview}
                      resizeMode="cover"
                    />
                  </View>
                  <Text style={[styles.wallpaperName, { color: theme.text }]} numberOfLines={1}>
                    {wallpaperItem.name}
                  </Text>
                  {wallpaper.id === wallpaperItem.id && (
                    <Ionicons name="checkmark-circle" size={24} color={theme.primary} style={styles.wallpaperCheck} />
                  )}
                </TouchableOpacity>
              ))}
          </View>
        </DialogContent>
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
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  card: {
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  optionText: {
    fontSize: 16,
  },
  optionSubtext: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginLeft: 52,
  },
  footer: {
    padding: 20,
    paddingTop: 0,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  lastUpdated: {
    fontSize: 12,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  policyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  policySubtitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
  },
  policyText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  wallpaperOption: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    position: 'relative',
  },
  wallpaperPreview: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  wallpaperName: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  wallpaperCheck: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  categorySection: {
    marginTop: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  wallpaperGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    marginTop: 12,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
});
