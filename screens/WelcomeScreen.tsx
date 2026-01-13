import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { VideoView, useVideoPlayer } from 'expo-video';

const { width, height } = Dimensions.get('window');

export const WelcomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Setup video player
  const videoSource = require('../assets/Cinematic_App_Welcome_Video_Creation.mp4');
  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = true;
    player.muted = true;
    player.play();
  });

  const handleContinue = () => {
    if (currentSlide < 1) {
      setCurrentSlide(1);
    } else {
      navigation.navigate('TermsPrivacy' as never);
    }
  };

  return (
    <View style={styles.container}>
      {/* Video Background */}
      <VideoView
        style={styles.videoBackground}
        player={player}
        contentFit="cover"
        nativeControls={false}
      />
      
      {/* Dark Overlay for better text visibility */}
      <View style={styles.overlay} />

      <SafeAreaView style={styles.safeArea}>
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
              <Text style={styles.title}>
                Chào mừng đến với{'\n'}Koya Score
              </Text>
              {/* <View style={styles.iconContainer}>
                <Image source={require('../assets/mainLogoApp.png')} style={styles.icon} />
              </View> */}
              <View style={styles.featuresContainer}>
                <View style={styles.feature}>
                  <Ionicons name="flash" size={24} color="#FFD700" />
                  <Text style={styles.featureText}>
                    Tính điểm nhanh
                  </Text>
                </View>

                <View style={styles.feature}>
                  <Ionicons name="qr-code-sharp" size={24} color="#FFD700" />
                  <Text style={styles.featureText}>
                    Có quảng cáo nhẹ
                  </Text>
                </View>

                <View style={styles.feature}>
                  <Ionicons name="shield-checkmark" size={24} color="#FFD700" />
                  <Text style={styles.featureText}>
                    Không thu thập dữ liệu
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Slide 2 - Privacy */}
          <View style={[styles.slide, { width }]}>
            <View style={styles.content}>
              <View style={styles.iconContainer}>
                <Ionicons name="lock-closed" size={80} color="#4CAF50" />
              </View>

              <Text style={styles.title}>
                Quyền riêng tư của bạn
              </Text>

              <Text style={styles.description}>
                Chúng tôi tôn trọng quyền riêng tư của bạn.
              </Text>

              <Text style={styles.description}>
                App chỉ lưu dữ liệu trên thiết bị của bạn. Không có thông tin nào được gửi đến máy chủ bên ngoài.
              </Text>

              <View style={styles.infoBox}>
                <Ionicons name="information-circle" size={20} color="#FFD700" />
                <Text style={styles.infoText}>
                  Tất cả dữ liệu điểm số và lịch sử đều được lưu trữ cục bộ trên thiết bị của bạn
                </Text>
              </View>
              <View style={styles.infoBox}>
                <Ionicons name="information-circle" size={20} color="#FFD700" />
                <Text style={styles.infoText}>
                  Hãy bật wifi để có thể giảm bớt quảng cáo
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
                  backgroundColor: currentSlide === index ? '#FFD700' : 'rgba(255, 255, 255, 0.3)',
                  width: currentSlide === index ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        {/* Continue Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleContinue}
          >
            <Text style={styles.buttonText}>
              {currentSlide < 1 ? 'Tiếp tục' : 'Bắt đầu'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: width,
    height: height,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  safeArea: {
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
    paddingHorizontal: 10,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  icon: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  featuresContainer: {
    width: '100%',
    gap: 24,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  featureText: {
    fontSize: 18,
    color: '#FFD700',
    fontWeight: '600',
    textAlign: 'left',
  },
  description: {
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 10,
    color: '#FFFFFF',
    fontWeight: '400',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  infoBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    gap: 12,
    marginTop: 24,
  },
  infoText: {
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
    color: '#FFFFFF',
    fontWeight: '400',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
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
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#000000',
    fontSize: 17,
    fontWeight: '700',
  },
});
