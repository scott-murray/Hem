/**
 * Level 4: Burrow Depths — cave network with diggable walls.
 * 42 columns x 18 rows. 4 chambers separated by X walls.
 *
 * The player digs through X walls to connect chambers and progress.
 * Doors provide an alternative to digging (puzzle-gated).
 *
 * Features:
 *   - 4 cave chambers, each with platforms and carrots
 *   - X walls between chambers (dig to connect)
 *   - Doors at cols 11 and 25 (puzzle-gated alternative)
 *   - Burrow teleporter pair (1) between chambers 1 and 3
 *   - 2 beetles patrolling chamber 2
 *   - 6 small carrots + 1 broccoli
 *   - Spelling + math puzzles
 */

// prettier-ignore
export const LEVEL4_MAP = [
  '                                          ',
  '                                          ',
  '                                          ',
  '                                          ',
  '                                          ',
  '           XXXX        XXXX   XXXX        ',
  '    c      DXXX        XXDX   XXXX        ',
  '       PPP DXXX        XXDX   XXXX        ',
  '           XXXX        XXXX   XXXX        ',
  '   PPP          PcP        PPP     PPP    ',
  '                                          ',
  'B1 c   Q        c  EE   Q  1c  K  b  c  C ',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
  'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
  'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
  'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
  'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
];

export const LEVEL4_CONFIG = {
  number: 4,
  name: 'Burrow Depths',
  puzzleTypes: ['spelling', 'math'],
  bgColor: 0x1a237e,
  bgColorTop: 0x1a237e,
  bgColorBot: 0x004d40,
  groundColor: 0x3e2723,
  starColor: 0x80cbc4,
};
