import React from 'react';
import { Shield, Heart, Trophy, Pause, Music, Zap, Flame, Crosshair, Award, Clock, AlertTriangle, Target, Radio } from 'lucide-react';
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
  RAPID_FIRE: { label: 'RAPID', color: '#ff0055', icon: <Zap className="w-3.5 h-3.5" /> },
  DOUBLE_DAMAGE: { label: 'OVERCHARGE', color: '#ff0033', icon: <Flame className="w-3.5 h-3.5" /> },
  SPREAD_SHOT: { label: 'SPREAD', color: '#f43f5e', icon: <Crosshair className="w-3.5 h-3.5" /> },
  PLASMA_CANNON: { label: 'PLASMA', color: '#ff2a5f', icon: <Zap className="w-3.5 h-3.5" /> },
  HYPERBEAM: { label: 'HYPERBEAM', color: '#ff0044', icon: <Flame className="w-3.5 h-3.5" /> },
  SLOW_MO: { label: 'CHRONO', color: '#818cf8', icon: <Clock className="w-3.5 h-3.5" /> },
  NUKE: { label: 'NUKE', color: '#ef4444', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  HEALTH: { label: 'REPAIR', color: '#22c55e', icon: <Heart className="w-3.5 h-3.5" /> },
  SCORE_BOOST: { label: '2X SCORE', color: '#a855f7', icon: <Award className="w-3.5 h-3.5" /> },
  TRIPLE_SHOT: { label: 'TRIPLE', color: '#ff5500', icon: <Crosshair className="w-3.5 h-3.5" /> },
  DOUBLE_SHOT: { label: 'DOUBLE', color: '#ff0055', icon: <Flame className="w-3.5 h-3.5" /> },
  SLOW_MOTION: { label: 'CHRONO', color: '#818cf8', icon: <Clock className="w-3.5 h-3.5" /> },
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
  const xpPercent = stats.nextLevelXp > 0 ? Math.max(0, Math.min(100, (stats.xp / stats.nextLevelXp) * 100)) : 0;
  const isLowHp = stats.health <= 25 && stats.health > 0;

  // Format survival time MM:SS
  const totalSecs = Math.floor(stats.survivalTime || 0);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  const handlePauseClick = () => {
    SoundEffects.playClick();
    onPause();
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-3 sm:p-5 select-none">
      {/* Critical Low Hull Warning Banner */}
      {isLowHp && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-red-950/80 border border-red-500 text-red-300 px-4 py-1 rounded-full text-xs font-mono font-bold tracking-widest flex items-center gap-2 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.6)]">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span>WARNING: CRITICAL HULL INTEGRITY</span>
        </div>
      )}

      {/* Top Header Grid */}
      <div className="flex items-start justify-between w-full">
        {/* Top Left: Score, Weapon Telemetry, Vitals & Tactical Mission */}
        <div className="flex flex-col gap-2 pointer-events-auto">
          {/* Score & Red Weapon Status Box */}
          <div className="cyber-panel-military px-4 py-2 flex flex-col w-52 sm:w-64 border-red-500/40">
            <div className="flex justify-between items-center">
              <span className="text-[10px] sm:text-xs font-mono tracking-widest text-red-400 font-bold uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                COMBAT SCORE
              </span>
              <span className="text-[9px] font-mono tracking-wider text-rose-300 font-bold px-1.5 py-0.5 rounded bg-red-950/80 border border-red-500/50 uppercase">
                {stats.activeWeapon || 'RED CANNON'}
              </span>
            </div>
            <span className="text-xl sm:text-2xl md:text-3xl font-black font-mono tracking-wider text-white neon-glow-red mt-0.5">
              {stats.score.toString().padStart(6, '0')}
            </span>
          </div>

          {/* Vitals: Hull HP, Shield, and XP Bars */}
          <div className="cyber-panel-military px-3 py-2.5 flex flex-col gap-2 w-52 sm:w-64 border-cyan-500/30">
            {/* Hull HP */}
            <div className="flex items-center gap-2">
              <Heart className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <div className="bar-track flex-1 h-2.5 sm:h-3">
                <div
                  className="bar-fill-hp transition-all duration-150"
                  style={{ width: `${hpPercent}%` }}
                />
              </div>
              <span className="text-[11px] font-mono font-bold text-gray-300 w-8 text-right">
                {Math.round(stats.health)}%
              </span>
            </div>

            {/* Forcefield Shield */}
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <div className="bar-track flex-1 h-2.5 sm:h-3">
                <div
                  className="bar-fill-shield transition-all duration-150"
                  style={{ width: `${shieldPercent}%` }}
                />
              </div>
              <span className="text-[11px] font-mono font-bold text-cyan-300 w-8 text-right">
                {Math.round(stats.shield)}%
              </span>
            </div>

            {/* Level & XP Bar */}
            <div className="flex items-center gap-2 pt-1 border-t border-gray-800/80">
              <span className="text-[10px] font-mono font-black text-purple-400 shrink-0 uppercase">
                LVL {stats.level}
              </span>
              <div className="bar-track flex-1 h-2 bg-gray-900">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-pink-500 rounded-full transition-all duration-200"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
              <span className="text-[10px] font-mono font-bold text-purple-300 w-8 text-right">
                {Math.round(xpPercent)}%
              </span>
            </div>
          </div>

          {/* Active Tactical Mission Panel */}
          {stats.activeMission && (
            <div className="cyber-panel-military px-3.5 py-2 flex flex-col gap-1.5 w-52 sm:w-64 border-red-500/30 bg-black/75">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-red-400">
                  <Crosshair className="w-3.5 h-3.5 animate-pulse" />
                  <span className="text-[10px] font-mono tracking-wider font-black uppercase text-red-300">
                    MISSION OBJECTIVE
                  </span>
                </div>
                {stats.activeMission.completed ? (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500 text-emerald-300 font-bold">
                    COMPLETED
                  </span>
                ) : (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-950/60 border border-red-500/40 text-red-300 font-bold">
                    IN PROGRESS
                  </span>
                )}
              </div>

              <div className="text-xs font-mono font-bold text-white tracking-wide truncate">
                {stats.activeMission.title}
              </div>

              {/* Tactical Mission Progress Bar */}
              <div className="flex items-center gap-2">
                <div className="bar-track flex-1 h-2 bg-gray-950/90 border border-red-900/40">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-400 rounded-full transition-all duration-200 shadow-[0_0_8px_rgba(255,0,51,0.7)]"
                    style={{
                      width: `${Math.min(100, Math.max(0, (stats.activeMission.progress / stats.activeMission.target) * 100))}%`,
                    }}
                  />
                </div>
                <span className="text-[10px] font-mono font-bold text-red-200 shrink-0">
                  {stats.activeMission.progress}/{stats.activeMission.target}
                </span>
              </div>

              <div className="text-[9px] font-mono text-gray-400 flex items-center justify-between">
                <span className="truncate mr-1">{stats.activeMission.description}</span>
                <span className="text-yellow-400 font-bold shrink-0">{stats.activeMission.rewardText}</span>
              </div>
            </div>
          )}
        </div>

        {/* Top Center: Sector / Boss Warning / Boss HP Bar / Kill Combo Meter */}
        <div className="flex flex-col items-center pointer-events-auto">
          {bossWarning ? (
            <div className="cyber-panel-danger animate-boss-alert px-6 py-2.5 rounded-lg flex flex-col items-center">
              <span className="text-xs font-mono font-black text-red-300 tracking-[0.25em] uppercase">
                CRITICAL EMERGENCY
              </span>
              <span className="text-lg sm:text-xl font-black font-['Orbitron'] text-white tracking-widest neon-glow-magenta animate-pulse">
                BOSS INCOMING
              </span>
            </div>
          ) : (
            <div className="cyber-panel-military px-6 py-2 flex flex-col items-center border-red-500/30">
              <span className="text-[10px] sm:text-xs font-mono tracking-[0.2em] text-red-400 font-bold uppercase flex items-center gap-1.5">
                <Target className="w-3 h-3 text-red-400" />
                COMBAT SECTOR
              </span>
              <span className="text-lg sm:text-2xl font-black font-['Orbitron'] tracking-widest text-white neon-glow-red">
                SECTOR {stats.wave}
              </span>
            </div>
          )}

          {/* Boss Health Bar */}
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
                  className="bar-fill-boss transition-all duration-100"
                  style={{
                    width: `${Math.max(0, (bossInfo.currentHp / bossInfo.maxHp) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Kill Combo Multiplier Meter */}
          {stats.combo > 1 && (
            <div className="mt-2.5 px-4 py-1.5 rounded-full bg-black/90 border border-yellow-500/70 flex items-center gap-2 shadow-[0_0_20px_rgba(250,204,21,0.5)] animate-bounce">
              <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
              <span className="text-xs sm:text-sm font-black font-['Orbitron'] text-yellow-300 tracking-wider">
                COMBO x{stats.comboMultiplier} ({stats.combo} KILLS)
              </span>
              <div className="w-12 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 transition-all duration-75"
                  style={{ width: `${((stats.comboTimer || 0) / 2.5) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Top Right: High Score, Pause & Telemetry */}
        <div className="flex flex-col items-end gap-2 pointer-events-auto">
          <div className="flex items-center gap-2">
            <div className="cyber-panel-military px-3 py-1.5 flex items-center gap-2 border-yellow-500/40">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <div className="flex flex-col text-right">
                <span className="text-[9px] sm:text-[10px] font-mono tracking-widest text-gray-400 font-bold uppercase">
                  TOP RECORD
                </span>
                <span className="text-sm sm:text-base font-bold font-mono text-yellow-400 tracking-wider">
                  {stats.highScore.toString().padStart(6, '0')}
                </span>
              </div>
            </div>

            {/* Quick Pause Button */}
            <button
              onClick={handlePauseClick}
              className="cyber-panel-military p-2.5 rounded-lg border border-red-500/40 bg-black/70 hover:bg-red-500/20 text-red-400 transition-all"
              title="Pause Game (ESC)"
            >
              <Pause className="w-5 h-5" />
            </button>
          </div>

          {/* Survival Time Display */}
          <div className="cyber-panel-military px-3 py-1 flex items-center gap-2 text-xs font-mono text-gray-300 border-gray-700">
            <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="text-gray-400 font-bold">TIME:</span>
            <span className="font-bold text-white tracking-wider">{timeFormatted}</span>
          </div>

          {/* Now Playing Music Indicator */}
          {currentTrack && (
            <div className="cyber-panel-military px-3 py-1 flex items-center gap-2 text-[10px] sm:text-xs font-mono text-cyan-300 max-w-[200px] sm:max-w-xs truncate border-cyan-500/30">
              <Music className="w-3 h-3 text-cyan-400 animate-spin shrink-0" />
              <div className="truncate">
                <span className="text-gray-400 mr-1 font-bold">♫</span>
                <span className="font-semibold">{currentTrack.title}</span>
              </div>
            </div>
          )}

          {/* Red Weapon Telemetry Indicator */}
          <div className="cyber-panel-military px-2.5 py-1 flex items-center gap-1.5 text-[9px] font-mono text-rose-300 border-red-500/30">
            <Radio className="w-3 h-3 text-red-400 animate-pulse" />
            <span>RED EMITTER: ONLINE</span>
          </div>
        </div>
      </div>

      {/* Bottom Center: Active Power-Ups Row */}
      {stats.activePowerUps.length > 0 && (
        <div className="flex items-center justify-center gap-2 sm:gap-3 w-full mb-12 sm:mb-4 pointer-events-none flex-wrap">
          {stats.activePowerUps.map((p) => {
            const conf = POWERUP_ICONS[p.type] || {
              label: p.type,
              color: '#ff0055',
              icon: <Zap className="w-3.5 h-3.5" />,
            };
            const pct = Math.max(0, (p.duration / p.maxDuration) * 100);

            return (
              <div
                key={p.type}
                className="cyber-panel-military px-3 py-1.5 flex items-center gap-2 bg-black/85 border"
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
