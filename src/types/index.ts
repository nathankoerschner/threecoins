// Line types based on I Ching coin toss method
export type LineType = 'old_yin' | 'young_yang' | 'young_yin' | 'old_yang';

// Pull direction for coin casting gesture
export type PullDirection = 'up' | 'down';

// Represents a single line cast with coin toss results
export interface CastLine {
  coins: [boolean, boolean, boolean]; // true = heads (yang side), false = tails (yin side)
  lineType: LineType;
  isChanging: boolean;
  value: number; // 6, 7, 8, or 9
}

// State of an ongoing casting session
export interface CastingState {
  lines: CastLine[]; // 0-6 lines, accumulated bottom to top
  isComplete: boolean;
  queuedThrows: number;
  timestamp: number; // For persistence
}

// Represents one of the 8 trigrams
export interface Trigram {
  id: number; // 1-8
  name: string; // "Heaven", "Earth", etc.
  chineseName: string; // "Qián", "Kūn", etc.
  character: string; // "乾", "坤", etc.
  binary: string; // "111", "000", etc. (top to bottom)
  attribute: string; // "Creative", "Receptive", etc.
  image: string; // "Heaven", "Earth", etc.
  symbol: string; // "☰", "☷", etc.
}

// Represents one of the 64 hexagrams
export interface Hexagram {
  number: number; // 1-64
  chineseName: string; // "Qián"
  chineseCharacter: string; // "乾"
  englishName: string; // "The Creative"
  binary: string; // "111111" (6 digits, top to bottom)
  upperTrigram: number; // 1-8 (reference to Trigram.id)
  lowerTrigram: number; // 1-8
  kingWenOrder: number; // Traditional ordering (1-64)
}

// Complete reading with primary and transformed hexagrams
export interface Reading {
  primary: Hexagram;
  transformed: Hexagram | null; // null if no changing lines
  changingLines: number[]; // 1-6 (bottom to top)
  castLines: CastLine[];
  timestamp: number;
}
