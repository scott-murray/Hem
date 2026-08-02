/**
 * Level 5: Sky Gardens — vertical platforming across floating islands.
 * 48 columns x 22 rows. 4 towers with platforms at varying heights.
 *
 * Diggable X platforms create drop-through shortcuts. Foxes patrol
 * at mid-height. The tall vertical space rewards skilled jumpers.
 *
 * Features:
 *   - 4 platform towers with 3-5 levels each
 *   - X diggable platform between towers 1-2 (drop-through shortcut)
 *   - X diggable floor at row 15 (shortcut past fox)
 *   - Doors at cols 12 and 36 (math + dig-teach puzzles)
 *   - Burrow teleporter pair (1) between towers 1 and 4
 *   - 2 foxes, 8 small carrots + 1 broccoli
 *   - Tall 22-row format for vertical challenge
 */

// prettier-ignore
export const LEVEL5_MAP = [
  '                                                ',
  '                                        c       ',
  '                                                ',
  '                             c         PPP      ',
  '                 c                              ',
  '                            PPPP        PPPP    ',
  '    c            PPP                            ',
  '                c                               ',
  '   PPPP                   PPPP        PPPP      ',
  '               PPP                              ',
  '                                                ',
  '     PPPP        PPPP        PPPP        PPPP   ',
  '            D                       D           ',
  '            D XXX                   D           ',
  '   PPPP     D  PPPP        PPPP     D  PPPP     ',
  ' B 1 c    Q       c XXX  Q   K   c  b   F 1 K  C',
  'TTTTTTTTTTTT    TTTTTTTTTTTT    TTTTTTTTTTTTTTTT',
  'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
  'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
  'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
  'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
  'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
];

export const LEVEL5_CONFIG = {
  number: 5,
  name: 'Sky Gardens',
  puzzleTypes: ['math', 'dig-teach'],
  bgColor: 0x81c784,
  bgColorTop: 0x81c784,
  bgColorBot: 0xfff176,
  groundColor: 0x558b2f,
  starColor: 0xffffff,
};
