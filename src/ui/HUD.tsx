import React from 'react';
import { Shield, Heart, Trophy, Pause, Music, Zap, Flame, Crosshair, Award } from 'lucide-react';
import { PlayerStats, BossInfo, AudioTrack, PowerUpType } from '../types/game';
import { SoundEffects } from '../audio/SoundEffects';

interface HUDProps {
  stats: PlayerStats;
  bossInfo: BossInfo;
  currentTrack: AudioTrack | null;
  onPause: () => void;
  bossWarning: boolean;
}

const POWERUP_ICONS: Record<PowerUpType, { label: string; color: string; icon: React.ReactNode }> = {
  SHIELD: { label: 'SHIELD', color: '#00f0ff', icon: <Shield className="w-3.5 h-3.5" /> },
  RAPID_FIRE: { label: 'RAPID', color: '#facc15', icon: <Zap className="w-3.5 h-3.5" /> },
  DOUBLE_DAMAGE: { label: 'OVERCHARGE', color: '#ec4899', icon: <Flame className="w-3.5 h-3.5" /> },
  TRIPLE_SHOT: { label: 'TRIPLE', color: '#fb923c', icon: <Crosshair className="w-3.5 h-3.5" /> },
  HEALTH: { label: 'REPAIR', color: '#22c55e', icon: <Heart className="w-3.5 h-3.5" /> },
  SCORE_BOOST: { label: '2X SCORE', color: '#a855f7', icon: <Award className="w-3.5 h-3.5" /> },
};

