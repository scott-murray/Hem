/**
 * Unified input state for keyboard + touch.
 * Both sources write to the same inputState object.
 */

export const inputState = {
  left: false,
  right: false,
  jump: false,
  jumpPressed: false, // single-frame press event
};

let jumpWasDown = false;

export function setupKeyboard(scene) {
  const keys = scene.input.keyboard.addKeys({
    left: Phaser.Input.Keyboard.KeyCodes.LEFT,
    right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
    jump: Phaser.Input.Keyboard.KeyCodes.SPACE,
    jumpW: Phaser.Input.Keyboard.KeyCodes.W,
    jumpUp: Phaser.Input.Keyboard.KeyCodes.UP,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    d: Phaser.Input.Keyboard.KeyCodes.D,
  });

  scene._inputKeys = keys;
}

export function updateInput(scene) {
  const keys = scene._inputKeys;
  if (!keys) return;

  const kLeft = keys.left.isDown || keys.a.isDown;
  const kRight = keys.right.isDown || keys.d.isDown;
  const kJump = keys.jump.isDown || keys.jumpW.isDown || keys.jumpUp.isDown;

  inputState.left = kLeft || inputState._touchLeft || false;
  inputState.right = kRight || inputState._touchRight || false;

  const jumpDown = kJump || inputState._touchJump || false;
  inputState.jump = jumpDown;
  inputState.jumpPressed = jumpDown && !jumpWasDown;
  jumpWasDown = jumpDown;
}

// Touch button state (set by UIScene)
inputState._touchLeft = false;
inputState._touchRight = false;
inputState._touchJump = false;
