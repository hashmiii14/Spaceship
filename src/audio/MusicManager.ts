import { Storage } from '../utils/storage';
import { EventBus } from '../utils/EventBus';
import { AudioTrack } from '../types/game';

export interface FourthTrackConfig extends AudioTrack {}

/**
 * Track: Apun Jaise Tapori (Munna Bhai M.B.B.S.)
 */
export const apunJaiseTaporiTrack: AudioTrack = {
  id: 'apun-jaise-tapori',
  title: 'Apun Jaise Tapori',
  artist: 'Munna Bhai M.B.B.S.',
  url: '/audio/apun-jaise-tapori.mp3',
};

// Backwards compatibility alias
export const fourthTrack: FourthTrackConfig = apunJaiseTaporiTrack;

/**
 * Sequential Playlist:
 * 1. Chipi Chipi Chapa Chapa
 * 2. Apun Jaise Tapori
 * 3. Gangnam Style
 * 4. Axel F
 * (Repeats continuously in this exact order)
 */
export const PLAYLIST: AudioTrack[] = [
  {
    id: 'chipi-chipi',
    title: 'Chipi Chipi Chapa Chapa (Dubidubidu)',
    artist: 'Christell',
    url: '/audio/chipi-chipi.mp3',
  },
  apunJaiseTaporiTrack,
  {
    id: 'gangnam-style',
    title: 'Gangnam Style',
    artist: 'PSY',
    url: '/audio/gangnam-style.mp3',
  },
  {
    id: 'axel-f',
    title: 'Axel F',
    artist: 'Crazy Frog',
    url: '/audio/axel-f.mp3',
  },
];

class MusicManagerClass {
  private currentTrackIndex: number = 0;
  private audio: HTMLAudioElement | null = null;
  private isPlaying: boolean = false;
  private isMuted: boolean = false;
  private volume: number = 0.6;
  private isInitialized: boolean = false;
  private consecutiveErrors: number = 0;
  private isTransitioning: boolean = false;
  private fadeInterval: ReturnType<typeof setInterval> | null = null;
  private userHasInteracted: boolean = false;
  private pendingPlayOnInteraction: boolean = false;

