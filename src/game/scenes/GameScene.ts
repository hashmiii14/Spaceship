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
  Mission,
} from '../../types/game';
import { getSectorForSurvivalTime, SectorConfig, SECTORS } from '../config/LevelConfig';

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
  private basePlayerSpeed = 360;
  private playerSpeed = 360;
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
  private currentSectorId = 1;
  private maxLevelReached = 1;
  private levelNames = [
    'AWAKENING',
    'DEEP SPACE',
    'METEOR STORM',
    'ALIEN FRONT',
    'VOID ZONE',
    'NEBULA CORE',
    'FINAL SECTOR',
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

  // Missions System
  private missions: Mission[] = [
    {
      id: 'm1',
      title: 'ELIMINATE 25 HOSTILES',
      description: 'Destroy alien scout & interceptor craft',
      progress: 0,
      target: 25,
      completed: false,
      rewardText: '+1,500 SCORE | +60 XP',
    },
    {
      id: 'm2',
      title: 'CHAIN x5 KILL COMBO',
      description: 'Eliminate hostiles within 2.5 seconds',
      progress: 0,
      target: 5,
      completed: false,
      rewardText: '+2,500 SCORE | +90 XP',
    },
    {
      id: 'm3',
      title: 'SURVIVE 90 SECONDS',
      description: 'Withstand persistent galactic waves',
      progress: 0,
      target: 90,
      completed: false,
      rewardText: '+3,500 SCORE | +120 XP',
    },
    {
      id: 'm4',
      title: 'COLLECT 4 POWER-UPS',
      description: 'Salvage combat weapon & shield orbs',
      progress: 0,
      target: 4,
      completed: false,
      rewardText: '+3,000 SCORE | +100 XP',
    },
    {
      id: 'm5',
      title: 'DEFEAT SECTOR BOSS',
      description: 'Destroy capital flagship in Sector 4 or 6',
      progress: 0,
      target: 1,
      completed: false,
      rewardText: '+8,000 SCORE | +300 XP',
    },
  ];
  private currentMissionIndex = 0;

  // Controls
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyS!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private keySpace!: Phaser.Input.Keyboard.Key;
  private keyEsc!: Phaser.Input.Keyboard.Key;
  private mobileInput = { x: 0, y: 0, shoot: false };

  // Weapons & Bullets (RED WEAPON POOLS)
  private lastFiredTime = 0;
  private baseFireRate = 200; // ms
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
  private bossGroup!: Phaser.Physics.Arcade.Group;
  private boss: Phaser.Physics.Arcade.Sprite | null = null;
  private bossHp = 0;
  private bossMaxHp = 3200;
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

  // FX (Red Muzzle Flash & Red Sparks & Shrapnel)
  private redMuzzleEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private redSparkEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private cyanSparkEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private explosionEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private shrapnelEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;

  // Throttling
  private lastStatsEmitTime = 0;
  private nextEventTime = 75; // next special event time in seconds

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
    this.basePlayerSpeed = 480;
    this.playerSpeed = 480;
    this.weaponType = 'BLASTER';
    this.damageMultiplier = 1.0;
    this.fireRateBonus = 0;
    this.magnetRadius = 140;
    this.activePowerUps.clear();
    this.enemyMines = [];
    this.isSlowMo = false;
    this.currentMissionIndex = 0;
    this.nextEventTime = 75;

    // 1. Lightweight Particle Systems (Optimized for 60 FPS)
    this.redMuzzleEmitter = this.add.particles(0, 0, 'muzzle_flash_red', {
      scale: { start: 1.0, end: 0.1 },
      alpha: { start: 1, end: 0 },
      lifespan: 100,
      blendMode: Phaser.BlendModes.ADD,
      emitting: false,
    });
    this.redMuzzleEmitter.setDepth(14);

    this.redSparkEmitter = this.add.particles(0, 0, 'spark_red', {
      speed: { min: 80, max: 220 },
      scale: { start: 1.1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 200,
      blendMode: Phaser.BlendModes.ADD,
      emitting: false,
    });
    this.redSparkEmitter.setDepth(15);

    this.cyanSparkEmitter = this.add.particles(0, 0, 'spark', {
      speed: { min: 60, max: 180 },
      scale: { start: 1.0, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 200,
      blendMode: Phaser.BlendModes.ADD,
      emitting: false,
    });
    this.cyanSparkEmitter.setDepth(15);

    this.explosionEmitter = this.add.particles(0, 0, 'smoke', {
      speed: { min: 30, max: 180 },
      scale: { start: 0.6, end: 1.8 },
      alpha: { start: 0.7, end: 0 },
      lifespan: 420,
      blendMode: Phaser.BlendModes.SCREEN,
      emitting: false,
    });
    this.explosionEmitter.setDepth(15);

    this.shrapnelEmitter = this.add.particles(0, 0, 'shrapnel_shard', {
      speed: { min: 140, max: 280 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.0, end: 0.2 },
      alpha: { start: 1.0, end: 0 },
      lifespan: { min: 280, max: 500 },
      blendMode: Phaser.BlendModes.ADD,
      emitting: false,
    });
    this.shrapnelEmitter.setDepth(16);

    // 2. Physics Groups (Reusable Pools)
    this.playerBullets = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      maxSize: 120,
      runChildUpdate: false,
    });

    this.enemyBullets = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      maxSize: 80,
      runChildUpdate: false,
    });

    this.bossBullets = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      maxSize: 60,
      runChildUpdate: false,
    });

    this.bossGroup = this.physics.add.group();
    this.enemies = this.physics.add.group();
    this.asteroids = this.physics.add.group();
    this.powerUps = this.physics.add.group();
    this.xpGems = this.physics.add.group();

    // 3. Player Setup (Agile Combat Starfighter)
    const skin = Storage.getSkin();
    const skinKey = `player_ship_${skin.id.toLowerCase()}`;
    const initialSkin = this.textures.exists(skinKey) ? skinKey : 'player_ship';

    this.player = this.physics.add.sprite(width / 2, height - 100, initialSkin);
    this.player.setCollideWorldBounds(true);
    this.player.setDrag(1800, 1800);
    this.player.setMaxVelocity(620, 620);
    this.player.setSize(44, 48);
    this.player.setOffset(10, 12);
    this.player.setDepth(10);

    // Player Engine Thruster
    this.playerEngineParticles = this.add.particles(0, 0, 'engine_glow', {
      speedY: { min: 140, max: 280 },
      speedX: { min: -20, max: 20 },
      scale: { start: 1.1, end: 0.1 },
      alpha: { start: 0.9, end: 0 },
      lifespan: 200,
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

    // 5. Collisions & Overlaps (with active object filtering to skip dead pooled entities)
    const isActiveObj = (a: any, b: any) => Boolean(a && a.active && b && b.active);

    // Player Bullets -> Enemies
    this.physics.add.overlap(this.playerBullets, this.enemies, (bullet, enemy) => {
      this.handleBulletEnemyCollision(bullet as Phaser.Physics.Arcade.Image, enemy as Phaser.Physics.Arcade.Sprite);
    }, isActiveObj, this);

    // Player Bullets -> Asteroids
    this.physics.add.overlap(this.playerBullets, this.asteroids, (bullet, asteroid) => {
      this.handleBulletAsteroidCollision(bullet as Phaser.Physics.Arcade.Image, asteroid as Phaser.Physics.Arcade.Sprite);
    }, isActiveObj, this);

    // Player Bullets -> Boss (Reliable Boss Collisions)
    this.physics.add.overlap(this.playerBullets, this.bossGroup, (bullet, boss) => {
      this.handleBulletBossCollision(bullet as Phaser.Physics.Arcade.Image, boss as Phaser.Physics.Arcade.Sprite);
    }, isActiveObj, this);

    // Enemy Bullets -> Player
    this.physics.add.overlap(this.enemyBullets, this.player, (_p, bullet) => {
      this.handleEnemyBulletPlayerCollision(bullet as Phaser.Physics.Arcade.Image, 15);
    }, isActiveObj, this);

    // Boss Bullets -> Player
    this.physics.add.overlap(this.bossBullets, this.player, (_p, bullet) => {
      this.handleEnemyBulletPlayerCollision(bullet as Phaser.Physics.Arcade.Image, 25);
    }, isActiveObj, this);

    // Player -> Enemies (Ramming)
    this.physics.add.overlap(this.player, this.enemies, (_p, enemy) => {
      this.handlePlayerEntityCollision(enemy as Phaser.Physics.Arcade.Sprite, 30);
    }, isActiveObj, this);

    // Player -> Asteroids (Collision)
    this.physics.add.overlap(this.player, this.asteroids, (_p, asteroid) => {
      this.handlePlayerEntityCollision(asteroid as Phaser.Physics.Arcade.Sprite, 25);
    }, isActiveObj, this);

    // Player -> Boss (Ramming)
    this.physics.add.overlap(this.player, this.bossGroup, (_p, boss) => {
      this.handlePlayerEntityCollision(boss as Phaser.Physics.Arcade.Sprite, 40);
    }, isActiveObj, this);

    // Player -> PowerUps
    this.physics.add.overlap(this.player, this.powerUps, (_p, powerUp) => {
      this.collectPowerUp(powerUp as Phaser.Physics.Arcade.Sprite);
    }, isActiveObj, this);

    // Player -> XP Gems
    this.physics.add.overlap(this.player, this.xpGems, (_p, gem) => {
      this.collectXpGem(gem as Phaser.Physics.Arcade.Sprite);
    }, isActiveObj, this);

    // 6. External Event Listeners with Safe Shutdown Cleanup
    const onMobileMove = (dir: { x: number; y: number }) => {
      this.mobileInput.x = dir.x;
      this.mobileInput.y = dir.y;
    };
    const onMobileShoot = (shooting: boolean) => {
      this.mobileInput.shoot = shooting;
    };
    const onUpgrade = (option: LevelUpOption) => {
      this.applyUpgrade(option);
      this.isLevelUpPaused = false;
      this.physics.resume();
    };
    const onSkinChanged = (newSkinId: string) => {
      const key = `player_ship_${newSkinId.toLowerCase()}`;
      if (this.textures.exists(key) && this.player && this.player.active) {
        this.player.setTexture(key);
      }
    };

    EventBus.on('input:mobileMove', onMobileMove);
    EventBus.on('input:mobileShoot', onMobileShoot);
    EventBus.on('upgrade:selected', onUpgrade);
    EventBus.on('player:skinChanged', onSkinChanged);

    this.events.once('shutdown', () => {
      EventBus.off('input:mobileMove', onMobileMove);
      EventBus.off('input:mobileShoot', onMobileShoot);
      EventBus.off('upgrade:selected', onUpgrade);
      EventBus.off('player:skinChanged', onSkinChanged);
      if (this.waveSpawnTimer) {
        this.waveSpawnTimer.destroy();
        this.waveSpawnTimer = null;
      }
    });

    // 7. Responsive Window Resize Handler
    this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      if (this.player && this.player.active) {
        this.player.x = Phaser.Math.Clamp(this.player.x, 35, gameSize.width - 35);
        this.player.y = Phaser.Math.Clamp(this.player.y, 45, gameSize.height - 45);
      }
    });

    if (this.game.canvas) {
      this.game.canvas.focus();
    }

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

    // Natural Timed Sector Progression (Config-driven, seamless, 0 resets)
    const activeSector = getSectorForSurvivalTime(this.survivalTime);
    if (activeSector.id !== this.currentSectorId && !this.boss) {
      this.transitionToSector(activeSector, true);
    }

    // Check time-based missions
    this.checkTimeMissions();

    // Check cinematic events (Warp Drive every ~90s)
    if (this.survivalTime >= this.nextEventTime) {
      this.nextEventTime += 95;
      this.triggerCinematicWarp();
    }

    // 2. Kill Combo Decay
    if (this.combo > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.resetCombo();
      }
    }

    // 3. Player Movement (Fast, Ultra-Smooth, Responsive Handling)
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
      const targetVx = (vx / norm) * this.playerSpeed;
      const targetVy = (vy / norm) * this.playerSpeed;
      const smoothFactor = Math.min(1, dt * 22);
      this.player.setVelocity(
        Phaser.Math.Linear(this.player.body.velocity.x, targetVx, smoothFactor),
        Phaser.Math.Linear(this.player.body.velocity.y, targetVy, smoothFactor)
      );
    } else {
      // Instant responsive deceleration with dt-damping
      const decay = Math.pow(0.06, dt);
      this.player.setVelocity(this.player.body.velocity.x * decay, this.player.body.velocity.y * decay);
    }

    // Banking roll & pitch compression animation
    const targetRotation = Phaser.Math.Clamp(vx, -1, 1) * 0.22;
    this.player.rotation = Phaser.Math.Linear(this.player.rotation, targetRotation, 0.16);
    const targetScaleY = 1.0 - Math.abs(vy) * 0.08;
    this.player.scaleY = Phaser.Math.Linear(this.player.scaleY, targetScaleY, 0.16);

    // Dynamic engine exhaust modulation
    if (this.playerEngineParticles) {
      if (vy < -0.2) {
        this.playerEngineParticles.setParticleSpeed(Phaser.Math.Between(-25, 25), Phaser.Math.Between(260, 420));
      } else if (vy > 0.2) {
        this.playerEngineParticles.setParticleSpeed(Phaser.Math.Between(-15, 15), Phaser.Math.Between(80, 160));
      } else {
        this.playerEngineParticles.setParticleSpeed(Phaser.Math.Between(-20, 20), Phaser.Math.Between(140, 280));
      }
    }

    // Parallax background drift
    this.game.events.emit('background:setDrift', vx);

    // Shield follow
    if (this.shieldSprite && this.shieldSprite.visible) {
      this.shieldSprite.setPosition(this.player.x, this.player.y);
      this.shieldSprite.rotation += dt * 1.5;
    }

    // 4. Shooting (Immediate response, holding Spacebar continuous fire)
    const isSpaceDown = (this.keySpace && this.keySpace.isDown) ||
      (this.input.keyboard && this.input.keyboard.checkDown(this.keySpace));
    const isShooting = isSpaceDown || this.mobileInput.shoot;
    const hasRapid = this.activePowerUps.has('RAPID_FIRE');
    const calculatedFireRate = Math.max(50, (hasRapid ? 75 : this.baseFireRate) - this.fireRateBonus);

    if (isShooting && time > this.lastFiredTime + calculatedFireRate) {
      this.firePlayerWeapon();
      this.lastFiredTime = time;
    }

    // 5. Magnet Sensor - Pull XP and PowerUps
    this.updateMagnetPull(dt);

    // 6. Slow Motion Check
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
    if (time - this.lastStatsEmitTime > 85) {
      this.lastStatsEmitTime = time;
      this.emitStats();
    }
  }

  // ==========================================
  // PROGRESSIVE SPEED MODEL (CONTROLLED 4-TIER MODEL)
  // ==========================================
  private updateProgressiveSpeed(): void {
    // 0-30s: 480 px/s (1.0x base)
    // 30-60s: 520 px/s (1.083x)
    // 60-120s: 560 px/s (1.167x)
    // 120s+: 600 px/s (1.25x OVERDRIVE)
    let speedMult = 1.0;
    if (this.survivalTime > 120) {
      speedMult = 1.25;
    } else if (this.survivalTime > 60) {
      speedMult = 1.167 + ((this.survivalTime - 60) / 60) * 0.083;
    } else if (this.survivalTime > 30) {
      speedMult = 1.0 + ((this.survivalTime - 30) / 30) * 0.083;
    }

    this.playerSpeed = this.basePlayerSpeed * speedMult;
    this.player.setMaxVelocity(this.playerSpeed, this.playerSpeed);
    this.game.events.emit('background:setSpeedMultiplier', speedMult);
  }

  private triggerCinematicWarp(): void {
    this.game.events.emit('background:triggerWarp', 4000);
    this.showFloatingText('WARP DRIVE ENGAGED', this.scale.width / 2, this.scale.height / 3, '#ff0055', '26px');
    this.cameras.main.shake(300, 0.008);
  }

  // ==========================================
  // BULLET POOLING HELPERS (UNBREAKABLE RECYCLING)
  // ==========================================
  private spawnPlayerBullet(x: number, y: number, key: string): Phaser.Physics.Arcade.Image {
    let b = this.playerBullets.get(x, y, key) as Phaser.Physics.Arcade.Image;
    if (!b) {
      const oldest = this.playerBullets.getFirstAlive() as Phaser.Physics.Arcade.Image;
      if (oldest) b = oldest;
    }
    if (b) {
      b.setTexture(key);
      b.body.reset(x, y);
      b.body.enable = true;
      b.setActive(true).setVisible(true);
      b.setAlpha(1);
    }
    return b;
  }

  private spawnEnemyBullet(x: number, y: number, key: string = 'laser_enemy'): Phaser.Physics.Arcade.Image {
    let b = this.enemyBullets.get(x, y, key) as Phaser.Physics.Arcade.Image;
    if (!b) {
      const oldest = this.enemyBullets.getFirstAlive() as Phaser.Physics.Arcade.Image;
      if (oldest) b = oldest;
    }
    if (b) {
      b.setTexture(key);
      b.body.reset(x, y);
      b.body.enable = true;
      b.setActive(true).setVisible(true);
    }
    return b;
  }

  private spawnBossBullet(x: number, y: number, key: string = 'boss_bullet'): Phaser.Physics.Arcade.Image {
    let b = this.bossBullets.get(x, y, key) as Phaser.Physics.Arcade.Image;
    if (!b) {
      const oldest = this.bossBullets.getFirstAlive() as Phaser.Physics.Arcade.Image;
      if (oldest) b = oldest;
    }
    if (b) {
      b.setTexture(key);
      b.body.reset(x, y);
      b.body.enable = true;
      b.setActive(true).setVisible(true);
    }
    return b;
  }

  // ==========================================
  // SIGNATURE BRIGHT NEON RED WEAPONS
  // ==========================================
  private firePlayerWeapon(): void {
    const x = this.player.x;
    const y = this.player.y - 24;

    const hasDoubleDamage = this.activePowerUps.has('DOUBLE_DAMAGE');
    const hasSpread = this.activePowerUps.has('SPREAD_SHOT') || this.weaponType === 'SPREAD_SHOT';
    const hasHyperbeam = this.activePowerUps.has('HYPERBEAM') || this.weaponType === 'HYPERBEAM';
    const hasPlasma = this.activePowerUps.has('PLASMA_CANNON') || this.weaponType === 'PLASMA_CANNON';

    const dmg = (hasDoubleDamage ? 2.5 : 1.0) * this.damageMultiplier;

    // Trigger crisp red muzzle flash at wingtips
    this.redMuzzleEmitter.explode(1, x - 14, y);
    this.redMuzzleEmitter.explode(1, x + 14, y);

    if (hasHyperbeam) {
      // Continuous Blinding Crimson Hyperbeam
      const beam = this.spawnPlayerBullet(x, y, 'laser_hyperbeam');
      if (beam) {
        beam.setData('damage', 5.0 * dmg);
        beam.setData('pierce', 99);
        beam.setVelocity(0, -980);
      }
      SoundEffects.playHyperbeam();
    } else if (hasPlasma) {
      // Thermonuclear Red Plasma Orb
      const orb = this.spawnPlayerBullet(x, y, 'laser_plasma');
      if (orb) {
        orb.setData('damage', 4.5 * dmg);
        orb.setData('pierce', 1);
        orb.setData('splash', true);
        orb.setVelocity(0, -720);
      }
      SoundEffects.playPlasma();
    } else if (hasSpread) {
      // 5-way Blazing Crimson Spread
      const angles = [-24, -12, 0, 12, 24];
      angles.forEach((deg) => {
        const rad = Phaser.Math.DegToRad(deg - 90);
        const b = this.spawnPlayerBullet(x, y, 'laser_spread');
        if (b) {
          b.setData('damage', 1.25 * dmg);
          b.setRotation(Phaser.Math.DegToRad(deg));
          b.setVelocity(Math.cos(rad) * 720, Math.sin(rad) * 720);
        }
      });
      SoundEffects.playLaser('spread');
    } else if (this.weaponType === 'TRIPLE_SHOT' || this.activePowerUps.has('TRIPLE_SHOT')) {
      // 3-way Branching Crimson Lasers
      const angles = [-15, 0, 15];
      angles.forEach((deg) => {
        const rad = Phaser.Math.DegToRad(deg - 90);
        const b = this.spawnPlayerBullet(x, y, 'laser_triple');
        if (b) {
          b.setData('damage', 1.35 * dmg);
          b.setRotation(Phaser.Math.DegToRad(deg));
          b.setVelocity(Math.cos(rad) * 700, Math.sin(rad) * 700);
        }
      });
      SoundEffects.playLaser('triple');
    } else if (this.weaponType === 'DOUBLE_SHOT') {
      // Dual Heavy Crimson Rods
      [-14, 14].forEach((offset) => {
        const b = this.spawnPlayerBullet(x + offset, y, 'laser_double');
        if (b) {
          b.setData('damage', 1.5 * dmg);
          b.setVelocity(0, -740);
        }
      });
      SoundEffects.playLaser('heavy');
    } else {
      // Standard Bright Neon Red Energy Blaster
      [-10, 10].forEach((offset) => {
        const b = this.spawnPlayerBullet(x + offset, y, 'laser_blaster');
        if (b) {
          b.setData('damage', 1.0 * dmg);
          b.setVelocity(0, -720);
        }
      });
      SoundEffects.playLaser('normal');
    }
  }

  private cleanupBullets(): void {
    const { width, height } = this.scale;
    const pBullets = this.playerBullets.getChildren();
    for (let i = 0; i < pBullets.length; i++) {
      const b = pBullets[i] as Phaser.Physics.Arcade.Image;
      if (b.active && (b.y < -40 || b.y > height + 40 || b.x < -40 || b.x > width + 40)) {
        b.setActive(false).setVisible(false);
        b.body.stop();
        b.body.enable = false;
      }
    }

    const eBullets = this.enemyBullets.getChildren();
    for (let i = 0; i < eBullets.length; i++) {
      const b = eBullets[i] as Phaser.Physics.Arcade.Image;
      if (b.active && (b.y > height + 50 || b.y < -50 || b.x < -50 || b.x > width + 50)) {
        b.setActive(false).setVisible(false);
        b.body.stop();
        b.body.enable = false;
      }
    }

    const bBullets = this.bossBullets.getChildren();
    for (let i = 0; i < bBullets.length; i++) {
      const b = bBullets[i] as Phaser.Physics.Arcade.Image;
      if (b.active && (b.y > height + 60 || b.y < -60 || b.x < -60 || b.x > width + 60)) {
        b.setActive(false).setVisible(false);
        b.body.stop();
        b.body.enable = false;
      }
    }
  }

  // ==========================================
  // LEVEL & SECTOR PROGRESSION (7 SECTORS)
  // ==========================================
  private transitionToSector(sector: SectorConfig, showNotification: boolean = true): void {
    this.currentSectorId = sector.id;
    this.currentLevel = sector.id;
    if (sector.id > this.maxLevelReached) {
      this.maxLevelReached = sector.id;
      Storage.setBestLevel(sector.id);
    }
    this.waveInProgress = true;

    this.game.events.emit('background:setLevel', sector.id);
    this.game.events.emit('background:setSpeedMultiplier', sector.starSpeedMult);
    this.game.events.emit('background:event', sector.signatureEvent);
    EventBus.emit('wave:start', sector.id);

    if (showNotification) {
      SoundEffects.playLevelUp();
      this.showLevelBanner(`SECTOR 0${sector.id} // ${sector.codename}`);
    }

    if (sector.bossType) {
      this.triggerBossEncounter(sector.bossType, sector.bossHp || 3500);
      return;
    }

    if (this.waveSpawnTimer) this.waveSpawnTimer.destroy();

    this.waveSpawnTimer = this.time.addEvent({
      delay: sector.enemySpawnInterval,
      callback: () => {
        if (!this.waveInProgress || this.boss) return;
        this.spawnLevelEnemy();
        if (Math.random() < sector.asteroidDensity) {
          this.spawnAsteroid();
        }
      },
      loop: true,
    });
  }

  private startLevel(levelNum: number): void {
    const sector = SECTORS[levelNum - 1] || SECTORS[SECTORS.length - 1];
    this.transitionToSector(sector, true);
  }

  private showLevelBanner(text: string): void {
    const { width, height } = this.scale;
    const banner = this.add.text(width / 2, height / 3, text, {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#ff0055',
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
  // SMART ENEMY AI (6 ARCHETYPES)
  // ==========================================
  private spawnLevelEnemy(): void {
    const width = this.scale.width;
    const x = Phaser.Math.Between(40, width - 40);
    const y = -40;

    const activeSector = getSectorForSurvivalTime(this.survivalTime);
    const type = Phaser.Utils.Array.GetRandom(activeSector.enemyPool) || 'scout';

    this.createEnemy(type, x, y);
  }

  private createEnemy(type: string, x: number, y: number): Phaser.Physics.Arcade.Sprite {
    const key = `enemy_${type}`;
    let enemy = this.enemies.getFirstDead(false) as Phaser.Physics.Arcade.Sprite | null;
    if (enemy) {
      enemy.setTexture(key);
      enemy.body.reset(x, y);
      enemy.body.enable = true;
      enemy.setActive(true).setVisible(true);
      enemy.setAlpha(1);
      enemy.clearTint();
    } else {
      enemy = this.enemies.create(x, y, key) as Phaser.Physics.Arcade.Sprite;
    }
    enemy.setData('type', type);
    enemy.setDepth(8);

    const diff = 1 + (this.currentLevel - 1) * 0.16;

    switch (type) {
      case 'scout':
        enemy.setData('hp', Math.floor(1 * diff));
        enemy.setData('score', 120);
        enemy.setData('xp', 15);
        enemy.setVelocity(0, 180 * diff);
        enemy.setData('sineOffset', Math.random() * 10);
        break;

      case 'interceptor':
        enemy.setData('hp', Math.floor(2 * diff));
        enemy.setData('score', 190);
        enemy.setData('xp', 25);
        enemy.setVelocity(0, 250 * diff);
        enemy.setData('diveTimer', 0);
        break;

      case 'tank':
        enemy.setData('hp', Math.floor(9 * diff));
        enemy.setData('score', 480);
        enemy.setData('xp', 65);
        enemy.setVelocity(0, 75 * diff);
        enemy.setData('shootTimer', 0);
        break;

      case 'shooter':
        enemy.setData('hp', Math.floor(4 * diff));
        enemy.setData('score', 320);
        enemy.setData('xp', 40);
        enemy.setVelocity(0, 115 * diff);
        enemy.setData('targetY', Phaser.Math.Between(90, 240));
        enemy.setData('shootTimer', 0);
        break;

      case 'bomber':
        enemy.setData('hp', Math.floor(5 * diff));
        enemy.setData('score', 400);
        enemy.setData('xp', 55);
        enemy.setVelocity(Phaser.Math.Between(-50, 50), 95 * diff);
        enemy.setData('mineTimer', 0);
        break;

      case 'elite':
        enemy.setData('hp', Math.floor(13 * diff));
        enemy.setData('shield', Math.floor(6 * diff));
        enemy.setData('score', 850);
        enemy.setData('xp', 110);
        enemy.setVelocity(110 * (Math.random() < 0.5 ? 1 : -1), 85 * diff);
        enemy.setData('shootTimer', 0);
        break;
    }

    return enemy;
  }

  private updateEnemies(time: number, dt: number): void {
    const { width, height } = this.scale;
    const slowFactor = this.isSlowMo ? 0.5 : 1.0;

    const enemies = this.enemies.getChildren();
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i] as Phaser.Physics.Arcade.Sprite;
      if (!e.active) continue;

      const type = e.getData('type');

      if (type === 'scout') {
        const offset = e.getData('sineOffset') || 0;
        e.x += Math.sin(time * 0.004 + offset) * 2.2 * slowFactor;
      } else if (type === 'interceptor') {
        let diveTimer = (e.getData('diveTimer') || 0) + dt;
        if (diveTimer < 1.4 && this.player && this.player.active) {
          const dx = this.player.x - e.x;
          e.setVelocityX(Phaser.Math.Clamp(dx * 1.6, -170, 170) * slowFactor);
        }
        e.setData('diveTimer', diveTimer);
      } else if (type === 'shooter') {
        const targetY = e.getData('targetY') || 150;
        if (e.y >= targetY) {
          e.setVelocityY(0);
          e.x += Math.sin(time * 0.003) * 1.8 * slowFactor;
        }

        let shootTimer = (e.getData('shootTimer') || 0) + dt * slowFactor;
        if (shootTimer > 1.6) {
          shootTimer = 0;
          const angle = Phaser.Math.Angle.Between(e.x, e.y, this.player.x, this.player.y);
          this.fireEnemyBullet(e.x, e.y + 18, Math.cos(angle) * 320 * slowFactor, Math.sin(angle) * 320 * slowFactor);
        }
        e.setData('shootTimer', shootTimer);
      } else if (type === 'tank') {
        let shootTimer = (e.getData('shootTimer') || 0) + dt * slowFactor;
        if (shootTimer > 2.0) {
          shootTimer = 0;
          this.fireEnemyBullet(e.x - 20, e.y + 25, -35 * slowFactor, 270 * slowFactor);
          this.fireEnemyBullet(e.x + 20, e.y + 25, 35 * slowFactor, 270 * slowFactor);
        }
        e.setData('shootTimer', shootTimer);
      } else if (type === 'bomber') {
        let mineTimer = (e.getData('mineTimer') || 0) + dt * slowFactor;
        if (mineTimer > 2.4) {
          mineTimer = 0;
          this.dropEnemyMine(e.x, e.y + 20);
        }
        e.setData('mineTimer', mineTimer);
      } else if (type === 'elite') {
        if (e.x < 60) e.setVelocityX(120 * slowFactor);
        if (e.x > width - 60) e.setVelocityX(-120 * slowFactor);

        let shootTimer = (e.getData('shootTimer') || 0) + dt * slowFactor;
        if (shootTimer > 1.8) {
          shootTimer = 0;
          const angleToPlayer = Phaser.Math.Angle.Between(e.x, e.y, this.player.x, this.player.y);
          const offsets = [-0.22, 0, 0.22];
          for (let o = 0; o < offsets.length; o++) {
            const rad = angleToPlayer + offsets[o];
            this.fireEnemyBullet(e.x, e.y + 25, Math.cos(rad) * 310 * slowFactor, Math.sin(rad) * 310 * slowFactor);
          }
        }
        e.setData('shootTimer', shootTimer);
      }

      if (e.y > height + 60) {
        e.setActive(false).setVisible(false);
        e.body.stop();
        e.body.enable = false;
        this.checkWaveProgress();
      }
    }
  }

  private fireEnemyBullet(x: number, y: number, vx: number, vy: number): void {
    const b = this.spawnEnemyBullet(x, y, 'laser_enemy');
    if (b) {
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
      m.sprite.setAlpha(0.6 + Math.sin(m.timer * 8) * 0.4);

      if (this.player && this.player.active) {
        const dist = Phaser.Math.Distance.Between(m.sprite.x, m.sprite.y, this.player.x, this.player.y);
        if (dist < 55) {
          this.detonateMine(m, true);
          this.enemyMines.splice(i, 1);
          continue;
        }
      }

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
    this.redSparkEmitter.explode(18, mx, my);
    SoundEffects.playExplosion('small');

    if (hitPlayer) {
      this.damagePlayer(25);
    }

    mine.sprite.destroy();
  }

  // ==========================================
  // ASTEROIDS WITH SPLITTING
  // ==========================================
  private spawnAsteroid(size: 'large' | 'medium' | 'small' = 'large', spawnX?: number, spawnY?: number): void {
    const width = this.scale.width;
    const x = spawnX ?? Phaser.Math.Between(40, width - 40);
    const y = spawnY ?? -50;
    const key = `asteroid_${size}`;

    if (!spawnX && this.asteroids.countActive(true) >= 16) return;

    let ast = this.asteroids.getFirstDead(false) as Phaser.Physics.Arcade.Sprite | null;
    if (ast) {
      ast.setTexture(key);
      ast.body.reset(x, y);
      ast.body.enable = true;
      ast.setActive(true).setVisible(true);
      ast.setAlpha(1);
    } else {
      ast = this.asteroids.create(x, y, key) as Phaser.Physics.Arcade.Sprite;
    }
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
    const asteroids = this.asteroids.getChildren();
    for (let i = 0; i < asteroids.length; i++) {
      const a = asteroids[i] as Phaser.Physics.Arcade.Sprite;
      if (a.active && a.y > height + 60) {
        a.setActive(false).setVisible(false);
        a.body.stop();
        a.body.enable = false;
      }
    }
  }

  // ==========================================
  // 4 UNIQUE BOSS ENCOUNTERS
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
    this.bossGroup.add(this.boss);
    this.boss.setCollideWorldBounds(false);
    this.boss.setDepth(9);

    this.bossHp = this.bossMaxHp;
    this.bossPhase = 1;
    this.bossAttackTimer = 0;
    this.bossMovementDirection = 1;

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

    const moveSpeed = (this.bossPhase === 2 ? 110 : 80) * slowFactor;
    this.boss.x += this.bossMovementDirection * moveSpeed * dt;

    if (this.boss.x < 110) {
      this.boss.x = 110;
      this.bossMovementDirection = 1;
    } else if (this.boss.x > width - 110) {
      this.boss.x = width - 110;
      this.bossMovementDirection = -1;
    }

    this.bossAttackTimer += dt * slowFactor;
    const attackInterval = this.bossPhase === 2 ? 1.1 : 1.7;

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
      for (let i = -2; i <= 2; i++) {
        const rad = Phaser.Math.DegToRad(90 + i * 20);
        const b = this.spawnBossBullet(bx, by + 40, 'boss_bullet');
        if (b) {
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
      const bulletCount = this.bossPhase === 2 ? 10 : 7;
      for (let i = 0; i < bulletCount; i++) {
        const angle = (time * 0.005) + (i * ((Math.PI * 2) / bulletCount));
        const b = this.spawnBossBullet(bx, by + 30, 'boss_bullet');
        if (b) {
          b.setVelocity(Math.cos(angle) * 240, Math.sin(angle) * 240);
        }
      }
      SoundEffects.playEnemyLaser();
    } else if (this.bossType === 'boss_star_eater' || this.bossType === 'boss_galactic_core') {
      for (let i = -3; i <= 3; i++) {
        const rad = Phaser.Math.DegToRad(90 + i * 16);
        const b = this.spawnBossBullet(bx, by + 45, 'boss_bullet_heavy');
        if (b) {
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
  // COLLISIONS & DAMAGE (RED SPARK EFFECTS)
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
      this.cyanSparkEmitter.explode(8, enemy.x, enemy.y);
      SoundEffects.playShieldAbsorb();
    } else {
      const currentHp = (enemy.getData('hp') || 1) - damage;
      this.redSparkEmitter.explode(8, enemy.x, enemy.y);

      if (currentHp <= 0) {
        this.destroyEnemy(enemy);
      } else {
        enemy.setData('hp', currentHp);
        enemy.setTintFill(0xff3366);
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
    this.redSparkEmitter.explode(8, asteroid.x, asteroid.y);

    if (hp <= 0) {
      this.destroyAsteroid(asteroid);
    } else {
      asteroid.setData('hp', hp);
      asteroid.setTintFill(0xff0055);
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
    this.redSparkEmitter.explode(12, bullet.x, bullet.y);

    if (this.bossHp < this.bossMaxHp * 0.5 && this.bossPhase === 1) {
      this.bossPhase = 2;
      this.cameras.main.flash(350, 255, 0, 85);
      this.cameras.main.shake(300, 0.012);
      this.explosionEmitter.explode(22, boss.x, boss.y);
      this.redSparkEmitter.explode(26, boss.x, boss.y);
      this.showFloatingText('CRITICAL OVERCHARGE: PHASE 2', boss.x, boss.y - 45, '#ff0055', '22px');
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
    this.redSparkEmitter.explode(16, this.player.x, this.player.y);
  }

  private damagePlayer(amount: number): void {
    if (this.isInvulnerable || !this.isAlive) return;

    this.cameras.main.shake(180, 0.012);

    if (this.playerShield > 0) {
      this.playerShield = Math.max(0, this.playerShield - amount * 1.3);
      SoundEffects.playShieldAbsorb();
      this.cyanSparkEmitter.explode(12, this.player.x, this.player.y);
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

    this.updateMissionProgress('combo', this.combo);

    if ([3, 5, 8, 10, 15, 20, 25, 30].includes(this.combo)) {
      SoundEffects.playCombo(this.combo);
      let title = `COMBO x${this.comboMultiplier}!`;
      let color = '#ff0055';
      if (this.combo >= 20) {
        title = `GODLIKE STRIKE x${this.comboMultiplier}!`;
        color = '#facc15';
      } else if (this.combo >= 15) {
        title = `UNSTOPPABLE SURGE x${this.comboMultiplier}!`;
        color = '#ec4899';
      } else if (this.combo >= 10) {
        title = `RAMPAGE PROTOCOL x${this.comboMultiplier}!`;
        color = '#f97316';
      } else if (this.combo >= 5) {
        title = `COMBAT SPREE x${this.comboMultiplier}!`;
        color = '#00f0ff';
      }
      this.showFloatingText(title, x, y - 24, color, '22px');
      this.cameras.main.shake(70, 0.003);
    }
  }

  private resetCombo(): void {
    this.combo = 0;
    this.comboMultiplier = 1;
    this.comboTimer = 0;
  }

  // ==========================================
  // MISSIONS SYSTEM
  // ==========================================
  private updateMissionProgress(type: 'kill' | 'combo' | 'time' | 'powerup' | 'boss', value: number): void {
    if (this.currentMissionIndex >= this.missions.length) return;
    const mission = this.missions[this.currentMissionIndex];
    if (mission.completed) return;

    if (mission.id === 'm1' && type === 'kill') {
      mission.progress += value;
    } else if (mission.id === 'm2' && type === 'combo') {
      mission.progress = Math.max(mission.progress, value);
    } else if (mission.id === 'm3' && type === 'time') {
      mission.progress = Math.floor(value);
    } else if (mission.id === 'm4' && type === 'powerup') {
      mission.progress += value;
    } else if (mission.id === 'm5' && type === 'boss') {
      mission.progress += value;
    }

    if (mission.progress >= mission.target) {
      this.completeMission(mission);
    }
  }

  private completeMission(mission: Mission): void {
    mission.completed = true;
    mission.progress = mission.target;

    SoundEffects.playHighScore();
    this.showFloatingText(`MISSION COMPLETED: ${mission.title}!`, this.scale.width / 2, this.scale.height / 2.5, '#22c55e', '22px');

    if (mission.id === 'm1') {
      this.addScore(1500, this.player.x, this.player.y);
      this.playerXp += 60;
    } else if (mission.id === 'm2') {
      this.addScore(2500, this.player.x, this.player.y);
      this.playerXp += 90;
    } else if (mission.id === 'm3') {
      this.addScore(3500, this.player.x, this.player.y);
      this.playerXp += 120;
    } else if (mission.id === 'm4') {
      this.addScore(3000, this.player.x, this.player.y);
      this.playerXp += 100;
    } else if (mission.id === 'm5') {
      this.addScore(8000, this.player.x, this.player.y);
      this.playerXp += 300;
    }

    if (this.playerXp >= this.nextLevelXp) {
      this.triggerLevelUp();
    }

    this.currentMissionIndex++;
    this.emitStats(true);
  }

  private checkTimeMissions(): void {
    this.updateMissionProgress('time', this.survivalTime);
  }

  // ==========================================
  // DESTRUCTION & REWARDS
  // ==========================================
  private createLayeredExplosion(x: number, y: number, isLarge: boolean = false): void {
    // 1. Core Flash (Blinding white/crimson glint)
    if (this.textures.exists('core_flash')) {
      const flash = this.add.image(x, y, 'core_flash');
      flash.setDepth(18);
      flash.setScale(isLarge ? 1.4 : 0.85);
      flash.setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({
        targets: flash,
        scale: isLarge ? 2.2 : 1.4,
        alpha: 0,
        duration: 140,
        onComplete: () => flash.destroy(),
      });
    }

    // 2. Shockwave Ring (Expanding planar ripple)
    if (this.textures.exists('shockwave_ring')) {
      const ring = this.add.image(x, y, 'shockwave_ring');
      ring.setDepth(17);
      ring.setScale(0.2);
      ring.setAlpha(0.95);
      ring.setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({
        targets: ring,
        scale: isLarge ? 2.4 : 1.3,
        alpha: 0,
        duration: isLarge ? 380 : 260,
        ease: 'Power2',
        onComplete: () => ring.destroy(),
      });
    }

    // 3. High-velocity Shrapnel Needle Shards
    if (this.shrapnelEmitter) {
      this.shrapnelEmitter.explode(isLarge ? 10 : 5, x, y);
    }

    // 4. Crimson Sparks & Smoke
    this.redSparkEmitter.explode(isLarge ? 24 : 16, x, y);
    this.explosionEmitter.explode(isLarge ? 20 : 12, x, y);

    if (isLarge) {
      this.cameras.main.shake(200, 0.008);
    }
  }

  private destroyEnemy(enemy: Phaser.Physics.Arcade.Sprite): void {
    const ex = enemy.x;
    const ey = enemy.y;
    const baseScore = enemy.getData('score') || 100;
    const xpVal = enemy.getData('xp') || 20;

    this.incrementCombo(ex, ey);
    this.addScore(baseScore * this.comboMultiplier, ex, ey);
    this.updateMissionProgress('kill', 1);

    const isElite = ['elite', 'bomber', 'reaper'].includes(enemy.getData('type'));
    this.createLayeredExplosion(ex, ey, isElite);
    SoundEffects.playExplosion(isElite ? 'medium' : 'small');

    this.spawnXpGem(ex, ey, xpVal);

    if (Math.random() < (isElite ? 0.4 : 0.15)) {
      this.spawnPowerUp(ex, ey);
    }

    enemy.setActive(false).setVisible(false);
    enemy.body.stop();
    enemy.body.enable = false;
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

    this.createLayeredExplosion(ax, ay, size === 'large');
    SoundEffects.playAsteroidBreak();

    // Fragmentation: Cosmetic tumbling ore chunks
    for (let c = 0; c < 2; c++) {
      const chunkKey = c === 0 ? 'asteroid_chunk_1' : 'asteroid_chunk_2';
      if (this.textures.exists(chunkKey)) {
        const chunk = this.add.image(ax, ay, chunkKey);
        chunk.setDepth(8);
        const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        const dist = Phaser.Math.Between(35, 75);
        this.tweens.add({
          targets: chunk,
          x: ax + Math.cos(angle) * dist,
          y: ay + Math.sin(angle) * dist + 25,
          rotation: Phaser.Math.FloatBetween(-3, 3),
          alpha: { start: 1, to: 0 },
          scale: { start: 1, to: 0.3 },
          duration: Phaser.Math.Between(380, 600),
          ease: 'Power2',
          onComplete: () => chunk.destroy(),
        });
      }
    }

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

    asteroid.setActive(false).setVisible(false);
    asteroid.body.stop();
    asteroid.body.enable = false;
  }

  private destroyBoss(): void {
    if (!this.boss) return;
    const bx = this.boss.x;
    const by = this.boss.y;

    this.addScore(8000 * this.comboMultiplier, bx, by);
    this.updateMissionProgress('boss', 1);

    SoundEffects.playBossExplosion();
    this.cameras.main.shake(800, 0.025);
    this.cameras.main.flash(600, 255, 0, 85);

    for (let i = 0; i < 8; i++) {
      this.time.delayedCall(i * 120, () => {
        this.explosionEmitter.explode(24, bx + Phaser.Math.Between(-80, 80), by + Phaser.Math.Between(-50, 50));
        this.redSparkEmitter.explode(28, bx + Phaser.Math.Between(-80, 80), by + Phaser.Math.Between(-50, 50));
      });
    }

    this.spawnPowerUp(bx - 40, by);
    this.spawnPowerUp(bx + 40, by);
    this.spawnXpGem(bx, by, 300);

    this.bossGroup.clear(true, true);
    this.boss = null;
    this.emitBossInfo();

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
  // XP & LEVEL-UP PROGRESSION (POOLED GEMS)
  // ==========================================
  private spawnXpGem(x: number, y: number, value: number): void {
    if (this.xpGems.countActive(true) >= 40) {
      const oldest = this.xpGems.getFirstAlive() as Phaser.Physics.Arcade.Sprite;
      if (oldest) {
        oldest.setActive(false).setVisible(false);
        oldest.body.stop();
        oldest.body.enable = false;
      }
    }

    let gem = this.xpGems.getFirstDead(false) as Phaser.Physics.Arcade.Sprite | null;
    if (gem) {
      gem.setTexture('xp_gem');
      gem.body.reset(x, y);
      gem.body.enable = true;
      gem.setActive(true).setVisible(true);
      gem.setAlpha(1);
    } else {
      gem = this.xpGems.create(x, y, 'xp_gem') as Phaser.Physics.Arcade.Sprite;
    }

    gem.setData('value', value);
    gem.setVelocity(Phaser.Math.Between(-25, 25), Phaser.Math.Between(40, 90));
    gem.setDepth(6);
  }

  private collectXpGem(gem: Phaser.Physics.Arcade.Sprite): void {
    const val = gem.getData('value') || 10;
    gem.setActive(false).setVisible(false);
    gem.body.stop();
    gem.body.enable = false;

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
    this.cameras.main.flash(300, 255, 0, 85);

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
        description: 'Fires wide 5-way neon red plasma bolts across the screen.',
        category: 'weapon',
        rarity: 'rare',
        weaponType: 'SPREAD_SHOT',
      },
      {
        id: 'weapon_plasma',
        title: 'Plasma Mortar',
        description: 'Thermonuclear crimson plasma orbs with explosive splash impact.',
        category: 'weapon',
        rarity: 'epic',
        weaponType: 'PLASMA_CANNON',
      },
      {
        id: 'weapon_hyperbeam',
        title: 'Hyperbeam Core',
        description: 'Blinding continuous ruby laser slicing through all targets.',
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
        description: 'Increases Maximum Shield by +25 and restores barrier to 100%.',
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

    this.showFloatingText(`UPGRADE: ${option.title}`, this.player.x, this.player.y - 25, '#ff0055', '18px');
    this.emitStats(true);
  }

  // ==========================================
  // MAGNET SENSOR VACUUM
  // ==========================================
  private updateMagnetPull(dt: number): void {
    if (!this.player || !this.player.active) return;
    const px = this.player.x;
    const py = this.player.y;
    const height = this.scale.height;

    const gems = this.xpGems.getChildren();
    for (let i = 0; i < gems.length; i++) {
      const g = gems[i] as Phaser.Physics.Arcade.Sprite;
      if (!g.active) continue;
      if (g.y > height + 60) {
        g.setActive(false).setVisible(false);
        g.body.stop();
        g.body.enable = false;
        continue;
      }
      const dist = Phaser.Math.Distance.Between(g.x, g.y, px, py);
      if (dist < this.magnetRadius) {
        const angle = Phaser.Math.Angle.Between(g.x, g.y, px, py);
        const speed = 400 + (1 - dist / this.magnetRadius) * 250;
        g.x += Math.cos(angle) * speed * dt;
        g.y += Math.sin(angle) * speed * dt;
      }
    }

    const powers = this.powerUps.getChildren();
    for (let i = 0; i < powers.length; i++) {
      const p = powers[i] as Phaser.Physics.Arcade.Sprite;
      if (!p.active) continue;
      if (p.y > height + 60) {
        p.destroy();
        continue;
      }
      const dist = Phaser.Math.Distance.Between(p.x, p.y, px, py);
      if (dist < this.magnetRadius * 0.8) {
        const angle = Phaser.Math.Angle.Between(p.x, p.y, px, py);
        p.x += Math.cos(angle) * 350 * dt;
        p.y += Math.sin(angle) * 350 * dt;
      }
    }
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
      SLOW_MO: 'powerup_slow',
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
    this.redSparkEmitter.explode(14, this.player.x, this.player.y);
    this.updateMissionProgress('powerup', 1);

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
        this.showFloatingText('DAMAGE OVERDRIVE', this.player.x, this.player.y, '#ff0055');
        this.activePowerUps.set('DOUBLE_DAMAGE', { type, endTime: now + 12000, duration: 12000 });
        break;

      case 'SPREAD_SHOT':
        this.showFloatingText('SPREAD CANNON', this.player.x, this.player.y, '#ff0055');
        this.activePowerUps.set('SPREAD_SHOT', { type, endTime: now + 14000, duration: 14000 });
        break;

      case 'PLASMA_CANNON':
        this.showFloatingText('PLASMA CANNON', this.player.x, this.player.y, '#ff0055');
        this.activePowerUps.set('PLASMA_CANNON', { type, endTime: now + 12000, duration: 12000 });
        break;

      case 'HYPERBEAM':
        this.showFloatingText('HYPERBEAM CORE', this.player.x, this.player.y, '#ff0033');
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
    this.cameras.main.flash(600, 255, 0, 85);
    this.cameras.main.shake(600, 0.03);
    SoundEffects.playBossExplosion();

    this.showFloatingText('ELECTROMAGNETIC NUKE!', this.scale.width / 2, this.scale.height / 2, '#ff0055', '28px');

    const enemies = this.enemies.getChildren();
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i] as Phaser.Physics.Arcade.Sprite;
      if (e.active) {
        this.explosionEmitter.explode(16, e.x, e.y);
        this.destroyEnemy(e);
      }
    }

    const asteroids = this.asteroids.getChildren();
    for (let i = 0; i < asteroids.length; i++) {
      const a = asteroids[i] as Phaser.Physics.Arcade.Sprite;
      if (a.active) {
        this.explosionEmitter.explode(14, a.x, a.y);
        this.destroyAsteroid(a);
      }
    }
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
  // SCORE & FLOATING TEXT
  // ==========================================
  private addScore(amount: number, x: number, y: number): void {
    this.score += amount;
    this.showFloatingText(`+${amount}`, x, y, '#ff0055');
  }

  private showFloatingText(
    text: string,
    x: number,
    y: number,
    color: string,
    size: string = '18px'
  ): void {
    const txt = this.add.text(x, y, text, {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: size,
      fontStyle: 'bold',
      color: color,
      stroke: '#000000',
      strokeThickness: 3,
    });
    txt.setOrigin(0.5);
    txt.setDepth(20);
    txt.setScale(0.85);

    this.tweens.add({
      targets: txt,
      y: y - 46,
      scale: 1.1,
      alpha: 0,
      duration: 850,
      ease: 'Back.easeOut',
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
    this.redSparkEmitter.explode(45, this.player.x, this.player.y);
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

    const activeMission = this.currentMissionIndex < this.missions.length
      ? this.missions[this.currentMissionIndex]
      : undefined;

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
      activeMission,
      activePowerUps: powerUpsList,
    };

    EventBus.emit('stats:update', stats);
  }
}
