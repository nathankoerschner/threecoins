import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import CastingScreen from '@/screens/CastingScreen';
import ReadingScreen from '@/screens/ReadingScreen';
import PaywallScreen from '@/screens/PaywallScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0A0A0A' },
          animation: 'slide_from_bottom', // iOS-style modal presentation
        }}
      >
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
            presentation: 'modal', // Modal presentation
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
