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
    this.initSpaceDust(width, height);
    this.initDebris(width, height);
    this.resetPlanet();

    // Event Listeners
    this.game.events.on('background:setDrift', (drift: number) => {
      this.horizontalDrift = drift;
    });

    this.game.events.on('background:setSpeedMultiplier', (multiplier: number) => {
      this.speedMultiplier = multiplier;
    });

    this.game.events.on('background:setLevel', (lvl: number) => {
      this.currentLevel = lvl;
    });

    this.game.events.on('background:triggerWarp', (durationMs: number = 4000) => {
      this.triggerWarpDrive(durationMs);
    });

    // Window Resize Handler
    this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      const w = gameSize.width;
      const h = gameSize.height;
      this.initStars(w, h);
      this.initSpaceDust(w, h);
    });
  }

  private initStars(width: number, height: number): void {
    this.stars = [];
    const colors = [0xffffff, 0xdffff, 0xfff4cc, 0xe0e7ff, 0x67e8f9, 0xa78bfa, 0xff0055];

    // Layer 1: Distant micro stars (dense, slow)
    const countL1 = Math.floor((width * height) / 4000);
    for (let i = 0; i < countL1; i++) {
      this.stars.push({
        x: Phaser.Math.Between(0, width),
        y: Phaser.Math.Between(0, height),
        size: Phaser.Math.FloatBetween(0.8, 1.4),
        speed: Phaser.Math.FloatBetween(30, 65),
        alpha: Phaser.Math.FloatBetween(0.25, 0.75),
        baseAlpha: Phaser.Math.FloatBetween(0.25, 0.75),
        twinkleSpeed: Phaser.Math.FloatBetween(1.2, 3.5),
        color: Phaser.Utils.Array.GetRandom(colors),
        layer: 1,
      });
    }

    // Layer 2: Mid-field stars (medium speed)
    const countL2 = Math.floor((width * height) / 8500);
    for (let i = 0; i < countL2; i++) {
      this.stars.push({
        x: Phaser.Math.Between(0, width),
        y: Phaser.Math.Between(0, height),
        size: Phaser.Math.FloatBetween(1.6, 2.4),
        speed: Phaser.Math.FloatBetween(90, 180),
        alpha: Phaser.Math.FloatBetween(0.5, 0.95),
        baseAlpha: Phaser.Math.FloatBetween(0.5, 0.95),
        twinkleSpeed: Phaser.Math.FloatBetween(1.8, 4.5),
        color: Phaser.Utils.Array.GetRandom(colors),
        layer: 2,
      });
    }

    // Layer 3: Fast stars (hyper speed streaks)
    const countL3 = Math.floor((width * height) / 20000);
    for (let i = 0; i < countL3; i++) {
      this.stars.push({
        x: Phaser.Math.Between(0, width),
        y: Phaser.Math.Between(0, height),
        size: Phaser.Math.FloatBetween(2.2, 3.2),
        speed: Phaser.Math.FloatBetween(340, 600),
        alpha: 0.95,
        baseAlpha: 0.95,
        twinkleSpeed: 0,
        color: 0xff0055, // Signature red accent high-speed streaks
        layer: 3,
      });
    }
  }

  private initSpaceDust(width: number, height: number): void {
    this.spaceDust = [];
    const count = Math.floor((width * height) / 12000);
    for (let i = 0; i < count; i++) {
      this.spaceDust.push({
        x: Phaser.Math.Between(0, width),
        y: Phaser.Math.Between(0, height),
        size: Phaser.Math.FloatBetween(1.5, 3.0),
        speed: Phaser.Math.FloatBetween(15, 45),
        alpha: Phaser.Math.FloatBetween(0.1, 0.35),
      });
    }
  }

  private initDebris(width: number, height: number): void {
    this.debrisList = [];
    for (let i = 0; i < 8; i++) {
      this.debrisList.push({
        x: Phaser.Math.Between(0, width),
        y: Phaser.Math.Between(-height, height),
        vx: Phaser.Math.FloatBetween(-20, 20),
        vy: Phaser.Math.FloatBetween(70, 140),
        rotation: Phaser.Math.FloatBetween(0, Math.PI * 2),
        vRot: Phaser.Math.FloatBetween(-1.5, 1.5),
        scale: Phaser.Math.FloatBetween(0.8, 1.6),
      });
    }
  }

  private resetPlanet(): void {
    const width = this.scale.width;
    this.planetX = Phaser.Math.Between(width * 0.15, width * 0.85);
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

    // Layer 4 & 5: Dynamic Dark Nebulae based on Level
    this.nebulaOffset += dt * 18 * currentSpeed;
    this.nebulaeGraphics.clear();

    const nebColors = this.getLevelNebulaColors();
    const neb1Y = (this.nebulaOffset * 0.4) % (height + 600) - 300;
    this.nebulaeGraphics.fillStyle(nebColors.primary, 0.04);
    this.nebulaeGraphics.fillCircle(width * 0.25, neb1Y, Math.max(width * 0.35, 260));

    const neb2Y = (this.nebulaOffset * 0.3) % (height + 700) - 350;
    this.nebulaeGraphics.fillStyle(nebColors.secondary, 0.035);
    this.nebulaeGraphics.fillCircle(width * 0.75, neb2Y, Math.max(width * 0.4, 320));

    this.nebulaeGraphics.fillStyle(nebColors.core, 0.03);
    this.nebulaeGraphics.fillCircle(width * 0.5, (neb1Y + 350) % height, Math.max(width * 0.28, 220));

    // Layer 6: Distant Celestial Planetoids & Moons
    this.planetY += dt * 16 * currentSpeed;
    this.planetGraphics.clear();
    if (this.planetY < height + 250) {
      if (this.planetType === 0) {
        // Gas Giant with Planetary Rings
        this.planetGraphics.fillStyle(0x1e1b4b, 0.55);
        this.planetGraphics.fillCircle(this.planetX, this.planetY, 65);
        this.planetGraphics.lineStyle(2, 0x818cf8, 0.4);
        this.planetGraphics.strokeCircle(this.planetX, this.planetY, 65);
        this.planetGraphics.lineStyle(4, 0x06b6d4, 0.35);
        this.planetGraphics.strokeEllipse(this.planetX, this.planetY, 150, 32);
      } else if (this.planetType === 1) {
        // Molten Volcanic Planetoid
        this.planetGraphics.fillStyle(0x450a0a, 0.55);
        this.planetGraphics.fillCircle(this.planetX, this.planetY, 50);
        this.planetGraphics.lineStyle(2.5, 0xf87171, 0.4);
        this.planetGraphics.strokeCircle(this.planetX, this.planetY, 50);
      } else if (this.planetType === 2) {
        // Cyber Ice Moon
        this.planetGraphics.fillStyle(0x083344, 0.5);
        this.planetGraphics.fillCircle(this.planetX, this.planetY, 55);
        this.planetGraphics.lineStyle(2, 0x22d3ee, 0.45);
        this.planetGraphics.strokeCircle(this.planetX, this.planetY, 55);
      } else {
        // Dark Violet Void Planetoid
        this.planetGraphics.fillStyle(0x2e1065, 0.5);
        this.planetGraphics.fillCircle(this.planetX, this.planetY, 58);
        this.planetGraphics.lineStyle(2, 0xc084fc, 0.4);
        this.planetGraphics.strokeCircle(this.planetX, this.planetY, 58);
      }
    } else {
      if (Math.random() < 0.005) {
        this.resetPlanet();
      }
    }

    // Layer 4: Space Dust Particles
    this.dustGraphics.clear();
    for (let i = 0; i < this.spaceDust.length; i++) {
      const d = this.spaceDust[i];
      d.y += d.speed * dt * currentSpeed;
      if (d.y > height + 10) d.y = -10;
      this.dustGraphics.fillStyle(0x00f0ff, d.alpha);
      this.dustGraphics.fillCircle(d.x, d.y, d.size);
    }

    // Layer 7: Cosmic Debris
    this.debrisGraphics.clear();
    for (let i = 0; i < this.debrisList.length; i++) {
      const deb = this.debrisList[i];
      deb.y += deb.vy * dt * currentSpeed;
      deb.x += deb.vx * dt;
      deb.rotation += deb.vRot * dt;

      if (deb.y > height + 40) {
        deb.y = -40;
        deb.x = Phaser.Math.Between(0, width);
      }

      this.debrisGraphics.fillStyle(0x475569, 0.6);
      this.debrisGraphics.fillCircle(deb.x, deb.y, 3 * deb.scale);
    }

    // Layer 1, 2, 3: Stars with Warp Stretching
    this.starGraphics.clear();
    for (let i = 0; i < this.stars.length; i++) {
      const star = this.stars[i];

      star.y += star.speed * dt * currentSpeed;
      star.x -= this.horizontalDrift * (star.layer * 22) * dt;

      // Wrap-around
      if (star.y > height + 30) {
        star.y = -30;
        star.x = Phaser.Math.Between(0, width);
      }
      if (star.x < -30) star.x = width + 30;
      if (star.x > width + 30) star.x = -30;

      if (star.twinkleSpeed > 0) {
        star.alpha = star.baseAlpha + Math.sin(time * 0.003 * star.twinkleSpeed) * 0.25;
        star.alpha = Phaser.Math.Clamp(star.alpha, 0.15, 1.0);
      }

      if (this.isWarping || star.layer === 3) {
        const streakLen = Math.min((this.isWarping ? 80 : 26) * currentSpeed, 120);
        this.starGraphics.lineStyle(star.size * (this.isWarping ? 1.5 : 1.0), star.color, star.alpha);
        this.starGraphics.lineBetween(star.x, star.y - streakLen, star.x, star.y);
      } else {
        this.starGraphics.fillStyle(star.color, star.alpha);
        this.starGraphics.fillCircle(star.x, star.y, star.size);
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
