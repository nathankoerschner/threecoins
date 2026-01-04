import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, LayoutChangeEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { colors, typography, spacing, layout } from '@/theme';

interface CollapsibleDrawerProps {
  title: string;
  children: React.ReactNode;
}

export const CollapsibleDrawer: React.FC<CollapsibleDrawerProps> = ({
  title,
  children,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const animatedHeight = useSharedValue(0);
  const rotation = useSharedValue(0);

  const handleContentLayout = useCallback((event: LayoutChangeEvent) => {
    const height = event.nativeEvent.layout.height;
    if (height > 0 && contentHeight === 0) {
      setContentHeight(height);
    }
  }, [contentHeight]);

  const toggleDrawer = useCallback(() => {
    const toValue = isExpanded ? 0 : contentHeight;
    const toRotation = isExpanded ? 0 : 180;

    animatedHeight.value = withTiming(toValue, {
      duration: layout.animation.normal,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });

    rotation.value = withTiming(toRotation, {
      duration: layout.animation.normal,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });

    setIsExpanded(!isExpanded);
  }, [isExpanded, contentHeight, animatedHeight, rotation]);

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
    opacity: interpolate(
      animatedHeight.value,
      [0, contentHeight * 0.5, contentHeight],
      [0, 0.5, 1]
    ),
  }));

  const chevronAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={styles.container}>
      <Pressable
        onPress={toggleDrawer}
        style={({ pressed }) => [
          styles.toggleButton,
          pressed && styles.toggleButtonPressed,
        ]}
      >
        <Text style={styles.toggleText}>{title}</Text>
        <Animated.Text style={[styles.chevron, chevronAnimatedStyle]}>
          {'\u25BC'}
        </Animated.Text>
      </Pressable>

      <Animated.View style={[styles.contentWrapper, contentAnimatedStyle]}>
        <View style={styles.content}>{children}</View>
      </Animated.View>

      {/* Hidden content for measuring height */}
      {contentHeight === 0 && (
        <View
          style={styles.hiddenContent}
          onLayout={handleContentLayout}
          pointerEvents="none"
        >
          {children}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: spacing.base,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.accent.subtle,
  },
  toggleButtonPressed: {
    opacity: 0.7,
  },
  toggleText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.text,
    fontWeight: typography.fontWeight.medium,
    color: colors.accent.primary,
    letterSpacing: typography.letterSpacing.wide,
    marginRight: spacing.sm,
    textTransform: 'uppercase',
  },
  chevron: {
    fontSize: typography.fontSize.xs,
    color: colors.accent.primary,
  },
  contentWrapper: {
    overflow: 'hidden',
  },
  content: {
    paddingTop: spacing.base,
    paddingBottom: spacing.sm,
  },
  hiddenContent: {
    position: 'absolute',
    opacity: 0,
    left: 0,
    right: 0,
  },
});
