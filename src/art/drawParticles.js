import { PAL } from './palette.js';
import { makeTexture } from './textureFactory.js';

export function generateParticleTextures(scene) {
  // Dust particle (4x4 brownish)
  makeTexture(scene, 'particle_dust', 4, 4, (ctx) => {
    ctx.fillStyle = PAL.DUST;
    ctx.fillRect(1, 1, 2, 2);
    ctx.fillStyle = '#bcaaa4';
    ctx.fillRect(0, 1, 1, 1);
    ctx.fillRect(1, 0, 1, 1);
  });

  // Sparkle particle (4x4 yellow)
  makeTexture(scene, 'particle_sparkle', 4, 4, (ctx) => {
    ctx.fillStyle = PAL.SPARKLE;
    ctx.fillRect(1, 0, 2, 4);
    ctx.fillRect(0, 1, 4, 2);
    // Brighter center
    ctx.fillStyle = '#fff9c4';
    ctx.fillRect(1, 1, 2, 2);
  });

  // Confetti particles - 4 colors, each 4x4
  const confettiColors = [PAL.CONFETTI1, PAL.CONFETTI2, PAL.CONFETTI3, PAL.CONFETTI4];
  confettiColors.forEach((color, i) => {
    makeTexture(scene, `particle_confetti${i}`, 4, 4, (ctx) => {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 4, 4);
    });
  });

  // Heart particle (for UI)
  makeTexture(scene, 'heart_full', 8, 8, (ctx) => {
    ctx.fillStyle = PAL.HEART_FULL;
    ctx.fillRect(1, 2, 2, 1);
    ctx.fillRect(5, 2, 2, 1);
    ctx.fillRect(0, 3, 8, 2);
    ctx.fillRect(1, 5, 6, 2);
    ctx.fillRect(2, 7, 4, 1);
    ctx.fillRect(3, 8, 2, 1);
  });

  makeTexture(scene, 'heart_empty', 8, 8, (ctx) => {
    ctx.fillStyle = PAL.HEART_EMPTY;
    ctx.fillRect(1, 2, 2, 1);
    ctx.fillRect(5, 2, 2, 1);
    ctx.fillRect(0, 3, 8, 2);
    ctx.fillRect(1, 5, 6, 2);
    ctx.fillRect(2, 7, 4, 1);
    ctx.fillRect(3, 8, 2, 1);
  });
}
