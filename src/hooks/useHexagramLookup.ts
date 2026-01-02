import { useMemo } from 'react';
import { CastLine, Reading } from '@/types';
import { createReading } from '@/utils/hexagramCalculator';

/**
 * Hook to convert cast lines into a reading with primary and transformed hexagrams
 */
export const useHexagramLookup = (lines: CastLine[]): Reading | null => {
  return useMemo(() => {
    // Only create reading when we have all 6 lines
    if (lines.length !== 6) {
      return null;
    }

    try {
      return createReading(lines);
    } catch (error) {
      console.error('Error creating reading:', error);
      return null;
    }
  }, [lines]);
};
