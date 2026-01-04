import {
  calculateLineType,
  isChangingLine,
  createCastLine,
  lineToBinary,
} from '@/utils/lineCalculator';

describe('lineCalculator', () => {
  describe('calculateLineType', () => {
    it('returns old_yin (6) for three tails [false, false, false]', () => {
      const result = calculateLineType([false, false, false]);
      expect(result).toBe('old_yin');
    });

    it('returns young_yang (7) for two tails, one head', () => {
      // 2 + 2 + 3 = 7
      const result = calculateLineType([false, false, true]);
      expect(result).toBe('young_yang');
    });

    it('returns young_yin (8) for two heads, one tail', () => {
      // 3 + 3 + 2 = 8
      const result = calculateLineType([true, true, false]);
      expect(result).toBe('young_yin');
    });

    it('returns old_yang (9) for three heads [true, true, true]', () => {
      const result = calculateLineType([true, true, true]);
      expect(result).toBe('old_yang');
    });

    it('produces same result regardless of coin order for young_yang', () => {
      const permutations: [boolean, boolean, boolean][] = [
        [true, false, false],
        [false, true, false],
        [false, false, true],
      ];

      const results = permutations.map(calculateLineType);
      expect(new Set(results).size).toBe(1);
      expect(results[0]).toBe('young_yang');
    });

    it('produces same result regardless of coin order for young_yin', () => {
      const permutations: [boolean, boolean, boolean][] = [
        [true, true, false],
        [true, false, true],
        [false, true, true],
      ];

      const results = permutations.map(calculateLineType);
      expect(new Set(results).size).toBe(1);
      expect(results[0]).toBe('young_yin');
    });
  });

  describe('isChangingLine', () => {
    it('returns true for old_yin', () => {
      expect(isChangingLine('old_yin')).toBe(true);
    });

    it('returns true for old_yang', () => {
      expect(isChangingLine('old_yang')).toBe(true);
    });

    it('returns false for young_yin', () => {
      expect(isChangingLine('young_yin')).toBe(false);
    });

    it('returns false for young_yang', () => {
      expect(isChangingLine('young_yang')).toBe(false);
    });
  });

  describe('lineToBinary', () => {
    it('returns "1" for young_yang', () => {
      expect(lineToBinary('young_yang')).toBe('1');
    });

    it('returns "1" for old_yang', () => {
      expect(lineToBinary('old_yang')).toBe('1');
    });

    it('returns "0" for young_yin', () => {
      expect(lineToBinary('young_yin')).toBe('0');
    });

    it('returns "0" for old_yin', () => {
      expect(lineToBinary('old_yin')).toBe('0');
    });
  });

  describe('createCastLine', () => {
    it('creates a complete CastLine for old_yang (three heads)', () => {
      const coins: [boolean, boolean, boolean] = [true, true, true];
      const result = createCastLine(coins);

      expect(result).toEqual({
        coins: [true, true, true],
        lineType: 'old_yang',
        isChanging: true,
        value: 9,
      });
    });

    it('creates a complete CastLine for old_yin (three tails)', () => {
      const coins: [boolean, boolean, boolean] = [false, false, false];
      const result = createCastLine(coins);

      expect(result).toEqual({
        coins: [false, false, false],
        lineType: 'old_yin',
        isChanging: true,
        value: 6,
      });
    });

    it('creates a complete CastLine for young_yang', () => {
      const coins: [boolean, boolean, boolean] = [true, false, false];
      const result = createCastLine(coins);

      expect(result).toEqual({
        coins: [true, false, false],
        lineType: 'young_yang',
        isChanging: false,
        value: 7,
      });
    });

    it('creates a complete CastLine for young_yin', () => {
      const coins: [boolean, boolean, boolean] = [true, true, false];
      const result = createCastLine(coins);

      expect(result).toEqual({
        coins: [true, true, false],
        lineType: 'young_yin',
        isChanging: false,
        value: 8,
      });
    });

    it('calculates value correctly as sum of coin values', () => {
      // All tails = 2+2+2 = 6
      expect(createCastLine([false, false, false]).value).toBe(6);

      // All heads = 3+3+3 = 9
      expect(createCastLine([true, true, true]).value).toBe(9);

      // One head, two tails = 3+2+2 = 7
      expect(createCastLine([true, false, false]).value).toBe(7);

      // Two heads, one tail = 3+3+2 = 8
      expect(createCastLine([true, true, false]).value).toBe(8);
    });
  });
});
