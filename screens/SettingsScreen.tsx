import React, { useState, useEffect } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  Linking,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useTheme } from '../contexts/ThemeContext';
import { getSettings, updateSettings } from '../services/settingsService';
import { AppSettings } from '../types/models';
import i18n from '../utils/i18n';
import appJson from '../app.json';

export const SettingsScreen: React.FC = () => {
  const { theme, themeMode, setThemeMode } = useTheme();
  const [settings, setSettingsState] = useState<AppSettings | null>(null);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

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
    i18n.locale = lang;
    await updateSettings({ language: lang });
    await loadSettings();
  };

  const handleKeepScreenAwake = async (value: boolean) => {
    await updateSettings({ keepScreenAwake: value });
    await loadSettings();
  };

  if (!settings) {
    return null;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            {i18n.t('settings')}
          </Text>
        </View>

        {/* Theme Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {i18n.t('theme')}
          </Text>

          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <TouchableOpacity
              style={styles.option}
              onPress={() => handleThemeChange('light')}
            >
              <View style={styles.optionLeft}>
                <Ionicons name="sunny" size={24} color={theme.text} />
                <Text style={[styles.optionText, { color: theme.text }]}>
                  {i18n.t('light')}
                </Text>
              </View>
              {themeMode === 'light' && (
                <Ionicons name="checkmark" size={24} color={theme.primary} />
              )}
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <TouchableOpacity
              style={styles.option}
              onPress={() => handleThemeChange('dark')}
            >
              <View style={styles.optionLeft}>
                <Ionicons name="moon" size={24} color={theme.text} />
                <Text style={[styles.optionText, { color: theme.text }]}>
                  {i18n.t('dark')}
                </Text>
              </View>
              {themeMode === 'dark' && (
                <Ionicons name="checkmark" size={24} color={theme.primary} />
              )}
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <TouchableOpacity
              style={styles.option}
              onPress={() => handleThemeChange('system')}
            >
              <View style={styles.optionLeft}>
                <Ionicons name="phone-portrait" size={24} color={theme.text} />
                <Text style={[styles.optionText, { color: theme.text }]}>
                  {i18n.t('system')}
                </Text>
              </View>
              {themeMode === 'system' && (
                <Ionicons name="checkmark" size={24} color={theme.primary} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Language Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {i18n.t('language')}
          </Text>

          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <TouchableOpacity
              style={styles.option}
              onPress={() => handleLanguageChange('vi')}
            >
              <View style={styles.optionLeft}>
                <Text style={[styles.optionText, { color: theme.text }]}>
                  {i18n.t('vietnamese')}
                </Text>
              </View>
              {settings.language === 'vi' && (
                <Ionicons name="checkmark" size={24} color={theme.primary} />
              )}
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <TouchableOpacity
              style={styles.option}
              onPress={() => handleLanguageChange('en')}
            >
              <View style={styles.optionLeft}>
                <Text style={[styles.optionText, { color: theme.text }]}>
                  {i18n.t('english')}
                </Text>
              </View>
              {settings.language === 'en' && (
                <Ionicons name="checkmark" size={24} color={theme.primary} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Display Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Hiển thị
          </Text>

          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <View style={styles.option}>
              <View style={styles.optionLeft}>
                <Ionicons name="bulb" size={24} color={theme.text} />
                <Text style={[styles.optionText, { color: theme.text }]}>
                  {i18n.t('keepScreenOn')}
                </Text>
              </View>
              <Switch
                value={settings.keepScreenAwake}
                onValueChange={handleKeepScreenAwake}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="#FFF"
              />
            </View>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {i18n.t('about')}
          </Text>

          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <View style={styles.option}>
              <View style={styles.optionLeft}>
                <Ionicons name="information-circle" size={24} color={theme.text} />
                <View>
                  <Text style={[styles.optionText, { color: theme.text }]}>
                    {appJson.expo.name}
                  </Text>
                  <Text style={[styles.optionSubtext, { color: theme.textSecondary }]}>
                    {i18n.t('appDescription')}
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <View style={styles.option}>
              <View style={styles.optionLeft}>
                <Ionicons name="code-slash" size={24} color={theme.text} />
                <View>
                  <Text style={[styles.optionText, { color: theme.text }]}>
                    {i18n.t('version')}
                  </Text>
                  <Text style={[styles.optionSubtext, { color: theme.textSecondary }]}>
                    {appJson.expo.version}
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <TouchableOpacity 
              style={styles.option}
              onPress={() => setShowPrivacyModal(true)}
            >
              <View style={styles.optionLeft}>
                <Ionicons name="shield-checkmark" size={24} color={theme.text} />
                <Text style={[styles.optionText, { color: theme.text }]}>
                  {i18n.t('privacyPolicy')}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={theme.textSecondary} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

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
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            {i18n.t('privacyContent')}
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
              {"\n"}{"\n"}
              📧 Email: huynhvikhang6a13@gmail.com{"\n"}{"\n"}
            </Text>
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
    padding: 16,
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
    marginBottom: 12,
  },
});
