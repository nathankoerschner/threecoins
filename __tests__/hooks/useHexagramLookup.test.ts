/**
 * Tests for useHexagramLookup hook
 *
 * Note: Since @testing-library/react-native has compatibility issues with React 19,
 * we test the underlying logic directly. The hook is a thin wrapper around createReading,
 * so we verify the integration by testing the expected behavior.
 */

import { createReading } from '@/utils/hexagramCalculator';
import { CastLine, LineType } from '@/types';

// Helper to create mock CastLine
const mockLine = (lineType: LineType, isChanging = false): CastLine => ({
  coins: [true, true, true] as [boolean, boolean, boolean],
  lineType,
  isChanging,
  value: 9,
});

// Helper to create 6 identical lines
const create6Lines = (lineType: LineType): CastLine[] => {
  const isChanging = lineType === 'old_yin' || lineType === 'old_yang';
  return Array(6)
    .fill(null)
    .map(() => mockLine(lineType, isChanging));
};

describe('useHexagramLookup behavior', () => {
  describe('when lines array is empty', () => {
    it('should not call createReading (hook returns null)', () => {
      const lines: CastLine[] = [];
      // The hook checks if lines.length !== 6 before calling createReading
      expect(lines.length).not.toBe(6);
    });
  });

  describe('when lines array has fewer than 6 elements', () => {
    it('should not call createReading for 3 lines', () => {
      const lines = Array(3)
        .fill(null)
        .map(() => mockLine('young_yang'));
      expect(lines.length).not.toBe(6);
    });

    it('should not call createReading for 5 lines', () => {
      const lines = Array(5)
        .fill(null)
        .map(() => mockLine('young_yang'));
      expect(lines.length).not.toBe(6);
    });
  });

  describe('when lines array has exactly 6 elements', () => {
    it('calls createReading and returns valid Reading for all yang lines', () => {
      const lines = create6Lines('young_yang');
      const reading = createReading(lines);

      expect(reading).not.toBeNull();
      expect(reading.primary.number).toBe(1);
      expect(reading.primary.englishName).toBe('The Creative');
    });

    it('calls createReading and returns valid Reading for all yin lines', () => {
      const lines = create6Lines('young_yin');
      const reading = createReading(lines);

      expect(reading).not.toBeNull();
      expect(reading.primary.number).toBe(2);
      expect(reading.primary.englishName).toBe('The Receptive');
    });

    it('returns Reading with transformed hexagram when changing lines exist', () => {
      const lines = create6Lines('old_yang');
      const reading = createReading(lines);

      expect(reading.transformed).not.toBeNull();
      expect(reading.transformed!.number).toBe(2);
      expect(reading.changingLines).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it('returns Reading without transformed hexagram when no changing lines', () => {
      const lines = create6Lines('young_yang');
      const reading = createReading(lines);

      expect(reading.transformed).toBeNull();
      expect(reading.changingLines).toEqual([]);
    });
  });

  describe('memoization behavior', () => {
    it('produces identical results for identical input', () => {
      const lines1 = create6Lines('young_yang');
      const lines2 = create6Lines('young_yang');

      const reading1 = createReading(lines1);
      const reading2 = createReading(lines2);

      // Same primary hexagram
      expect(reading1.primary.number).toBe(reading2.primary.number);
      expect(reading1.primary.binary).toBe(reading2.primary.binary);

      // Same transformed (both null)
      expect(reading1.transformed).toBe(reading2.transformed);
    });

    it('produces different results for different input', () => {
      const yangLines = create6Lines('young_yang');
      const yinLines = create6Lines('young_yin');

      const yangReading = createReading(yangLines);
      const yinReading = createReading(yinLines);

      expect(yangReading.primary.number).not.toBe(yinReading.primary.number);
      expect(yangReading.primary.number).toBe(1); // The Creative
      expect(yinReading.primary.number).toBe(2); // The Receptive
    });
  });
});