  constructor() {
    this.isMuted = !Storage.getMusicEnabled();
    this.volume = Storage.getMusicVolume();

    // Listen for first user interaction globally to unlock audio
    if (typeof window !== 'undefined') {
      const unlockAudio = () => {
        this.unlock();
        window.removeEventListener('pointerdown', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
      };
      window.addEventListener('pointerdown', unlockAudio, { passive: true });
      window.addEventListener('keydown', unlockAudio, { passive: true });
    }
  }

  /**
   * Unlocks audio playback upon user interaction
   */
  public unlock(): void {
    this.userHasInteracted = true;
    if (this.pendingPlayOnInteraction && !this.isMuted) {
      this.pendingPlayOnInteraction = false;
      this.safePlay();
    }
  }

  /**
   * Singleton HTMLAudioElement initializer
   */
  private initAudio(): HTMLAudioElement {
    if (!this.audio && typeof window !== 'undefined') {
      this.audio = new Audio();
      this.audio.preload = 'metadata';
      this.audio.volume = this.volume;
      this.audio.muted = this.isMuted;

      // Auto next track: Sequential 1 -> 2 -> 3 -> 4 -> 1 ...
      this.audio.addEventListener('ended', () => {
        this.consecutiveErrors = 0;
        this.nextTrack();
      });

      // Graceful error recovery if an audio asset fails to load
      this.audio.addEventListener('error', () => {
        const track = this.getCurrentTrack();
        if (!this.audio?.error) return;
        console.warn(`[MusicManager] Audio error on ${track.title} (${track.url}): code ${this.audio.error.code}`);
        this.consecutiveErrors++;
        if (this.consecutiveErrors < PLAYLIST.length) {
          setTimeout(() => {
            if (this.isPlaying) {
              this.nextTrack();
            }
          }, 400);
        } else {
          this.isPlaying = false;
          this.emitState();
        }
      });
    }
    return this.audio!;
  }

  public getCurrentTrack(): AudioTrack {
    return PLAYLIST[this.currentTrackIndex];
  }

  public getCurrentTrackIndex(): number {
    return this.currentTrackIndex;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getVolume(): number {
    return this.volume;
  }

  public getMusicVolume(): number {
    return this.volume;
  }

  private emitState(): void {
    const track = this.getCurrentTrack();
    EventBus.emit('music:trackChanged', track);
    EventBus.emit('music:stateChanged', {
      isPlaying: this.isPlaying,
      isMuted: this.isMuted,
      track,
      index: this.currentTrackIndex,
    });
  }

  /**
   * Safe play helper to handle promise rejections, AbortError, and Autoplay policies
   */
  private async safePlay(): Promise<void> {
    if (this.isMuted || !this.audio) {
      this.isPlaying = false;
      this.emitState();
      return;
    }

    this.audio.volume = this.volume;
    this.audio.muted = false;

    try {
      await this.audio.play();
      this.isPlaying = true;
      this.consecutiveErrors = 0;
      this.emitState();
    } catch (err: any) {
      if (err && err.name === 'NotAllowedError') {
        // Autoplay policy prevented playback before interaction
        this.pendingPlayOnInteraction = true;
      } else if (err && err.name !== 'AbortError') {
        console.warn(`[MusicManager] Play failed on ${this.getCurrentTrack().title}:`, err);
      }
      this.isPlaying = false;
      this.emitState();
    }
  }

  /**
   * Internal clean track loader with guaranteed single-source playback
   */
  private async loadAndPlay(trackIndex: number, resetTimestamp: boolean = true): Promise<void> {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    try {
      this.currentTrackIndex = (trackIndex + PLAYLIST.length) % PLAYLIST.length;
      const track = this.getCurrentTrack();
      const audio = this.initAudio();
      this.isInitialized = true;

      if (this.fadeInterval) {
        clearInterval(this.fadeInterval);
        this.fadeInterval = null;
      }

      // Cleanly halt previous playback before switching source
      try {
        audio.pause();
      } catch {}

      if (audio.src !== window.location.origin + track.url && !audio.src.endsWith(track.url)) {
        audio.src = track.url;
        if (resetTimestamp) {
          audio.currentTime = 0;
        }
        try {
          audio.load();
        } catch {}
      } else if (resetTimestamp) {
        audio.currentTime = 0;
      }

      // Update UI immediately
      this.emitState();

      if (!this.isMuted) {
        await this.safePlay();
      }
    } finally {
      this.isTransitioning = false;
    }
  }

  /**
   * Cleanly starts playlist from specified index (default 0: Chipi Chipi)
   * Resets currentTime to 0:00 and guarantees fresh start.
   */
  public async startPlaylist(startIndex: number = 0): Promise<void> {
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
    await this.loadAndPlay(startIndex, true);
  }

  /**
   * Ensures music is playing without restarting the current track if already active
   */
  public ensurePlaying(): void {
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
    if (this.audio) {
      this.audio.volume = this.volume;
    }
    if (this.isMuted) return;
    const audio = this.initAudio();
    if (audio.paused) {
      if (!audio.src || audio.src === '' || !this.isInitialized) {
        this.loadAndPlay(this.currentTrackIndex, false);
      } else {
        this.resume();
      }
    }
  }

  /**
   * Starts playback of a track by index or current track
   */
  public async play(trackIndex?: number): Promise<void> {
    const targetIndex = trackIndex !== undefined ? trackIndex : this.currentTrackIndex;
    await this.loadAndPlay(targetIndex, true);
  }

  /**
   * Pause music while strictly preserving currentTime
   */
  public pause(): void {
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
    if (this.audio) {
      this.audio.volume = this.volume;
      if (!this.audio.paused) {
        try {
          this.audio.pause();
        } catch {}
      }
    }
    this.isPlaying = false;
    this.emitState();
  }

  /**
   * Cleanly stops music and halts any active audio
   */
  public stop(): void {
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
    if (this.audio) {
      try {
        this.audio.pause();
        this.audio.currentTime = 0;
      } catch {}
    }
    this.isPlaying = false;
    this.emitState();
  }

  /**
   * Resume music from exact paused timestamp
   */
  public resume(): void {
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
    if (this.audio) {
      this.audio.volume = this.volume;
    }
    if (this.isMuted) return;
    const audio = this.initAudio();
    if (!audio.src || audio.src === '') {
      this.loadAndPlay(this.currentTrackIndex);
      return;
    }
    this.safePlay();
  }

  /**
   * Toggles Play / Pause preserving timestamp
   */
  public togglePlayPause(): boolean {
    const audio = this.initAudio();
    if (this.isPlaying && !audio.paused) {
      this.pause();
      return false;
    } else {
      this.resume();
      return true;
    }
  }

  /**
   * NEXT button: Cleanly advances to next playlist track (1 -> 2 -> 3 -> 4 -> 1)
   */
  public nextTrack(): void {
    const nextIndex = (this.currentTrackIndex + 1) % PLAYLIST.length;
    this.loadAndPlay(nextIndex);
  }

  /**
   * PREVIOUS button:
   * If current track played > 3.0 seconds, restart current track.
   * Otherwise, go to previous playlist track.
   */
  public prevTrack(): void {
    const audio = this.initAudio();
    if (audio.currentTime > 3.0) {
      audio.currentTime = 0;
      if (!this.isMuted && audio.paused) {
        this.safePlay();
      } else {
        this.emitState();
      }
      return;
    }

    const prevIndex = (this.currentTrackIndex - 1 + PLAYLIST.length) % PLAYLIST.length;
    this.loadAndPlay(prevIndex);
  }

  /**
   * Direct track selector by index
   */
  public playTrack(index: number): void {
    if (index >= 0 && index < PLAYLIST.length) {
      this.loadAndPlay(index);
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    Storage.setMusicEnabled(!muted);

    if (this.audio) {
      this.audio.muted = muted;
    }

    if (muted) {
      if (this.audio && !this.audio.paused) {
        try {
          this.audio.pause();
        } catch {}
      }
      this.isPlaying = false;
      this.emitState();
    } else {
      this.ensurePlaying();
    }

    EventBus.emit('music:mutedChanged', muted);
  }

  public setVolume(val: number): void {
    this.volume = Math.max(0, Math.min(1, val));
    Storage.setMusicVolume(this.volume);
    if (this.audio) {
      this.audio.volume = this.volume;
    }
    EventBus.emit('music:volumeChanged', this.volume);
  }

  public setMusicVolume(val: number): void {
    this.setVolume(val);
  }

  public fadeOut(durationMs: number = 600): void {
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
    if (!this.audio || this.audio.paused) return;
    const startVol = this.audio.volume;
    const steps = 12;
    const stepTime = durationMs / steps;
    const volStep = startVol / steps;

    let currentStep = 0;
    this.fadeInterval = setInterval(() => {
      currentStep++;
      if (this.audio) {
        this.audio.volume = Math.max(0, this.audio.volume - volStep);
      }
      if (currentStep >= steps) {
        if (this.fadeInterval) {
          clearInterval(this.fadeInterval);
          this.fadeInterval = null;
        }
        this.pause();
        if (this.audio) {
          this.audio.volume = this.volume;
        }
      }
    }, stepTime);
  }
}

export const MusicManager = new MusicManagerClass();
