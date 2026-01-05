import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HAS_SEEN_INTRO_KEY = '@iching_has_seen_intro';

interface AppStateContextType {
  hasSeenIntro: boolean | null;
  isLoading: boolean;
  markIntroAsSeen: () => Promise<void>;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

interface AppStateProviderProps {
  children: ReactNode;
}

export const AppStateProvider: React.FC<AppStateProviderProps> = ({ children }) => {
  const [hasSeenIntro, setHasSeenIntro] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAppState();
  }, []);

  const loadAppState = async () => {
    try {
      const value = await AsyncStorage.getItem(HAS_SEEN_INTRO_KEY);
      setHasSeenIntro(value === 'true');
    } catch (error) {
      console.error('Failed to load app state:', error);
      setHasSeenIntro(false);
    } finally {
      setIsLoading(false);
    }
  };

  const markIntroAsSeen = async () => {
    try {
      await AsyncStorage.setItem(HAS_SEEN_INTRO_KEY, 'true');
      setHasSeenIntro(true);
    } catch (error) {
      console.error('Failed to save app state:', error);
    }
  };

  return (
    <AppStateContext.Provider value={{ hasSeenIntro, isLoading, markIntroAsSeen }}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = (): AppStateContextType => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};
