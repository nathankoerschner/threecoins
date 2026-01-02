import { Hexagram } from '@/types';

// All 64 hexagrams in King Wen sequence
// Binary representation: 6 digits, top to bottom (1 = yang, 0 = yin)
// Upper trigram = lines 4-6 (top 3 bits), Lower trigram = lines 1-3 (bottom 3 bits)
export const hexagrams: Hexagram[] = [
  { number: 1, chineseName: 'Qián', chineseCharacter: '乾', englishName: 'The Creative', binary: '111111', upperTrigram: 1, lowerTrigram: 1, kingWenOrder: 1 },
  { number: 2, chineseName: 'Kūn', chineseCharacter: '坤', englishName: 'The Receptive', binary: '000000', upperTrigram: 2, lowerTrigram: 2, kingWenOrder: 2 },
  { number: 3, chineseName: 'Zhūn', chineseCharacter: '屯', englishName: 'Difficulty at the Beginning', binary: '010001', upperTrigram: 4, lowerTrigram: 3, kingWenOrder: 3 },
  { number: 4, chineseName: 'Mēng', chineseCharacter: '蒙', englishName: 'Youthful Folly', binary: '100010', upperTrigram: 5, lowerTrigram: 4, kingWenOrder: 4 },
  { number: 5, chineseName: 'Xū', chineseCharacter: '需', englishName: 'Waiting', binary: '010111', upperTrigram: 4, lowerTrigram: 1, kingWenOrder: 5 },
  { number: 6, chineseName: 'Sòng', chineseCharacter: '訟', englishName: 'Conflict', binary: '111010', upperTrigram: 1, lowerTrigram: 4, kingWenOrder: 6 },
  { number: 7, chineseName: 'Shī', chineseCharacter: '師', englishName: 'The Army', binary: '000010', upperTrigram: 2, lowerTrigram: 4, kingWenOrder: 7 },
  { number: 8, chineseName: 'Bǐ', chineseCharacter: '比', englishName: 'Holding Together', binary: '010000', upperTrigram: 4, lowerTrigram: 2, kingWenOrder: 8 },
  { number: 9, chineseName: 'Xiǎo Chù', chineseCharacter: '小畜', englishName: 'Small Taming', binary: '011111', upperTrigram: 6, lowerTrigram: 1, kingWenOrder: 9 },
  { number: 10, chineseName: 'Lǚ', chineseCharacter: '履', englishName: 'Treading', binary: '111110', upperTrigram: 1, lowerTrigram: 8, kingWenOrder: 10 },
  { number: 11, chineseName: 'Tài', chineseCharacter: '泰', englishName: 'Peace', binary: '000111', upperTrigram: 2, lowerTrigram: 1, kingWenOrder: 11 },
  { number: 12, chineseName: 'Pǐ', chineseCharacter: '否', englishName: 'Standstill', binary: '111000', upperTrigram: 1, lowerTrigram: 2, kingWenOrder: 12 },
  { number: 13, chineseName: 'Tóng Rén', chineseCharacter: '同人', englishName: 'Fellowship', binary: '111101', upperTrigram: 1, lowerTrigram: 7, kingWenOrder: 13 },
  { number: 14, chineseName: 'Dà Yǒu', chineseCharacter: '大有', englishName: 'Great Possession', binary: '101111', upperTrigram: 7, lowerTrigram: 1, kingWenOrder: 14 },
  { number: 15, chineseName: 'Qiān', chineseCharacter: '謙', englishName: 'Modesty', binary: '000100', upperTrigram: 2, lowerTrigram: 5, kingWenOrder: 15 },
  { number: 16, chineseName: 'Yù', chineseCharacter: '豫', englishName: 'Enthusiasm', binary: '001000', upperTrigram: 3, lowerTrigram: 2, kingWenOrder: 16 },
  { number: 17, chineseName: 'Suí', chineseCharacter: '隨', englishName: 'Following', binary: '110001', upperTrigram: 8, lowerTrigram: 3, kingWenOrder: 17 },
  { number: 18, chineseName: 'Gǔ', chineseCharacter: '蠱', englishName: 'Work on the Decayed', binary: '100011', upperTrigram: 5, lowerTrigram: 6, kingWenOrder: 18 },
  { number: 19, chineseName: 'Lín', chineseCharacter: '臨', englishName: 'Approach', binary: '000110', upperTrigram: 2, lowerTrigram: 8, kingWenOrder: 19 },
  { number: 20, chineseName: 'Guān', chineseCharacter: '觀', englishName: 'Contemplation', binary: '011000', upperTrigram: 6, lowerTrigram: 2, kingWenOrder: 20 },
  { number: 21, chineseName: 'Shì Kè', chineseCharacter: '噬嗑', englishName: 'Biting Through', binary: '101001', upperTrigram: 7, lowerTrigram: 3, kingWenOrder: 21 },
  { number: 22, chineseName: 'Bì', chineseCharacter: '賁', englishName: 'Grace', binary: '100101', upperTrigram: 5, lowerTrigram: 7, kingWenOrder: 22 },
  { number: 23, chineseName: 'Bō', chineseCharacter: '剝', englishName: 'Splitting Apart', binary: '100000', upperTrigram: 5, lowerTrigram: 2, kingWenOrder: 23 },
  { number: 24, chineseName: 'Fù', chineseCharacter: '復', englishName: 'Return', binary: '000001', upperTrigram: 2, lowerTrigram: 3, kingWenOrder: 24 },
  { number: 25, chineseName: 'Wú Wàng', chineseCharacter: '無妄', englishName: 'Innocence', binary: '111001', upperTrigram: 1, lowerTrigram: 3, kingWenOrder: 25 },
  { number: 26, chineseName: 'Dà Chù', chineseCharacter: '大畜', englishName: 'Great Taming', binary: '100111', upperTrigram: 5, lowerTrigram: 1, kingWenOrder: 26 },
  { number: 27, chineseName: 'Yí', chineseCharacter: '頤', englishName: 'Nourishment', binary: '100001', upperTrigram: 5, lowerTrigram: 3, kingWenOrder: 27 },
  { number: 28, chineseName: 'Dà Guò', chineseCharacter: '大過', englishName: 'Great Exceeding', binary: '110011', upperTrigram: 8, lowerTrigram: 6, kingWenOrder: 28 },
  { number: 29, chineseName: 'Kǎn', chineseCharacter: '坎', englishName: 'The Abysmal Water', binary: '010010', upperTrigram: 4, lowerTrigram: 4, kingWenOrder: 29 },
  { number: 30, chineseName: 'Lí', chineseCharacter: '離', englishName: 'The Clinging Fire', binary: '101101', upperTrigram: 7, lowerTrigram: 7, kingWenOrder: 30 },
  { number: 31, chineseName: 'Xián', chineseCharacter: '咸', englishName: 'Influence', binary: '110100', upperTrigram: 8, lowerTrigram: 5, kingWenOrder: 31 },
  { number: 32, chineseName: 'Héng', chineseCharacter: '恆', englishName: 'Duration', binary: '001011', upperTrigram: 3, lowerTrigram: 6, kingWenOrder: 32 },
  { number: 33, chineseName: 'Dùn', chineseCharacter: '遯', englishName: 'Retreat', binary: '111100', upperTrigram: 1, lowerTrigram: 5, kingWenOrder: 33 },
  { number: 34, chineseName: 'Dà Zhuàng', chineseCharacter: '大壯', englishName: 'Great Power', binary: '001111', upperTrigram: 3, lowerTrigram: 1, kingWenOrder: 34 },
  { number: 35, chineseName: 'Jìn', chineseCharacter: '晉', englishName: 'Progress', binary: '101000', upperTrigram: 7, lowerTrigram: 2, kingWenOrder: 35 },
  { number: 36, chineseName: 'Míng Yí', chineseCharacter: '明夷', englishName: 'Darkening of the Light', binary: '000101', upperTrigram: 2, lowerTrigram: 7, kingWenOrder: 36 },
  { number: 37, chineseName: 'Jiā Rén', chineseCharacter: '家人', englishName: 'The Family', binary: '011101', upperTrigram: 6, lowerTrigram: 7, kingWenOrder: 37 },
  { number: 38, chineseName: 'Kuí', chineseCharacter: '睽', englishName: 'Opposition', binary: '101110', upperTrigram: 7, lowerTrigram: 8, kingWenOrder: 38 },
  { number: 39, chineseName: 'Jiǎn', chineseCharacter: '蹇', englishName: 'Obstruction', binary: '010100', upperTrigram: 4, lowerTrigram: 5, kingWenOrder: 39 },
  { number: 40, chineseName: 'Xiè', chineseCharacter: '解', englishName: 'Deliverance', binary: '001010', upperTrigram: 3, lowerTrigram: 4, kingWenOrder: 40 },
  { number: 41, chineseName: 'Sǔn', chineseCharacter: '損', englishName: 'Decrease', binary: '100110', upperTrigram: 5, lowerTrigram: 8, kingWenOrder: 41 },
  { number: 42, chineseName: 'Yì', chineseCharacter: '益', englishName: 'Increase', binary: '011001', upperTrigram: 6, lowerTrigram: 3, kingWenOrder: 42 },
  { number: 43, chineseName: 'Guài', chineseCharacter: '夬', englishName: 'Breakthrough', binary: '110111', upperTrigram: 8, lowerTrigram: 1, kingWenOrder: 43 },
  { number: 44, chineseName: 'Gòu', chineseCharacter: '姤', englishName: 'Coming to Meet', binary: '111011', upperTrigram: 1, lowerTrigram: 6, kingWenOrder: 44 },
  { number: 45, chineseName: 'Cuì', chineseCharacter: '萃', englishName: 'Gathering Together', binary: '110000', upperTrigram: 8, lowerTrigram: 2, kingWenOrder: 45 },
  { number: 46, chineseName: 'Shēng', chineseCharacter: '升', englishName: 'Pushing Upward', binary: '000011', upperTrigram: 2, lowerTrigram: 6, kingWenOrder: 46 },
  { number: 47, chineseName: 'Kùn', chineseCharacter: '困', englishName: 'Oppression', binary: '110010', upperTrigram: 8, lowerTrigram: 4, kingWenOrder: 47 },
  { number: 48, chineseName: 'Jǐng', chineseCharacter: '井', englishName: 'The Well', binary: '010011', upperTrigram: 4, lowerTrigram: 6, kingWenOrder: 48 },
  { number: 49, chineseName: 'Gé', chineseCharacter: '革', englishName: 'Revolution', binary: '110101', upperTrigram: 8, lowerTrigram: 7, kingWenOrder: 49 },
  { number: 50, chineseName: 'Dǐng', chineseCharacter: '鼎', englishName: 'The Cauldron', binary: '101011', upperTrigram: 7, lowerTrigram: 6, kingWenOrder: 50 },
  { number: 51, chineseName: 'Zhèn', chineseCharacter: '震', englishName: 'The Arousing Thunder', binary: '001001', upperTrigram: 3, lowerTrigram: 3, kingWenOrder: 51 },
  { number: 52, chineseName: 'Gèn', chineseCharacter: '艮', englishName: 'Keeping Still Mountain', binary: '100100', upperTrigram: 5, lowerTrigram: 5, kingWenOrder: 52 },
  { number: 53, chineseName: 'Jiàn', chineseCharacter: '漸', englishName: 'Development', binary: '011100', upperTrigram: 6, lowerTrigram: 5, kingWenOrder: 53 },
  { number: 54, chineseName: 'Guī Mèi', chineseCharacter: '歸妹', englishName: 'The Marrying Maiden', binary: '001110', upperTrigram: 3, lowerTrigram: 8, kingWenOrder: 54 },
  { number: 55, chineseName: 'Fēng', chineseCharacter: '豐', englishName: 'Abundance', binary: '001101', upperTrigram: 3, lowerTrigram: 7, kingWenOrder: 55 },
  { number: 56, chineseName: 'Lǚ', chineseCharacter: '旅', englishName: 'The Wanderer', binary: '101100', upperTrigram: 7, lowerTrigram: 5, kingWenOrder: 56 },
  { number: 57, chineseName: 'Xùn', chineseCharacter: '巽', englishName: 'The Gentle Wind', binary: '011011', upperTrigram: 6, lowerTrigram: 6, kingWenOrder: 57 },
  { number: 58, chineseName: 'Duì', chineseCharacter: '兌', englishName: 'The Joyous Lake', binary: '110110', upperTrigram: 8, lowerTrigram: 8, kingWenOrder: 58 },
  { number: 59, chineseName: 'Huàn', chineseCharacter: '渙', englishName: 'Dispersion', binary: '011010', upperTrigram: 6, lowerTrigram: 4, kingWenOrder: 59 },
  { number: 60, chineseName: 'Jié', chineseCharacter: '節', englishName: 'Limitation', binary: '010110', upperTrigram: 4, lowerTrigram: 8, kingWenOrder: 60 },
  { number: 61, chineseName: 'Zhōng Fú', chineseCharacter: '中孚', englishName: 'Inner Truth', binary: '011110', upperTrigram: 6, lowerTrigram: 8, kingWenOrder: 61 },
  { number: 62, chineseName: 'Xiǎo Guò', chineseCharacter: '小過', englishName: 'Small Exceeding', binary: '001100', upperTrigram: 3, lowerTrigram: 5, kingWenOrder: 62 },
  { number: 63, chineseName: 'Jì Jì', chineseCharacter: '既濟', englishName: 'After Completion', binary: '010101', upperTrigram: 4, lowerTrigram: 7, kingWenOrder: 63 },
  { number: 64, chineseName: 'Wèi Jì', chineseCharacter: '未濟', englishName: 'Before Completion', binary: '101010', upperTrigram: 7, lowerTrigram: 4, kingWenOrder: 64 },
];

// Helper function to find hexagram by number
export const findHexagramByNumber = (number: number): Hexagram | undefined => {
  return hexagrams.find((h) => h.number === number);
};

// Helper function to find hexagram by binary representation
export const findHexagramByBinary = (binary: string): Hexagram | undefined => {
  return hexagrams.find((h) => h.binary === binary);
};
