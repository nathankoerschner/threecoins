import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors } from '@/theme';

interface ChangingLineIndicatorProps {
  width?: number;
  height?: number;
  isBroken?: boolean; // True for yin lines
  animated?: boolean;
  delay?: number;
}

const LINE_WIDTH = 200;
const LINE_HEIGHT = 8;
const BROKEN_GAP_WIDTH = 40;
const SEGMENT_WIDTH = (LINE_WIDTH - BROKEN_GAP_WIDTH) / 2;

export const ChangingLineIndicator: React.FC<ChangingLineIndicatorProps> = ({
  width = LINE_WIDTH,
  height = LINE_HEIGHT,
  isBroken = false,
  animated = true,
  delay = 0,
}) => {
  const opacity = useSharedValue(0.3);
  const glowWidth = useSharedValue(0);

  useEffect(() => {
    // Pulse animation: fade in and out continuously
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1, // Infinite repeat
      false
    );

    // Width animation to match line drawing
    if (animated) {
      glowWidth.value = withTiming(LINE_WIDTH, {
        duration: 400,
        easing: Easing.out(Easing.ease),
        // @ts-ignore - delay is supported but types don't show it
        delay,
      });
    } else {
      glowWidth.value = LINE_WIDTH;
    }
  }, [animated, delay]);

  const animatedOpacity = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const animatedWidthStyle = useAnimatedStyle(() => ({
    width: glowWidth.value,
  }));

  if (isBroken) {
    // For broken lines, show two separate glows that hug each segment
    // Wrap in animated container to reveal from left to right
    return (
      <Animated.View style={[styles.brokenGlowContainer, animatedWidthStyle]}>
        {/* Left segment glow */}
        <Animated.View
          style={[
            styles.glowContainer,
            {
              width: SEGMENT_WIDTH + 8,
              height: height + 8,
              left: 0,
            },
            animatedOpacity,
          ]}
        />
        {/* Right segment glow */}
        <Animated.View
          style={[
            styles.glowContainer,
            {
              width: SEGMENT_WIDTH + 8,
              height: height + 8,
              left: SEGMENT_WIDTH + BROKEN_GAP_WIDTH,
            },
            animatedOpacity,
          ]}
        />
      </Animated.View>
    );
  }

  // For solid lines, show single glow with width animation
  return (
    <Animated.View
      style={[
        styles.glowContainer,
        {
          height: height + 8,
        },
        animatedWidthStyle,
        animatedOpacity,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  brokenGlowContainer: {
    position: 'absolute',
    overflow: 'hidden', // Clip animation
    height: LINE_HEIGHT + 8,
  },
  glowContainer: {
    position: 'absolute',
    backgroundColor: colors.accent.glow,
    borderRadius: 4,
    shadowColor: colors.accent.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4, // Tighter glow (was 8)
  },
});
