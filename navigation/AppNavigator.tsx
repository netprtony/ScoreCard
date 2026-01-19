import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigationVisibility } from '../contexts/NavigationContext';
import { PlayerListScreen } from '../screens/PlayerListScreen';
import { GameSelectionScreen } from '../screens/GameSelectionScreen';
import { PlayerSelectionScreen } from '../screens/PlayerSelectionScreen';
import { ConfigSetupScreen } from '../screens/ConfigSetupScreen';
import { ActiveMatchScreen } from '../screens/ActiveMatchScreen';
import { RoundInputScreen } from '../screens/RoundInputScreen';
import { RoundDetailsScreen } from '../screens/RoundDetailsScreen';
import { MatchHistoryScreen } from '../screens/MatchHistoryScreen';
import { StatisticsScreen } from '../screens/StatisticsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { TermsPrivacyScreen } from '../screens/TermsPrivacyScreen';
import { SacTeConfigSetupScreen } from '../screens/SacTeConfigSetupScreen';
import { SacTeRoundInputScreen } from '../screens/SacTeRoundInputScreen';
import { getSettings } from '../services/settingsService';
import { Fonts } from '../constants/fonts';

// Custom Glass Tab Bar Component
const GlassTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const { theme, isDark } = useTheme();
  const { isTabBarVisible } = useNavigationVisibility();
  
  // Hide tab bar when visibility is set to false
  if (!isTabBarVisible) {
    return null;
  }
  
  return (
    <View style={tabBarStyles.container}>
      {/* Gradient border top */}
      <LinearGradient
        colors={isDark 
          ? ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)', 'transparent']
          : ['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.03)', 'transparent']
        }
        style={tabBarStyles.topBorder}
      />
      
      {/* Glass background */}
      {Platform.OS === 'ios' ? (
        <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={tabBarStyles.blur}>
          <View style={[tabBarStyles.content, { backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.5)' }]}>
            {state.routes.map((route, index) => {
              const { options } = descriptors[route.key];
              const label = options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                ? options.title
                : route.name;
              const isFocused = state.index === index;

              let iconName: keyof typeof Ionicons.glyphMap = 'help';
              if (route.name === 'Players') iconName = isFocused ? 'people' : 'people-outline';
              else if (route.name === 'Matches') iconName = isFocused ? 'game-controller' : 'game-controller-outline';
              else if (route.name === 'History') iconName = isFocused ? 'time' : 'time-outline';
              else if (route.name === 'Statistics') iconName = isFocused ? 'stats-chart' : 'stats-chart-outline';
              else if (route.name === 'Settings') iconName = isFocused ? 'settings' : 'settings-outline';

              const onPress = () => {
                const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };

              return (
                <View key={route.key} style={tabBarStyles.tab}>
                  <View 
                    style={[
                      tabBarStyles.tabButton,
                      isFocused && { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
                    ]}
                    onTouchEnd={onPress}
                  >
                    <Ionicons 
                      name={iconName} 
                      size={24} 
                      color={isFocused ? theme.primary : theme.textSecondary} 
                    />
                    <View style={[tabBarStyles.label, { opacity: isFocused ? 1 : 0.7 }]}>
                      <Ionicons 
                        name={iconName} 
                        size={0} 
                        color="transparent"
                      />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </BlurView>
      ) : (
        // Android fallback
        <View style={[tabBarStyles.content, { backgroundColor: isDark ? 'rgba(30,30,30,0.95)' : 'rgba(255,255,255,0.95)' }]}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            let iconName: keyof typeof Ionicons.glyphMap = 'help';
            if (route.name === 'Players') iconName = isFocused ? 'people' : 'people-outline';
            else if (route.name === 'Matches') iconName = isFocused ? 'game-controller' : 'game-controller-outline';
            else if (route.name === 'History') iconName = isFocused ? 'time' : 'time-outline';
            else if (route.name === 'Statistics') iconName = isFocused ? 'stats-chart' : 'stats-chart-outline';
            else if (route.name === 'Settings') iconName = isFocused ? 'settings' : 'settings-outline';

            const onPress = () => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <View key={route.key} style={tabBarStyles.tab}>
                <View 
                  style={[
                    tabBarStyles.tabButton,
                    isFocused && { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
                  ]}
                  onTouchEnd={onPress}
                >
                  <Ionicons 
                    name={iconName} 
                    size={24} 
                    color={isFocused ? theme.primary : theme.textSecondary} 
                  />
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const tabBarStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  topBorder: {
    height: 1,
    width: '100%',
  },
  blur: {
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  label: {
    marginTop: 2,
  },
});

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack Navigator for Onboarding Flow
const OnboardingStack: React.FC = () => {
  return (
    <Stack.Navigator 
      id="OnboardingStack" 
      screenOptions={{ headerShown: false }}
      initialRouteName="Splash"
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="TermsPrivacy" component={TermsPrivacyScreen} />
    </Stack.Navigator>
  );
};

// Stack Navigator for Match Flow
const MatchStack: React.FC = () => {
  const { isGestureEnabled } = useNavigationVisibility();

  return (
    <Stack.Navigator 
      id="MatchStack" 
      screenOptions={{ 
        headerShown: false,
        gestureEnabled: isGestureEnabled,
        fullScreenGestureEnabled: isGestureEnabled,
        animation: isGestureEnabled ? 'default' : 'none',
      }}
    >
      {/* ActiveMatch screen with explicit gesture control */}
      <Stack.Screen 
        name="ActiveMatch" 
        component={ActiveMatchScreen}
        options={{
          gestureEnabled: isGestureEnabled,
          fullScreenGestureEnabled: isGestureEnabled,
        }}
      />
      <Stack.Screen name="GameSelection" component={GameSelectionScreen} />
      <Stack.Screen name="PlayerSelection" component={PlayerSelectionScreen} />
      <Stack.Screen name="ConfigSetup" component={ConfigSetupScreen} />
      <Stack.Screen name="RoundInput" component={RoundInputScreen} />
      <Stack.Screen name="RoundDetails" component={RoundDetailsScreen} />
      {/* Sắc Tê Screens */}
      <Stack.Screen name="SacTeConfigSetup" component={SacTeConfigSetupScreen} />
      <Stack.Screen name="SacTeRoundInput" component={SacTeRoundInputScreen} />
    </Stack.Navigator>
  );
};

// Main Tab Navigator
const MainTabNavigator: React.FC = () => {
  const { theme, isDark } = useTheme();
  const { t } = useLanguage();
  const { isGestureEnabled } = useNavigationVisibility();

  return (
    <Tab.Navigator
      id="MainTabs"
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        // Prevent tab gesture when disabled
        freezeOnBlur: !isGestureEnabled,
        lazy: true,
      }}
    >
        <Tab.Screen
          name="Players"
          component={PlayerListScreen}
          options={{ tabBarLabel: t('players') }}
        />
        <Tab.Screen
          name="Matches"
          component={MatchStack}
          options={{ tabBarLabel: t('matches') }}
        />
        <Tab.Screen
          name="History"
          component={MatchHistoryScreen}
          options={{ tabBarLabel: t('history') }}
        />
        <Tab.Screen
          name="Statistics"
          component={StatisticsScreen}
          options={{ tabBarLabel: t('statistics') }}
        />
        <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: t('settings') }} />
    </Tab.Navigator>
  );
};

// Root Navigator with conditional routing
export const AppNavigator: React.FC = () => {
  const { theme, isDark } = useTheme();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);

  const checkOnboardingStatus = () => {
    const settings = getSettings();
    setHasCompletedOnboarding(settings.hasCompletedOnboarding);
  };

  useEffect(() => {
    // Check onboarding status on mount
    checkOnboardingStatus();

    // Re-check when app comes to foreground (for when settings change)
    const interval = setInterval(checkOnboardingStatus, 500);
    
    return () => clearInterval(interval);
  }, []);

  if (hasCompletedOnboarding === null) {
    // Loading state
    return null;
  }

  return (
    <NavigationContainer
      theme={{
        dark: isDark,
        colors: {
          primary: theme.primary,
          background: theme.background,
          card: theme.surface,
          text: theme.text,
          border: theme.border,
          notification: theme.primary,
        },
        fonts: {
          regular: {
            fontFamily: Fonts.normal,
            fontWeight: '400',
          },
          medium: {
            fontFamily: Fonts.medium,
            fontWeight: '500',
          },
          bold: {
            fontFamily: Fonts.bold,
            fontWeight: '700',
          },
          heavy: {
            fontFamily: Fonts.black,
            fontWeight: '900',
          },
        },
      }}
    >
      <Stack.Navigator id="RootStack" screenOptions={{ headerShown: false }}>
        {!hasCompletedOnboarding ? (
          <Stack.Screen name="Onboarding" component={OnboardingStack} />
        ) : (
          <Stack.Screen name="MainApp" component={MainTabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
