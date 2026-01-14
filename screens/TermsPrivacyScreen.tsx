import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { updateSettings } from '../services/settingsService';
import i18n from '../utils/i18n';

export const TermsPrivacyScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  const canContinue = acceptedTerms && acceptedPrivacy;

  const handleViewTerms = () => {
    // Navigate to settings screen to show full terms
    navigation.navigate('Settings' as never);
  };

  const handleViewPrivacy = () => {
    // Navigate to settings screen to show full privacy policy
    navigation.navigate('Settings' as never);
  };

  const handleContinue = () => {
    if (!canContinue) return;

    // Save acceptance to settings
    // AppNavigator will detect this change and automatically show MainApp
    updateSettings({
      hasAcceptedTerms: true,
      hasCompletedOnboarding: true,
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: theme.warning + '20' }]}>
            <Ionicons name="document-text" size={60} color={theme.warning} />
          </View>

          <Text style={[styles.title, { color: theme.text }]}>
            {i18n.t('termsAndPrivacy')}
          </Text>

          <Text style={[styles.description, { color: theme.textSecondary }]}>
            {i18n.t('termsContent1')}
          </Text>
        </View>

        {/* Full Privacy Policy Content */}
        <View style={styles.policyContainer}>
          <Text style={[styles.policyIntro, { color: theme.text }]}>
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
            📧 Email: huynhvikhang6a13@gmail.com
          </Text>
        </View>


        {/* Checkboxes */}
        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setAcceptedTerms(!acceptedTerms)}
          >
            <View
              style={[
                styles.checkboxBox,
                {
                  backgroundColor: acceptedTerms ? theme.primary : 'transparent',
                  borderColor: acceptedTerms ? theme.primary : theme.border,
                },
              ]}
            >
              {acceptedTerms && <Ionicons name="checkmark" size={18} color="#FFF" />}
            </View>
            <Text style={[styles.checkboxText, { color: theme.text }]}>
              {i18n.t('termsOfService')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setAcceptedPrivacy(!acceptedPrivacy)}
          >
            <View
              style={[
                styles.checkboxBox,
                {
                  backgroundColor: acceptedPrivacy ? theme.primary : 'transparent',
                  borderColor: acceptedPrivacy ? theme.primary : theme.border,
                },
              ]}
            >
              {acceptedPrivacy && <Ionicons name="checkmark" size={18} color="#FFF" />}
            </View>
            <Text style={[styles.checkboxText, { color: theme.text }]}>
              {i18n.t('privacyPolicy')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Warning if not accepted */}
        {!canContinue && (
          <View style={[styles.warningBox, { backgroundColor: theme.error + '15' }]}>
            <Ionicons name="alert-circle" size={20} color={theme.error} />
            <Text style={[styles.warningText, { color: theme.error }]}>
              {i18n.t('mustAcceptTerms')}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: canContinue ? theme.primary : theme.border,
            },
          ]}
          onPress={handleContinue}
          disabled={!canContinue}
        >
          <Text style={[styles.buttonText, { opacity: canContinue ? 1 : 0.5 }]}>
            {i18n.t('confirm')} & {i18n.t('continue')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  policyContainer: {
    marginBottom: 24,
  },
  policyIntro: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  policyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  policyText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 12,
  },
  checkboxContainer: {
    gap: 16,
    marginBottom: 20,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  warningText: {
    fontSize: 13,
    flex: 1,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
