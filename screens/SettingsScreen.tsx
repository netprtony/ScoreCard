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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useTheme } from '../contexts/ThemeContext';
import { getSettings, updateSettings } from '../services/settingsService';
import { AppSettings } from '../types/models';
import i18n from '../utils/i18n';

export const SettingsScreen: React.FC = () => {
  const { theme, themeMode, setThemeMode } = useTheme();
  const [settings, setSettingsState] = useState<AppSettings | null>(null);

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
                    {i18n.t('appName')}
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
                    1.0.0
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <TouchableOpacity style={styles.option}>
              <View style={styles.optionLeft}>
                <Ionicons name="shield-checkmark" size={24} color={theme.text} />
                <Text style={[styles.optionText, { color: theme.text }]}>
                  {i18n.t('privacy')}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            {i18n.t('privacyContent')}
          </Text>
        </View>
      </ScrollView>
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
});
