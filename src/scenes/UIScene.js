import * as Phaser from 'phaser';
import { inputState } from '../input/controls.js';

const W = 480;
const H = 270;

export class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    this.lives = 3;
    this.levelName = '';
    this._hearts = [];
    this._isMobile = this._detectTouch();
    this._carrotCount = 0;
    this._carrotTotal = 0;
    this._hasDigAbility = false;
    this._walkSideForPointer = new Map();

    this._buildHUD();
    this._buildTouchZones();

    this.events.on('shutdown', this._cleanup, this);
  }

  _detectTouch() {
    return ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  }

  setLives(n) {
    this.lives = n;
    if (this._hearts && this._hearts.length > 0) this._updateHearts();
  }

  setLevelName(name) {
    this.levelName = name;
    if (this._levelNameText) this._levelNameText.setText(name);
  }

  setBroccoliCount(got) {
    this._broccoliCount = got;
    if (!this._broccoliText) return;
    if (got === 0) {
      this._broccoliText.setVisible(false);
      this._broccoliIcon.setVisible(false);
      return;
    }
    this._broccoliText.setVisible(true);
    this._broccoliIcon.setVisible(true);
    this._broccoliText.setText(`${got}`);
    this._broccoliText.setColor('#ffd54f');
  }

  setCarrotCount(got, total) {
    this._carrotCount = got;
    this._carrotTotal = total;
    if (!this._carrotText) return;
    if (total === 0) {
      this._carrotText.setVisible(false);
      this._carrotIcon.setVisible(false);
      return;
    }
    this._carrotText.setVisible(true);
    this._carrotIcon.setVisible(true);
    this._carrotText.setText(`${got}/${total}`);
    this._carrotText.setColor(got >= total ? '#ffd54f' : '#ffffff');
  }

  flashCarrotHint(need) {
    if (!this._carrotText) return;
    if (this._hintLabel) this._hintLabel.destroy();
    this._hintLabel = this.add.text(W / 2, 26, `Need ${need} more carrot${need === 1 ? '' : 's'}!`, {
      fontSize: '8px', fontFamily: 'monospace', color: '#ffd54f',
      stroke: '#1a1a2e', strokeThickness: 2,
    }).setOrigin(0.5);
    this.tweens.add({
      targets: this._hintLabel, alpha: 0, duration: 1200,
      onComplete: () => { if (this._hintLabel) { this._hintLabel.destroy(); this._hintLabel = null; } },
    });
  }

  showDigButton() {
    if (this._hasDigAbility || !this._isMobile) return;
    this._hasDigAbility = true;
    this._buildDigButton();
  }

  _buildHUD() {
    const bar = this.add.graphics();
    bar.fillStyle(0x000000, 0.4);
    bar.fillRect(0, 0, W, 18);

    this._levelNameText = this.add.text(W / 2, 9, '', {
      fontSize: '9px', fontFamily: 'monospace', color: '#ffffff',
    }).setOrigin(0.5);

    for (let i = 0; i < 3; i++) {
      const heart = this.add.image(8 + i * 14, 9, 'heart_full').setOrigin(0, 0.5).setScale(1.5);
      this._hearts.push(heart);
    }

    this._carrotIcon = this.add.image(56, 9, 'carrot', 0).setOrigin(0, 0.5).setScale(1.4).setVisible(false);
    this._carrotText = this.add.text(70, 9, '', {
      fontSize: '9px', fontFamily: 'monospace', color: '#ffffff',
    }).setOrigin(0, 0.5).setVisible(false);

    this._broccoliIcon = this.add.image(104, 9, 'broccoli', 0).setOrigin(0, 0.5).setScale(1.4).setVisible(false);
    this._broccoliText = this.add.text(118, 9, '', {
      fontSize: '9px', fontFamily: 'monospace', color: '#ffd54f',
    }).setOrigin(0, 0.5).setVisible(false);

    this._buildFullscreenBtn();
  }

  _updateHearts() {
    this._hearts.forEach((h, i) => {
      h.setTexture(i < this.lives ? 'heart_full' : 'heart_empty');
    });
  }

  _buildFullscreenBtn() {
    const w = 30, h = 14, x = W - w - 4, y = 2;
    const g = this.add.graphics();
    g.fillStyle(0x37474f, 0.6); g.fillRect(x, y, w, h);
    g.lineStyle(1, 0x78909c, 0.6); g.strokeRect(x, y, w, h);
    this._fsLabel = this.add.text(x + w / 2, y + h / 2, '⛶ FS', {
      fontSize: '7px', fontFamily: 'monospace', color: '#cfd8dc',
    }).setOrigin(0.5);
    const zone = this.add.zone(x, y, w, h).setOrigin(0, 0).setInteractive();
    zone.on('pointerdown', (pointer, _x, _y, event) => {
      if (event && event.stopPropagation) event.stopPropagation();
      if (this.scale.isFullscreen) this.scale.stopFullscreen();
      else this.scale.startFullscreen();
    });
  }

  // --- Touch layout -------------------------------------------------------
  //
  //   Press left half  -> walk left  (stops on release)
  //   Press right half -> walk right (stops on release)
  //   Swipe up (>30px) -> jump (while continuing to walk)
  //   Swipe down       -> dig  (while continuing to walk)
  //
  // Walk starts immediately on press and stops on release.
  // Jump/dig are triggered during movement, not on release.

  _buildTouchZones() {
    const HUD_H = 18;
    const WALK_MID = W / 2;
    const SWIPE_THRESHOLD = 30;      // px of vertical movement to trigger jump/dig

    const pointerStartY = new Map();  // pointerId -> last y baseline (for swipe detection)

    // Walk zones (full height)
    const walkLeftZone  = this.add.zone(0, HUD_H, WALK_MID, H - HUD_H).setOrigin(0, 0).setInteractive();
    const walkRightZone = this.add.zone(WALK_MID, HUD_H, WALK_MID, H - HUD_H).setOrigin(0, 0).setInteractive();

    // Faint tint
    const tint = this.add.graphics();
    tint.fillStyle(0xffffff, 0.03); tint.fillRect(0, HUD_H, WALK_MID, H - HUD_H);
    tint.fillStyle(0x000000, 0.03); tint.fillRect(WALK_MID, HUD_H, WALK_MID, H - HUD_H);
    tint.setDepth(-1);

    this.add.text(60, H - 20, '< HOLD', {
      fontSize: '7px', fontFamily: 'monospace', color: '#ffffff',
    }).setOrigin(0.5).setAlpha(0.25);
    this.add.text(W - 60, H - 20, 'HOLD >', {
      fontSize: '7px', fontFamily: 'monospace', color: '#ffffff',
    }).setOrigin(0.5).setAlpha(0.25);
    this.add.text(W / 2, H - 8, 'swipe up = jump  |  swipe down = dig', {
      fontSize: '7px', fontFamily: 'monospace', color: '#ffffff',
    }).setOrigin(0.5).setAlpha(0.18);

    // --- Handlers --------------------------------------------------------

    const pointerDown = (side) => (pointer) => {
      // Start walking immediately
      if (side === 'left')  inputState._touchLeft  = true;
      if (side === 'right') inputState._touchRight = true;
      pointerStartY.set(pointer.id, pointer.y);
      this._walkSideForPointer.set(pointer.id, side);
    };

    const pointerMove = (pointer) => {
      const startY = pointerStartY.get(pointer.id);
      if (startY === undefined) return;
      const dy = startY - pointer.y;  // positive = upward
      const absDy = Math.abs(dy);

      if (absDy > SWIPE_THRESHOLD) {
        if (dy > 0) {
          // Swipe up -> jump (can re-trigger on further upward movement)
          inputState._touchJump = true;
        } else {
          // Swipe down -> dig
          const gs = this.scene.get('GameScene');
          if (gs && gs._tryDig) gs._tryDig();
        }
        // Reset baseline so further swipes trigger again
        pointerStartY.set(pointer.id, pointer.y);
      }
    };

    const pointerUp = (side) => (pointer) => {
      // Stop walking for this pointer
      this._walkSideForPointer.delete(pointer.id);
      const stillLeft  = [...this._walkSideForPointer.values()].includes('left');
      const stillRight = [...this._walkSideForPointer.values()].includes('right');
      inputState._touchLeft  = stillLeft;
      inputState._touchRight = stillRight;

      pointerStartY.delete(pointer.id);
    };

    walkLeftZone.on('pointerdown', pointerDown('left'));
    walkRightZone.on('pointerdown', pointerDown('right'));
    walkLeftZone.on('pointermove', pointerMove);
    walkRightZone.on('pointermove', pointerMove);
    walkLeftZone.on('pointerup', pointerUp('left'));
    walkRightZone.on('pointerup', pointerUp('right'));

    // Global listeners so off-zone release / move still works
    this.input.on('pointermove', pointerMove);
    this.input.on('pointerup', (pointer) => {
      const side = this._walkSideForPointer.get(pointer.id);
      if (side) pointerUp(side)(pointer);
    });
    this.input.on('pointerupoutside', (pointer) => {
      const side = this._walkSideForPointer.get(pointer.id);
      if (side) pointerUp(side)(pointer);
    });
  }

  // --- Dig button (mobile only, appears after ability unlocked) ----------

  _buildDigButton() {
    if (this._digBtn) return;
    const bw = 40, bh = 26, bx = W - 44, by = H - 70;
    const g = this.add.graphics();
    this._digBtnG = g;
    g.fillStyle(0x4e342e, 0.85); g.fillRect(bx, by, bw, bh);
    g.lineStyle(2, 0x8d6e63, 1); g.strokeRect(bx, by, bw, bh);
    this.add.text(bx + bw / 2, by + bh / 2, 'DIG', {
      fontSize: '8px', fontFamily: 'monospace', color: '#ffcc80',
    }).setOrigin(0.5);
    const zone = this.add.zone(bx, by, bw, bh).setOrigin(0, 0).setInteractive();
    zone.on('pointerdown', () => {
      const gs = this.scene.get('GameScene');
      if (gs && gs._tryDig) gs._tryDig();
    });
    this._digBtn = true;
  }

  // --- Cleanup -----------------------------------------------------------

  _cleanup() {
    inputState._touchLeft  = false;
    inputState._touchRight = false;
    inputState._touchJump  = false;
    this._walkSideForPointer.clear();
  }
}
