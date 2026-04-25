import { PAL } from './palette.js';
import { makeSpritesheet } from './textureFactory.js';

const EW = 16;
const EH = 16;

function drawFoxFrame0(ctx) {
  const body = PAL.FOX_BODY;
  const belly = PAL.FOX_BELLY;
  const eye = PAL.FOX_EYE;
  const tail = PAL.FOX_TAIL;

  // Tail
  ctx.fillStyle = tail;
  ctx.fillRect(0, 8, 3, 3);
  ctx.fillStyle = body;
  ctx.fillRect(0, 6, 4, 5);

  // Body
  ctx.fillStyle = body;
  ctx.fillRect(2, 8, 10, 6);
  ctx.fillStyle = belly;
  ctx.fillRect(4, 9, 6, 5);

  // Head
  ctx.fillStyle = body;
  ctx.fillRect(8, 4, 8, 8);
  // Snout
  ctx.fillStyle = belly;
  ctx.fillRect(12, 7, 4, 3);
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(15, 8, 1, 1); // nose

  // Eye
  ctx.fillStyle = eye;
  ctx.fillRect(10, 5, 2, 2);
  ctx.fillStyle = body;
  ctx.fillRect(10, 5, 1, 1);

  // Ear
  ctx.fillStyle = body;
  ctx.fillRect(8, 2, 3, 3);
  ctx.fillStyle = '#ff8fa3';
  ctx.fillRect(9, 2, 1, 2);

  // Legs (walk pos 0)
  ctx.fillStyle = body;
  ctx.fillRect(3, 13, 3, 3);
  ctx.fillRect(9, 13, 3, 3);
}

function drawFoxFrame1(ctx) {
  const body = PAL.FOX_BODY;
  const belly = PAL.FOX_BELLY;
  const eye = PAL.FOX_EYE;
  const tail = PAL.FOX_TAIL;

  // Tail (slightly different)
  ctx.fillStyle = tail;
  ctx.fillRect(0, 7, 3, 3);
  ctx.fillStyle = body;
  ctx.fillRect(0, 6, 4, 4);

  // Body
  ctx.fillStyle = body;
  ctx.fillRect(2, 8, 10, 6);
  ctx.fillStyle = belly;
  ctx.fillRect(4, 9, 6, 5);

  // Head
  ctx.fillStyle = body;
  ctx.fillRect(8, 4, 8, 8);
  ctx.fillStyle = belly;
  ctx.fillRect(12, 7, 4, 3);
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(15, 8, 1, 1);

  ctx.fillStyle = eye;
  ctx.fillRect(10, 5, 2, 2);
  ctx.fillStyle = body;
  ctx.fillRect(10, 5, 1, 1);

  ctx.fillStyle = body;
  ctx.fillRect(8, 2, 3, 3);
  ctx.fillStyle = '#ff8fa3';
  ctx.fillRect(9, 2, 1, 2);

  // Legs (walk pos 1 - alternating)
  ctx.fillStyle = body;
  ctx.fillRect(4, 13, 3, 3);
  ctx.fillRect(8, 13, 3, 3);
}

function drawBeetleFrame0(ctx) {
  // Beetle: round blue shell with legs
  ctx.fillStyle = PAL.BEETLE_SHELL;
  // Shell (oval-ish)
  ctx.fillRect(2, 3, 12, 10);
  ctx.fillRect(1, 5, 14, 6);
  ctx.fillRect(3, 2, 10, 1);
  ctx.fillRect(3, 13, 10, 1);

  // Shell detail line
  ctx.fillStyle = PAL.BEETLE_LEGS;
  ctx.fillRect(7, 2, 2, 12);

  // Eyes
  ctx.fillStyle = PAL.BEETLE_EYE;
  ctx.fillRect(3, 4, 2, 2);
  ctx.fillRect(11, 4, 2, 2);
  ctx.fillStyle = '#000';
  ctx.fillRect(4, 5, 1, 1);
  ctx.fillRect(12, 5, 1, 1);

  // Antennae
  ctx.fillStyle = PAL.BEETLE_LEGS;
  ctx.fillRect(4, 1, 1, 2);
  ctx.fillRect(3, 0, 1, 1);
  ctx.fillRect(11, 1, 1, 2);
  ctx.fillRect(12, 0, 1, 1);

  // Legs
  ctx.fillStyle = PAL.BEETLE_LEGS;
  ctx.fillRect(0, 7, 2, 1);
  ctx.fillRect(0, 9, 2, 1);
  ctx.fillRect(14, 7, 2, 1);
  ctx.fillRect(14, 9, 2, 1);
}

function drawBeetleFrame1(ctx) {
  ctx.fillStyle = PAL.BEETLE_SHELL;
  ctx.fillRect(2, 3, 12, 10);
  ctx.fillRect(1, 5, 14, 6);
  ctx.fillRect(3, 2, 10, 1);
  ctx.fillRect(3, 13, 10, 1);

  ctx.fillStyle = PAL.BEETLE_LEGS;
  ctx.fillRect(7, 2, 2, 12);

  ctx.fillStyle = PAL.BEETLE_EYE;
  ctx.fillRect(3, 4, 2, 2);
  ctx.fillRect(11, 4, 2, 2);
  ctx.fillStyle = '#000';
  ctx.fillRect(4, 5, 1, 1);
  ctx.fillRect(12, 5, 1, 1);

  ctx.fillStyle = PAL.BEETLE_LEGS;
  ctx.fillRect(4, 1, 1, 2);
  ctx.fillRect(3, 0, 1, 1);
  ctx.fillRect(11, 1, 1, 2);
  ctx.fillRect(12, 0, 1, 1);

  // Legs in different position
  ctx.fillStyle = PAL.BEETLE_LEGS;
  ctx.fillRect(0, 6, 2, 1);
  ctx.fillRect(0, 10, 2, 1);
  ctx.fillRect(14, 6, 2, 1);
  ctx.fillRect(14, 10, 2, 1);
}

export function generateEnemyTextures(scene) {
  makeSpritesheet(scene, 'enemy_fox', EW, EH, [drawFoxFrame0, drawFoxFrame1]);
  makeSpritesheet(scene, 'enemy_beetle', EW, EH, [drawBeetleFrame0, drawBeetleFrame1]);
}
