import {
  linesToBinary,
  findPrimaryHexagram,
  findTransformedHexagram,
  getChangingLineIndices,
  createReading,
} from '@/utils/hexagramCalculator';
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

describe('hexagramCalculator', () => {
  describe('linesToBinary', () => {
    it('converts 6 yang lines to "111111"', () => {
      const lines = create6Lines('young_yang');
      expect(linesToBinary(lines)).toBe('111111');
    });

    it('converts 6 yin lines to "000000"', () => {
      const lines = create6Lines('young_yin');
      expect(linesToBinary(lines)).toBe('000000');
    });

    it('reverses line order (bottom-to-top becomes top-to-bottom)', () => {
      // Lines are cast bottom-to-top: [line1, line2, line3, line4, line5, line6]
      // Binary should be top-to-bottom: line6, line5, line4, line3, line2, line1
      const lines: CastLine[] = [
        mockLine('young_yang'), // Line 1 (bottom) - rightmost in binary
        mockLine('young_yin'), // Line 2
        mockLine('young_yang'), // Line 3
        mockLine('young_yin'), // Line 4
        mockLine('young_yang'), // Line 5
        mockLine('young_yin'), // Line 6 (top) - leftmost in binary
      ];

      // Reversed: line6=0, line5=1, line4=0, line3=1, line2=0, line1=1
      expect(linesToBinary(lines)).toBe('010101');
    });

    it('throws error for fewer than 6 lines', () => {
      const fiveLines = Array(5)
        .fill(null)
        .map(() => mockLine('young_yang'));
      expect(() => linesToBinary(fiveLines)).toThrow('Expected 6 lines, got 5');
    });

    it('throws error for more than 6 lines', () => {
      const sevenLines = Array(7)
        .fill(null)
        .map(() => mockLine('young_yang'));
      expect(() => linesToBinary(sevenLines)).toThrow(
        'Expected 6 lines, got 7'
      );
    });
  });

  describe('findPrimaryHexagram', () => {
    it('finds Hexagram 1 (The Creative) for all yang lines', () => {
      const lines = create6Lines('young_yang');
      const result = findPrimaryHexagram(lines);

      expect(result.number).toBe(1);
      expect(result.englishName).toBe('The Creative');
      expect(result.binary).toBe('111111');
    });

    it('finds Hexagram 2 (The Receptive) for all yin lines', () => {
      const lines = create6Lines('young_yin');
      const result = findPrimaryHexagram(lines);

      expect(result.number).toBe(2);
      expect(result.englishName).toBe('The Receptive');
      expect(result.binary).toBe('000000');
    });

    it('finds correct hexagram for mixed lines', () => {
      // Create Peace (Hexagram 11): binary 000111
      // Top-to-bottom: 0,0,0,1,1,1 -> reversed for bottom-to-top: 1,1,1,0,0,0
      const lines: CastLine[] = [
        mockLine('young_yang'), // Line 1 (bottom)
        mockLine('young_yang'), // Line 2
        mockLine('young_yang'), // Line 3
        mockLine('young_yin'), // Line 4
        mockLine('young_yin'), // Line 5
        mockLine('young_yin'), // Line 6 (top)
      ];

      const result = findPrimaryHexagram(lines);
      expect(result.number).toBe(11);
      expect(result.englishName).toBe('Peace');
    });
  });

  describe('findTransformedHexagram', () => {
    it('returns null when no changing lines', () => {
      const lines = create6Lines('young_yang');
      expect(findTransformedHexagram(lines)).toBeNull();
    });

    it('transforms all old_yang to young_yin (Hexagram 1 → Hexagram 2)', () => {
      const lines = create6Lines('old_yang');
      const result = findTransformedHexagram(lines);

      expect(result).not.toBeNull();
      expect(result!.number).toBe(2);
      expect(result!.englishName).toBe('The Receptive');
    });

    it('transforms all old_yin to young_yang (Hexagram 2 → Hexagram 1)', () => {
      const lines = create6Lines('old_yin');
      const result = findTransformedHexagram(lines);

      expect(result).not.toBeNull();
      expect(result!.number).toBe(1);
      expect(result!.englishName).toBe('The Creative');
    });

    it('only transforms changing lines, keeps stable lines', () => {
      // 5 stable yang + 1 changing yin at line 6
      const lines: CastLine[] = [
        mockLine('young_yang'),
        mockLine('young_yang'),
        mockLine('young_yang'),
        mockLine('young_yang'),
        mockLine('young_yang'),
        mockLine('old_yin', true), // Line 6 - changes yin → yang
      ];

      const result = findTransformedHexagram(lines);
      expect(result).not.toBeNull();
      // Original: 011111 (reversed: line6=0, rest=1)
      // After transform: 111111
      expect(result!.binary).toBe('111111');
      expect(result!.number).toBe(1);
    });
  });

  describe('getChangingLineIndices', () => {
    it('returns empty array when no changing lines', () => {
      const lines = create6Lines('young_yang');
      expect(getChangingLineIndices(lines)).toEqual([]);
    });

    it('returns 1-based indices for all changing lines', () => {
      const lines = create6Lines('old_yang');
      expect(getChangingLineIndices(lines)).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it('returns correct indices for mixed changing lines', () => {
      const lines: CastLine[] = [
        mockLine('old_yang', true), // Line 1 - changing
        mockLine('young_yin'), // Line 2 - stable
        mockLine('old_yin', true), // Line 3 - changing
        mockLine('young_yang'), // Line 4 - stable
        mockLine('young_yang'), // Line 5 - stable
        mockLine('old_yang', true), // Line 6 - changing
      ];

      expect(getChangingLineIndices(lines)).toEqual([1, 3, 6]);
    });
  });

  describe('createReading', () => {
    it('creates a complete Reading object with all properties', () => {
      const lines = create6Lines('young_yang');
      const reading = createReading(lines);

      expect(reading).toHaveProperty('primary');
      expect(reading).toHaveProperty('transformed');
      expect(reading).toHaveProperty('changingLines');
      expect(reading).toHaveProperty('castLines');
      expect(reading).toHaveProperty('timestamp');
    });

    it('includes correct primary hexagram', () => {
      const lines = create6Lines('young_yang');
      const reading = createReading(lines);

      expect(reading.primary.number).toBe(1);
      expect(reading.primary.englishName).toBe('The Creative');
    });

    it('includes null transformed when no changing lines', () => {
      const lines = create6Lines('young_yang');
      const reading = createReading(lines);

      expect(reading.transformed).toBeNull();
      expect(reading.changingLines).toEqual([]);
    });

    it('includes transformed hexagram when changing lines exist', () => {
      const lines = create6Lines('old_yang');
      const reading = createReading(lines);

      expect(reading.transformed).not.toBeNull();
      expect(reading.transformed!.number).toBe(2);
      expect(reading.changingLines).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it('includes original cast lines', () => {
      const lines = create6Lines('young_yang');
      const reading = createReading(lines);

      expect(reading.castLines).toBe(lines);
      expect(reading.castLines).toHaveLength(6);
    });

    it('includes timestamp as a number', () => {
      const before = Date.now();
      const lines = create6Lines('young_yang');
      const reading = createReading(lines);
      const after = Date.now();

      expect(typeof reading.timestamp).toBe('number');
      expect(reading.timestamp).toBeGreaterThanOrEqual(before);
      expect(reading.timestamp).toBeLessThanOrEqual(after);
    });

    it('throws error for fewer than 6 lines', () => {
      const lines = Array(3)
        .fill(null)
        .map(() => mockLine('young_yang'));
      expect(() => createReading(lines)).toThrow('Expected 6 lines');
    });
  });
});
