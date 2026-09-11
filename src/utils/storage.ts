import { GraphicsQuality, ShipSkin } from '../types/game';

const STORAGE_KEYS = {
  HIGH_SCORE: 'starfall_high_score',
  BEST_LEVEL: 'starfall_best_level',
  BEST_COMBO: 'starfall_best_combo',
  BEST_SURVIVAL_TIME: 'starfall_best_survival_time',
  MUSIC_ENABLED: 'starfall_music_enabled',
  SOUND_ENABLED: 'starfall_sound_enabled',
  MUSIC_VOLUME: 'starfall_music_volume',
  SFX_VOLUME: 'starfall_sfx_volume',
  QUALITY: 'starfall_quality',
  SELECTED_SKIN: 'starfall_selected_skin',
  AUTO_FIRE: 'starfall_auto_fire',
};

export const Storage = {
  getHighScore(): number {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.HIGH_SCORE);
      return val ? parseInt(val, 10) || 0 : 0;
    } catch {
      return 0;
    }
  },

  setHighScore(score: number): void {
    try {
      const current = this.getHighScore();
      if (score > current) {
        localStorage.setItem(STORAGE_KEYS.HIGH_SCORE, score.toString());
      }
    } catch (e) {
      console.warn('Storage: Unable to persist high score', e);
    }
  },

  getBestLevel(): number {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.BEST_LEVEL);
      return val ? parseInt(val, 10) || 1 : 1;
    } catch {
      return 1;
    }
  },

  setBestLevel(lvl: number): void {
    try {
      if (lvl > this.getBestLevel()) {
        localStorage.setItem(STORAGE_KEYS.BEST_LEVEL, lvl.toString());
      }
    } catch {}
  },

  getBestCombo(): number {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.BEST_COMBO);
      return val ? parseInt(val, 10) || 0 : 0;
    } catch {
      return 0;
    }
  },

  setBestCombo(combo: number): void {
    try {
      if (combo > this.getBestCombo()) {
        localStorage.setItem(STORAGE_KEYS.BEST_COMBO, combo.toString());
      }
    } catch {}
  },

  getBestSurvivalTime(): number {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.BEST_SURVIVAL_TIME);
      return val ? parseInt(val, 10) || 0 : 0;
    } catch {
      return 0;
    }
  },

  setBestSurvivalTime(seconds: number): void {
    try {
      if (seconds > this.getBestSurvivalTime()) {
        localStorage.setItem(STORAGE_KEYS.BEST_SURVIVAL_TIME, seconds.toString());
      }
    } catch {}
  },

  getMusicEnabled(): boolean {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.MUSIC_ENABLED);
      return val === null ? true : val === 'true';
    } catch {
      return true;
    }
  },

  setMusicEnabled(enabled: boolean): void {
    try {
      localStorage.setItem(STORAGE_KEYS.MUSIC_ENABLED, enabled.toString());
    } catch {}
  },

  getSoundEnabled(): boolean {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.SOUND_ENABLED);
      return val === null ? true : val === 'true';
    } catch {
      return true;
    }
  },

  setSoundEnabled(enabled: boolean): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, enabled.toString());
    } catch {}
  },

  getMusicVolume(): number {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.MUSIC_VOLUME);
      return val ? Math.max(0, Math.min(1, parseFloat(val))) : 0.65;
    } catch {
      return 0.65;
    }
  },

  setMusicVolume(volume: number): void {
    try {
      localStorage.setItem(STORAGE_KEYS.MUSIC_VOLUME, volume.toString());
    } catch {}
  },

  getSfxVolume(): number {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.SFX_VOLUME);
      return val ? Math.max(0, Math.min(1, parseFloat(val))) : 0.8;
    } catch {
      return 0.8;
    }
  },

  setSfxVolume(volume: number): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SFX_VOLUME, volume.toString());
    } catch {}
  },

  getQuality(): GraphicsQuality {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.QUALITY) as GraphicsQuality;
      return ['LOW', 'MEDIUM', 'HIGH'].includes(val) ? val : 'HIGH';
    } catch {
      return 'HIGH';
    }
  },

  setQuality(quality: GraphicsQuality): void {
    try {
      localStorage.setItem(STORAGE_KEYS.QUALITY, quality);
    } catch {}
  },

  getSoundVolume(): number {
    return this.getSfxVolume();
  },

  setSoundVolume(volume: number): void {
    this.setSfxVolume(volume);
  },

  getSkin(): ShipSkin {
    return this.getSelectedSkin();
  },

  setSkin(skin: ShipSkin): void {
    this.setSelectedSkin(skin);
  },

  getSelectedSkin(): ShipSkin {
    const defaultSkin: ShipSkin = {
      id: 'neon',
      name: 'NEON PROTOCOL',
      description: 'Standard elite starfighter with high-coherence cyan plasma conduits.',
      color: '#00f0ff',
      glowColor: 'rgba(0, 240, 255, 0.6)',
    };
    try {
      const val = localStorage.getItem(STORAGE_KEYS.SELECTED_SKIN);
      if (!val) return defaultSkin;
      try {
        const parsed = JSON.parse(val);
        if (parsed && parsed.id) return parsed;
      } catch {
        return { ...defaultSkin, id: val.toLowerCase() };
      }
      return defaultSkin;
    } catch {
      return defaultSkin;
    }
  },

  setSelectedSkin(skin: ShipSkin): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SELECTED_SKIN, JSON.stringify(skin));
    } catch {}
  },

  getAutoFire(): boolean {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.AUTO_FIRE);
      return val === 'true';
    } catch {
      return false;
    }
  },

  setAutoFire(enabled: boolean): void {
    try {
      localStorage.setItem(STORAGE_KEYS.AUTO_FIRE, enabled ? 'true' : 'false');
    } catch {}
  }
};
