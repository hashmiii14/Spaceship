import React from 'react';
import { Volume2, VolumeX, Music, HelpCircle, Play, Trophy, ShieldAlert } from 'lucide-react';
import { SoundEffects } from '../audio/SoundEffects';
import { MusicManager } from '../audio/MusicManager';

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

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-between p-6 z-30 pointer-events-auto select-none bg-gradient-to-b from-black/40 via-transparent to-black/70">
      {/* Top Bar / High Score */}
      <div className="w-full max-w-4xl flex justify-between items-center pt-4 px-2">
        <div className="flex items-center gap-2 bg-black/60 border border-cyan-500/30 px-4 py-2 rounded-full backdrop-blur-md">
          <Trophy className="w-5 h-5 text-yellow-400 animate-pulse" />
          <span className="text-xs uppercase tracking-widest text-gray-400 font-bold">Galactic Record:</span>
          <span className="text-lg font-bold font-mono text-yellow-400 tracking-wider">
            {highScore.toLocaleString()}
          </span>
        </div>

        {/* Audio Quick Toggles */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleMusicClick}
            className={`p-3 rounded-xl border transition-all flex items-center gap-2 backdrop-blur-md text-xs font-bold tracking-wider uppercase font-mono ${
              musicEnabled
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                : 'bg-black/60 border-gray-700 text-gray-500'
            }`}
            title="Toggle Music"
          >
            <Music className="w-4 h-4" />
            <span className="hidden sm:inline">MUSIC: {musicEnabled ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={handleSoundClick}
            className={`p-3 rounded-xl border transition-all flex items-center gap-2 backdrop-blur-md text-xs font-bold tracking-wider uppercase font-mono ${
              soundEnabled
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                : 'bg-black/60 border-gray-700 text-gray-500'
            }`}
            title="Toggle Sound Effects"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">SFX: {soundEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Hero Title Section */}
      <div className="flex flex-col items-center text-center my-auto">
        <div className="relative inline-block mb-3">
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-widest font-['Orbitron'] text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-300 to-cyan-500 neon-glow-cyan">
            STARFALL
          </h1>
          <div className="absolute -top-3 -right-6 text-xs font-mono px-2 py-0.5 rounded bg-pink-500/30 text-pink-300 border border-pink-500/50 uppercase tracking-widest">
            v1.0 Pro
          </div>
        </div>

        <div className="flex items-center gap-3 text-cyan-400/90 font-mono tracking-[0.35em] text-sm sm:text-base font-bold uppercase mb-8">
          <span className="h-px w-8 bg-cyan-500/60 inline-block" />
          DEFEND THE GALAXY
          <span className="h-px w-8 bg-cyan-500/60 inline-block" />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 w-full max-w-xs sm:max-w-sm">
          <button
            onClick={handlePlayClick}
            className="cyber-btn py-4 text-xl tracking-[0.2em] font-black group bg-cyan-500/20 border-2 border-cyan-400 shadow-[0_0_30px_rgba(0,240,255,0.4)] hover:shadow-[0_0_50px_rgba(0,240,255,0.8)]"
          >
            <Play className="w-6 h-6 mr-3 fill-cyan-400 group-hover:scale-110 transition-transform" />
            PLAY GAME
          </button>

          <button
            onClick={handleHowToPlayClick}
            className="cyber-btn cyber-btn-secondary py-3 text-base tracking-widest flex items-center justify-center gap-2"
          >
            <HelpCircle className="w-5 h-5 text-gray-400" />
            HOW TO PLAY
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="w-full text-center pb-2 text-xs font-mono text-gray-400 tracking-wider">
        <p className="flex items-center justify-center gap-2">
          <span>DESKTOP: [WASD / ARROWS] TO MOVE • [SPACE] TO FIRE • [ESC] PAUSE</span>
        </p>
        <p className="mt-1 text-gray-500">
          MOBILE & TABLET TOUCH CONTROLS SUPPORTED
        </p>
      </div>
    </div>
  );
};
