import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { AnimatedCoin, AnimationMode } from './AnimatedCoin';
import { CoinAnimationConfig, DEFAULT_ANIMATION_CONFIG } from '@/hooks/useAnimations';
import { spacing } from '@/theme';
import { PullDirection } from '@/types';

interface AnimatedCoinSetProps {
  coins: [boolean, boolean, boolean]; // [coin1, coin2, coin3] - true = heads, false = tails
  size?: number;
  config?: CoinAnimationConfig;
  shouldAnimate: boolean; // Controlled animation trigger
  animationMode?: AnimationMode; // 'cast' for coin toss, 'entrance' for app open/reset
  initialY?: number; // Starting Y position from pull gesture
  pullDirection?: PullDirection; // Pull direction for mirrored animation
  onAnimationComplete?: () => void;
}

export const AnimatedCoinSet: React.FC<AnimatedCoinSetProps> = ({
  coins,
  size = 70,
  config = DEFAULT_ANIMATION_CONFIG,
  shouldAnimate,
  animationMode = 'cast',
  initialY = 0,
  pullDirection = 'down',
  onAnimationComplete,
}) => {
  const [completedCoins, setCompletedCoins] = useState(0);
  const [coinConfigs, setCoinConfigs] = useState<CoinAnimationConfig[]>([]);
  const [coinDelays, setCoinDelays] = useState<number[]>([0, 0, 0]);
  const gap = spacing.md;

  // Store callback in ref to prevent useEffect re-triggering when callback reference changes
  const onAnimationCompleteRef = useRef(onAnimationComplete);

  // Keep ref up to date
  useEffect(() => {
    onAnimationCompleteRef.current = onAnimationComplete;
  }, [onAnimationComplete]);

  // Generate random animation parameters when new animation starts
  useEffect(() => {
    if (shouldAnimate) {
      setCompletedCoins(0);

      if (animationMode === 'entrance') {
        // Entrance mode: use staggered delays, consistent config
        const entranceConfig = {
          ...config,
          duration: 700,
          rotations: 0, // No rotations for entrance, just Z spin handled in AnimatedCoin
        };
        setCoinConfigs([entranceConfig, entranceConfig, entranceConfig]);
        setCoinDelays([0, 120, 240]); // Staggered delays for entrance
      } else {
        // Cast mode: random configs, no stagger
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
        setCoinConfigs(randomConfigs);
        setCoinDelays([0, 0, 0]); // All coins start at the same time
      }
    }
  }, [shouldAnimate, animationMode, config]);

  // Call completion callback when all coins are done
  // Use ref to prevent re-triggering when callback reference changes (e.g., during streaming)
  useEffect(() => {
    if (completedCoins === 3 && onAnimationCompleteRef.current) {
      onAnimationCompleteRef.current();
    }
  }, [completedCoins]);

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
          animationMode={animationMode}
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
          animationMode={animationMode}
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
          animationMode={animationMode}
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
