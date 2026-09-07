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
  private planetY: number = -200;
  private planetX: number = 300;
  private planetType: number = 0;
  private nebulaOffset: number = 0;
  private horizontalDrift: number = 0;
  private speedMultiplier: number = 1.0;

  constructor() {
    super({ key: 'BackgroundScene' });
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

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
  }

  private initStars(width: number, height: number): void {
    this.stars = [];
    // Colors for deep space stars: white, pale cyan, amber, lavender
    const colors = [0xffffff, 0xdffff, 0xfff4cc, 0xe0e7ff, 0x67e8f9];

    // Layer 1: Distant micro stars (150 count)
    for (let i = 0; i < 150; i++) {
      this.stars.push({
        x: Phaser.Math.Between(0, width),
        y: Phaser.Math.Between(0, height),
        size: Phaser.Math.FloatBetween(0.8, 1.4),
        speed: Phaser.Math.FloatBetween(30, 60),
        alpha: Phaser.Math.FloatBetween(0.3, 0.8),
        baseAlpha: Phaser.Math.FloatBetween(0.3, 0.8),
        twinkleSpeed: Phaser.Math.FloatBetween(1.5, 4.0),
        color: Phaser.Utils.Array.GetRandom(colors),
        layer: 1,
      });
    }

    // Layer 2: Mid-field stars (80 count)
    for (let i = 0; i < 80; i++) {
      this.stars.push({
        x: Phaser.Math.Between(0, width),
        y: Phaser.Math.Between(0, height),
        size: Phaser.Math.FloatBetween(1.6, 2.4),
        speed: Phaser.Math.FloatBetween(90, 160),
        alpha: Phaser.Math.FloatBetween(0.6, 1.0),
        baseAlpha: Phaser.Math.FloatBetween(0.6, 1.0),
        twinkleSpeed: Phaser.Math.FloatBetween(2.0, 5.0),
        color: Phaser.Utils.Array.GetRandom(colors),
        layer: 2,
      });
    }

    // Layer 3: High speed warp stars / streaks (35 count)
    for (let i = 0; i < 35; i++) {
      this.stars.push({
        x: Phaser.Math.Between(0, width),
        y: Phaser.Math.Between(0, height),
        size: Phaser.Math.FloatBetween(2.5, 3.2),
        speed: Phaser.Math.FloatBetween(280, 500),
        alpha: 1.0,
        baseAlpha: 1.0,
        twinkleSpeed: 0,
        color: 0x00f0ff,
        layer: 3,
      });
    }
  }

  private resetPlanet(): void {
    const width = this.cameras.main.width;
    this.planetX = Phaser.Math.Between(width * 0.15, width * 0.85);
    this.planetY = -350;
    this.planetType = Phaser.Math.Between(0, 2);
  }

  update(_time: number, delta: number): void {
    const dt = delta / 1000;
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 1. Draw dynamic procedural Nebulae
    this.nebulaOffset += dt * 15 * this.speedMultiplier;
    this.nebulaeGraphics.clear();

    // Cosmic Cyan Nebula
    const neb1Y = (this.nebulaOffset * 0.4) % (height + 500) - 250;
    this.nebulaeGraphics.fillStyle(0x06b6d4, 0.035);
    this.nebulaeGraphics.fillCircle(width * 0.25, neb1Y, 260);

    // Cosmic Magenta Nebula
    const neb2Y = (this.nebulaOffset * 0.3) % (height + 600) - 300;
    this.nebulaeGraphics.fillStyle(0x9333ea, 0.04);
    this.nebulaeGraphics.fillCircle(width * 0.75, neb2Y, 320);

    // Deep Violet Core
    this.nebulaeGraphics.fillStyle(0x4f46e5, 0.03);
    this.nebulaeGraphics.fillCircle(width * 0.5, (neb1Y + 300) % height, 200);

    // 2. Draw Distant Planet
    this.planetY += dt * 18 * this.speedMultiplier;
    this.planetGraphics.clear();
    if (this.planetY < height + 200) {
      if (this.planetType === 0) {
        // Gas Giant with rings
        this.planetGraphics.fillStyle(0x1e1b4b, 0.5);
        this.planetGraphics.fillCircle(this.planetX, this.planetY, 55);
        this.planetGraphics.lineStyle(2, 0x818cf8, 0.4);
        this.planetGraphics.strokeCircle(this.planetX, this.planetY, 55);

        // Rings
        this.planetGraphics.lineStyle(4, 0x06b6d4, 0.3);
        this.planetGraphics.strokeEllipse(this.planetX, this.planetY, 130, 28);
      } else if (this.planetType === 1) {
        // Molten Mars-like world
        this.planetGraphics.fillStyle(0x450a0a, 0.5);
        this.planetGraphics.fillCircle(this.planetX, this.planetY, 40);
        this.planetGraphics.lineStyle(2, 0xf87171, 0.35);
        this.planetGraphics.strokeCircle(this.planetX, this.planetY, 40);
      } else {
        // Cyan Cyberworld
        this.planetGraphics.fillStyle(0x083344, 0.45);
        this.planetGraphics.fillCircle(this.planetX, this.planetY, 48);
        this.planetGraphics.lineStyle(2, 0x22d3ee, 0.4);
        this.planetGraphics.strokeCircle(this.planetX, this.planetY, 48);
      }
    } else {
      // Re-trigger planet after delay
      if (Math.random() < 0.005) {
        this.resetPlanet();
      }
    }

    // 3. Update & Render Stars
    this.starGraphics.clear();

    for (let i = 0; i < this.stars.length; i++) {
      const star = this.stars[i];

      // Move star downward
      star.y += star.speed * dt * this.speedMultiplier;

      // Slight horizontal parallax based on player tilt
      star.x -= this.horizontalDrift * (star.layer * 22) * dt;

      // Wrap-around
      if (star.y > height + 20) {
        star.y = -20;
        star.x = Phaser.Math.Between(0, width);
      }
      if (star.x < -20) star.x = width + 20;
      if (star.x > width + 20) star.x = -20;

      // Twinkle effect
      if (star.twinkleSpeed > 0) {
        star.alpha = star.baseAlpha + Math.sin(_time * 0.003 * star.twinkleSpeed) * 0.25;
        star.alpha = Phaser.Math.Clamp(star.alpha, 0.15, 1.0);
      }

      if (star.layer === 3) {
        // Fast warp streak
        const streakLen = Math.min(22 * this.speedMultiplier, 35);
        this.starGraphics.lineStyle(star.size, star.color, star.alpha);
        this.starGraphics.lineBetween(star.x, star.y - streakLen, star.x, star.y);
      } else {
        // Circular point star
        this.starGraphics.fillStyle(star.color, star.alpha);
        this.starGraphics.fillCircle(star.x, star.y, star.size);
      }
    }
  }
}
