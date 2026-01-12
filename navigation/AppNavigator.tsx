import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
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
import { getSettings } from '../services/settingsService';
import i18n from '../utils/i18n';

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
  return (
    <Stack.Navigator id="MatchStack" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ActiveMatch" component={ActiveMatchScreen} />
      <Stack.Screen name="GameSelection" component={GameSelectionScreen} />
      <Stack.Screen name="PlayerSelection" component={PlayerSelectionScreen} />
      <Stack.Screen name="ConfigSetup" component={ConfigSetupScreen} />
      <Stack.Screen name="RoundInput" component={RoundInputScreen} />
      <Stack.Screen name="RoundDetails" component={RoundDetailsScreen} />
    </Stack.Navigator>
  );
};

// Main Tab Navigator
const MainTabNavigator: React.FC = () => {
  const { theme, isDark } = useTheme();

  return (
    <Tab.Navigator
      id="MainTabs"
      screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'help';

            if (route.name === 'Players') {
              iconName = focused ? 'people' : 'people-outline';
            } else if (route.name === 'Matches') {
              iconName = focused ? 'game-controller' : 'game-controller-outline';
            } else if (route.name === 'History') {
              iconName = focused ? 'time' : 'time-outline';
            } else if (route.name === 'Statistics') {
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'settings' : 'settings-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.textSecondary,
          tabBarStyle: {
            backgroundColor: theme.surface,
            borderTopColor: theme.border,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen
          name="Players"
          component={PlayerListScreen}
          options={{ tabBarLabel: i18n.t('players') }}
        />
        <Tab.Screen
          name="Matches"
          component={MatchStack}
          options={{ tabBarLabel: i18n.t('matches') }}
        />
        <Tab.Screen
          name="History"
          component={MatchHistoryScreen}
          options={{ tabBarLabel: i18n.t('history') }}
        />
        <Tab.Screen
          name="Statistics"
          component={StatisticsScreen}
          options={{ tabBarLabel: i18n.t('statistics') }}
        />
        <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: i18n.t('settings') }} />
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
            fontFamily: 'System',
            fontWeight: '400',
          },
          medium: {
            fontFamily: 'System',
            fontWeight: '500',
          },
          bold: {
            fontFamily: 'System',
            fontWeight: '700',
          },
          heavy: {
            fontFamily: 'System',
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
