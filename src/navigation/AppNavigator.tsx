import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { useAppState } from '@/context/AppStateContext';
import { colors } from '@/theme';
import IntroductionScreen from '@/screens/IntroductionScreen';
import CastingScreen from '@/screens/CastingScreen';
import ReadingScreen from '@/screens/ReadingScreen';
import PaywallScreen from '@/screens/PaywallScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const { hasSeenIntro, isLoading } = useAppState();

  // Show loading while checking if user has seen intro
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={hasSeenIntro ? 'Casting' : 'Introduction'}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0A0A0A' },
          animation: 'slide_from_bottom', // iOS-style modal presentation
        }}
      >
        <Stack.Screen
          name="Introduction"
          component={IntroductionScreen}
          options={{
            animation: 'none', // No animation for initial screen
          }}
        />
        <Stack.Screen
          name="Casting"
          component={CastingScreen}
          options={{
            animation: 'none', // No animation for initial screen
          }}
        />
        <Stack.Screen
          name="Reading"
          component={ReadingScreen}
          options={{
            presentation: 'modal', // Card-style modal with swipe to dismiss
            animation: 'slide_from_bottom',
            gestureEnabled: true, // Enable swipe to dismiss
            gestureDirection: 'vertical',
          }}
        />
        <Stack.Screen
          name="Paywall"
          component={PaywallScreen}
          options={{
            presentation: 'modal', // Modal presentation
            animation: 'slide_from_bottom',
            gestureEnabled: true, // Enable swipe to dismiss
            gestureDirection: 'vertical',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
});
