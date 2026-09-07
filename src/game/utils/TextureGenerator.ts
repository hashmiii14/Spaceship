import Phaser from 'phaser';

export class TextureGenerator {
  public static generateTextures(scene: Phaser.Scene): void {
    // 1. Player Ship (56 x 64)
    if (!scene.textures.exists('player_ship')) {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 72;
      const ctx = canvas.getContext('2d')!;

      // Glow effect
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 10;

      // Main Wings (Futuristic Delta)
      ctx.fillStyle = '#0a192f';
      ctx.beginPath();
      ctx.moveTo(32, 4);    // Nose
      ctx.lineTo(60, 56);   // Right wing tip
      ctx.lineTo(46, 52);   // Right wing recess
      ctx.lineTo(38, 64);   // Right engine
      ctx.lineTo(32, 58);   // Center rear
      ctx.lineTo(26, 64);   // Left engine
      ctx.lineTo(18, 52);   // Left wing recess
      ctx.lineTo(4, 56);    // Left wing tip
      ctx.closePath();
      ctx.fill();

      // Wing Armor Plating (Neon Cyan Trim)
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inner Wing Decals
      ctx.fillStyle = '#172a45';
      ctx.beginPath();
      ctx.moveTo(32, 14);
      ctx.lineTo(50, 50);
      ctx.lineTo(38, 48);
      ctx.lineTo(32, 52);
      ctx.lineTo(26, 48);
      ctx.lineTo(14, 50);
      ctx.closePath();
      ctx.fill();

      // Cockpit Canopy (Glowing Neon Cyan/White)
      const grad = ctx.createLinearGradient(32, 18, 32, 38);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.5, '#00f0ff');
      grad.addColorStop(1, '#00558f');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(32, 28, 6, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Wing Cannons
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(58, 40, 3, 14);
      ctx.fillRect(3, 40, 3, 14);

      // Engine Nozzles
      ctx.fillStyle = '#ff0055';
      ctx.fillRect(25, 62, 5, 4);
      ctx.fillRect(34, 62, 5, 4);

      scene.textures.addCanvas('player_ship', canvas);
    }

    // 2. Engine Glow Particle (16 x 16)
    if (!scene.textures.exists('engine_glow')) {
      const canvas = document.createElement('canvas');
      canvas.width = 16;
      canvas.height = 16;
      const ctx = canvas.getContext('2d')!;
      const grad = ctx.createRadialGradient(8, 8, 1, 8, 8, 8);
      grad.addColorStop(0, 'rgba(0, 240, 255, 1)');
      grad.addColorStop(0.4, 'rgba(0, 150, 255, 0.8)');
      grad.addColorStop(1, 'rgba(0, 100, 255, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 16, 16);
      scene.textures.addCanvas('engine_glow', canvas);
    }

    // 3. Player Lasers
    // Cyan Standard Bolt (8 x 24)
    if (!scene.textures.exists('laser_player')) {
      const canvas = document.createElement('canvas');
      canvas.width = 12;
      canvas.height = 28;
      const ctx = canvas.getContext('2d')!;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 8;
      const grad = ctx.createLinearGradient(6, 0, 6, 28);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.5, '#00f0ff');
      grad.addColorStop(1, 'rgba(0, 240, 255, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(6, 14, 4, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      scene.textures.addCanvas('laser_player', canvas);
    }

    // Heavy Magenta Laser (16 x 36)
    if (!scene.textures.exists('laser_heavy')) {
      const canvas = document.createElement('canvas');
      canvas.width = 18;
      canvas.height = 36;
      const ctx = canvas.getContext('2d')!;
      ctx.shadowColor = '#ff0055';
      ctx.shadowBlur = 12;
      const grad = ctx.createLinearGradient(9, 0, 9, 36);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.5, '#ff0055');
      grad.addColorStop(1, 'rgba(255, 0, 85, 0.2)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(9, 18, 6, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      scene.textures.addCanvas('laser_heavy', canvas);
    }

    // Triple Golden Laser (10 x 24)
    if (!scene.textures.exists('laser_triple')) {
      const canvas = document.createElement('canvas');
      canvas.width = 12;
      canvas.height = 24;
      const ctx = canvas.getContext('2d')!;
      ctx.shadowColor = '#ffb700';
      ctx.shadowBlur = 8;
      const grad = ctx.createLinearGradient(6, 0, 6, 24);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.6, '#ffb700');
      grad.addColorStop(1, 'rgba(255, 183, 0, 0.1)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(6, 12, 4, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      scene.textures.addCanvas('laser_triple', canvas);
    }

    // 4. Enemy Laser (Red/Orange plasma bolt)
    if (!scene.textures.exists('laser_enemy')) {
      const canvas = document.createElement('canvas');
      canvas.width = 12;
      canvas.height = 22;
      const ctx = canvas.getContext('2d')!;
      ctx.shadowColor = '#ff3b30';
      ctx.shadowBlur = 8;
      const grad = ctx.createRadialGradient(6, 11, 2, 6, 11, 8);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.5, '#ff3b30');
      grad.addColorStop(1, 'rgba(255, 59, 48, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(6, 11, 5, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      scene.textures.addCanvas('laser_enemy', canvas);
    }

    // 5. Enemy 1: Scout (Crimson Dart) (40 x 44)
    if (!scene.textures.exists('enemy_scout')) {
      const canvas = document.createElement('canvas');
      canvas.width = 44;
      canvas.height = 48;
      const ctx = canvas.getContext('2d')!;
      ctx.shadowColor = '#ff0055';
      ctx.shadowBlur = 8;

      ctx.fillStyle = '#1e050b';
      ctx.beginPath();
      ctx.moveTo(22, 44);   // Nose pointing down
      ctx.lineTo(4, 6);     // Left wing
      ctx.lineTo(16, 12);   // Inset
      ctx.lineTo(22, 8);    // Rear center
      ctx.lineTo(28, 12);
      ctx.lineTo(40, 6);    // Right wing
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#ff0055';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Glowing Cockpit
      ctx.fillStyle = '#ff3366';
      ctx.beginPath();
      ctx.arc(22, 26, 4, 0, Math.PI * 2);
      ctx.fill();

      scene.textures.addCanvas('enemy_scout', canvas);
    }

    // 6. Enemy 2: Striker (Golden Fast Interceptor) (36 x 40)
    if (!scene.textures.exists('enemy_striker')) {
      const canvas = document.createElement('canvas');
      canvas.width = 40;
      canvas.height = 44;
      const ctx = canvas.getContext('2d')!;
      ctx.shadowColor = '#ffcc00';
      ctx.shadowBlur = 8;

      ctx.fillStyle = '#1a1403';
      ctx.beginPath();
      ctx.moveTo(20, 42);
      ctx.lineTo(38, 10);
      ctx.lineTo(30, 4);
      ctx.lineTo(20, 14);
      ctx.lineTo(10, 4);
      ctx.lineTo(2, 10);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#ffcc00';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(18, 16, 4, 12);

      scene.textures.addCanvas('enemy_striker', canvas);
    }

    // 7. Enemy 3: Cruiser (Heavy Armored Warship) (58 x 62)
    if (!scene.textures.exists('enemy_cruiser')) {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 68;
      const ctx = canvas.getContext('2d')!;
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 10;

      ctx.fillStyle = '#160b29';
      ctx.beginPath();
      ctx.moveTo(32, 64);   // Front ram
      ctx.lineTo(58, 40);
      ctx.lineTo(58, 10);
      ctx.lineTo(42, 4);
      ctx.lineTo(32, 12);
      ctx.lineTo(22, 4);
      ctx.lineTo(6, 10);
      ctx.lineTo(6, 40);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Armor plating lines
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(16, 20, 32, 22);

      // Core Reactor
      const radGrad = ctx.createRadialGradient(32, 31, 2, 32, 31, 8);
      radGrad.addColorStop(0, '#ffffff');
      radGrad.addColorStop(0.5, '#c084fc');
      radGrad.addColorStop(1, '#581c87');
      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(32, 31, 8, 0, Math.PI * 2);
      ctx.fill();

      scene.textures.addCanvas('enemy_cruiser', canvas);
    }

    // 8. Enemy 4: Gunship (Cyan Shooter) (48 x 50)
    if (!scene.textures.exists('enemy_gunship')) {
      const canvas = document.createElement('canvas');
      canvas.width = 52;
      canvas.height = 54;
      const ctx = canvas.getContext('2d')!;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 8;

      ctx.fillStyle = '#041f29';
      ctx.beginPath();
      ctx.moveTo(26, 50);
      ctx.lineTo(48, 22);
      ctx.lineTo(44, 6);
      ctx.lineTo(32, 10);
      ctx.lineTo(26, 4);
      ctx.lineTo(20, 10);
      ctx.lineTo(8, 6);
      ctx.lineTo(4, 22);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Dual forward cannons
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(14, 40, 4, 10);
      ctx.fillRect(34, 40, 4, 10);

      scene.textures.addCanvas('enemy_gunship', canvas);
    }

    // 9. Enemy 5: Reaper Elite (Crimson & Gold Flagship) (62 x 64)
    if (!scene.textures.exists('enemy_reaper')) {
      const canvas = document.createElement('canvas');
      canvas.width = 68;
      canvas.height = 70;
      const ctx = canvas.getContext('2d')!;
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 12;

      ctx.fillStyle = '#1c040d';
      ctx.beginPath();
      ctx.moveTo(34, 66);
      ctx.lineTo(64, 30);
      ctx.lineTo(54, 8);
      ctx.lineTo(42, 16);
      ctx.lineTo(34, 6);
      ctx.lineTo(26, 16);
      ctx.lineTo(14, 8);
      ctx.lineTo(4, 30);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#fb7185';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Energy Shield Rings
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(34, 34, 14, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#fb7185';
      ctx.beginPath();
      ctx.arc(34, 34, 6, 0, Math.PI * 2);
      ctx.fill();

      scene.textures.addCanvas('enemy_reaper', canvas);
    }

    // 10. Boss: Omega Mothership (180 x 140)
    if (!scene.textures.exists('boss_mothership')) {
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 160;
      const ctx = canvas.getContext('2d')!;
      ctx.shadowColor = '#ff0055';
      ctx.shadowBlur = 16;

      // Colossal Battleship Hull
      ctx.fillStyle = '#0f0517';
      ctx.beginPath();
      ctx.moveTo(100, 154);  // Front Main Ram / Cannon
      ctx.lineTo(135, 125);
      ctx.lineTo(185, 100);  // Outer Right Wing Tip
      ctx.lineTo(195, 45);
      ctx.lineTo(165, 30);
      ctx.lineTo(140, 48);
      ctx.lineTo(120, 20);   // Rear center right
      ctx.lineTo(100, 32);   // Engine bay center
      ctx.lineTo(80, 20);    // Rear center left
      ctx.lineTo(60, 48);
      ctx.lineTo(35, 30);
      ctx.lineTo(5, 45);
      ctx.lineTo(15, 100);   // Outer Left Wing Tip
      ctx.lineTo(65, 125);
      ctx.closePath();
      ctx.fill();

      // Armored Plating Trim
      ctx.strokeStyle = '#ff0055';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Inner Deck Hull Structure
      ctx.fillStyle = '#1d0b2e';
      ctx.beginPath();
      ctx.moveTo(100, 130);
      ctx.lineTo(140, 95);
      ctx.lineTo(140, 55);
      ctx.lineTo(100, 45);
      ctx.lineTo(60, 55);
      ctx.lineTo(60, 95);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#9333ea';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Glowing Hyperdrive Reactor Core
      const coreGrad = ctx.createRadialGradient(100, 85, 4, 100, 85, 24);
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.3, '#f43f5e');
      coreGrad.addColorStop(0.7, '#8b5cf6');
      coreGrad.addColorStop(1, 'rgba(139, 92, 246, 0.1)');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(100, 85, 24, 0, Math.PI * 2);
      ctx.fill();

      // Turret Emplacements
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(45, 95, 8, 16);
      ctx.fillRect(147, 95, 8, 16);
      ctx.fillRect(96, 142, 8, 16);

      scene.textures.addCanvas('boss_mothership', canvas);
    }

    // 11. Boss Energy Sphere (24 x 24)
    if (!scene.textures.exists('boss_bullet')) {
      const canvas = document.createElement('canvas');
      canvas.width = 28;
      canvas.height = 28;
      const ctx = canvas.getContext('2d')!;
      ctx.shadowColor = '#d946ef';
      ctx.shadowBlur = 12;
      const grad = ctx.createRadialGradient(14, 14, 2, 14, 14, 12);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.4, '#d946ef');
      grad.addColorStop(0.8, '#8b5cf6');
      grad.addColorStop(1, 'rgba(139, 92, 246, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(14, 14, 12, 0, Math.PI * 2);
      ctx.fill();
      scene.textures.addCanvas('boss_bullet', canvas);
    }

    // 12. Asteroids (Large: 64x64, Medium: 40x40, Small: 24x24)
    const generateAsteroidCanvas = (size: number, key: string) => {
      if (scene.textures.exists(key)) return;
      const canvas = document.createElement('canvas');
      canvas.width = size + 12;
      canvas.height = size + 12;
      const ctx = canvas.getContext('2d')!;
      const center = canvas.width / 2;
      const radius = size / 2;
      const numPoints = 10;

      ctx.fillStyle = '#27272a';
      ctx.beginPath();
      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        // Deterministic pseudo-random variation
        const offset = Math.sin(i * 2.8) * (radius * 0.25);
        const r = radius + offset;
        const x = center + Math.cos(angle) * r;
        const y = center + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();

      // Shading & Craters
      ctx.strokeStyle = '#52525b';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.arc(center - radius * 0.3, center - radius * 0.2, radius * 0.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(center + radius * 0.25, center + radius * 0.25, radius * 0.18, 0, Math.PI * 2);
      ctx.fill();

      // Glowing crystal ore vein
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(center - radius * 0.4, center + radius * 0.3);
      ctx.lineTo(center, center);
      ctx.lineTo(center + radius * 0.4, center - radius * 0.2);
      ctx.stroke();

      scene.textures.addCanvas(key, canvas);
    };

    generateAsteroidCanvas(60, 'asteroid_large');
    generateAsteroidCanvas(36, 'asteroid_medium');
    generateAsteroidCanvas(20, 'asteroid_small');

    // 13. Power-Ups (36 x 36)
    const powerUps = [
      { key: 'powerup_shield', color: '#00f0ff', symbol: 'S' },
      { key: 'powerup_rapid', color: '#facc15', symbol: 'R' },
      { key: 'powerup_damage', color: '#ec4899', symbol: 'D' },
      { key: 'powerup_triple', color: '#fb923c', symbol: 'T' },
      { key: 'powerup_health', color: '#22c55e', symbol: '+' },
      { key: 'powerup_score', color: '#a855f7', symbol: '2X' },
    ];

    powerUps.forEach(({ key, color, symbol }) => {
      if (scene.textures.exists(key)) return;
      const canvas = document.createElement('canvas');
      canvas.width = 40;
      canvas.height = 40;
      const ctx = canvas.getContext('2d')!;

      // Outer Glow
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;

      // Hexagonal / Octagonal Badge
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      const r = 16;
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const x = 20 + Math.cos(angle) * r;
        const y = 20 + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Symbol Text
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px Rajdhani, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(symbol, 20, 20);

      scene.textures.addCanvas(key, canvas);
    });

    // 14. Shield Forcefield Dome (80 x 80)
    if (!scene.textures.exists('shield_bubble')) {
      const canvas = document.createElement('canvas');
      canvas.width = 88;
      canvas.height = 88;
      const ctx = canvas.getContext('2d')!;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 14;

      const grad = ctx.createRadialGradient(44, 44, 24, 44, 44, 40);
      grad.addColorStop(0, 'rgba(0, 240, 255, 0.05)');
      grad.addColorStop(0.8, 'rgba(0, 240, 255, 0.25)');
      grad.addColorStop(1, 'rgba(0, 240, 255, 0.85)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(44, 44, 40, 0, Math.PI * 2);
      ctx.fill();

      // Hex pattern accents
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 2;
      ctx.stroke();

      scene.textures.addCanvas('shield_bubble', canvas);
    }

    // 15. Spark / Particle (8 x 8)
    if (!scene.textures.exists('spark')) {
      const canvas = document.createElement('canvas');
      canvas.width = 8;
      canvas.height = 8;
      const ctx = canvas.getContext('2d')!;
      const grad = ctx.createRadialGradient(4, 4, 1, 4, 4, 4);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.5, '#00f0ff');
      grad.addColorStop(1, 'rgba(0, 240, 255, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 8, 8);
      scene.textures.addCanvas('spark', canvas);
    }

    // 16. Smoke Particle (16 x 16)
    if (!scene.textures.exists('smoke')) {
      const canvas = document.createElement('canvas');
      canvas.width = 16;
      canvas.height = 16;
      const ctx = canvas.getContext('2d')!;
      const grad = ctx.createRadialGradient(8, 8, 2, 8, 8, 8);
      grad.addColorStop(0, 'rgba(200, 200, 220, 0.6)');
      grad.addColorStop(0.6, 'rgba(100, 100, 120, 0.3)');
      grad.addColorStop(1, 'rgba(50, 50, 60, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 16, 16);
      scene.textures.addCanvas('smoke', canvas);
    }

    // 17. Shockwave Ring (64 x 64)
    if (!scene.textures.exists('shockwave')) {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(32, 32, 28, 0, Math.PI * 2);
      ctx.stroke();
      scene.textures.addCanvas('shockwave', canvas);
    }
  }
}
