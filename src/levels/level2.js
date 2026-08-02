/**
 * Level 2: Fox Forest — two patrolling foxes + a math puzzle gate.
 * 36 columns × 18 rows. 3 small carrots gate the exit.
 *
 * Jump physics: ~3.2 tile max height. All gaps ≤ 3 tiles.
 *
 * Layout:
 *   Left side: ground carrot + low platform → carrot on platform
 *   Centre: puzzle Q → door at col 18
 *   Right side: stacked platforms → upper carrot + exit
 *   2 foxes patrol at ground level (cols 2 and 27)
 */

// prettier-ignore
export const LEVEL2_MAP = [
  '                                    ',
  '                                    ',
  '                      c             ',
  '                                    ',
  '                     PPP            ',
  '      c                             ',
  '                                    ',
  '     PPP                 PPP        ',
  '                                    ',
  '     PPP          D    PPP          ',
  '                  D                 ',
  'B F c         Q   D   K    F      C ',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
  'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
  'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
  'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
  'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
];

export const LEVEL2_CONFIG = {
  number: 2,
  name: 'Fox Forest',
  puzzleTypes: ['math'],
  bgColor: 0x1b5e20,
  groundColor: 0x2e7d32,
};
