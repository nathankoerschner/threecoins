import { CastLine, Hexagram, Reading } from '@/types';
import { findHexagramByBinary } from '@/data/hexagrams';
import { lineToBinary } from './lineCalculator';

// Convert an array of cast lines to binary string
// Lines are cast bottom-to-top but hexagram binary is top-to-bottom
// So we need to reverse the lines array
export const linesToBinary = (lines: CastLine[]): string => {
  if (lines.length !== 6) {
    throw new Error(`Expected 6 lines, got ${lines.length}`);
  }

  // Reverse the lines (bottom-to-top → top-to-bottom)
  return lines
    .slice()
    .reverse()
    .map((line) => lineToBinary(line.lineType))
    .join('');
};

// Find the primary hexagram from cast lines
export const findPrimaryHexagram = (lines: CastLine[]): Hexagram => {
  const binary = linesToBinary(lines);
  const hexagram = findHexagramByBinary(binary);

  if (!hexagram) {
    throw new Error(`No hexagram found for binary: ${binary}`);
  }

  return hexagram;
};

// Find the transformed hexagram by changing all changing lines
// Returns null if there are no changing lines
export const findTransformedHexagram = (lines: CastLine[]): Hexagram | null => {
  const changingLines = lines.filter((line) => line.isChanging);

  if (changingLines.length === 0) {
    return null; // No transformation
  }

  // Transform changing lines to their opposite
  const transformedLines: CastLine[] = lines.map((line) => {
    if (!line.isChanging) {
      return line;
    }

    // Change old yang → young yin, old yin → young yang
    const newLineType =
      line.lineType === 'old_yang' ? 'young_yin' : 'young_yang';

    return {
      ...line,
      lineType: newLineType,
      isChanging: false,
    };
  });

  return findPrimaryHexagram(transformedLines);
};

// Get the indices of changing lines (1-based, bottom-to-top)
export const getChangingLineIndices = (lines: CastLine[]): number[] => {
  return lines
    .map((line, index) => (line.isChanging ? index + 1 : -1))
    .filter((index) => index !== -1);
};

// Create a complete Reading from cast lines
export const createReading = (lines: CastLine[]): Reading => {
  if (lines.length !== 6) {
    throw new Error(`Expected 6 lines, got ${lines.length}`);
  }

  const primary = findPrimaryHexagram(lines);
  const transformed = findTransformedHexagram(lines);
  const changingLines = getChangingLineIndices(lines);

  return {
    primary,
    transformed,
    changingLines,
    castLines: lines,
    timestamp: Date.now(),
  };
};
