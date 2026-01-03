import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Coin } from './Coin';
import { CoinAnimationConfig, DEFAULT_ANIMATION_CONFIG } from '@/hooks/useAnimations';
import { PullDirection } from '@/types';

interface AnimatedCoinProps {
  isHeads: boolean;
  size?: number;
  delay?: number;
  config?: CoinAnimationConfig;
  shouldAnimate: boolean; // Controlled animation trigger
  initialY?: number; // Starting Y position (from pull gesture)
  pullDirection?: PullDirection; // Pull direction for mirrored animation
  onAnimationComplete?: () => void;
}

export const AnimatedCoin: React.FC<AnimatedCoinProps> = ({
  isHeads,
  size = 60,
  delay = 0,
  config = DEFAULT_ANIMATION_CONFIG,
  shouldAnimate,
  initialY = 0,
  pullDirection = 'down',
  onAnimationComplete,
}) => {
  // Initialize shared values based on whether we're animating from a pulled position
  // For both up and down pulls, use the actual initialY value if it exists
  const startY = initialY !== 0 ? initialY : 0;
  const rotationX = useSharedValue(0); // Forward flip
  const rotationZ = useSharedValue(0); // Spin (makes square hole rotate)
  const translateY = useSharedValue(startY);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (!shouldAnimate) {
      // Reset to idle state (but keep Z rotation so square stays at random angle)
      rotationX.value = 0;
      // Don't reset rotationZ - keep the final spin position
      translateY.value = 0;
      scale.value = 1;
      opacity.value = 1;
      return;
    }

    // Start from pulled position (or default based on direction if no pull)
    const startY = initialY !== 0 ? initialY : (pullDirection === 'up' ? -100 : -100);

    // Reset to animation start state
    rotationX.value = 0;
    // Don't reset rotationZ - spin from current position
    translateY.value = startY;
    scale.value = 1; // Keep scale constant
    opacity.value = Math.abs(initialY) > 0 ? 1 : 0; // Already visible if pulled

    // Trigger animations with delay
    const startAnimation = () => {
      // Initial appearance (only fade in if not already visible from pull)
      if (Math.abs(initialY) === 0) {
        opacity.value = withTiming(1, { duration: 100 });
      }

      // Rotation animation - multiple 360° spins (forward flip)
      // Random direction (50% chance of clockwise vs counterclockwise)
      const directionX = Math.random() > 0.5 ? 1 : -1;
      const totalRotationX = config.rotations * 360 * directionX;
      rotationX.value = withTiming(totalRotationX, {
        duration: config.duration,
        easing: Easing.out(Easing.cubic),
      });

      // Z-axis spin animation (makes square hole rotate randomly)
      // Spin from current angle to add more rotation
      // Random direction for Z-axis spin
      const directionZ = Math.random() > 0.5 ? 1 : -1;
      const randomZSpins = 2 + Math.random() * 3; // 2-5 spins
      const additionalRotationZ = randomZSpins * 360 * directionZ;
      const currentZ = rotationZ.value;
      rotationZ.value = withTiming(currentZ + additionalRotationZ, {
        duration: config.duration,
        easing: Easing.out(Easing.cubic),
      });

      // Vertical movement animation - direction-dependent
      if (initialY === 0) {
        // TAP: No vertical movement, just spin in place
        // Set up a timer to call completion callback after rotation finishes
        translateY.value = 0; // Stay in place

        // Call completion callback after animation duration
        setTimeout(() => {
          if (onAnimationComplete) {
            onAnimationComplete();
          }
        }, config.duration);
      } else if (pullDirection === 'down') {
        // Pull DOWN: Drop with momentum, overshoot, then bounce back (mirrored physics)
        // Calculate overshoot distance (drop 33% further than center due to momentum)
        const overshootDistance = Math.abs(startY) * 0.33;
        const overshootY = overshootDistance;

        translateY.value = withSequence(
          // Phase 1: Drop down past center (momentum from pull)
          withTiming(overshootY, {
            duration: config.duration * 0.45,
            easing: Easing.in(Easing.cubic),
          }),
          // Phase 2: Spring back up toward center (elasticity)
          withTiming(0, {
            duration: config.duration * 0.25,
            easing: Easing.out(Easing.quad),
          }),
          // Phase 3: Final bounce settle
          withSpring(0, {
            damping: 8,
            stiffness: 150,
            mass: 0.5,
          }, () => {
            // Animation complete callback on UI thread
            if (onAnimationComplete) {
              runOnJS(onAnimationComplete)();
            }
          })
        );
      } else {
        // Pull UP: Rise up, fall down, then bounce (mirrored animation)
        // Calculate peak height (rise 33% higher than start)
        const throwUpDistance = Math.abs(startY) * 0.33;
        const peakY = -Math.abs(startY) - throwUpDistance;

        translateY.value = withSequence(
          // Phase 1: Rise up (momentum from pull)
          withTiming(peakY, {
            duration: config.duration * 0.25,
            easing: Easing.out(Easing.quad),
          }),
          // Phase 2: Fall down (gravity)
          withTiming(0, {
            duration: config.duration * 0.45,
            easing: Easing.in(Easing.cubic),
          }),
          // Phase 3: Bounce (same as down)
          withSpring(0, {
            damping: 8,
            stiffness: 150,
            mass: 0.5,
          }, () => {
            // Animation complete callback on UI thread
            if (onAnimationComplete) {
              runOnJS(onAnimationComplete)();
            }
          })
        );
      }
    };

    // Start animation after delay
    const timer = setTimeout(startAnimation, delay);
    return () => clearTimeout(timer);
  }, [shouldAnimate, delay, config]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { perspective: 1000 }, // Add perspective FIRST for 3D effect
      { translateY: translateY.value },
      { rotateX: `${rotationX.value}deg` }, // 3D flip around horizontal axis
      { rotateZ: `${rotationZ.value}deg` }, // Spin in the plane (rotates square hole)
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View
      style={[styles.container, animatedStyle]}
      shouldRasterizeIOS={true}
      renderToHardwareTextureAndroid={true}
      pointerEvents="none"
    >
      <Coin isHeads={isHeads} size={size} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Stable layout - prevents layout shifts
    alignItems: 'center',
    justifyContent: 'center',
    // Ensure animation is isolated and doesn't affect siblings
    overflow: 'visible',
    // Allow touches to pass through to parent gesture detector
    pointerEvents: 'box-none',
  },
});
