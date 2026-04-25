import * as Phaser from 'phaser';
import { generateSpellingPuzzle } from '../puzzles/spelling.js';
import { generateMathPuzzle } from '../puzzles/math.js';
import { sfx } from '../audio/sfx.js';

const W = 480;
const H = 270;

const PANEL_W = 320;
const PANEL_H = 190;
const PANEL_X = (W - PANEL_W) / 2;
const PANEL_Y = (H - PANEL_H) / 2;

export class PuzzleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PuzzleScene' });
  }

  init(data) {
    this.puzzleType = data.puzzleType || 'spelling';
    this.puzzleId = data.puzzleId || 0;
    this.callerScene = data.callerScene || 'GameScene';
  }

  create() {
    // Dim overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, W, H);

    // Panel background
    const panel = this.add.graphics();
    panel.fillStyle(0x1a1a2e, 1);
    panel.fillRect(PANEL_X, PANEL_Y, PANEL_W, PANEL_H);
    panel.lineStyle(3, 0x7b1fa2, 1);
    panel.strokeRect(PANEL_X, PANEL_Y, PANEL_W, PANEL_H);

    // Corner decorations
    panel.lineStyle(2, 0xce93d8, 1);
    panel.strokeRect(PANEL_X + 4, PANEL_Y + 4, PANEL_W - 8, PANEL_H - 8);

    if (this.puzzleType === 'spelling') {
      this._buildSpellingPuzzle();
    } else {
      this._buildMathPuzzle();
    }
  }

  _buildSpellingPuzzle() {
    const puzzle = generateSpellingPuzzle();

    // Title
    this.add.text(W / 2, PANEL_Y + 20, '✏ SPELL IT!', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#ce93d8',
      stroke: '#1a1a2e',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // Word display with blank
    const displayStr = puzzle.display.join('  ');
    this.add.text(W / 2, PANEL_Y + 55, displayStr, {
      fontSize: '22px',
      fontFamily: 'monospace',
      color: '#ffffff',
      stroke: '#1a1a2e',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Instruction
    this.add.text(W / 2, PANEL_Y + 82, 'Which letter fills the blank?', {
      fontSize: '9px',
      fontFamily: 'monospace',
      color: '#b0bec5',
    }).setOrigin(0.5);

    // Letter choice buttons (2 per row)
    const btnW = 56;
    const btnH = 40;
    const gap = 12;
    const totalW = 2 * btnW + gap;
    const startX = W / 2 - totalW / 2;
    const rowY = [PANEL_Y + 100, PANEL_Y + 148];

    puzzle.choices.forEach((letter, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const bx = startX + col * (btnW + gap);
      const by = rowY[row];

      this._makeAnswerBtn(bx, by, btnW, btnH, letter, () => {
        this._handleAnswer(letter === puzzle.correct);
      });
    });
  }

  _buildMathPuzzle() {
    const puzzle = generateMathPuzzle();

    // Title
    this.add.text(W / 2, PANEL_Y + 20, '🔢 MATH MAGIC!', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#80cbc4',
      stroke: '#1a1a2e',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // Question
    this.add.text(W / 2, PANEL_Y + 55, `${puzzle.a} + ${puzzle.b} = ?`, {
      fontSize: '26px',
      fontFamily: 'monospace',
      color: '#ffffff',
      stroke: '#1a1a2e',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Instruction
    this.add.text(W / 2, PANEL_Y + 82, 'Pick the right answer!', {
      fontSize: '9px',
      fontFamily: 'monospace',
      color: '#b0bec5',
    }).setOrigin(0.5);

    // Answer buttons (2 per row)
    const btnW = 60;
    const btnH = 40;
    const gap = 12;
    const totalW = 2 * btnW + gap;
    const startX = W / 2 - totalW / 2;
    const rowY = [PANEL_Y + 100, PANEL_Y + 148];

    puzzle.choices.forEach((answer, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const bx = startX + col * (btnW + gap);
      const by = rowY[row];

      this._makeAnswerBtn(bx, by, btnW, btnH, String(answer), () => {
        this._handleAnswer(answer === puzzle.correct);
      });
    });
  }

  _makeAnswerBtn(x, y, w, h, label, onClick) {
    const g = this.add.graphics();
    g.fillStyle(0x283593, 1);
    g.fillRect(x, y, w, h);
    g.lineStyle(2, 0x42a5f5, 1);
    g.strokeRect(x, y, w, h);

    this.add.text(x + w / 2, y + h / 2, label, {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#ffffff',
    }).setOrigin(0.5);

    const zone = this.add.zone(x, y, w, h).setOrigin(0, 0).setInteractive();
    zone.on('pointerover', () => {
      g.clear();
      g.fillStyle(0x1565c0, 1);
      g.fillRect(x, y, w, h);
      g.lineStyle(2, 0x90caf9, 1);
      g.strokeRect(x, y, w, h);
    });
    zone.on('pointerout', () => {
      g.clear();
      g.fillStyle(0x283593, 1);
      g.fillRect(x, y, w, h);
      g.lineStyle(2, 0x42a5f5, 1);
      g.strokeRect(x, y, w, h);
    });
    zone.on('pointerdown', () => onClick());

    return { g, zone };
  }

  _handleAnswer(correct) {
    if (correct) {
      sfx.play('puzzleOk');
      this._showResult(true, () => {
        // Resume game scene and notify success (resume before stop to ensure data is passed)
        this.scene.resume(this.callerScene, { puzzleResult: 'success', puzzleId: this.puzzleId });
        this.scene.stop();
      });
    } else {
      sfx.play('puzzleNo');
      this._showResult(false, () => {
        this.scene.resume(this.callerScene, { puzzleResult: 'fail', puzzleId: this.puzzleId });
        this.scene.stop();
      });
    }
  }

  _showResult(correct, callback) {
    // Flash the panel
    const flash = this.add.graphics();
    flash.fillStyle(correct ? 0x00e676 : 0xff1744, 0.3);
    flash.fillRect(PANEL_X, PANEL_Y, PANEL_W, PANEL_H);

    const msg = correct ? '🎉 CORRECT!' : '✗ TRY AGAIN!';
    const color = correct ? '#69f0ae' : '#ff8a80';

    this.add.text(W / 2, H / 2, msg, {
      fontSize: '20px',
      fontFamily: 'monospace',
      color,
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.time.delayedCall(1000, callback);
  }
}
