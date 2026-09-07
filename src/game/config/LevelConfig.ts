export type EnemyType = 'scout' | 'interceptor' | 'shooter' | 'tank' | 'bomber' | 'elite';

export type SignatureEvent = 
  | 'NONE'
  | 'NEBULA_WAVE'
  | 'METEOR_STORM'
  | 'DEAD_FLEET'
  | 'VOID_DISTORTION'
  | 'BATTLEFRONT_SURGE'
  | 'CORE_ARENA';

export type BossType = 
  | 'boss_void_destroyer'
  | 'boss_nebula_queen'
  | 'boss_star_eater'
  | 'boss_galactic_core';

export interface SectorConfig {
  id: number;
  name: string;
  codename: string;
  subtitle: string;
  startSecond: number;
  endSecond: number; // in seconds of survival time
  starSpeedMult: number;
  nebulaColors: {
    primary: number;
    secondary: number;
    core: number;
  };
  enemySpawnInterval: number; // in ms
  enemyPool: EnemyType[];
  asteroidDensity: number; // 0 to 1 chance per spawn cycle
  debrisFrequency: number; // 0 to 1 chance per second
  signatureEvent: SignatureEvent;
  bossType?: BossType;
  bossHp?: number;
}

export const SECTORS: SectorConfig[] = [
  {
    id: 1,
    name: 'SECTOR 01',
    codename: 'DEEP SPACE',
    subtitle: 'LEARN THE ROPES // PATROL',
    startSecond: 0,
    endSecond: 60,
    starSpeedMult: 1.0,
    nebulaColors: {
      primary: 0x0f172a,
      secondary: 0x1e293b,
      core: 0x020617,
    },
    enemySpawnInterval: 1400,
    enemyPool: ['scout'], // Level 1: Easy, learn controls and shooting
    asteroidDensity: 0.15,
    debrisFrequency: 0.10,
    signatureEvent: 'NONE',
  },
  {
    id: 2,
    name: 'SECTOR 02',
    codename: 'CRIMSON NEBULA',
    subtitle: 'SLIGHTLY FASTER ENEMIES',
    startSecond: 60,
    endSecond: 120,
    starSpeedMult: 1.15,
    nebulaColors: {
      primary: 0x4c0519,
      secondary: 0x3b0712,
      core: 0x180208,
    },
    enemySpawnInterval: 1250,
    enemyPool: ['scout', 'interceptor'], // Level 2: Interceptors dive at player
    asteroidDensity: 0.25,
    debrisFrequency: 0.20,
    signatureEvent: 'NEBULA_WAVE',
  },
  {
    id: 3,
    name: 'SECTOR 03',
    codename: 'ASTEROID BELT',
    subtitle: 'MORE HOSTILES // RANGED ATTACKS',
    startSecond: 120,
    endSecond: 180,
    starSpeedMult: 1.25,
    nebulaColors: {
      primary: 0x7f1d1d,
      secondary: 0x991b1b,
      core: 0x450a0a,
    },
    enemySpawnInterval: 1100,
    enemyPool: ['scout', 'interceptor', 'shooter'], // Level 3: Shooters introduce ranged lasers
    asteroidDensity: 0.35,
    debrisFrequency: 0.30,
    signatureEvent: 'METEOR_STORM',
  },
  {
    id: 4,
    name: 'SECTOR 04',
    codename: 'DEAD SECTOR',
    subtitle: 'AGGRESSIVE MOVEMENT // MINES',
    startSecond: 180,
    endSecond: 240,
    starSpeedMult: 1.35,
    nebulaColors: {
      primary: 0x1e1b4b,
      secondary: 0x312e81,
      core: 0x0a0a14,
    },
    enemySpawnInterval: 950,
    enemyPool: ['scout', 'interceptor', 'shooter', 'bomber'], // Level 4: Bombers lay tactical mines
    asteroidDensity: 0.42,
    debrisFrequency: 0.40,
    signatureEvent: 'DEAD_FLEET',
    bossType: 'boss_void_destroyer',
    bossHp: 3800,
  },
  {
    id: 5,
    name: 'SECTOR 05',
    codename: 'VOID ZONE',
    subtitle: 'HIGHER ENEMY HP // FAST SHOTS',
    startSecond: 240,
    endSecond: 300,
    starSpeedMult: 1.45,
    nebulaColors: {
      primary: 0x3b0764,
      secondary: 0x581c87,
      core: 0x180226,
    },
    enemySpawnInterval: 840,
    enemyPool: ['interceptor', 'shooter', 'tank', 'bomber'], // Level 5: Heavy tanks + faster projectiles
    asteroidDensity: 0.48,
    debrisFrequency: 0.35,
    signatureEvent: 'VOID_DISTORTION',
  },
  {
    id: 6,
    name: 'SECTOR 06',
    codename: 'BATTLEFRONT',
    subtitle: 'COMPLEX FORMATIONS // ELITES',
    startSecond: 300,
    endSecond: 360,
    starSpeedMult: 1.55,
    nebulaColors: {
      primary: 0x881337,
      secondary: 0x9f1239,
      core: 0x3f0615,
    },
    enemySpawnInterval: 750,
    enemyPool: ['shooter', 'tank', 'bomber', 'elite'], // Level 6: Elites with shielding and spreads
    asteroidDensity: 0.52,
    debrisFrequency: 0.50,
    signatureEvent: 'BATTLEFRONT_SURGE',
    bossType: 'boss_nebula_queen',
    bossHp: 5500,
  },
  {
    id: 7,
    name: 'SECTOR 07',
    codename: 'GALACTIC CORE',
    subtitle: 'HEAVY DREADNOUGHTS // DENSE BELT',
    startSecond: 360,
    endSecond: 999999,
    starSpeedMult: 1.65,
    nebulaColors: {
      primary: 0x991b1b,
      secondary: 0x7f1d1d,
      core: 0x450a0a,
    },
    enemySpawnInterval: 680,
    enemyPool: ['interceptor', 'shooter', 'tank', 'bomber', 'elite'], // Level 7: Dense asteroids and relentless waves
    asteroidDensity: 0.60,
    debrisFrequency: 0.60,
    signatureEvent: 'CORE_ARENA',
    bossType: 'boss_star_eater',
    bossHp: 7500,
  },
];

export function getSectorForSurvivalTime(seconds: number): SectorConfig {
  for (let i = 0; i < SECTORS.length; i++) {
    if (seconds >= SECTORS[i].startSecond && seconds < SECTORS[i].endSecond) {
      return SECTORS[i];
    }
  }
  return SECTORS[SECTORS.length - 1];
}
