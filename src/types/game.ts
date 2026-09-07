export type GameState = 'MAIN_MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'LEVEL_UP';

export type ShipSkinId = 'NEON' | 'VOID' | 'SOLAR' | 'CRIMSON' | 'CYBER';

export interface ShipSkin {
  id: string;
  name: string;
  description: string;
  color: string;
  glowColor: string;
}

export type WeaponType = 
  | 'BLASTER'
  | 'RAPID_FIRE'
  | 'DOUBLE_SHOT'
  | 'TRIPLE_SHOT'
  | 'SPREAD_SHOT'
  | 'HYPERBEAM'
  | 'PLASMA_CANNON'
  | 'DOUBLE'
  | 'TRIPLE'
  | 'SPREAD'
  | 'PLASMA';

export type PowerUpType = 
  | 'SHIELD'
  | 'HEALTH'
  | 'RAPID_FIRE'
  | 'DOUBLE_DAMAGE'
  | 'DOUBLE_SHOT'
  | 'TRIPLE_SHOT'
  | 'SPREAD_SHOT'
  | 'HYPERBEAM'
  | 'PLASMA_CANNON'
  | 'SCORE_BOOST'
  | 'SLOW_MO'
  | 'SLOW_MOTION'
  | 'NUKE';

export type PowerUpRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export interface PowerUpConfig {
  type: PowerUpType;
  name: string;
  rarity: PowerUpRarity;
  color: string;
  duration: number; // in seconds
  icon: string;
  description: string;
}

export interface PlayerStats {
  score: number;
  highScore: number;
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  level: number;
  xp: number;
  nextLevelXp: number;
  wave: number;
  combo: number;
  comboMultiplier: number;
  comboTimer: number;
  survivalTime: number; // in seconds
  activeWeapon: WeaponType;
  lives: number;
  activeMission?: Mission;
  activePowerUps: {
    type: PowerUpType;
    duration: number;
    maxDuration: number;
  }[];
}

export interface BossInfo {
  active: boolean;
  bossKey?: string;
  name: string;
  currentHp: number;
  maxHp: number;
  phase: number;
  maxPhases?: number;
}

export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
}

export type GraphicsQuality = 'LOW' | 'MEDIUM' | 'HIGH' | 'ULTRA';

export interface SettingsState {
  musicEnabled: boolean;
  soundEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
  quality: GraphicsQuality;
  selectedSkin: ShipSkin;
}

export interface LevelUpOption {
  id: string;
  title: string;
  description: string;
  category: 'WEAPON' | 'DEFENSE' | 'TACTICAL' | 'COMBO' | 'weapon' | 'hull' | 'shield' | 'speed' | 'damage' | 'utility';
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  icon?: string;
  weaponType?: WeaponType;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  completed: boolean;
  rewardText: string;
}
