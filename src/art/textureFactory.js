/**
 * Helper: draw onto a new offscreen canvas, then register it as a Phaser texture.
 * @param {Phaser.Scene} scene
 * @param {string} key  - texture key
 * @param {number} w    - canvas pixel width
 * @param {number} h    - canvas pixel height
 * @param {function} drawFn  - (ctx, w, h) => void
 */
export function makeTexture(scene, key, w, h, drawFn) {
  if (scene.textures.exists(key)) return;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, w, h);
  drawFn(ctx, w, h);
  scene.textures.addCanvas(key, canvas);
}

/**
 * Create a spritesheet texture from multiple frames drawn side by side.
 * @param {Phaser.Scene} scene
 * @param {string} key
 * @param {number} frameW
 * @param {number} frameH
 * @param {Array<function>} drawFns  - one per frame, (ctx, fw, fh) => void
 */
export function makeSpritesheet(scene, key, frameW, frameH, drawFns) {
  if (scene.textures.exists(key)) return;
  const totalW = frameW * drawFns.length;
  const canvas = document.createElement('canvas');
  canvas.width = totalW;
  canvas.height = frameH;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, totalW, frameH);

  drawFns.forEach((fn, i) => {
    ctx.save();
    ctx.translate(i * frameW, 0);
    fn(ctx, frameW, frameH);
    ctx.restore();
  });

  scene.textures.addCanvas(key, canvas);
  // addCanvas already creates __BASE frame; just add individual frames
  for (let i = 0; i < drawFns.length; i++) {
    scene.textures.get(key).add(i, 0, i * frameW, 0, frameW, frameH);
  }
}
