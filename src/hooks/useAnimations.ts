import { useSharedValue } from 'react-native-reanimated';

export interface CoinAnimationConfig {
  duration: number; // Normal: 1500ms, Queued: 800ms
  rotations: number; // Number of 360° rotations (3-5)
  staggerDelay: number; // Delay between coins (100-200ms)
}

export const DEFAULT_ANIMATION_CONFIG: CoinAnimationConfig = {
  duration: 1500,
  rotations: 4,
  staggerDelay: 150,
};

export const QUEUED_ANIMATION_CONFIG: CoinAnimationConfig = {
  duration: 800,
  rotations: 3,
  staggerDelay: 100,
};

export const useCoinAnimation = () => {
  const rotation = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  return {
    rotation,
    translateY,
    scale,
  };
};
