import Phaser from 'phaser';
import { EventBus } from '../../utils/EventBus';
import { SoundEffects } from '../../audio/SoundEffects';
import { PowerUpType, BossInfo } from '../../types/game';

interface ActivePowerUp {
  type: PowerUpType;
  endTime: number;
  duration: number;
}

export class GameScene extends Phaser.Scene {
  // Player
  private player!: Phaser.Physics.Arcade.Sprite;
  private playerEngineParticles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private shieldSprite!: Phaser.GameObjects.Sprite;
  private playerSpeed = 340;
  private playerHealth = 100;
  private maxHealth = 100;
  private playerShield = 100;
  private maxShield = 100;
  private isInvulnerable = false;
  private isAlive = true;

  // Controls
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyS!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private keySpace!: Phaser.Input.Keyboard.Key;
  private keyEsc!: Phaser.Input.Keyboard.Key;
  private mobileInput = { x: 0, y: 0, shoot: false };

  // Weapons
  private lastFiredTime = 0;
  private fireRate = 220; // ms
  private playerBullets!: Phaser.Physics.Arcade.Group;
  private enemyBullets!: Phaser.Physics.Arcade.Group;
  private bossBullets!: Phaser.Physics.Arcade.Group;

  // Entities
  private enemies!: Phaser.Physics.Arcade.Group;
  private asteroids!: Phaser.Physics.Arcade.Group;
  private powerUps!: Phaser.Physics.Arcade.Group;

  // Boss
  private boss: Phaser.Physics.Arcade.Sprite | null = null;
  private bossHp = 0;
  private bossMaxHp = 2500;
  private bossPhase = 1;
  private bossAttackTimer = 0;
  private bossMovementDirection = 1;

  // Waves & Progression
  private currentWave = 1;
  private waveEnemiesRemaining = 0;
  private waveSpawnTimer: Phaser.Time.TimerEvent | null = null;
  private waveInProgress = false;
  private score = 0;
  private scoreMultiplier = 1;

  // Power-Ups
  private activePowerUps: Map<PowerUpType, ActivePowerUp> = new Map();

  // FX
  private explosionEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private sparkEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    const { width, height } = this.scale;
    this.isAlive = true;
    this.score = 0;
    this.currentWave = 1;
    this.playerHealth = 100;
    this.playerShield = 100;
    this.activePowerUps.clear();

    // 1. Particle Systems
    this.sparkEmitter = this.add.particles(0, 0, 'spark', {
      speed: { min: 60, max: 220 },
      scale: { start: 1.2, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 350,
      blendMode: Phaser.BlendModes.ADD,
      emitting: false,
    });

    this.explosionEmitter = this.add.particles(0, 0, 'smoke', {
      speed: { min: 40, max: 180 },
      scale: { start: 0.8, end: 2.2 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 600,
      blendMode: Phaser.BlendModes.SCREEN,
      emitting: false,
    });

    // 2. Groups
    this.playerBullets = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      maxSize: 60,
      runChildUpdate: true,
    });

