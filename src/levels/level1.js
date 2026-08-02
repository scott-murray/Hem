/**
 * Level 1: Carrot Valley — tutorial.
 * 30 columns × 16 rows. No enemies. 3 small carrots gate the exit.
 *
 * Jump physics: ~3.2 tile max height. Tutorial gaps are 2 tiles for comfort.
 *
 * Layout (left-to-right):
 *   1. Ground-level small carrot (walk to collect beside left platform)
 *   2. Left climb: row 6 platform → row 4 → carrot at row 2
 *   3. Puzzle trigger Q → opens vertical door at col 14
 *   4. Right climb: row 6 platform → row 4 → carrot at row 2
 *   5. Exit carrot at far right
 */

// prettier-ignore
export const LEVEL1_MAP = [
  '                              ',
  '                              ',
  '     c           c            ',
  '     PPP         PPP          ',
  '              D               ',
  '   PPP        D     PPP       ',
  '              D               ',
  'B   c     Q   D       K     C ',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
  'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
  'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
  'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
  'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
  'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
  'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
];

export const LEVEL1_CONFIG = {
  number: 1,
  name: 'Carrot Valley',
  puzzleTypes: ['spelling'],
  bgColor: 0x4fc3f7,
  bgColorTop: 0x4fc3f7,
  bgColorBot: 0x81d4fa,
  groundColor: 0x6d4c41,
  starColor: 0xffffff,
};
