import * as Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { StartScene } from './scenes/StartScene.js';
import { GameScene } from './scenes/GameScene.js';
import { UIScene } from './scenes/UIScene.js';
import { PuzzleScene } from './scenes/PuzzleScene.js';

// Make Phaser available globally for scenes that use it without import
window.Phaser = Phaser;

const config = {
  type: Phaser.AUTO,
  width: 480,
  height: 270,
  backgroundColor: '#0d0d0d',
  parent: 'game',
  pixelArt: true,
  antialias: false,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 480,
    height: 270,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },  // per-body gravity set individually
      debug: false,
    },
  },
  scene: [BootScene, StartScene, GameScene, UIScene, PuzzleScene],
};

const game = new Phaser.Game(config);

// Export for debugging
window.__game = game;
