import { Storage } from '../utils/storage';
import { EventBus } from '../utils/EventBus';
import { AudioTrack } from '../types/game';

export const PLAYLIST: AudioTrack[] = [
  {
    id: 'chipi-chipi',
    title: 'Chipi Chipi Chapa Chapa (Dubidubidu)',
    artist: 'Christell',
    url: '/audio/chipi-chipi.mp3',
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

  constructor() {
    this.isMuted = !Storage.getMusicEnabled();
    this.volume = Storage.getMusicVolume();
  }

  private initAudio(): HTMLAudioElement {
    if (!this.audio) {
      this.audio = new Audio();
      this.audio.preload = 'auto';
      this.audio.volume = this.volume;
      this.audio.muted = this.isMuted;

      // Sequential playback: Track 1 -> Track 2 -> Track 3 -> Track 1 ...
      this.audio.addEventListener('ended', () => {
        this.nextTrack();
      });

      this.audio.addEventListener('error', (e) => {
        const track = this.getCurrentTrack();
        console.warn(`[MusicManager] Audio track failed to load: ${track.title} (${track.url})`, e);
      });
    }
    return this.audio;
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

  /**
   * Ensures music is playing without restarting the current track if already active
   */
  public ensurePlaying(): void {
    if (this.isMuted) return;
    const audio = this.initAudio();
    if (audio.paused) {
      if (!audio.src || audio.src === '' || !this.isInitialized) {
        this.play(this.currentTrackIndex);
      } else {
        this.resume();
      }
    }
  }

  /**
   * Starts playback of a track by index or current track
   */
  public async play(trackIndex?: number): Promise<void> {
    if (trackIndex !== undefined && trackIndex >= 0 && trackIndex < PLAYLIST.length) {
      this.currentTrackIndex = trackIndex;
    }

    const track = this.getCurrentTrack();
    const audio = this.initAudio();
    this.isInitialized = true;

    // Check if the source is already set to current track
    const expectedSrc = new URL(track.url, window.location.href).href;
    if (audio.src !== expectedSrc) {
      audio.src = track.url;
      audio.currentTime = 0;
    }

    audio.volume = this.volume;
    audio.muted = this.isMuted;

    if (this.isMuted) {
      this.isPlaying = false;
      EventBus.emit('music:trackChanged', track);
      return;
    }

    try {
      await audio.play();
      this.isPlaying = true;
      EventBus.emit('music:trackChanged', track);
      EventBus.emit('music:stateChanged', { isPlaying: true, track });
    } catch (err) {
      console.warn(`[MusicManager] Playback postponed or blocked: ${track.title}`, err);
      this.isPlaying = false;
      EventBus.emit('music:trackChanged', track);
    }
  }

  public pause(): void {
    if (this.audio && !this.audio.paused) {
      this.audio.pause();
    }
    this.isPlaying = false;
    EventBus.emit('music:stateChanged', { isPlaying: false, track: this.getCurrentTrack() });
  }

  public resume(): void {
    if (this.isMuted) return;
    if (this.audio) {
      this.audio.play().then(() => {
        this.isPlaying = true;
        EventBus.emit('music:stateChanged', { isPlaying: true, track: this.getCurrentTrack() });
      }).catch((err) => {
        console.warn('[MusicManager] Resume error:', err);
      });
    } else {
      this.play();
    }
  }

  public nextTrack(): void {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % PLAYLIST.length;
    const track = this.getCurrentTrack();
    const audio = this.initAudio();
    audio.src = track.url;
    audio.currentTime = 0;

    if (!this.isMuted) {
      audio.play().then(() => {
        this.isPlaying = true;
        EventBus.emit('music:trackChanged', track);
        EventBus.emit('music:stateChanged', { isPlaying: true, track });
      }).catch((err) => {
        console.warn('[MusicManager] Next track play error:', err);
      });
    } else {
      EventBus.emit('music:trackChanged', track);
    }
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    Storage.setMusicEnabled(!muted);

    if (this.audio) {
      this.audio.muted = muted;
    }

    if (muted) {
      if (this.audio && !this.audio.paused) {
        this.audio.pause();
      }
      this.isPlaying = false;
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
    if (!this.audio || this.audio.paused) return;
    const startVol = this.audio.volume;
    const steps = 12;
    const stepTime = durationMs / steps;
    const volStep = startVol / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (this.audio) {
        this.audio.volume = Math.max(0, this.audio.volume - volStep);
      }
      if (currentStep >= steps) {
        clearInterval(interval);
        this.pause();
        if (this.audio) {
          this.audio.volume = this.volume;
        }
      }
    }, stepTime);
  }
}

export const MusicManager = new MusicManagerClass();
