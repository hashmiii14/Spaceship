import Phaser from 'phaser';
import { EventBus } from '../../utils/EventBus';
import { SoundEffects } from '../../audio/SoundEffects';
import { Storage } from '../../utils/storage';
import {
  PowerUpType,
  BossInfo,
  WeaponType,
  LevelUpOption,
  PlayerStats,
} from '../../types/game';

interface ActivePowerUp {
  type: PowerUpType;
  endTime: number;
  duration: number;
}

interface EnemyMine {
  sprite: Phaser.Physics.Arcade.Sprite;
  timer: number;
  detonated: boolean;
}

export class GameScene extends Phaser.Scene {
  // Player
  private player!: Phaser.Physics.Arcade.Sprite;
  private playerEngineParticles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private shieldSprite!: Phaser.GameObjects.Sprite;
  private basePlayerSpeed = 340;
  private playerSpeed = 340;
  private playerHealth = 100;
  private maxHealth = 100;
  private playerShield = 100;
  private maxShield = 100;
  private isInvulnerable = false;
  private isAlive = true;
  private isLevelUpPaused = false;

  // Progression & Stats
  private score = 0;
  private survivalTime = 0; // in seconds
  private playerLevel = 1;
  private playerXp = 0;
  private nextLevelXp = 100;
  private currentLevel = 1; // 1 to 7
  private maxLevelReached = 1;
  private levelNames = [
    'AWAKENING',
    'INTERCEPTOR PROTOCOL',
    'HEAVY ARTILLERY',
    'VOID DESTROYER',
    'NEBULA SWARM',
    'NEBULA QUEEN',
    'GALACTIC SINGULARITY',
  ];

  // Upgrades
  private weaponType: WeaponType = 'BLASTER';
  private damageMultiplier = 1.0;
  private fireRateBonus = 0;
  private magnetRadius = 140;

  // Kill Combo System
  private combo = 0;
  private comboMultiplier = 1;
  private comboTimer = 0;
  private maxComboTimer = 2.5; // seconds
  private bestCombo = 0;

  // Controls
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyS!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private keySpace!: Phaser.Input.Keyboard.Key;
  private keyEsc!: Phaser.Input.Keyboard.Key;
  private mobileInput = { x: 0, y: 0, shoot: false };

  // Weapons & Bullets
  private lastFiredTime = 0;
  private baseFireRate = 220; // ms
  private playerBullets!: Phaser.Physics.Arcade.Group;
  private enemyBullets!: Phaser.Physics.Arcade.Group;
  private bossBullets!: Phaser.Physics.Arcade.Group;

  // Entities & Collectibles
  private enemies!: Phaser.Physics.Arcade.Group;
  private asteroids!: Phaser.Physics.Arcade.Group;
  private powerUps!: Phaser.Physics.Arcade.Group;
  private xpGems!: Phaser.Physics.Arcade.Group;
  private enemyMines: EnemyMine[] = [];

  // Boss
  private boss: Phaser.Physics.Arcade.Sprite | null = null;
  private bossHp = 0;
  private bossMaxHp = 3000;
  private bossPhase = 1;
  private bossAttackTimer = 0;
  private bossMovementDirection = 1;
  private bossType: 'boss_void_destroyer' | 'boss_nebula_queen' | 'boss_star_eater' | 'boss_galactic_core' = 'boss_void_destroyer';
  private bossNames: Record<string, string> = {
    boss_void_destroyer: 'VOID DESTROYER',
    boss_nebula_queen: 'NEBULA QUEEN',
    boss_star_eater: 'STAR EATER',
    boss_galactic_core: 'GALACTIC CORE',
  };

  // Wave & Spawning
  private waveEnemiesRemaining = 0;
  private waveSpawnTimer: Phaser.Time.TimerEvent | null = null;
  private waveInProgress = false;
  private isSlowMo = false;
  private slowMoEndTime = 0;

  // Power-Ups
  private activePowerUps: Map<PowerUpType, ActivePowerUp> = new Map();

  // FX
  private explosionEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private sparkEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;

  // Throttling
  private lastStatsEmitTime = 0;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    const { width, height } = this.scale;
    this.isAlive = true;
    this.isLevelUpPaused = false;
    this.score = 0;
    this.survivalTime = 0;
    this.playerLevel = 1;
    this.playerXp = 0;
    this.nextLevelXp = 100;
    this.currentLevel = 1;
    this.maxLevelReached = 1;
    this.combo = 0;
    this.comboMultiplier = 1;
    this.comboTimer = 0;
    this.bestCombo = Storage.getBestCombo();
    this.playerHealth = 100;
    this.maxHealth = 100;
    this.playerShield = 100;
    this.maxShield = 100;
    this.basePlayerSpeed = 340;
    this.playerSpeed = 340;
    this.weaponType = 'BLASTER';
    this.damageMultiplier = 1.0;
    this.fireRateBonus = 0;
    this.magnetRadius = 140;
    this.activePowerUps.clear();
    this.enemyMines = [];
    this.isSlowMo = false;

    // 1. Particle Systems
    this.sparkEmitter = this.add.particles(0, 0, 'spark', {
      speed: { min: 60, max: 240 },
      scale: { start: 1.2, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 350,
      blendMode: Phaser.BlendModes.ADD,
      emitting: false,
    });
    this.sparkEmitter.setDepth(15);

    this.explosionEmitter = this.add.particles(0, 0, 'smoke', {
      speed: { min: 40, max: 220 },
      scale: { start: 0.8, end: 2.4 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 650,
      blendMode: Phaser.BlendModes.SCREEN,
      emitting: false,
    });
    this.explosionEmitter.setDepth(15);

    // 2. Physics Groups (Pre-allocated Object Pools)
    this.playerBullets = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      maxSize: 100,
      runChildUpdate: false,
    });

