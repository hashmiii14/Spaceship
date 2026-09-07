import React from 'react';
import { Play, RotateCcw, Home, Music, Volume2, VolumeX } from 'lucide-react';
import { SoundEffects } from '../audio/SoundEffects';
import { AudioTrack } from '../types/game';

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
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 select-none pointer-events-auto">
      <div className="cyber-panel w-full max-w-sm p-6 sm:p-8 flex flex-col items-center text-center border-cyan-500/50 shadow-[0_0_50px_rgba(0,240,255,0.3)]">
        <h2 className="text-4xl font-black font-['Orbitron'] tracking-widest text-cyan-300 neon-glow-cyan mb-2">
          SYSTEM PAUSED
        </h2>
        <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-cyan-400 to-transparent mb-6" />

        {/* Current Song in Pause Menu */}
        {currentTrack && (
          <div className="w-full bg-cyan-950/40 border border-cyan-500/30 rounded-lg p-2.5 mb-6 flex items-center justify-center gap-2 text-xs font-mono text-cyan-300">
            <Music className="w-4 h-4 text-cyan-400 shrink-0" />
            <div className="truncate">
              <span className="text-gray-400 mr-1">PLAYING:</span>
              <span className="font-bold">{currentTrack.title}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3.5 w-full">
          <button
            onClick={() => {
              SoundEffects.playClick();
              onResume();
            }}
            className="cyber-btn py-3 w-full flex items-center justify-center gap-2 text-lg"
          >
            <Play className="w-5 h-5 fill-cyan-400" />
            RESUME
          </button>

          <button
            onClick={() => {
              SoundEffects.playClick();
              onRestart();
            }}
            className="cyber-btn cyber-btn-secondary py-3 w-full flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            RESTART
          </button>

          {/* Audio Toggles Row */}
          <div className="grid grid-cols-2 gap-2 my-1">
            <button
              onClick={() => {
                SoundEffects.playClick();
                onToggleMusic();
              }}
              className={`p-2.5 rounded-lg border text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                musicEnabled
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                  : 'bg-black/40 border-gray-700 text-gray-500'
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
              className={`p-2.5 rounded-lg border text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                soundEnabled
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                  : 'bg-black/40 border-gray-700 text-gray-500'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              SFX {soundEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          <button
            onClick={() => {
              SoundEffects.playClick();
              onMainMenu();
            }}
            className="cyber-btn cyber-btn-secondary py-3 w-full flex items-center justify-center gap-2 text-gray-400 hover:text-white"
          >
            <Home className="w-5 h-5" />
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
};
