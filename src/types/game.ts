export type GameState = 'MAIN_MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export interface PlayerStats {
  score: number;
  highScore: number;
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  wave: number;
  lives: number;
  activePowerUps: {
    type: PowerUpType;
    duration: number;
    maxDuration: number;
  }[];
}

export type PowerUpType = 
  | 'SHIELD'
  | 'RAPID_FIRE'
  | 'DOUBLE_DAMAGE'
  | 'TRIPLE_SHOT'
  | 'HEALTH'
  | 'SCORE_BOOST';

export interface PowerUpConfig {
  type: PowerUpType;
  name: string;
  color: string;
  duration: number; // in seconds
  icon: string;
  description: string;
}

export interface BossInfo {
  active: boolean;
  name: string;
  currentHp: number;
  maxHp: number;
  phase: number;
}

export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
}
