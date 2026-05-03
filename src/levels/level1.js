/**
 * Level 1: Carrot Valley — tutorial.
 * 30 columns × 16 rows. No enemies. 3 small carrots gate the exit:
 * - one at ground level (walk past)
 * - one above the row-6 platform (climb left side)
 * - one above the row-5 platform (climb right side)
 */

// prettier-ignore
export const LEVEL1_MAP = [
  '                              ',
  '                              ',
  '                              ',
  '                              ',
  '           c           c      ',
  '                      PPP     ',
  '          PPP                 ',
  '             D                ',
  '    PPP      D    PPP         ',
  '             D                ',
  'B    c    Q  D      K        C',
  'TTT TTTTTTTTTTTTT TTTTTTTTTTTT',
  'GGG GGGGGGGGGGGGG GGGGGGGGGGGG',
  'GGG GGGGGGGGGGGGG GGGGGGGGGGGG',
  'GGG GGGGGGGGGGGGG GGGGGGGGGGGG',
  'GGG GGGGGGGGGGGGG GGGGGGGGGGGG',
];

export const LEVEL1_CONFIG = {
  number: 1,
  name: 'Carrot Valley',
  puzzleTypes: ['spelling'],
  bgColor: 0x1a237e,
  groundColor: 0x4caf50,
};
