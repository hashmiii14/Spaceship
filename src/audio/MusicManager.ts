import { Storage } from '../utils/storage';
import { EventBus } from '../utils/EventBus';
import { AudioTrack } from '../types/game';

export const PLAYLIST: AudioTrack[] = [
  {
    id: 'dubidubidu',
    title: 'Dubidubidu (Chipi Chipi Chapa Chapa)',
    artist: 'Christell',
    url: '/audio/dubidubidu.mp3',
  },
  {
    id: 'axel-f',
    title: 'Axel F',
    artist: 'Crazy Frog',
    url: '/audio/axel-f.mp3',
  },
  {
    id: 'gangnam-style',
    title: 'Gangnam Style',
    artist: 'PSY',
    url: '/audio/gangnam-style.mp3',
  },
];

class MusicManagerClass {
  private currentTrackIndex: number = 0;
  private audio: HTMLAudioElement | null = null;
  private isPlaying: boolean = false;
  private isMuted: boolean = false;
  private volume: number = 0.6;
  private synthInterval: any = null;
  private synthCtx: AudioContext | null = null;
  private usingSynthFallback: boolean = false;

  constructor() {
    this.isMuted = !Storage.getMusicEnabled();
    this.volume = Storage.getMusicVolume();
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

  public async play(): Promise<void> {
    if (this.isMuted) {
      this.isPlaying = true;
      EventBus.emit('music:trackChanged', this.getCurrentTrack());
      return;
    }

    this.stopCurrent();
    const track = this.getCurrentTrack();

    try {
      this.audio = new Audio(track.url);
      this.audio.volume = this.volume;
      this.audio.preload = 'auto';

      this.audio.addEventListener('ended', () => {
        this.nextTrack();
      });

      this.audio.addEventListener('error', (e) => {
        console.warn(`Audio track "${track.title}" could not be loaded directly (${track.url}). Engaging procedural arcade synthesizer fallback.`, e);
        this.startProceduralFallback(track.id);
      });

      await this.audio.play();
      this.isPlaying = true;
      this.usingSynthFallback = false;
      EventBus.emit('music:trackChanged', track);
    } catch (err) {
      console.warn(`Autoplay or playback failed for "${track.title}". Starting procedural synth fallback.`, err);
      this.startProceduralFallback(track.id);
      this.isPlaying = true;
      EventBus.emit('music:trackChanged', track);
    }
  }

  public pause(): void {
    if (this.audio && !this.audio.paused) {
      this.audio.pause();
    }
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    this.isPlaying = false;
    EventBus.emit('music:stateChanged', { isPlaying: false, track: this.getCurrentTrack() });
  }

  public resume(): void {
    if (this.isMuted) return;
    if (this.usingSynthFallback) {
      this.startProceduralFallback(this.getCurrentTrack().id);
      this.isPlaying = true;
      EventBus.emit('music:stateChanged', { isPlaying: true, track: this.getCurrentTrack() });
      return;
    }
    if (this.audio) {
      this.audio.play().then(() => {
        this.isPlaying = true;
        EventBus.emit('music:stateChanged', { isPlaying: true, track: this.getCurrentTrack() });
      }).catch((e) => {
        console.warn('Failed to resume audio:', e);
      });
    } else {
      this.play();
    }
  }

  public nextTrack(): void {
    this.stopCurrent();
    this.currentTrackIndex = (this.currentTrackIndex + 1) % PLAYLIST.length;
    if (this.isPlaying || !this.isMuted) {
      this.play();
    } else {
      EventBus.emit('music:trackChanged', this.getCurrentTrack());
    }
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    Storage.setMusicEnabled(!muted);

    if (this.audio) {
      this.audio.muted = muted;
    }

    if (muted) {
      if (this.synthInterval) {
        clearInterval(this.synthInterval);
        this.synthInterval = null;
      }
      if (this.audio && !this.audio.paused) {
        this.audio.pause();
      }
    } else {
      if (this.isPlaying) {
        this.resume();
      } else {
        this.play();
      }
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

  public fadeOut(durationMs: number = 800): void {
    if (!this.audio || this.audio.paused) return;
    const startVol = this.audio.volume;
    const stepTime = 50;
    const steps = durationMs / stepTime;
    const volStep = startVol / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (this.audio && this.audio.volume > volStep) {
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

  private stopCurrent(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio = null;
    }
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    this.usingSynthFallback = false;
  }

  /**
   * High energy procedural arcade synthesizer fallback
   * Emulates hooks for Dubidubidu, Axel F, and Gangnam Style
   */
  private startProceduralFallback(trackId: string): void {
    if (this.isMuted) return;
    this.usingSynthFallback = true;
    if (this.synthInterval) clearInterval(this.synthInterval);

    try {
      if (!this.synthCtx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) this.synthCtx = new AudioCtx();
      }
      if (this.synthCtx && this.synthCtx.state === 'suspended') {
        this.synthCtx.resume();
      }
    } catch {
      return;
    }

    const ctx = this.synthCtx;
    if (!ctx) return;

    // Melody definitions
    // Frequencies: C4=261.6, D4=293.7, E4=329.6, F4=349.2, G4=392.0, A4=440.0, B4=493.9, C5=523.3, D5=587.3, E5=659.3, F5=698.5
    let pattern: { note: number; dur: number }[] = [];
    let tempoMs = 130;

    if (trackId === 'dubidubidu') {
      // Chipi chipi chapa chapa dubi dubi daba daba
      pattern = [
        { note: 392.0, dur: 0.12 }, { note: 392.0, dur: 0.12 }, { note: 440.0, dur: 0.12 }, { note: 523.3, dur: 0.2 },
        { note: 392.0, dur: 0.12 }, { note: 392.0, dur: 0.12 }, { note: 349.2, dur: 0.12 }, { note: 329.6, dur: 0.2 },
        { note: 329.6, dur: 0.12 }, { note: 349.2, dur: 0.12 }, { note: 392.0, dur: 0.12 }, { note: 349.2, dur: 0.12 },
        { note: 329.6, dur: 0.12 }, { note: 293.7, dur: 0.12 }, { note: 261.6, dur: 0.3 }
      ];
      tempoMs = 150;
    } else if (trackId === 'axel-f') {
      // Axel F iconic synth line: F4, Ab4, F4, F4, Bb4, F4, Eb4, F4, C5, F4, F4, Db5, C5, Ab4...
      pattern = [
        { note: 349.23, dur: 0.18 }, { note: 415.30, dur: 0.18 }, { note: 349.23, dur: 0.12 }, { note: 349.23, dur: 0.08 },
        { note: 466.16, dur: 0.15 }, { note: 349.23, dur: 0.15 }, { note: 311.13, dur: 0.15 },
        { note: 349.23, dur: 0.18 }, { note: 523.25, dur: 0.18 }, { note: 349.23, dur: 0.12 }, { note: 349.23, dur: 0.08 },
        { note: 554.37, dur: 0.15 }, { note: 523.25, dur: 0.15 }, { note: 415.30, dur: 0.15 }
      ];
      tempoMs = 140;
    } else {
      // Gangnam Style synth hook: B4, B4, B4, A4, B4, B4, B4, A4, B4, D5...
      pattern = [
        { note: 493.88, dur: 0.1 }, { note: 493.88, dur: 0.1 }, { note: 493.88, dur: 0.1 }, { note: 440.00, dur: 0.15 },
        { note: 493.88, dur: 0.1 }, { note: 493.88, dur: 0.1 }, { note: 493.88, dur: 0.1 }, { note: 440.00, dur: 0.15 },
        { note: 493.88, dur: 0.12 }, { note: 587.33, dur: 0.18 }, { note: 493.88, dur: 0.12 }, { note: 440.00, dur: 0.25 }
      ];
      tempoMs = 135;
    }

    let noteIdx = 0;
    let loopCount = 0;

    this.synthInterval = setInterval(() => {
      if (this.isMuted || !this.isPlaying) return;
      const current = pattern[noteIdx];
      noteIdx++;

      if (noteIdx >= pattern.length) {
        noteIdx = 0;
        loopCount++;
        // Automatically advance to the next track after ~45 seconds of procedural playback
        if (loopCount > 15) {
          this.nextTrack();
          return;
        }
      }

      if (!current) return;

      const now = ctx.currentTime;
      // Lead melodic synth
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = trackId === 'axel-f' ? 'sawtooth' : trackId === 'gangnam-style' ? 'square' : 'triangle';
      osc.frequency.setValueAtTime(current.note, now);

      const targetGain = this.volume * 0.15;
      gain.gain.setValueAtTime(targetGain, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + current.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + current.dur);

      // Bass beat punch
      if (noteIdx % 4 === 0) {
        const bassOsc = ctx.createOscillator();
        const bassGain = ctx.createGain();
        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(110, now);
        bassOsc.frequency.exponentialRampToValueAtTime(35, now + 0.1);
        bassGain.gain.setValueAtTime(this.volume * 0.2, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        bassOsc.connect(bassGain);
        bassGain.connect(ctx.destination);
        bassOsc.start(now);
        bassOsc.stop(now + 0.1);
      }
    }, tempoMs);
  }
}

export const MusicManager = new MusicManagerClass();
