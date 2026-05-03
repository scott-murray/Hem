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

    // Track which finger is on which side, by Phaser pointer id, so two
    // simultaneous fingers (one per side) work correctly.
    this._sideForPointer = new Map();

    this._buildHUD();

    if (this._isMobile) {
      this._buildTouchZones();
    }

    this.events.on('shutdown', this._cleanup, this);
  }

  _detectTouch() {
    return ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  }

  setLives(n) {
    this.lives = n;
    if (this._hearts && this._hearts.length > 0) {
      this._updateHearts();
    }
  }

  setLevelName(name) {
    this.levelName = name;
    if (this._levelNameText) {
      this._levelNameText.setText(name);
    }
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
    // Tint full once complete
    this._carrotText.setColor(got >= total ? '#ffd54f' : '#ffffff');
  }

  flashCarrotHint(need) {
    if (!this._carrotText) return;
    if (this._hintLabel) this._hintLabel.destroy();
    this._hintLabel = this.add.text(W / 2, 26, `Need ${need} more carrot${need === 1 ? '' : 's'}!`, {
      fontSize: '8px',
      fontFamily: 'monospace',
      color: '#ffd54f',
      stroke: '#1a1a2e',
      strokeThickness: 2,
    }).setOrigin(0.5);
    this.tweens.add({
      targets: this._hintLabel,
      alpha: 0,
      duration: 1200,
      onComplete: () => { if (this._hintLabel) { this._hintLabel.destroy(); this._hintLabel = null; } },
    });
  }

  _buildHUD() {
    // Semi-transparent top bar
    const bar = this.add.graphics();
    bar.fillStyle(0x000000, 0.4);
    bar.fillRect(0, 0, W, 18);

    // Level name
    this._levelNameText = this.add.text(W / 2, 9, '', {
      fontSize: '9px',
      fontFamily: 'monospace',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Hearts (top-left)
    for (let i = 0; i < 3; i++) {
      const heart = this.add.image(8 + i * 14, 9, 'heart_full').setOrigin(0, 0.5).setScale(1.5);
      this._hearts.push(heart);
    }

    // Small carrot counter (just right of the hearts)
    this._carrotIcon = this.add.image(56, 9, 'carrot', 0).setOrigin(0, 0.5).setScale(1.4).setVisible(false);
    this._carrotText = this.add.text(70, 9, '', {
      fontSize: '9px',
      fontFamily: 'monospace',
      color: '#ffffff',
    }).setOrigin(0, 0.5).setVisible(false);

    // Fullscreen toggle (top-right)
    this._buildFullscreenBtn();
  }

  _updateHearts() {
    this._hearts.forEach((h, i) => {
      h.setTexture(i < this.lives ? 'heart_full' : 'heart_empty');
    });
  }

  _buildFullscreenBtn() {
    const w = 30;
    const h = 14;
    const x = W - w - 4;
    const y = 2;

    const g = this.add.graphics();
    g.fillStyle(0x37474f, 0.6);
    g.fillRect(x, y, w, h);
    g.lineStyle(1, 0x78909c, 0.6);
    g.strokeRect(x, y, w, h);

    this._fsLabel = this.add.text(x + w / 2, y + h / 2, '⛶ FS', {
      fontSize: '7px',
      fontFamily: 'monospace',
      color: '#cfd8dc',
    }).setOrigin(0.5);

    const zone = this.add.zone(x, y, w, h).setOrigin(0, 0).setInteractive();
    zone.on('pointerdown', (pointer, _x, _y, event) => {
      if (event && event.stopPropagation) event.stopPropagation();
      if (this.scale.isFullscreen) this.scale.stopFullscreen();
      else this.scale.startFullscreen();
    });
  }

  _buildTouchZones() {
    // Two invisible (faintly-tinted) zones covering left and right halves of
    // the canvas. Holding a side moves that direction; every pointerdown also
    // fires a one-shot jump so kids can play one-handed.
    const leftZone = this.add.zone(0, 18, W / 2, H - 18).setOrigin(0, 0).setInteractive();
    const rightZone = this.add.zone(W / 2, 18, W / 2, H - 18).setOrigin(0, 0).setInteractive();

    // Faint edge gradient so the touch areas are discoverable without
    // dominating the playfield.
    const tint = this.add.graphics();
    tint.fillStyle(0xffffff, 0.04);
    tint.fillRect(0, 18, W / 2, H - 18);
    tint.fillStyle(0x000000, 0.04);
    tint.fillRect(W / 2, 18, W / 2, H - 18);
    tint.setDepth(-1);

    // Hint glyphs (low alpha)
    this.add.text(40, H - 20, '◀ HOLD', {
      fontSize: '7px',
      fontFamily: 'monospace',
      color: '#ffffff',
    }).setOrigin(0, 0.5).setAlpha(0.35);
    this.add.text(W - 40, H - 20, 'HOLD ▶', {
      fontSize: '7px',
      fontFamily: 'monospace',
      color: '#ffffff',
    }).setOrigin(1, 0.5).setAlpha(0.35);
    this.add.text(W / 2, H - 32, 'TAP TO JUMP', {
      fontSize: '7px',
      fontFamily: 'monospace',
      color: '#ffffff',
    }).setOrigin(0.5).setAlpha(0.3);

    const downHandler = (side) => (pointer) => {
      this._sideForPointer.set(pointer.id, side);
      if (side === 'left') inputState._touchLeft = true;
      else inputState._touchRight = true;
      // One-shot jump request — every tap-down also tries to jump
      inputState._touchJumpRequest = true;
    };

    const upHandler = (pointer) => {
      const side = this._sideForPointer.get(pointer.id);
      if (!side) return;
      this._sideForPointer.delete(pointer.id);
      // Only clear the side if no other finger is still on it
      const stillLeft = [...this._sideForPointer.values()].includes('left');
      const stillRight = [...this._sideForPointer.values()].includes('right');
      inputState._touchLeft = stillLeft;
      inputState._touchRight = stillRight;
    };

    leftZone.on('pointerdown', downHandler('left'));
    rightZone.on('pointerdown', downHandler('right'));

    // Listen to release globally so dragging off the zone still releases
    // properly. pointerup fires on the scene's input system.
    this.input.on('pointerup', upHandler);
    this.input.on('pointerupoutside', upHandler);
  }

  _cleanup() {
    inputState._touchLeft = false;
    inputState._touchRight = false;
    inputState._touchJumpRequest = false;
    this._sideForPointer.clear();
  }
}
