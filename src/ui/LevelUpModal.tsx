import React, { useEffect, useRef } from 'react';
import { Zap, Shield, Activity, Crosshair, Wind, Magnet, ChevronRight } from 'lucide-react';
import { LevelUpOption } from '../types/game';
import { SoundEffects } from '../audio/SoundEffects';

interface LevelUpModalProps {
  options: LevelUpOption[];
  onSelect: (option: LevelUpOption) => void;
}

const RARITY_STYLES: Record<string, { border: string; glow: string; badge: string; text: string; bg: string }> = {
  common: {
    border: 'border-red-500/40',
    glow: 'hover:shadow-[0_0_25px_rgba(255,0,51,0.4)]',
    badge: 'bg-red-950/60 text-red-300 border-red-500/40',
    text: 'text-red-400',
    bg: 'bg-red-950/20',
  },
  rare: {
    border: 'border-yellow-500/50',
    glow: 'hover:shadow-[0_0_30px_rgba(250,204,21,0.5)]',
    badge: 'bg-yellow-950/60 text-yellow-300 border-yellow-500/50',
    text: 'text-yellow-400',
    bg: 'bg-yellow-950/20',
  },
  epic: {
    border: 'border-rose-500/60',
    glow: 'hover:shadow-[0_0_35px_rgba(244,63,94,0.6)]',
    badge: 'bg-rose-950/60 text-rose-300 border-rose-500/60',
    text: 'text-rose-400',
    bg: 'bg-rose-950/20',
  },
  legendary: {
    border: 'border-red-500/80',
    glow: 'hover:shadow-[0_0_40px_rgba(255,0,51,0.8)]',
    badge: 'bg-red-950/80 text-red-200 border-red-500/80',
    text: 'text-red-400',
    bg: 'bg-red-900/30',
  },
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  weapon: <Crosshair className="w-4 h-4 sm:w-5 sm:h-5" />,
  hull: <Activity className="w-4 h-4 sm:w-5 sm:h-5" />,
  shield: <Shield className="w-4 h-4 sm:w-5 sm:h-5" />,
  speed: <Wind className="w-4 h-4 sm:w-5 sm:h-5" />,
  damage: <Zap className="w-4 h-4 sm:w-5 sm:h-5" />,
  utility: <Magnet className="w-4 h-4 sm:w-5 sm:h-5" />,
};

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ options, onSelect }) => {
  const selectedRef = useRef(false);

  const handleCardClick = (option: LevelUpOption) => {
    if (selectedRef.current) return;
    selectedRef.current = true;
    SoundEffects.playPowerUp();
    onSelect(option);
  };

  // Allow selecting with keys '1', '2', '3' on desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedRef.current) return;
      if (e.key === '1' && options[0]) handleCardClick(options[0]);
      if (e.key === '2' && options[1]) handleCardClick(options[1]);
      if (e.key === '3' && options[2]) handleCardClick(options[2]);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [options]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-md p-3 sm:p-6 select-none pointer-events-auto touch-auto overflow-y-auto">
      <div className="w-full max-w-lg md:max-w-4xl flex flex-col items-center my-auto py-2 sm:py-4">
        {/* Header Title */}
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-4 h-4 sm:w-6 sm:h-6 text-red-400 animate-pulse" />
          <h2 className="text-xl sm:text-3xl md:text-4xl font-black font-['Orbitron'] tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-rose-200 to-red-500 neon-glow-red text-center">
            SYSTEM MATRIX LEVEL-UP
          </h2>
          <Zap className="w-4 h-4 sm:w-6 sm:h-6 text-red-400 animate-pulse" />
        </div>
        <p className="text-[10px] sm:text-xs md:text-sm font-mono tracking-[0.2em] text-gray-400 uppercase mb-3 sm:mb-6 text-center">
          SELECT 1 TACTICAL UPGRADE TO RESUME COMBAT
        </p>

        {/* 3 Upgrade Cards (Responsive: Compact list on mobile, 3-column grid on desktop) */}
        <div className="flex flex-col md:grid md:grid-cols-3 gap-2.5 sm:gap-4 md:gap-6 w-full max-h-[75dvh] overflow-y-auto pr-0.5">
          {options.map((option, index) => {
            const rarity = (option.rarity || 'common').toLowerCase();
            const style = RARITY_STYLES[rarity] || RARITY_STYLES.common;
            const icon = CATEGORY_ICONS[option.category] || <Zap className="w-4 h-4 sm:w-5 sm:h-5" />;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleCardClick(option)}
                className={`cyber-panel group relative p-3 sm:p-5 flex flex-col md:items-center text-left md:text-center rounded-xl border-2 transition-all duration-200 cursor-pointer bg-black/85 active:scale-[0.98] md:hover:-translate-y-1.5 ${style.border} ${style.glow}`}
              >
                {/* Header row on mobile / top badges on desktop */}
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-gray-900 border border-gray-700 flex items-center justify-center text-[10px] sm:text-xs font-mono font-bold text-red-400">
                      {index + 1}
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-mono tracking-wider text-gray-400 uppercase">
                      {option.category}
                    </span>
                  </div>

                  <span
                    className={`text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${style.badge}`}
                  >
                    {rarity}
                  </span>
                </div>

                {/* Mobile horizontal card body / Desktop vertical card body */}
                <div className="flex md:flex-col items-center md:items-center gap-3 w-full">
                  {/* Icon Orb */}
                  <div
                    className={`w-10 h-10 sm:w-14 sm:h-14 shrink-0 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-110 ${style.badge} ${style.bg}`}
                  >
                    <div className={style.text}>{icon}</div>
                  </div>

                  {/* Title & Description */}
                  <div className="flex-1 md:w-full">
                    <h3 className="text-sm sm:text-lg font-black font-['Orbitron'] tracking-wider text-white mb-0.5 sm:mb-1.5 group-hover:text-rose-300 transition-colors">
                      {option.title}
                    </h3>
                    <p className="text-xs font-sans text-gray-300 leading-snug sm:leading-relaxed">
                      {option.description}
                    </p>
                  </div>
                </div>

                {/* Select Action Button */}
                <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-2.5 border-t border-gray-800/80 w-full flex items-center justify-between md:justify-center text-rose-400 group-hover:text-white transition-colors">
                  <span className="text-[10px] sm:text-xs font-mono font-bold tracking-widest uppercase">
                    INITIALIZE UPGRADE
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
