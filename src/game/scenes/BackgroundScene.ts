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
    this.spaceDust = [];
    const colors = [0xffffff, 0xdfffff, 0xfff4cc, 0xe0e7ff, 0x67e8f9, 0xa78bfa, 0xff0055];

    // Layer 1: Distant micro stars (lightweight, stable count: 42)
    for (let i = 0; i < 42; i++) {
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

    // Layer 2: Mid-field stars (medium speed, stable count: 22)
    for (let i = 0; i < 22; i++) {
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

    // Layer 3: Fast stars (hyper speed streaks, stable count: 12)
    for (let i = 0; i < 12; i++) {
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

    // Ambient Cosmic Dust (24 floating particles for 3D depth)
    for (let i = 0; i < 24; i++) {
      this.spaceDust.push({
        x: Phaser.Math.Between(0, width),
        y: Phaser.Math.Between(0, height),
        size: Phaser.Math.FloatBetween(2.5, 4.5),
        speed: Phaser.Math.FloatBetween(15, 35),
        alpha: Phaser.Math.FloatBetween(0.08, 0.18),
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

    // Layer 4 & 5: Volumetric Multi-Tier Atmospheric Nebulae
    this.nebulaOffset += dt * 14 * currentSpeed;
    this.nebulaeGraphics.clear();

    const nebColors = this.getLevelNebulaColors();
    const neb1Y = (this.nebulaOffset * 0.3) % (height + 600) - 300;
    this.nebulaeGraphics.fillStyle(nebColors.primary, 0.04);
    this.nebulaeGraphics.fillCircle(width * 0.28, neb1Y, Math.max(width * 0.38, 260));

    const neb2Y = (this.nebulaOffset * 0.22) % (height + 700) - 350;
    this.nebulaeGraphics.fillStyle(nebColors.secondary, 0.035);
    this.nebulaeGraphics.fillCircle(width * 0.72, neb2Y, Math.max(width * 0.44, 300));

    // Core energetic flare cluster
    const neb3Y = (this.nebulaOffset * 0.38) % (height + 500) - 200;
    this.nebulaeGraphics.fillStyle(nebColors.core, 0.03);
    this.nebulaeGraphics.fillCircle(width * 0.5, neb3Y, Math.max(width * 0.22, 160));

    // Ambient Cosmic Dust (Soft floating particles)
    this.dustGraphics.clear();
    for (let i = 0; i < this.spaceDust.length; i++) {
      const d = this.spaceDust[i];
      d.y += d.speed * dt * currentSpeed;
      d.x -= this.horizontalDrift * 8 * dt;
      if (d.y > height + 20) {
        d.y = -20;
        d.x = Phaser.Math.Between(0, width);
      }
      if (d.x < -20) d.x = width + 20;
      if (d.x > width + 20) d.x = -20;

      this.dustGraphics.fillStyle(0x38bdf8, d.alpha);
      this.dustGraphics.fillRect(d.x, d.y, d.size, d.size);
    }

    // Layer 6: High-Definition Distant Celestial Planetoid
    this.planetY += dt * 14 * currentSpeed;
    this.planetGraphics.clear();
    if (this.planetY > -120 && this.planetY < height + 120) {
      if (this.planetType === 0) {
        // Gas Giant with Atmospheric Bands & Planetary Rings
        this.planetGraphics.fillStyle(0x1e1b4b, 0.6);
        this.planetGraphics.fillCircle(this.planetX, this.planetY, 58);

        // Gas Strata Bands
        this.planetGraphics.fillStyle(0x312e81, 0.35);
        this.planetGraphics.fillRect(this.planetX - 54, this.planetY - 14, 108, 12);
        this.planetGraphics.fillRect(this.planetX - 52, this.planetY + 8, 104, 10);

        // Glowing Planetary Rings
        this.planetGraphics.lineStyle(4, 0x06b6d4, 0.35);
        this.planetGraphics.strokeEllipse(this.planetX, this.planetY, 140, 30);
        this.planetGraphics.lineStyle(1.5, 0x818cf8, 0.4);
        this.planetGraphics.strokeCircle(this.planetX, this.planetY, 58);
      } else if (this.planetType === 1) {
        // Molten Volcanic Planetoid with Magma Fissures
        this.planetGraphics.fillStyle(0x450a0a, 0.6);
        this.planetGraphics.fillCircle(this.planetX, this.planetY, 48);

        // Magma Fissures
        this.planetGraphics.lineStyle(2, 0xf97316, 0.5);
        this.planetGraphics.lineBetween(this.planetX - 25, this.planetY - 10, this.planetX + 15, this.planetY + 5);
        this.planetGraphics.lineBetween(this.planetX - 10, this.planetY + 15, this.planetX + 20, this.planetY + 25);

        this.planetGraphics.lineStyle(2.5, 0xef4444, 0.45);
        this.planetGraphics.strokeCircle(this.planetX, this.planetY, 48);
      } else if (this.planetType === 2) {
        // Cyber Ice Moon with Specular Glint
        this.planetGraphics.fillStyle(0x083344, 0.55);
        this.planetGraphics.fillCircle(this.planetX, this.planetY, 50);

        this.planetGraphics.lineStyle(2.5, 0x22d3ee, 0.5);
        this.planetGraphics.strokeCircle(this.planetX, this.planetY, 50);
        this.planetGraphics.lineStyle(1, 0xa5f3fc, 0.6);
        this.planetGraphics.strokeCircle(this.planetX - 14, this.planetY - 14, 8);
      } else {
        // Dark Void Singularity with Accretion Halo
        this.planetGraphics.fillStyle(0x180226, 0.65);
        this.planetGraphics.fillCircle(this.planetX, this.planetY, 52);

        this.planetGraphics.lineStyle(3, 0xa855f7, 0.4);
        this.planetGraphics.strokeCircle(this.planetX, this.planetY, 52);
        this.planetGraphics.lineStyle(1.5, 0xc084fc, 0.3);
        this.planetGraphics.strokeEllipse(this.planetX, this.planetY, 110, 24);
      }
    } else if (this.planetY >= height + 120) {
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
        const streakLen = Math.min((this.isWarping ? 75 : 24) * currentSpeed, 110);
        this.starGraphics.lineStyle(star.size * (this.isWarping ? 1.6 : 1.0), star.color, star.alpha);
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
