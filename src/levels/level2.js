/**
 * Level 2: Fox Forest — foxes, math + dig-teach puzzles, diggable earth.
 * 36 columns × 18 rows. 4 small carrots gate the exit.
 *
 * Jump physics: ~3.2 tile max height. All gaps ≤ 3 tiles.
 *
 * Layout:
 *   Left: ground carrot + platform carrot
 *   Math puzzle → Door 1 (col 12) opens
 *   Middle: platform carrot + Dig-teach puzzle → Door 2 (col 24) opens
 *   Right: stacked platforms → upper carrot + diggable X wall → exit
 *   2 foxes patrol at ground level
 */

// prettier-ignore
export const LEVEL2_MAP = [
  '                                    ',
  '                                    ',
  '                         c          ',
  '                                    ',
  '                        PPP         ',
  '      c                             ',
  '                                    ',
  '     PPP        c           PPP     ',
  '                                    ',
  '   PPP      D  PPP      D PPP  XX   ',
  '            D           D      X    ',
  'B   c F Q   D   Q K     D  F   Xb C ',
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
  puzzleTypes: ['math', 'dig-teach'],
  bgColor: 0xff8a65,
  bgColorTop: 0xff8a65,
  bgColorBot: 0xffcc80,
  groundColor: 0x5d4037,
  starColor: 0xffe0b2,
};
