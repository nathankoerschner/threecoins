import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { CastingProvider } from './src/context/CastingContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <CastingProvider>
        <AppNavigator />
        <StatusBar style="light" />
      </CastingProvider>
    </GestureHandlerRootView>
  );
}
