import Phaser from 'phaser';
import { ShipSkinId } from '../../types/game';

export class TextureGenerator {
  public static generateTextures(scene: Phaser.Scene): void {
    // 1. Player Ship Skins (5 Varieties: NEON, VOID, SOLAR, CRIMSON, CYBER)
    const skinThemes: Record<ShipSkinId, { primary: string; secondary: string; trim: string; glow: string; cockpit: string; engine: string }> = {
      NEON: {
        primary: '#0a192f',
        secondary: '#172a45',
        trim: '#00f0ff',
        glow: '#00f0ff',
        cockpit: '#00f0ff',
        engine: '#00f0ff',
      },
      VOID: {
        primary: '#120726',
        secondary: '#250f4a',
        trim: '#c084fc',
        glow: '#a855f7',
        cockpit: '#e9d5ff',
        engine: '#9333ea',
      },
      SOLAR: {
        primary: '#241402',
        secondary: '#451a03',
        trim: '#facc15',
        glow: '#fb923c',
        cockpit: '#fef08a',
        engine: '#f97316',
      },
      CRIMSON: {
        primary: '#1c050d',
        secondary: '#3b0717',
        trim: '#f43f5e',
        glow: '#ff0055',
        cockpit: '#fecdd3',
        engine: '#ff0055',
      },
      CYBER: {
        primary: '#022117',
        secondary: '#064e3b',
        trim: '#10b981',
        glow: '#34d399',
        cockpit: '#a7f3d0',
        engine: '#059669',
      },
    };

    (Object.keys(skinThemes) as ShipSkinId[]).forEach((skinKey) => {
      const theme = skinThemes[skinKey];
      const texKey = `player_ship_${skinKey.toLowerCase()}`;

      if (!scene.textures.exists(texKey)) {
        const canvas = document.createElement('canvas');
        canvas.width = 72;
        canvas.height = 80;
        const ctx = canvas.getContext('2d')!;

        ctx.shadowColor = theme.glow;
        ctx.shadowBlur = 12;

        // Main Hull
        ctx.fillStyle = theme.primary;
        ctx.beginPath();
        ctx.moveTo(36, 4);     // Nose tip
        ctx.lineTo(68, 62);    // Right wing tip
        ctx.lineTo(52, 58);    // Wing recess
        ctx.lineTo(44, 72);    // Right engine nozzle
        ctx.lineTo(36, 66);    // Center rear
        ctx.lineTo(28, 72);    // Left engine nozzle
        ctx.lineTo(20, 58);    // Left wing recess
        ctx.lineTo(4, 62);     // Left wing tip
        ctx.closePath();
        ctx.fill();

        // Neon Trim Outline
        ctx.strokeStyle = theme.trim;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Inner Hull Armor Layer
        ctx.fillStyle = theme.secondary;
        ctx.beginPath();
        ctx.moveTo(36, 16);
        ctx.lineTo(56, 56);
        ctx.lineTo(44, 54);
        ctx.lineTo(36, 60);
        ctx.lineTo(28, 54);
        ctx.lineTo(16, 56);
        ctx.closePath();
        ctx.fill();

        // High-tech Wings Accents
        ctx.strokeStyle = theme.trim;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(36, 26);
        ctx.lineTo(36, 56);
        ctx.moveTo(22, 44);
        ctx.lineTo(50, 44);
        ctx.stroke();

        // Cockpit Canopy (Glow Glass)
        const cockpitGrad = ctx.createLinearGradient(36, 20, 36, 42);
        cockpitGrad.addColorStop(0, '#ffffff');
        cockpitGrad.addColorStop(0.5, theme.cockpit);
        cockpitGrad.addColorStop(1, theme.primary);
        ctx.fillStyle = cockpitGrad;
        ctx.beginPath();
        ctx.ellipse(36, 32, 7, 15, 0, 0, Math.PI * 2);
        ctx.fill();

        // Dual Wing Laser Cannons
        ctx.fillStyle = theme.trim;
        ctx.fillRect(66, 44, 4, 16);
        ctx.fillRect(2, 44, 4, 16);

        // Twin Engine Flame Ports
        ctx.fillStyle = theme.engine;
        ctx.fillRect(27, 70, 6, 6);
        ctx.fillRect(39, 70, 6, 6);

        scene.textures.addCanvas(texKey, canvas);
        if (!scene.textures.exists(`player_ship_${skinKey}`)) {
          scene.textures.addCanvas(`player_ship_${skinKey}`, canvas);
        }
        if (skinKey === 'NEON' && !scene.textures.exists('player_ship')) {
          scene.textures.addCanvas('player_ship', canvas);
        }
      }

      // Engine Glow Particle for each skin
      const engineKey = `engine_glow_${skinKey}`;
      if (!scene.textures.exists(engineKey)) {
        const canvas = document.createElement('canvas');
        canvas.width = 20;
        canvas.height = 20;
        const ctx = canvas.getContext('2d')!;
        const grad = ctx.createRadialGradient(10, 10, 1, 10, 10, 10);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.4, theme.engine);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 20, 20);
        scene.textures.addCanvas(engineKey, canvas);
      }
    });

    // Default alias
    if (!scene.textures.exists('player_ship')) {
      const defaultCanvas = scene.textures.get('player_ship_NEON').getSourceImage() as HTMLCanvasElement;
      if (defaultCanvas) {
        scene.textures.addCanvas('player_ship', defaultCanvas);
      }
    }
    if (!scene.textures.exists('engine_glow')) {
      const defaultEngine = scene.textures.get('engine_glow_NEON').getSourceImage() as HTMLCanvasElement;
      if (defaultEngine) {
        scene.textures.addCanvas('engine_glow', defaultEngine);
      }
    }

    // 2. Player Weapon Projectiles (7 Weapons)
    // 2.1 Blaster (Standard Neon Cyan) (12 x 30)
    if (!scene.textures.exists('laser_blaster')) {
      const canvas = document.createElement('canvas');
      canvas.width = 14;
      canvas.height = 32;
      const ctx = canvas.getContext('2d')!;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 10;
      const grad = ctx.createLinearGradient(7, 0, 7, 32);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.4, '#00f0ff');
      grad.addColorStop(1, 'rgba(0, 240, 255, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(7, 16, 5, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      scene.textures.addCanvas('laser_blaster', canvas);
      scene.textures.addCanvas('laser_player', canvas);
    }

    // 2.2 Rapid Fire Needle (Yellow/Gold) (8 x 26)
    if (!scene.textures.exists('laser_rapid')) {
      const canvas = document.createElement('canvas');
      canvas.width = 10;
      canvas.height = 26;
      const ctx = canvas.getContext('2d')!;
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 8;
      const grad = ctx.createLinearGradient(5, 0, 5, 26);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.5, '#facc15');
      grad.addColorStop(1, 'rgba(250, 204, 21, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(5, 13, 3.5, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      scene.textures.addCanvas('laser_rapid', canvas);
    }

    // 2.3 Double Shot Heavy (Cyan/White) (16 x 34)
    if (!scene.textures.exists('laser_double')) {
      const canvas = document.createElement('canvas');
      canvas.width = 18;
      canvas.height = 36;
      const ctx = canvas.getContext('2d')!;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
      const grad = ctx.createLinearGradient(9, 0, 9, 36);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.5, '#0284c7');
      grad.addColorStop(1, 'rgba(2, 132, 199, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(9, 18, 6, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      scene.textures.addCanvas('laser_double', canvas);
    }

    // 2.4 Triple Shot (Orange Gold) (12 x 28)
    if (!scene.textures.exists('laser_triple')) {
      const canvas = document.createElement('canvas');
      canvas.width = 14;
      canvas.height = 28;
      const ctx = canvas.getContext('2d')!;
      ctx.shadowColor = '#fb923c';
      ctx.shadowBlur = 10;
      const grad = ctx.createLinearGradient(7, 0, 7, 28);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.5, '#ea580c');
      grad.addColorStop(1, 'rgba(234, 88, 12, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(7, 14, 5, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      scene.textures.addCanvas('laser_triple', canvas);
    }

    // 2.5 Spread Shot (Emerald Green) (12 x 24)
    if (!scene.textures.exists('laser_spread')) {
      const canvas = document.createElement('canvas');
      canvas.width = 14;
      canvas.height = 26;
      const ctx = canvas.getContext('2d')!;
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 9;
      const grad = ctx.createLinearGradient(7, 0, 7, 26);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.5, '#059669');
      grad.addColorStop(1, 'rgba(5, 150, 105, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(7, 13, 4.5, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      scene.textures.addCanvas('laser_spread', canvas);
    }

    // 2.6 Hyperbeam (Magenta Piercing Beam) (20 x 48)
    if (!scene.textures.exists('laser_hyperbeam')) {
      const canvas = document.createElement('canvas');
      canvas.width = 22;
      canvas.height = 52;
      const ctx = canvas.getContext('2d')!;
      ctx.shadowColor = '#ff0055';
      ctx.shadowBlur = 16;
      const grad = ctx.createLinearGradient(11, 0, 11, 52);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.4, '#ff0055');
      grad.addColorStop(1, 'rgba(255, 0, 85, 0.1)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(11, 26, 7, 24, 0, 0, Math.PI * 2);
      ctx.fill();
      scene.textures.addCanvas('laser_hyperbeam', canvas);
      scene.textures.addCanvas('laser_heavy', canvas);
    }

    // 2.7 Plasma Shot (Massive Swirling Orb) (32 x 32)
    if (!scene.textures.exists('laser_plasma')) {
      const canvas = document.createElement('canvas');
      canvas.width = 36;
      canvas.height = 36;
      const ctx = canvas.getContext('2d')!;
      ctx.shadowColor = '#818cf8';
      ctx.shadowBlur = 16;
      const grad = ctx.createRadialGradient(18, 18, 2, 18, 18, 16);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.4, '#6366f1');
      grad.addColorStop(0.8, '#4338ca');
      grad.addColorStop(1, 'rgba(67, 56, 202, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(18, 18, 16, 0, Math.PI * 2);
      ctx.fill();
      scene.textures.addCanvas('laser_plasma', canvas);
    }

    // 3. Enemy Textures (6 Archetypes)
    // 3.1 Scout (Crimson Dart) (44 x 48)
    if (!scene.textures.exists('enemy_scout')) {
      const canvas = document.createElement('canvas');
      canvas.width = 44;
      canvas.height = 48;
      const ctx = canvas.getContext('2d')!;
      ctx.shadowColor = '#ff0055';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#1e050b';
      ctx.beginPath();
      ctx.moveTo(22, 44);
      ctx.lineTo(4, 6);
      ctx.lineTo(16, 12);
      ctx.lineTo(22, 8);
      ctx.lineTo(28, 12);
      ctx.lineTo(40, 6);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#ff0055';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#ff3366';
      ctx.beginPath();
      ctx.arc(22, 26, 4, 0, Math.PI * 2);
      ctx.fill();
      scene.textures.addCanvas('enemy_scout', canvas);
    }

    // 3.2 Interceptor (Golden Striker) (42 x 46)
    if (!scene.textures.exists('enemy_interceptor')) {
      const canvas = document.createElement('canvas');
      canvas.width = 44;
      canvas.height = 48;
      const ctx = canvas.getContext('2d')!;
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#1c1502';
      ctx.beginPath();
      ctx.moveTo(22, 46);
      ctx.lineTo(42, 12);
      ctx.lineTo(34, 4);
      ctx.lineTo(22, 16);
      ctx.lineTo(10, 4);
      ctx.lineTo(2, 12);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(20, 18, 4, 14);
      scene.textures.addCanvas('enemy_interceptor', canvas);
      scene.textures.addCanvas('enemy_striker', canvas);
    }

    // 3.3 Tank (Dreadnought Fortress) (68 x 72)
    if (!scene.textures.exists('enemy_tank')) {
      const canvas = document.createElement('canvas');
      canvas.width = 72;
      canvas.height = 76;
      const ctx = canvas.getContext('2d')!;
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#18072b';
      ctx.beginPath();
      ctx.moveTo(36, 70);
      ctx.lineTo(66, 44);
      ctx.lineTo(66, 12);
      ctx.lineTo(48, 4);
      ctx.lineTo(36, 14);
      ctx.lineTo(24, 4);
      ctx.lineTo(6, 12);
      ctx.lineTo(6, 44);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#9333ea';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(18, 22, 36, 24);
      const radGrad = ctx.createRadialGradient(36, 34, 2, 36, 34, 10);
      radGrad.addColorStop(0, '#ffffff');
      radGrad.addColorStop(0.5, '#c084fc');
      radGrad.addColorStop(1, '#581c87');
      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(36, 34, 10, 0, Math.PI * 2);
      ctx.fill();
      scene.textures.addCanvas('enemy_tank', canvas);
      scene.textures.addCanvas('enemy_cruiser', canvas);
    }

    // 3.4 Shooter (Tactical Gunship) (52 x 56)
    if (!scene.textures.exists('enemy_shooter')) {
      const canvas = document.createElement('canvas');
      canvas.width = 56;
      canvas.height = 60;
      const ctx = canvas.getContext('2d')!;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 9;
      ctx.fillStyle = '#031c26';
      ctx.beginPath();
      ctx.moveTo(28, 54);
      ctx.lineTo(52, 24);
      ctx.lineTo(46, 6);
      ctx.lineTo(34, 12);
      ctx.lineTo(28, 4);
      ctx.lineTo(22, 12);
      ctx.lineTo(10, 6);
      ctx.lineTo(4, 24);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#0891b2';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(16, 42, 5, 12);
      ctx.fillRect(35, 42, 5, 12);
      scene.textures.addCanvas('enemy_shooter', canvas);
      scene.textures.addCanvas('enemy_gunship', canvas);
    }

    // 3.5 Bomber (Kamikaze Volatile Drone) (40 x 44)
    if (!scene.textures.exists('enemy_bomber')) {
      const canvas = document.createElement('canvas');
      canvas.width = 44;
      canvas.height = 48;
      const ctx = canvas.getContext('2d')!;
      ctx.shadowColor = '#ea580c';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#260a02';
      ctx.beginPath();
      ctx.moveTo(22, 46);
      ctx.lineTo(40, 10);
      ctx.lineTo(22, 20);
      ctx.lineTo(4, 10);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      const nukeGrad = ctx.createRadialGradient(22, 28, 1, 22, 28, 8);
      nukeGrad.addColorStop(0, '#ffffff');
      nukeGrad.addColorStop(0.5, '#f97316');
      nukeGrad.addColorStop(1, '#9a3412');
      ctx.fillStyle = nukeGrad;
      ctx.beginPath();
      ctx.arc(22, 28, 8, 0, Math.PI * 2);
      ctx.fill();
      scene.textures.addCanvas('enemy_bomber', canvas);
    }

    // 3.6 Elite Reaper (Shielded Crimson Flagship) (72 x 76)
    if (!scene.textures.exists('enemy_elite')) {
      const canvas = document.createElement('canvas');
      canvas.width = 76;
      canvas.height = 80;
      const ctx = canvas.getContext('2d')!;
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#1c030d';
      ctx.beginPath();
      ctx.moveTo(38, 74);
      ctx.lineTo(72, 34);
      ctx.lineTo(60, 8);
      ctx.lineTo(48, 18);
      ctx.lineTo(38, 6);
      ctx.lineTo(28, 18);
      ctx.lineTo(16, 8);
      ctx.lineTo(4, 34);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#fb7185';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(38, 38, 16, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#fb7185';
      ctx.beginPath();
      ctx.arc(38, 38, 7, 0, Math.PI * 2);
      ctx.fill();
      scene.textures.addCanvas('enemy_elite', canvas);
      scene.textures.addCanvas('enemy_reaper', canvas);
    }

    // 4. Enemy Weapons
    if (!scene.textures.exists('laser_enemy')) {
      const canvas = document.createElement('canvas');
      canvas.width = 12;
      canvas.height = 24;
      const ctx = canvas.getContext('2d')!;
      ctx.shadowColor = '#ff0055';
      ctx.shadowBlur = 8;
      const grad = ctx.createRadialGradient(6, 12, 2, 6, 12, 8);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.5, '#ff0055');
      grad.addColorStop(1, 'rgba(255, 0, 85, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(6, 12, 5, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      scene.textures.addCanvas('laser_enemy', canvas);
    }

    if (!scene.textures.exists('boss_bullet')) {
      const canvas = document.createElement('canvas');
      canvas.width = 30;
      canvas.height = 30;
      const ctx = canvas.getContext('2d')!;
      ctx.shadowColor = '#d946ef';
      ctx.shadowBlur = 14;
      const grad = ctx.createRadialGradient(15, 15, 3, 15, 15, 14);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.4, '#d946ef');
      grad.addColorStop(0.8, '#8b5cf6');
      grad.addColorStop(1, 'rgba(139, 92, 246, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(15, 15, 14, 0, Math.PI * 2);
      ctx.fill();
      scene.textures.addCanvas('boss_bullet', canvas);
    }

    // 5. Boss Textures (4 Unique Bosses)
    // 5.1 Boss 1: VOID DESTROYER (210 x 170)
    if (!scene.textures.exists('boss_void_destroyer')) {
      const canvas = document.createElement('canvas');
      canvas.width = 220;
      canvas.height = 180;
      const ctx = canvas.getContext('2d')!;
      ctx.shadowColor = '#9333ea';
      ctx.shadowBlur = 18;
      ctx.fillStyle = '#0f041c';
      ctx.beginPath();
      ctx.moveTo(110, 172);
      ctx.lineTo(150, 140);
      ctx.lineTo(205, 110);
      ctx.lineTo(215, 45);
      ctx.lineTo(180, 30);
      ctx.lineTo(150, 50);
      ctx.lineTo(130, 20);
      ctx.lineTo(110, 32);
      ctx.lineTo(90, 20);
      ctx.lineTo(70, 50);
      ctx.lineTo(40, 30);
      ctx.lineTo(5, 45);
      ctx.lineTo(15, 110);
      ctx.lineTo(70, 140);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 3.5;
      ctx.stroke();
      const core = ctx.createRadialGradient(110, 95, 4, 110, 95, 28);
      core.addColorStop(0, '#ffffff');
      core.addColorStop(0.3, '#c084fc');
      core.addColorStop(0.7, '#7e22ce');
      core.addColorStop(1, 'rgba(126, 34, 206, 0.1)');
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(110, 95, 28, 0, Math.PI * 2);
      ctx.fill();
      scene.textures.addCanvas('boss_void_destroyer', canvas);
      scene.textures.addCanvas('boss_mothership', canvas);
    }

    // 5.2 Boss 2: NEBULA QUEEN (230 x 180)
    if (!scene.textures.exists('boss_nebula_queen')) {
      const canvas = document.createElement('canvas');
      canvas.width = 240;
      canvas.height = 190;
      const ctx = canvas.getContext('2d')!;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 18;
      ctx.fillStyle = '#031b26';
      ctx.beginPath();
      ctx.moveTo(120, 180);
      ctx.lineTo(170, 130);
      ctx.lineTo(230, 90);
      ctx.lineTo(220, 35);
      ctx.lineTo(180, 20);
      ctx.lineTo(155, 45);
      ctx.lineTo(120, 15);
      ctx.lineTo(85, 45);
      ctx.lineTo(60, 20);
      ctx.lineTo(20, 35);
      ctx.lineTo(10, 90);
      ctx.lineTo(70, 130);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 3.5;
      ctx.stroke();
      const qCore = ctx.createRadialGradient(120, 90, 4, 120, 90, 30);
      qCore.addColorStop(0, '#ffffff');
      qCore.addColorStop(0.3, '#22d3ee');
      qCore.addColorStop(0.8, '#0891b2');
      qCore.addColorStop(1, 'rgba(8, 145, 178, 0)');
      ctx.fillStyle = qCore;
      ctx.beginPath();
      ctx.arc(120, 90, 30, 0, Math.PI * 2);
      ctx.fill();
      scene.textures.addCanvas('boss_nebula_queen', canvas);
    }

    // 5.3 Boss 3: STAR EATER (240 x 180)
    if (!scene.textures.exists('boss_star_eater')) {
      const canvas = document.createElement('canvas');
      canvas.width = 250;
      canvas.height = 190;
      const ctx = canvas.getContext('2d')!;
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 20;
      ctx.fillStyle = '#260a02';
      ctx.beginPath();
      ctx.moveTo(125, 184);
      ctx.lineTo(180, 135);
      ctx.lineTo(240, 100);
      ctx.lineTo(235, 40);
      ctx.lineTo(190, 25);
      ctx.lineTo(160, 50);
      ctx.lineTo(125, 18);
      ctx.lineTo(90, 50);
      ctx.lineTo(60, 25);
      ctx.lineTo(15, 40);
      ctx.lineTo(10, 100);
      ctx.lineTo(70, 135);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#fb923c';
      ctx.lineWidth = 4;
      ctx.stroke();
      const sCore = ctx.createRadialGradient(125, 95, 5, 125, 95, 32);
      sCore.addColorStop(0, '#ffffff');
      sCore.addColorStop(0.4, '#f97316');
      sCore.addColorStop(0.8, '#b45309');
      sCore.addColorStop(1, 'rgba(180, 83, 9, 0)');
      ctx.fillStyle = sCore;
      ctx.beginPath();
      ctx.arc(125, 95, 32, 0, Math.PI * 2);
      ctx.fill();
      scene.textures.addCanvas('boss_star_eater', canvas);
    }

    // 5.4 Boss 4: GALACTIC CORE (250 x 190)
    if (!scene.textures.exists('boss_galactic_core')) {
      const canvas = document.createElement('canvas');
      canvas.width = 260;
      canvas.height = 200;
      const ctx = canvas.getContext('2d')!;
      ctx.shadowColor = '#ec4899';
      ctx.shadowBlur = 22;
      ctx.fillStyle = '#1c0316';
      ctx.beginPath();
      ctx.moveTo(130, 192);
      ctx.lineTo(190, 140);
      ctx.lineTo(250, 105);
      ctx.lineTo(245, 45);
      ctx.lineTo(195, 25);
      ctx.lineTo(165, 52);
      ctx.lineTo(130, 20);
      ctx.lineTo(95, 52);
      ctx.lineTo(65, 25);
      ctx.lineTo(15, 45);
      ctx.lineTo(10, 105);
      ctx.lineTo(70, 140);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#f472b6';
      ctx.lineWidth = 4;
      ctx.stroke();
      const gCore = ctx.createRadialGradient(130, 100, 6, 130, 100, 36);
      gCore.addColorStop(0, '#ffffff');
      gCore.addColorStop(0.3, '#ec4899');
      gCore.addColorStop(0.7, '#be185d');
      gCore.addColorStop(1, 'rgba(190, 24, 93, 0)');
      ctx.fillStyle = gCore;
      ctx.beginPath();
      ctx.arc(130, 100, 36, 0, Math.PI * 2);
      ctx.fill();
      scene.textures.addCanvas('boss_galactic_core', canvas);
    }

    // 6. Asteroids (3 Sizes)
    const generateAsteroidCanvas = (size: number, key: string) => {
      if (scene.textures.exists(key)) return;
      const canvas = document.createElement('canvas');
      canvas.width = size + 14;
      canvas.height = size + 14;
      const ctx = canvas.getContext('2d')!;
      const center = canvas.width / 2;
      const radius = size / 2;
      const numPoints = 12;

      ctx.fillStyle = '#27272a';
      ctx.beginPath();
      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        const offset = Math.sin(i * 2.8) * (radius * 0.25);
        const r = radius + offset;
        const x = center + Math.cos(angle) * r;
        const y = center + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#71717a';
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
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(center - radius * 0.4, center + radius * 0.3);
      ctx.lineTo(center, center);
      ctx.lineTo(center + radius * 0.4, center - radius * 0.2);
      ctx.stroke();

      scene.textures.addCanvas(key, canvas);
    };

    generateAsteroidCanvas(64, 'asteroid_large');
    generateAsteroidCanvas(40, 'asteroid_medium');
    generateAsteroidCanvas(24, 'asteroid_small');

    // 7. Power-Ups (10 Types with Rarity Glow)
    const powerUps = [
      { key: 'powerup_shield', color: '#00f0ff', symbol: 'S' },
      { key: 'powerup_health', color: '#22c55e', symbol: '+' },
      { key: 'powerup_rapid', color: '#facc15', symbol: 'R' },
      { key: 'powerup_double', color: '#38bdf8', symbol: '2' },
      { key: 'powerup_triple', color: '#fb923c', symbol: '3' },
      { key: 'powerup_spread', color: '#10b981', symbol: '5' },
      { key: 'powerup_hyperbeam', color: '#ec4899', symbol: 'B' },
      { key: 'powerup_plasma', color: '#818cf8', symbol: 'P' },
      { key: 'powerup_score', color: '#a855f7', symbol: '2X' },
      { key: 'powerup_slow', color: '#06b6d4', symbol: '⏱' },
      // Aliases
      { key: 'powerup_damage', color: '#ec4899', symbol: 'D' },
    ];

    powerUps.forEach(({ key, color, symbol }) => {
      if (scene.textures.exists(key)) return;
      const canvas = document.createElement('canvas');
      canvas.width = 44;
      canvas.height = 44;
      const ctx = canvas.getContext('2d')!;

      ctx.shadowColor = color;
      ctx.shadowBlur = 12;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      const r = 18;
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const x = 22 + Math.cos(angle) * r;
        const y = 22 + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Rajdhani, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(symbol, 22, 22);

      scene.textures.addCanvas(key, canvas);
    });

    // 8. Shield Forcefield Dome (96 x 96)
    if (!scene.textures.exists('shield_bubble')) {
      const canvas = document.createElement('canvas');
      canvas.width = 96;
      canvas.height = 96;
      const ctx = canvas.getContext('2d')!;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 16;
      const grad = ctx.createRadialGradient(48, 48, 28, 48, 48, 46);
      grad.addColorStop(0, 'rgba(0, 240, 255, 0.05)');
      grad.addColorStop(0.8, 'rgba(0, 240, 255, 0.25)');
      grad.addColorStop(1, 'rgba(0, 240, 255, 0.9)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(48, 48, 44, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();
      scene.textures.addCanvas('shield_bubble', canvas);
    }

    // 9. Particle & FX Textures
    if (!scene.textures.exists('spark')) {
      const canvas = document.createElement('canvas');
      canvas.width = 10;
      canvas.height = 10;
      const ctx = canvas.getContext('2d')!;
      const grad = ctx.createRadialGradient(5, 5, 1, 5, 5, 5);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.5, '#00f0ff');
      grad.addColorStop(1, 'rgba(0, 240, 255, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 10, 10);
      scene.textures.addCanvas('spark', canvas);
    }

    if (!scene.textures.exists('smoke')) {
      const canvas = document.createElement('canvas');
      canvas.width = 18;
      canvas.height = 18;
      const ctx = canvas.getContext('2d')!;
      const grad = ctx.createRadialGradient(9, 9, 2, 9, 9, 9);
      grad.addColorStop(0, 'rgba(220, 220, 240, 0.6)');
      grad.addColorStop(0.6, 'rgba(120, 120, 150, 0.3)');
      grad.addColorStop(1, 'rgba(50, 50, 60, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 18, 18);
      scene.textures.addCanvas('smoke', canvas);
    }

    if (!scene.textures.exists('shockwave')) {
      const canvas = document.createElement('canvas');
      canvas.width = 80;
      canvas.height = 80;
      const ctx = canvas.getContext('2d')!;
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(40, 40, 36, 0, Math.PI * 2);
      ctx.stroke();
      scene.textures.addCanvas('shockwave', canvas);
    }
  }
}
