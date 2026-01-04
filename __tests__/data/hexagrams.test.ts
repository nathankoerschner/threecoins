import {
  hexagrams,
  findHexagramByNumber,
  findHexagramByBinary,
} from '@/data/hexagrams';

describe('hexagrams data', () => {
  describe('data integrity', () => {
    it('contains exactly 64 hexagrams', () => {
      expect(hexagrams).toHaveLength(64);
    });

    it('has unique hexagram numbers 1-64', () => {
      const numbers = hexagrams.map((h) => h.number);
      expect(new Set(numbers).size).toBe(64);
      expect(Math.min(...numbers)).toBe(1);
      expect(Math.max(...numbers)).toBe(64);
    });

    it('has unique binary representations', () => {
      const binaries = hexagrams.map((h) => h.binary);
      expect(new Set(binaries).size).toBe(64);
    });

    it('all binary strings are 6 characters of 0s and 1s', () => {
      hexagrams.forEach((h) => {
        expect(h.binary).toMatch(/^[01]{6}$/);
      });
    });

    it('all hexagrams have required properties', () => {
      hexagrams.forEach((h) => {
        expect(h).toHaveProperty('number');
        expect(h).toHaveProperty('chineseName');
        expect(h).toHaveProperty('chineseCharacter');
        expect(h).toHaveProperty('englishName');
        expect(h).toHaveProperty('binary');
        expect(h).toHaveProperty('upperTrigram');
        expect(h).toHaveProperty('lowerTrigram');
        expect(h).toHaveProperty('kingWenOrder');
      });
    });

    it('trigram references are valid (1-8)', () => {
      hexagrams.forEach((h) => {
        expect(h.upperTrigram).toBeGreaterThanOrEqual(1);
        expect(h.upperTrigram).toBeLessThanOrEqual(8);
        expect(h.lowerTrigram).toBeGreaterThanOrEqual(1);
        expect(h.lowerTrigram).toBeLessThanOrEqual(8);
      });
    });

    it('all hexagrams have non-empty English names', () => {
      hexagrams.forEach((h) => {
        expect(typeof h.englishName).toBe('string');
        expect(h.englishName.length).toBeGreaterThan(0);
      });
    });

    it('all hexagrams have non-empty Chinese names', () => {
      hexagrams.forEach((h) => {
        expect(typeof h.chineseName).toBe('string');
        expect(h.chineseName.length).toBeGreaterThan(0);
      });
    });
  });

  describe('specific hexagram validation', () => {
    it('Hexagram 1 (The Creative) has all yang lines', () => {
      const hex1 = hexagrams.find((h) => h.number === 1);
      expect(hex1).toBeDefined();
      expect(hex1!.binary).toBe('111111');
      expect(hex1!.englishName).toBe('The Creative');
    });

    it('Hexagram 2 (The Receptive) has all yin lines', () => {
      const hex2 = hexagrams.find((h) => h.number === 2);
      expect(hex2).toBeDefined();
      expect(hex2!.binary).toBe('000000');
      expect(hex2!.englishName).toBe('The Receptive');
    });
  });

  describe('findHexagramByNumber', () => {
    it('finds hexagram 1 (The Creative)', () => {
      const result = findHexagramByNumber(1);
      expect(result).toBeDefined();
      expect(result!.englishName).toBe('The Creative');
      expect(result!.binary).toBe('111111');
    });

    it('finds hexagram 64 (Before Completion)', () => {
      const result = findHexagramByNumber(64);
      expect(result).toBeDefined();
      expect(result!.englishName).toBe('Before Completion');
    });

    it('returns undefined for number 0', () => {
      expect(findHexagramByNumber(0)).toBeUndefined();
    });

    it('returns undefined for number 65', () => {
      expect(findHexagramByNumber(65)).toBeUndefined();
    });

    it('returns undefined for negative numbers', () => {
      expect(findHexagramByNumber(-1)).toBeUndefined();
    });
  });

  describe('findHexagramByBinary', () => {
    it('finds hexagram by binary string "111111"', () => {
      const result = findHexagramByBinary('111111');
      expect(result).toBeDefined();
      expect(result!.number).toBe(1);
      expect(result!.englishName).toBe('The Creative');
    });

    it('finds hexagram by binary string "000000"', () => {
      const result = findHexagramByBinary('000000');
      expect(result).toBeDefined();
      expect(result!.number).toBe(2);
      expect(result!.englishName).toBe('The Receptive');
    });

    it('returns undefined for invalid binary string', () => {
      expect(findHexagramByBinary('invalid')).toBeUndefined();
    });

    it('returns undefined for wrong length binary', () => {
      expect(findHexagramByBinary('11111')).toBeUndefined();
      expect(findHexagramByBinary('1111111')).toBeUndefined();
    });

    it('returns undefined for empty string', () => {
      expect(findHexagramByBinary('')).toBeUndefined();
    });
  });
});
