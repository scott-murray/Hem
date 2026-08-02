/**
 * Unified input state for keyboard + touch.
 * Both sources write into the same inputState object that GameScene reads.
 *
 * Touch model (set by UIScene):
 *   _touchLeft / _touchRight: held while a finger is on that side of the screen
 *   _touchJump: one-shot — set true by UIScene on a tap; consumed and
 *     cleared by updateInput() so a single tap produces a single jump.
 */

export const inputState = {
  left: false,
  right: false,
  down: false,
  jump: false,
  jumpPressed: false, // single-frame press event
};

let jumpWasDown = false;
let downWasDown = false;

export function setupKeyboard(scene) {
  const keys = scene.input.keyboard.addKeys({
    left: Phaser.Input.Keyboard.KeyCodes.LEFT,
    right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
    down: Phaser.Input.Keyboard.KeyCodes.DOWN,
    jump: Phaser.Input.Keyboard.KeyCodes.SPACE,
    jumpW: Phaser.Input.Keyboard.KeyCodes.W,
    jumpUp: Phaser.Input.Keyboard.KeyCodes.UP,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    d: Phaser.Input.Keyboard.KeyCodes.D,
    s: Phaser.Input.Keyboard.KeyCodes.S,
  });

  scene._inputKeys = keys;
}

export function updateInput(scene) {
  const keys = scene._inputKeys;
  if (!keys) return;

  const kLeft = keys.left.isDown || keys.a.isDown;
  const kRight = keys.right.isDown || keys.d.isDown;
  const kDown = keys.down.isDown || keys.s.isDown;
  const kJump = keys.jump.isDown || keys.jumpW.isDown || keys.jumpUp.isDown;

  inputState.left = kLeft || inputState._touchLeft || false;
  inputState.right = kRight || inputState._touchRight || false;

  // Down (for dig ability)
  const downDown = kDown || false;
  inputState.down = downDown;

  // Held-jump (for variable-height jump cut on release)
  const jumpDown = kJump || false;
  inputState.jump = jumpDown;

  // Single-frame jump-press: keyboard edge OR consumed touch-tap signal.
  const keyboardEdge = jumpDown && !jumpWasDown;
  const touchTap = inputState._touchJump === true;
  inputState.jumpPressed = keyboardEdge || touchTap;
  inputState._touchJump = false;

  jumpWasDown = jumpDown;
}

// Touch state (set by UIScene)
inputState._touchLeft = false;
inputState._touchRight = false;
inputState._touchJump = false;
