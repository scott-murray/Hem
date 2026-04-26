import * as Phaser from 'phaser';
import { TILE, TILE_SIZE, TILE_SRC_SIZE, TILE_SCALE, SOLID_TILES, DEADLY_TILES, parseLevel } from '../levels/tileSchema.js';
import { LEVEL1_MAP, LEVEL1_CONFIG } from '../levels/level1.js';
import { LEVEL2_MAP, LEVEL2_CONFIG } from '../levels/level2.js';
import { LEVEL3_MAP, LEVEL3_CONFIG } from '../levels/level3.js';
import { storage } from '../progress/storage.js';
import { sfx } from '../audio/sfx.js';
import { setupKeyboard, updateInput, inputState } from '../input/controls.js';

const W = 480;
const H = 270;

const GRAVITY = 900;
const JUMP_VELOCITY = -380;
const RUN_SPEED = 160;
const COYOTE_TIME = 80;
const JUMP_BUFFER = 80;
const INVULN_TIME = 1500; // ms of invulnerability after hurt
const ENEMY_SPEED = 50;

const LEVELS = [
  null,
  { map: LEVEL1_MAP, config: LEVEL1_CONFIG },
  { map: LEVEL2_MAP, config: LEVEL2_CONFIG },
  { map: LEVEL3_MAP, config: LEVEL3_CONFIG },
];

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    this.levelNumber = data.level || 1;
    this.lives = 3;
    this.checkpointX = null;
    this.checkpointY = null;
    this.isInvuln = false;
    this.invulnTimer = 0;
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.wasOnGround = false;
    this.solvedPuzzles = new Set();
    this.activeDoors = new Map(); // puzzleId -> door sprite
    this.isWinning = false;
    this.isPaused = false;
  }

  create() {
    const levelData = LEVELS[this.levelNumber];
    if (!levelData) {
      this.scene.start('StartScene');
      return;
    }

    this.levelConfig = levelData.config;
    this.parsedLevel = parseLevel(levelData.map);

    // Background
    this._buildBackground();

    // Build tilemap
    this._buildTilemap();

    // Spawn entities
    this._spawnEntities();

    // Camera
    this._setupCamera();

    // Input
    setupKeyboard(this);

    // Start UI scene
    this.scene.launch('UIScene');
    this.uiScene = this.scene.get('UIScene');

    // Wait for UI to be ready then set info
    this.time.delayedCall(100, () => {
      if (this.uiScene) {
        this.uiScene.setLives(this.lives);
        this.uiScene.setLevelName(this.levelConfig.name);
      }
    });

    // Listen for puzzle results
    this.events.on('resume', (scene, data) => {
      if (data && data.puzzleResult) {
        this._onPuzzleResult(data);
      }
    });

    // Set initial checkpoint at spawn
    this.checkpointX = this.parsedLevel.bunnySpawn.x;
    this.checkpointY = this.parsedLevel.bunnySpawn.y;

    // Grant brief spawn-grace invuln so enemies right next to the spawn
    // can't hit the player on frame 1.
    this.isInvuln = true;
    this.invulnTimer = INVULN_TIME;
  }

  _buildBackground() {
    const bg = this.add.graphics();
    const bgColor = this.levelConfig.bgColor;

    // Extract RGB from hex color
    const r = (bgColor >> 16) & 0xff;
    const g = (bgColor >> 8) & 0xff;
    const b = bgColor & 0xff;

    // Sky gradient
    const steps = 15;
    const levelH = this.parsedLevel.pixelHeight;
    const levelW = this.parsedLevel.pixelWidth;

    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const dr = Math.round(r * (1 - t * 0.3));
      const dg = Math.round(g * (1 - t * 0.3));
      const db = Math.round(b * (1 - t * 0.3));
      const color = (dr << 16) | (dg << 8) | db;
      bg.fillStyle(color, 1);
      bg.fillRect(0, i * (levelH / steps), levelW, levelH / steps + 1);
    }

    // Stars / atmospheric detail
    bg.fillStyle(0xffffff, 0.6);
    for (let i = 0; i < 40; i++) {
      const sx = Math.random() * levelW;
      const sy = Math.random() * levelH * 0.5;
      bg.fillRect(sx, sy, 2, 2);
    }
  }

  _buildTilemap() {
    const { tiles, widthTiles, heightTiles } = this.parsedLevel;

    this.groundGroup = this.physics.add.staticGroup();
    this.platformGroup = this.physics.add.staticGroup();

    for (let r = 0; r < heightTiles; r++) {
      for (let c = 0; c < widthTiles; c++) {
        const ch = tiles[r][c];
        const x = c * TILE_SIZE;
        const y = r * TILE_SIZE;
        const cx = x + TILE_SIZE / 2;
        const cy = y + TILE_SIZE / 2;

        let textureKey = null;
        let group = null;

        if (ch === TILE.GRASS) {
          textureKey = 'tile_grass';
          group = this.groundGroup;
        } else if (ch === TILE.GROUND) {
          textureKey = 'tile_ground';
          group = this.groundGroup;
        } else if (ch === TILE.PLATFORM) {
          textureKey = 'tile_platform';
          group = this.platformGroup;
        } else if (ch === TILE.PUZZLE) {
          // Puzzle tiles are drawn but handled in specials
          textureKey = 'tile_puzzle';
          // No physics group - handled as trigger
        }

        if (textureKey && group) {
          const sprite = group.create(cx, cy, textureKey);
          sprite.setScale(TILE_SCALE);
          sprite.refreshBody();
        } else if (textureKey && !group) {
          // Visual only
          this.add.image(cx, cy, textureKey).setScale(TILE_SCALE);
        }
      }
    }
  }

  _spawnEntities() {
    const { specials, bunnySpawn } = this.parsedLevel;

    // Spawn bunny
    this.bunny = this.physics.add.sprite(bunnySpawn.x, bunnySpawn.y, 'bunny_idle', 0);
    this.bunny.setScale(TILE_SCALE);
    this.bunny.setCollideWorldBounds(false);
    this.bunny.body.setGravityY(GRAVITY);
    this.bunny.body.setSize(12, 14);
    this.bunny.play('bunny_idle');
    this.bunny.setDepth(10);

    // Collections
    this.checkpoints = [];
    this.puzzleTriggers = [];
    this.doors = new Map(); // puzzleId -> door sprite[] (door group)
    this.enemies = [];
    this.carrot = null;
    this.spikes = this.physics.add.staticGroup();

    specials.forEach(spec => {
      const { type, x, y, id } = spec;

      if (type === 'carrot') {
        this.carrot = this.physics.add.sprite(x, y, 'carrot', 0);
        this.carrot.setScale(TILE_SCALE);
        this.carrot.body.setAllowGravity(false);
        this.carrot.body.setImmovable(true);
        this.carrot.play('carrot_spin');
        this.carrot.setDepth(5);
      } else if (type === 'checkpoint') {
        const cp = this.add.sprite(x, y, 'tile_checkpoint_off');
        cp.setScale(TILE_SCALE);
        cp.setDepth(5);
        // Checkpoint visual at ground level; respawn point is the tile center
        this.checkpoints.push({ sprite: cp, x, y, activated: false });
      } else if (type === 'spike') {
        const spike = this.spikes.create(x, y, 'tile_spike');
        spike.setScale(TILE_SCALE);
        spike.body.setSize(TILE_SRC_SIZE - 2, TILE_SRC_SIZE / 2);
        spike.body.setOffset(1, TILE_SRC_SIZE / 2);
        spike.refreshBody();
      } else if (type === 'puzzle') {
        // Store puzzle trigger info (zone-based overlap)
        this.puzzleTriggers.push({
          x, y,
          id: spec.id,
          triggered: false,
          bounds: new Phaser.Geom.Rectangle(x - TILE_SIZE / 2, y - TILE_SIZE / 2, TILE_SIZE, TILE_SIZE),
        });
      } else if (type === 'door') {
        const doorSprite = this.physics.add.staticImage(x, y, 'tile_door');
        doorSprite.setScale(TILE_SCALE);
        doorSprite.refreshBody();
        doorSprite.setDepth(5);
        const group = this.doors.get(spec.id) || [];
        group.push(doorSprite);
        this.doors.set(spec.id, group);
      } else if (type === 'enemy_fox') {
        this._spawnEnemy(x, y, 'fox');
      } else if (type === 'enemy_beetle') {
        this._spawnEnemy(x, y, 'beetle');
      }
    });

    // Particle emitters
    this._setupParticles();

    // Physics overlaps (after all objects created)
    this._setupCollisions();
  }

  _spawnEnemy(x, y, type) {
    const key = type === 'fox' ? 'enemy_fox' : 'enemy_beetle';
    const animKey = type === 'fox' ? 'fox_walk' : 'beetle_walk';

    const enemy = this.physics.add.sprite(x, y, key, 0);
    enemy.setScale(TILE_SCALE);
    enemy.setCollideWorldBounds(false);
    enemy.body.setGravityY(GRAVITY);
    enemy.body.setSize(12, 12);
    enemy.play(animKey);
    enemy.setDepth(8);
    enemy._type = type;
    enemy._dir = -1; // start moving left
    enemy._speed = ENEMY_SPEED;
    enemy._patrolTimer = 0;
    enemy._patrolRange = TILE_SIZE * 4; // patrol 4 tiles
    enemy._startX = x;
    this.enemies.push(enemy);

    return enemy;
  }

  _setupParticles() {
    // Dust emitter
    this.dustEmitter = this.add.particles(0, 0, 'particle_dust', {
      lifespan: 300,
      speed: { min: 10, max: 40 },
      scale: { start: 1.5, end: 0 },
      alpha: { start: 0.8, end: 0 },
      quantity: 3,
      emitting: false,
    });

    // Sparkle emitter (carrot collect)
    this.sparkleEmitter = this.add.particles(0, 0, 'particle_sparkle', {
      lifespan: 500,
      speed: { min: 30, max: 100 },
      scale: { start: 2, end: 0 },
      alpha: { start: 1, end: 0 },
      quantity: 8,
      emitting: false,
      angle: { min: 0, max: 360 },
    });

    // Confetti emitter
    this.confettiEmitters = [0, 1, 2, 3].map(i =>
      this.add.particles(0, 0, `particle_confetti${i}`, {
        lifespan: 1500,
        speed: { min: 50, max: 150 },
        scale: { start: 2, end: 0.5 },
        alpha: { start: 1, end: 0 },
        quantity: 5,
        emitting: false,
        angle: { min: -120, max: -60 },
        gravityY: 100,
      })
    );
  }

  _setupCollisions() {
    // Bunny vs solid ground
    this.physics.add.collider(this.bunny, this.groundGroup);
    this.physics.add.collider(this.bunny, this.platformGroup, null, (bunny, platform) => {
      // One-way: only collide if bunny is falling and above platform
      return bunny.body.velocity.y >= 0 && bunny.body.bottom <= platform.body.top + 8;
    });

    // Bunny vs doors (each group is an array of sprites)
    this.doors.forEach(group => {
      group.forEach(door => this.physics.add.collider(this.bunny, door));
    });

    // Enemies vs ground
    this.enemies.forEach(enemy => {
      this.physics.add.collider(enemy, this.groundGroup);
      this.physics.add.collider(enemy, this.platformGroup);
    });

    // Bunny vs enemies — physics overlap (replaces previous distance check)
    if (this.enemies.length > 0) {
      this.physics.add.overlap(this.bunny, this.enemies, () => {
        this._hurtBunny();
      });
    }

    // Bunny vs spikes
    this.physics.add.overlap(this.bunny, this.spikes, () => {
      this._hurtBunny();
    });

    // Bunny vs carrot
    if (this.carrot) {
      this.physics.add.overlap(this.bunny, this.carrot, () => {
        this._collectCarrot();
      });
    }
  }

  _setupCamera() {
    const { pixelWidth, pixelHeight } = this.parsedLevel;
    this.cameras.main.setBounds(0, 0, pixelWidth, pixelHeight);
    this.cameras.main.startFollow(this.bunny, true, 0.1, 0.1);
    this.cameras.main.setDeadzone(80, 40);
    this.physics.world.setBounds(0, -500, pixelWidth, pixelHeight + 500);
  }

  update(time, delta) {
    if (this.isWinning || this.isPaused) return;

    const dt = delta / 1000;

    updateInput(this);
    this._updateBunny(dt);
    this._updateEnemies(dt);
    this._checkPuzzleTriggers();
    this._checkFallDeath();
    this._checkCheckpoints();
    this._updateInvuln(dt);
  }

  _updateBunny(dt) {
    const body = this.bunny.body;
    const onGround = body.blocked.down;

    // Coyote time
    if (onGround) {
      this.coyoteTimer = COYOTE_TIME;
    } else {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - dt * 1000);
    }

    // Jump buffer
    if (inputState.jumpPressed) {
      this.jumpBufferTimer = JUMP_BUFFER;
    } else {
      this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - dt * 1000);
    }

    // Horizontal movement
    if (inputState.left) {
      body.setVelocityX(-RUN_SPEED);
      this.bunny.setFlipX(true);
    } else if (inputState.right) {
      body.setVelocityX(RUN_SPEED);
      this.bunny.setFlipX(false);
    } else {
      body.setVelocityX(0);
    }

    // Jumping (coyote + buffer)
    const canJump = this.coyoteTimer > 0;
    const wantsJump = this.jumpBufferTimer > 0;

    if (canJump && wantsJump) {
      body.setVelocityY(JUMP_VELOCITY);
      this.coyoteTimer = 0;
      this.jumpBufferTimer = 0;
      sfx.play('jump');

      // Dust on jump
      this.dustEmitter.explode(3, this.bunny.x, this.bunny.y + 8);
    }

    // Land detection
    if (!this.wasOnGround && onGround) {
      sfx.play('land');
      this.dustEmitter.explode(5, this.bunny.x, this.bunny.y + 8);
    }
    this.wasOnGround = onGround;

    // Animation
    this._updateBunnyAnim(onGround);
  }

  _updateBunnyAnim(onGround) {
    if (this.isInvuln && Math.floor(Date.now() / 100) % 2 === 0) {
      this.bunny.play('bunny_hurt', true);
      return;
    }

    if (!onGround) {
      this.bunny.play('bunny_jump', true);
    } else if (inputState.left || inputState.right) {
      this.bunny.play('bunny_run', true);
    } else {
      this.bunny.play('bunny_idle', true);
    }
  }

  _updateEnemies(dt) {
    const levelW = this.parsedLevel.pixelWidth;

    this.enemies.forEach(enemy => {
      if (!enemy.active) return;

      const body = enemy.body;

      // Move horizontally
      body.setVelocityX(enemy._dir * enemy._speed);

      // Flip sprite based on direction
      enemy.setFlipX(enemy._dir > 0);

      // Check if we've gone past patrol range
      const distFromStart = Math.abs(enemy.x - enemy._startX);
      if (distFromStart > enemy._patrolRange) {
        enemy._dir *= -1;
        enemy.x = Phaser.Math.Clamp(enemy.x, enemy._startX - enemy._patrolRange, enemy._startX + enemy._patrolRange);
      }

      // Check wall collisions
      if (body.blocked.left || body.blocked.right) {
        enemy._dir *= -1;
      }

      // Edge detection: check if there's ground ahead
      const lookX = enemy.x + enemy._dir * (TILE_SIZE * 0.8);
      const lookY = enemy.y + TILE_SIZE;
      const tileAtFoot = this._getTileAt(lookX, lookY);
      if (!SOLID_TILES.has(tileAtFoot) && body.blocked.down) {
        enemy._dir *= -1;
      }
    });
  }

  _getTileAt(worldX, worldY) {
    const { tiles } = this.parsedLevel;
    const col = Math.floor(worldX / TILE_SIZE);
    const row = Math.floor(worldY / TILE_SIZE);
    if (row < 0 || row >= tiles.length) return ' ';
    if (col < 0 || col >= tiles[row].length) return ' ';
    return tiles[row][col];
  }

  _checkPuzzleTriggers() {
    this.puzzleTriggers.forEach(trigger => {
      if (trigger.triggered && this.solvedPuzzles.has(trigger.id)) return;
      if (trigger.triggered) return;

      const bx = this.bunny.x;
      const by = this.bunny.y;

      if (trigger.bounds.contains(bx, by)) {
        trigger.triggered = true;
        this._launchPuzzle(trigger);
      }
    });
  }

  _launchPuzzle(trigger) {
    this.isPaused = true;
    this.bunny.body.setVelocity(0, 0);

    // Determine puzzle type based on level config and puzzle index
    const types = this.levelConfig.puzzleTypes;
    const puzzleType = types[trigger.id % types.length];

    this.scene.pause();
    this.scene.launch('PuzzleScene', {
      puzzleType,
      puzzleId: trigger.id,
      callerScene: 'GameScene',
    });
  }

  _onPuzzleResult(data) {
    this.isPaused = false;

    const { puzzleResult, puzzleId } = data;

    if (puzzleResult === 'success') {
      this.solvedPuzzles.add(puzzleId);

      // Remove every door tile in this group
      const group = this.doors.get(puzzleId);
      if (group) {
        group.forEach(door => door.destroy());
        this.doors.delete(puzzleId);
      }

      // Reset trigger so player can move through
      const trigger = this.puzzleTriggers.find(t => t.id === puzzleId);
      if (trigger) trigger.triggered = true;

    } else {
      // Fail: lose 1 heart, allow retry
      this._hurtBunny();
      // Allow re-triggering
      const trigger = this.puzzleTriggers.find(t => t.id === puzzleId);
      if (trigger) trigger.triggered = false;
    }
  }

  _checkFallDeath() {
    const { pixelHeight } = this.parsedLevel;
    if (this.bunny.y > pixelHeight + 100) {
      this._hurtBunny(true); // force respawn
    }
  }

  _checkCheckpoints() {
    this.checkpoints.forEach(cp => {
      if (cp.activated) return;
      const dx = this.bunny.x - cp.x;
      const dy = this.bunny.y - cp.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < TILE_SIZE * 1.2) {
        cp.activated = true;
        cp.sprite.setTexture('tile_checkpoint_on');
        this.checkpointX = cp.x;
        this.checkpointY = cp.y;
        sfx.play('checkpoint');
      }
    });
  }

  _updateInvuln(dt) {
    if (this.isInvuln) {
      this.invulnTimer -= dt * 1000;
      if (this.invulnTimer <= 0) {
        this.isInvuln = false;
        this.bunny.setAlpha(1);
      }
    }
  }

  _hurtBunny(forceFall = false) {
    if (this.isInvuln && !forceFall) return;
    if (this.isWinning) return;

    sfx.play('hurt');
    this.lives--;

    if (this.uiScene) {
      this.uiScene.setLives(this.lives);
    }

    // Screen shake
    this.cameras.main.shake(200, 0.005);

    if (this.lives <= 0) {
      // Game over - return to start
      this.time.delayedCall(500, () => {
        this.scene.stop('UIScene');
        this.scene.start('StartScene');
      });
      return;
    }

    // Respawn at checkpoint (tile center, bunny will land on ground below)
    this.bunny.setPosition(this.checkpointX, this.checkpointY);
    this.bunny.body.setVelocity(0, 0);

    // Brief invulnerability
    this.isInvuln = true;
    this.invulnTimer = INVULN_TIME;

    // Knockback
    const knockDir = this.bunny.flipX ? 1 : -1;
    this.bunny.body.setVelocityX(knockDir * 150);
    this.bunny.body.setVelocityY(-200);
  }

  _collectCarrot() {
    if (this.isWinning) return;
    this.isWinning = true;

    sfx.play('collect');

    // Sparkle effect
    this.sparkleEmitter.explode(12, this.carrot.x, this.carrot.y);

    this.carrot.setVisible(false);
    this.carrot.body.setEnable(false);

    this.bunny.body.setVelocity(0, 0);
    this.bunny.body.setGravityY(0);
    this.bunny.body.setAllowGravity(false);

    // Confetti burst from top
    this.time.delayedCall(200, () => {
      sfx.play('win');
      const cx = this.cameras.main.scrollX + W / 2;
      const cy = this.cameras.main.scrollY + 30;
      this.confettiEmitters.forEach(em => {
        em.explode(12, cx, cy);
      });
    });

    // Win animation: bunny bounces up
    this.tweens.add({
      targets: this.bunny,
      y: this.bunny.y - 30,
      duration: 300,
      yoyo: true,
      ease: 'Sine.easeOut',
    });

    // Save progress and transition
    this.time.delayedCall(1500, () => {
      storage.completeLevel(this.levelNumber);
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.time.delayedCall(600, () => {
        this.scene.stop('UIScene');
        this.scene.start('StartScene');
      });
    });
  }
}
