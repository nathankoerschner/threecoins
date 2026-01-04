import {
  trigrams,
  findTrigramById,
  findTrigramByBinary,
} from '@/data/trigrams';

describe('trigrams data', () => {
  describe('data integrity', () => {
    it('contains exactly 8 trigrams', () => {
      expect(trigrams).toHaveLength(8);
    });

    it('has unique trigram IDs 1-8', () => {
      const ids = trigrams.map((t) => t.id);
      expect(new Set(ids).size).toBe(8);
      expect(Math.min(...ids)).toBe(1);
      expect(Math.max(...ids)).toBe(8);
    });

    it('has unique binary representations', () => {
      const binaries = trigrams.map((t) => t.binary);
      expect(new Set(binaries).size).toBe(8);
    });

    it('all binary strings are 3 characters of 0s and 1s', () => {
      trigrams.forEach((t) => {
        expect(t.binary).toMatch(/^[01]{3}$/);
      });
    });

    it('all trigrams have required properties', () => {
      trigrams.forEach((t) => {
        expect(t).toHaveProperty('id');
        expect(t).toHaveProperty('name');
        expect(t).toHaveProperty('chineseName');
        expect(t).toHaveProperty('character');
        expect(t).toHaveProperty('binary');
        expect(t).toHaveProperty('attribute');
        expect(t).toHaveProperty('image');
        expect(t).toHaveProperty('symbol');
      });
    });

    it('all trigrams have non-empty names', () => {
      trigrams.forEach((t) => {
        expect(typeof t.name).toBe('string');
        expect(t.name.length).toBeGreaterThan(0);
      });
    });

    it('all trigrams have Unicode symbols', () => {
      trigrams.forEach((t) => {
        expect(typeof t.symbol).toBe('string');
        expect(t.symbol.length).toBeGreaterThan(0);
      });
    });
  });

  describe('specific trigram validation', () => {
    it('Heaven (Qián) has all yang lines', () => {
      const heaven = trigrams.find((t) => t.id === 1);
      expect(heaven).toBeDefined();
      expect(heaven!.binary).toBe('111');
      expect(heaven!.name).toBe('Heaven');
      expect(heaven!.symbol).toBe('☰');
    });

    it('Earth (Kūn) has all yin lines', () => {
      const earth = trigrams.find((t) => t.id === 2);
      expect(earth).toBeDefined();
      expect(earth!.binary).toBe('000');
      expect(earth!.name).toBe('Earth');
      expect(earth!.symbol).toBe('☷');
    });
  });

  describe('findTrigramById', () => {
    it('finds trigram 1 (Heaven)', () => {
      const result = findTrigramById(1);
      expect(result).toBeDefined();
      expect(result!.name).toBe('Heaven');
      expect(result!.binary).toBe('111');
    });

    it('finds trigram 8 (Lake)', () => {
      const result = findTrigramById(8);
      expect(result).toBeDefined();
      expect(result!.name).toBe('Lake');
    });

    it('returns undefined for ID 0', () => {
      expect(findTrigramById(0)).toBeUndefined();
    });

    it('returns undefined for ID 9', () => {
      expect(findTrigramById(9)).toBeUndefined();
    });

    it('returns undefined for negative IDs', () => {
      expect(findTrigramById(-1)).toBeUndefined();
    });
  });

  describe('findTrigramByBinary', () => {
    it('finds Heaven by binary "111"', () => {
      const result = findTrigramByBinary('111');
      expect(result).toBeDefined();
      expect(result!.id).toBe(1);
      expect(result!.name).toBe('Heaven');
    });

    it('finds Earth by binary "000"', () => {
      const result = findTrigramByBinary('000');
      expect(result).toBeDefined();
      expect(result!.id).toBe(2);
      expect(result!.name).toBe('Earth');
    });

    it('returns undefined for invalid binary', () => {
      expect(findTrigramByBinary('invalid')).toBeUndefined();
    });

    it('returns undefined for wrong length binary', () => {
      expect(findTrigramByBinary('11')).toBeUndefined();
      expect(findTrigramByBinary('1111')).toBeUndefined();
    });

    it('returns undefined for empty string', () => {
      expect(findTrigramByBinary('')).toBeUndefined();
    });
  });
});
