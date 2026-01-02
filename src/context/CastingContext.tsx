import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CastingState, CastLine } from '@/types';
import { tossThreeCoins } from '@/utils/coinToss';
import { createCastLine } from '@/utils/lineCalculator';

const STORAGE_KEY = '@iching_casting_state';

interface CastingContextType {
  castingState: CastingState;
  throwCoins: () => void;
  resetCasting: () => void;
  isAnimating: boolean;
  setIsAnimating: (animating: boolean) => void;
}

const CastingContext = createContext<CastingContextType | undefined>(undefined);

const initialState: CastingState = {
  lines: [],
  isComplete: false,
  queuedThrows: 0,
  timestamp: Date.now(),
};

interface CastingProviderProps {
  children: ReactNode;
}

export const CastingProvider: React.FC<CastingProviderProps> = ({ children }) => {
  const [castingState, setCastingState] = useState<CastingState>(initialState);
  const [isAnimating, setIsAnimating] = useState(false);

  // Load saved state on mount
  useEffect(() => {
    loadCastingState();
  }, []);

  // Save state whenever it changes
  useEffect(() => {
    if (castingState.lines.length > 0) {
      saveCastingState(castingState);
    }
  }, [castingState]);

  const loadCastingState = async () => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (json) {
        const saved: CastingState = JSON.parse(json);
        // Only restore if not complete (don't restore finished readings)
        if (!saved.isComplete && saved.lines.length > 0) {
          setCastingState(saved);
        }
      }
    } catch (error) {
      console.error('Failed to load casting state:', error);
    }
  };

  const saveCastingState = async (state: CastingState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save casting state:', error);
    }
  };

  const clearSavedState = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear casting state:', error);
    }
  };

  const throwCoins = () => {
    if (castingState.isComplete) {
      return; // Can't throw if casting is complete
    }

    if (isAnimating) {
      // Queue the throw if animation is in progress
      setCastingState((prev) => ({
        ...prev,
        queuedThrows: prev.queuedThrows + 1,
      }));
      return;
    }

    // Toss three coins
    const coins = tossThreeCoins();
    const newLine = createCastLine(coins);

    setCastingState((prev) => {
      const newLines = [...prev.lines, newLine];
      const isComplete = newLines.length === 6;

      return {
        lines: newLines,
        isComplete,
        queuedThrows: prev.queuedThrows,
        timestamp: Date.now(),
      };
    });
  };

  const resetCasting = () => {
    setCastingState({
      ...initialState,
      timestamp: Date.now(),
    });
    setIsAnimating(false);
    clearSavedState();
  };

  const value: CastingContextType = {
    castingState,
    throwCoins,
    resetCasting,
    isAnimating,
    setIsAnimating,
  };

  return <CastingContext.Provider value={value}>{children}</CastingContext.Provider>;
};

// Custom hook to use the casting context
export const useCastingContext = (): CastingContextType => {
  const context = useContext(CastingContext);
  if (!context) {
    throw new Error('useCastingContext must be used within a CastingProvider');
  }
  return context;
};
