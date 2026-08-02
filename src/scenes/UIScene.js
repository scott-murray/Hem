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

    // Track which pointer is on which walk zone.
    this._walkSideForPointer = new Map();
    // Track whether a walk has already been activated for this pointer.
    this._walkActivated = new Set();

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

  /** Called by GameScene when the dig ability is unlocked. */
  showDigButton() {
    if (this._hasDigAbility || !this._isMobile) return;
    this._hasDigAbility = true;
    this._buildDigButton();
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

  // ── Three-zone touch layout ───────────────────────────────────────────
  //
  //   ┌──────────────────────────────────┐
  //   │                                  │
  //   │     WALK LEFT    WALK RIGHT      │  hold (>120ms) = walk
  //   │     (hold)        (hold)         │  tap  (<120ms) = jump in place
  //   │                                  │
  //   ├──────────────────────────────────┤  y = H * 0.78
  //   │           ══ JUMP ══            │  tap = jump (always)
  //   └──────────────────────────────────┘
  //
  // This decouples walk from jump so a kid can walk without accidental hops.

  _buildTouchZones() {
    const HUD_H = 18;
    const JUMP_TOP = Math.floor(H * 0.78);   // top of jump strip
    const WALK_MID = W / 2;                    // divide left/right walk zones
    const TAP_THRESHOLD = 120;                 // ms — shorter = tap, longer = walk

    // ── Walk zones (left / right) ─────────────────────────────────────

    const walkLeftZone = this.add.zone(0, HUD_H, WALK_MID, JUMP_TOP - HUD_H).setOrigin(0, 0).setInteractive();
    const walkRightZone = this.add.zone(WALK_MID, HUD_H, WALK_MID, JUMP_TOP - HUD_H).setOrigin(0, 0).setInteractive();

    // Faint tint for discoverability
    const tint = this.add.graphics();
    tint.fillStyle(0xffffff, 0.03);
    tint.fillRect(0, HUD_H, WALK_MID, JUMP_TOP - HUD_H);
    tint.fillStyle(0x000000, 0.03);
    tint.fillRect(WALK_MID, HUD_H, WALK_MID, JUMP_TOP - HUD_H);
    tint.setDepth(-1);

    // Walk-zone hint glyphs
    this.add.text(60, JUMP_TOP - 14, '◀ HOLD', {
      fontSize: '7px', fontFamily: 'monospace', color: '#ffffff',
    }).setOrigin(0.5).setAlpha(0.25);
    this.add.text(W - 60, JUMP_TOP - 14, 'HOLD ▶', {
      fontSize: '7px', fontFamily: 'monospace', color: '#ffffff',
    }).setOrigin(0.5).setAlpha(0.25);

    // ── Walk-zone handlers ────────────────────────────────────────────
    // Use delayed-call timers for tap-vs-hold detection.
    // On pointerdown, start a timer. If the timer fires (hold ≥ threshold),
    // activate walk. On pointerup before the timer fires, treat as a tap.

    const holdTimers = new Map(); // pointerId → Phaser.Time.TimerEvent

    const walkDown = (side) => (pointer) => {
      this._walkSideForPointer.set(pointer.id, side);
      this._walkActivated.delete(pointer.id);

      // Start hold timer: if it fires before pointerup, this is a walk
      const timer = this.time.delayedCall(TAP_THRESHOLD, () => {
        this._walkActivated.add(pointer.id);
        if (side === 'left') inputState._touchLeft = true;
        else if (side === 'right') inputState._touchRight = true;
      });
      holdTimers.set(pointer.id, timer);
    };

    const walkUp = (side) => (pointer) => {
      const timer = holdTimers.get(pointer.id);
      if (timer) { timer.destroy(); holdTimers.delete(pointer.id); }

      // Release walk state for this side
      this._walkSideForPointer.delete(pointer.id);
      const stillLeft = [...this._walkSideForPointer.values()].includes('left');
      const stillRight = [...this._walkSideForPointer.values()].includes('right');
      inputState._touchLeft = stillLeft;
      inputState._touchRight = stillRight;

      // If the hold timer didn't fire, this was a quick tap → jump
      if (!this._walkActivated.has(pointer.id)) {
        inputState._touchJump = true;
      }
      this._walkActivated.delete(pointer.id);
    };

    walkLeftZone.on('pointerdown', (pointer) => {
      this._walkSideForPointer.set(pointer.id, 'left');
      walkDown('left')(pointer);
    });
    walkRightZone.on('pointerdown', (pointer) => {
      this._walkSideForPointer.set(pointer.id, 'right');
      walkDown('right')(pointer);
    });

    walkLeftZone.on('pointerup', walkUp('left'));
    walkRightZone.on('pointerup', walkUp('right'));

    // Listen globally so releasing off the zone still cleans up
    this.input.on('pointerup', (pointer) => {
      const side = this._walkSideForPointer.get(pointer.id);
      if (side) walkUp(side)(pointer);
    });
    this.input.on('pointerupoutside', (pointer) => {
      const side = this._walkSideForPointer.get(pointer.id);
      if (side) walkUp(side)(pointer);
    });

    // ── Jump strip (bottom, full width) ───────────────────────────────

    const jumpZone = this.add.zone(0, JUMP_TOP, W, H - JUMP_TOP).setOrigin(0, 0).setInteractive();

    const jumpG = this.add.graphics();
    jumpG.fillStyle(0xffffff, 0.06);
    jumpG.fillRect(0, JUMP_TOP, W, H - JUMP_TOP);
    jumpG.lineStyle(1, 0xffffff, 0.1);
    jumpG.lineBetween(0, JUMP_TOP, W, JUMP_TOP);
    jumpG.setDepth(-1);

    this.add.text(W / 2, JUMP_TOP + (H - JUMP_TOP) / 2, 'TAP TO JUMP', {
      fontSize: '9px', fontFamily: 'monospace', color: '#ffffff',
    }).setOrigin(0.5).setAlpha(0.3);

    jumpZone.on('pointerdown', () => {
      inputState._touchJump = true;
    });
  }

  // ── Dig button (appears after dig ability unlocked) ──────────────────

  _buildDigButton() {
    if (this._digBtn) return;
    const bw = 40;
    const bh = 26;
    const bx = W - 44;
    const by = H - 70;

    const g = this.add.graphics();
    this._digBtnG = g;
    g.fillStyle(0x4e342e, 0.85);
    g.fillRect(bx, by, bw, bh);
    g.lineStyle(2, 0x8d6e63, 1);
    g.strokeRect(bx, by, bw, bh);

    this.add.text(bx + bw / 2, by + bh / 2, '⛏ DIG', {
      fontSize: '8px', fontFamily: 'monospace', color: '#ffcc80',
    }).setOrigin(0.5);

    const zone = this.add.zone(bx, by, bw, bh).setOrigin(0, 0).setInteractive();
    zone.on('pointerdown', () => {
      // Signal a dig action via the GameScene
      const gs = this.scene.get('GameScene');
      if (gs && gs._tryDig) gs._tryDig();
    });

    this._digBtn = true;
  }

  // ── Cleanup ─────────────────────────────────────────────────────────

  _cleanup() {
    inputState._touchLeft = false;
    inputState._touchRight = false;
    inputState._touchJump = false;
    this._walkSideForPointer.clear();
    this._walkActivated.clear();
  }
}
