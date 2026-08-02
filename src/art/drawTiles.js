import { PAL } from './palette.js';
import { makeTexture } from './textureFactory.js';

const TW = 16;
const TH = 16;

export function generateTileTextures(scene) {
  // Ground tile (brown dirt)
  makeTexture(scene, 'tile_ground', TW, TH, (ctx) => {
    ctx.fillStyle = PAL.GROUND;
    ctx.fillRect(0, 0, TW, TH);
    // Texture dots
    ctx.fillStyle = PAL.GROUND_SIDE;
    ctx.fillRect(2, 3, 2, 1);
    ctx.fillRect(8, 7, 2, 1);
    ctx.fillRect(5, 12, 2, 1);
    ctx.fillRect(12, 2, 1, 2);
  });

  // Grass-top tile
  makeTexture(scene, 'tile_grass', TW, TH, (ctx) => {
    // Top 4 pixels = grass
    ctx.fillStyle = PAL.GRASS_MID;
    ctx.fillRect(0, 0, TW, 4);
    ctx.fillStyle = PAL.GRASS_TOP;
    ctx.fillRect(0, 0, TW, 2);
    // Grass tufts
    ctx.fillStyle = PAL.GRASS_MID;
    ctx.fillRect(2, 0, 1, 1);
    ctx.fillRect(6, 0, 1, 1);
    ctx.fillRect(10, 0, 1, 1);
    ctx.fillRect(14, 0, 1, 1);
    // Rest is ground
    ctx.fillStyle = PAL.GROUND;
    ctx.fillRect(0, 4, TW, TH - 4);
    ctx.fillStyle = PAL.GROUND_SIDE;
    ctx.fillRect(3, 7, 2, 1);
    ctx.fillRect(10, 10, 2, 1);
  });

  // One-way platform (wooden plank)
  makeTexture(scene, 'tile_platform', TW, TH, (ctx) => {
    ctx.fillStyle = PAL.PLATFORM_TOP;
    ctx.fillRect(0, 0, TW, 4);
    ctx.fillStyle = PAL.PLATFORM;
    ctx.fillRect(0, 4, TW, TH - 4);
    // Wood grain
    ctx.fillStyle = PAL.GROUND_SIDE;
    ctx.fillRect(0, 4, 1, TH - 4);
    ctx.fillRect(8, 4, 1, TH - 4);
  });

  // Spike tile (deadly)
  makeTexture(scene, 'tile_spike', TW, TH, (ctx) => {
    ctx.fillStyle = PAL.SPIKE_BASE;
    ctx.fillRect(0, 12, TW, 4);
    // Three spikes
    ctx.fillStyle = PAL.SPIKE;
    // Spike 1
    ctx.fillRect(1, 4, 4, 8);
    ctx.fillRect(2, 2, 2, 2);
    ctx.fillRect(3, 0, 0, 2); // tip
    // Spike 2
    ctx.fillRect(6, 4, 4, 8);
    ctx.fillRect(7, 2, 2, 2);
    // Spike 3
    ctx.fillRect(11, 4, 4, 8);
    ctx.fillRect(12, 2, 2, 2);
    // Tips (single pixel)
    ctx.fillStyle = PAL.WHITE;
    ctx.fillRect(3, 1, 1, 1);
    ctx.fillRect(8, 1, 1, 1);
    ctx.fillRect(13, 1, 1, 1);
  });

  // Door tile (locked)
  makeTexture(scene, 'tile_door', TW, TH, (ctx) => {
    ctx.fillStyle = PAL.DOOR_WOOD;
    ctx.fillRect(2, 0, 12, 16);
    ctx.fillStyle = PAL.DOOR_BAND;
    ctx.fillRect(2, 5, 12, 2);
    ctx.fillRect(2, 10, 12, 2);
    // Lock
    ctx.fillStyle = PAL.DOOR_LOCK;
    ctx.fillRect(6, 7, 4, 3);
    ctx.fillRect(7, 5, 2, 3);
  });

  // Checkpoint flag (off)
  makeTexture(scene, 'tile_checkpoint_off', TW, TH * 2, (ctx) => {
    ctx.fillStyle = PAL.FLAG_POLE;
    ctx.fillRect(7, 0, 2, TH * 2);
    ctx.fillStyle = PAL.FLAG_OFF;
    ctx.fillRect(8, 2, 6, 6);
  });

  // Checkpoint flag (on)
  makeTexture(scene, 'tile_checkpoint_on', TW, TH * 2, (ctx) => {
    ctx.fillStyle = PAL.FLAG_POLE;
    ctx.fillRect(7, 0, 2, TH * 2);
    ctx.fillStyle = PAL.FLAG_ON;
    ctx.fillRect(8, 2, 6, 6);
  });

  // Puzzle trigger tile (glowing pad)
  makeTexture(scene, 'tile_puzzle', TW, TH, (ctx) => {
    ctx.fillStyle = PAL.PUZZLE_BG;
    ctx.fillRect(0, 0, TW, TH);
    ctx.fillStyle = PAL.PUZZLE_MARK;
    // Question mark
    ctx.fillRect(6, 2, 4, 2);
    ctx.fillRect(9, 4, 2, 2);
    ctx.fillRect(7, 6, 2, 2);
    ctx.fillRect(7, 10, 2, 2);
    // Glow border
    ctx.strokeStyle = '#ce93d8';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, TW - 1, TH - 1);
  });

  // Diggable soft earth (crumbly brown with crack marks)
  makeTexture(scene, 'tile_diggable', TW, TH, (ctx) => {
    ctx.fillStyle = '#6d4c41';
    ctx.fillRect(0, 0, TW, TH);
    // Lighter patches
    ctx.fillStyle = '#8d6e63';
    ctx.fillRect(2, 1, 2, 1);
    ctx.fillRect(10, 5, 3, 1);
    ctx.fillRect(5, 11, 2, 2);
    // Cracks / fissures
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(4, 0, 1, 3);
    ctx.fillRect(7, 2, 1, 2);
    ctx.fillRect(11, 6, 1, 4);
    ctx.fillRect(3, 10, 3, 1);
    ctx.fillRect(12, 13, 2, 1);
    // Tiny pebble details
    ctx.fillStyle = '#a1887f';
    ctx.fillRect(1, 7, 1, 1);
    ctx.fillRect(13, 3, 1, 1);
  });

  // Empty / transparent tile (not rendered)
  makeTexture(scene, 'tile_empty', TW, TH, (ctx) => {
    ctx.clearRect(0, 0, TW, TH);
  });

  // Burrow / rabbit hole — drawn neutral (white). Each pair gets a setTint()
  // at runtime so two paired burrows share a recognisable colour.
  makeTexture(scene, 'tile_burrow', TW, TH, (ctx) => {
    // Dirt mound base
    ctx.fillStyle = PAL.GROUND;
    ctx.fillRect(0, 8, TW, 8);
    ctx.fillStyle = PAL.GROUND_SIDE;
    ctx.fillRect(0, 7, TW, 1);
    // Coloured ring (white, will be tinted at runtime)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(3, 3, 10, 2);
    ctx.fillRect(2, 4, 1, 6);
    ctx.fillRect(13, 4, 1, 6);
    ctx.fillRect(3, 9, 10, 2);
    // Inner shadow (the hole)
    ctx.fillStyle = '#000000';
    ctx.fillRect(4, 5, 8, 5);
    // Tiny inner highlight
    ctx.fillStyle = '#222';
    ctx.fillRect(5, 5, 6, 1);
  });
}
