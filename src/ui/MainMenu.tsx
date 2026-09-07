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

export const MainMenu: React.FC<MainMenuProps> = React.memo(({
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
          <div className="cyber-panel-military flex items-center gap-2 border-red-500/50 px-3.5 py-1.5 rounded-full">
            <Trophy className="w-4 h-4 text-red-400" />
            <span className="text-[11px] uppercase tracking-widest text-gray-400 font-bold">BEST SCORE:</span>
            <span className="text-base font-bold font-mono text-red-400 tracking-wider neon-glow-red">
              {highScore.toLocaleString()}
            </span>
          </div>

          <div className="hidden sm:flex cyber-panel-military items-center gap-2 border-red-500/40 px-3 py-1.5 rounded-full text-xs font-mono text-rose-300">
            <Sparkles className="w-3.5 h-3.5 text-red-400" />
            <span className="text-gray-400">BEST SECTOR:</span>
            <span className="font-bold">{bestLevel}</span>
          </div>

          <div className="hidden sm:flex cyber-panel-military items-center gap-2 border-red-500/40 px-3 py-1.5 rounded-full text-xs font-mono text-rose-300">
            <Flame className="w-3.5 h-3.5 text-red-400" />
            <span className="text-gray-400">MAX COMBO:</span>
            <span className="font-bold">{bestCombo}x</span>
          </div>
        </div>

        {/* Quick Toggles */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleMusicClick}
            className={`p-2.5 sm:p-3 rounded-xl border transition-all flex items-center gap-2 text-xs font-bold tracking-wider uppercase font-mono ${
              musicEnabled
                ? 'bg-red-950/40 border-red-500 text-red-300 shadow-[0_0_15px_rgba(255,0,51,0.3)]'
                : 'bg-black/80 border-gray-800 text-gray-500'
            }`}
            title="Toggle Music"
          >
            <Music className="w-4 h-4" />
            <span className="hidden sm:inline">{musicEnabled ? 'AUDIO ON' : 'AUDIO OFF'}</span>
          </button>

          <button
            onClick={handleSoundClick}
            className={`p-2.5 sm:p-3 rounded-xl border transition-all flex items-center gap-2 text-xs font-bold tracking-wider uppercase font-mono ${
              soundEnabled
                ? 'bg-red-950/40 border-red-500 text-red-300 shadow-[0_0_15px_rgba(255,0,51,0.3)]'
                : 'bg-black/80 border-gray-800 text-gray-500'
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
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-widest font-['Orbitron'] text-transparent bg-clip-text bg-gradient-to-b from-white via-rose-200 to-red-500 neon-glow-red">
            STARFALL
          </h1>
        </div>

        <div className="flex items-center gap-3 text-red-400 font-mono tracking-[0.35em] text-xs sm:text-sm md:text-base font-bold uppercase mb-4">
          <span className="h-px w-8 bg-red-500/60 inline-block" />
          DEFEND THE GALAXY
          <span className="h-px w-8 bg-red-500/60 inline-block" />
        </div>

        {/* Tactical Telemetry Badge */}
        <div className="cyber-panel-military px-4 py-1.5 rounded-full mb-8 border-red-500/40 flex items-center gap-2 text-[11px] font-mono text-red-300/90 shadow-[0_0_15px_rgba(255,0,51,0.2)]">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span className="font-bold">SIGNATURE RED WEAPONS ACTIVE</span>
          <span className="text-gray-500">|</span>
          <span className="text-rose-400 font-bold">600 PX/S WARP OVERDRIVE</span>
        </div>

        {/* Action Buttons: PLAY, HOW TO PLAY, SETTINGS */}
        <div className="flex flex-col gap-3.5 w-full max-w-xs sm:max-w-sm">
          <button
            onClick={handlePlayClick}
            className="cyber-btn-red py-4 text-xl tracking-[0.2em] font-black group shadow-[0_0_35px_rgba(255,0,51,0.5)] hover:shadow-[0_0_65px_rgba(255,0,51,0.9)] flex items-center justify-center transition-all"
          >
            <Play className="w-6 h-6 mr-3 fill-white group-hover:scale-110 transition-transform" />
            PLAY
          </button>

          <button
            onClick={handleHowToPlayClick}
            className="cyber-btn cyber-btn-secondary py-3 text-sm sm:text-base tracking-widest flex items-center justify-center gap-2 bg-black/80 border-gray-800 hover:border-red-500"
          >
            <HelpCircle className="w-4 h-4 text-red-400" />
            HOW TO PLAY
          </button>

          <button
            onClick={handleSettingsClick}
            className="cyber-btn cyber-btn-secondary py-3 text-sm sm:text-base tracking-widest flex items-center justify-center gap-2 bg-black/80 border-gray-800 hover:border-red-500"
          >
            <Settings className="w-4 h-4 text-red-400" />
            SETTINGS
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="w-full text-center pb-2 text-[11px] sm:text-xs font-mono text-gray-400 tracking-wider">
        <p className="flex items-center justify-center gap-2">
          <span>DESKTOP: [WASD / ARROWS] MOVE | [SPACE] FIRE | [M] MUTE | [N] NEXT TRACK | [ESC] PAUSE</span>
        </p>
        <p className="mt-1 text-gray-500">
          TOUCH / DUAL-THUMB JOYSTICK AUTO-ENGAGED FOR MOBILE TABLET
        </p>
      </div>

      {/* Settings Modal */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
});