    this.enemyBullets = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      maxSize: 80,
      runChildUpdate: true,
    });

    this.bossBullets = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      maxSize: 60,
      runChildUpdate: true,
    });

    this.enemies = this.physics.add.group();
    this.asteroids = this.physics.add.group();
    this.powerUps = this.physics.add.group();

    // 3. Player Setup
    this.player = this.physics.add.sprite(width / 2, height - 100, 'player_ship');
    this.player.setCollideWorldBounds(true);
    this.player.setDrag(800, 800);
    this.player.setMaxVelocity(this.playerSpeed, this.playerSpeed);
    this.player.setSize(44, 48);
    this.player.setOffset(10, 12);
    this.player.setDepth(10);

    // Player Engine Thruster Trail
    this.playerEngineParticles = this.add.particles(0, 0, 'engine_glow', {
      speedY: { min: 140, max: 280 },
      speedX: { min: -25, max: 25 },
      scale: { start: 1.2, end: 0.1 },
      alpha: { start: 0.9, end: 0 },
      lifespan: 220,
      blendMode: Phaser.BlendModes.ADD,
      follow: this.player,
      followOffset: { x: 0, y: 32 },
    });
    this.playerEngineParticles.setDepth(9);

    // Shield Forcefield Dome
    this.shieldSprite = this.add.sprite(this.player.x, this.player.y, 'shield_bubble');
    this.shieldSprite.setDepth(11);
    this.shieldSprite.setVisible(this.playerShield > 0);
    this.shieldSprite.setAlpha(0.85);

    // 4. Keyboard Controls
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
      this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
      this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
      this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      this.keyEsc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

      this.keyEsc.on('down', () => {
        EventBus.emit('game:togglePause');
      });
    }

    // 5. Collisions & Overlaps
    // Player Bullets -> Enemies
    this.physics.add.overlap(this.playerBullets, this.enemies, (bullet, enemy) => {
      this.handleBulletEnemyCollision(bullet as Phaser.Physics.Arcade.Image, enemy as Phaser.Physics.Arcade.Sprite);
    });

    // Player Bullets -> Asteroids
    this.physics.add.overlap(this.playerBullets, this.asteroids, (bullet, asteroid) => {
      this.handleBulletAsteroidCollision(bullet as Phaser.Physics.Arcade.Image, asteroid as Phaser.Physics.Arcade.Sprite);
    });

    // Player Bullets -> Boss
    this.physics.add.overlap(this.playerBullets, this.boss ? [this.boss] : [], (bullet, boss) => {
      this.handleBulletBossCollision(bullet as Phaser.Physics.Arcade.Image, boss as Phaser.Physics.Arcade.Sprite);
    });

    // Enemy Bullets -> Player
    this.physics.add.overlap(this.enemyBullets, this.player, (player, bullet) => {
      this.handleEnemyBulletPlayerCollision(bullet as Phaser.Physics.Arcade.Image);
    });

    // Boss Bullets -> Player
    this.physics.add.overlap(this.bossBullets, this.player, (player, bullet) => {
      this.handleEnemyBulletPlayerCollision(bullet as Phaser.Physics.Arcade.Image, 25);
    });

    // Player -> Enemies (Ramming)
    this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
      this.handlePlayerEntityCollision(enemy as Phaser.Physics.Arcade.Sprite, 30);
    });

    // Player -> Asteroids (Collision)
    this.physics.add.overlap(this.player, this.asteroids, (player, asteroid) => {
      this.handlePlayerEntityCollision(asteroid as Phaser.Physics.Arcade.Sprite, 25);
    });

    // Player -> PowerUps
    this.physics.add.overlap(this.player, this.powerUps, (player, powerUp) => {
      this.collectPowerUp(powerUp as Phaser.Physics.Arcade.Sprite);
    });

    // 6. Mobile & External Events
    EventBus.on('input:mobileMove', (dir: { x: number; y: number }) => {
      this.mobileInput.x = dir.x;
      this.mobileInput.y = dir.y;
    });

    EventBus.on('input:mobileShoot', (shooting: boolean) => {
      this.mobileInput.shoot = shooting;
    });

    EventBus.on('game:restart', () => {
      this.scene.restart();
    });

    // Emit initial stats
    this.emitStats();

    // Start Wave 1
    this.startWave(1);
  }

  update(time: number, delta: number): void {
    if (!this.isAlive) return;
    const dt = delta / 1000;

    // 1. Player Movement
    let vx = 0;
    let vy = 0;

    // Keyboard
    if (this.cursors.left.isDown || (this.keyA && this.keyA.isDown)) vx -= 1;
    if (this.cursors.right.isDown || (this.keyD && this.keyD.isDown)) vx += 1;
    if (this.cursors.up.isDown || (this.keyW && this.keyW.isDown)) vy -= 1;
    if (this.cursors.down.isDown || (this.keyS && this.keyS.isDown)) vy += 1;

    // Mobile touch
    if (Math.abs(this.mobileInput.x) > 0.1) vx = this.mobileInput.x;
    if (Math.abs(this.mobileInput.y) > 0.1) vy = this.mobileInput.y;

    // Normalize
    const len = Math.hypot(vx, vy);
    if (len > 0.05) {
      this.player.setVelocity(
        (vx / (len > 1 ? len : 1)) * this.playerSpeed,
        (vy / (len > 1 ? len : 1)) * this.playerSpeed
      );
    } else {
      this.player.setAcceleration(0, 0);
    }

    // Banking tilt animation
    const targetRotation = vx * 0.18;
    this.player.rotation = Phaser.Math.Linear(this.player.rotation, targetRotation, 0.12);

    // Parallax background drift
    this.game.events.emit('background:setDrift', vx);

    // Shield follow
    if (this.shieldSprite && this.shieldSprite.visible) {
      this.shieldSprite.setPosition(this.player.x, this.player.y);
      this.shieldSprite.rotation += dt * 1.5;
    }

    // 2. Shooting
    const isShooting = (this.keySpace && this.keySpace.isDown) || this.mobileInput.shoot;
    const hasRapid = this.activePowerUps.has('RAPID_FIRE');
    const currentFireRate = hasRapid ? 90 : this.fireRate;

    if (isShooting && time > this.lastFiredTime + currentFireRate) {
      this.firePlayerWeapon();
      this.lastFiredTime = time;
    }

    // 3. Clean out of bounds bullets
    this.cleanupBullets();

    // 4. Update Enemies
    this.updateEnemies(time, dt);

    // 5. Update Asteroids
    this.updateAsteroids(dt);

    // 6. Update Boss
    if (this.boss && this.boss.active) {
      this.updateBoss(time, dt);
    }

    // 7. Update Active Power-Ups
    this.updatePowerUps(time);
  }

  // ==========================================
  // WEAPONS & FIRING
  // ==========================================
  private firePlayerWeapon(): void {
    const x = this.player.x;
    const y = this.player.y - 20;

    const hasTriple = this.activePowerUps.has('TRIPLE_SHOT');
    const hasDamage = this.activePowerUps.has('DOUBLE_DAMAGE');

    if (hasDamage) {
      // Heavy piercing plasma beam
      const beam = this.playerBullets.get(x, y, 'laser_heavy') as Phaser.Physics.Arcade.Image;
      if (beam) {
        beam.setActive(true).setVisible(true);
        beam.setData('damage', 3);
        beam.setData('pierce', 2);
        beam.setVelocity(0, -680);
        beam.body.reset(x, y);
      }
      SoundEffects.playLaser('heavy');
      this.cameras.main.shake(50, 0.003);
    } else if (hasTriple) {
      // 3-way spread
      const angles = [-15, 0, 15];
      angles.forEach((deg) => {
        const rad = Phaser.Math.DegToRad(deg - 90);
        const b = this.playerBullets.get(x, y, 'laser_triple') as Phaser.Physics.Arcade.Image;
        if (b) {
          b.setActive(true).setVisible(true);
          b.setData('damage', 1.5);
          b.setRotation(Phaser.Math.DegToRad(deg));
          b.setVelocity(Math.cos(rad) * 620, Math.sin(rad) * 620);
          b.body.reset(x, y);
        }
      });
      SoundEffects.playLaser('triple');
      this.cameras.main.shake(40, 0.002);
    } else {
      // Dual Standard Lasers
      [-12, 12].forEach((offset) => {
        const b = this.playerBullets.get(x + offset, y, 'laser_player') as Phaser.Physics.Arcade.Image;
        if (b) {
          b.setActive(true).setVisible(true);
          b.setData('damage', 1);
          b.setVelocity(0, -650);
          b.body.reset(x + offset, y);
        }
      });
      SoundEffects.playLaser('normal');
      this.cameras.main.shake(30, 0.001);
    }
  }

  private cleanupBullets(): void {
    const bounds = this.scale;
    this.playerBullets.children.each((child) => {
      const b = child as Phaser.Physics.Arcade.Image;
      if (b.active && (b.y < -30 || b.y > bounds.height + 30 || b.x < -30 || b.x > bounds.width + 30)) {
        b.setActive(false).setVisible(false);
        b.body.stop();
      }
      return null;
    });

    this.enemyBullets.children.each((child) => {
      const b = child as Phaser.Physics.Arcade.Image;
      if (b.active && (b.y > bounds.height + 40 || b.y < -40 || b.x < -40 || b.x > bounds.width + 40)) {
        b.setActive(false).setVisible(false);
        b.body.stop();
      }
      return null;
    });

    this.bossBullets.children.each((child) => {
      const b = child as Phaser.Physics.Arcade.Image;
      if (b.active && (b.y > bounds.height + 40 || b.y < -40 || b.x < -40 || b.x > bounds.width + 40)) {
        b.setActive(false).setVisible(false);
        b.body.stop();
      }
      return null;
    });
  }

  // ==========================================
  // WAVES & SPAWNING
  // ==========================================
  private startWave(waveNum: number): void {
    this.currentWave = waveNum;
    this.waveInProgress = true;
    EventBus.emit('wave:start', waveNum);

    if (waveNum % 6 === 0) {
      // BOSS WAVE!
      this.triggerBossEncounter();
      return;
    }

    // Standard / Elite Waves
    const baseEnemyCount = 12 + waveNum * 4;
    this.waveEnemiesRemaining = baseEnemyCount;

    if (this.waveSpawnTimer) this.waveSpawnTimer.destroy();

    const spawnInterval = Math.max(700, 1600 - waveNum * 120);

    this.waveSpawnTimer = this.time.addEvent({
      delay: spawnInterval,
      callback: () => {
        if (!this.waveInProgress) return;
        this.spawnWaveEnemy();
        // Periodically spawn asteroid
        if (Math.random() < 0.45) {
          this.spawnAsteroid();
        }
      },
      loop: true,
    });
  }

  private spawnWaveEnemy(): void {
    const width = this.scale.width;
    const x = Phaser.Math.Between(40, width - 40);
    const y = -40;

    // Pick enemy type based on wave
    let type = 'scout';
    const roll = Math.random();

    if (this.currentWave === 5) {
      // Elite Wave
      if (roll < 0.4) type = 'reaper';
      else if (roll < 0.7) type = 'cruiser';
      else type = 'striker';
    } else if (this.currentWave >= 4) {
      if (roll < 0.25) type = 'cruiser';
      else if (roll < 0.5) type = 'gunship';
      else if (roll < 0.75) type = 'striker';
      else type = 'scout';
    } else if (this.currentWave >= 3) {
      if (roll < 0.35) type = 'gunship';
      else if (roll < 0.65) type = 'striker';
      else type = 'scout';
    } else if (this.currentWave >= 2) {
      type = roll < 0.5 ? 'striker' : 'scout';
    }

    this.createEnemy(type, x, y);
  }

  private createEnemy(type: string, x: number, y: number): Phaser.Physics.Arcade.Sprite {
    const key = `enemy_${type}`;
    const enemy = this.enemies.create(x, y, key) as Phaser.Physics.Arcade.Sprite;
    enemy.setData('type', type);
    enemy.setDepth(8);

    // Difficulty scaling factor
    const diff = 1 + (this.currentWave - 1) * 0.15;

    switch (type) {
      case 'scout':
        enemy.setData('hp', Math.floor(1 * diff));
        enemy.setData('score', 100);
        enemy.setVelocity(0, 160 * diff);
        enemy.setData('sineOffset', Math.random() * 10);
        break;
      case 'striker':
        enemy.setData('hp', Math.floor(2 * diff));
        enemy.setData('score', 180);
        enemy.setVelocity(Phaser.Math.Between(-80, 80), 240 * diff);
        enemy.setData('zigzagTimer', 0);
        break;
      case 'cruiser':
        enemy.setData('hp', Math.floor(7 * diff));
        enemy.setData('score', 400);
        enemy.setVelocity(0, 85 * diff);
        enemy.setData('shootTimer', 0);
        break;
      case 'gunship':
        enemy.setData('hp', Math.floor(4 * diff));
        enemy.setData('score', 280);
        enemy.setVelocity(0, 120 * diff);
        enemy.setData('shootTimer', 0);
        enemy.setData('targetY', Phaser.Math.Between(80, 220));
        break;
      case 'reaper':
        enemy.setData('hp', Math.floor(11 * diff));
        enemy.setData('score', 750);
        enemy.setVelocity(100 * (Math.random() < 0.5 ? 1 : -1), 90 * diff);
        enemy.setData('shootTimer', 0);
        break;
    }

    return enemy;
  }

  private updateEnemies(time: number, dt: number): void {
    const width = this.scale.width;
    const height = this.scale.height;

    this.enemies.children.each((child) => {
      const e = child as Phaser.Physics.Arcade.Sprite;
      if (!e.active) return null;

      const type = e.getData('type');

      if (type === 'scout') {
        // Sine wave sweep
        const offset = e.getData('sineOffset') || 0;
        e.x += Math.sin((time * 0.004) + offset) * 1.5;
      } else if (type === 'striker') {
        // Rapid darting zig-zag
        let zTimer = (e.getData('zigzagTimer') || 0) + dt;
        if (zTimer > 0.8) {
          zTimer = 0;
          e.setVelocityX((Math.random() < 0.5 ? 1 : -1) * 160);
        }
        e.setData('zigzagTimer', zTimer);
      } else if (type === 'gunship') {
        // Stop at target Y and hover/shoot
        const targetY = e.getData('targetY') || 140;
        if (e.y >= targetY) {
          e.setVelocityY(0);
          e.x += Math.sin(time * 0.003) * 1.2;
        }

        let shootTimer = (e.getData('shootTimer') || 0) + dt;
        if (shootTimer > 1.8) {
          shootTimer = 0;
          this.fireEnemyBullet(e.x, e.y + 20, 0, 320);
        }
        e.setData('shootTimer', shootTimer);
      } else if (type === 'cruiser') {
        // Dual cannon fire
        let shootTimer = (e.getData('shootTimer') || 0) + dt;
        if (shootTimer > 2.2) {
          shootTimer = 0;
          this.fireEnemyBullet(e.x - 16, e.y + 25, -40, 260);
          this.fireEnemyBullet(e.x + 16, e.y + 25, 40, 260);
        }
        e.setData('shootTimer', shootTimer);
      } else if (type === 'reaper') {
        // Bounce on screen edges and fire burst
        if (e.x < 50) e.setVelocityX(120);
        if (e.x > width - 50) e.setVelocityX(-120);

        let shootTimer = (e.getData('shootTimer') || 0) + dt;
        if (shootTimer > 2.0) {
          shootTimer = 0;
          // 3-way burst towards player
          const angleToPlayer = Phaser.Math.Angle.Between(e.x, e.y, this.player.x, this.player.y);
          [-0.2, 0, 0.2].forEach((offset) => {
            const rad = angleToPlayer + offset;
            this.fireEnemyBullet(e.x, e.y + 25, Math.cos(rad) * 280, Math.sin(rad) * 280);
          });
        }
        e.setData('shootTimer', shootTimer);
      }

      // Check off-screen
      if (e.y > height + 50) {
        e.destroy();
        this.checkWaveProgress();
      }

      return null;
    });
  }

  private fireEnemyBullet(x: number, y: number, vx: number, vy: number): void {
    const b = this.enemyBullets.get(x, y, 'laser_enemy') as Phaser.Physics.Arcade.Image;
    if (b) {
      b.setActive(true).setVisible(true);
      b.setVelocity(vx, vy);
      b.body.reset(x, y);
      SoundEffects.playEnemyLaser();
    }
  }

  // ==========================================
  // ASTEROIDS
  // ==========================================
  private spawnAsteroid(size: 'large' | 'medium' | 'small' = 'large', spawnX?: number, spawnY?: number): void {
    const width = this.scale.width;
    const x = spawnX ?? Phaser.Math.Between(40, width - 40);
    const y = spawnY ?? -50;
    const key = `asteroid_${size}`;

    const ast = this.asteroids.create(x, y, key) as Phaser.Physics.Arcade.Sprite;
    ast.setData('size', size);
    ast.setDepth(7);

    const hpMap = { large: 5, medium: 3, small: 1 };
    const scoreMap = { large: 150, medium: 80, small: 40 };

    ast.setData('hp', hpMap[size]);
    ast.setData('score', scoreMap[size]);

    const speed = size === 'large' ? 90 : size === 'medium' ? 140 : 200;
    ast.setVelocity(Phaser.Math.Between(-30, 30), speed + Phaser.Math.Between(-15, 25));
    ast.setAngularVelocity(Phaser.Math.Between(-80, 80));
  }

  private updateAsteroids(_dt: number): void {
    const height = this.scale.height;
    this.asteroids.children.each((child) => {
      const a = child as Phaser.Physics.Arcade.Sprite;
      if (a.active && a.y > height + 60) {
        a.destroy();
      }
      return null;
    });
  }

  // ==========================================
  // BOSS BATTLE
  // ==========================================
  private triggerBossEncounter(): void {
    if (this.waveSpawnTimer) this.waveSpawnTimer.destroy();

    // Clear remaining minor enemies
    this.enemies.clear(true, true);

    SoundEffects.playBossAlarm();
    EventBus.emit('boss:warning');

    this.time.delayedCall(2200, () => {
      this.spawnBoss();
    });
  }

  private spawnBoss(): void {
    const width = this.scale.width;
    this.boss = this.physics.add.sprite(width / 2, -120, 'boss_mothership');
    this.boss.setCollideWorldBounds(false);
    this.boss.setDepth(9);

    const cycle = Math.floor(this.currentWave / 6);
    this.bossMaxHp = 2200 + cycle * 1200;
    this.bossHp = this.bossMaxHp;
    this.bossPhase = 1;
    this.bossAttackTimer = 0;
    this.bossMovementDirection = 1;

    // Entrance Tween
    this.tweens.add({
      targets: this.boss,
      y: 130,
      duration: 2500,
      ease: 'Power2',
      onComplete: () => {
        if (this.boss) {
          this.boss.setCollideWorldBounds(true);
          this.emitBossInfo();
        }
      },
    });

    this.emitBossInfo();
  }

  private updateBoss(time: number, dt: number): void {
    if (!this.boss || !this.boss.active) return;
    const width = this.scale.width;

    // Movement: Strafe back and forth
    this.boss.x += this.bossMovementDirection * 85 * dt * (this.bossPhase === 2 ? 1.4 : 1.0);
    if (this.boss.x < 110) {
      this.boss.x = 110;
      this.bossMovementDirection = 1;
    } else if (this.boss.x > width - 110) {
      this.boss.x = width - 110;
      this.bossMovementDirection = -1;
    }

    // Attack Timers
    this.bossAttackTimer += dt;
    const attackInterval = this.bossPhase === 2 ? 1.3 : 2.0;

    if (this.bossAttackTimer > attackInterval) {
      this.bossAttackTimer = 0;
      this.executeBossAttack();
    }
  }

  private executeBossAttack(): void {
    if (!this.boss || !this.boss.active) return;
    const bx = this.boss.x;
    const by = this.boss.y;

    if (this.bossPhase === 1) {
      // 5-way spread of energy spheres
      for (let i = -2; i <= 2; i++) {
        const rad = Phaser.Math.DegToRad(90 + i * 22);
        const b = this.bossBullets.get(bx, by + 40, 'boss_bullet') as Phaser.Physics.Arcade.Image;
        if (b) {
          b.setActive(true).setVisible(true);
          b.setVelocity(Math.cos(rad) * 260, Math.sin(rad) * 260);
          b.body.reset(bx, by + 40);
        }
      }
      SoundEffects.playEnemyLaser();
    } else {
      // Phase 2: Enraged Barrage + Spiral
      for (let i = -3; i <= 3; i++) {
        const rad = Phaser.Math.DegToRad(90 + i * 18);
        const b = this.bossBullets.get(bx, by + 50, 'boss_bullet') as Phaser.Physics.Arcade.Image;
        if (b) {
          b.setActive(true).setVisible(true);
          b.setVelocity(Math.cos(rad) * 310, Math.sin(rad) * 310);
          b.body.reset(bx, by + 50);
        }
      }
      // Dual side cannons
      [-60, 60].forEach((ox) => {
        this.fireEnemyBullet(bx + ox, by + 20, 0, 360);
      });
      SoundEffects.playEnemyLaser();
    }
  }

  private emitBossInfo(): void {
    if (!this.boss) {
      EventBus.emit('boss:update', { active: false, name: '', currentHp: 0, maxHp: 0, phase: 1 });
      return;
    }
    const info: BossInfo = {
      active: true,
      name: 'OMEGA MOTHERSHIP',
      currentHp: this.bossHp,
      maxHp: this.bossMaxHp,
      phase: this.bossPhase,
    };
    EventBus.emit('boss:update', info);
  }

  // ==========================================
  // COLLISIONS & DAMAGE
  // ==========================================
  private handleBulletEnemyCollision(bullet: Phaser.Physics.Arcade.Image, enemy: Phaser.Physics.Arcade.Sprite): void {
    if (!bullet.active || !enemy.active) return;

    const damage = bullet.getData('damage') || 1;
    let pierce = bullet.getData('pierce') || 0;

    if (pierce <= 0) {
      bullet.setActive(false).setVisible(false);
      bullet.body.stop();
    } else {
      bullet.setData('pierce', pierce - 1);
    }

    const currentHp = (enemy.getData('hp') || 1) - damage;
    this.sparkEmitter.explode(6, enemy.x, enemy.y);

    if (currentHp <= 0) {
      this.destroyEnemy(enemy);
    } else {
      enemy.setData('hp', currentHp);
      // Flash white
      enemy.setTintFill(0xffffff);
      this.time.delayedCall(60, () => {
        if (enemy.active) enemy.clearTint();
      });
      SoundEffects.playHit();
    }
  }

  private handleBulletAsteroidCollision(bullet: Phaser.Physics.Arcade.Image, asteroid: Phaser.Physics.Arcade.Sprite): void {
    if (!bullet.active || !asteroid.active) return;

    const damage = bullet.getData('damage') || 1;
    bullet.setActive(false).setVisible(false);
    bullet.body.stop();

    const hp = (asteroid.getData('hp') || 1) - damage;
    this.sparkEmitter.explode(8, asteroid.x, asteroid.y);

    if (hp <= 0) {
      this.destroyAsteroid(asteroid);
    } else {
      asteroid.setData('hp', hp);
      asteroid.setTintFill(0x00f0ff);
      this.time.delayedCall(60, () => {
        if (asteroid.active) asteroid.clearTint();
      });
      SoundEffects.playHit();
    }
  }

  private handleBulletBossCollision(bullet: Phaser.Physics.Arcade.Image, boss: Phaser.Physics.Arcade.Sprite): void {
    if (!bullet.active || !boss.active) return;

    const damage = bullet.getData('damage') || 1;
    bullet.setActive(false).setVisible(false);
    bullet.body.stop();

    this.bossHp -= damage * 15;
    this.sparkEmitter.explode(10, bullet.x, bullet.y);

    // Phase transition at 50% HP
    if (this.bossHp < this.bossMaxHp * 0.5 && this.bossPhase === 1) {
      this.bossPhase = 2;
      this.cameras.main.flash(300, 255, 0, 85);
      SoundEffects.playBossAlarm();
    }

    this.emitBossInfo();

    if (this.bossHp <= 0) {
      this.destroyBoss();
    } else {
      boss.setTintFill(0xffffff);
      this.time.delayedCall(50, () => {
        if (boss.active) boss.clearTint();
      });
      SoundEffects.playHit();
    }
  }

  private handleEnemyBulletPlayerCollision(bullet: Phaser.Physics.Arcade.Image, dmg: number = 15): void {
    if (!bullet.active || !this.isAlive || this.isInvulnerable) return;

    bullet.setActive(false).setVisible(false);
    bullet.body.stop();

    this.damagePlayer(dmg);
  }

  private handlePlayerEntityCollision(entity: Phaser.Physics.Arcade.Sprite, dmg: number = 25): void {
    if (!entity.active || !this.isAlive || this.isInvulnerable) return;

    this.damagePlayer(dmg);
    this.sparkEmitter.explode(16, this.player.x, this.player.y);
  }

  private damagePlayer(amount: number): void {
    if (this.isInvulnerable || !this.isAlive) return;

    this.cameras.main.shake(180, 0.012);

    if (this.playerShield > 0) {
      this.playerShield = Math.max(0, this.playerShield - amount * 1.4);
      SoundEffects.playShieldAbsorb();
      this.shieldSprite.setVisible(this.playerShield > 0);
      if (this.playerShield === 0) {
        this.activePowerUps.delete('SHIELD');
      }
    } else {
      this.playerHealth = Math.max(0, this.playerHealth - amount);
      SoundEffects.playHit();
    }

    this.emitStats();

    if (this.playerHealth <= 0) {
      this.killPlayer();
      return;
    }

    // Invulnerability flashing
    this.isInvulnerable = true;
    this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 120,
      yoyo: true,
      repeat: 6,
      onComplete: () => {
        this.player.alpha = 1;
        this.isInvulnerable = false;
      },
    });
  }

  private destroyEnemy(enemy: Phaser.Physics.Arcade.Sprite): void {
    const scoreVal = (enemy.getData('score') || 100) * this.scoreMultiplier;
    this.addScore(scoreVal, enemy.x, enemy.y);

    this.explosionEmitter.explode(14, enemy.x, enemy.y);
    this.sparkEmitter.explode(18, enemy.x, enemy.y);
    SoundEffects.playExplosion('small');

    // Chance to drop power-up (14% standard, 50% reaper)
    const isReaper = enemy.getData('type') === 'reaper';
    if (Math.random() < (isReaper ? 0.6 : 0.14)) {
      this.spawnPowerUp(enemy.x, enemy.y);
    }

    enemy.destroy();
    this.checkWaveProgress();
  }

  private destroyAsteroid(asteroid: Phaser.Physics.Arcade.Sprite): void {
    const size = asteroid.getData('size');
    const scoreVal = (asteroid.getData('score') || 50) * this.scoreMultiplier;
    this.addScore(scoreVal, asteroid.x, asteroid.y);

    this.explosionEmitter.explode(size === 'large' ? 16 : 8, asteroid.x, asteroid.y);
    SoundEffects.playAsteroidBreak();

    // Split mechanic
    if (size === 'large') {
      this.spawnAsteroid('medium', asteroid.x - 18, asteroid.y);
      this.spawnAsteroid('medium', asteroid.x + 18, asteroid.y);
    } else if (size === 'medium') {
      this.spawnAsteroid('small', asteroid.x - 12, asteroid.y);
      this.spawnAsteroid('small', asteroid.x + 12, asteroid.y);
    } else {
      // Small chance for power-up from small asteroid
      if (Math.random() < 0.12) {
        this.spawnPowerUp(asteroid.x, asteroid.y);
      }
    }

    asteroid.destroy();
  }

  private destroyBoss(): void {
    if (!this.boss) return;
    const bx = this.boss.x;
    const by = this.boss.y;

    this.addScore(5000 * this.scoreMultiplier, bx, by);
    SoundEffects.playBossExplosion();
    this.cameras.main.shake(800, 0.025);
    this.cameras.main.flash(600, 255, 255, 255);

    // Cascading explosions across boss hull
    for (let i = 0; i < 8; i++) {
      this.time.delayedCall(i * 120, () => {
        this.explosionEmitter.explode(22, bx + Phaser.Math.Between(-80, 80), by + Phaser.Math.Between(-50, 50));
        this.sparkEmitter.explode(25, bx + Phaser.Math.Between(-80, 80), by + Phaser.Math.Between(-50, 50));
      });
    }

    // Drop multiple power-ups
    this.spawnPowerUp(bx - 40, by);
    this.spawnPowerUp(bx + 40, by);

    this.boss.destroy();
    this.boss = null;
    this.emitBossInfo();

    // Next wave after victory fanfare
    this.time.delayedCall(2800, () => {
      this.startWave(this.currentWave + 1);
    });
  }

  private checkWaveProgress(): void {
    this.waveEnemiesRemaining--;
    if (this.waveEnemiesRemaining <= 0 && this.waveInProgress && !this.boss) {
      this.waveInProgress = false;
      if (this.waveSpawnTimer) this.waveSpawnTimer.destroy();

      // Short break before next wave
      this.time.delayedCall(2000, () => {
        this.startWave(this.currentWave + 1);
      });
    }
  }

  // ==========================================
  // POWER-UPS
  // ==========================================
  private spawnPowerUp(x: number, y: number): void {
    const types: PowerUpType[] = ['SHIELD', 'RAPID_FIRE', 'DOUBLE_DAMAGE', 'TRIPLE_SHOT', 'HEALTH', 'SCORE_BOOST'];
    const selected = Phaser.Utils.Array.GetRandom(types);
    const key = `powerup_${selected.toLowerCase().replace('_fire', '').replace('_damage', '').replace('_shot', '').replace('_boost', '')}`;

    const p = this.powerUps.create(x, y, key) as Phaser.Physics.Arcade.Sprite;
    p.setData('type', selected);
    p.setVelocity(0, 100);
    p.setDepth(6);

    // Floating bobbing tween
    this.tweens.add({
      targets: p,
      scale: 1.15,
      alpha: 0.85,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });
  }

  private collectPowerUp(powerUp: Phaser.Physics.Arcade.Sprite): void {
    const type: PowerUpType = powerUp.getData('type');
    powerUp.destroy();

    SoundEffects.playPowerUp();
    this.sparkEmitter.explode(14, this.player.x, this.player.y);

    const now = this.time.now;

    switch (type) {
      case 'HEALTH':
        this.playerHealth = Math.min(this.maxHealth, this.playerHealth + 35);
        this.showFloatingText('+35 HP', this.player.x, this.player.y, '#22c55e');
        break;
      case 'SHIELD':
        this.playerShield = this.maxShield;
        this.shieldSprite.setVisible(true);
        this.showFloatingText('SHIELD OVERCHARGE', this.player.x, this.player.y, '#00f0ff');
        this.activePowerUps.set('SHIELD', { type, endTime: now + 20000, duration: 20000 });
        break;
      case 'RAPID_FIRE':
        this.showFloatingText('RAPID FIRE', this.player.x, this.player.y, '#facc15');
        this.activePowerUps.set('RAPID_FIRE', { type, endTime: now + 12000, duration: 12000 });
        break;
      case 'DOUBLE_DAMAGE':
        this.showFloatingText('OVERCHARGE BEAM', this.player.x, this.player.y, '#ec4899');
        this.activePowerUps.set('DOUBLE_DAMAGE', { type, endTime: now + 12000, duration: 12000 });
        break;
      case 'TRIPLE_SHOT':
        this.showFloatingText('TRIPLE SPREAD', this.player.x, this.player.y, '#fb923c');
        this.activePowerUps.set('TRIPLE_SHOT', { type, endTime: now + 15000, duration: 15000 });
        break;
      case 'SCORE_BOOST':
        this.showFloatingText('2X SCORE', this.player.x, this.player.y, '#a855f7');
        this.scoreMultiplier = 2;
        this.activePowerUps.set('SCORE_BOOST', { type, endTime: now + 15000, duration: 15000 });
        break;
    }

    this.emitStats();
  }

  private updatePowerUps(now: number): void {
    let changed = false;
    this.activePowerUps.forEach((item, key) => {
      if (now > item.endTime) {
        this.activePowerUps.delete(key);
        changed = true;
        if (key === 'SCORE_BOOST') {
          this.scoreMultiplier = 1;
        }
      }
    });
    if (changed) {
      this.emitStats();
    }
  }

  // ==========================================
  // SCORE & UI
  // ==========================================
  private addScore(amount: number, x: number, y: number): void {
    this.score += amount;
    this.showFloatingText(`+${amount}`, x, y, '#00f0ff');
    this.emitStats();
  }

  private showFloatingText(text: string, x: number, y: number, color: string): void {
    const txt = this.add.text(x, y, text, {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
      color: color,
      stroke: '#000000',
      strokeThickness: 3,
    });
    txt.setOrigin(0.5);
    txt.setDepth(20);

    this.tweens.add({
      targets: txt,
      y: y - 40,
      alpha: 0,
      duration: 800,
      ease: 'Power1',
      onComplete: () => txt.destroy(),
    });
  }

  private killPlayer(): void {
    this.isAlive = false;
    this.player.setVisible(false);
    this.shieldSprite.setVisible(false);
    this.playerEngineParticles.stop();

    SoundEffects.playExplosion('large');
    SoundEffects.playGameOver();

    this.explosionEmitter.explode(35, this.player.x, this.player.y);
    this.sparkEmitter.explode(45, this.player.x, this.player.y);
    this.cameras.main.shake(500, 0.02);

    this.time.delayedCall(1200, () => {
      EventBus.emit('game:over', { score: this.score, wave: this.currentWave });
    });
  }

  private emitStats(): void {
    const now = this.time.now;
    const powerUpsList = Array.from(this.activePowerUps.values()).map((p) => ({
      type: p.type,
      duration: Math.max(0, (p.endTime - now) / 1000),
      maxDuration: p.duration / 1000,
    }));

    EventBus.emit('stats:update', {
      score: this.score,
      health: this.playerHealth,
      maxHealth: this.maxHealth,
      shield: this.playerShield,
      maxShield: this.maxShield,
      wave: this.currentWave,
      lives: 3,
      activePowerUps: powerUpsList,
    });
  }
}
