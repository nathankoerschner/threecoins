import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { useCasting } from '@/hooks/useCasting';
import { useHaptics } from '@/hooks/useHaptics';
import { HexagramStack } from '@/components/hexagram/HexagramStack';
import { AnimatedCoinSet } from '@/components/coins/AnimatedCoinSet';
import { PullToCast } from '@/components/casting/PullToCast';
import { colors, typography, spacing } from '@/theme';
import { PullDirection } from '@/types';

type CastingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Casting'>;

const CastingScreen: React.FC = () => {
  const navigation = useNavigation<CastingScreenNavigationProp>();
  const { lines, isComplete, currentLineNumber, reading, throwCoins, resetCasting } = useCasting();
  const { triggerHaptic, triggerStaggeredCoinLandings } = useHaptics();
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [isThrowingCoins, setIsThrowingCoins] = useState(false);
  const [animationKey, setAnimationKey] = useState(0); // Force re-animation even with same coins
  const [pullDistance, setPullDistance] = useState(0); // Track pull distance for coin animation
  const [pullDirection, setPullDirection] = useState<PullDirection>('down'); // Track pull direction for animation
  const [visibleLineCount, setVisibleLineCount] = useState(0); // Number of lines to show in hexagram
  const [animationCompleteCallback, setAnimationCompleteCallback] = useState<(() => void) | null>(null);
  const [isAnimating, setIsAnimating] = useState(false); // Track if any animation is in progress

  // Navigate to Reading screen when casting is complete
  useEffect(() => {
    if (isComplete && reading) {
      // Wait for final line to fully draw before navigating
      // Coins animate (max 1700ms) + delay (100ms) + line drawing (400ms) + buffer (300ms)
      setTimeout(() => {
        navigation.navigate('Reading', { reading });
      }, 2500);
    }
  }, [isComplete, reading, navigation]);

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

      // Data is ready, now trigger animation
      setIsThrowingCoins(false);
      setShouldAnimate(true);
      setIsAnimating(true); // Animation started
      setAnimationKey((prev) => prev + 1); // Increment to force new animation

      // Trigger staggered haptics for coin landings
      // Delay matches animation: coins start falling immediately, land after ~1s
      setTimeout(() => {
        triggerStaggeredCoinLandings(3, 150); // 3 coins, 150ms apart
      }, 1000);
    }
  }, [lines.length, isThrowingCoins, triggerStaggeredCoinLandings]);

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

    // Call the stored callback which has the correct line count captured
    if (animationCompleteCallback) {
      animationCompleteCallback();
    }
  };

  const handleReset = () => {
    // Reset all animation states first
    setShouldAnimate(false);
    setIsThrowingCoins(false);
    setAnimationKey(0);
    setPullDistance(0);
    setPullDirection('down');
    setVisibleLineCount(0);
    setAnimationCompleteCallback(null);
    setIsAnimating(false);
    // Then reset casting data
    resetCasting();
  };

  const handleSkipAnimation = () => {
    // Only skip if an animation is in progress
    if (isAnimating || shouldAnimate) {
      // Immediately complete the current animation
      setShouldAnimate(false);
      setIsAnimating(false);

      // Show the line immediately (use lines.length since callback might not have captured the right value)
      setVisibleLineCount(lines.length);

      // If this is the final line, navigate immediately
      if (isComplete && reading) {
        navigation.navigate('Reading', { reading });
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Reset button in top left */}
      {lines.length > 0 && (
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.resetButtonTop}
            onPress={handleReset}
          >
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Display cast lines as hexagram */}
      {visibleLineCount > 0 && (
        <View style={styles.hexagramContainer}>
          <View style={styles.hexagramCard}>
            <HexagramStack
              lines={lines.slice(0, visibleLineCount)}
              animated={true}
              showChangingIndicators={true}
            />
          </View>
        </View>
      )}

      {/* Pull-to-cast gesture area */}
      <PullToCast
        onRelease={handleThrowCoins}
        isDisabled={shouldAnimate || isThrowingCoins || isComplete}
      >
        <View style={styles.coinDisplay}>
          <AnimatedCoinSet
            key={animationKey} // Force re-mount for same coin values
            coins={lines.length > 0 ? lines[lines.length - 1].coins : [true, false, true]}
            size={100}
            shouldAnimate={shouldAnimate}
            initialY={pullDistance}
            pullDirection={pullDirection}
            onAnimationComplete={handleAnimationComplete}
          />
        </View>
      </PullToCast>

      {/* Tap-to-skip overlay - only visible during animation */}
      {(isAnimating || shouldAnimate) && (
        <Pressable
          style={styles.skipOverlay}
          onPress={handleSkipAnimation}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    paddingTop: 80,
    paddingHorizontal: spacing.lg,
  },
  topBar: {
    position: 'absolute',
    top: 60,
    left: spacing.lg,
    zIndex: 100,
  },
  resetButtonTop: {
    backgroundColor: colors.line.yin,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  resetButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.background.primary,
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
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
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
    backgroundColor: colors.background.secondary,
    padding: spacing.lg,
    borderRadius: 12,
    width: 220,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  skipOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000, // Above everything else
  },
});

export default CastingScreen;
