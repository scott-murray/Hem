import * as Phaser from 'phaser';
import { generateBunnyTextures } from '../art/drawBunny.js';
import { generateTileTextures } from '../art/drawTiles.js';
import { generateEnemyTextures } from '../art/drawEnemy.js';
import { generateCarrotTextures } from '../art/drawCarrot.js';
import { generateParticleTextures } from '../art/drawParticles.js';
import { storage } from '../progress/storage.js';
import { sfx } from '../audio/sfx.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {}

  create() {
    // Load progress and apply mute setting
    const progress = storage.load();
    sfx.setMuted(progress.muted);

    // Generate all procedural textures
    generateBunnyTextures(this);
    generateTileTextures(this);
    generateEnemyTextures(this);
    generateCarrotTextures(this);
    generateParticleTextures(this);

    // Create animations
    this._createAnimations();

    // Transition to start screen
    this.scene.start('StartScene');
  }

  _createAnimations() {
    const anims = this.anims;

    // Bunny animations
    if (!anims.exists('bunny_idle')) {
      anims.create({
        key: 'bunny_idle',
        frames: [
          { key: 'bunny_idle', frame: 0 },
          { key: 'bunny_idle', frame: 1 },
        ],
        frameRate: 2,
        repeat: -1,
      });
    }

    if (!anims.exists('bunny_run')) {
      anims.create({
        key: 'bunny_run',
        frames: [
          { key: 'bunny_run', frame: 0 },
          { key: 'bunny_run', frame: 1 },
          { key: 'bunny_run', frame: 2 },
          { key: 'bunny_run', frame: 3 },
        ],
        frameRate: 10,
        repeat: -1,
      });
    }

    if (!anims.exists('bunny_jump')) {
      anims.create({
        key: 'bunny_jump',
        frames: [{ key: 'bunny_jump', frame: 0 }],
        frameRate: 1,
        repeat: -1,
      });
    }

    if (!anims.exists('bunny_hurt')) {
      anims.create({
        key: 'bunny_hurt',
        frames: [{ key: 'bunny_hurt', frame: 0 }],
        frameRate: 1,
        repeat: -1,
      });
    }

    // Carrot spinning animation
    if (!anims.exists('carrot_spin')) {
      anims.create({
        key: 'carrot_spin',
        frames: [
          { key: 'carrot', frame: 0 },
          { key: 'carrot', frame: 1 },
          { key: 'carrot', frame: 2 },
          { key: 'carrot', frame: 3 },
        ],
        frameRate: 8,
        repeat: -1,
      });
    }

    // Enemy animations
    if (!anims.exists('fox_walk')) {
      anims.create({
        key: 'fox_walk',
        frames: [
          { key: 'enemy_fox', frame: 0 },
          { key: 'enemy_fox', frame: 1 },
        ],
        frameRate: 6,
        repeat: -1,
      });
    }

    if (!anims.exists('beetle_walk')) {
      anims.create({
        key: 'beetle_walk',
        frames: [
          { key: 'enemy_beetle', frame: 0 },
          { key: 'enemy_beetle', frame: 1 },
        ],
        frameRate: 6,
        repeat: -1,
      });
    }
  }
}
