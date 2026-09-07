import Phaser from 'phaser';
import { ShipSkinId } from '../../types/game';

export class TextureGenerator {
  public static generateTextures(scene: Phaser.Scene): void {
    // 1. Player Ship Skins (5 Varieties: NEON, VOID, SOLAR, CRIMSON, CYBER)
    const skinThemes: Record<ShipSkinId, { primary: string; secondary: string; trim: string; glow: string; cockpit: string; engine: string }> = {
      NEON: {
        primary: '#0d1117',
        secondary: '#1a202c',
        trim: '#ff0033',
        glow: '#ff0033',
        cockpit: '#ff6b81',
        engine: '#ff0055',
      },
      VOID: {
        primary: '#090a0f',
        secondary: '#141722',
        trim: '#e11d48',
        glow: '#e11d48',
        cockpit: '#fb7185',
        engine: '#be123c',
      },
      SOLAR: {
        primary: '#14161f',
        secondary: '#202636',
        trim: '#ff3344',
        glow: '#ff0033',
        cockpit: '#ffa3a8',
        engine: '#dc2626',
      },
      CRIMSON: {
        primary: '#1c050d',
        secondary: '#360613',
        trim: '#ff0055',
        glow: '#ff0055',
        cockpit: '#fda4af',
        engine: '#ff0055',
      },
      CYBER: {
        primary: '#0a0c10',
        secondary: '#161c26',
        trim: '#ff1744',
        glow: '#ff1744',
        cockpit: '#ff8a80',
        engine: '#d50000',
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

        // 1. Aerodynamic Outer Wing Armor (High-Tech Swept Delta)
        ctx.shadowColor = theme.glow;
        ctx.shadowBlur = 14;

        // Base Outer Hull
        const baseGrad = ctx.createLinearGradient(0, 0, 72, 80);
        baseGrad.addColorStop(0, theme.secondary);
        baseGrad.addColorStop(0.5, theme.primary);
        baseGrad.addColorStop(1, '#020617');
        ctx.fillStyle = baseGrad;
        ctx.beginPath();
        ctx.moveTo(36, 2);      // Needle nose tip
        ctx.lineTo(44, 22);     // Forward fuselage step
        ctx.lineTo(70, 56);     // Right main wing tip
        ctx.lineTo(60, 60);     // Wing trailing edge
        ctx.lineTo(52, 54);     // Aileron notch
        ctx.lineTo(46, 74);     // Right engine nacelle
        ctx.lineTo(36, 68);     // Rear center spine
        ctx.lineTo(26, 74);     // Left engine nacelle
        ctx.lineTo(20, 54);     // Left aileron notch
        ctx.lineTo(12, 60);     // Left wing trailing edge
        ctx.lineTo(2, 56);      // Left main wing tip
        ctx.lineTo(28, 22);     // Left forward step
        ctx.closePath();
        ctx.fill();

        // High-Coherence Neon Armor Border
        ctx.strokeStyle = theme.trim;
        ctx.lineWidth = 2.2;
        ctx.stroke();

        // 2. Mid-Armor Composite Plating (Layered Depth)
        ctx.shadowBlur = 4;
        const plateGrad = ctx.createLinearGradient(36, 12, 36, 64);
        plateGrad.addColorStop(0, theme.primary);
        plateGrad.addColorStop(1, theme.secondary);
        ctx.fillStyle = plateGrad;
        ctx.beginPath();
        ctx.moveTo(36, 12);
        ctx.lineTo(54, 46);
        ctx.lineTo(44, 52);
        ctx.lineTo(36, 58);
        ctx.lineTo(28, 52);
        ctx.lineTo(18, 46);
        ctx.closePath();
        ctx.fill();

        // Metallic Surface Panel Seams
        ctx.strokeStyle = theme.trim;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(36, 14);
        ctx.lineTo(36, 56);
        ctx.moveTo(24, 38);
        ctx.lineTo(48, 38);
        ctx.moveTo(20, 48);
        ctx.lineTo(36, 44);
        ctx.lineTo(52, 48);
        ctx.stroke();

        // 3. Glowing Leading-Edge Energy Conduits
        ctx.strokeStyle = theme.glow;
        ctx.lineWidth = 1.8;
        ctx.shadowColor = theme.glow;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(42, 24);
        ctx.lineTo(66, 54);
        ctx.moveTo(30, 24);
        ctx.lineTo(6, 54);
        ctx.stroke();

        // 4. Sleek Aerodynamic Cockpit Glass Canopy
        const canopyGrad = ctx.createLinearGradient(36, 18, 36, 44);
        canopyGrad.addColorStop(0, '#ffffff');
        canopyGrad.addColorStop(0.3, theme.cockpit);
        canopyGrad.addColorStop(0.7, theme.primary);
        canopyGrad.addColorStop(1, '#000000');
        ctx.fillStyle = canopyGrad;
        ctx.shadowColor = theme.cockpit;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.ellipse(36, 30, 6, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cockpit Specular Reflection Flash
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.ellipse(35, 26, 2.5, 7, -0.2, 0, Math.PI * 2);
        ctx.stroke();

        // 5. Wingtip Railgun Batteries with Energy Capacitors
        ctx.fillStyle = theme.trim;
        ctx.fillRect(68, 42, 3, 16);
        ctx.fillRect(1, 42, 3, 16);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(69, 40, 2, 4);
        ctx.fillRect(2, 40, 2, 4);

        // 6. Dual Hyper-Velocity Thruster Ports (Glowing Plasma Combustion)
        const nozzleGrad = ctx.createRadialGradient(26, 73, 1, 26, 73, 6);
        nozzleGrad.addColorStop(0, '#ffffff');
        nozzleGrad.addColorStop(0.5, theme.engine);
        nozzleGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = nozzleGrad;
        ctx.fillRect(23, 68, 7, 7);

        const nozzleGradR = ctx.createRadialGradient(46, 73, 1, 46, 73, 6);
        nozzleGradR.addColorStop(0, '#ffffff');
        nozzleGradR.addColorStop(0.5, theme.engine);
        nozzleGradR.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = nozzleGradR;
        ctx.fillRect(43, 68, 7, 7);

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
        canvas.width = 24;
        canvas.height = 24;
        const ctx = canvas.getContext('2d')!;
        const grad = ctx.createRadialGradient(12, 12, 1, 12, 12, 11);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.4, theme.engine);
        grad.addColorStop(0.8, theme.glow);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 24, 24);
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

    // 2. Player Weapon Projectiles (SIGNATURE BRIGHT NEON RED WEAPON SYSTEM)
    // 2.1 Blaster (Signature Neon Red Energy Bolt) (14 x 36)
    if (!scene.textures.exists('laser_blaster')) {
      const canvas = document.createElement('canvas');
      canvas.width = 16;
      canvas.height = 36;
      const ctx = canvas.getContext('2d')!;
      ctx.shadowColor = '#ff0033';
      ctx.shadowBlur = 14;
      const grad = ctx.createLinearGradient(8, 0, 8, 36);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.35, '#ff0033');
      grad.addColorStop(0.75, '#ff0055');
      grad.addColorStop(1, 'rgba(255, 0, 85, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(8, 18, 6, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      // Sharp Energy Spine
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(8, 6);
      ctx.lineTo(8, 26);
      ctx.stroke();

      scene.textures.addCanvas('laser_blaster', canvas);
      scene.textures.addCanvas('laser_player', canvas);
    }

    // 2.2 Rapid Fire Needle (High-Frequency Red Stinger) (10 x 28)
    if (!scene.textures.exists('laser_rapid')) {
      const canvas = document.createElement('canvas');
      canvas.width = 10;
      canvas.height = 28;
      const ctx = canvas.getContext('2d')!;
      ctx.shadowColor = '#ff0055';
      ctx.shadowBlur = 12;
      const grad = ctx.createLinearGradient(5, 0, 5, 28);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.4, '#ff2255');
      grad.addColorStop(0.8, '#dc2626');
      grad.addColorStop(1, 'rgba(220, 38, 38, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(5, 14, 3.5, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      scene.textures.addCanvas('laser_rapid', canvas);
    }

    // 2.3 Double Shot Heavy (Dual Heavy Crimson Rods) (18 x 38)
    if (!scene.textures.exists('laser_double')) {
      const canvas = document.createElement('canvas');
      canvas.width = 20;
      canvas.height = 38;
      const ctx = canvas.getContext('2d')!;
      ctx.shadowColor = '#ff0033';
      ctx.shadowBlur = 16;
      const grad = ctx.createLinearGradient(10, 0, 10, 38);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.4, '#ff0033');
      grad.addColorStop(0.8, '#b91c1c');
      grad.addColorStop(1, 'rgba(185, 28, 28, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(10, 19, 7, 17, 0, 0, Math.PI * 2);
      ctx.fill();
      scene.textures.addCanvas('laser_double', canvas);
    }

    // 2.4 Triple Shot (Branching Crimson Plasma) (16 x 32)
    if (!scene.textures.exists('laser_triple')) {
      const canvas = document.createElement('canvas');
      canvas.width = 16;
      canvas.height = 32;
      const ctx = canvas.getContext('2d')!;
      ctx.shadowColor = '#ff0055';
      ctx.shadowBlur = 14;
      const grad = ctx.createLinearGradient(8, 0, 8, 32);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.45, '#ff0055');
      grad.addColorStop(0.8, '#990022');
      grad.addColorStop(1, 'rgba(153, 0, 34, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(8, 16, 6, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      scene.textures.addCanvas('laser_triple', canvas);
    }

    // 2.5 Spread Shot (Neon Red Plasma Darts) (16 x 28)
    if (!scene.textures.exists('laser_spread')) {
      const canvas = document.createElement('canvas');
      canvas.width = 16;
      canvas.height = 28;
      const ctx = canvas.getContext('2d')!;
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 12;
      const grad = ctx.createLinearGradient(8, 0, 8, 28);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.45, '#ef4444');
      grad.addColorStop(0.8, '#7f1d1d');
      grad.addColorStop(1, 'rgba(127, 29, 29, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(8, 14, 5, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      scene.textures.addCanvas('laser_spread', canvas);
    }

    // 2.6 Hyperbeam (Continuous Crimson Laser with Lightning Core) (24 x 56)
    if (!scene.textures.exists('laser_hyperbeam')) {
      const canvas = document.createElement('canvas');
      canvas.width = 24;
      canvas.height = 56;
      const ctx = canvas.getContext('2d')!;
      ctx.shadowColor = '#ff0033';
      ctx.shadowBlur = 20;
      const grad = ctx.createLinearGradient(12, 0, 12, 56);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.25, '#ff0055');
      grad.addColorStop(0.7, '#ff0033');
      grad.addColorStop(1, 'rgba(255, 0, 51, 0.1)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(12, 28, 8, 26, 0, 0, Math.PI * 2);
      ctx.fill();

      // Internal Blinding Core Rod
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(12, 4);
      ctx.lineTo(12, 48);
      ctx.stroke();

      scene.textures.addCanvas('laser_hyperbeam', canvas);
      scene.textures.addCanvas('laser_heavy', canvas);
    }

    // 2.7 Plasma Shot (Thermonuclear Crimson Plasma Sphere) (40 x 40)
    if (!scene.textures.exists('laser_plasma')) {
      const canvas = document.createElement('canvas');
      canvas.width = 40;
      canvas.height = 40;
      const ctx = canvas.getContext('2d')!;
      ctx.shadowColor = '#ff0033';
      ctx.shadowBlur = 20;
      const grad = ctx.createRadialGradient(20, 20, 3, 20, 20, 18);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.35, '#ff0055');
      grad.addColorStop(0.7, '#ff0033');
      grad.addColorStop(0.9, '#990022');
      grad.addColorStop(1, 'rgba(153, 0, 34, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(20, 20, 18, 0, Math.PI * 2);
      ctx.fill();

      // Radiating Solar Flares
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(20, 20, 10, 0, Math.PI * 2);
      ctx.stroke();

      scene.textures.addCanvas('laser_plasma', canvas);
    }

    // 3. Enemy Textures (6 Distinct High-Detail Archetypes)
    // 3.1 Scout (Razor Stealth Interceptor) (48 x 52)
    if (!scene.textures.exists('enemy_scout')) {
      const canvas = document.createElement('canvas');
      canvas.width = 48;
      canvas.height = 52;
      const ctx = canvas.getContext('2d')!;
      ctx.shadowColor = '#ff0055';
      ctx.shadowBlur = 10;

      // Base Stealth Hull
      const grad = ctx.createLinearGradient(24, 0, 24, 52);
      grad.addColorStop(0, '#2d0614');
      grad.addColorStop(0.6, '#150209');
      grad.addColorStop(1, '#020002');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(24, 48);      // Forward nose dagger
      ctx.lineTo(4, 8);        // Left swept-forward wingtip
      ctx.lineTo(16, 16);      // Wing notch
      ctx.lineTo(24, 10);      // Center rear intake
      ctx.lineTo(32, 16);      // Right wing notch
      ctx.lineTo(44, 8);       // Right swept wingtip
      ctx.closePath();
      ctx.fill();

      // Sharp Crimson Trim
      ctx.strokeStyle = '#ff0055';
      ctx.lineWidth = 2.0;
      ctx.stroke();

      // Wing Armor Panels
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(12, 14);
      ctx.lineTo(24, 38);
      ctx.lineTo(36, 14);
      ctx.stroke();

      // Menacing Cyclops Sensor Slit
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ff0055';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.ellipse(24, 32, 4.5, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();

      scene.textures.addCanvas('enemy_scout', canvas);
    }

    // 3.2 Interceptor (High-Speed Swept Pursuit Striker) (48 x 52)
    if (!scene.textures.exists('enemy_interceptor')) {
      const canvas = document.createElement('canvas');
      canvas.width = 48;
      canvas.height = 52;
      const ctx = canvas.getContext('2d')!;
      ctx.shadowColor = '#ff0033';
      ctx.shadowBlur = 12;

      // Dark Gunmetal & Steel Composite Hull
      const grad = ctx.createLinearGradient(24, 0, 24, 52);
      grad.addColorStop(0, '#222736');
      grad.addColorStop(0.5, '#12141c');
      grad.addColorStop(1, '#08090d');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(24, 50);
      ctx.lineTo(46, 14);
      ctx.lineTo(36, 6);
      ctx.lineTo(24, 18);
      ctx.lineTo(12, 6);
      ctx.lineTo(2, 14);
      ctx.closePath();
      ctx.fill();

      // Sharp Crimson Trim & Edge Lighting
      ctx.strokeStyle = '#ff0033';
      ctx.lineWidth = 2.0;
      ctx.stroke();

      // Forward Kinetic Disruptor Needle Barrels
      ctx.fillStyle = '#ff0055';
      ctx.fillRect(44, 18, 3, 14);
      ctx.fillRect(1, 18, 3, 14);

      // Energized Central Crimson Conduit
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ff0033';
      ctx.shadowBlur = 10;
      ctx.fillRect(22, 20, 4, 18);

      scene.textures.addCanvas('enemy_interceptor', canvas);
      scene.textures.addCanvas('enemy_striker', canvas);
    }

    // 3.3 Tank (Armored Citadel Dreadnought) (76 x 80)
    if (!scene.textures.exists('enemy_tank')) {
      const canvas = document.createElement('canvas');
      canvas.width = 76;
      canvas.height = 80;
      const ctx = canvas.getContext('2d')!;
      ctx.shadowColor = '#ff0055';
      ctx.shadowBlur = 14;

      // Heavy Dark Metallic Composite Armor Plating
      const grad = ctx.createLinearGradient(38, 0, 38, 80);
      grad.addColorStop(0, '#282d3c');
      grad.addColorStop(0.5, '#161922');
      grad.addColorStop(1, '#0a0b10');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(38, 74);
      ctx.lineTo(70, 48);
      ctx.lineTo(70, 14);
      ctx.lineTo(52, 4);
      ctx.lineTo(38, 16);
      ctx.lineTo(24, 4);
      ctx.lineTo(6, 14);
      ctx.lineTo(6, 48);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#ff0055';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Reinforced Gunmetal Sponsons
      ctx.fillStyle = '#1c202b';
      ctx.fillRect(10, 24, 12, 28);
      ctx.fillRect(54, 24, 12, 28);
      ctx.strokeStyle = '#e11d48';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(10, 24, 12, 28);
      ctx.strokeRect(54, 24, 12, 28);

      // Exposed Crimson Reactor Core (Vulnerable Weakpoint)
      const coreGrad = ctx.createRadialGradient(38, 38, 2, 38, 38, 14);
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.4, '#ff0033');
      coreGrad.addColorStop(0.8, '#99001f');
      coreGrad.addColorStop(1, 'rgba(153, 0, 31, 0)');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(38, 38, 14, 0, Math.PI * 2);
      ctx.fill();

      scene.textures.addCanvas('enemy_tank', canvas);
      scene.textures.addCanvas('enemy_cruiser', canvas);
    }

    // 3.4 Shooter (Tactical Assault Rail Gunship) (60 x 64)
    if (!scene.textures.exists('enemy_shooter')) {
      const canvas = document.createElement('canvas');
      canvas.width = 60;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      ctx.shadowColor = '#ff0055';
      ctx.shadowBlur = 12;

      // Dark Iron Composite Fuselage
      const grad = ctx.createLinearGradient(30, 0, 30, 64);
      grad.addColorStop(0, '#242938');
      grad.addColorStop(0.6, '#131620');
      grad.addColorStop(1, '#090a10');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(30, 58);
      ctx.lineTo(56, 26);
      ctx.lineTo(50, 8);
      ctx.lineTo(38, 14);
      ctx.lineTo(30, 4);
      ctx.lineTo(22, 14);
      ctx.lineTo(10, 8);
      ctx.lineTo(4, 26);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#ff0055';
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // Twin Forward Railgun Batteries with Red Energy Conduits
      ctx.fillStyle = '#ff0033';
      ctx.fillRect(16, 44, 5, 14);
      ctx.fillRect(39, 44, 5, 14);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(17, 54, 3, 4);
      ctx.fillRect(40, 54, 3, 4);

      scene.textures.addCanvas('enemy_shooter', canvas);
      scene.textures.addCanvas('enemy_gunship', canvas);
    }

    // 3.5 Bomber (Heavy Munitions Hazard Drone) (48 x 52)
    if (!scene.textures.exists('enemy_bomber')) {
      const canvas = document.createElement('canvas');
      canvas.width = 48;
      canvas.height = 52;
      const ctx = canvas.getContext('2d')!;
      ctx.shadowColor = '#ff0033';
      ctx.shadowBlur = 14;

      // Heavy Charcoal Armor with Hazard Grooves
      const grad = ctx.createLinearGradient(24, 0, 24, 52);
      grad.addColorStop(0, '#262833');
      grad.addColorStop(0.6, '#141620');
      grad.addColorStop(1, '#090a0f');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(24, 48);
      ctx.lineTo(44, 12);
      ctx.lineTo(24, 22);
      ctx.lineTo(4, 12);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // Pulsing Thermonuclear Detonation Core
      const nukeGrad = ctx.createRadialGradient(24, 30, 2, 24, 30, 10);
      nukeGrad.addColorStop(0, '#ffffff');
      nukeGrad.addColorStop(0.4, '#ff0033');
      nukeGrad.addColorStop(0.8, '#99001f');
      nukeGrad.addColorStop(1, 'rgba(153, 0, 31, 0)');
      ctx.fillStyle = nukeGrad;
      ctx.beginPath();
      ctx.arc(24, 30, 10, 0, Math.PI * 2);
      ctx.fill();

      scene.textures.addCanvas('enemy_bomber', canvas);
    }

    // 3.6 Elite Reaper (Apex Command Battlecruiser) (80 x 84)
    if (!scene.textures.exists('enemy_elite')) {
      const canvas = document.createElement('canvas');
      canvas.width = 80;
      canvas.height = 84;
      const ctx = canvas.getContext('2d')!;
      ctx.shadowColor = '#ff0033';
      ctx.shadowBlur = 16;

      // Command Dreadnought Hull
      const grad = ctx.createLinearGradient(40, 0, 40, 84);
      grad.addColorStop(0, '#32384a');
      grad.addColorStop(0.5, '#181b24');
      grad.addColorStop(1, '#090a10');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(40, 78);
      ctx.lineTo(76, 36);
      ctx.lineTo(64, 8);
      ctx.lineTo(50, 20);
      ctx.lineTo(40, 6);
      ctx.lineTo(30, 20);
      ctx.lineTo(16, 8);
      ctx.lineTo(4, 36);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#ff0033';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Protective Crimson Deflector Pylon Halo
      ctx.strokeStyle = '#ff0055';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(40, 40, 18, 0, Math.PI * 2);
      ctx.stroke();

      // Forward Sensor Array & Command Visor
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ff0033';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.ellipse(40, 52, 6, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      scene.textures.addCanvas('enemy_elite', canvas);
      scene.textures.addCanvas('enemy_reaper', canvas);
    }

    // 4. Enemy Weapons & Projectiles
    // 4.1 Electric Cyan Plasma Bullet (14 x 28)
    if (!scene.textures.exists('laser_enemy')) {
      const canvas = document.createElement('canvas');
      canvas.width = 14;
      canvas.height = 28;
      const ctx = canvas.getContext('2d')!;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 14;
      const grad = ctx.createRadialGradient(7, 14, 2, 7, 14, 10);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.35, '#22d3ee');
      grad.addColorStop(0.7, '#0284c7');
      grad.addColorStop(1, 'rgba(2, 132, 199, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(7, 14, 6, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Core Spark
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(6, 8, 2, 12);

      scene.textures.addCanvas('laser_enemy', canvas);
    }

    // 4.2 Standard Boss Void Sphere (32 x 32)
    if (!scene.textures.exists('boss_bullet')) {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d')!;
      ctx.shadowColor = '#d946ef';
      ctx.shadowBlur = 16;
      const grad = ctx.createRadialGradient(16, 16, 3, 16, 16, 15);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.35, '#e879f9');
      grad.addColorStop(0.7, '#a855f7');
      grad.addColorStop(1, 'rgba(168, 85, 247, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(16, 16, 15, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(16, 16, 7, 0, Math.PI * 2);
      ctx.stroke();

      scene.textures.addCanvas('boss_bullet', canvas);
    }

    // 4.3 Heavy Boss Doom Orb (44 x 44)
    if (!scene.textures.exists('boss_bullet_heavy')) {
      const canvas = document.createElement('canvas');
      canvas.width = 44;
      canvas.height = 44;
      const ctx = canvas.getContext('2d')!;
      ctx.shadowColor = '#ff0055';
      ctx.shadowBlur = 22;
      const grad = ctx.createRadialGradient(22, 22, 4, 22, 22, 20);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.25, '#fb7185');
      grad.addColorStop(0.6, '#e11d48');
      grad.addColorStop(0.85, '#881337');
      grad.addColorStop(1, 'rgba(136, 19, 55, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(22, 22, 20, 0, Math.PI * 2);
      ctx.fill();

      // Dual Orbital Corona Rings
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(22, 22, 11, 0, Math.PI * 2);
      ctx.stroke();

      scene.textures.addCanvas('boss_bullet_heavy', canvas);
    }

    // 4.4 Proximity Energy Mine (34 x 34)
    if (!scene.textures.exists('energy_mine')) {
      const canvas = document.createElement('canvas');
      canvas.width = 34;
      canvas.height = 34;
      const ctx = canvas.getContext('2d')!;
      ctx.shadowColor = '#ea580c';
      ctx.shadowBlur = 14;

      // Spiked Star Core
      ctx.fillStyle = '#27272a';
      ctx.beginPath();
      ctx.arc(17, 17, 11, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 2.0;
      ctx.stroke();

      // 4 Proximity Sensor Needles
      ctx.fillStyle = '#f97316';
      ctx.fillRect(15, 1, 4, 8);
      ctx.fillRect(15, 25, 4, 8);
      ctx.fillRect(1, 15, 8, 4);
      ctx.fillRect(25, 15, 8, 4);

      // Pulsing Danger Core
      const coreGrad = ctx.createRadialGradient(17, 17, 1, 17, 17, 6);
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.5, '#ef4444');
      coreGrad.addColorStop(1, '#7f1d1d');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(17, 17, 6, 0, Math.PI * 2);
      ctx.fill();

      scene.textures.addCanvas('energy_mine', canvas);
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

    // 6. Asteroids (3 Sizes with 3D Facets & Bioluminescent Ore Veins)
    const generateAsteroidCanvas = (size: number, key: string) => {
      if (scene.textures.exists(key)) return;
      const canvas = document.createElement('canvas');
      canvas.width = size + 16;
      canvas.height = size + 16;
      const ctx = canvas.getContext('2d')!;
      const center = canvas.width / 2;
      const radius = size / 2;
      const numPoints = 14;

      // Base Chiseled Space Rock Surface
      const baseGrad = ctx.createRadialGradient(center - radius * 0.3, center - radius * 0.3, 2, center, center, radius + 4);
      baseGrad.addColorStop(0, '#52525b');
      baseGrad.addColorStop(0.5, '#27272a');
      baseGrad.addColorStop(0.85, '#18181b');
      baseGrad.addColorStop(1, '#09090b');
      ctx.fillStyle = baseGrad;

      ctx.beginPath();
      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        const offset = Math.sin(i * 3.2) * (radius * 0.28) + Math.cos(i * 1.9) * (radius * 0.12);
        const r = radius + offset;
        const x = center + Math.cos(angle) * r;
        const y = center + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();

      // Sharp Mineral Facet Outline
      ctx.strokeStyle = '#71717a';
      ctx.lineWidth = 2.0;
      ctx.stroke();

      // Deep Shadowed Impact Craters
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.arc(center - radius * 0.35, center - radius * 0.2, radius * 0.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#3f3f46';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.fillStyle = '#111113';
      ctx.beginPath();
      ctx.arc(center + radius * 0.25, center + radius * 0.28, radius * 0.18, 0, Math.PI * 2);
      ctx.fill();

      // Primary Bioluminescent Electric Cyan Ore Vein
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 1.8;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(center - radius * 0.5, center + radius * 0.25);
      ctx.lineTo(center - radius * 0.1, center + radius * 0.05);
      ctx.lineTo(center + radius * 0.35, center - radius * 0.3);
      ctx.lineTo(center + radius * 0.55, center - radius * 0.15);
      ctx.stroke();

      // Secondary Crimson Ore Branch
      ctx.strokeStyle = '#ff0055';
      ctx.lineWidth = 1.4;
      ctx.shadowColor = '#ff0055';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(center - radius * 0.1, center + radius * 0.05);
      ctx.lineTo(center + radius * 0.15, center + radius * 0.4);
      ctx.stroke();

      scene.textures.addCanvas(key, canvas);
    };

    generateAsteroidCanvas(64, 'asteroid_large');
    generateAsteroidCanvas(40, 'asteroid_medium');
    generateAsteroidCanvas(24, 'asteroid_small');

    // 6b. Asteroid Shards & Chunks (For Multi-Stage Impact Fragmentation)
    const generateChunkCanvas = (size: number, key: string, seed: number) => {
      if (scene.textures.exists(key)) return;
      const canvas = document.createElement('canvas');
      canvas.width = size + 8;
      canvas.height = size + 8;
      const ctx = canvas.getContext('2d')!;
      const center = canvas.width / 2;
      const radius = size / 2;
      const numPoints = 8;

      ctx.fillStyle = '#27272a';
      ctx.beginPath();
      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        const offset = Math.sin(i * 3.5 + seed) * (radius * 0.4);
        const r = radius + offset;
        const x = center + Math.cos(angle) * r;
        const y = center + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#71717a';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Exposed hot mineral fragment
      ctx.fillStyle = seed % 2 === 0 ? '#ff0055' : '#00f0ff';
      ctx.beginPath();
      ctx.arc(center + 1, center - 1, 2, 0, Math.PI * 2);
      ctx.fill();

      scene.textures.addCanvas(key, canvas);
    };

    generateChunkCanvas(18, 'asteroid_chunk_1', 1);
    generateChunkCanvas(14, 'asteroid_chunk_2', 2);

    // 7. Radiant XP Gem (Luminous Hex-Prism Crystal) (24 x 24)
    if (!scene.textures.exists('xp_gem')) {
      const canvas = document.createElement('canvas');
      canvas.width = 24;
      canvas.height = 24;
      const ctx = canvas.getContext('2d')!;
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 12;

      // Diamond Prism Body
      const gemGrad = ctx.createLinearGradient(12, 1, 12, 23);
      gemGrad.addColorStop(0, '#ffffff');
      gemGrad.addColorStop(0.3, '#e879f9');
      gemGrad.addColorStop(0.7, '#a855f7');
      gemGrad.addColorStop(1, '#581c87');
      ctx.fillStyle = gemGrad;

      ctx.beginPath();
      ctx.moveTo(12, 2);
      ctx.lineTo(22, 12);
      ctx.lineTo(12, 22);
      ctx.lineTo(2, 12);
      ctx.closePath();
      ctx.fill();

      // Facet Lines
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(12, 2);
      ctx.lineTo(12, 22);
      ctx.moveTo(2, 12);
      ctx.lineTo(22, 12);
      ctx.stroke();

      // Specular Glint
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(10, 8, 2, 0, Math.PI * 2);
      ctx.fill();

      scene.textures.addCanvas('xp_gem', canvas);
    }

    // 8. Power-Ups (10 Types with Holographic Rarity Glow)
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
      { key: 'powerup_slow', color: '#06b6d4', symbol: 'C' },
      // Aliases
      { key: 'powerup_damage', color: '#ec4899', symbol: 'D' },
      { key: 'powerup_nuke', color: '#ef4444', symbol: 'N' },
    ];

    powerUps.forEach(({ key, color, symbol }) => {
      if (scene.textures.exists(key)) return;
      const canvas = document.createElement('canvas');
      canvas.width = 46;
      canvas.height = 46;
      const ctx = canvas.getContext('2d')!;

      ctx.shadowColor = color;
      ctx.shadowBlur = 14;

      ctx.fillStyle = 'rgba(10, 15, 30, 0.94)';
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      const r = 19;
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const x = 23 + Math.cos(angle) * r;
        const y = 23 + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Inner Rotating Hex Frame
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + Math.PI / 6;
        const x = 23 + Math.cos(angle) * 12;
        const y = 23 + Math.sin(angle) * 12;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Rajdhani, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(symbol, 23, 23);

      scene.textures.addCanvas(key, canvas);
    });


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

    if (!scene.textures.exists('spark_red')) {
      const canvas = document.createElement('canvas');
      canvas.width = 12;
      canvas.height = 12;
      const ctx = canvas.getContext('2d')!;
      ctx.shadowColor = '#ff0033';
      ctx.shadowBlur = 8;
      const grad = ctx.createRadialGradient(6, 6, 1, 6, 6, 6);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.4, '#ff0055');
      grad.addColorStop(0.8, '#dc2626');
      grad.addColorStop(1, 'rgba(220, 38, 38, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 12, 12);
      scene.textures.addCanvas('spark_red', canvas);
    }

    if (!scene.textures.exists('muzzle_flash_red')) {
      const canvas = document.createElement('canvas');
      canvas.width = 24;
      canvas.height = 24;
      const ctx = canvas.getContext('2d')!;
      ctx.shadowColor = '#ff0033';
      ctx.shadowBlur = 14;
      const grad = ctx.createRadialGradient(12, 12, 2, 12, 12, 12);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, '#ff0055');
      grad.addColorStop(0.7, '#ff0033');
      grad.addColorStop(1, 'rgba(255, 0, 51, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(12, 12, 10, 0, Math.PI * 2);
      ctx.fill();
      scene.textures.addCanvas('muzzle_flash_red', canvas);
    }

    // 10. Deep Space Celestial Bodies (7-Layer Parallax)
    if (!scene.textures.exists('planet_dark')) {
      const canvas = document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 160;
      const ctx = canvas.getContext('2d')!;
      ctx.shadowColor = '#6366f1';
      ctx.shadowBlur = 25;

      // Dark volcanic planetoid
      const grad = ctx.createRadialGradient(65, 65, 10, 80, 80, 70);
      grad.addColorStop(0, '#1e1b4b');
      grad.addColorStop(0.5, '#0f172a');
      grad.addColorStop(0.85, '#020617');
      grad.addColorStop(1, 'rgba(2, 6, 23, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(80, 80, 70, 0, Math.PI * 2);
      ctx.fill();

      // Atmospheric glowing rim
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
      ctx.lineWidth = 3;
      ctx.stroke();
      scene.textures.addCanvas('planet_dark', canvas);
    }

    if (!scene.textures.exists('space_debris')) {
      const canvas = document.createElement('canvas');
      canvas.width = 24;
      canvas.height = 24;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(12, 2);
      ctx.lineTo(22, 10);
      ctx.lineTo(16, 22);
      ctx.lineTo(4, 18);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      ctx.stroke();
      scene.textures.addCanvas('space_debris', canvas);
    }

    // 11. Additional Space Debris & Hull Wreckage Shards
    if (!scene.textures.exists('debris_panel_1')) {
      const canvas = document.createElement('canvas');
      canvas.width = 24;
      canvas.height = 24;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(4, 4);
      ctx.lineTo(20, 6);
      ctx.lineTo(18, 20);
      ctx.lineTo(6, 18);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      // Hazard warning slash
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(8, 8);
      ctx.lineTo(16, 16);
      ctx.stroke();
      scene.textures.addCanvas('debris_panel_1', canvas);
    }

    if (!scene.textures.exists('debris_panel_2')) {
      const canvas = document.createElement('canvas');
      canvas.width = 20;
      canvas.height = 20;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(2, 8);
      ctx.lineTo(10, 2);
      ctx.lineTo(18, 12);
      ctx.lineTo(14, 18);
      ctx.lineTo(4, 16);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.stroke();
      // Red conduit vein
      ctx.strokeStyle = '#ff0055';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(4, 8);
      ctx.lineTo(14, 14);
      ctx.stroke();
      scene.textures.addCanvas('debris_panel_2', canvas);
    }

    if (!scene.textures.exists('debris_solar')) {
      const canvas = document.createElement('canvas');
      canvas.width = 28;
      canvas.height = 16;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#075985';
      ctx.fillRect(2, 2, 24, 12);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      ctx.strokeRect(2, 2, 24, 12);
      // Photovoltaic grid lattice
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(10, 2); ctx.lineTo(10, 14);
      ctx.moveTo(18, 2); ctx.lineTo(18, 14);
      ctx.moveTo(2, 8); ctx.lineTo(26, 8);
      ctx.stroke();
      scene.textures.addCanvas('debris_solar', canvas);
    }

    // 12. Multi-Stage Cinematic Explosion Particle Textures
    if (!scene.textures.exists('shockwave_ring')) {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      const grad = ctx.createRadialGradient(32, 32, 18, 32, 32, 31);
      grad.addColorStop(0, 'rgba(255, 0, 85, 0)');
      grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)');
      grad.addColorStop(0.75, 'rgba(255, 0, 85, 0.8)');
      grad.addColorStop(1, 'rgba(220, 38, 38, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(32, 32, 31, 0, Math.PI * 2);
      ctx.fill();
      scene.textures.addCanvas('shockwave_ring', canvas);
    }

    if (!scene.textures.exists('shrapnel_shard')) {
      const canvas = document.createElement('canvas');
      canvas.width = 16;
      canvas.height = 6;
      const ctx = canvas.getContext('2d')!;
      const grad = ctx.createLinearGradient(0, 3, 16, 3);
      grad.addColorStop(0, '#ff0055');
      grad.addColorStop(0.6, '#fca5a5');
      grad.addColorStop(1, '#ffffff');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, 2);
      ctx.lineTo(16, 3);
      ctx.lineTo(0, 4);
      ctx.closePath();
      ctx.fill();
      scene.textures.addCanvas('shrapnel_shard', canvas);
    }

    if (!scene.textures.exists('core_flash')) {
      const canvas = document.createElement('canvas');
      canvas.width = 48;
      canvas.height = 48;
      const ctx = canvas.getContext('2d')!;
      ctx.shadowColor = '#ff0033';
      ctx.shadowBlur = 12;
      const grad = ctx.createRadialGradient(24, 24, 2, 24, 24, 22);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.2, '#ffffff');
      grad.addColorStop(0.5, '#ff0055');
      grad.addColorStop(0.8, '#dc2626');
      grad.addColorStop(1, 'rgba(220, 38, 38, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(24, 24, 22, 0, Math.PI * 2);
      ctx.fill();

      // Sharp 4-point star glint
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(24, 4); ctx.lineTo(26, 24); ctx.lineTo(44, 24); ctx.lineTo(26, 24);
      ctx.lineTo(24, 44); ctx.lineTo(22, 24); ctx.lineTo(4, 24); ctx.lineTo(22, 24);
      ctx.closePath();
      ctx.fill();
      scene.textures.addCanvas('core_flash', canvas);
    }
  }
}
