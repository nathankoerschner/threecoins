import { tossCoin, tossThreeCoins } from '@/utils/coinToss';

describe('coinToss', () => {
  describe('tossCoin', () => {
    it('returns a boolean', () => {
      const result = tossCoin();
      expect(typeof result).toBe('boolean');
    });

    it('produces roughly 50/50 distribution over many tosses', () => {
      const results: boolean[] = [];
      for (let i = 0; i < 1000; i++) {
        results.push(tossCoin());
      }

      const heads = results.filter(Boolean).length;
      // Allow 35-65% range (lenient for randomness)
      expect(heads).toBeGreaterThan(350);
      expect(heads).toBeLessThan(650);
    });
  });

  describe('tossThreeCoins', () => {
    it('returns an array of exactly 3 booleans', () => {
      const result = tossThreeCoins();

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(3);
      result.forEach((coin) => {
        expect(typeof coin).toBe('boolean');
      });
    });

    it('returns a tuple with 3 elements', () => {
      const result = tossThreeCoins();
      expect(result.length).toBe(3);
    });

    it('produces varied results across multiple calls', () => {
      const results: string[] = [];
      for (let i = 0; i < 100; i++) {
        const toss = tossThreeCoins();
        results.push(toss.map((b) => (b ? '1' : '0')).join(''));
      }

      // Should have multiple unique outcomes (not all the same)
      const uniqueResults = new Set(results);
      expect(uniqueResults.size).toBeGreaterThan(1);
    });
  });
});
