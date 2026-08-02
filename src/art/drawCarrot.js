import { PAL } from './palette.js';
import { makeSpritesheet } from './textureFactory.js';

const CW = 16;
const CH = 16;

function drawCarrotFrame(ctx, rotation) {
  ctx.save();
  ctx.translate(8, 8);
  ctx.rotate(rotation);
  ctx.translate(-8, -8);

  // Carrot body (triangle-ish)
  ctx.fillStyle = PAL.CARROT_BODY;
  ctx.fillRect(5, 4, 6, 8);
  ctx.fillRect(6, 2, 4, 2);
  ctx.fillRect(4, 6, 8, 4);
  ctx.fillRect(5, 10, 6, 2);
  ctx.fillRect(6, 12, 4, 2);

  // Tip
  ctx.fillStyle = PAL.CARROT_TIP;
  ctx.fillRect(7, 13, 2, 2);
  ctx.fillRect(7, 11, 2, 1);

  // Highlight
  ctx.fillStyle = '#ff8a65';
  ctx.fillRect(6, 4, 2, 6);

  // Leaves
  ctx.fillStyle = PAL.CARROT_TOP;
  ctx.fillRect(5, 0, 3, 4);
  ctx.fillRect(8, 1, 3, 3);
  ctx.fillStyle = PAL.CARROT_LEAF;
  ctx.fillRect(4, 0, 2, 2);
  ctx.fillRect(10, 0, 2, 2);
  ctx.fillRect(7, 0, 2, 1);

  ctx.restore();
}

export function generateCarrotTextures(scene) {
  const angles = [0, Math.PI / 8, Math.PI / 4, Math.PI * 3 / 8];
  const fns = angles.map(a => (ctx) => drawCarrotFrame(ctx, a));
  makeSpritesheet(scene, 'carrot', CW, CH, fns);
}

const BW = 16;
const BH = 16;

function drawBroccoliFrame(ctx) {
  // Stalk
  ctx.fillStyle = '#6d8c3f';
  ctx.fillRect(7, 10, 2, 6);
  // Florets (dark green blobs)
  ctx.fillStyle = '#2e7d32';
  ctx.fillRect(3, 2, 10, 8);
  ctx.fillRect(1, 4, 14, 4);
  ctx.fillRect(4, 0, 8, 3);
  // Lighter highlights
  ctx.fillStyle = '#4caf50';
  ctx.fillRect(5, 2, 3, 3);
  ctx.fillRect(10, 3, 2, 2);
  ctx.fillRect(6, 0, 2, 1);
  ctx.fillRect(9, 6, 2, 1);
  // Texture dots
  ctx.fillStyle = '#1b5e20';
  ctx.fillRect(4, 3, 1, 1);
  ctx.fillRect(11, 5, 1, 1);
  ctx.fillRect(7, 7, 1, 1);
}

export function generateBroccoliTexture(scene) {
  makeSpritesheet(scene, 'broccoli', BW, BH, [drawBroccoliFrame]);
}