export const HUD: React.FC<HUDProps> = ({
  stats,
  bossInfo,
  currentTrack,
  onPause,
  bossWarning,
}) => {
  const hpPercent = Math.max(0, Math.min(100, (stats.health / stats.maxHealth) * 100));
  const shieldPercent = Math.max(0, Math.min(100, (stats.shield / stats.maxShield) * 100));

  const handlePauseClick = () => {
    SoundEffects.playClick();
    onPause();
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-3 sm:p-5 select-none">
      {/* Top Header Grid */}
      <div className="flex items-start justify-between w-full">
        {/* Top Left: Score & Hull / Shield Stats */}
        <div className="flex flex-col gap-2 pointer-events-auto">
          {/* Score Box */}
          <div className="cyber-panel px-4 py-2 flex flex-col">
            <span className="text-[10px] sm:text-xs font-mono tracking-widest text-cyan-400 font-bold uppercase">
              SCORE
            </span>
            <span className="text-xl sm:text-2xl md:text-3xl font-black font-mono tracking-wider text-white neon-glow-cyan">
              {stats.score.toString().padStart(6, '0')}
            </span>
          </div>

          {/* Vitals: HP & Shield Bars */}
          <div className="cyber-panel px-3 py-2 flex flex-col gap-1.5 w-44 sm:w-56">
            {/* Hull HP */}
            <div className="flex items-center gap-2">
              <Heart className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <div className="bar-track flex-1 h-2.5 sm:h-3">
                <div
                  className="bar-fill-hp"
                  style={{ width: `${hpPercent}%` }}
                />
              </div>
              <span className="text-[11px] font-mono font-bold text-gray-300 w-7 text-right">
                {Math.round(stats.health)}%
              </span>
            </div>

            {/* Forcefield Shield */}
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <div className="bar-track flex-1 h-2.5 sm:h-3">
                <div
                  className="bar-fill-shield"
                  style={{ width: `${shieldPercent}%` }}
                />
              </div>
              <span className="text-[11px] font-mono font-bold text-cyan-300 w-7 text-right">
                {Math.round(stats.shield)}%
              </span>
            </div>
          </div>
        </div>

        {/* Top Center: Wave Badge / Boss Warning */}
        <div className="flex flex-col items-center pointer-events-auto">
          {bossWarning ? (
            <div className="cyber-panel-danger animate-boss-alert px-5 py-2 rounded-lg flex flex-col items-center">
              <span className="text-xs font-mono font-black text-red-300 tracking-[0.25em] uppercase">
                CRITICAL EMERGENCY
              </span>
              <span className="text-lg sm:text-xl font-black font-['Orbitron'] text-white tracking-widest neon-glow-magenta animate-pulse">
                BOSS INCOMING
              </span>
            </div>
          ) : (
            <div className="cyber-panel px-5 py-2 flex flex-col items-center">
              <span className="text-[10px] sm:text-xs font-mono tracking-[0.2em] text-cyan-400 font-bold uppercase">
                SECTOR
              </span>
              <span className="text-lg sm:text-2xl font-black font-['Orbitron'] tracking-widest text-cyan-200">
                WAVE {stats.wave}
              </span>
            </div>
          )}

          {/* Boss Health Bar (if active) */}
          {bossInfo.active && (
            <div className="cyber-panel-danger mt-2 px-4 py-2 w-64 sm:w-80 md:w-96 flex flex-col gap-1 pointer-events-auto animate-pulse-glow">
              <div className="flex justify-between items-center text-xs font-mono font-bold">
                <span className="text-red-400 tracking-wider font-['Orbitron'] uppercase">
                  {bossInfo.name}
                </span>
                <span className="text-yellow-400 tracking-widest">
                  PHASE {bossInfo.phase}
                </span>
              </div>
              <div className="bar-track h-3 sm:h-3.5">
                <div
                  className="bar-fill-boss"
                  style={{
                    width: `${Math.max(0, (bossInfo.currentHp / bossInfo.maxHp) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Top Right: High Score & Pause Button */}
        <div className="flex flex-col items-end gap-2 pointer-events-auto">
          <div className="flex items-center gap-2">
            <div className="cyber-panel px-3 py-1.5 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <div className="flex flex-col text-right">
                <span className="text-[9px] sm:text-[10px] font-mono tracking-widest text-gray-400 font-bold uppercase">
                  HIGH
                </span>
                <span className="text-sm sm:text-base font-bold font-mono text-yellow-400 tracking-wider">
                  {stats.highScore.toString().padStart(6, '0')}
                </span>
              </div>
            </div>

            {/* Quick Pause Button */}
            <button
              onClick={handlePauseClick}
              className="cyber-btn p-2.5 rounded-lg border border-cyan-500/40 bg-black/60 hover:bg-cyan-500/20 text-cyan-400"
              title="Pause Game (ESC)"
            >
              <Pause className="w-5 h-5" />
            </button>
          </div>

          {/* Now Playing Music Indicator */}
          {currentTrack && (
            <div className="cyber-panel px-3 py-1 flex items-center gap-2 text-[10px] sm:text-xs font-mono text-cyan-300 max-w-[200px] sm:max-w-xs truncate">
              <Music className="w-3 h-3 text-cyan-400 animate-spin shrink-0" />
              <div className="truncate">
                <span className="text-gray-400 mr-1 font-bold">♫</span>
                <span className="font-semibold">{currentTrack.title}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Center: Active Power-Ups Row */}
      {stats.activePowerUps.length > 0 && (
        <div className="flex items-center justify-center gap-2 sm:gap-3 w-full mb-12 sm:mb-4 pointer-events-none">
          {stats.activePowerUps.map((p) => {
            const conf = POWERUP_ICONS[p.type] || {
              label: p.type,
              color: '#00f0ff',
              icon: <Zap className="w-3.5 h-3.5" />,
            };
            const pct = Math.max(0, (p.duration / p.maxDuration) * 100);

            return (
              <div
                key={p.type}
                className="cyber-panel px-3 py-1.5 flex items-center gap-2 bg-black/80 border"
                style={{ borderColor: conf.color }}
              >
                <div style={{ color: conf.color }}>{conf.icon}</div>
                <div className="flex flex-col">
                  <span
                    className="text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider"
                    style={{ color: conf.color }}
                  >
                    {conf.label}
                  </span>
                  <div className="w-12 sm:w-16 h-1 bg-gray-800 rounded-full overflow-hidden mt-0.5">
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: conf.color,
                      }}
                    />
                  </div>
                </div>
                <span className="text-[10px] font-mono text-gray-300 font-bold ml-1">
                  {Math.ceil(p.duration)}s
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
