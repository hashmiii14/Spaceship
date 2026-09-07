import React, { useState } from 'react';
import { Play, RotateCcw, Home, Music, Volume2, Settings, SkipBack, SkipForward } from 'lucide-react';
import { SoundEffects } from '../audio/SoundEffects';
import { MusicManager } from '../audio/MusicManager';
import { AudioTrack } from '../types/game';
import { SettingsModal } from './SettingsModal';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
  musicEnabled: boolean;
  soundEnabled: boolean;
  onToggleMusic: () => void;
  onToggleSound: () => void;
  currentTrack: AudioTrack | null;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onMainMenu,
  musicEnabled,
  soundEnabled,
  onToggleMusic,
  onToggleSound,
  currentTrack,
}) => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/90 p-4 select-none pointer-events-auto">
      <div className="cyber-panel-military w-full max-w-sm p-6 sm:p-8 flex flex-col items-center text-center border-red-500/50 shadow-[0_0_50px_rgba(255,0,51,0.35)]">
        <h2 className="text-3xl sm:text-4xl font-black font-['Orbitron'] tracking-widest text-white neon-glow-red mb-2">
          SYSTEM PAUSED
        </h2>
        <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-red-500 to-transparent mb-5" />

        {/* Current Song in Pause Menu with Skip Controls */}
        <div className="w-full bg-red-950/40 border border-red-500/30 rounded-lg p-2.5 mb-5 flex items-center justify-between gap-2 text-xs font-mono text-red-300">
          <button
            onClick={() => {
              SoundEffects.playClick();
              MusicManager.prevTrack();
            }}
            className="p-1 rounded hover:bg-red-500/20 text-gray-400 hover:text-white transition-colors cursor-pointer"
            title="Previous Song"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 truncate max-w-[180px]">
            <Music className={`w-4 h-4 text-red-400 shrink-0 ${musicEnabled ? 'animate-spin' : 'opacity-40'}`} />
            <span className="font-bold truncate">{currentTrack ? currentTrack.title : 'AUDIO READY'}</span>
          </div>

          <button
            onClick={() => {
              SoundEffects.playClick();
              MusicManager.nextTrack();
            }}
            className="p-1 rounded hover:bg-red-500/20 text-gray-400 hover:text-white transition-colors cursor-pointer"
            title="Next Song"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={() => {
              SoundEffects.playClick();
              onResume();
            }}
            className="cyber-btn-red py-3 w-full flex items-center justify-center gap-2 text-lg font-bold shadow-[0_0_20px_rgba(255,0,51,0.5)]"
          >
            <Play className="w-5 h-5 fill-white" />
            RESUME SORTIE
          </button>

          <button
            onClick={() => {
              SoundEffects.playClick();
              onRestart();
            }}
            className="cyber-btn cyber-btn-secondary py-2.5 w-full flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            RESTART MISSION
          </button>

          <button
            onClick={() => {
              SoundEffects.playClick();
              setShowSettings(true);
            }}
            className="cyber-btn cyber-btn-secondary py-2.5 w-full flex items-center justify-center gap-2"
          >
            <Settings className="w-4 h-4 text-red-400" />
            SETTINGS & AUDIO
          </button>

          {/* Quick Audio Toggles */}
          <div className="grid grid-cols-2 gap-2 my-1">
            <button
              onClick={() => {
                SoundEffects.playClick();
                onToggleMusic();
              }}
              className={`p-2 rounded-lg border text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                musicEnabled
                  ? 'bg-red-950/50 border-red-500 text-red-300 shadow-[0_0_10px_rgba(255,0,51,0.3)]'
                  : 'bg-black/40 border-gray-800 text-gray-500'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              MUSIC {musicEnabled ? 'ON' : 'OFF'}
            </button>

            <button
              onClick={() => {
                SoundEffects.playClick();
                onToggleSound();
              }}
              className={`p-2 rounded-lg border text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                soundEnabled
                  ? 'bg-red-950/50 border-red-500 text-red-300 shadow-[0_0_10px_rgba(255,0,51,0.3)]'
                  : 'bg-black/40 border-gray-800 text-gray-500'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              SFX {soundEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          <button
            onClick={() => {
              SoundEffects.playClick();
              onMainMenu();
            }}
            className="cyber-btn cyber-btn-secondary py-2.5 w-full flex items-center justify-center gap-2 text-gray-400 hover:text-white"
          >
            <Home className="w-5 h-5" />
            MAIN MENU
          </button>
        </div>
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
};
