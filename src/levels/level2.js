/**
 * Level 2: Fox Forest — patrolling foxes + a math gate.
 * 36 columns × 18 rows. 3 small carrots gate the exit, all positioned above
 * existing platforms so the platforms finally have a purpose.
 */

// prettier-ignore
export const LEVEL2_MAP = [
  '                                    ',
  '                      c             ',
  '                     PPP            ',
  '                 c                  ',
  '         PPP    PPP                 ',
  '   c                         PPP    ',
  '  PPP                               ',
  '                   D                ',
  '                   D                ',
  '                   D                ',
  'B   F           Q  D    K   F      C',
  'TTTTTTTT TTTTTTTTTTTTTTTTTTTTTTTT TT',
  'GGGGGGGG GGGGGGGGGGGGGGGGGGGGGGGG GG',
  'GGGGGGGG GGGGGGGGGGGGGGGGGGGGGGGG GG',
  'GGGGGGGG GGGGGGGGGGGGGGGGGGGGGGGG GG',
  'GGGGGGGG GGGGGGGGGGGGGGGGGGGGGGGG GG',
  'GGGGGGGG GGGGGGGGGGGGGGGGGGGGGGGG GG',
  'GGGGGGGG GGGGGGGGGGGGGGGGGGGGGGGG GG',
];

export const LEVEL2_CONFIG = {
  number: 2,
  name: 'Fox Forest',
  puzzleTypes: ['math'],
  bgColor: 0x1b5e20,
  groundColor: 0x2e7d32,
};
