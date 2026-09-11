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
  private debrisSprites: Phaser.GameObjects.Image[] = [];

  private starGraphics!: Phaser.GameObjects.Graphics;
  private planetGraphics!: Phaser.GameObjects.Graphics;
  private nebula1!: Phaser.GameObjects.Image;
  private nebula2!: Phaser.GameObjects.Image;
  private nebula3!: Phaser.GameObjects.Image;

  private planetY: number = -350;
  private planetX: number = 400;
  private planetType: number = 0;
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

    // Create hardware-accelerated radial nebula cloud texture once
    if (!this.textures.exists('nebula_cloud')) {
      const rt = this.textures.createCanvas('nebula_cloud', 256, 256);
      if (rt) {
        const ctx = rt.getContext();
        const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
        grad.addColorStop(0.35, 'rgba(255, 255, 255, 0.35)');
        grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.08)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 256, 256);
        rt.refresh();
      }
    }

    // Hardware-accelerated GPU sprite nebulae with zero per-frame CPU tessellation
    const nebColors = this.getLevelNebulaColors();
    this.nebula1 = this.add.image(width * 0.3, height * 0.2, 'nebula_cloud')
      .setScale(Math.max(width / 180, 4.0))
      .setAlpha(0.14)
      .setTint(nebColors.primary)
      .setBlendMode(Phaser.BlendModes.ADD);

    this.nebula2 = this.add.image(width * 0.75, height * 0.65, 'nebula_cloud')
      .setScale(Math.max(width / 150, 4.8))
      .setAlpha(0.12)
      .setTint(nebColors.secondary)
      .setBlendMode(Phaser.BlendModes.ADD);

    this.nebula3 = this.add.image(width * 0.5, height * 0.45, 'nebula_cloud')
      .setScale(Math.max(width / 220, 3.2))
      .setAlpha(0.1)
      .setTint(nebColors.core)
      .setBlendMode(Phaser.BlendModes.ADD);

    this.planetGraphics = this.add.graphics();
    this.starGraphics = this.add.graphics();

    this.initStars(width, height);
    this.initDebris(width, height);
    this.resetPlanet();

    // Event Listeners
    const onDrift = (drift: number) => { this.horizontalDrift = drift; };
    const onSpeed = (multiplier: number) => { this.speedMultiplier = multiplier; };
    const onLevel = (lvl: number) => {
      this.currentLevel = lvl;
      this.planetType = Math.min(lvl - 1, 6);
      this.resetPlanet();
      const colors = this.getLevelNebulaColors();
      if (this.nebula1) this.nebula1.setTint(colors.primary);
      if (this.nebula2) this.nebula2.setTint(colors.secondary);
      if (this.nebula3) this.nebula3.setTint(colors.core);
    };
    const onWarp = (durationMs: number = 4000) => { this.triggerWarpDrive(durationMs); };
    const onEvent = (evt: string) => { this.triggerCelestialEvent(evt); };

    this.game.events.on('background:setDrift', onDrift);
    this.game.events.on('background:setSpeedMultiplier', onSpeed);
    this.game.events.on('background:setLevel', onLevel);
    this.game.events.on('background:triggerWarp', onWarp);
    this.game.events.on('background:event', onEvent);

    // Event Cleanup on Shutdown
    this.events.once('shutdown', () => {
      this.game.events.off('background:setDrift', onDrift);
      this.game.events.off('background:setSpeedMultiplier', onSpeed);
      this.game.events.off('background:setLevel', onLevel);
      this.game.events.off('background:triggerWarp', onWarp);
      this.game.events.off('background:event', onEvent);
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

  private initDebris(width: number, height: number): void {
    this.debrisSprites = [];
    const debrisTextures = ['space_debris', 'debris_panel_1', 'debris_panel_2', 'debris_solar'];
    for (let i = 0; i < 8; i++) {
      const tex = Phaser.Utils.Array.GetRandom(debrisTextures);
      if (this.textures.exists(tex)) {
        const img = this.add.image(Phaser.Math.Between(0, width), Phaser.Math.Between(0, height), tex);
        img.setScale(Phaser.Math.FloatBetween(0.5, 1.0));
        img.setAlpha(Phaser.Math.FloatBetween(0.18, 0.42));
        img.setData('speed', Phaser.Math.FloatBetween(18, 42));
        img.setData('vRot', Phaser.Math.FloatBetween(-0.6, 0.6));
        this.debrisSprites.push(img);
      }
    }
  }

  private resetPlanet(): void {
    const width = this.scale.width;
    this.planetX = Phaser.Math.Between(width * 0.2, width * 0.8);
    this.planetY = -350;
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

  public triggerCelestialEvent(event: string): void {
    if (event === 'NEBULA_WAVE') {
      if (this.nebula1 && this.nebula2) {
        this.tweens.add({
          targets: [this.nebula1, this.nebula2],
          alpha: 0.26,
          duration: 1200,
          yoyo: true,
          ease: 'Sine.easeInOut',
        });
      }
    } else if (event === 'METEOR_STORM') {
      for (let i = 0; i < 6; i++) {
        this.time.delayedCall(i * 300, () => {
          const sx = Phaser.Math.Between(100, this.scale.width - 100);
          const meteor = this.add.graphics();
          meteor.lineStyle(2.5, 0xff0055, 0.85);
          meteor.lineBetween(sx, -20, sx - 80, 160);
          this.tweens.add({
            targets: meteor,
            alpha: 0,
            y: this.scale.height + 100,
            duration: 600,
            ease: 'Power2',
            onComplete: () => meteor.destroy(),
          });
        });
      }
    } else if (event === 'DEAD_FLEET') {
      for (let i = 0; i < 3; i++) {
        const derelict = this.add.image(
          Phaser.Math.Between(50, this.scale.width - 50),
          -80 - i * 120,
          'enemy_tank'
        );
        derelict.setScale(0.7);
        derelict.setAlpha(0.2);
        derelict.setTint(0x09090b);
        derelict.setAngle(Phaser.Math.Between(-35, 35));
        this.tweens.add({
          targets: derelict,
          y: this.scale.height + 120,
          rotation: derelict.rotation + 0.5,
          duration: Phaser.Math.Between(16000, 22000),
          onComplete: () => derelict.destroy(),
        });
      }
    } else if (event === 'VOID_DISTORTION') {
      this.cameras.main.shake(400, 0.003);
    } else if (event === 'BATTLEFRONT_SURGE') {
      for (let i = 0; i < 5; i++) {
        this.time.delayedCall(i * 350, () => {
          const fx = Phaser.Math.Between(50, this.scale.width - 50);
          const fy = Phaser.Math.Between(50, this.scale.height * 0.6);
          const flash = this.add.circle(fx, fy, Phaser.Math.Between(25, 55), 0xff0055, 0.35);
          flash.setBlendMode(Phaser.BlendModes.ADD);
          this.tweens.add({
            targets: flash,
            alpha: 0,
            scale: 1.8,
            duration: 500,
            onComplete: () => flash.destroy(),
          });
        });
      }
    } else if (event === 'CORE_ARENA') {
      if (this.nebula3) {
        this.tweens.add({
          targets: this.nebula3,
          alpha: 0.32,
          scale: 4.5,
          duration: 2000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      }
    }
  }

  update(time: number, delta: number): void {
    const dt = Math.min(delta / 1000, 0.05);
    const width = this.scale.width;
    const height = this.scale.height;
    const currentSpeed = this.speedMultiplier * this.warpFactor;

    // Layer 4 & 5: Hardware-Accelerated Sprite Nebulae (Zero CPU triangulation)
    if (this.nebula1) {
      this.nebula1.y += dt * 14 * currentSpeed;
      if (this.nebula1.y > height + 250) {
        this.nebula1.y = -250;
        this.nebula1.x = Phaser.Math.Between(width * 0.15, width * 0.45);
      }
    }

    if (this.nebula2) {
      this.nebula2.y += dt * 10 * currentSpeed;
      if (this.nebula2.y > height + 300) {
        this.nebula2.y = -300;
        this.nebula2.x = Phaser.Math.Between(width * 0.55, width * 0.85);
      }
    }

    if (this.nebula3) {
      this.nebula3.y += dt * 18 * currentSpeed;
      if (this.nebula3.y > height + 200) {
        this.nebula3.y = -200;
        this.nebula3.x = Phaser.Math.Between(width * 0.3, width * 0.7);
      }
    }

    // Drifting Space Debris Shards (Parallax Depth Layer)
    for (let i = 0; i < this.debrisSprites.length; i++) {
      const d = this.debrisSprites[i];
      const spd = (d.getData('speed') as number) || 25;
      const vRot = (d.getData('vRot') as number) || 0.2;
      d.y += spd * dt * currentSpeed;
      d.x -= this.horizontalDrift * 12 * dt;
      d.rotation += vRot * dt;

      if (d.y > height + 40) {
        d.y = -40;
        d.x = Phaser.Math.Between(0, width);
      }
      if (d.x < -40) d.x = width + 40;
      if (d.x > width + 40) d.x = -40;
    }

    // Layer 6: Distant Celestial Bodies (7 Sector Types)
    this.planetY += dt * 14 * currentSpeed;
    this.planetGraphics.clear();
    if (this.planetY > -140 && this.planetY < height + 140) {
      if (this.planetType === 0) {
        // Sector 1: Gas Giant with Atmospheric Bands & Planetary Rings
        this.planetGraphics.fillStyle(0x1e1b4b, 0.6);
        this.planetGraphics.fillCircle(this.planetX, this.planetY, 58);

        this.planetGraphics.fillStyle(0x312e81, 0.35);
        this.planetGraphics.fillRect(this.planetX - 54, this.planetY - 14, 108, 12);
        this.planetGraphics.fillRect(this.planetX - 52, this.planetY + 8, 104, 10);

        this.planetGraphics.lineStyle(4, 0x06b6d4, 0.35);
        this.planetGraphics.strokeEllipse(this.planetX, this.planetY, 140, 30);
        this.planetGraphics.lineStyle(1.5, 0x818cf8, 0.4);
        this.planetGraphics.strokeCircle(this.planetX, this.planetY, 58);
      } else if (this.planetType === 1) {
        // Sector 2: Molten Volcanic Planetoid with Magma Fissures
        this.planetGraphics.fillStyle(0x450a0a, 0.6);
        this.planetGraphics.fillCircle(this.planetX, this.planetY, 48);

        this.planetGraphics.lineStyle(2, 0xf97316, 0.5);
        this.planetGraphics.lineBetween(this.planetX - 25, this.planetY - 10, this.planetX + 15, this.planetY + 5);
        this.planetGraphics.lineBetween(this.planetX - 10, this.planetY + 15, this.planetX + 20, this.planetY + 25);

        this.planetGraphics.lineStyle(2.5, 0xef4444, 0.45);
        this.planetGraphics.strokeCircle(this.planetX, this.planetY, 48);
      } else if (this.planetType === 2) {
        // Sector 3: Shattered Asteroid Cluster
        this.planetGraphics.fillStyle(0x27272a, 0.65);
        this.planetGraphics.fillCircle(this.planetX, this.planetY, 32);
        this.planetGraphics.fillCircle(this.planetX - 28, this.planetY + 14, 18);
        this.planetGraphics.fillCircle(this.planetX + 32, this.planetY - 10, 14);

        this.planetGraphics.lineStyle(1.5, 0x71717a, 0.4);
        this.planetGraphics.strokeEllipse(this.planetX, this.planetY, 110, 22);
      } else if (this.planetType === 3) {
        // Sector 4: Derelict Orbital Station (Hexagonal Frame)
        this.planetGraphics.lineStyle(2.5, 0x475569, 0.55);
        this.planetGraphics.strokeRect(this.planetX - 35, this.planetY - 35, 70, 70);
        this.planetGraphics.lineBetween(this.planetX - 35, this.planetY, this.planetX + 35, this.planetY);
        this.planetGraphics.lineBetween(this.planetX, this.planetY - 35, this.planetX, this.planetY + 35);
        // Blinking Red Distress Beacon
        const beaconAlpha = (Math.sin(time * 0.005) + 1) * 0.4;
        this.planetGraphics.fillStyle(0xff0055, beaconAlpha);
        this.planetGraphics.fillCircle(this.planetX, this.planetY, 6);
      } else if (this.planetType === 4) {
        // Sector 5: Dark Void Singularity with Accretion Halo
        this.planetGraphics.fillStyle(0x020617, 0.9);
        this.planetGraphics.fillCircle(this.planetX, this.planetY, 48);

        this.planetGraphics.lineStyle(4, 0xbe123c, 0.5);
        this.planetGraphics.strokeCircle(this.planetX, this.planetY, 48);
        this.planetGraphics.lineStyle(2, 0xa855f7, 0.4);
        this.planetGraphics.strokeEllipse(this.planetX, this.planetY, 120, 26);
      } else if (this.planetType === 5) {
        // Sector 6: Binary Crimson Dwarf Star
        this.planetGraphics.fillStyle(0x991b1b, 0.7);
        this.planetGraphics.fillCircle(this.planetX - 22, this.planetY - 12, 38);
        this.planetGraphics.fillStyle(0xef4444, 0.65);
        this.planetGraphics.fillCircle(this.planetX + 24, this.planetY + 14, 28);

        this.planetGraphics.lineStyle(2, 0xff0055, 0.5);
        this.planetGraphics.strokeCircle(this.planetX - 22, this.planetY - 12, 40);
        this.planetGraphics.strokeCircle(this.planetX + 24, this.planetY + 14, 30);
      } else {
        // Sector 7: Nexus Core Cyber Citadel
        this.planetGraphics.fillStyle(0x030712, 0.85);
        this.planetGraphics.fillRect(this.planetX - 40, this.planetY - 40, 80, 80);
        this.planetGraphics.lineStyle(2, 0xff0033, 0.6);
        this.planetGraphics.strokeRect(this.planetX - 40, this.planetY - 40, 80, 80);
        this.planetGraphics.lineStyle(1.5, 0xdc2626, 0.4);
        this.planetGraphics.strokeCircle(this.planetX, this.planetY, 55);
      }
    } else if (this.planetY >= height + 140) {
      if (Math.random() < 0.008) {
        this.resetPlanet();
      }
    }

    // Consolidated Starfield & Cosmic Dust Pass (Single WebGL draw call, 60 FPS)
    this.starGraphics.clear();

    // Cosmic Dust
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

      this.starGraphics.fillStyle(0xff3366, d.alpha * 0.7);
      this.starGraphics.fillRect(d.x, d.y, d.size, d.size);
    }

    // Stars
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
      case 2: // Level 2: Deep Crimson Void
        return { primary: 0x4c0519, secondary: 0x3b0712, core: 0x180208 };
      case 3: // Level 3: Meteor Storm (Dark Charcoal & Intense Crimson Core)
        return { primary: 0x7f1d1d, secondary: 0x991b1b, core: 0x450a0a };
      case 4: // Level 4: Alien Front (Dark Void Emerald & Abyss)
        return { primary: 0x064e3b, secondary: 0x065f46, core: 0x022c22 };
      case 5: // Level 5: Void Zone (Deep Abyssal Purple)
        return { primary: 0x3b0764, secondary: 0x581c87, core: 0x1e0538 };
      case 6: // Level 6: Nebula Core (High-Speed Crimson & Dark Magenta)
        return { primary: 0x881337, secondary: 0x9f1239, core: 0x3f0615 };
      case 7: // Level 7: Final Sector (Pure Obsidian & High-Coherence Crimson)
        return { primary: 0x991b1b, secondary: 0x7f1d1d, core: 0x450a0a };
      default: // Level 1: Deep Obsidian / Carbon Void
        return { primary: 0x111827, secondary: 0x1f2937, core: 0x030712 };
    }
  }
}
