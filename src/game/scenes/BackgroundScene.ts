import Phaser from 'phaser';

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  alpha: number;
  baseAlpha: number;
  twinkleSpeed: number;
  color: number;
  layer: number;
}

interface CosmicDebris {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  scale: number;
}

export class BackgroundScene extends Phaser.Scene {
  private stars: Star[] = [];
  private spaceDust: { x: number; y: number; speed: number; alpha: number; size: number }[] = [];
  private debrisList: CosmicDebris[] = [];

  private starGraphics!: Phaser.GameObjects.Graphics;
  private nebulaeGraphics!: Phaser.GameObjects.Graphics;
  private planetGraphics!: Phaser.GameObjects.Graphics;
  private dustGraphics!: Phaser.GameObjects.Graphics;
  private debrisGraphics!: Phaser.GameObjects.Graphics;

  private planetY: number = -350;
  private planetX: number = 400;
  private planetType: number = 0;
  private nebulaOffset: number = 0;
  private horizontalDrift: number = 0;
  private speedMultiplier: number = 1.0;
  private currentLevel: number = 1;

  // Warp Drive cinematic state
  private isWarping: boolean = false;
  private warpFactor: number = 1.0;

  constructor() {
    super({ key: 'BackgroundScene' });
  }

  create(): void {
    const width = this.scale.width;
    const height = this.scale.height;

    this.nebulaeGraphics = this.add.graphics();
    this.planetGraphics = this.add.graphics();
    this.dustGraphics = this.add.graphics();
    this.starGraphics = this.add.graphics();
    this.debrisGraphics = this.add.graphics();

    this.initStars(width, height);
    this.resetPlanet();

    // Event Listeners
    const onDrift = (drift: number) => { this.horizontalDrift = drift; };
    const onSpeed = (multiplier: number) => { this.speedMultiplier = multiplier; };
    const onLevel = (lvl: number) => { this.currentLevel = lvl; };
    const onWarp = (durationMs: number = 4000) => { this.triggerWarpDrive(durationMs); };

    this.game.events.on('background:setDrift', onDrift);
    this.game.events.on('background:setSpeedMultiplier', onSpeed);
    this.game.events.on('background:setLevel', onLevel);
    this.game.events.on('background:triggerWarp', onWarp);

    // Event Cleanup on Shutdown
    this.events.once('shutdown', () => {
      this.game.events.off('background:setDrift', onDrift);
      this.game.events.off('background:setSpeedMultiplier', onSpeed);
      this.game.events.off('background:setLevel', onLevel);
      this.game.events.off('background:triggerWarp', onWarp);
    });

    // Window Resize Handler
    this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      const w = gameSize.width;
      const h = gameSize.height;
      for (const s of this.stars) {
        if (s.x > w) s.x = Phaser.Math.Between(0, w);
        if (s.y > h) s.y = Phaser.Math.Between(0, h);
      }
    });
  }

  private initStars(width: number, height: number): void {
    this.stars = [];
    const colors = [0xffffff, 0xdffff, 0xfff4cc, 0xe0e7ff, 0x67e8f9, 0xa78bfa, 0xff0055];

    // Layer 1: Distant micro stars (lightweight, stable count: 40)
    for (let i = 0; i < 40; i++) {
      this.stars.push({
        x: Phaser.Math.Between(0, width),
        y: Phaser.Math.Between(0, height),
        size: Phaser.Math.FloatBetween(1.0, 1.6),
        speed: Phaser.Math.FloatBetween(30, 65),
        alpha: Phaser.Math.FloatBetween(0.3, 0.7),
        baseAlpha: Phaser.Math.FloatBetween(0.3, 0.7),
        twinkleSpeed: Phaser.Math.FloatBetween(1.2, 3.0),
        color: Phaser.Utils.Array.GetRandom(colors),
        layer: 1,
      });
    }

    // Layer 2: Mid-field stars (medium speed, stable count: 20)
    for (let i = 0; i < 20; i++) {
      this.stars.push({
        x: Phaser.Math.Between(0, width),
        y: Phaser.Math.Between(0, height),
        size: Phaser.Math.FloatBetween(1.8, 2.5),
        speed: Phaser.Math.FloatBetween(90, 160),
        alpha: Phaser.Math.FloatBetween(0.6, 0.95),
        baseAlpha: Phaser.Math.FloatBetween(0.6, 0.95),
        twinkleSpeed: Phaser.Math.FloatBetween(2.0, 4.0),
        color: Phaser.Utils.Array.GetRandom(colors),
        layer: 2,
      });
    }

    // Layer 3: Fast stars (hyper speed streaks, stable count: 10)
    for (let i = 0; i < 10; i++) {
      this.stars.push({
        x: Phaser.Math.Between(0, width),
        y: Phaser.Math.Between(0, height),
        size: Phaser.Math.FloatBetween(2.0, 3.0),
        speed: Phaser.Math.FloatBetween(320, 520),
        alpha: 0.9,
        baseAlpha: 0.9,
        twinkleSpeed: 0,
        color: 0xff0055, // Signature red high-speed streaks
        layer: 3,
      });
    }
  }

  private resetPlanet(): void {
    const width = this.scale.width;
    this.planetX = Phaser.Math.Between(width * 0.2, width * 0.8);
    this.planetY = -350;
    this.planetType = Phaser.Math.Between(0, 3);
  }

  public triggerWarpDrive(durationMs: number = 4000): void {
    this.isWarping = true;
    this.tweens.add({
      targets: this,
      warpFactor: 4.5,
      duration: 800,
      ease: 'Power2',
      onComplete: () => {
        this.time.delayedCall(durationMs - 1600, () => {
          this.tweens.add({
            targets: this,
            warpFactor: 1.0,
            duration: 800,
            ease: 'Power2',
            onComplete: () => {
              this.isWarping = false;
            },
          });
        });
      },
    });
  }

  update(time: number, delta: number): void {
    const dt = delta / 1000;
    const width = this.scale.width;
    const height = this.scale.height;
    const currentSpeed = this.speedMultiplier * this.warpFactor;

    // Layer 4 & 5: Dynamic Dark Atmosphere based on Level
    this.nebulaOffset += dt * 14 * currentSpeed;
    this.nebulaeGraphics.clear();

    const nebColors = this.getLevelNebulaColors();
    const neb1Y = (this.nebulaOffset * 0.3) % (height + 500) - 250;
    this.nebulaeGraphics.fillStyle(nebColors.primary, 0.035);
    this.nebulaeGraphics.fillCircle(width * 0.3, neb1Y, Math.max(width * 0.35, 240));

    const neb2Y = (this.nebulaOffset * 0.25) % (height + 600) - 300;
    this.nebulaeGraphics.fillStyle(nebColors.secondary, 0.03);
    this.nebulaeGraphics.fillCircle(width * 0.7, neb2Y, Math.max(width * 0.4, 280));

    // Layer 6: Distant Celestial Planetoid (Only rendered when on-screen)
    this.planetY += dt * 14 * currentSpeed;
    this.planetGraphics.clear();
    if (this.planetY > -100 && this.planetY < height + 100) {
      if (this.planetType === 0) {
        // Gas Giant with Planetary Rings
        this.planetGraphics.fillStyle(0x1e1b4b, 0.5);
        this.planetGraphics.fillCircle(this.planetX, this.planetY, 55);
        this.planetGraphics.lineStyle(1.5, 0x818cf8, 0.35);
        this.planetGraphics.strokeCircle(this.planetX, this.planetY, 55);
        this.planetGraphics.lineStyle(3, 0x06b6d4, 0.3);
        this.planetGraphics.strokeEllipse(this.planetX, this.planetY, 130, 28);
      } else if (this.planetType === 1) {
        // Molten Volcanic Planetoid
        this.planetGraphics.fillStyle(0x450a0a, 0.5);
        this.planetGraphics.fillCircle(this.planetX, this.planetY, 45);
        this.planetGraphics.lineStyle(2, 0xf87171, 0.35);
        this.planetGraphics.strokeCircle(this.planetX, this.planetY, 45);
      } else if (this.planetType === 2) {
        // Cyber Ice Moon
        this.planetGraphics.fillStyle(0x083344, 0.45);
        this.planetGraphics.fillCircle(this.planetX, this.planetY, 48);
        this.planetGraphics.lineStyle(2, 0x22d3ee, 0.4);
        this.planetGraphics.strokeCircle(this.planetX, this.planetY, 48);
      } else {
        // Dark Void Planetoid
        this.planetGraphics.fillStyle(0x2e1065, 0.45);
        this.planetGraphics.fillCircle(this.planetX, this.planetY, 50);
        this.planetGraphics.lineStyle(1.5, 0xc084fc, 0.35);
        this.planetGraphics.strokeCircle(this.planetX, this.planetY, 50);
      }
    } else if (this.planetY >= height + 100) {
      if (Math.random() < 0.008) {
        this.resetPlanet();
      }
    }

    // Layer 1, 2, 3: Batched Ultra-Smooth Starfield (Stable 60 FPS)
    this.starGraphics.clear();
    for (let i = 0; i < this.stars.length; i++) {
      const star = this.stars[i];

      star.y += star.speed * dt * currentSpeed;
      star.x -= this.horizontalDrift * (star.layer * 18) * dt;

      // Wrap-around
      if (star.y > height + 20) {
        star.y = -20;
        star.x = Phaser.Math.Between(0, width);
      }
      if (star.x < -20) star.x = width + 20;
      if (star.x > width + 20) star.x = -20;

      if (star.twinkleSpeed > 0) {
        star.alpha = star.baseAlpha + Math.sin(time * 0.003 * star.twinkleSpeed) * 0.2;
        star.alpha = Phaser.Math.Clamp(star.alpha, 0.2, 1.0);
      }

      if (this.isWarping || star.layer === 3) {
        const streakLen = Math.min((this.isWarping ? 70 : 22) * currentSpeed, 100);
        this.starGraphics.lineStyle(star.size * (this.isWarping ? 1.5 : 1.0), star.color, star.alpha);
        this.starGraphics.lineBetween(star.x, star.y - streakLen, star.x, star.y);
      } else {
        this.starGraphics.fillStyle(star.color, star.alpha);
        this.starGraphics.fillRect(star.x, star.y, star.size, star.size);
      }
    }
  }

  private getLevelNebulaColors(): { primary: number; secondary: number; core: number } {
    switch (this.currentLevel) {
      case 2: // Level 2: Deep Space (Deep Violet & Navy)
        return { primary: 0x312e81, secondary: 0x4338ca, core: 0x0f172a };
      case 3: // Level 3: Meteor Storm (Dark Charcoal & Crimson Core)
        return { primary: 0x7f1d1d, secondary: 0x991b1b, core: 0x450a0a };
      case 4: // Level 4: Alien Front (Dark Void Emerald & Abyss)
        return { primary: 0x064e3b, secondary: 0x065f46, core: 0x022c22 };
      case 5: // Level 5: Void Zone (Deep Abyssal Purple)
        return { primary: 0x3b0764, secondary: 0x581c87, core: 0x1e0538 };
      case 6: // Level 6: Nebula Core (Dark Magenta & Cosmic Blue)
        return { primary: 0x831843, secondary: 0x1e3a8a, core: 0x0f172a };
      case 7: // Level 7: Final Sector (Pure Obsidian & High-Coherence Crimson)
        return { primary: 0x881337, secondary: 0x4c0519, core: 0x020617 };
      default: // Level 1: Awakening (Deep Charcoal & Cold Navy)
        return { primary: 0x0f172a, secondary: 0x1e293b, core: 0x020617 };
    }
  }
}
