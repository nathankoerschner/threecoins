import { LineType, CastLine } from '@/types';

// Calculate line type from three coin tosses
// Traditional I Ching method:
// - Heads (yang) = 3 points
// - Tails (yin) = 2 points
//
// Sum of three coins:
// - 6 = old yin (changing yin → yang)
// - 7 = young yang (stable yang)
// - 8 = young yin (stable yin)
// - 9 = old yang (changing yang → yin)
export const calculateLineType = (coins: [boolean, boolean, boolean]): LineType => {
  const sum = coins.reduce((acc, isHeads) => acc + (isHeads ? 3 : 2), 0);

  switch (sum) {
    case 6:
      return 'old_yin';      // Three tails - changing yin
    case 7:
      return 'young_yang';   // Two heads, one tail - stable yang
    case 8:
      return 'young_yin';    // Two tails, one head - stable yin
    case 9:
      return 'old_yang';     // Three heads - changing yang
    default:
      throw new Error(`Invalid coin sum: ${sum}`);
  }
};

// Check if a line type is changing
export const isChangingLine = (lineType: LineType): boolean => {
  return lineType === 'old_yin' || lineType === 'old_yang';
};

// Create a complete CastLine from coin toss result
export const createCastLine = (coins: [boolean, boolean, boolean]): CastLine => {
  const lineType = calculateLineType(coins);
  const value = coins.reduce((acc, isHeads) => acc + (isHeads ? 3 : 2), 0);

  return {
    coins,
    lineType,
    isChanging: isChangingLine(lineType),
    value,
  };
};

// Convert line type to binary representation (for hexagram lookup)
// Yang lines (young_yang, old_yang) = '1'
// Yin lines (young_yin, old_yin) = '0'
export const lineToBinary = (lineType: LineType): '0' | '1' => {
  return lineType === 'young_yang' || lineType === 'old_yang' ? '1' : '0';
};
