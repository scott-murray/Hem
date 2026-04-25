import { PAL } from './palette.js';
import { makeSpritesheet } from './textureFactory.js';

const FW = 16;
const FH = 16;

function hex(h) {
  const r = parseInt(h.slice(1, 3), 16);
  const g = parseInt(h.slice(3, 5), 16);
  const b = parseInt(h.slice(5, 7), 16);
  return `rgb(${r},${g},${b})`;
}

// Draw a single pixel
function px(ctx, x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 1, 1);
}

// Base bunny body at given position
function drawBunnyBase(ctx, flip = false) {
  if (flip) {
    ctx.save();
    ctx.translate(FW, 0);
    ctx.scale(-1, 1);
  }

  // Body pixels (16x16 grid)
  const body = PAL.BUNNY_BODY;
  const belly = PAL.BUNNY_BELLY;
  const earIn = PAL.BUNNY_EAR_IN;
  const eye = PAL.BUNNY_EYE;
  const pupil = PAL.BUNNY_PUPIL;
  const nose = PAL.BUNNY_NOSE;
  const tail = PAL.BUNNY_TAIL;

  // Ears (top)
  ctx.fillStyle = body;
  ctx.fillRect(3, 0, 2, 6);
  ctx.fillRect(9, 0, 2, 6);

  ctx.fillStyle = earIn;
  ctx.fillRect(4, 1, 1, 4);
  ctx.fillRect(10, 1, 1, 4);

  // Head
  ctx.fillStyle = body;
  ctx.fillRect(2, 5, 12, 7);

  // Face
  ctx.fillStyle = eye;
  ctx.fillRect(5, 7, 2, 2);
  ctx.fillRect(10, 7, 2, 2);

  ctx.fillStyle = pupil;
  ctx.fillRect(6, 8, 1, 1);
  ctx.fillRect(11, 8, 1, 1);

  ctx.fillStyle = nose;
  ctx.fillRect(7, 10, 2, 1);

  // Body
  ctx.fillStyle = body;
  ctx.fillRect(3, 11, 10, 4);

  ctx.fillStyle = belly;
  ctx.fillRect(5, 12, 6, 3);

  // Feet
  ctx.fillStyle = body;
  ctx.fillRect(3, 14, 4, 2);
  ctx.fillRect(9, 14, 4, 2);

  // Tail
  ctx.fillStyle = tail;
  ctx.fillRect(12, 11, 3, 3);

  if (flip) ctx.restore();
}

function drawIdleFrame0(ctx) {
  drawBunnyBase(ctx);
}

function drawIdleFrame1(ctx) {
  // Slightly different ear position
  drawBunnyBase(ctx);
  // twitch left ear slightly
  ctx.fillStyle = PAL.BUNNY_EAR_IN;
  ctx.fillRect(4, 2, 1, 3);
}

function drawRunFrame0(ctx) {
  const body = PAL.BUNNY_BODY;
  const belly = PAL.BUNNY_BELLY;
  const earIn = PAL.BUNNY_EAR_IN;
  const eye = PAL.BUNNY_EYE;
  const pupil = PAL.BUNNY_PUPIL;
  const nose = PAL.BUNNY_NOSE;
  const tail = PAL.BUNNY_TAIL;

  // Leaning forward run
  // Ears (swept back)
  ctx.fillStyle = body;
  ctx.fillRect(4, 1, 2, 5);
  ctx.fillRect(10, 0, 2, 5);
  ctx.fillStyle = earIn;
  ctx.fillRect(5, 1, 1, 3);
  ctx.fillRect(11, 0, 1, 3);

  // Head (lean forward)
  ctx.fillStyle = body;
  ctx.fillRect(3, 5, 12, 6);

  ctx.fillStyle = eye;
  ctx.fillRect(6, 7, 2, 2);
  ctx.fillRect(11, 7, 2, 2);
  ctx.fillStyle = pupil;
  ctx.fillRect(7, 8, 1, 1);
  ctx.fillRect(12, 8, 1, 1);
  ctx.fillStyle = nose;
  ctx.fillRect(8, 10, 2, 1);

  // Body
  ctx.fillStyle = body;
  ctx.fillRect(2, 11, 10, 4);
  ctx.fillStyle = belly;
  ctx.fillRect(4, 12, 6, 3);

  // Front leg extended
  ctx.fillStyle = body;
  ctx.fillRect(8, 14, 4, 2);
  // Back leg tucked
  ctx.fillRect(2, 13, 3, 2);

  ctx.fillStyle = tail;
  ctx.fillRect(0, 11, 2, 2);
}

