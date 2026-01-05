import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, TextInput, Dimensions, Keyboard, TouchableWithoutFeedback, InputAccessoryView, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  interpolate,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { useCasting } from '@/hooks/useCasting';
import { useHaptics } from '@/hooks/useHaptics';
import { HexagramStack } from '@/components/hexagram/HexagramStack';
import { AnimatedCoinSet } from '@/components/coins/AnimatedCoinSet';
import { AnimationMode } from '@/components/coins/AnimatedCoin';
import { PullToCast } from '@/components/casting/PullToCast';
import { SwipeableTopArea } from '@/components/casting/SwipeableTopArea';
import { BackgroundTexture } from '@/components/layout/BackgroundTexture';
import { colors, typography, spacing } from '@/theme';
import { PullDirection } from '@/types';

type CastingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Casting'>;
type CastingScreenRouteProp = RouteProp<RootStackParamList, 'Casting'>;

const INPUT_ACCESSORY_VIEW_ID = 'questionInputAccessory';

const CastingScreen: React.FC = () => {
  const navigation = useNavigation<CastingScreenNavigationProp>();
  const route = useRoute<CastingScreenRouteProp>();
  const { lines, isComplete, currentLineNumber, reading, throwCoins, resetCasting } = useCasting();
  const { triggerHaptic, triggerStaggeredCoinLandings, clearPendingHaptics } = useHaptics();
  const coinLandingTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Track coin landing haptic timeout
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [isThrowingCoins, setIsThrowingCoins] = useState(false);
  const [animationKey, setAnimationKey] = useState(0); // Force re-animation even with same coins
  const [pullDistance, setPullDistance] = useState(0); // Track pull distance for coin animation
  const [pullDirection, setPullDirection] = useState<PullDirection>('down'); // Track pull direction for animation
  const [visibleLineCount, setVisibleLineCount] = useState(0); // Number of lines to show in hexagram
  const [animationCompleteCallback, setAnimationCompleteCallback] = useState<(() => void) | null>(null);
  const [isAnimating, setIsAnimating] = useState(false); // Track if any animation is in progress
  const [isRepositioning, setIsRepositioning] = useState(false); // Track if coins are repositioning after first cast
  const [animationMode, setAnimationMode] = useState<AnimationMode>('entrance'); // Track animation mode
  const [isEntranceAnimating, setIsEntranceAnimating] = useState(true); // Track if entrance animation should play
  const [question, setQuestion] = useState(''); // User's question for the I Ching reading
  const [activeView, setActiveView] = useState<'question' | 'hexagram'>('question'); // Track which view is active
  const screenWidth = Dimensions.get('window').width; // Get screen width for translation
  const screenHeight = Dimensions.get('window').height;
  const hexagramTopMargin = Math.round(
    screenHeight * (screenHeight >= 800 ? 0.1 : 0.08)
  );
  const coinsBottomOffset = screenHeight <= 700 ? 60 : 100;
  const carouselTranslateX = useSharedValue(0); // Animated translateX for carousel
  const hasNavigatedToReading = useRef(false); // Track if we've already navigated to reading screen
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Track navigation timeout

  // Glow animation for hexagram box when complete
  const glowOpacity = useSharedValue(0);

  // Completion animation values
  const coinsTranslateX = useSharedValue(0);
  const hexagramScale = useSharedValue(1);
  const hexagramTranslateY = useSharedValue(0);

  // Trigger completion animations when all 6 lines are visible
  useEffect(() => {
    if (visibleLineCount === 6 && isComplete) {
      // Glow animation
      glowOpacity.value = withRepeat(
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );

      // Delay coins slide to let user see complete hexagram first
      coinsTranslateX.value = withDelay(400, withTiming(-screenWidth, {
        duration: 600,
        easing: Easing.inOut(Easing.ease),
      }));

      // Enlarge hexagram in place (no vertical translation to avoid overlapping top bar)
      hexagramScale.value = withDelay(700, withTiming(1.2, {
        duration: 500,
        easing: Easing.out(Easing.ease),
      }));
      // Keep hexagram in place - no vertical translation
      hexagramTranslateY.value = 0;
    } else if (!isComplete) {
      // Reset only when starting fresh (not when visibleLineCount is just updating)
      glowOpacity.value = 0;
      coinsTranslateX.value = 0;
      hexagramScale.value = 1;
      hexagramTranslateY.value = 0;
    }
  }, [visibleLineCount, isComplete]);

  // Trigger entrance animation on mount
  useEffect(() => {
    if (isEntranceAnimating) {
      // Small delay to ensure component is mounted
      const timer = setTimeout(() => {
        setShouldAnimate(true);
        setAnimationKey((prev) => prev + 1);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isEntranceAnimating]);

  // Handle entrance animation completion
  const handleEntranceAnimationComplete = () => {
    setIsEntranceAnimating(false);
    setShouldAnimate(false);
    setAnimationMode('cast'); // Switch to cast mode for subsequent animations
  };

  const hexagramCardAnimatedStyle = useAnimatedStyle(() => ({
    shadowColor: colors.accent.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: glowOpacity.value * 0.6,
    shadowRadius: 12 + glowOpacity.value * 8,
    elevation: glowOpacity.value * 12,
  }));

  const carouselAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: carouselTranslateX.value }],
  }));

  // Coins slide-out animation
  const coinsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: coinsTranslateX.value }],
    opacity: interpolate(coinsTranslateX.value, [0, -screenWidth * 0.5], [1, 0]),
  }));

  // Hexagram enlarge animation
  const hexagramEnlargeStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: hexagramScale.value },
      { translateY: hexagramTranslateY.value },
    ],
  }));

  // Animated opacity for View Reading button
  const viewReadingButtonOpacity = useSharedValue(0);

  useEffect(() => {
    if (visibleLineCount === 6 && reading) {
      viewReadingButtonOpacity.value = withTiming(1, { duration: 400 });
    } else {
      viewReadingButtonOpacity.value = 0;
    }
  }, [visibleLineCount, reading]);

  const viewReadingButtonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: viewReadingButtonOpacity.value,
  }));

  // Trigger animation after throwCoins completes (lines array updates)
  useEffect(() => {
    if (isThrowingCoins && lines.length > 0) {
      // Capture the current line count in a closure
      const currentLineCount = lines.length;

      // Create a callback that uses this captured value
      const callback = () => {
        setTimeout(() => {
          setVisibleLineCount(currentLineCount);
          setIsAnimating(false); // Animation complete
        }, 100);
      };

      // Store the callback
      setAnimationCompleteCallback(() => callback);

      // If viewing question page when cast is initiated, slide to hexagram
      if (activeView === 'question') {
        setActiveView('hexagram');
        carouselTranslateX.value = withTiming(-screenWidth, {
          duration: 300,
          easing: Easing.out(Easing.ease),
        });
      }

      // Data is ready, now trigger animation
      setIsThrowingCoins(false);
      setShouldAnimate(true);
      setIsAnimating(true); // Animation started
      setAnimationKey((prev) => prev + 1); // Increment to force new animation

      // Trigger staggered haptics for coin landings
      // Delay matches animation: coins start falling immediately, land after ~1s
      coinLandingTimeoutRef.current = setTimeout(() => {
        triggerStaggeredCoinLandings(3, 150); // 3 coins, 150ms apart
      }, 1000);
    }
  }, [lines.length, isThrowingCoins, triggerStaggeredCoinLandings, screenWidth, activeView]);

  // Auto-reset shouldAnimate after animation duration
  useEffect(() => {
    if (shouldAnimate) {
      // Animation duration: 1.5s + stagger 0.3s + spring settle ~1s = ~2.8s
      const timeout = setTimeout(() => {
        setShouldAnimate(false);
      }, 2500);

      return () => clearTimeout(timeout);
    }
  }, [shouldAnimate]);

  // Handle reset when navigating from "New Reading" button
  useEffect(() => {
    if (route.params?.shouldReset) {
      // Reset all local state
      setShouldAnimate(false);
      setIsThrowingCoins(false);
      setAnimationKey(0);
      setPullDistance(0);
      setPullDirection('down');
      setVisibleLineCount(0);
      setAnimationCompleteCallback(null);
      setIsAnimating(false);
      setIsRepositioning(false);
      setActiveView('question');
      carouselTranslateX.value = 0;
      coinsTranslateX.value = 0;
      hexagramScale.value = 1;
      hexagramTranslateY.value = 0;
      setQuestion('');
      hasNavigatedToReading.current = false;

      // Clear navigation timeout
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
        navigationTimeoutRef.current = null;
      }

      // Clear any pending haptic feedback
      if (coinLandingTimeoutRef.current) {
        clearTimeout(coinLandingTimeoutRef.current);
        coinLandingTimeoutRef.current = null;
      }
      clearPendingHaptics();

      // Reset casting context state
      resetCasting();

      // Trigger entrance animation after reset
      setAnimationMode('entrance');
      setIsEntranceAnimating(true);

      // Clear the param to prevent re-triggering
      navigation.setParams({ shouldReset: undefined });
    }
  }, [route.params?.shouldReset]);

  const handleThrowCoins = (distance: number, direction: PullDirection) => {
    if (!shouldAnimate && !isComplete && !isThrowingCoins) {
      // Haptic feedback for throw action
      triggerHaptic('throw');

      // Store pull distance and direction for animation
      setPullDistance(distance);
      setPullDirection(direction);

      // Mark that we're throwing (prevents double-click)
      setIsThrowingCoins(true);
      // Update data immediately
      throwCoins();
      // Animation will be triggered by useEffect when lines updates
    }
  };

  const handleAnimationComplete = () => {
    // Reset animation trigger
    setShouldAnimate(false);

    // Haptic feedback for line completion
    if (!isComplete) {
      triggerHaptic('lineComplete');
    } else {
      // Special haptic for casting complete
      triggerHaptic('castingComplete');
    }

    // Show hexagram and line after animation completes
    if (animationCompleteCallback) {
      animationCompleteCallback();
    }
  };

  const handleReset = () => {
    // Clear any pending navigation timeout
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
      navigationTimeoutRef.current = null;
    }

    // Clear any pending haptic feedback
    if (coinLandingTimeoutRef.current) {
      clearTimeout(coinLandingTimeoutRef.current);
      coinLandingTimeoutRef.current = null;
    }
    clearPendingHaptics();

    // Reset all animation states first
    setShouldAnimate(false);
    setIsThrowingCoins(false);
    setAnimationKey(0);
    setPullDistance(0);
    setPullDirection('down');
    setVisibleLineCount(0);
    setAnimationCompleteCallback(null);
    setIsAnimating(false);
    setIsRepositioning(false);

    // Reset carousel to question view
    setActiveView('question');
    carouselTranslateX.value = 0;

    // Reset completion animation values
    coinsTranslateX.value = 0;
    hexagramScale.value = 1;
    hexagramTranslateY.value = 0;

    // Reset question field
    setQuestion('');

    // Reset navigation flag
    hasNavigatedToReading.current = false;

    // Then reset casting data
    resetCasting();

    // Trigger entrance animation after reset
    setAnimationMode('entrance');
    setIsEntranceAnimating(true);
  };

  const handleSkipAnimation = () => {
    // Only skip if an animation is in progress
    if (isAnimating || shouldAnimate) {
      // Cancel any pending haptic feedback
      if (coinLandingTimeoutRef.current) {
        clearTimeout(coinLandingTimeoutRef.current);
        coinLandingTimeoutRef.current = null;
      }
      clearPendingHaptics();

      // Immediately complete the current animation
      setShouldAnimate(false);
      setIsAnimating(false);

      // Show the line immediately (use lines.length since callback might not have captured the right value)
      setVisibleLineCount(lines.length);

      // If this is the final line, navigate immediately
      if (isComplete && reading) {
        navigation.navigate('Reading', { reading, question });
      }
    }
  };

  const handleCarouselSwipe = (direction: 'left' | 'right') => {
    // Only allow swipe if we have cast at least once
    if (lines.length === 0) return;

    if (direction === 'left' && activeView === 'hexagram') {
      // Swipe left: Show question (translateX: 0)
      setActiveView('question');
      carouselTranslateX.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      });
    } else if (direction === 'right' && activeView === 'question') {
      // Swipe right: Show hexagram (translateX: -screenWidth)
      setActiveView('hexagram');
      carouselTranslateX.value = withTiming(-screenWidth, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      });
    }
  };

  return (
    <>
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <BackgroundTexture style={styles.container}>

      {/* Swipeable Top Content Area */}
      <View style={styles.carouselWrapper}>
        <SwipeableTopArea
          onSwipeLeft={() => handleCarouselSwipe('left')}
          onSwipeRight={() => handleCarouselSwipe('right')}
          isDisabled={lines.length === 0 || isAnimating}
          currentTranslateX={carouselTranslateX}
        >
          <Animated.View style={[styles.carouselContainer, carouselAnimatedStyle]}>
          {/* Screen 0: Question View */}
          <View style={[styles.carouselScreen, { width: screenWidth }]}>
            <View style={styles.questionSection}>
              <Text style={styles.questionPrompt}>Think of your question</Text>
              <TextInput
                style={styles.questionInput}
                placeholder="Enter your question here..."
                placeholderTextColor={colors.text.muted}
                value={question}
                onChangeText={setQuestion}
                multiline
                maxLength={200}
                editable={activeView === 'question'}
                inputAccessoryViewID={INPUT_ACCESSORY_VIEW_ID}
              />
              <Text style={styles.instructionText}>
                {lines.length === 0
                  ? 'Then swipe on the coins to start casting'
                  : 'Swipe to see hexagram →'}
              </Text>
              {lines.length > 0 && (
                <TouchableOpacity onPress={handleReset} style={styles.startOverButton}>
                  <Text style={styles.startOverText}>Start Over</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Screen 1: Hexagram View */}
          <View style={[styles.carouselScreen, { width: screenWidth }]}>
            {visibleLineCount > 0 && (
              <Animated.View style={[styles.hexagramContainer, { marginTop: hexagramTopMargin }, hexagramEnlargeStyle]}>
                <Animated.View style={[styles.hexagramCard, hexagramCardAnimatedStyle]}>
                  <HexagramStack
                    lines={lines.slice(0, visibleLineCount)}
                    animated={true}
                    showChangingIndicators={true}
                  />
                </Animated.View>
                <Animated.View style={[styles.viewReadingButtonContainer, viewReadingButtonAnimatedStyle]}>
                  <TouchableOpacity
                    style={styles.viewReadingButton}
                    onPress={() => {
                      if (visibleLineCount === 6 && reading) {
                        hasNavigatedToReading.current = true;
                        navigation.navigate('Reading', { reading, question });
                      }
                    }}
                    disabled={visibleLineCount !== 6 || !reading}
                  >
                    <Text style={styles.viewReadingButtonText}>View Reading</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleReset} style={styles.startOverButton}>
                    <Text style={styles.startOverText}>Start Over</Text>
                  </TouchableOpacity>
                </Animated.View>
              </Animated.View>
            )}
          </View>
          </Animated.View>
        </SwipeableTopArea>
      </View>

      {/* Flexible spacer to fill remaining space above coins */}
      <View style={styles.flexibleSpacer} />

      {/* Absolutely positioned coins container - fixed to bottom */}
      <Animated.View style={[styles.absoluteCoinsContainer, { bottom: coinsBottomOffset }, coinsAnimatedStyle]}>
        <PullToCast
          onRelease={handleThrowCoins}
          isDisabled={shouldAnimate || isThrowingCoins || isComplete || isEntranceAnimating}
        >
          <View style={styles.coinDisplay}>
            <AnimatedCoinSet
              key={animationKey} // Force re-mount for same coin values
              coins={lines.length > 0 ? lines[lines.length - 1].coins : [true, false, true]}
              size={100}
              shouldAnimate={shouldAnimate}
              animationMode={animationMode}
              initialY={pullDistance}
              pullDirection={pullDirection}
              onAnimationComplete={isEntranceAnimating ? handleEntranceAnimationComplete : handleAnimationComplete}
            />
          </View>
        </PullToCast>
      </Animated.View>

      {/* Tap-to-skip overlay - only visible during animation */}
      {(isAnimating || shouldAnimate) && (
        <Pressable
          style={styles.skipOverlay}
          onPress={handleSkipAnimation}
        />
      )}
      </BackgroundTexture>
    </TouchableWithoutFeedback>

    {/* Keyboard accessory view with Done button */}
    {Platform.OS === 'ios' && (
      <InputAccessoryView nativeID={INPUT_ACCESSORY_VIEW_ID}>
        <View style={styles.inputAccessory}>
          <View style={styles.inputAccessorySpacer} />
          <TouchableOpacity
            style={styles.inputAccessoryButton}
            onPress={Keyboard.dismiss}
          >
            <Text style={styles.inputAccessoryButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </InputAccessoryView>
    )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    position: 'relative',  // Create positioning context for absolute children
  },
  flexibleSpacer: {
    flex: 1,  // Fills available space between top content and absolute coins
    minHeight: 40,  // Minimum gap between content and coins
  },
  absoluteCoinsContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 300,             // Fixed height for gesture area + coins
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,              // Above other content
    pointerEvents: 'box-none',  // Allow touches to pass to gesture detector
  },
  carouselWrapper: {
    marginHorizontal: -spacing.lg, // Break out of parent's horizontal padding
  },
  carouselContainer: {
    flexDirection: 'row',
    width: Dimensions.get('window').width * 2,  // Two screens wide
  },
  carouselScreen: {
    // Width set dynamically in JSX
    alignItems: 'center',
    justifyContent: 'center',
  },
  startOverButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  startOverText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.text,
    fontWeight: typography.fontWeight.regular,
    color: colors.text.tertiary,
    textAlign: 'center',
    textDecorationLine: 'underline',
    opacity: 0.8,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  statusText: {
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  coinDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'box-none', // Allow touches to pass through to gesture detector
  },
  placeholderText: {
    fontSize: typography.fontSize.md,
    color: colors.text.muted,
    textAlign: 'center',
  },
  coinLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  hexagramContainer: {
    height: 340,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hexagramLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wide,
    marginBottom: spacing.md,
  },
  hexagramCard: {
    backgroundColor: colors.background.tertiary,
    padding: spacing.md,
    borderRadius: 16,
    width: 230,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    // Premium layered shadow
    shadowColor: colors.shadow.lg,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    // Subtle border for depth
    borderWidth: 1,
    borderColor: colors.accent.subtle,
  },
  viewReadingButtonContainer: {
    marginTop: spacing.lg,
  },
  viewReadingButton: {
    backgroundColor: colors.accent.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.base,
    borderRadius: 14,
    // Premium gold shadow with glow
    shadowColor: colors.accent.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
    // Refined border
    borderWidth: 1,
    borderColor: colors.accent.light,
  },
  viewReadingButtonText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.display,
    fontWeight: typography.fontWeight.bold,
    color: colors.background.primary,
    textAlign: 'center',
    letterSpacing: typography.letterSpacing.wide,
    // Subtle embossed effect
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  questionSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    width: '90%',
    maxWidth: 400,
  },
  questionPrompt: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.display,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.lg,
    textAlign: 'center',
    letterSpacing: typography.letterSpacing.tight,
    ...typography.textShadow.subtle,
  },
  questionInput: {
    width: '100%',
    minHeight: 48,
    backgroundColor: colors.background.tertiary,
    borderRadius: 14,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.text,
    color: colors.text.primary,
    textAlignVertical: 'top',
    borderWidth: 1.5,
    borderColor: colors.accent.subtle,
    // Premium shadow
    shadowColor: colors.shadow.sm,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  instructionText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.text,
    fontWeight: typography.fontWeight.regular,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    fontStyle: 'italic',
    letterSpacing: typography.letterSpacing.normal,
    opacity: 0.85,
  },
  skipOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000, // Above everything else
  },
  inputAccessory: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: colors.accent.subtle,
  },
  inputAccessorySpacer: {
    flex: 1,
  },
  inputAccessoryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  inputAccessoryButtonText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.text,
    fontWeight: typography.fontWeight.semibold,
    color: '#007AFF', // iOS blue
  },
});

export default CastingScreen;
