/**
 * Tile ID constants and parse helpers.
 *
 * Level maps are 2D arrays of single-char tile ids.
 * Each tile is 16×16 source pixels, rendered at 3× scale (48×48 display px).
 */

export const TILE = {
  EMPTY:        ' ',
  GROUND:       'G',   // solid ground (no grass)
  GRASS:        'T',   // grass-top (solid)
  PLATFORM:     'P',   // one-way platform (pass through from below)
  SPIKE:        'S',   // deadly
  CARROT:       'C',   // big exit carrot (only collectible once all small carrots are gathered)
  SMALL_CARROT: 'c',   // collectible small carrot — gates the exit
  CHECKPOINT:   'K',   // checkpoint flag
  DOOR:         'D',   // locked door (solid until paired puzzle is solved)
  PUZZLE:       'Q',   // puzzle trigger (walkable)
  BUNNY:        'B',   // bunny spawn point
  ENEMY_FOX:    'F',   // enemy spawn (fox)
  ENEMY_BUG:    'E',   // enemy spawn (beetle)
  DIGGABLE:     'X',   // soft earth — diggable once dig ability unlocked
  BROCCOLI:     'b',   // bonus collectible — does NOT gate exit (separate from carrots)
  // Burrow tiles 1..4: same digit pairs into one teleport pair.
};

export const TILE_SCALE = 3;        // source px → display px
export const TILE_SRC_SIZE = 16;    // source pixel size
export const TILE_SIZE = TILE_SRC_SIZE * TILE_SCALE; // 48 display px

// Tiles that block passage (solid)
export const SOLID_TILES = new Set([TILE.GROUND, TILE.GRASS, TILE.DOOR, TILE.DIGGABLE]);

// Tiles that are deadly on contact
export const DEADLY_TILES = new Set([TILE.SPIKE]);

// Tiles that have special logic but aren't blocking
export const TRIGGER_TILES = new Set([TILE.PUZZLE, TILE.CARROT, TILE.SMALL_CARROT, TILE.CHECKPOINT]);

const BURROW_DIGITS = new Set(['1', '2', '3', '4']);

/**
 * Parse a level map into structured data.
 * Returns:
 * {
 *   tiles: 2D array (row, col) => char,
 *   widthTiles, heightTiles,
 *   pixelWidth, pixelHeight,
 *   bunnySpawn: {x, y} in display pixels (center of tile),
 *   specials: [{type, row, col, x, y, ...}]
 * }
 */
export function parseLevel(map) {
  const rows = map;
  const heightTiles = rows.length;
  const widthTiles = rows[0].length;

  const tiles = rows.map(row => row.split(''));

  const specials = [];
  let bunnySpawn = { x: TILE_SIZE * 1.5, y: TILE_SIZE * 1.5 };

  // Door groups: vertically-adjacent D tiles share a single group id.
  const doorGroupGrid = tiles.map(row => row.map(() => undefined));
  const doorGroups = []; // groupId -> [{row, col, x, y}, ...] (top-to-bottom)
  let nextDoorGroupId = 0;

  // Burrow pairs: tiles with the same digit pair into one teleport group.
  const burrowsByDigit = new Map(); // digit -> [{x, y, row, col}, ...]

  const puzzles = [];

  tiles.forEach((row, r) => {
    row.forEach((ch, c) => {
      const x = c * TILE_SIZE + TILE_SIZE / 2;
      const y = r * TILE_SIZE + TILE_SIZE / 2;

      if (ch === TILE.BUNNY) {
        bunnySpawn = { x, y };
      } else if (ch === TILE.CARROT) {
        specials.push({ type: 'carrot', row: r, col: c, x, y });
      } else if (ch === TILE.SMALL_CARROT) {
        specials.push({ type: 'small_carrot', row: r, col: c, x, y });
      } else if (ch === TILE.CHECKPOINT) {
        specials.push({ type: 'checkpoint', row: r, col: c, x, y });
      } else if (ch === TILE.SPIKE) {
        specials.push({ type: 'spike', row: r, col: c, x, y });
      } else if (ch === TILE.PUZZLE) {
        puzzles.push({ type: 'puzzle', row: r, col: c, x, y });
      } else if (ch === TILE.DOOR) {
        const aboveId = r > 0 ? doorGroupGrid[r - 1][c] : undefined;
        const gid = aboveId !== undefined ? aboveId : nextDoorGroupId++;
        doorGroupGrid[r][c] = gid;
        if (!doorGroups[gid]) doorGroups[gid] = [];
        doorGroups[gid].push({ row: r, col: c, x, y });
      } else if (ch === TILE.ENEMY_FOX) {
        specials.push({ type: 'enemy_fox', row: r, col: c, x, y });
      } else if (ch === TILE.BROCCOLI) {
        specials.push({ type: 'broccoli', row: r, col: c, x, y });
      } else if (ch === TILE.ENEMY_BUG) {
        specials.push({ type: 'enemy_beetle', row: r, col: c, x, y });
      } else if (BURROW_DIGITS.has(ch)) {
        if (!burrowsByDigit.has(ch)) burrowsByDigit.set(ch, []);
        burrowsByDigit.get(ch).push({ row: r, col: c, x, y });
      }
    });
  });

  // Pair puzzles with door groups by index.
  puzzles.forEach((p, i) => {
    p.id = i;
    specials.push(p);
  });
  doorGroups.forEach((tilesInGroup, gid) => {
    tilesInGroup.forEach(t => {
      specials.push({ type: 'door', row: t.row, col: t.col, x: t.x, y: t.y, id: gid });
    });
  });

  // Burrows: each digit becomes a pair (or a no-op singleton). Each tile gets
  // a `pairTarget` that points at its partner's coords.
  burrowsByDigit.forEach((arr, digit) => {
    if (arr.length < 2) {
      // Lone burrow — render but no teleport (target points at itself)
      arr.forEach(t => specials.push({
        type: 'burrow', row: t.row, col: t.col, x: t.x, y: t.y,
        pairId: digit, target: { x: t.x, y: t.y },
      }));
      return;
    }
    // For 2+, link in a ring (a → b → a, or a→b→c→a). Two-tile case is the
    // common one.
    arr.forEach((t, i) => {
      const next = arr[(i + 1) % arr.length];
      specials.push({
        type: 'burrow',
        row: t.row, col: t.col, x: t.x, y: t.y,
        pairId: digit,
        target: { x: next.x, y: next.y },
      });
    });
  });

  return {
    tiles,
    widthTiles,
    heightTiles,
    pixelWidth: widthTiles * TILE_SIZE,
    pixelHeight: heightTiles * TILE_SIZE,
    bunnySpawn,
    specials,
  };
}
