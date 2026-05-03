/**
 * Level 3: Crystal Caves — both puzzle types, two enemies, and 5 small
 * carrots for the treasure-hunt feel. 42 columns × 18 rows.
 *
 * Carrots are scattered across the platform sequences so the player has to
 * climb both sides of the level rather than just running along the ground.
 */

// prettier-ignore
export const LEVEL3_MAP = [
  '                                          ',
  '            c          PPP   c            ',
  '             PPP       PPP                ',
  '   PPP             c         PPP          ',
  '                  PPP             c       ',
  '         PPP                     PPP      ',
  '                                          ',
  '            D                D            ',
  '   c        D                D            ',
  '  PPP       D                D            ',
  'B   F    Q  D   K   E     Q  D   K  F    C',
  'TTTTTTTTTTTTTT TTTTTTTTTTTTTTTT TTTTTTTTTT',
  'GGGGGGGGGGGGGG GGGGGGGGGGGGGGGG GGGGGGGGGG',
  'GGGGGGGGGGGGGG GGGGGGGGGGGGGGGG GGGGGGGGGG',
  'GGGGGGGGGGGGGG GGGGGGGGGGGGGGGG GGGGGGGGGG',
  'GGGGGGGGGGGGGG GGGGGGGGGGGGGGGG GGGGGGGGGG',
  'GGGGGGGGGGGGGG GGGGGGGGGGGGGGGG GGGGGGGGGG',
  'GGGGGGGGGGGGGG GGGGGGGGGGGGGGGG GGGGGGGGGG',
];

export const LEVEL3_CONFIG = {
  number: 3,
  name: 'Crystal Caves',
  puzzleTypes: ['spelling', 'math'],
  bgColor: 0x0d1b2a,
  groundColor: 0x546e7a,
};
