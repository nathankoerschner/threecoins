import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { colors, typography, spacing } from '@/theme';
import { PullDirection } from '@/types';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const PULL_THRESHOLD = 150; // Distance to pull before triggering
const MAX_PULL = 200; // Maximum pull distance (rubber band limit)

interface PullToCastProps {
  onRelease: (pullDistance: number, direction: PullDirection) => void; // Callback with pull distance and direction
  isDisabled?: boolean; // Disable gesture during animation
  children?: React.ReactNode; // Content to display (coin set)
}

export const PullToCast: React.FC<PullToCastProps> = ({
  onRelease,
  isDisabled = false,
  children,
}) => {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0); // Horizontal translation
  const pullProgress = useSharedValue(0); // 0 to 1 progress toward threshold (pull down)
  const pullProgressUp = useSharedValue(0); // 0 to 1 progress toward threshold (pull up)
  const pullProgressLeft = useSharedValue(0); // 0 to 1 progress toward threshold (pull left)
  const pullProgressRight = useSharedValue(0); // 0 to 1 progress toward threshold (pull right)
  const pullDirection = useSharedValue<PullDirection | 'none'>('none'); // Direction lock

  // Reset position when disabled state changes
  useEffect(() => {
    if (isDisabled) {
      // Instant reset (no animation) so it doesn't interfere with coin animation
      translateY.value = 0;
      translateX.value = 0;
      pullProgress.value = 0;
      pullProgressUp.value = 0;
      pullProgressLeft.value = 0;
      pullProgressRight.value = 0;
      pullDirection.value = 'none';
    }
  }, [isDisabled]);

  // Pan gesture - check for drag/swipe gestures
  const panGesture = Gesture.Pan()
    .enabled(!isDisabled)
    .onStart(() => {
      // Reset direction - will be set on first update
      pullDirection.value = 'none';
    })
    .onUpdate((event) => {
      // Lock direction on first significant movement (5px threshold to avoid jitter)
      if (pullDirection.value === 'none') {
        const absX = Math.abs(event.translationX);
        const absY = Math.abs(event.translationY);

        // Only lock if movement exceeds 5px threshold
        if (absX > 5 || absY > 5) {
          // Lock to dominant axis
          if (absX > absY) {
            // Horizontal movement dominant
            pullDirection.value = event.translationX > 0 ? 'right' : 'left';
          } else {
            // Vertical movement dominant
            pullDirection.value = event.translationY > 0 ? 'down' : 'up';
          }
        }
      }

      const currentDirection = pullDirection.value;

      // Handle pull DOWN
      if (currentDirection === 'down' && event.translationY > 0) {
        // Apply rubber band effect: resistance increases as you pull further
        const rubberBandFactor = 1 - (event.translationY / MAX_PULL) * 0.5;
        const dampedTranslation = event.translationY * Math.max(0.3, rubberBandFactor);

        translateY.value = Math.min(dampedTranslation, MAX_PULL);
        // Use ACTUAL translation for progress, not damped
        pullProgress.value = Math.min(event.translationY / PULL_THRESHOLD, 1);
        pullProgressUp.value = 0; // Reset other progress values
        pullProgressLeft.value = 0;
        pullProgressRight.value = 0;
      }
      // Handle pull UP
      else if (currentDirection === 'up' && event.translationY < 0) {
        const absTranslation = Math.abs(event.translationY);
        // Apply rubber band effect (same as down)
        const rubberBandFactor = 1 - (absTranslation / MAX_PULL) * 0.5;
        const dampedTranslation = absTranslation * Math.max(0.3, rubberBandFactor);

        // Negative value (moves container up)
        translateY.value = -Math.min(dampedTranslation, MAX_PULL);
        // Use ACTUAL translation for progress, not damped
        pullProgressUp.value = Math.min(absTranslation / PULL_THRESHOLD, 1);
        pullProgress.value = 0; // Reset other progress values
        pullProgressLeft.value = 0;
        pullProgressRight.value = 0;
      }
      // Handle pull RIGHT (no horizontal movement, just track progress)
      else if (currentDirection === 'right' && event.translationX > 0) {
        // Don't move the coins horizontally - keep them locked in place
        translateX.value = 0;
        // Track progress for threshold detection
        pullProgressRight.value = Math.min(event.translationX / PULL_THRESHOLD, 1);
        pullProgress.value = 0;
        pullProgressUp.value = 0;
        pullProgressLeft.value = 0;
      }
      // Handle pull LEFT (no horizontal movement, just track progress)
      else if (currentDirection === 'left' && event.translationX < 0) {
        const absTranslation = Math.abs(event.translationX);
        // Don't move the coins horizontally - keep them locked in place
        translateX.value = 0;
        // Track progress for threshold detection
        pullProgressLeft.value = Math.min(absTranslation / PULL_THRESHOLD, 1);
        pullProgress.value = 0;
        pullProgressUp.value = 0;
        pullProgressRight.value = 0;
      }
    })
    .onEnd((event) => {
      const currentDirection = pullDirection.value;

      // Check if threshold was met for pull DOWN
      if (currentDirection === 'down' && event.translationY >= PULL_THRESHOLD && !isDisabled) {
        // Calculate damped translation to match actual visual position
        const rubberBandFactor = 1 - (event.translationY / MAX_PULL) * 0.5;
        const dampedTranslation = event.translationY * Math.max(0.3, rubberBandFactor);
        const actualVisualDistance = Math.min(dampedTranslation, MAX_PULL);

        // Trigger the release callback with VISUAL distance and direction
        runOnJS(onRelease)(actualVisualDistance, 'down');
        // Don't animate back here - the useEffect will handle instant reset
      }
      // Check if threshold was met for pull UP
      else if (currentDirection === 'up' && Math.abs(event.translationY) >= PULL_THRESHOLD && !isDisabled) {
        const absTranslation = Math.abs(event.translationY);
        // Calculate damped translation to match actual visual position
        const rubberBandFactor = 1 - (absTranslation / MAX_PULL) * 0.5;
        const dampedTranslation = absTranslation * Math.max(0.3, rubberBandFactor);
        const actualVisualDistance = Math.min(dampedTranslation, MAX_PULL);

        // Trigger the release callback with NEGATIVE distance for upward pulls
        runOnJS(onRelease)(-actualVisualDistance, 'up');
        // Don't animate back here - the useEffect will handle instant reset
      }
      // Check if threshold was met for pull RIGHT
      else if (currentDirection === 'right' && event.translationX >= PULL_THRESHOLD && !isDisabled) {
        const rubberBandFactor = 1 - (event.translationX / MAX_PULL) * 0.5;
        const dampedTranslation = event.translationX * Math.max(0.3, rubberBandFactor);
        const actualVisualDistance = Math.min(dampedTranslation, MAX_PULL);

        runOnJS(onRelease)(actualVisualDistance, 'right');
      }
      // Check if threshold was met for pull LEFT
      else if (currentDirection === 'left' && Math.abs(event.translationX) >= PULL_THRESHOLD && !isDisabled) {
        const absTranslation = Math.abs(event.translationX);
        const rubberBandFactor = 1 - (absTranslation / MAX_PULL) * 0.5;
        const dampedTranslation = absTranslation * Math.max(0.3, rubberBandFactor);
        const actualVisualDistance = Math.min(dampedTranslation, MAX_PULL);

        runOnJS(onRelease)(-actualVisualDistance, 'left');
      }
      // Snap back if threshold not met
      else {
        translateY.value = withTiming(0, {
          duration: 400,
          easing: Easing.out(Easing.ease),
        });
        translateX.value = withTiming(0, {
          duration: 400,
          easing: Easing.out(Easing.ease),
        });
        pullProgress.value = withTiming(0, { duration: 400 });
        pullProgressUp.value = withTiming(0, { duration: 400 });
        pullProgressLeft.value = withTiming(0, { duration: 400 });
        pullProgressRight.value = withTiming(0, { duration: 400 });
      }

      // Reset direction lock
      pullDirection.value = 'none';
    });

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
    ],
  }));

  // Top indicator (pull down)
  const animatedIndicatorStyle = useAnimatedStyle(() => {
    return {
      height: withSpring(pullProgress.value * 4), // 0 to 4px height
      opacity: pullProgress.value,
      backgroundColor:
        pullProgress.value >= 1
          ? colors.accent.primary // Gold when armed
          : pullProgress.value > 0.5
          ? colors.accent.light // Light gold when close
          : colors.text.muted, // Gray when pulling
    };
  });

  // Bottom indicator (pull up)
  const animatedBottomIndicatorStyle = useAnimatedStyle(() => {
    return {
      height: withSpring(pullProgressUp.value * 4), // 0 to 4px height
      opacity: pullProgressUp.value,
      backgroundColor:
        pullProgressUp.value >= 1
          ? colors.accent.primary // Gold when armed
          : pullProgressUp.value > 0.5
          ? colors.accent.light // Light gold when close
          : colors.text.muted, // Gray when pulling
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pullProgress.value, [0, 0.3, 1], [0.5, 0.8, 1]),
    transform: [
      {
        scale: interpolate(
          pullProgress.value,
          [0, 1],
          [0.95, 1],
          Extrapolate.CLAMP
        ),
      },
    ],
  }));

  // Tap gesture - for quick casting without pull
  const tapGesture = Gesture.Tap()
    .enabled(!isDisabled)
    .maxDuration(150)    // Must complete within 150ms
    .maxDistance(10)     // Max 10px movement tolerance
    .onEnd(() => {
      runOnJS(onRelease)(0, 'down');
    });

  // Compose gestures: Tap wins if activated first (quick tap),
  // Pan wins if movement exceeds tap threshold
  const composedGesture = Gesture.Race(tapGesture, panGesture);

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.container, animatedContainerStyle]}>
        {/* Content (coin set) */}
        <View style={styles.contentContainer}>{children}</View>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 300,              // Fixed height instead of flex: 1
    width: '100%',            // Full width
    alignItems: 'center',
    justifyContent: 'center', // Center instead of flex-start
  },
  progressIndicatorTop: {
    position: 'absolute',
    top: 0,
    left: '20%',
    right: '20%',
    borderRadius: 2,
  },
  progressIndicatorBottom: {
    position: 'absolute',
    bottom: 0,
    left: '20%',
    right: '20%',
    borderRadius: 2,
  },
  instructionText: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'box-none', // Allow touches to pass through
  },
});
