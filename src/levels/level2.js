/**
 * Level 2: 1 enemy + 1 math puzzle that opens a door
 * 36 columns × 18 rows
 */

// prettier-ignore
export const LEVEL2_MAP = [
  '                                    ',
  '                                    ',
  '                     PPP            ',
  '                                    ',
  '         PPP    PPP                 ',
  '                             PPP    ',
  '  PPP                               ',
  '                                    ',
  '                                    ',
  'B   F           Q  D    K   F      C',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
  'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
  'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
  'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
  'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
  'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
  'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
];

export const LEVEL2_CONFIG = {
  number: 2,
  name: 'Fox Forest',
  puzzleTypes: ['math'],  // one math puzzle
  bgColor: 0x1b5e20,
  groundColor: 0x2e7d32,
};
