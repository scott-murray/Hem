/**
 * Tile ID constants and parse helpers.
 *
 * Level maps are 2D arrays of single-char tile ids.
 * Each tile is 16×16 source pixels, rendered at 3× scale (48×48 display px).
 */

export const TILE = {
  EMPTY:      ' ',
  GROUND:     'G',   // solid ground (no grass)
  GRASS:      'T',   // grass-top (solid)
  PLATFORM:   'P',   // one-way platform (pass through from below)
  SPIKE:      'S',   // deadly
  CARROT:     'C',   // goal
  CHECKPOINT: 'K',   // checkpoint flag
  DOOR:       'D',   // locked door (solid)
  PUZZLE:     'Q',   // puzzle trigger (walkable)
  BUNNY:      'B',   // bunny spawn point
  ENEMY_FOX:  'F',   // enemy spawn (fox)
  ENEMY_BUG:  'E',   // enemy spawn (beetle)
};

export const TILE_SCALE = 3;        // source px → display px
export const TILE_SRC_SIZE = 16;    // source pixel size
export const TILE_SIZE = TILE_SRC_SIZE * TILE_SCALE; // 48 display px

// Tiles that block passage (solid)
export const SOLID_TILES = new Set([TILE.GROUND, TILE.GRASS, TILE.DOOR]);

// Tiles that are deadly on contact
export const DEADLY_TILES = new Set([TILE.SPIKE]);

// Tiles that have special logic but aren't blocking
export const TRIGGER_TILES = new Set([TILE.PUZZLE, TILE.CARROT, TILE.CHECKPOINT]);

/**
 * Parse a level map into structured data.
 * Returns:
 * {
 *   tiles: 2D array (row, col) => char,
 *   widthTiles, heightTiles,
 *   pixelWidth, pixelHeight,
 *   bunnySpawn: {x, y} in display pixels (center of tile),
 *   specials: [{type, row, col, x, y, id}]
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
  // doorGroupGrid[r][c] holds the group id assigned to that cell (or undefined).
  const doorGroupGrid = tiles.map(row => row.map(() => undefined));
  const doorGroups = []; // groupId -> [{row, col, x, y}, ...] (top-to-bottom)
  let nextDoorGroupId = 0;

  const puzzles = [];

  tiles.forEach((row, r) => {
    row.forEach((ch, c) => {
      const x = c * TILE_SIZE + TILE_SIZE / 2;
      const y = r * TILE_SIZE + TILE_SIZE / 2;

      if (ch === TILE.BUNNY) {
        bunnySpawn = { x, y };
      } else if (ch === TILE.CARROT) {
        specials.push({ type: 'carrot', row: r, col: c, x, y });
      } else if (ch === TILE.CHECKPOINT) {
        specials.push({ type: 'checkpoint', row: r, col: c, x, y });
      } else if (ch === TILE.SPIKE) {
        specials.push({ type: 'spike', row: r, col: c, x, y });
      } else if (ch === TILE.PUZZLE) {
        puzzles.push({ type: 'puzzle', row: r, col: c, x, y });
      } else if (ch === TILE.DOOR) {
        // Inherit group id from D directly above, otherwise start a new group.
        const aboveId = r > 0 ? doorGroupGrid[r - 1][c] : undefined;
        const gid = aboveId !== undefined ? aboveId : nextDoorGroupId++;
        doorGroupGrid[r][c] = gid;
        if (!doorGroups[gid]) doorGroups[gid] = [];
        doorGroups[gid].push({ row: r, col: c, x, y });
      } else if (ch === TILE.ENEMY_FOX) {
        specials.push({ type: 'enemy_fox', row: r, col: c, x, y });
      } else if (ch === TILE.ENEMY_BUG) {
        specials.push({ type: 'enemy_beetle', row: r, col: c, x, y });
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
