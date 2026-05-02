import * as Phaser from 'phaser';
import { storage } from '../progress/storage.js';
import { sfx } from '../audio/sfx.js';

const W = 480;
const H = 270;

export class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StartScene' });
  }

  create() {
    this.progress = storage.load();
    sfx.setMuted(this.progress.muted);

    this._buildBackground();
    this._buildTitle();
    this._buildBunny();
    this._buildLevelButtons();
    this._buildBottomButtons();

    // Unlock audio on first interaction
    this.input.once('pointerdown', () => sfx.unlock());
    this.input.keyboard.once('keydown', () => sfx.unlock());
  }

  _buildBackground() {
    // Gradient sky background using graphics
    const g = this.add.graphics();

    // Draw gradient sky (approximate with rectangles)
    const steps = 20;
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const r = Math.round(0x1a + (0x28 - 0x1a) * t);
      const gb = Math.round(0x23 + (0x53 - 0x23) * t);
      const color = (r << 16) | (gb << 8) | gb;
      g.fillStyle(color, 1);
      g.fillRect(0, i * (H / steps), W, H / steps + 1);
    }

    // Stars
    g.fillStyle(0xffffff, 1);
    const stars = [
      [30, 20], [80, 45], [150, 15], [200, 60], [280, 25],
      [340, 50], [400, 20], [450, 40], [120, 80], [320, 75],
    ];
    stars.forEach(([x, y]) => {
      g.fillRect(x, y, 2, 2);
    });

    // Ground strip at bottom
    g.fillStyle(0x1b5e20, 1);
    g.fillRect(0, H - 40, W, 40);
    g.fillStyle(0x4caf50, 1);
    g.fillRect(0, H - 40, W, 8);
  }

  _buildTitle() {
    // Title text with pixel-ish style
    this.add.text(W / 2, 40, "BUNNY'S", {
      fontSize: '24px',
      fontFamily: 'monospace',
      color: '#ffee58',
      stroke: '#1a1a2e',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(W / 2, 68, 'CARROT QUEST', {
      fontSize: '28px',
      fontFamily: 'monospace',
      color: '#ff7043',
      stroke: '#1a1a2e',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Decorative carrots
    const c1 = this.add.sprite(W / 2 - 120, 55, 'carrot', 0).setScale(3);
    const c2 = this.add.sprite(W / 2 + 120, 55, 'carrot', 0).setScale(3);
    c1.play('carrot_spin');
    c2.play('carrot_spin');
  }

  _buildBunny() {
    // Animated bunny hopping in place
    this.bunny = this.add.sprite(W / 2, H - 60, 'bunny_idle', 0).setScale(3);
    this.bunny.play('bunny_idle');

    // Hop tween
    this.tweens.add({
      targets: this.bunny,
      y: H - 72,
      duration: 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  _buildLevelButtons() {
    const progress = this.progress;

    this.add.text(W / 2, 110, 'SELECT LEVEL', {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#c5cae9',
    }).setOrigin(0.5);

    const levelNames = ['Carrot Valley', 'Fox Forest', 'Crystal Caves'];
    const btnY = 140;
    const btnW = 110;
    const btnH = 36;
    const gap = 10;
    const totalW = 3 * btnW + 2 * gap;
    const startX = (W - totalW) / 2;

    for (let i = 0; i < 3; i++) {
      const level = i + 1;
      const unlocked = level <= progress.unlockedLevel;
      const completed = progress.completedLevels.includes(level);
      const bx = startX + i * (btnW + gap);

      const g = this.add.graphics();

      // Button background
      g.fillStyle(unlocked ? (completed ? 0x2e7d32 : 0x1565c0) : 0x424242, 1);
      g.fillRect(bx, btnY, btnW, btnH);
      g.lineStyle(2, unlocked ? (completed ? 0x4caf50 : 0x42a5f5) : 0x616161, 1);
      g.strokeRect(bx, btnY, btnW, btnH);

      // Level number
      this.add.text(bx + btnW / 2, btnY + 10, `Level ${level}`, {
        fontSize: '11px',
        fontFamily: 'monospace',
        color: unlocked ? '#ffffff' : '#757575',
      }).setOrigin(0.5);

      // Level name
      this.add.text(bx + btnW / 2, btnY + 22, levelNames[i], {
        fontSize: '8px',
        fontFamily: 'monospace',
        color: unlocked ? '#c5cae9' : '#616161',
      }).setOrigin(0.5);

      // Lock icon or checkmark
      if (!unlocked) {
        this.add.text(bx + btnW - 12, btnY + 5, '🔒', {
          fontSize: '10px',
        });
      } else if (completed) {
        this.add.text(bx + btnW - 12, btnY + 5, '✓', {
          fontSize: '10px',
          fontFamily: 'monospace',
          color: '#a5d6a7',
        });
      }

      if (unlocked) {
        // Make interactive
        const zone = this.add.zone(bx, btnY, btnW, btnH).setOrigin(0, 0).setInteractive();
        zone.on('pointerdown', () => {
          sfx.unlock();
          this.scene.start('GameScene', { level });
        });
        zone.on('pointerover', () => {
          g.clear();
          g.fillStyle(completed ? 0x388e3c : 0x1976d2, 1);
          g.fillRect(bx, btnY, btnW, btnH);
          g.lineStyle(2, completed ? 0x66bb6a : 0x64b5f6, 1);
          g.strokeRect(bx, btnY, btnW, btnH);
        });
        zone.on('pointerout', () => {
          g.clear();
          g.fillStyle(completed ? 0x2e7d32 : 0x1565c0, 1);
          g.fillRect(bx, btnY, btnW, btnH);
          g.lineStyle(2, completed ? 0x4caf50 : 0x42a5f5, 1);
          g.strokeRect(bx, btnY, btnW, btnH);
        });
      }
    }

    // Play button (jump to highest unlocked)
    const playBtnY = 190;
    const playBtnW = 140;
    const playBtnX = (W - playBtnW) / 2;

    const playG = this.add.graphics();
    playG.fillStyle(0xf57f17, 1);
    playG.fillRect(playBtnX, playBtnY, playBtnW, 40);
    playG.lineStyle(2, 0xffd54f, 1);
    playG.strokeRect(playBtnX, playBtnY, playBtnW, 40);

    this.add.text(W / 2, playBtnY + 20, '▶  PLAY', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#ffffff',
      stroke: '#5f3000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    const playZone = this.add.zone(playBtnX, playBtnY, playBtnW, 40).setOrigin(0, 0).setInteractive();
    playZone.on('pointerdown', () => {
      sfx.unlock();
      this.scene.start('GameScene', { level: progress.unlockedLevel });
    });
  }

  _buildBottomButtons() {
    const progress = this.progress;

    // Mute button
    const muteX = 20;
    const muteY = H - 35;
    const muteW = 80;
    const muteH = 26;

    const muteG = this.add.graphics();
    const drawMuteBtn = () => {
      muteG.clear();
      muteG.fillStyle(0x37474f, 1);
      muteG.fillRect(muteX, muteY, muteW, muteH);
      muteG.lineStyle(1, 0x607d8b, 1);
      muteG.strokeRect(muteX, muteY, muteW, muteH);
    };
    drawMuteBtn();

    this.muteText = this.add.text(muteX + muteW / 2, muteY + muteH / 2,
      progress.muted ? '🔇 MUTED' : '🔊 SOUND', {
        fontSize: '8px',
        fontFamily: 'monospace',
        color: '#cfd8dc',
      }).setOrigin(0.5);

    const muteZone = this.add.zone(muteX, muteY, muteW, muteH).setOrigin(0, 0).setInteractive();
    muteZone.on('pointerdown', () => {
      sfx.unlock();
      const newMuted = !sfx.isMuted();
      sfx.setMuted(newMuted);
      storage.setMuted(newMuted);
      this.progress.muted = newMuted;
      this.muteText.setText(newMuted ? '🔇 MUTED' : '🔊 SOUND');
    });

    // Fullscreen toggle (centred between mute and reset)
    const fsX = (W - 70) / 2;
    const fsY = H - 35;
    const fsW = 70;
    const fsH = 26;

    const fsG = this.add.graphics();
    fsG.fillStyle(0x263238, 1);
    fsG.fillRect(fsX, fsY, fsW, fsH);
    fsG.lineStyle(1, 0x546e7a, 1);
    fsG.strokeRect(fsX, fsY, fsW, fsH);

    const fsLabel = this.add.text(fsX + fsW / 2, fsY + fsH / 2,
      this.scale.isFullscreen ? '⛶ EXIT FS' : '⛶ FULLSCR', {
        fontSize: '8px',
        fontFamily: 'monospace',
        color: '#cfd8dc',
      }).setOrigin(0.5);

    const fsZone = this.add.zone(fsX, fsY, fsW, fsH).setOrigin(0, 0).setInteractive();
    fsZone.on('pointerdown', () => {
      sfx.unlock();
      if (this.scale.isFullscreen) {
        this.scale.stopFullscreen();
        fsLabel.setText('⛶ FULLSCR');
      } else {
        this.scale.startFullscreen();
        fsLabel.setText('⛶ EXIT FS');
      }
    });

    // Reset button
    const resetX = W - 100;
    const resetY = H - 35;
    const resetW = 80;
    const resetH = 26;

    const resetG = this.add.graphics();
    resetG.fillStyle(0x4a0000, 1);
    resetG.fillRect(resetX, resetY, resetW, resetH);
    resetG.lineStyle(1, 0x7f0000, 1);
    resetG.strokeRect(resetX, resetY, resetW, resetH);

    this.add.text(resetX + resetW / 2, resetY + resetH / 2, '↺ RESET', {
      fontSize: '8px',
      fontFamily: 'monospace',
      color: '#ef9a9a',
    }).setOrigin(0.5);

    this.confirmReset = false;
    const resetZone = this.add.zone(resetX, resetY, resetW, resetH).setOrigin(0, 0).setInteractive();
    resetZone.on('pointerdown', () => {
      sfx.unlock();
      if (!this.confirmReset) {
        this.confirmReset = true;
        resetG.clear();
        resetG.fillStyle(0x7f0000, 1);
        resetG.fillRect(resetX, resetY, resetW, resetH);
        resetG.lineStyle(1, 0xf44336, 1);
        resetG.strokeRect(resetX, resetY, resetW, resetH);
        // Show confirm
        if (this.resetConfirmText) this.resetConfirmText.destroy();
        this.resetConfirmText = this.add.text(W / 2, H - 48, 'Tap RESET again to confirm', {
          fontSize: '8px',
          fontFamily: 'monospace',
          color: '#f44336',
        }).setOrigin(0.5);

        // Auto-cancel after 2 seconds
        this.time.delayedCall(2000, () => {
          this.confirmReset = false;
          resetG.clear();
          resetG.fillStyle(0x4a0000, 1);
          resetG.fillRect(resetX, resetY, resetW, resetH);
          resetG.lineStyle(1, 0x7f0000, 1);
          resetG.strokeRect(resetX, resetY, resetW, resetH);
          if (this.resetConfirmText) {
            this.resetConfirmText.destroy();
            this.resetConfirmText = null;
          }
        });
      } else {
        // Confirmed reset
        storage.reset();
        this.scene.restart();
      }
    });

    // Controls hint
    const hint = ('ontouchstart' in window) || navigator.maxTouchPoints > 0
      ? 'Hold left/right to move • Tap to jump'
      : 'Arrow keys / WASD to move • SPACE to jump';
    this.add.text(W / 2, H - 10, hint, {
      fontSize: '7px',
      fontFamily: 'monospace',
      color: '#546e7a',
    }).setOrigin(0.5);
  }
}
