import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/theme';

/**
 * Premium background component with subtle texture and depth
 * Adds sophisticated visual layering to screens
 */
export const PremiumBackground: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <View style={styles.container}>
      {/* Base gradient layer */}
      <View style={styles.gradientBase} />

      {/* Radial accent glow (top) */}
      <View style={styles.glowTop} />

      {/* Radial accent glow (bottom) */}
      <View style={styles.glowBottom} />

      {/* Noise texture overlay for depth */}
      <View style={styles.noiseTexture} />

      {/* Subtle shimmer overlay */}
      <View style={styles.shimmer} />

      {/* Content */}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    position: 'relative',
  },
  gradientBase: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'transparent',
    opacity: 0.4,
  },
  glowTop: {
    position: 'absolute',
    top: -100,
    left: '20%',
    right: '20%',
    height: 300,
    borderRadius: 200,
    backgroundColor: colors.accent.glow,
    opacity: 0.03,
    blur: 100,
  },
  glowBottom: {
    position: 'absolute',
    bottom: -150,
    left: '10%',
    right: '10%',
    height: 400,
    borderRadius: 250,
    backgroundColor: colors.accent.glow,
    opacity: 0.02,
    blur: 120,
  },
  noiseTexture: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.008)',
    opacity: 0.5,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.overlay.shimmer,
  },
});
