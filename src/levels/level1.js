/**
 * Level 1: Tutorial - jump + 1 spelling puzzle
 * 30 columns × 16 rows
 * Tile size: 48px display (16px source × 3)
 * Level dimensions: 30×48 = 1440px wide, 16×48 = 768px tall
 */

// prettier-ignore
export const LEVEL1_MAP = [
  '                              ',
  '                              ',
  '                              ',
  '                              ',
  '                              ',
  '                      PPP     ',
  '          PPP                 ',
  '                              ',
  '    PPP           PPP         ',
  '                              ',
  'B         Q  D      K        C',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
  'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
  'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
  'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
];

export const LEVEL1_CONFIG = {
  number: 1,
  name: 'Carrot Valley',
  puzzleTypes: ['spelling'],  // one spelling puzzle
  bgColor: 0x1a237e,
  groundColor: 0x4caf50,
};
