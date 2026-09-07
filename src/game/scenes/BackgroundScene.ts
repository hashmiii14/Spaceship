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

export class BackgroundScene extends Phaser.Scene {
  private stars: Star[] = [];
  private starGraphics!: Phaser.GameObjects.Graphics;
  private nebulaeGraphics!: Phaser.GameObjects.Graphics;
  private planetGraphics!: Phaser.GameObjects.Graphics;
  private planetY: number = -350;
  private planetX: number = 400;
  private planetType: number = 0;
  private nebulaOffset: number = 0;
  private horizontalDrift: number = 0;
  private speedMultiplier: number = 1.0;
  private currentLevel: number = 1;

  constructor() {
    super({ key: 'BackgroundScene' });
  }

  create(): void {
    const width = this.scale.width;
    const height = this.scale.height;

    this.nebulaeGraphics = this.add.graphics();
    this.planetGraphics = this.add.graphics();
    this.starGraphics = this.add.graphics();

    this.initStars(width, height);
    this.resetPlanet();

    // Listen for gameplay speed / drift events
    this.game.events.on('background:setDrift', (drift: number) => {
      this.horizontalDrift = drift;
    });

    this.game.events.on('background:setSpeed', (multiplier: number) => {
      this.speedMultiplier = multiplier;
    });

    this.game.events.on('background:setLevel', (lvl: number) => {
      this.currentLevel = lvl;
    });

    // Window Resize Handler
    this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      const w = gameSize.width;
      const h = gameSize.height;
      this.initStars(w, h);
    });
  }

  private initStars(width: number, height: number): void {
    this.stars = [];
    const colors = [0xffffff, 0xdffff, 0xfff4cc, 0xe0e7ff, 0x67e8f9, 0xa78bfa];

    // Layer 1: Distant micro stars (200 count)
    const countL1 = Math.floor((width * height) / 4500);
    for (let i = 0; i < countL1; i++) {
      this.stars.push({
        x: Phaser.Math.Between(0, width),
        y: Phaser.Math.Between(0, height),
        size: Phaser.Math.FloatBetween(0.8, 1.4),
        speed: Phaser.Math.FloatBetween(30, 65),
        alpha: Phaser.Math.FloatBetween(0.25, 0.8),
        baseAlpha: Phaser.Math.FloatBetween(0.25, 0.8),
        twinkleSpeed: Phaser.Math.FloatBetween(1.2, 3.5),
        color: Phaser.Utils.Array.GetRandom(colors),
        layer: 1,
      });
    }

    // Layer 2: Mid-field stars (110 count)
    const countL2 = Math.floor((width * height) / 9000);
    for (let i = 0; i < countL2; i++) {
      this.stars.push({
        x: Phaser.Math.Between(0, width),
        y: Phaser.Math.Between(0, height),
        size: Phaser.Math.FloatBetween(1.6, 2.4),
        speed: Phaser.Math.FloatBetween(90, 170),
        alpha: Phaser.Math.FloatBetween(0.5, 0.95),
        baseAlpha: Phaser.Math.FloatBetween(0.5, 0.95),
        twinkleSpeed: Phaser.Math.FloatBetween(1.8, 4.5),
        color: Phaser.Utils.Array.GetRandom(colors),
        layer: 2,
      });
    }

    // Layer 3: High speed warp streaks (45 count)
    const countL3 = Math.floor((width * height) / 22000);
    for (let i = 0; i < countL3; i++) {
      this.stars.push({
        x: Phaser.Math.Between(0, width),
        y: Phaser.Math.Between(0, height),
        size: Phaser.Math.FloatBetween(2.2, 3.2),
        speed: Phaser.Math.FloatBetween(320, 580),
        alpha: 0.95,
        baseAlpha: 0.95,
        twinkleSpeed: 0,
        color: 0x00f0ff,
        layer: 3,
      });
    }
  }

  private resetPlanet(): void {
    const width = this.scale.width;
    this.planetX = Phaser.Math.Between(width * 0.15, width * 0.85);
    this.planetY = -350;
    this.planetType = Phaser.Math.Between(0, 3);
  }

  update(_time: number, delta: number): void {
    const dt = delta / 1000;
    const width = this.scale.width;
    const height = this.scale.height;

    // 1. Dynamic procedural Nebulae based on Level
    this.nebulaOffset += dt * 18 * this.speedMultiplier;
    this.nebulaeGraphics.clear();

    const nebColors = this.getLevelNebulaColors();
    const neb1Y = (this.nebulaOffset * 0.4) % (height + 600) - 300;
    this.nebulaeGraphics.fillStyle(nebColors.primary, 0.045);
    this.nebulaeGraphics.fillCircle(width * 0.25, neb1Y, Math.max(width * 0.35, 260));

    const neb2Y = (this.nebulaOffset * 0.3) % (height + 700) - 350;
    this.nebulaeGraphics.fillStyle(nebColors.secondary, 0.04);
    this.nebulaeGraphics.fillCircle(width * 0.75, neb2Y, Math.max(width * 0.4, 320));

    this.nebulaeGraphics.fillStyle(nebColors.core, 0.035);
    this.nebulaeGraphics.fillCircle(width * 0.5, (neb1Y + 350) % height, Math.max(width * 0.28, 220));

    // 2. Distant Celestial Planet / Moon
    this.planetY += dt * 16 * this.speedMultiplier;
    this.planetGraphics.clear();
    if (this.planetY < height + 250) {
      if (this.planetType === 0) {
        // Gas Giant with rings
        this.planetGraphics.fillStyle(0x1e1b4b, 0.55);
        this.planetGraphics.fillCircle(this.planetX, this.planetY, 65);
        this.planetGraphics.lineStyle(2, 0x818cf8, 0.4);
        this.planetGraphics.strokeCircle(this.planetX, this.planetY, 65);
        this.planetGraphics.lineStyle(4, 0x06b6d4, 0.35);
        this.planetGraphics.strokeEllipse(this.planetX, this.planetY, 150, 32);
      } else if (this.planetType === 1) {
        // Molten volcanic planet
        this.planetGraphics.fillStyle(0x450a0a, 0.55);
        this.planetGraphics.fillCircle(this.planetX, this.planetY, 50);
        this.planetGraphics.lineStyle(2.5, 0xf87171, 0.4);
        this.planetGraphics.strokeCircle(this.planetX, this.planetY, 50);
      } else if (this.planetType === 2) {
        // Cyber ice moon
        this.planetGraphics.fillStyle(0x083344, 0.5);
        this.planetGraphics.fillCircle(this.planetX, this.planetY, 55);
        this.planetGraphics.lineStyle(2, 0x22d3ee, 0.45);
        this.planetGraphics.strokeCircle(this.planetX, this.planetY, 55);
      } else {
        // Violet void planetoid
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

    // 3. Render Stars with Warp Stretching
    this.starGraphics.clear();

    for (let i = 0; i < this.stars.length; i++) {
      const star = this.stars[i];

      star.y += star.speed * dt * this.speedMultiplier;
      star.x -= this.horizontalDrift * (star.layer * 22) * dt;

      // Wrap-around
      if (star.y > height + 30) {
        star.y = -30;
        star.x = Phaser.Math.Between(0, width);
      }
      if (star.x < -30) star.x = width + 30;
      if (star.x > width + 30) star.x = -30;

      if (star.twinkleSpeed > 0) {
        star.alpha = star.baseAlpha + Math.sin(_time * 0.003 * star.twinkleSpeed) * 0.25;
        star.alpha = Phaser.Math.Clamp(star.alpha, 0.15, 1.0);
      }

      if (star.layer === 3) {
        const streakLen = Math.min(26 * this.speedMultiplier, 50);
        this.starGraphics.lineStyle(star.size, star.color, star.alpha);
        this.starGraphics.lineBetween(star.x, star.y - streakLen, star.x, star.y);
      } else {
        this.starGraphics.fillStyle(star.color, star.alpha);
        this.starGraphics.fillCircle(star.x, star.y, star.size);
      }
    }
  }

  private getLevelNebulaColors(): { primary: number; secondary: number; core: number } {
    switch (this.currentLevel) {
      case 2: // Deep Space: Violet / Blue
        return { primary: 0x4f46e5, secondary: 0x7c3aed, core: 0x1e1b4b };
      case 3: // Meteor Storm: Solar Amber / Orange
        return { primary: 0xd97706, secondary: 0xb45309, core: 0x78350f };
      case 4: // Alien Front: Toxic Emerald / Teal
        return { primary: 0x059669, secondary: 0x0d9488, core: 0x064e3b };
      case 5: // Void Zone: Abyssal Purple / Black
        return { primary: 0x581c87, secondary: 0x3b0764, core: 0x0f051d };
      case 6: // Nebula Core: Magenta / Cyan Shock
        return { primary: 0xdb2777, secondary: 0x06b6d4, core: 0x4c0519 };
      case 7: // Boss Sector: Blood Red / Crimson Overdrive
        return { primary: 0xbe123c, secondary: 0x9f1239, core: 0x4c0519 };
      default: // Level 1: Cyber Cyan
        return { primary: 0x06b6d4, secondary: 0x9333ea, core: 0x4f46e5 };
    }
  }
}
