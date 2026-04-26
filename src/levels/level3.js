/**
 * Level 3: 2 enemies + both puzzle types + 2 checkpoints
 * 42 columns × 18 rows
 */

// prettier-ignore
export const LEVEL3_MAP = [
  '                                          ',
  '                                          ',
  '             PPP       PPP                ',
  '   PPP                       PPP          ',
  '                  PPP                     ',
  '         PPP                     PPP      ',
  '                                          ',
  '            D                D            ',
  '            D                D            ',
  '  PPP       D                D            ',
  'B   F    Q  D   K   E     Q  D   K  F    C',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
  'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
  'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
  'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
  'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
  'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
];

export const LEVEL3_CONFIG = {
  number: 3,
  name: 'Crystal Caves',
  puzzleTypes: ['spelling', 'math'],  // both puzzle types
  bgColor: 0x0d1b2a,
  groundColor: 0x546e7a,
};
