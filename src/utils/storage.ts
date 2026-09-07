const STORAGE_KEYS = {
  HIGH_SCORE: 'starfall_high_score',
  MUSIC_ENABLED: 'starfall_music_enabled',
  SOUND_ENABLED: 'starfall_sound_enabled',
  VOLUME: 'starfall_volume',
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
    } catch (e) {
      console.warn('Storage: Unable to persist music state', e);
    }
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
    } catch (e) {
      console.warn('Storage: Unable to persist sound state', e);
    }
  },

  getVolume(): number {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.VOLUME);
      return val ? Math.max(0, Math.min(1, parseFloat(val))) : 0.7;
    } catch {
      return 0.7;
    }
  },

  setVolume(volume: number): void {
    try {
      localStorage.setItem(STORAGE_KEYS.VOLUME, volume.toString());
    } catch (e) {
      console.warn('Storage: Unable to persist volume', e);
    }
  }
};
