import { Trigram } from '@/types';

export const trigrams: Trigram[] = [
  {
    id: 1,
    name: 'Heaven',
    chineseName: 'Qián',
    character: '乾',
    binary: '111', // All yang lines
    attribute: 'Creative',
    image: 'Heaven',
    symbol: '☰',
  },
  {
    id: 2,
    name: 'Earth',
    chineseName: 'Kūn',
    character: '坤',
    binary: '000', // All yin lines
    attribute: 'Receptive',
    image: 'Earth',
    symbol: '☷',
  },
  {
    id: 3,
    name: 'Thunder',
    chineseName: 'Zhèn',
    character: '震',
    binary: '001', // Yang below, yin above
    attribute: 'Arousing',
    image: 'Thunder',
    symbol: '☳',
  },
  {
    id: 4,
    name: 'Water',
    chineseName: 'Kǎn',
    character: '坎',
    binary: '010', // Yang in middle
    attribute: 'Abysmal',
    image: 'Water',
    symbol: '☵',
  },
  {
    id: 5,
    name: 'Mountain',
    chineseName: 'Gèn',
    character: '艮',
    binary: '100', // Yang above, yin below
    attribute: 'Keeping Still',
    image: 'Mountain',
    symbol: '☶',
  },
  {
    id: 6,
    name: 'Wind',
    chineseName: 'Xùn',
    character: '巽',
    binary: '011', // Yin below, yang above
    attribute: 'Gentle',
    image: 'Wind',
    symbol: '☴',
  },
  {
    id: 7,
    name: 'Fire',
    chineseName: 'Lí',
    character: '離',
    binary: '101', // Yin in middle
    attribute: 'Clinging',
    image: 'Fire',
    symbol: '☲',
  },
  {
    id: 8,
    name: 'Lake',
    chineseName: 'Duì',
    character: '兌',
    binary: '110', // Yin above, yang below
    attribute: 'Joyous',
    image: 'Lake',
    symbol: '☱',
  },
];

// Helper function to find trigram by ID
export const findTrigramById = (id: number): Trigram | undefined => {
  return trigrams.find((t) => t.id === id);
};

// Helper function to find trigram by binary representation
export const findTrigramByBinary = (binary: string): Trigram | undefined => {
  return trigrams.find((t) => t.binary === binary);
};
