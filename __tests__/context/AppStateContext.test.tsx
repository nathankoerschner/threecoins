/**
 * Tests for AppStateContext
 *
 * These tests verify:
 * - The context loads hasSeenIntro state from AsyncStorage
 * - markIntroAsSeen saves state to AsyncStorage
 * - The provider properly manages loading state
 */

import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppStateProvider, useAppState } from '@/context/AppStateContext';

// Test component that uses the context
const TestConsumer: React.FC = () => {
  const { hasSeenIntro, isLoading, markIntroAsSeen } = useAppState();

  return (
    <>
      <Text testID="loading">{isLoading ? 'loading' : 'loaded'}</Text>
      <Text testID="hasSeenIntro">{hasSeenIntro === null ? 'null' : hasSeenIntro ? 'true' : 'false'}</Text>
      <Text testID="markIntro" onPress={() => markIntroAsSeen()}>Mark</Text>
    </>
  );
};

describe('AppStateContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockClear();
    (AsyncStorage.setItem as jest.Mock).mockClear();
  });

  describe('initial loading', () => {
    it('loads hasSeenIntro as false when no value is stored', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const { getByTestId } = render(
        <AppStateProvider>
          <TestConsumer />
        </AppStateProvider>
      );

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('loaded');
      });

      expect(getByTestId('hasSeenIntro').props.children).toBe('false');
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@iching_has_seen_intro');
    });

    it('loads hasSeenIntro as true when stored value is "true"', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('true');

      const { getByTestId } = render(
        <AppStateProvider>
          <TestConsumer />
        </AppStateProvider>
      );

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('loaded');
      });

      expect(getByTestId('hasSeenIntro').props.children).toBe('true');
    });

    it('handles AsyncStorage errors gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { getByTestId } = render(
        <AppStateProvider>
          <TestConsumer />
        </AppStateProvider>
      );

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('loaded');
      });

      expect(getByTestId('hasSeenIntro').props.children).toBe('false');
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load app state:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('markIntroAsSeen', () => {
    it('saves "true" to AsyncStorage', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const { getByTestId } = render(
        <AppStateProvider>
          <TestConsumer />
        </AppStateProvider>
      );

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('loaded');
      });

      await act(async () => {
        getByTestId('markIntro').props.onPress();
      });

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith('@iching_has_seen_intro', 'true');
      });

      expect(getByTestId('hasSeenIntro').props.children).toBe('true');
    });

    it('handles AsyncStorage save errors gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Save error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { getByTestId } = render(
        <AppStateProvider>
          <TestConsumer />
        </AppStateProvider>
      );

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('loaded');
      });

      await act(async () => {
        getByTestId('markIntro').props.onPress();
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to save app state:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('useAppState hook', () => {
    it('throws error when used outside provider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestConsumer />);
      }).toThrow('useAppState must be used within an AppStateProvider');

      consoleSpy.mockRestore();
    });
  });
});
