import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Home, Trophy, Sparkles, Skull } from 'lucide-react';
import { SoundEffects } from '../audio/SoundEffects';

interface GameOverModalProps {
  score: number;
  highScore: number;
  wave: number;
  isNewHighScore: boolean;
  onRestart: () => void;
  onMainMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  highScore,
  wave,
  isNewHighScore,
  onRestart,
  onMainMenu,
}) => {
  useEffect(() => {
    if (isNewHighScore) {
      SoundEffects.playHighScore();
      // Launch colorful celebratory confetti
      const end = Date.now() + 2.5 * 1000;
      const colors = ['#00f0ff', '#ff0055', '#facc15', '#a855f7'];

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    }
  }, [isNewHighScore]);

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none pointer-events-auto">
      <div className="cyber-panel cyber-panel-danger w-full max-w-md p-6 sm:p-8 flex flex-col items-center text-center shadow-[0_0_60px_rgba(255,0,85,0.4)]">
        {/* Skull Icon / Title */}
        <div className="w-14 h-14 rounded-full bg-red-950/60 border border-red-500/50 flex items-center justify-center mb-3 text-red-400">
          <Skull className="w-8 h-8" />
        </div>

        <h2 className="text-4xl sm:text-5xl font-black font-['Orbitron'] tracking-widest text-red-500 neon-glow-magenta mb-1">
          GAME OVER
        </h2>
        <span className="text-xs font-mono tracking-[0.3em] text-red-300/80 uppercase mb-5">
          VESSEL DESTROYED IN WAVE {wave}
        </span>

        {/* New Record Celebration Badge */}
        {isNewHighScore && (
          <div className="animate-celebrate bg-gradient-to-r from-yellow-500/20 via-yellow-400/30 to-yellow-500/20 border-2 border-yellow-400/80 rounded-xl px-4 py-2.5 mb-5 flex items-center gap-2 text-yellow-300 shadow-[0_0_25px_rgba(250,204,21,0.5)]">
            <Sparkles className="w-5 h-5 text-yellow-400 animate-spin" />
            <span className="text-sm sm:text-base font-black font-['Orbitron'] tracking-wider">
              NEW HIGH SCORE!
            </span>
            <Sparkles className="w-5 h-5 text-yellow-400 animate-spin" />
          </div>
        )}

        {/* Score Breakdown Cards */}
        <div className="grid grid-cols-2 gap-3 w-full mb-6">
          <div className="bg-black/60 border border-cyan-500/30 rounded-lg p-3 flex flex-col items-center">
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
              FINAL SCORE
            </span>
            <span className="text-2xl sm:text-3xl font-black font-mono text-white mt-0.5">
              {score.toLocaleString()}
            </span>
          </div>

          <div className="bg-black/60 border border-yellow-500/30 rounded-lg p-3 flex flex-col items-center">
            <div className="flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-yellow-400 font-bold">
                HIGH SCORE
              </span>
            </div>
            <span className="text-2xl sm:text-3xl font-black font-mono text-yellow-300 mt-0.5">
              {highScore.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={() => {
              SoundEffects.playClick();
              onRestart();
            }}
            className="cyber-btn flex-1 py-3.5 flex items-center justify-center gap-2 text-base font-bold bg-cyan-500/25 border-cyan-400 text-white shadow-[0_0_20px_rgba(0,240,255,0.4)]"
          >
            <RotateCcw className="w-5 h-5" />
            PLAY AGAIN
          </button>

          <button
            onClick={() => {
              SoundEffects.playClick();
              onMainMenu();
            }}
            className="cyber-btn cyber-btn-secondary flex-1 py-3.5 flex items-center justify-center gap-2 text-base"
          >
            <Home className="w-5 h-5" />
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
};