    this.enemyBullets = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      maxSize: 100,
      runChildUpdate: false,
    });

    this.bossBullets = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      maxSize: 80,
      runChildUpdate: false,
    });

    this.enemies = this.physics.add.group();
    this.asteroids = this.physics.add.group();
    this.powerUps = this.physics.add.group();
    this.xpGems = this.physics.add.group();

    // 3. Player Setup
    const skin = Storage.getSkin();
    const skinKey = `player_ship_${skin.id}`;
    const initialSkin = this.textures.exists(skinKey) ? skinKey : 'player_ship';

    this.player = this.physics.add.sprite(width / 2, height - 100, initialSkin);
    this.player.setCollideWorldBounds(true);
    this.player.setDrag(850, 850);
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

    // 4. Keyboard Controls & Browser Scroll Prevention
    if (this.input.keyboard) {
      this.input.keyboard.addCapture([
        Phaser.Input.Keyboard.KeyCodes.SPACE,
        Phaser.Input.Keyboard.KeyCodes.UP,
        Phaser.Input.Keyboard.KeyCodes.DOWN,
        Phaser.Input.Keyboard.KeyCodes.LEFT,
        Phaser.Input.Keyboard.KeyCodes.RIGHT,
      ]);

      this.cursors = this.input.keyboard.createCursorKeys();
      this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
      this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
      this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
      this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      this.keyEsc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

      this.keyEsc.on('down', () => {
        if (this.isAlive && !this.isLevelUpPaused) {
          EventBus.emit('game:togglePause');
        }
      });
    }

    // 5. Collisions & Overlaps
    // Bullets -> Enemies
    this.physics.add.overlap(this.playerBullets, this.enemies, (bullet, enemy) => {
      this.handleBulletEnemyCollision(bullet as Phaser.Physics.Arcade.Image, enemy as Phaser.Physics.Arcade.Sprite);
    });

    // Bullets -> Asteroids
    this.physics.add.overlap(this.playerBullets, this.asteroids, (bullet, asteroid) => {
      this.handleBulletAsteroidCollision(bullet as Phaser.Physics.Arcade.Image, asteroid as Phaser.Physics.Arcade.Sprite);
    });

    // Bullets -> Boss
    this.physics.add.overlap(this.playerBullets, this.boss ? [this.boss] : [], (bullet, boss) => {
      this.handleBulletBossCollision(bullet as Phaser.Physics.Arcade.Image, boss as Phaser.Physics.Arcade.Sprite);
    });

    // Enemy Bullets -> Player
    this.physics.add.overlap(this.enemyBullets, this.player, (_p, bullet) => {
      this.handleEnemyBulletPlayerCollision(bullet as Phaser.Physics.Arcade.Image, 15);
    });

    // Boss Bullets -> Player
    this.physics.add.overlap(this.bossBullets, this.player, (_p, bullet) => {
      this.handleEnemyBulletPlayerCollision(bullet as Phaser.Physics.Arcade.Image, 25);
    });

    // Player -> Enemies (Ramming)
    this.physics.add.overlap(this.player, this.enemies, (_p, enemy) => {
      this.handlePlayerEntityCollision(enemy as Phaser.Physics.Arcade.Sprite, 30);
    });

    // Player -> Asteroids (Collision)
    this.physics.add.overlap(this.player, this.asteroids, (_p, asteroid) => {
      this.handlePlayerEntityCollision(asteroid as Phaser.Physics.Arcade.Sprite, 25);
    });

    // Player -> PowerUps
    this.physics.add.overlap(this.player, this.powerUps, (_p, powerUp) => {
      this.collectPowerUp(powerUp as Phaser.Physics.Arcade.Sprite);
    });

    // Player -> XP Gems
    this.physics.add.overlap(this.player, this.xpGems, (_p, gem) => {
      this.collectXpGem(gem as Phaser.Physics.Arcade.Sprite);
    });

    // 6. External Events & Bus Listeners
    EventBus.on('input:mobileMove', (dir: { x: number; y: number }) => {
      this.mobileInput.x = dir.x;
      this.mobileInput.y = dir.y;
    });

    EventBus.on('input:mobileShoot', (shooting: boolean) => {
      this.mobileInput.shoot = shooting;
    });

    EventBus.on('upgrade:selected', (option: LevelUpOption) => {
      this.applyUpgrade(option);
      this.isLevelUpPaused = false;
      this.physics.resume();
    });

    EventBus.on('player:skinChanged', (newSkinId: string) => {
      const key = `player_ship_${newSkinId}`;
      if (this.textures.exists(key) && this.player && this.player.active) {
        this.player.setTexture(key);
      }
    });

    // 7. Responsive Window Resize Handler
    this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      if (this.player && this.player.active) {
        this.player.x = Phaser.Math.Clamp(this.player.x, 30, gameSize.width - 30);
        this.player.y = Phaser.Math.Clamp(this.player.y, 40, gameSize.height - 40);
      }
    });

    // Start Level 1
    this.startLevel(1);
    this.emitStats(true);
  }

  update(time: number, delta: number): void {
    if (!this.isAlive || this.isLevelUpPaused) return;
    const dt = delta / 1000;

    // 1. Survival Time & Progressive Flight Speed Scaling
    this.survivalTime += dt;
    this.updateProgressiveSpeed();

    // 2. Kill Combo Decay
    if (this.combo > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.resetCombo();
      }
    }

    // 3. Player Movement
    let vx = 0;
    let vy = 0;

    if (this.cursors.left.isDown || (this.keyA && this.keyA.isDown)) vx -= 1;
    if (this.cursors.right.isDown || (this.keyD && this.keyD.isDown)) vx += 1;
    if (this.cursors.up.isDown || (this.keyW && this.keyW.isDown)) vy -= 1;
    if (this.cursors.down.isDown || (this.keyS && this.keyS.isDown)) vy += 1;

    if (Math.abs(this.mobileInput.x) > 0.08) vx = this.mobileInput.x;
    if (Math.abs(this.mobileInput.y) > 0.08) vy = this.mobileInput.y;

    const len = Math.hypot(vx, vy);
    if (len > 0.05) {
      const norm = len > 1 ? len : 1;
      this.player.setVelocity((vx / norm) * this.playerSpeed, (vy / norm) * this.playerSpeed);
    } else {
      this.player.setAcceleration(0, 0);
    }

    // Banking tilt animation
    const targetRotation = Phaser.Math.Clamp(vx, -1, 1) * 0.18;
    this.player.rotation = Phaser.Math.Linear(this.player.rotation, targetRotation, 0.12);

    // Parallax background drift
    this.game.events.emit('background:setDrift', vx);

    // Shield follow
    if (this.shieldSprite && this.shieldSprite.visible) {
      this.shieldSprite.setPosition(this.player.x, this.player.y);
      this.shieldSprite.rotation += dt * 1.5;
    }

    // 4. Shooting
    const isShooting = (this.keySpace && this.keySpace.isDown) || this.mobileInput.shoot;
    const hasRapid = this.activePowerUps.has('RAPID_FIRE');
    const calculatedFireRate = Math.max(50, (hasRapid ? 70 : this.baseFireRate) - this.fireRateBonus);

    if (isShooting && time > this.lastFiredTime + calculatedFireRate) {
      this.firePlayerWeapon();
      this.lastFiredTime = time;
    }

    // 5. Magnet Sensor - Pull XP and PowerUps
    this.updateMagnetPull(dt);

    // 6. Slow Motion Power-Up Check
    if (this.isSlowMo && time > this.slowMoEndTime) {
      this.isSlowMo = false;
    }

    // 7. Cleanup Bullets
    this.cleanupBullets();

    // 8. Update Enemies, Asteroids, Mines, Boss
    this.updateEnemies(time, dt);
    this.updateAsteroids(dt);
    this.updateMines(dt);

    if (this.boss && this.boss.active) {
      this.updateBoss(time, dt);
    }

    // 9. Update Active Power-Ups
    this.updatePowerUps(time);

    // 10. Throttled Stats Emission (~10Hz)
    if (time - this.lastStatsEmitTime > 90) {
      this.lastStatsEmitTime = time;
      this.emitStats();
    }
  }

  // ==========================================
  // PROGRESSIVE SPEED & FLIGHT FEEL
  // ==========================================
  private updateProgressiveSpeed(): void {
    // 0-30s: 1.0x (340)
    // 30-90s: up to 1.15x (390)
    // 90-180s: up to 1.3x (440)
    // 180s+: Overdrive 1.45x (490)
    let speedMult = 1.0;
    if (this.survivalTime > 180) {
      speedMult = 1.45;
    } else if (this.survivalTime > 90) {
      speedMult = 1.15 + ((this.survivalTime - 90) / 90) * 0.15;
    } else if (this.survivalTime > 30) {
      speedMult = 1.0 + ((this.survivalTime - 30) / 60) * 0.15;
    }

    this.playerSpeed = this.basePlayerSpeed * speedMult;
    this.player.setMaxVelocity(this.playerSpeed, this.playerSpeed);
    this.game.events.emit('background:setSpeedMultiplier', speedMult);
  }

  // ==========================================
  // WEAPONS & FIRING (FIXED BULLET POOLING)
  // ==========================================
  private firePlayerWeapon(): void {
    const x = this.player.x;
    const y = this.player.y - 22;

    const hasDoubleDamage = this.activePowerUps.has('DOUBLE_DAMAGE');
    const hasSpread = this.activePowerUps.has('SPREAD_SHOT') || this.weaponType === 'SPREAD';
    const hasHyperbeam = this.activePowerUps.has('HYPERBEAM') || this.weaponType === 'HYPERBEAM';
    const hasPlasma = this.activePowerUps.has('PLASMA_CANNON') || this.weaponType === 'PLASMA';

    const dmg = (hasDoubleDamage ? 2.5 : 1.0) * this.damageMultiplier;

    if (hasHyperbeam) {
      // Continuous piercing beam
      const beam = this.playerBullets.get(x, y, 'laser_hyperbeam') as Phaser.Physics.Arcade.Image;
      if (beam) {
        beam.body.reset(x, y);
        beam.body.enable = true;
        beam.setActive(true).setVisible(true);
        beam.setData('damage', 5.0 * dmg);
        beam.setData('pierce', 99);
        beam.setVelocity(0, -950);
      }
      SoundEffects.playHyperbeam();
      this.cameras.main.shake(40, 0.003);
    } else if (hasPlasma) {
      // High-damage explosive plasma orb
      const orb = this.playerBullets.get(x, y, 'laser_plasma') as Phaser.Physics.Arcade.Image;
      if (orb) {
        orb.body.reset(x, y);
        orb.body.enable = true;
        orb.setActive(true).setVisible(true);
        orb.setData('damage', 4.0 * dmg);
        orb.setData('pierce', 1);
        orb.setData('splash', true);
        orb.setVelocity(0, -700);
      }
      SoundEffects.playPlasma();
      this.cameras.main.shake(45, 0.003);
    } else if (hasSpread) {
      // 5-way spread fan
      const angles = [-24, -12, 0, 12, 24];
      angles.forEach((deg) => {
        const rad = Phaser.Math.DegToRad(deg - 90);
        const b = this.playerBullets.get(x, y, 'laser_spread') as Phaser.Physics.Arcade.Image;
        if (b) {
          b.body.reset(x, y);
          b.body.enable = true;
          b.setActive(true).setVisible(true);
          b.setData('damage', 1.2 * dmg);
          b.setRotation(Phaser.Math.DegToRad(deg));
          b.setVelocity(Math.cos(rad) * 680, Math.sin(rad) * 680);
        }
      });
      SoundEffects.playLaser('spread');
      this.cameras.main.shake(35, 0.002);
    } else if (this.weaponType === 'TRIPLE' || this.activePowerUps.has('TRIPLE_SHOT')) {
      // 3-way spread
      const angles = [-15, 0, 15];
      angles.forEach((deg) => {
        const rad = Phaser.Math.DegToRad(deg - 90);
        const b = this.playerBullets.get(x, y, 'laser_triple') as Phaser.Physics.Arcade.Image;
        if (b) {
          b.body.reset(x, y);
          b.body.enable = true;
          b.setActive(true).setVisible(true);
          b.setData('damage', 1.3 * dmg);
          b.setRotation(Phaser.Math.DegToRad(deg));
          b.setVelocity(Math.cos(rad) * 650, Math.sin(rad) * 650);
        }
      });
      SoundEffects.playLaser('triple');
      this.cameras.main.shake(30, 0.002);
    } else if (this.weaponType === 'DOUBLE') {
      // Dual heavy laser bolts
      [-14, 14].forEach((offset) => {
        const b = this.playerBullets.get(x + offset, y, 'laser_heavy') as Phaser.Physics.Arcade.Image;
        if (b) {
          b.body.reset(x + offset, y);
          b.body.enable = true;
          b.setActive(true).setVisible(true);
          b.setData('damage', 1.5 * dmg);
          b.setVelocity(0, -700);
        }
      });
      SoundEffects.playLaser('heavy');
      this.cameras.main.shake(30, 0.001);
    } else {
      // Standard Twin Blaster
      [-10, 10].forEach((offset) => {
        const b = this.playerBullets.get(x + offset, y, 'laser_player') as Phaser.Physics.Arcade.Image;
        if (b) {
          b.body.reset(x + offset, y);
          b.body.enable = true;
          b.setActive(true).setVisible(true);
          b.setData('damage', 1.0 * dmg);
          b.setVelocity(0, -680);
        }
      });
      SoundEffects.playLaser('normal');
      this.cameras.main.shake(25, 0.001);
    }
  }

  private cleanupBullets(): void {
    const { width, height } = this.scale;
    this.playerBullets.children.each((child) => {
      const b = child as Phaser.Physics.Arcade.Image;
      if (b.active && (b.y < -40 || b.y > height + 40 || b.x < -40 || b.x > width + 40)) {
        b.setActive(false).setVisible(false);
        b.body.stop();
        b.body.enable = false;
      }
      return null;
    });

    this.enemyBullets.children.each((child) => {
      const b = child as Phaser.Physics.Arcade.Image;
      if (b.active && (b.y > height + 50 || b.y < -50 || b.x < -50 || b.x > width + 50)) {
        b.setActive(false).setVisible(false);
        b.body.stop();
        b.body.enable = false;
      }
      return null;
    });

    this.bossBullets.children.each((child) => {
      const b = child as Phaser.Physics.Arcade.Image;
      if (b.active && (b.y > height + 60 || b.y < -60 || b.x < -60 || b.x > width + 60)) {
        b.setActive(false).setVisible(false);
        b.body.stop();
        b.body.enable = false;
      }
      return null;
    });
  }

  // ==========================================
  // LEVEL PROGRESSION (7 LEVELS)
  // ==========================================
  private startLevel(levelNum: number): void {
    this.currentLevel = levelNum;
    if (levelNum > this.maxLevelReached) {
      this.maxLevelReached = levelNum;
      Storage.setBestLevel(levelNum);
    }
    this.waveInProgress = true;

    // Inform BackgroundScene to transition nebula colors & speed
    this.game.events.emit('background:setLevel', levelNum);
    EventBus.emit('wave:start', levelNum);

    const levelTitle = this.levelNames[levelNum - 1] || `SECTOR ${levelNum}`;
    this.showLevelBanner(`LEVEL ${levelNum}: ${levelTitle}`);

    if (levelNum === 4) {
      // Level 4 Boss: Void Destroyer
      this.triggerBossEncounter('boss_void_destroyer', 3200);
      return;
    } else if (levelNum === 6) {
      // Level 6 Boss: Nebula Queen
      this.triggerBossEncounter('boss_nebula_queen', 4800);
      return;
    } else if (levelNum === 7) {
      // Level 7: Endgame Singularities -> Boss 3 or Boss 4
      this.startEndgameWave();
      return;
    }

    // Standard wave count
    const enemyCount = 14 + levelNum * 6;
    this.waveEnemiesRemaining = enemyCount;

    if (this.waveSpawnTimer) this.waveSpawnTimer.destroy();

    const spawnInterval = Math.max(550, 1400 - levelNum * 110);

    this.waveSpawnTimer = this.time.addEvent({
      delay: spawnInterval,
      callback: () => {
        if (!this.waveInProgress || this.boss) return;
        this.spawnLevelEnemy();
        if (Math.random() < 0.48) {
          this.spawnAsteroid();
        }
      },
      loop: true,
    });
  }

  private startEndgameWave(): void {
    this.waveEnemiesRemaining = 40;
    if (this.waveSpawnTimer) this.waveSpawnTimer.destroy();

    let spawned = 0;
    this.waveSpawnTimer = this.time.addEvent({
      delay: 600,
      callback: () => {
        if (!this.waveInProgress || this.boss) return;
        this.spawnLevelEnemy();
        if (Math.random() < 0.5) this.spawnAsteroid();
        spawned++;
        if (spawned >= 25 && !this.boss) {
          // Trigger final boss encounter
          const finalBoss = Math.random() < 0.5 ? 'boss_star_eater' : 'boss_galactic_core';
          this.triggerBossEncounter(finalBoss, 6500);
        }
      },
      loop: true,
    });
  }

  private showLevelBanner(text: string): void {
    const { width, height } = this.scale;
    const banner = this.add.text(width / 2, height / 3, text, {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#00f0ff',
      stroke: '#000000',
      strokeThickness: 5,
      align: 'center',
    });
    banner.setOrigin(0.5);
    banner.setDepth(30);

    this.tweens.add({
      targets: banner,
      scale: { start: 0.6, to: 1.2 },
      alpha: { start: 1, to: 0 },
      y: height / 3 - 50,
      duration: 2200,
      ease: 'Power2',
      onComplete: () => banner.destroy(),
    });
  }

  // ==========================================
  // ENEMY AI ARCHETYPES (6 TYPES)
  // ==========================================
  private spawnLevelEnemy(): void {
    const width = this.scale.width;
    const x = Phaser.Math.Between(40, width - 40);
    const y = -40;

    let type = 'scout';
    const roll = Math.random();

    if (this.currentLevel >= 5) {
      if (roll < 0.22) type = 'elite';
      else if (roll < 0.42) type = 'bomber';
      else if (roll < 0.62) type = 'tank';
      else if (roll < 0.82) type = 'shooter';
      else type = 'interceptor';
    } else if (this.currentLevel >= 3) {
      if (roll < 0.25) type = 'tank';
      else if (roll < 0.5) type = 'shooter';
      else if (roll < 0.75) type = 'interceptor';
      else type = 'scout';
    } else if (this.currentLevel >= 2) {
      if (roll < 0.45) type = 'interceptor';
      else if (roll < 0.75) type = 'scout';
      else type = 'shooter';
    } else {
      type = roll < 0.8 ? 'scout' : 'interceptor';
    }

    this.createEnemy(type, x, y);
  }

  private createEnemy(type: string, x: number, y: number): Phaser.Physics.Arcade.Sprite {
    const key = `enemy_${type}`;
    const enemy = this.enemies.create(x, y, key) as Phaser.Physics.Arcade.Sprite;
    enemy.setData('type', type);
    enemy.setDepth(8);

    const diff = 1 + (this.currentLevel - 1) * 0.16;

    switch (type) {
      case 'scout':
        enemy.setData('hp', Math.floor(1 * diff));
        enemy.setData('score', 120);
        enemy.setData('xp', 15);
        enemy.setVelocity(0, 170 * diff);
        enemy.setData('sineOffset', Math.random() * 10);
        break;

      case 'interceptor':
        enemy.setData('hp', Math.floor(2 * diff));
        enemy.setData('score', 180);
        enemy.setData('xp', 25);
        enemy.setVelocity(0, 240 * diff);
        enemy.setData('diveTimer', 0);
        break;

      case 'tank':
        enemy.setData('hp', Math.floor(8 * diff));
        enemy.setData('score', 450);
        enemy.setData('xp', 60);
        enemy.setVelocity(0, 75 * diff);
        enemy.setData('shootTimer', 0);
        break;

      case 'shooter':
        enemy.setData('hp', Math.floor(4 * diff));
        enemy.setData('score', 300);
        enemy.setData('xp', 40);
        enemy.setVelocity(0, 110 * diff);
        enemy.setData('targetY', Phaser.Math.Between(90, 240));
        enemy.setData('shootTimer', 0);
        break;

      case 'bomber':
        enemy.setData('hp', Math.floor(5 * diff));
        enemy.setData('score', 380);
        enemy.setData('xp', 50);
        enemy.setVelocity(Phaser.Math.Between(-50, 50), 95 * diff);
        enemy.setData('mineTimer', 0);
        break;

      case 'elite':
        enemy.setData('hp', Math.floor(12 * diff));
        enemy.setData('shield', Math.floor(6 * diff));
        enemy.setData('score', 800);
        enemy.setData('xp', 100);
        enemy.setVelocity(100 * (Math.random() < 0.5 ? 1 : -1), 80 * diff);
        enemy.setData('shootTimer', 0);
        break;
    }

    return enemy;
  }

  private updateEnemies(time: number, dt: number): void {
    const { width, height } = this.scale;
    const slowFactor = this.isSlowMo ? 0.5 : 1.0;

    this.enemies.children.each((child) => {
      const e = child as Phaser.Physics.Arcade.Sprite;
      if (!e.active) return null;

      const type = e.getData('type');

      if (type === 'scout') {
        const offset = e.getData('sineOffset') || 0;
        e.x += Math.sin(time * 0.004 + offset) * 2.2 * slowFactor;
      } else if (type === 'interceptor') {
        // Homing dive towards player
        let diveTimer = (e.getData('diveTimer') || 0) + dt;
        if (diveTimer < 1.4 && this.player && this.player.active) {
          const dx = this.player.x - e.x;
          e.setVelocityX(Phaser.Math.Clamp(dx * 1.5, -160, 160) * slowFactor);
        }
        e.setData('diveTimer', diveTimer);
      } else if (type === 'shooter') {
        const targetY = e.getData('targetY') || 150;
        if (e.y >= targetY) {
          e.setVelocityY(0);
          e.x += Math.sin(time * 0.003) * 1.8 * slowFactor;
        }

        let shootTimer = (e.getData('shootTimer') || 0) + dt * slowFactor;
        if (shootTimer > 1.7) {
          shootTimer = 0;
          const angle = Phaser.Math.Angle.Between(e.x, e.y, this.player.x, this.player.y);
          this.fireEnemyBullet(e.x, e.y + 18, Math.cos(angle) * 310 * slowFactor, Math.sin(angle) * 310 * slowFactor);
        }
        e.setData('shootTimer', shootTimer);
      } else if (type === 'tank') {
        let shootTimer = (e.getData('shootTimer') || 0) + dt * slowFactor;
        if (shootTimer > 2.2) {
          shootTimer = 0;
          this.fireEnemyBullet(e.x - 20, e.y + 25, -35 * slowFactor, 260 * slowFactor);
          this.fireEnemyBullet(e.x + 20, e.y + 25, 35 * slowFactor, 260 * slowFactor);
        }
        e.setData('shootTimer', shootTimer);
      } else if (type === 'bomber') {
        let mineTimer = (e.getData('mineTimer') || 0) + dt * slowFactor;
        if (mineTimer > 2.6) {
          mineTimer = 0;
          this.dropEnemyMine(e.x, e.y + 20);
        }
        e.setData('mineTimer', mineTimer);
      } else if (type === 'elite') {
        if (e.x < 60) e.setVelocityX(110 * slowFactor);
        if (e.x > width - 60) e.setVelocityX(-110 * slowFactor);

        let shootTimer = (e.getData('shootTimer') || 0) + dt * slowFactor;
        if (shootTimer > 1.9) {
          shootTimer = 0;
          const angleToPlayer = Phaser.Math.Angle.Between(e.x, e.y, this.player.x, this.player.y);
          [-0.22, 0, 0.22].forEach((offset) => {
            const rad = angleToPlayer + offset;
            this.fireEnemyBullet(e.x, e.y + 25, Math.cos(rad) * 300 * slowFactor, Math.sin(rad) * 300 * slowFactor);
          });
        }
        e.setData('shootTimer', shootTimer);
      }

      if (e.y > height + 60) {
        e.destroy();
        this.checkWaveProgress();
      }

      return null;
    });
  }

  private fireEnemyBullet(x: number, y: number, vx: number, vy: number): void {
    const b = this.enemyBullets.get(x, y, 'laser_enemy') as Phaser.Physics.Arcade.Image;
    if (b) {
      b.body.reset(x, y);
      b.body.enable = true;
      b.setActive(true).setVisible(true);
      b.setVelocity(vx, vy);
      SoundEffects.playEnemyLaser();
    }
  }

  private dropEnemyMine(x: number, y: number): void {
    const mine = this.physics.add.sprite(x, y, 'energy_mine');
    mine.setVelocity(0, 45);
    mine.setDepth(7);

    this.enemyMines.push({
      sprite: mine,
      timer: 0,
      detonated: false,
    });
  }

  private updateMines(dt: number): void {
    const height = this.scale.height;
    for (let i = this.enemyMines.length - 1; i >= 0; i--) {
      const m = this.enemyMines[i];
      if (!m.sprite || !m.sprite.active) {
        this.enemyMines.splice(i, 1);
        continue;
      }

      m.timer += dt;
      m.sprite.rotation += dt * 3.5;

      // Pulse alpha warning
      m.sprite.setAlpha(0.6 + Math.sin(m.timer * 8) * 0.4);

      // Check proximity to player
      if (this.player && this.player.active) {
        const dist = Phaser.Math.Distance.Between(m.sprite.x, m.sprite.y, this.player.x, this.player.y);
        if (dist < 55) {
          this.detonateMine(m, true);
          this.enemyMines.splice(i, 1);
          continue;
        }
      }

      // Check lifetime or out of bounds
      if (m.timer > 6.0 || m.sprite.y > height + 40) {
        this.detonateMine(m, false);
        this.enemyMines.splice(i, 1);
      }
    }
  }

  private detonateMine(mine: EnemyMine, hitPlayer: boolean): void {
    if (mine.detonated) return;
    mine.detonated = true;
    const mx = mine.sprite.x;
    const my = mine.sprite.y;

    this.explosionEmitter.explode(16, mx, my);
    this.sparkEmitter.explode(18, mx, my);
    SoundEffects.playExplosion('small');

    if (hitPlayer) {
      this.damagePlayer(25);
    }

    mine.sprite.destroy();
  }

  // ==========================================
  // ASTEROIDS WITH SPLITTING MECHANIC
  // ==========================================
  private spawnAsteroid(size: 'large' | 'medium' | 'small' = 'large', spawnX?: number, spawnY?: number): void {
    const width = this.scale.width;
    const x = spawnX ?? Phaser.Math.Between(40, width - 40);
    const y = spawnY ?? -50;
    const key = `asteroid_${size}`;

    const ast = this.asteroids.create(x, y, key) as Phaser.Physics.Arcade.Sprite;
    ast.setData('size', size);
    ast.setDepth(7);

    const hpMap = { large: 6, medium: 3, small: 1 };
    const scoreMap = { large: 150, medium: 80, small: 40 };
    const xpMap = { large: 30, medium: 15, small: 8 };

    ast.setData('hp', hpMap[size]);
    ast.setData('score', scoreMap[size]);
    ast.setData('xp', xpMap[size]);

    const speed = size === 'large' ? 95 : size === 'medium' ? 145 : 210;
    ast.setVelocity(Phaser.Math.Between(-35, 35), speed + Phaser.Math.Between(-15, 25));
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
  // 4 UNIQUE BOSS BATTLES
  // ==========================================
  private triggerBossEncounter(bossType: typeof this.bossType, maxHp: number): void {
    if (this.waveSpawnTimer) this.waveSpawnTimer.destroy();
    this.enemies.clear(true, true);

    this.bossType = bossType;
    this.bossMaxHp = maxHp;
    this.bossHp = maxHp;
    this.bossPhase = 1;

    SoundEffects.playBossAlarm();
    EventBus.emit('boss:warning');

    this.time.delayedCall(2200, () => {
      this.spawnBoss();
    });
  }

  private spawnBoss(): void {
    const width = this.scale.width;
    this.boss = this.physics.add.sprite(width / 2, -140, this.bossType);
    this.boss.setCollideWorldBounds(false);
    this.boss.setDepth(9);

    this.bossHp = this.bossMaxHp;
    this.bossPhase = 1;
    this.bossAttackTimer = 0;
    this.bossMovementDirection = 1;

    // Dramatic Entrance Tween
    this.tweens.add({
      targets: this.boss,
      y: 140,
      duration: 2600,
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
    const slowFactor = this.isSlowMo ? 0.6 : 1.0;

    // Movement: Strafe left/right
    const moveSpeed = (this.bossPhase === 2 ? 110 : 80) * slowFactor;
    this.boss.x += this.bossMovementDirection * moveSpeed * dt;

    if (this.boss.x < 110) {
      this.boss.x = 110;
      this.bossMovementDirection = 1;
    } else if (this.boss.x > width - 110) {
      this.boss.x = width - 110;
      this.bossMovementDirection = -1;
    }

    // Attacks
    this.bossAttackTimer += dt * slowFactor;
    const attackInterval = this.bossPhase === 2 ? 1.2 : 1.8;

    if (this.bossAttackTimer > attackInterval) {
      this.bossAttackTimer = 0;
      this.executeBossAttack(time);
    }
  }

  private executeBossAttack(time: number): void {
    if (!this.boss || !this.boss.active) return;
    const bx = this.boss.x;
    const by = this.boss.y;

    if (this.bossType === 'boss_void_destroyer') {
      // 5-way spread + railgun shot
      for (let i = -2; i <= 2; i++) {
        const rad = Phaser.Math.DegToRad(90 + i * 20);
        const b = this.bossBullets.get(bx, by + 40, 'boss_bullet') as Phaser.Physics.Arcade.Image;
        if (b) {
          b.body.reset(bx, by + 40);
          b.body.enable = true;
          b.setActive(true).setVisible(true);
          b.setVelocity(Math.cos(rad) * 270, Math.sin(rad) * 270);
        }
      }
      if (this.bossPhase === 2) {
        [-50, 50].forEach((ox) => {
          this.fireEnemyBullet(bx + ox, by + 20, 0, 360);
        });
      }
      SoundEffects.playEnemyLaser();
    } else if (this.bossType === 'boss_nebula_queen') {
      // Spiral bullet storm
      const bulletCount = this.bossPhase === 2 ? 10 : 7;
      for (let i = 0; i < bulletCount; i++) {
        const angle = (time * 0.005) + (i * ((Math.PI * 2) / bulletCount));
        const b = this.bossBullets.get(bx, by + 30, 'boss_bullet') as Phaser.Physics.Arcade.Image;
        if (b) {
          b.body.reset(bx, by + 30);
          b.body.enable = true;
          b.setActive(true).setVisible(true);
          b.setVelocity(Math.cos(angle) * 240, Math.sin(angle) * 240);
        }
      }
      SoundEffects.playEnemyLaser();
    } else if (this.bossType === 'boss_star_eater' || this.bossType === 'boss_galactic_core') {
      // Sweeping hyper cluster
      for (let i = -3; i <= 3; i++) {
        const rad = Phaser.Math.DegToRad(90 + i * 16);
        const b = this.bossBullets.get(bx, by + 45, 'boss_bullet_heavy') as Phaser.Physics.Arcade.Image;
        if (b) {
          b.body.reset(bx, by + 45);
          b.body.enable = true;
          b.setActive(true).setVisible(true);
          b.setVelocity(Math.cos(rad) * 310, Math.sin(rad) * 310);
        }
      }
      SoundEffects.playEnemyLaser();
    }
  }

  private emitBossInfo(): void {
    if (!this.boss) {
      EventBus.emit('boss:update', { active: false, bossKey: '', name: '', currentHp: 0, maxHp: 0, phase: 1, maxPhases: 2 });
      return;
    }
    const info: BossInfo = {
      active: true,
      bossKey: this.bossType,
      name: this.bossNames[this.bossType] || 'SUPREME BATTLECRUISER',
      currentHp: this.bossHp,
      maxHp: this.bossMaxHp,
      phase: this.bossPhase,
      maxPhases: 2,
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
    const isSplash = bullet.getData('splash') || false;

    if (pierce <= 0) {
      bullet.setActive(false).setVisible(false);
      bullet.body.stop();
      bullet.body.enable = false;
    } else {
      bullet.setData('pierce', pierce - 1);
    }

    if (isSplash) {
      this.explosionEmitter.explode(8, bullet.x, bullet.y);
      SoundEffects.playExplosion('small');
    }

    let shield = enemy.getData('shield') || 0;
    if (shield > 0) {
      shield = Math.max(0, shield - damage);
      enemy.setData('shield', shield);
      SoundEffects.playShieldAbsorb();
    } else {
      const currentHp = (enemy.getData('hp') || 1) - damage;
      this.sparkEmitter.explode(6, enemy.x, enemy.y);

      if (currentHp <= 0) {
        this.destroyEnemy(enemy);
      } else {
        enemy.setData('hp', currentHp);
        enemy.setTintFill(0xffffff);
        this.time.delayedCall(60, () => {
          if (enemy.active) enemy.clearTint();
        });
        SoundEffects.playHit();
      }
    }
  }

  private handleBulletAsteroidCollision(bullet: Phaser.Physics.Arcade.Image, asteroid: Phaser.Physics.Arcade.Sprite): void {
    if (!bullet.active || !asteroid.active) return;

    const damage = bullet.getData('damage') || 1;
    bullet.setActive(false).setVisible(false);
    bullet.body.stop();
    bullet.body.enable = false;

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
    bullet.body.enable = false;

    this.bossHp -= damage * 20;
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
    bullet.body.enable = false;

    this.damagePlayer(dmg);
  }

  private handlePlayerEntityCollision(_entity: Phaser.Physics.Arcade.Sprite, dmg: number = 25): void {
    if (!this.isAlive || this.isInvulnerable) return;

    this.damagePlayer(dmg);
    this.sparkEmitter.explode(16, this.player.x, this.player.y);
  }

  private damagePlayer(amount: number): void {
    if (this.isInvulnerable || !this.isAlive) return;

    this.cameras.main.shake(180, 0.012);

    if (this.playerShield > 0) {
      this.playerShield = Math.max(0, this.playerShield - amount * 1.3);
      SoundEffects.playShieldAbsorb();
      this.shieldSprite.setVisible(this.playerShield > 0);
      if (this.playerShield === 0) {
        this.activePowerUps.delete('SHIELD');
      }
    } else {
      this.playerHealth = Math.max(0, this.playerHealth - amount);
      SoundEffects.playHit();
    }

    this.emitStats(true);

    if (this.playerHealth <= 0) {
      this.killPlayer();
      return;
    }

    // Invulnerability flashing
    this.isInvulnerable = true;
    this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 110,
      yoyo: true,
      repeat: 6,
      onComplete: () => {
        if (this.player && this.player.active) {
          this.player.alpha = 1;
          this.isInvulnerable = false;
        }
      },
    });
  }

  // ==========================================
  // KILL COMBO SYSTEM
  // ==========================================
  private incrementCombo(x: number, y: number): void {
    this.combo++;
    this.comboTimer = this.maxComboTimer;

    // Multiplier brackets: 1x -> 2x -> 3x -> 5x -> 8x -> 10x -> 15x -> 20x
    if (this.combo >= 20) this.comboMultiplier = 20;
    else if (this.combo >= 15) this.comboMultiplier = 15;
    else if (this.combo >= 10) this.comboMultiplier = 10;
    else if (this.combo >= 8) this.comboMultiplier = 8;
    else if (this.combo >= 5) this.comboMultiplier = 5;
    else if (this.combo >= 3) this.comboMultiplier = 3;
    else if (this.combo >= 2) this.comboMultiplier = 2;
    else this.comboMultiplier = 1;

    if (this.combo > this.bestCombo) {
      this.bestCombo = this.combo;
      Storage.setBestCombo(this.bestCombo);
    }

    // Milestone celebrations
    if ([3, 5, 8, 10, 15, 20].includes(this.combo)) {
      SoundEffects.playCombo(this.combo);
      this.showFloatingText(`COMBO x${this.comboMultiplier}!`, x, y - 20, '#facc15', '22px');
      this.cameras.main.shake(60, 0.002);
    }
  }

  private resetCombo(): void {
    this.combo = 0;
    this.comboMultiplier = 1;
    this.comboTimer = 0;
  }

  // ==========================================
  // DESTRUCTION & REWARDS
  // ==========================================
  private destroyEnemy(enemy: Phaser.Physics.Arcade.Sprite): void {
    const ex = enemy.x;
    const ey = enemy.y;
    const baseScore = enemy.getData('score') || 100;
    const xpVal = enemy.getData('xp') || 20;

    this.incrementCombo(ex, ey);
    this.addScore(baseScore * this.comboMultiplier, ex, ey);

    this.explosionEmitter.explode(14, ex, ey);
    this.sparkEmitter.explode(18, ex, ey);
    SoundEffects.playExplosion('small');

    // Spawn XP Gem
    this.spawnXpGem(ex, ey, xpVal);

    // Chance to drop power-up (15% standard, 40% elite/reaper)
    const isElite = ['elite', 'bomber', 'reaper'].includes(enemy.getData('type'));
    if (Math.random() < (isElite ? 0.4 : 0.15)) {
      this.spawnPowerUp(ex, ey);
    }

    enemy.destroy();
    this.checkWaveProgress();
  }

  private destroyAsteroid(asteroid: Phaser.Physics.Arcade.Sprite): void {
    const size = asteroid.getData('size');
    const ax = asteroid.x;
    const ay = asteroid.y;
    const baseScore = asteroid.getData('score') || 50;
    const xpVal = asteroid.getData('xp') || 15;

    this.incrementCombo(ax, ay);
    this.addScore(baseScore * this.comboMultiplier, ax, ay);

    this.explosionEmitter.explode(size === 'large' ? 18 : 10, ax, ay);
    SoundEffects.playAsteroidBreak();

    // Splitting Mechanic
    if (size === 'large') {
      this.spawnAsteroid('medium', ax - 20, ay);
      this.spawnAsteroid('medium', ax + 20, ay);
    } else if (size === 'medium') {
      this.spawnAsteroid('small', ax - 14, ay);
      this.spawnAsteroid('small', ax + 14, ay);
    } else {
      this.spawnXpGem(ax, ay, xpVal);
      if (Math.random() < 0.14) {
        this.spawnPowerUp(ax, ay);
      }
    }

    asteroid.destroy();
  }

  private destroyBoss(): void {
    if (!this.boss) return;
    const bx = this.boss.x;
    const by = this.boss.y;

    this.addScore(8000 * this.comboMultiplier, bx, by);
    SoundEffects.playBossExplosion();
    this.cameras.main.shake(800, 0.025);
    this.cameras.main.flash(600, 255, 255, 255);

    // Cascading explosions across hull
    for (let i = 0; i < 8; i++) {
      this.time.delayedCall(i * 120, () => {
        this.explosionEmitter.explode(24, bx + Phaser.Math.Between(-80, 80), by + Phaser.Math.Between(-50, 50));
        this.sparkEmitter.explode(28, bx + Phaser.Math.Between(-80, 80), by + Phaser.Math.Between(-50, 50));
      });
    }

    // Guaranteed big rewards
    this.spawnPowerUp(bx - 40, by);
    this.spawnPowerUp(bx + 40, by);
    this.spawnXpGem(bx, by, 300);

    this.boss.destroy();
    this.boss = null;
    this.emitBossInfo();

    // Advance level after victory fanfare
    this.time.delayedCall(2800, () => {
      this.startLevel(this.currentLevel + 1);
    });
  }

  private checkWaveProgress(): void {
    this.waveEnemiesRemaining--;
    if (this.waveEnemiesRemaining <= 0 && this.waveInProgress && !this.boss) {
      this.waveInProgress = false;
      if (this.waveSpawnTimer) this.waveSpawnTimer.destroy();

      this.time.delayedCall(2000, () => {
        this.startLevel(this.currentLevel + 1);
      });
    }
  }

  // ==========================================
  // XP & LEVEL-UP PROGRESSION
  // ==========================================
  private spawnXpGem(x: number, y: number, value: number): void {
    const gem = this.xpGems.create(x, y, 'xp_gem') as Phaser.Physics.Arcade.Sprite;
    gem.setData('value', value);
    gem.setVelocity(Phaser.Math.Between(-25, 25), Phaser.Math.Between(40, 90));
    gem.setDepth(6);
  }

  private collectXpGem(gem: Phaser.Physics.Arcade.Sprite): void {
    const val = gem.getData('value') || 10;
    gem.destroy();

    this.playerXp += val;
    this.showFloatingText(`+${val} XP`, this.player.x, this.player.y - 10, '#a855f7', '14px');

    if (this.playerXp >= this.nextLevelXp) {
      this.triggerLevelUp();
    }
    this.emitStats();
  }

  private triggerLevelUp(): void {
    this.playerLevel++;
    this.playerXp -= this.nextLevelXp;
    this.nextLevelXp = Math.floor(this.nextLevelXp * 1.45);

    SoundEffects.playLevelUp();
    this.cameras.main.flash(300, 168, 85, 247);

    // Prepare 3 upgrade cards
    const options = this.generateUpgradeOptions();
    this.isLevelUpPaused = true;
    this.physics.pause();

    EventBus.emit('game:levelUp', options);
    this.emitStats(true);
  }

  private generateUpgradeOptions(): LevelUpOption[] {
    const pool: LevelUpOption[] = [
      {
        id: 'weapon_spread',
        title: 'Spread Cannon',
        description: 'Fires wide 5-way energy projectiles across the screen.',
        category: 'weapon',
        rarity: 'rare',
        weaponType: 'SPREAD',
      },
      {
        id: 'weapon_plasma',
        title: 'Plasma Mortar',
        description: 'Heavy piercing plasma orbs with explosive splash impact.',
        category: 'weapon',
        rarity: 'epic',
        weaponType: 'PLASMA',
      },
      {
        id: 'weapon_hyperbeam',
        title: 'Hyperbeam Core',
        description: 'Discharges hyper-dense laser slicing through all targets.',
        category: 'weapon',
        rarity: 'legendary',
        weaponType: 'HYPERBEAM',
      },
      {
        id: 'hull_plating',
        title: 'Nanite Hull Plating',
        description: 'Increases Maximum Health by +25 and heals hull immediately.',
        category: 'hull',
        rarity: 'common',
      },
      {
        id: 'shield_boost',
        title: 'Forcefield Generator',
        description: 'Increases Maximum Shield by +25 and restores shield to 100%.',
        category: 'shield',
        rarity: 'common',
      },
      {
        id: 'thruster_overdrive',
        title: 'Thruster Overdrive',
        description: 'Boosts ship speed and movement agility by +18%.',
        category: 'speed',
        rarity: 'common',
      },
      {
        id: 'damage_matrix',
        title: 'Targeting Matrix',
        description: 'Enhances projectile impact damage across all weapons by +25%.',
        category: 'damage',
        rarity: 'rare',
      },
      {
        id: 'magnet_sensor',
        title: 'Magnetic Harvester',
        description: 'Greatly expands XP and power-up attraction vacuum radius.',
        category: 'utility',
        rarity: 'common',
      },
    ];

    Phaser.Utils.Array.Shuffle(pool);
    return pool.slice(0, 3);
  }

  private applyUpgrade(option: LevelUpOption): void {
    if (option.category === 'weapon' && option.weaponType) {
      this.weaponType = option.weaponType;
    } else if (option.id === 'hull_plating') {
      this.maxHealth += 25;
      this.playerHealth = Math.min(this.maxHealth, this.playerHealth + 35);
    } else if (option.id === 'shield_boost') {
      this.maxShield += 25;
      this.playerShield = this.maxShield;
      this.shieldSprite.setVisible(true);
    } else if (option.id === 'thruster_overdrive') {
      this.basePlayerSpeed += 40;
    } else if (option.id === 'damage_matrix') {
      this.damageMultiplier += 0.25;
    } else if (option.id === 'magnet_sensor') {
      this.magnetRadius += 80;
    }

    this.showFloatingText(`UPGRADE: ${option.title}`, this.player.x, this.player.y - 25, '#22c55e', '18px');
    this.emitStats(true);
  }

  // ==========================================
  // MAGNET SENSOR VACUUM
  // ==========================================
  private updateMagnetPull(dt: number): void {
    if (!this.player || !this.player.active) return;
    const px = this.player.x;
    const py = this.player.y;

    // Pull XP gems
    this.xpGems.children.each((child) => {
      const g = child as Phaser.Physics.Arcade.Sprite;
      if (!g.active) return null;
      const dist = Phaser.Math.Distance.Between(g.x, g.y, px, py);
      if (dist < this.magnetRadius) {
        const angle = Phaser.Math.Angle.Between(g.x, g.y, px, py);
        const speed = 400 + (1 - dist / this.magnetRadius) * 250;
        g.x += Math.cos(angle) * speed * dt;
        g.y += Math.sin(angle) * speed * dt;
      }
      return null;
    });

    // Pull Power-Ups
    this.powerUps.children.each((child) => {
      const p = child as Phaser.Physics.Arcade.Sprite;
      if (!p.active) return null;
      const dist = Phaser.Math.Distance.Between(p.x, p.y, px, py);
      if (dist < this.magnetRadius * 0.8) {
        const angle = Phaser.Math.Angle.Between(p.x, p.y, px, py);
        p.x += Math.cos(angle) * 350 * dt;
        p.y += Math.sin(angle) * 350 * dt;
      }
      return null;
    });
  }

  // ==========================================
  // POWER-UPS
  // ==========================================
  private spawnPowerUp(x: number, y: number): void {
    const types: PowerUpType[] = [
      'SHIELD',
      'RAPID_FIRE',
      'DOUBLE_DAMAGE',
      'SPREAD_SHOT',
      'PLASMA_CANNON',
      'HYPERBEAM',
      'SLOW_MO',
      'NUKE',
      'HEALTH',
    ];
    const selected = Phaser.Utils.Array.GetRandom(types);
    const keyMap: Record<string, string> = {
      SHIELD: 'powerup_shield',
      RAPID_FIRE: 'powerup_rapid',
      DOUBLE_DAMAGE: 'powerup_damage',
      SPREAD_SHOT: 'powerup_spread',
      PLASMA_CANNON: 'powerup_plasma',
      HYPERBEAM: 'powerup_hyperbeam',
      SLOW_MO: 'powerup_slowmo',
      NUKE: 'powerup_nuke',
      HEALTH: 'powerup_health',
    };

    const texture = keyMap[selected] || 'powerup_shield';
    const p = this.powerUps.create(x, y, texture) as Phaser.Physics.Arcade.Sprite;
    p.setData('type', selected);
    p.setVelocity(0, 95);
    p.setDepth(6);

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
        this.showFloatingText('+35 HULL REPAIR', this.player.x, this.player.y, '#22c55e');
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
        this.showFloatingText('DAMAGE OVERDRIVE', this.player.x, this.player.y, '#ec4899');
        this.activePowerUps.set('DOUBLE_DAMAGE', { type, endTime: now + 12000, duration: 12000 });
        break;

      case 'SPREAD_SHOT':
        this.showFloatingText('SPREAD CANNON', this.player.x, this.player.y, '#fb923c');
        this.activePowerUps.set('SPREAD_SHOT', { type, endTime: now + 14000, duration: 14000 });
        break;

      case 'PLASMA_CANNON':
        this.showFloatingText('PLASMA CANNON', this.player.x, this.player.y, '#00f0ff');
        this.activePowerUps.set('PLASMA_CANNON', { type, endTime: now + 12000, duration: 12000 });
        break;

      case 'HYPERBEAM':
        this.showFloatingText('HYPERBEAM ACTIVATED', this.player.x, this.player.y, '#38bdf8');
        this.activePowerUps.set('HYPERBEAM', { type, endTime: now + 10000, duration: 10000 });
        break;

      case 'SLOW_MO':
        this.isSlowMo = true;
        this.slowMoEndTime = now + 8000;
        this.showFloatingText('CHRONO SHIFT', this.player.x, this.player.y, '#38bdf8');
        this.cameras.main.flash(200, 56, 189, 248);
        this.activePowerUps.set('SLOW_MO', { type, endTime: now + 8000, duration: 8000 });
        break;

      case 'NUKE':
        this.triggerNuke();
        break;
    }

    this.emitStats(true);
  }

  private triggerNuke(): void {
    this.cameras.main.flash(600, 255, 255, 255);
    this.cameras.main.shake(600, 0.03);
    SoundEffects.playBossExplosion();

    this.showFloatingText('ELECTROMAGNETIC NUKE!', this.scale.width / 2, this.scale.height / 2, '#f43f5e', '28px');

    // Destroy all regular enemies on screen
    this.enemies.children.each((child) => {
      const e = child as Phaser.Physics.Arcade.Sprite;
      if (e.active) {
        this.explosionEmitter.explode(16, e.x, e.y);
        this.destroyEnemy(e);
      }
      return null;
    });

    // Destroy all asteroids on screen
    this.asteroids.children.each((child) => {
      const a = child as Phaser.Physics.Arcade.Sprite;
      if (a.active) {
        this.explosionEmitter.explode(14, a.x, a.y);
        this.destroyAsteroid(a);
      }
      return null;
    });
  }

  private updatePowerUps(now: number): void {
    let changed = false;
    this.activePowerUps.forEach((item, key) => {
      if (now > item.endTime) {
        this.activePowerUps.delete(key);
        changed = true;
      }
    });
    if (changed) {
      this.emitStats(true);
    }
  }

  // ==========================================
  // SCORE & FLOATING UI TEXT
  // ==========================================
  private addScore(amount: number, x: number, y: number): void {
    this.score += amount;
    this.showFloatingText(`+${amount}`, x, y, '#00f0ff');
  }

  private showFloatingText(
    text: string,
    x: number,
    y: number,
    color: string,
    size: string = '18px'
  ): void {
    const txt = this.add.text(x, y, text, {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: size,
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

    Storage.setBestSurvivalTime(this.survivalTime);

    this.time.delayedCall(1200, () => {
      EventBus.emit('game:over', {
        score: this.score,
        wave: this.currentLevel,
        bestCombo: this.bestCombo,
        survivalTime: this.survivalTime,
      });
    });
  }

  private emitStats(force: boolean = false): void {
    const now = this.time.now;
    const powerUpsList = Array.from(this.activePowerUps.values()).map((p) => ({
      type: p.type,
      duration: Math.max(0, (p.endTime - now) / 1000),
      maxDuration: p.duration / 1000,
    }));

    const stats: Partial<PlayerStats> = {
      score: this.score,
      health: this.playerHealth,
      maxHealth: this.maxHealth,
      shield: this.playerShield,
      maxShield: this.maxShield,
      wave: this.currentLevel,
      level: this.playerLevel,
      xp: this.playerXp,
      nextLevelXp: this.nextLevelXp,
      combo: this.combo,
      comboMultiplier: this.comboMultiplier,
      comboTimer: this.comboTimer,
      survivalTime: this.survivalTime,
      activeWeapon: this.weaponType,
      activePowerUps: powerUpsList,
    };

    EventBus.emit('stats:update', stats);
  }
}
