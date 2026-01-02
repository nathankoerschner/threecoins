import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { AnimatedCoin } from './AnimatedCoin';
import { CoinAnimationConfig, DEFAULT_ANIMATION_CONFIG } from '@/hooks/useAnimations';
import { spacing } from '@/theme';
import { PullDirection } from '@/types';

interface AnimatedCoinSetProps {
  coins: [boolean, boolean, boolean]; // [coin1, coin2, coin3] - true = heads, false = tails
  size?: number;
  config?: CoinAnimationConfig;
  shouldAnimate: boolean; // Controlled animation trigger
  initialY?: number; // Starting Y position from pull gesture
  pullDirection?: PullDirection; // Pull direction for mirrored animation
  onAnimationComplete?: () => void;
}

export const AnimatedCoinSet: React.FC<AnimatedCoinSetProps> = ({
  coins,
  size = 70,
  config = DEFAULT_ANIMATION_CONFIG,
  shouldAnimate,
  initialY = 0,
  pullDirection = 'down',
  onAnimationComplete,
}) => {
  const [completedCoins, setCompletedCoins] = useState(0);
  const [coinConfigs, setCoinConfigs] = useState<CoinAnimationConfig[]>([]);
  const [coinDelays, setCoinDelays] = useState<number[]>([0, 0, 0]);
  const gap = spacing.md;

  // Generate random animation parameters when new animation starts
  useEffect(() => {
    if (shouldAnimate) {
      setCompletedCoins(0);

      // Generate random configs for each coin
      const randomConfigs = [
        {
          ...config,
          rotations: 3 + Math.floor(Math.random() * 3), // 3-5 rotations
          duration: 1200 + Math.random() * 500, // 1200-1700ms
          staggerDelay: config.staggerDelay,
        },
        {
          ...config,
          rotations: 3 + Math.floor(Math.random() * 3),
          duration: 1200 + Math.random() * 500,
          staggerDelay: config.staggerDelay,
        },
        {
          ...config,
          rotations: 3 + Math.floor(Math.random() * 3),
          duration: 1200 + Math.random() * 500,
          staggerDelay: config.staggerDelay,
        },
      ];

      // All coins start at the same time (no stagger)
      const delays = [0, 0, 0];

      setCoinConfigs(randomConfigs);
      setCoinDelays(delays);
    }
  }, [shouldAnimate, config]);

  // Call completion callback when all coins are done
  useEffect(() => {
    if (completedCoins === 3 && onAnimationComplete) {
      onAnimationComplete();
    }
  }, [completedCoins, onAnimationComplete]);

  const handleCoinComplete = () => {
    setCompletedCoins((prev) => prev + 1);
  };

  // Use generated configs if available, otherwise use defaults
  // This prevents a flash when configs are being generated
  const effectiveConfigs = coinConfigs.length > 0 ? coinConfigs : [config, config, config];
  const effectiveDelays = coinDelays;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Horizontal row - three coins with randomized animations */}
      <View style={[styles.row, { gap }]} pointerEvents="box-none">
        <AnimatedCoin
          isHeads={coins[0]}
          size={size}
          delay={effectiveDelays[0]}
          config={effectiveConfigs[0]}
          shouldAnimate={shouldAnimate}
          initialY={initialY}
          pullDirection={pullDirection}
          onAnimationComplete={handleCoinComplete}
        />
        <AnimatedCoin
          isHeads={coins[1]}
          size={size}
          delay={effectiveDelays[1]}
          config={effectiveConfigs[1]}
          shouldAnimate={shouldAnimate}
          initialY={initialY}
          pullDirection={pullDirection}
          onAnimationComplete={handleCoinComplete}
        />
        <AnimatedCoin
          isHeads={coins[2]}
          size={size}
          delay={effectiveDelays[2]}
          config={effectiveConfigs[2]}
          shouldAnimate={shouldAnimate}
          initialY={initialY}
          pullDirection={pullDirection}
          onAnimationComplete={handleCoinComplete}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'box-none', // Allow touches to pass through
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    pointerEvents: 'box-none', // Allow touches to pass through
  },
});
