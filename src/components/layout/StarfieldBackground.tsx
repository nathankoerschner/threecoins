import React, { useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Easing } from 'react-native';
import { colors } from '@/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  pulseSpeed: number;
  pulseScale: number;
  color: string;
}

interface StarfieldBackgroundProps {
  starCount?: number;
  showGoldStars?: boolean;
  /** Controls jitter within grid cells: 0 = center of cell, 1 = anywhere in cell. Default 0.45 */
  distributionVariance?: number;
  /** Maximum allowed cell overflow as fraction of cell size: 0 = stay in cell, 0.5 = can overflow half into neighbors. Default 0.3 */
  maxCellOverflow?: number;
}

// Generate deterministic stars using jittered grid to ensure even coverage
const generateStars = (
  count: number,
  showGoldStars: boolean,
  distributionVariance: number,
  maxCellOverflow: number
): Star[] => {
  const stars: Star[] = [];

  // Calculate grid dimensions for base positions
  const aspectRatio = SCREEN_WIDTH / SCREEN_HEIGHT;
  const cols = Math.ceil(Math.sqrt(count * aspectRatio));
  const rows = Math.ceil(count / cols);
  const cellWidth = SCREEN_WIDTH / cols;
  const cellHeight = SCREEN_HEIGHT / rows;

  // Calculate max jitter distance (how far from cell center a star can be)
  // At variance=1 and overflow=0.3, star can move up to 80% of half-cell (0.5 + 0.3)
  const maxJitterX = (cellWidth / 2) * (distributionVariance + maxCellOverflow);
  const maxJitterY = (cellHeight / 2) * (distributionVariance + maxCellOverflow);

  for (let i = 0; i < count; i++) {
    // Use deterministic pseudo-random based on index
    const seed1 = Math.sin(i * 12.9898) * 43758.5453;
    const seed2 = Math.sin(i * 78.233) * 43758.5453;
    const seed3 = Math.sin(i * 37.719) * 43758.5453;
    const seed4 = Math.sin(i * 93.989) * 43758.5453;
    const seed5 = Math.sin(i * 56.462) * 43758.5453;
    const seed6 = Math.sin(i * 23.141) * 43758.5453;
    const seed7 = Math.sin(i * 67.823) * 43758.5453;

    const rand1 = seed1 - Math.floor(seed1);
    const rand2 = seed2 - Math.floor(seed2);
    const rand3 = seed3 - Math.floor(seed3);
    const rand4 = seed4 - Math.floor(seed4);
    const rand5 = seed5 - Math.floor(seed5);
    const rand6 = seed6 - Math.floor(seed6);
    const rand7 = seed7 - Math.floor(seed7);

    // Calculate grid cell center
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cellCenterX = (col + 0.5) * cellWidth;
    const cellCenterY = (row + 0.5) * cellHeight;

    // Apply jitter: random offset from cell center, bounded by maxJitter
    // rand1/rand2 range [0,1], convert to [-1,1] for bidirectional jitter
    const jitterX = (rand1 * 2 - 1) * maxJitterX;
    const jitterY = (rand2 * 2 - 1) * maxJitterY;

    // Final position with jitter, clamped to screen bounds
    const x = Math.max(0, Math.min(SCREEN_WIDTH, cellCenterX + jitterX));
    const y = Math.max(0, Math.min(SCREEN_HEIGHT, cellCenterY + jitterY));

    // Determine star color - mostly white/silver, occasional gold accent
    let starColor = '#FFFFFF';
    if (showGoldStars && rand5 < 0.08) {
      // 8% chance of gold star
      starColor = colors.accent.primary;
    } else if (rand5 < 0.3) {
      // Slight blue tint for some stars
      starColor = '#E8EEFF';
    } else if (rand5 < 0.5) {
      // Slight warm tint
      starColor = '#FFF8F0';
    }

    stars.push({
      id: i,
      x,
      y,
      size: 0.5 + rand3 * 2, // 0.5 to 2.5px
      opacity: 0.3 + rand4 * 0.7, // 0.3 to 1.0
      twinkleSpeed: 2000 + rand4 * 4000, // 2-6 seconds
      pulseSpeed: 3000 + rand6 * 5000, // 3-8 seconds for pulse
      pulseScale: 1.2 + rand7 * 0.6, // Scale up to 1.2x - 1.8x
      color: starColor,
    });
  }

  return stars;
};

const AnimatedStar: React.FC<{ star: Star }> = React.memo(({ star }) => {
  const opacity = useRef(new Animated.Value(star.opacity)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Create twinkling animation (opacity)
    const twinkle = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: star.opacity * 0.3,
          duration: star.twinkleSpeed / 2,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: star.opacity,
          duration: star.twinkleSpeed / 2,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // Create pulsing animation (scale)
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: star.pulseScale,
          duration: star.pulseSpeed / 2,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: star.pulseSpeed / 2,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // Stagger start time based on star id
    const twinkleDelay = (star.id % 50) * 100;
    const pulseDelay = (star.id % 30) * 150; // Different stagger for pulse

    const twinkleTimeout = setTimeout(() => {
      twinkle.start();
    }, twinkleDelay);

    const pulseTimeout = setTimeout(() => {
      pulse.start();
    }, pulseDelay);

    return () => {
      clearTimeout(twinkleTimeout);
      clearTimeout(pulseTimeout);
      twinkle.stop();
      pulse.stop();
    };
  }, [opacity, scale, star.id, star.opacity, star.twinkleSpeed, star.pulseSpeed, star.pulseScale]);

  return (
    <Animated.View
      style={[
        styles.star,
        {
          left: star.x,
          top: star.y,
          width: star.size,
          height: star.size,
          borderRadius: star.size / 2,
          backgroundColor: star.color,
          opacity,
          transform: [{ scale }],
          // Add subtle glow for larger stars
          ...(star.size > 1.5 && {
            shadowColor: star.color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: star.size,
          }),
        },
      ]}
    />
  );
});

AnimatedStar.displayName = 'AnimatedStar';

export const StarfieldBackground: React.FC<StarfieldBackgroundProps> = ({
  starCount = 80,
  showGoldStars = true,
  distributionVariance = 0.45,
  maxCellOverflow = 0.3,
}) => {
  const stars = useMemo(
    () => generateStars(starCount, showGoldStars, distributionVariance, maxCellOverflow),
    [starCount, showGoldStars, distributionVariance, maxCellOverflow]
  );

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Subtle gradient overlay for depth */}
      <View style={styles.gradientOverlay} />

      {/* Stars */}
      {stars.map((star) => (
        <AnimatedStar key={star.id} star={star} />
      ))}

      {/* Optional subtle vignette effect */}
      <View style={styles.vignette} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    // Creates subtle depth gradient from top
    opacity: 0.3,
  },
  star: {
    position: 'absolute',
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    // Subtle vignette using radial gradient simulation with borders
    borderWidth: 80,
    borderColor: 'transparent',
    // This creates a soft edge effect
    opacity: 0.1,
  },
});