function drawRunFrame1(ctx) {
  const body = PAL.BUNNY_BODY;
  const belly = PAL.BUNNY_BELLY;
  const earIn = PAL.BUNNY_EAR_IN;
  const eye = PAL.BUNNY_EYE;
  const pupil = PAL.BUNNY_PUPIL;
  const nose = PAL.BUNNY_NOSE;
  const tail = PAL.BUNNY_TAIL;

  ctx.fillStyle = body;
  ctx.fillRect(3, 0, 2, 5);
  ctx.fillRect(9, 1, 2, 5);
  ctx.fillStyle = earIn;
  ctx.fillRect(4, 0, 1, 3);
  ctx.fillRect(10, 1, 1, 3);

  ctx.fillStyle = body;
  ctx.fillRect(2, 5, 12, 7);
  ctx.fillStyle = eye;
  ctx.fillRect(5, 7, 2, 2);
  ctx.fillRect(10, 7, 2, 2);
  ctx.fillStyle = pupil;
  ctx.fillRect(6, 8, 1, 1);
  ctx.fillRect(11, 8, 1, 1);
  ctx.fillStyle = nose;
  ctx.fillRect(7, 10, 2, 1);

  ctx.fillStyle = body;
  ctx.fillRect(3, 11, 10, 4);
  ctx.fillStyle = belly;
  ctx.fillRect(5, 12, 6, 3);

  ctx.fillStyle = body;
  ctx.fillRect(3, 14, 3, 2);
  ctx.fillRect(10, 14, 3, 2);

  ctx.fillStyle = tail;
  ctx.fillRect(12, 11, 3, 2);
}

function drawRunFrame2(ctx) {
  drawRunFrame0(ctx); // Reuse frame 0 with minor variant
  // Slightly different feet
  ctx.fillStyle = PAL.BUNNY_BODY;
  ctx.fillRect(7, 14, 4, 2);
  ctx.fillRect(3, 14, 3, 2);
}

function drawRunFrame3(ctx) {
  drawRunFrame1(ctx); // Reuse frame 1 with minor variant
  ctx.fillStyle = PAL.BUNNY_BODY;
  ctx.fillRect(4, 14, 3, 2);
  ctx.fillRect(9, 14, 4, 2);
}

function drawJumpFrame(ctx) {
  const body = PAL.BUNNY_BODY;
  const belly = PAL.BUNNY_BELLY;
  const earIn = PAL.BUNNY_EAR_IN;
  const eye = PAL.BUNNY_EYE;
  const pupil = PAL.BUNNY_PUPIL;
  const nose = PAL.BUNNY_NOSE;
  const tail = PAL.BUNNY_TAIL;

  // Ears up and back
  ctx.fillStyle = body;
  ctx.fillRect(2, 0, 2, 7);
  ctx.fillRect(9, 0, 2, 5);
  ctx.fillStyle = earIn;
  ctx.fillRect(3, 0, 1, 5);
  ctx.fillRect(10, 0, 1, 3);

  // Head
  ctx.fillStyle = body;
  ctx.fillRect(2, 6, 12, 6);
  ctx.fillStyle = eye;
  ctx.fillRect(5, 8, 2, 2);
  ctx.fillRect(10, 8, 2, 2);
  ctx.fillStyle = pupil;
  ctx.fillRect(6, 9, 1, 1);
  ctx.fillRect(11, 9, 1, 1);
  ctx.fillStyle = nose;
  ctx.fillRect(7, 11, 2, 1);

  // Body tucked
  ctx.fillStyle = body;
  ctx.fillRect(3, 11, 9, 4);
  ctx.fillStyle = belly;
  ctx.fillRect(5, 12, 5, 3);

  // Legs tucked up
  ctx.fillStyle = body;
  ctx.fillRect(2, 13, 3, 2);
  ctx.fillRect(11, 13, 3, 2);

  ctx.fillStyle = tail;
  ctx.fillRect(12, 11, 2, 2);
}

function drawHurtFrame(ctx) {
  const body = PAL.BUNNY_BODY;

  // Same as idle but with X eyes
  drawBunnyBase(ctx);

  // Override eyes with X
  ctx.fillStyle = '#ff0000';
  ctx.fillRect(5, 7, 1, 1);
  ctx.fillRect(6, 8, 1, 1);
  ctx.fillRect(5, 9, 1, 1);
  ctx.fillRect(7, 7, 1, 1);
  ctx.fillRect(6, 8, 1, 1);
  ctx.fillRect(7, 9, 1, 1);

  ctx.fillRect(10, 7, 1, 1);
  ctx.fillRect(11, 8, 1, 1);
  ctx.fillRect(10, 9, 1, 1);
  ctx.fillRect(12, 7, 1, 1);
  ctx.fillRect(11, 8, 1, 1);
  ctx.fillRect(12, 9, 1, 1);
}

export function generateBunnyTextures(scene) {
  // Idle: 2 frames
  makeSpritesheet(scene, 'bunny_idle', FW, FH, [drawIdleFrame0, drawIdleFrame1]);
  // Run: 4 frames
  makeSpritesheet(scene, 'bunny_run', FW, FH, [drawRunFrame0, drawRunFrame1, drawRunFrame2, drawRunFrame3]);
  // Jump: 1 frame
  makeSpritesheet(scene, 'bunny_jump', FW, FH, [drawJumpFrame]);
  // Hurt: 1 frame
  makeSpritesheet(scene, 'bunny_hurt', FW, FH, [drawHurtFrame]);
}
