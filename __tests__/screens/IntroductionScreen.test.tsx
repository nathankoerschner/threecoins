/**
 * Tests for IntroductionScreen component
 *
 * These tests verify:
 * - The component renders correctly with all sections
 * - The welcome message, I Ching description, and instructions are present
 * - The Get Started button triggers navigation and marks intro as seen
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import IntroductionScreen from '@/screens/IntroductionScreen';

// Mock navigation
const mockDispatch = jest.fn();
const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate,
      dispatch: mockDispatch,
    }),
  };
});

// Mock BackgroundTexture component
jest.mock('@/components/layout/BackgroundTexture', () => ({
  BackgroundTexture: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock AppStateContext
const mockMarkIntroAsSeen = jest.fn().mockResolvedValue(undefined);

jest.mock('@/context/AppStateContext', () => ({
  useAppState: () => ({
    hasSeenIntro: false,
    isLoading: false,
    markIntroAsSeen: mockMarkIntroAsSeen,
  }),
}));

// Mock Reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};

  // Mock Animated components
  const View = require('react-native').View;
  Reanimated.default.View = View;

  return {
    ...Reanimated,
    FadeIn: { delay: () => ({ duration: () => ({}) }) },
    FadeInDown: { delay: () => ({ duration: () => ({}) }) },
    FadeInUp: { delay: () => ({ duration: () => ({}) }) },
  };
});

describe('IntroductionScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderIntroductionScreen = () => {
    return render(
      <NavigationContainer>
        <IntroductionScreen />
      </NavigationContainer>
    );
  };

  describe('rendering', () => {
    it('renders the welcome text', () => {
      const { getByText } = renderIntroductionScreen();
      expect(getByText('Welcome to')).toBeTruthy();
    });

    it('renders the I Ching title', () => {
      const { getByText } = renderIntroductionScreen();
      expect(getByText('I Ching')).toBeTruthy();
    });

    it('renders the subtitle', () => {
      const { getByText } = renderIntroductionScreen();
      expect(getByText('The Book of Changes')).toBeTruthy();
    });

    it('renders the Ancient Wisdom section title', () => {
      const { getByText } = renderIntroductionScreen();
      expect(getByText('Ancient Wisdom')).toBeTruthy();
    });

    it('renders the I Ching description', () => {
      const { getByText } = renderIntroductionScreen();
      expect(getByText(/one of humanity's oldest texts/)).toBeTruthy();
    });

    it('renders the How to Consult section title', () => {
      const { getByText } = renderIntroductionScreen();
      expect(getByText('How to Consult')).toBeTruthy();
    });

    it('renders instruction step 1', () => {
      const { getByText } = renderIntroductionScreen();
      expect(getByText('Formulate Your Question')).toBeTruthy();
      expect(getByText(/Focus on an open-ended question/)).toBeTruthy();
    });

    it('renders instruction step 2', () => {
      const { getByText } = renderIntroductionScreen();
      expect(getByText('Cast the Coins')).toBeTruthy();
      expect(getByText(/Tap to toss three coins six times/)).toBeTruthy();
    });

    it('renders instruction step 3', () => {
      const { getByText } = renderIntroductionScreen();
      expect(getByText('Receive Your Reading')).toBeTruthy();
      expect(getByText(/Explore your hexagram's meaning/)).toBeTruthy();
    });

    it('renders the Begin Your Journey button', () => {
      const { getByText } = renderIntroductionScreen();
      expect(getByText('Begin Your Journey')).toBeTruthy();
    });

    it('renders the footer quote', () => {
      const { getByText } = renderIntroductionScreen();
      expect(getByText(/"The only constant in life is change."/)).toBeTruthy();
      expect(getByText('— Heraclitus')).toBeTruthy();
    });

    it('renders the Get Started button with testID', () => {
      const { getByTestId } = renderIntroductionScreen();
      expect(getByTestId('intro-get-started-button')).toBeTruthy();
    });
  });

  describe('navigation', () => {
    it('calls markIntroAsSeen when Get Started button is pressed', async () => {
      const { getByTestId } = renderIntroductionScreen();
      const button = getByTestId('intro-get-started-button');

      fireEvent.press(button);

      await waitFor(() => {
        expect(mockMarkIntroAsSeen).toHaveBeenCalledTimes(1);
      });
    });

    it('dispatches navigation reset after marking intro as seen', async () => {
      const { getByTestId } = renderIntroductionScreen();
      const button = getByTestId('intro-get-started-button');

      fireEvent.press(button);

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalled();
      });
    });
  });
});
