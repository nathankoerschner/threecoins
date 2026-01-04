import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { colors, typography, spacing } from '@/theme';

export const TransformationIndicator: React.FC = () => {
  const translateY = useSharedValue(0);

  useEffect(() => {
    // Gentle bounce animation for the arrow
    translateY.value = withRepeat(
      withSequence(
        withTiming(4, { duration: 1000 }),
        withTiming(0, { duration: 1000 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.lineContainer}>
        <View style={styles.line} />
      </View>

      <Animated.View style={[styles.arrowContainer, animatedStyle]}>
        <Text style={styles.arrow}>↓</Text>
      </Animated.View>

      <View style={styles.lineContainer}>
        <View style={styles.line} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginVertical: spacing.lg,
  },
  lineContainer: {
    width: '100%',
    height: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  line: {
    width: '30%',
    height: 1,
    backgroundColor: colors.accent.primary,
    opacity: 0.3,
  },
  arrowContainer: {
    marginVertical: spacing.sm,
  },
  arrow: {
    fontSize: typography.fontSize.xxl,
    color: colors.accent.primary,
    fontWeight: typography.fontWeight.bold,
  },
});
