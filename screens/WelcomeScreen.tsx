import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

export const WelcomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleContinue = () => {
    if (currentSlide < 1) {
      setCurrentSlide(1);
    } else {
      navigation.navigate('TermsPrivacy' as never);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        contentOffset={{ x: currentSlide * width, y: 0 }}
      >
        {/* Slide 1 - Introduction */}
        <View style={[styles.slide, { width }]}>
          <View style={styles.content}>
            <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
              <Ionicons name="game-controller" size={80} color={theme.primary} />
            </View>

            <Text style={[styles.title, { color: theme.text }]}>
              Chào mừng đến với{'\n'}Koya Score
            </Text>

            <View style={styles.featuresContainer}>
              <View style={styles.feature}>
                <Ionicons name="flash" size={24} color={theme.primary} />
                <Text style={[styles.featureText, { color: theme.text }]}>
                  Tính điểm bài nhanh
                </Text>
              </View>

              <View style={styles.feature}>
                <Ionicons name="cloud-offline" size={24} color={theme.primary} />
                <Text style={[styles.featureText, { color: theme.text }]}>
                  Không cần mạng
                </Text>
              </View>

              <View style={styles.feature}>
                <Ionicons name="shield-checkmark" size={24} color={theme.primary} />
                <Text style={[styles.featureText, { color: theme.text }]}>
                  Không thu thập dữ liệu cá nhân
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Slide 2 - Privacy */}
        <View style={[styles.slide, { width }]}>
          <View style={styles.content}>
            <View style={[styles.iconContainer, { backgroundColor: theme.success + '20' }]}>
              <Ionicons name="lock-closed" size={80} color={theme.success} />
            </View>

            <Text style={[styles.title, { color: theme.text }]}>
              Quyền riêng tư{'\n'}của bạn
            </Text>

            <Text style={[styles.description, { color: theme.textSecondary }]}>
              Chúng tôi tôn trọng quyền riêng tư của bạn.
            </Text>

            <Text style={[styles.description, { color: theme.textSecondary }]}>
              App chỉ lưu dữ liệu trên thiết bị của bạn. Không có thông tin nào được gửi đến máy chủ bên ngoài.
            </Text>

            <View style={[styles.infoBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Ionicons name="information-circle" size={20} color={theme.primary} />
              <Text style={[styles.infoText, { color: theme.text }]}>
                Tất cả dữ liệu điểm số và lịch sử đều được lưu trữ cục bộ trên thiết bị của bạn
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {[0, 1].map((index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: currentSlide === index ? theme.primary : theme.border,
                width: currentSlide === index ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={handleContinue}
        >
          <Text style={styles.buttonText}>
            {currentSlide < 1 ? 'Tiếp tục' : 'Bắt đầu'}
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
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
  },
  featuresContainer: {
    width: '100%',
    gap: 24,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureText: {
    fontSize: 16,
    flex: 1,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  infoBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    marginTop: 24,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
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
