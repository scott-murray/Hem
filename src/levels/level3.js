/**
 * Level 3: Crystal Caves — both puzzle types, two enemies,
 * and 5 small carrots spread across three platform sections.
 * 42 columns × 18 rows.
 *
 * Jump physics: ~3.2 tile max height. All gaps ≤ 3 tiles.
 *
 * Layout:
 *   Left section: platforms + 2 carrots (reachable before first door)
 *   Middle section: platform + carrot (between the two doors)
 *   Right section: platforms + carrots + exit (reachable after both doors)
 *   Puzzle 1 (spelling, col 12) → left door (col 17)
 *   Puzzle 2 (math, col 25)    → right door (col 26)
 *   X tiles: diggable shortcuts (requires dig ability from Level 2)
 *   Enemies: fox (col 2), beetle (col 22), fox (col 34)
 *   2 checkpoints
 */

// prettier-ignore
export const LEVEL3_MAP = [
  '                                          ',
  '                                          ',
  '                             c            ',
  '    c                                     ',
  '                            PPP           ',
  '   PPP                                    ',
  '       c                                  ',
  '      PPP              c      PPP         ',
  '                                          ',
  '   PPP           D    PPP D   PPP        ',
  '                 D        D               ',
  'B F c       Q    D  K E  QD    K  F X   C ',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
  'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
  'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
  'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
  'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
];

export const LEVEL3_CONFIG = {
  number: 3,
  name: 'Crystal Caves',
  puzzleTypes: ['spelling', 'math'],
  bgColor: 0x311b92,
  bgColorTop: 0x311b92,
  bgColorBot: 0x4527a0,
  groundColor: 0x37474f,
  starColor: 0xb39ddb,
};
