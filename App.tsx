import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/context/AuthContext';
import { CastingProvider } from './src/context/CastingContext';
import { AppStateProvider } from './src/context/AppStateContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppStateProvider>
        <AuthProvider>
          <CastingProvider>
            <AppNavigator />
            <StatusBar style="light" />
          </CastingProvider>
        </AuthProvider>
      </AppStateProvider>
    </GestureHandlerRootView>
  );
}
