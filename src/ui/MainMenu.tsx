import React, { useState } from 'react';
import { Volume2, VolumeX, Music, HelpCircle, Play, Trophy, Settings, Sparkles, Flame } from 'lucide-react';
import { SoundEffects } from '../audio/SoundEffects';
import { Storage } from '../utils/storage';
import { SettingsModal } from './SettingsModal';

interface MainMenuProps {
  onStartGame: () => void;
  onOpenHowToPlay: () => void;
  highScore: number;
  musicEnabled: boolean;
  soundEnabled: boolean;
  onToggleMusic: () => void;
  onToggleSound: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartGame,
  onOpenHowToPlay,
  highScore,
  musicEnabled,
  soundEnabled,
  onToggleMusic,
  onToggleSound,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const bestLevel = Storage.getBestLevel();
  const bestCombo = Storage.getBestCombo();

  const handlePlayClick = () => {
    SoundEffects.playClick();
    onStartGame();
  };

  const handleHowToPlayClick = () => {
    SoundEffects.playClick();
    onOpenHowToPlay();
  };

  const handleMusicClick = () => {
    SoundEffects.playClick();
    onToggleMusic();
  };

  const handleSoundClick = () => {
    SoundEffects.playClick();
    onToggleSound();
  };

  const handleSettingsClick = () => {
    SoundEffects.playClick();
    setShowSettings(true);
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-between p-4 sm:p-6 z-30 pointer-events-auto select-none bg-gradient-to-b from-black/50 via-transparent to-black/80">
      {/* Top Bar / Records */}
      <div className="w-full max-w-5xl flex justify-between items-center pt-2 px-2 flex-wrap gap-3">
        {/* Galactic Records */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-black/70 border border-yellow-500/40 px-3.5 py-1.5 rounded-full backdrop-blur-md">
            <Trophy className="w-4 h-4 text-yellow-400 animate-pulse" />
            <span className="text-[11px] uppercase tracking-widest text-gray-400 font-bold">RECORD:</span>
            <span className="text-base font-bold font-mono text-yellow-400 tracking-wider">
              {highScore.toLocaleString()}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-black/70 border border-cyan-500/30 px-3 py-1.5 rounded-full backdrop-blur-md text-xs font-mono text-cyan-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-gray-400">BEST LEVEL:</span>
            <span className="font-bold">{bestLevel}</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-black/70 border border-purple-500/30 px-3 py-1.5 rounded-full backdrop-blur-md text-xs font-mono text-purple-300">
            <Flame className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-gray-400">MAX COMBO:</span>
            <span className="font-bold">{bestCombo}x</span>
          </div>
        </div>

        {/* Quick Toggles & Settings */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleSettingsClick}
            className="p-2.5 sm:p-3 rounded-xl border border-gray-700 bg-black/60 hover:border-cyan-400 text-gray-300 hover:text-cyan-300 backdrop-blur-md text-xs font-bold tracking-wider font-mono flex items-center gap-2 transition-all"
            title="Open Settings"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">SETTINGS</span>
          </button>

          <button
            onClick={handleMusicClick}
            className={`p-2.5 sm:p-3 rounded-xl border transition-all flex items-center gap-2 backdrop-blur-md text-xs font-bold tracking-wider uppercase font-mono ${
              musicEnabled
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                : 'bg-black/60 border-gray-700 text-gray-500'
            }`}
            title="Toggle Music"
          >
            <Music className="w-4 h-4" />
            <span className="hidden sm:inline">{musicEnabled ? 'MUSIC ON' : 'MUSIC OFF'}</span>
          </button>

          <button
            onClick={handleSoundClick}
            className={`p-2.5 sm:p-3 rounded-xl border transition-all flex items-center gap-2 backdrop-blur-md text-xs font-bold tracking-wider uppercase font-mono ${
              soundEnabled
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                : 'bg-black/60 border-gray-700 text-gray-500'
            }`}
            title="Toggle Sound Effects"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{soundEnabled ? 'SFX ON' : 'SFX OFF'}</span>
          </button>
        </div>
      </div>

      {/* Hero Title Section */}
      <div className="flex flex-col items-center text-center my-auto">
        <div className="relative inline-block mb-2">
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-widest font-['Orbitron'] text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-300 to-cyan-500 neon-glow-cyan">
            STARFALL
          </h1>
          <div className="absolute -top-3 -right-6 text-[10px] sm:text-xs font-mono px-2 py-0.5 rounded bg-pink-500/30 text-pink-300 border border-pink-500/50 uppercase tracking-widest shadow-[0_0_10px_rgba(236,72,153,0.5)]">
            2026 EDITION
          </div>
        </div>

        <div className="flex items-center gap-3 text-cyan-400/90 font-mono tracking-[0.35em] text-xs sm:text-sm md:text-base font-bold uppercase mb-8">
          <span className="h-px w-8 bg-cyan-500/60 inline-block" />
          DEFEND THE GALAXY
          <span className="h-px w-8 bg-cyan-500/60 inline-block" />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3.5 w-full max-w-xs sm:max-w-sm">
          <button
            onClick={handlePlayClick}
            className="cyber-btn py-4 text-xl tracking-[0.2em] font-black group bg-cyan-500/20 border-2 border-cyan-400 shadow-[0_0_30px_rgba(0,240,255,0.4)] hover:shadow-[0_0_55px_rgba(0,240,255,0.85)] flex items-center justify-center"
          >
            <Play className="w-6 h-6 mr-3 fill-cyan-400 group-hover:scale-110 transition-transform" />
            START GAME
          </button>

          <button
            onClick={handleSettingsClick}
            className="cyber-btn cyber-btn-secondary py-3 text-sm sm:text-base tracking-widest flex items-center justify-center gap-2"
          >
            <Settings className="w-4 h-4 text-cyan-400" />
            VESSEL HANGAR & SETTINGS
          </button>

          <button
            onClick={handleHowToPlayClick}
            className="cyber-btn cyber-btn-secondary py-3 text-sm sm:text-base tracking-widest flex items-center justify-center gap-2"
          >
            <HelpCircle className="w-4 h-4 text-gray-400" />
            FLIGHT MANUAL
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="w-full text-center pb-2 text-[11px] sm:text-xs font-mono text-gray-400 tracking-wider">
        <p className="flex items-center justify-center gap-2">
          <span>DESKTOP: [WASD / ARROWS] MOVE • [SPACE] PRIMARY FIRE • [ESC] PAUSE</span>
        </p>
        <p className="mt-1 text-gray-500">
          MOBILE VIRTUAL JOYSTICK & TOUCH TARGETING ENABLED
        </p>
      </div>

      {/* Settings Modal */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
};
