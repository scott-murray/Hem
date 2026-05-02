/**
 * Shared Web Audio context. Both sfx and music attach here.
 *
 * Browsers require the context to be created (or resumed) inside a user-
 * gesture handler. Call `unlock()` from a real pointerdown / keydown to
 * fully start it (the silent-buffer trick handles strict iOS Safari).
 */

let ctx = null;
let unlocked = false;
const onUnlockCallbacks = [];

export function getCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  return ctx;
}

export function isUnlocked() {
  return unlocked;
}

export function onUnlock(cb) {
  if (unlocked) cb();
  else onUnlockCallbacks.push(cb);
}

export function unlock() {
  const ac = getCtx();
  if (unlocked) return;
  try {
    const buffer = ac.createBuffer(1, 1, 22050);
    const src = ac.createBufferSource();
    src.buffer = buffer;
    src.connect(ac.destination);
    src.start(0);
    unlocked = true;
    onUnlockCallbacks.splice(0).forEach(cb => {
      try { cb(); } catch (e) { /* ignore */ }
    });
  } catch (e) {
    // ignore — will retry on next gesture
  }
}
