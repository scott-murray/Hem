import * as Phaser from 'phaser';
import { inputState } from '../input/controls.js';

const W = 480;
const H = 270;
const BTN_SIZE = 56; // touch button size in display px (but scene is 480×270, so ~19px)
const BTN_SIZE_PX = 44; // actual pixels in 480×270 space

export class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    this.lives = 3;
    this.levelName = '';
    this._hearts = [];
    this._touchButtons = [];
    this._isMobile = this._detectTouch();

    this._buildHUD();

    if (this._isMobile) {
      this._buildTouchControls();
    }

    // Listen to events from GameScene
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
  }

  _updateHearts() {
    this._hearts.forEach((h, i) => {
      h.setTexture(i < this.lives ? 'heart_full' : 'heart_empty');
    });
  }

  _buildTouchControls() {
    const alpha = 0.5;
    const pad = 8;

    // Left button
    this._leftBtn = this._makeTouchBtn(
      pad, H - pad - BTN_SIZE_PX, BTN_SIZE_PX, BTN_SIZE_PX, '◀', alpha
    );
    // Right button
    this._rightBtn = this._makeTouchBtn(
      pad + BTN_SIZE_PX + 6, H - pad - BTN_SIZE_PX, BTN_SIZE_PX, BTN_SIZE_PX, '▶', alpha
    );
    // Jump button (bottom-right)
    this._jumpBtn = this._makeTouchBtn(
      W - pad - BTN_SIZE_PX, H - pad - BTN_SIZE_PX, BTN_SIZE_PX, BTN_SIZE_PX, '▲', alpha
    );

    // Wire up touch events
    this._setupBtnInput(this._leftBtn.zone, '_touchLeft');
    this._setupBtnInput(this._rightBtn.zone, '_touchRight');
    this._setupBtnInput(this._jumpBtn.zone, '_touchJump');
  }

  _makeTouchBtn(x, y, w, h, label, alpha) {
    const g = this.add.graphics();
    g.fillStyle(0x37474f, alpha);
    g.fillRect(x, y, w, h);
    g.lineStyle(2, 0x78909c, alpha);
    g.strokeRect(x, y, w, h);

    const text = this.add.text(x + w / 2, y + h / 2, label, {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#ffffff',
      alpha: alpha + 0.2,
    }).setOrigin(0.5);

    const zone = this.add.zone(x, y, w, h).setOrigin(0, 0).setInteractive();

    return { g, text, zone };
  }

  _setupBtnInput(zone, stateKey) {
    zone.on('pointerdown', () => {
      inputState[stateKey] = true;
    });
    zone.on('pointerup', () => {
      inputState[stateKey] = false;
    });
    zone.on('pointerout', () => {
      inputState[stateKey] = false;
    });
  }

  _cleanup() {
    // Reset touch state on cleanup
    inputState._touchLeft = false;
    inputState._touchRight = false;
    inputState._touchJump = false;
  }
}
