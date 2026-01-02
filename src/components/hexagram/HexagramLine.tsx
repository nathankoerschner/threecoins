import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LineType } from '@/types';
import { colors } from '@/theme';

interface HexagramLineProps {
  lineType: LineType;
  isChanging?: boolean;
  animated?: boolean;
  delay?: number;
  showChangingIndicators?: boolean;
}

const LINE_WIDTH = 200;
const LINE_HEIGHT = 8;
const LINE_SPACING = 16;
const BROKEN_GAP_WIDTH = 40;

const SEGMENT_WIDTH = (LINE_WIDTH - BROKEN_GAP_WIDTH) / 2;

export const HexagramLine: React.FC<HexagramLineProps> = ({
  lineType,
  isChanging = false,
  animated = true,
  delay = 0,
  showChangingIndicators = true,
}) => {
  const width = useSharedValue(0);
  const glowOpacity = useSharedValue(0.3);
  const lineOpacity = useSharedValue(animated ? 0 : 1); // Start invisible if animated

  // Determine if this is a yang (unbroken) or yin (broken) line
  const isYang = lineType === 'young_yang' || lineType === 'old_yang';

  useEffect(() => {
    if (animated) {
      // Fade in the line just before it starts drawing
      // This keeps it invisible while coins are animating
      lineOpacity.value = withTiming(1, {
        duration: 100,
        // @ts-ignore - delay is supported but types don't show it
        delay: Math.max(0, delay - 100), // Fade in 100ms before draw starts
      });

      // Draw-in animation: left to right by animating width
      // Width includes the line plus glow padding (8px)
      width.value = withTiming(LINE_WIDTH + 8, {
        duration: 400,
        easing: Easing.out(Easing.ease),
        // @ts-ignore - delay is supported but types don't show it
        delay,
      });
    } else {
      lineOpacity.value = 1;
      width.value = LINE_WIDTH + 8;
    }

    // Glow pulse animation
    if (isChanging && showChangingIndicators) {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    }
  }, [animated, delay, isChanging, showChangingIndicators]);

  const animatedWidthStyle = useAnimatedStyle(() => ({
    width: width.value,
    opacity: lineOpacity.value, // Apply opacity to entire container
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  // All lines are gray now
  const lineColor = colors.line.yin;

  if (isYang) {
    // Unbroken line (yang)
    return (
      <View style={styles.lineContainer}>
        {/* Animated container clips both glow and line together */}
        <Animated.View style={[styles.animatedWrapper, animatedWidthStyle]}>
          {/* Glow behind the line */}
          {isChanging && showChangingIndicators && (
            <Animated.View
              style={[
                styles.solidGlow,
                animatedGlowStyle,
              ]}
            />
          )}
          {/* The line itself */}
          <View style={[styles.solidLine, { backgroundColor: lineColor }]} />
        </Animated.View>
      </View>
    );
  } else {
    // Broken line (yin) - two segments with gap in middle
    return (
      <View style={styles.lineContainer}>
        {/* Animated container clips both glows and line together */}
        <Animated.View style={[styles.animatedWrapper, animatedWidthStyle]}>
          {/* Glows behind the line segments */}
          {isChanging && showChangingIndicators && (
            <>
              <Animated.View
                style={[
                  styles.brokenGlow,
                  { left: 0, width: SEGMENT_WIDTH + 8 },
                  animatedGlowStyle,
                ]}
              />
              <Animated.View
                style={[
                  styles.brokenGlow,
                  { left: SEGMENT_WIDTH + BROKEN_GAP_WIDTH, width: SEGMENT_WIDTH + 8 },
                  animatedGlowStyle,
                ]}
              />
            </>
          )}
          {/* The line segments */}
          <View style={styles.brokenLineSegment}>
            <View style={[styles.brokenSegment, { backgroundColor: lineColor }]} />
            <View style={[styles.brokenSegment, { backgroundColor: lineColor, marginLeft: BROKEN_GAP_WIDTH }]} />
          </View>
        </Animated.View>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  lineContainer: {
    width: LINE_WIDTH,
    height: LINE_HEIGHT, // Keep original height for proper spacing
    marginVertical: LINE_SPACING / 2,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  animatedWrapper: {
    overflow: 'hidden', // Clips both line and glow together
    position: 'relative',
    height: LINE_HEIGHT + 8,
  },
  solidLine: {
    width: LINE_WIDTH,
    height: LINE_HEIGHT,
    borderRadius: 2,
    position: 'absolute',
    top: 4, // Center in wrapper
    left: 4, // Offset for glow padding
  },
  solidGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: LINE_WIDTH + 8,
    height: LINE_HEIGHT + 8,
    backgroundColor: colors.accent.glow,
    borderRadius: 4,
    shadowColor: colors.accent.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  brokenLineSegment: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 4, // Center in wrapper
    left: 4, // Offset for glow padding
  },
  brokenSegment: {
    width: SEGMENT_WIDTH,
    height: LINE_HEIGHT,
    borderRadius: 2,
  },
  brokenGlow: {
    position: 'absolute',
    top: 0,
    height: LINE_HEIGHT + 8,
    backgroundColor: colors.accent.glow,
    borderRadius: 4,
    shadowColor: colors.accent.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
});
