import { useCastingContext } from '@/context/CastingContext';
import { useHexagramLookup } from './useHexagramLookup';
import { Reading } from '@/types';

/**
 * Main hook for casting functionality
 * Combines casting context and hexagram lookup
 */
export const useCasting = () => {
  const { castingState, throwCoins, resetCasting, isAnimating, setIsAnimating } =
    useCastingContext();

  // Get the reading (only when complete)
  const reading: Reading | null = useHexagramLookup(castingState.lines);

  return {
    // State
    lines: castingState.lines,
    isComplete: castingState.isComplete,
    queuedThrows: castingState.queuedThrows,
    currentLineNumber: castingState.lines.length + 1, // 1-6

    // Reading (null until complete)
    reading,

    // Actions
    throwCoins,
    resetCasting,

    // Animation state
    isAnimating,
    setIsAnimating,
  };
};
