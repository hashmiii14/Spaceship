import React, { useEffect } from 'react';
import { Zap, Shield, Heart, Crosshair, Sparkles, Wind, Magnet } from 'lucide-react';
import { LevelUpOption } from '../types/game';
import { SoundEffects } from '../audio/SoundEffects';

interface LevelUpModalProps {
  options: LevelUpOption[];
  onSelect: (option: LevelUpOption) => void;
}

const RARITY_STYLES: Record<string, { border: string; glow: string; badge: string; text: string }> = {
  common: {
    border: 'border-red-500/40',
    glow: 'hover:shadow-[0_0_25px_rgba(255,0,51,0.4)]',
    badge: 'bg-red-950/60 text-red-300 border-red-500/40',
    text: 'text-red-400',
  },
  rare: {
    border: 'border-yellow-500/50',
    glow: 'hover:shadow-[0_0_30px_rgba(250,204,21,0.5)]',
    badge: 'bg-yellow-950/60 text-yellow-300 border-yellow-500/50',
    text: 'text-yellow-400',
  },
  epic: {
    border: 'border-rose-500/60',
    glow: 'hover:shadow-[0_0_35px_rgba(244,63,94,0.6)]',
    badge: 'bg-rose-950/60 text-rose-300 border-rose-500/60',
    text: 'text-rose-400',
  },
  legendary: {
    border: 'border-red-500/80',
    glow: 'hover:shadow-[0_0_40px_rgba(255,0,51,0.8)]',
    badge: 'bg-red-950/80 text-red-200 border-red-500/80',
    text: 'text-red-400',
  },
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  weapon: <Crosshair className="w-5 h-5" />,
  hull: <Heart className="w-5 h-5" />,
  shield: <Shield className="w-5 h-5" />,
  speed: <Wind className="w-5 h-5" />,
  damage: <Zap className="w-5 h-5" />,
  utility: <Magnet className="w-5 h-5" />,
};

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ options, onSelect }) => {
  // Allow selecting with keys '1', '2', '3'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '1' && options[0]) onSelect(options[0]);
      if (e.key === '2' && options[1]) onSelect(options[1]);
      if (e.key === '3' && options[2]) onSelect(options[2]);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [options]);

  const handleCardClick = (option: LevelUpOption) => {
    SoundEffects.playPowerUp();
    onSelect(option);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 p-3 sm:p-4 select-none pointer-events-auto overflow-y-auto">
      <div className="w-full max-w-4xl flex flex-col items-center my-auto py-4">
        {/* Header Title */}
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-red-400 animate-spin" />
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black font-['Orbitron'] tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-rose-200 to-red-500 neon-glow-red">
            LEVEL UPGRADE
          </h2>
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-red-400 animate-spin" />
        </div>
        <p className="text-[10px] sm:text-xs md:text-sm font-mono tracking-[0.25em] text-gray-400 uppercase mb-4 sm:mb-8 text-center">
          SELECT 1 SYSTEM MATRIX ENHANCEMENT (PRESS 1, 2, OR 3)
        </p>

        {/* 3 Upgrade Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6 w-full max-h-[75vh] md:max-h-none overflow-y-auto md:overflow-visible pr-1 md:pr-0">
          {options.map((option, index) => {
            const rarity = option.rarity || 'common';
            const style = RARITY_STYLES[rarity] || RARITY_STYLES.common;
            const icon = CATEGORY_ICONS[option.category] || <Zap className="w-5 h-5" />;

            return (
              <button
                key={option.id}
                onClick={() => handleCardClick(option)}
                className={`cyber-panel group relative p-4 sm:p-6 flex flex-col items-center text-center rounded-xl border-2 transition-all duration-300 transform hover:-translate-y-2 cursor-pointer bg-black/85 ${style.border} ${style.glow}`}
              >
                {/* Hotkey Badge */}
                <div className="absolute top-3 left-3 w-6 h-6 rounded-md bg-gray-900 border border-gray-700 flex items-center justify-center text-xs font-mono font-bold text-red-400">
                  {index + 1}
                </div>

                {/* Rarity Badge */}
                <div className="absolute top-3 right-3">
                  <span
                    className={`text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${style.badge}`}
                  >
                    {rarity}
                  </span>
                </div>

                {/* Icon Orb */}
                <div
                  className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mt-3 sm:mt-4 mb-3 sm:mb-4 border transition-transform group-hover:scale-110 ${style.badge}`}
                >
                  <div className={style.text}>{icon}</div>
                </div>

                {/* Title */}
                <h3 className="text-base sm:text-xl font-black font-['Orbitron'] tracking-wider text-white mb-1.5 sm:mb-2 group-hover:text-rose-300 transition-colors">
                  {option.title}
                </h3>

                {/* Category Pill */}
                <span className="text-[9px] sm:text-[10px] font-mono tracking-widest text-gray-400 uppercase mb-2 sm:mb-3">
                  CATEGORY: {option.category}
                </span>

                {/* Description */}
                <p className="text-xs sm:text-sm font-sans text-gray-300 leading-relaxed">
                  {option.description}
                </p>

                {/* Select Prompt */}
                <div className="mt-4 sm:mt-6 pt-2.5 sm:pt-3 border-t border-gray-800 w-full flex items-center justify-center">
                  <span className="text-xs font-mono font-bold tracking-widest text-rose-400 group-hover:text-rose-200 uppercase">
                    INITIALIZE UPGRADE &gt;&gt;
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
