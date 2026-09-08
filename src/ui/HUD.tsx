import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Activity,
  Trophy,
  Pause,
  Play,
  Music,
  Zap,
  Crosshair,
  Award,
  Clock,
  AlertTriangle,
  Target,
  Radio,
  Volume2,
  VolumeX,
  SkipForward,
  SkipBack,
  ChevronRight,
} from 'lucide-react';
import { PlayerStats, BossInfo, AudioTrack, PowerUpType } from '../types/game';
import { SoundEffects } from '../audio/SoundEffects';
import { MusicManager } from '../audio/MusicManager';
import { EventBus } from '../utils/EventBus';

interface HUDProps {
  stats: PlayerStats;
  bossInfo: BossInfo;
  currentTrack: AudioTrack | null;
  onPause: () => void;
  bossWarning: boolean;
}

interface PriorityAlert {
  id: string;
  priority: number; // 100: Boss, 80: Level Up, 50: Sector
  type: 'BOSS' | 'LEVEL_UP' | 'SECTOR';
  title: string;
  subtitle?: string;
  timestamp: number;
}

const POWERUP_ICONS: Record<PowerUpType, { label: string; color: string; icon: React.ReactNode }> = {
  SHIELD: { label: 'SHIELD', color: '#00f0ff', icon: <Shield className="w-3.5 h-3.5" /> },
  RAPID_FIRE: { label: 'RAPID', color: '#ff0055', icon: <Zap className="w-3.5 h-3.5" /> },
  DOUBLE_DAMAGE: { label: 'OVERCHARGE', color: '#ff0033', icon: <Zap className="w-3.5 h-3.5" /> },
  SPREAD_SHOT: { label: 'SPREAD', color: '#f43f5e', icon: <Crosshair className="w-3.5 h-3.5" /> },
  PLASMA_CANNON: { label: 'PLASMA', color: '#ff2a5f', icon: <Zap className="w-3.5 h-3.5" /> },
  HYPERBEAM: { label: 'HYPERBEAM', color: '#ff0044', icon: <Zap className="w-3.5 h-3.5" /> },
  SLOW_MO: { label: 'CHRONO', color: '#818cf8', icon: <Clock className="w-3.5 h-3.5" /> },
  NUKE: { label: 'NUKE', color: '#ef4444', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  HEALTH: { label: 'REPAIR', color: '#22c55e', icon: <Activity className="w-3.5 h-3.5" /> },
  SCORE_BOOST: { label: '2X SCORE', color: '#a855f7', icon: <Award className="w-3.5 h-3.5" /> },
  TRIPLE_SHOT: { label: 'TRIPLE', color: '#ff5500', icon: <Crosshair className="w-3.5 h-3.5" /> },
  DOUBLE_SHOT: { label: 'DOUBLE', color: '#ff0055', icon: <Crosshair className="w-3.5 h-3.5" /> },
  SLOW_MOTION: { label: 'CHRONO', color: '#818cf8', icon: <Clock className="w-3.5 h-3.5" /> },
};

export const HUD: React.FC<HUDProps> = React.memo(({
  stats,
  bossInfo,
  currentTrack,
  onPause,
  bossWarning,
}) => {
  const [isMuted, setIsMuted] = useState(MusicManager.getIsMuted());
  const [isPlaying, setIsPlaying] = useState(MusicManager.getIsPlaying());
  const [activeTrack, setActiveTrack] = useState<AudioTrack | null>(currentTrack || MusicManager.getCurrentTrack());
  
  // Priority Alert Queue
  const [currentAlert, setCurrentAlert] = useState<PriorityAlert | null>(null);
  const alertTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const postAlert = (alert: Omit<PriorityAlert, 'id' | 'timestamp'>) => {
    const newAlert: PriorityAlert = {
      ...alert,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
    };

    if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
    setCurrentAlert(newAlert);
    alertTimerRef.current = setTimeout(() => {
      setCurrentAlert(null);
    }, 2400);
  };

  useEffect(() => {
    const handleMute = (muted: boolean) => setIsMuted(muted);
    const handleState = (state: { isPlaying: boolean; isMuted: boolean; track: AudioTrack }) => {
      setIsPlaying(state.isPlaying);
      setIsMuted(state.isMuted);
      if (state.track) setActiveTrack(state.track);
    };
    const handleTrack = (track: AudioTrack) => setActiveTrack(track);

    const handleBossWarning = () => {
      postAlert({
        priority: 100,
        type: 'BOSS',
        title: 'CRITICAL EMERGENCY',
        subtitle: 'BOSS INCOMING',
      });
    };

    const handleLevelUpAlert = (data: { level: number; upgradeTitle: string }) => {
      postAlert({
        priority: 80,
        type: 'LEVEL_UP',
        title: `LEVEL ${data.level} UPGRADE APPLIED`,
        subtitle: data.upgradeTitle.toUpperCase(),
      });
    };

    const handleSectorAlert = (data: { sectorId: number; codename: string; threat?: string }) => {
      postAlert({
        priority: 50,
        type: 'SECTOR',
        title: `LEVEL 0${data.sectorId} // ${data.codename.toUpperCase()}`,
        subtitle: data.threat || 'THREAT INCREASED',
      });
    };

    EventBus.on('music:mutedChanged', handleMute);
    EventBus.on('music:stateChanged', handleState);
    EventBus.on('music:trackChanged', handleTrack);
    EventBus.on('boss:warning', handleBossWarning);
    EventBus.on('alert:levelUp', handleLevelUpAlert);
    EventBus.on('alert:sector', handleSectorAlert);

    return () => {
      EventBus.off('music:mutedChanged', handleMute);
      EventBus.off('music:stateChanged', handleState);
      EventBus.off('music:trackChanged', handleTrack);
      EventBus.off('boss:warning', handleBossWarning);
      EventBus.off('alert:levelUp', handleLevelUpAlert);
      EventBus.off('alert:sector', handleSectorAlert);
      if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
    };
  }, []);

  // Sync external bossWarning prop
  useEffect(() => {
    if (bossWarning) {
      postAlert({
        priority: 100,
        type: 'BOSS',
        title: 'CRITICAL EMERGENCY',
        subtitle: 'BOSS INCOMING',
      });
    }
  }, [bossWarning]);

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    SoundEffects.playClick();
    const newMuted = MusicManager.toggleMute();
    setIsMuted(newMuted);
  };

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    SoundEffects.playClick();
    const playing = MusicManager.togglePlayPause();
    setIsPlaying(playing);
  };

  const handleNextTrack = (e: React.MouseEvent) => {
    e.stopPropagation();
    SoundEffects.playClick();
    MusicManager.nextTrack();
  };

  const handlePrevTrack = (e: React.MouseEvent) => {
    e.stopPropagation();
    SoundEffects.playClick();
    MusicManager.prevTrack();
  };

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
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-2 sm:p-5 select-none">
      {/* Critical Low Hull Warning Banner & Red Threat Vignette */}
      {isLowHp && (
        <>
          <div className="absolute inset-0 pointer-events-none border-2 border-red-500/40 shadow-[inset_0_0_60px_rgba(239,68,68,0.45)] animate-pulse" />
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-red-950/80 border border-red-500 text-red-300 px-4 py-1 rounded-full text-xs font-mono font-bold tracking-widest flex items-center gap-2 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.6)]">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>WARNING: CRITICAL HULL INTEGRITY</span>
          </div>
        </>
      )}

      {/* Mobile Dedicated Clean Top Bar (sm:hidden) */}
      <div className="flex sm:hidden flex-col gap-1 w-full pointer-events-auto">
        <div className="flex items-center justify-between w-full">
          {/* TOP LEFT: SCORE / LEVEL */}
          <div className="flex items-center gap-1.5 bg-black/85 border border-red-500/40 px-2 py-1 rounded shadow-[0_0_12px_rgba(255,0,51,0.25)]">
            <div className="flex flex-col">
              <div className="flex items-center gap-1 text-[8px] font-mono text-red-400 font-bold uppercase">
                <span>SCORE</span>
                <span className="text-[8px] text-rose-300 font-black px-1 rounded bg-red-950/90 border border-red-500/50">
                  LVL {stats.level}
                </span>
              </div>
              <span className="text-sm font-black font-mono tracking-wider text-white neon-glow-red">
                {stats.score.toString().padStart(6, '0')}
              </span>
            </div>
          </div>

          {/* TOP CENTER: TIME */}
          <div className="flex flex-col items-center">
            {bossWarning ? (
              <div className="cyber-panel-danger px-2 py-0.5 rounded flex items-center gap-1 animate-pulse">
                <AlertTriangle className="w-3 h-3 text-red-400 animate-bounce" />
                <span className="text-[9px] font-mono font-black text-red-200 uppercase">BOSS ALERT</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-black/85 border border-red-500/40 px-2 py-1 rounded shadow-[0_0_12px_rgba(255,0,51,0.2)]">
                <Clock className="w-3 h-3 text-red-400 shrink-0" />
                <span className="text-xs font-mono font-black text-white tracking-widest">{timeFormatted}</span>
                <span className="text-[8px] font-mono font-bold text-red-400 pl-1 border-l border-red-900/60">
                  SEC {stats.wave}
                </span>
              </div>
            )}
          </div>

          {/* TOP RIGHT: MUSIC / PAUSE */}
          <div className="flex items-center gap-1.5">
            {/* Mobile Music Controller */}
            <div className="flex items-center gap-1 bg-black/85 border border-red-500/40 p-1 rounded shadow-[0_0_12px_rgba(255,0,51,0.2)]">
              <button
                onClick={handleTogglePlay}
                className="p-1 rounded bg-red-950/60 hover:bg-red-500/30 text-red-400 transition-colors"
                title={isPlaying ? 'Pause Music' : 'Play Music'}
              >
                {isPlaying && !isMuted ? (
                  <Pause className="w-3.5 h-3.5 fill-red-400 text-red-400" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-red-400 text-red-400" />
                )}
              </button>
              <button
                onClick={handleNextTrack}
                className="p-1 rounded bg-red-950/60 hover:bg-red-500/30 text-gray-300 hover:text-white transition-colors"
                title="Next Track"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleToggleMute}
                className="p-1 rounded bg-red-950/60 hover:bg-red-500/30 text-red-400 transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <VolumeX className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-red-400" />
                )}
              </button>
            </div>

            {/* Mobile Pause Button */}
            <button
              onClick={handlePauseClick}
              className="p-1.5 rounded bg-black/85 border border-red-500/40 text-red-400 hover:bg-red-500/20 active:scale-95 transition-all shadow-[0_0_12px_rgba(255,0,51,0.2)]"
              title="Pause Game"
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Second Row: Compact Vitals (HP / Shield) + Active Objective (if any) */}
        <div className="flex items-center justify-between w-full">
          {/* Mini HP & Shield Bars */}
          <div className="flex items-center gap-1.5 bg-black/80 border border-red-900/40 px-2 py-0.5 rounded w-32 shadow-[0_0_10px_rgba(255,0,51,0.15)]">
            <Activity className="w-2.5 h-2.5 text-red-500 shrink-0" />
            <div className="bar-track flex-1 h-1.5 bg-gray-950">
              <div className="bar-fill-hp h-full transition-all duration-150" style={{ width: `${hpPercent}%` }} />
            </div>
            <Shield className="w-2.5 h-2.5 text-sky-400 shrink-0 ml-1" />
            <div className="bar-track flex-1 h-1.5 bg-gray-950">
              <div className="bar-fill-shield h-full transition-all duration-150" style={{ width: `${shieldPercent}%` }} />
            </div>
          </div>

          {/* Mobile Compact Mission Tag */}
          {stats.activeMission && (
            <div className="cyber-panel-military px-2 py-0.5 flex items-center gap-1 border-red-500/30 bg-black/80">
              <span className="text-[8px] font-mono font-bold text-red-300 truncate max-w-[130px]">
                OBJ: {stats.activeMission.progress}/{stats.activeMission.target}
              </span>
              {stats.activeMission.completed && (
                <span className="text-[7px] font-mono text-emerald-400 font-black">DONE</span>
              )}
            </div>
          )}
        </div>

        {/* Mobile Boss HP Bar (if active) */}
        {bossInfo.active && (
          <div className="cyber-panel-danger px-2.5 py-1 w-full max-w-xs mx-auto flex flex-col gap-0.5 animate-pulse-glow">
            <div className="flex justify-between items-center text-[8px] font-mono font-bold">
              <span className="text-red-400 tracking-wider font-['Orbitron'] uppercase truncate">{bossInfo.name}</span>
              <span className="text-yellow-400 tracking-widest shrink-0">PHASE {bossInfo.phase}</span>
            </div>
            <div className="bar-track h-1.5">
              <div
                className="bar-fill-boss transition-all duration-100"
                style={{ width: `${Math.max(0, (bossInfo.currentHp / bossInfo.maxHp) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Mobile Kill Combo (if active) */}
        {stats.combo > 1 && (
          <div className="self-center px-2 py-0.5 rounded-full bg-black/90 border border-yellow-500/70 flex items-center gap-1 shadow-[0_0_12px_rgba(250,204,21,0.5)]">
            <Zap className="w-2.5 h-2.5 text-yellow-400 animate-pulse" />
            <span className="text-[9px] font-black font-['Orbitron'] text-yellow-300 tracking-wider">
              x{stats.comboMultiplier} ({stats.combo} KILLS)
            </span>
          </div>
        )}
      </div>

      {/* Desktop Top Header Grid (hidden sm:flex) */}
      <div className="hidden sm:flex items-start justify-between w-full">
        {/* Top Left: Score, Weapon Telemetry, Vitals & Tactical Mission */}
        <div className="flex flex-col gap-1.5 sm:gap-2 pointer-events-auto">
          {/* Score & Red Weapon Status Box */}
          <div className="cyber-panel-military px-2.5 sm:px-4 py-1 sm:py-2 flex flex-col w-36 sm:w-64 border-red-500/40">
            <div className="flex justify-between items-center">
              <span className="text-[9px] sm:text-xs font-mono tracking-widest text-red-400 font-bold uppercase flex items-center gap-1 sm:gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                <span className="hidden sm:inline">COMBAT </span>SCORE
              </span>
              <span className="hidden sm:inline-block text-[9px] font-mono tracking-wider text-rose-300 font-bold px-1.5 py-0.5 rounded bg-red-950/80 border border-red-500/50 uppercase">
                {stats.activeWeapon || 'RED CANNON'}
              </span>
            </div>
            <span className="text-base sm:text-2xl md:text-3xl font-black font-mono tracking-wider text-white neon-glow-red mt-0.5">
              {stats.score.toString().padStart(6, '0')}
            </span>
          </div>

          {/* Vitals: Hull HP, Shield, and XP Bars */}
          <div className="cyber-panel-military px-2 sm:px-3 py-1 sm:py-2.5 flex flex-col gap-1 sm:gap-2 w-36 sm:w-64 border-red-500/40">
            {/* Hull HP */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Activity className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-500 shrink-0" />
              <div className="bar-track flex-1 h-1.5 sm:h-2.5">
                <div
                  className="bar-fill-hp transition-all duration-150"
                  style={{ width: `${hpPercent}%` }}
                />
              </div>
              <span className="text-[9px] sm:text-[11px] font-mono font-bold text-gray-200 w-6 sm:w-8 text-right">
                {Math.round(stats.health)}%
              </span>
            </div>

            {/* Forcefield Shield */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-400 shrink-0" />
              <div className="bar-track flex-1 h-1.5 sm:h-2.5">
                <div
                  className="bar-fill-shield transition-all duration-150"
                  style={{ width: `${shieldPercent}%` }}
                />
              </div>
              <span className="text-[9px] sm:text-[11px] font-mono font-bold text-sky-300 w-6 sm:w-8 text-right">
                {Math.round(stats.shield)}%
              </span>
            </div>

            {/* Level & XP Bar */}
            <div className="flex items-center gap-1.5 sm:gap-2 pt-0.5 sm:pt-1 border-t border-red-900/40">
              <span className="text-[8px] sm:text-[10px] font-mono font-black text-red-400 shrink-0 uppercase">
                L{stats.level}
              </span>
              <div className="bar-track flex-1 h-1 sm:h-2 bg-gray-950">
                <div
                  className="h-full bg-gradient-to-r from-red-700 via-rose-600 to-red-400 rounded-full transition-all duration-200 shadow-[0_0_8px_rgba(255,0,51,0.6)]"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
              <span className="text-[8px] sm:text-[10px] font-mono font-bold text-red-300 w-6 sm:w-8 text-right">
                {Math.round(xpPercent)}%
              </span>
            </div>

            {/* Pilot Identity Callsign Tag */}
            <div className="flex items-center gap-1.5 pt-1 border-t border-red-900/40 text-[8px] sm:text-[10px] font-mono tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
              <span className="text-red-400 font-bold uppercase">PILOT:</span>
              <span className="text-gray-200 font-bold tracking-widest truncate">MUHAMMAD HASHMI</span>
            </div>
          </div>

          {/* Active Tactical Mission: Desktop full panel */}
          {stats.activeMission && (
            <div className="hidden sm:flex cyber-panel-military px-3.5 py-2 flex-col gap-1.5 w-64 border-red-500/30 bg-black/75">
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
            <div className="cyber-panel-danger animate-boss-alert px-3 sm:px-6 py-1.5 sm:py-2.5 rounded-lg flex flex-col items-center">
              <span className="text-[9px] sm:text-xs font-mono font-black text-red-300 tracking-[0.15em] sm:tracking-[0.25em] uppercase">
                CRITICAL EMERGENCY
              </span>
              <span className="text-sm sm:text-xl font-black font-['Orbitron'] text-white tracking-widest neon-glow-magenta animate-pulse">
                BOSS INCOMING
              </span>
            </div>
          ) : (
            <div className="cyber-panel-military px-3 sm:px-6 py-1 sm:py-2 flex flex-col items-center border-red-500/30">
              <span className="text-[8px] sm:text-xs font-mono tracking-[0.15em] sm:tracking-[0.2em] text-red-400 font-bold uppercase flex items-center gap-1 sm:gap-1.5">
                <Target className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-400" />
                <span>SECTOR</span>
              </span>
              <span className="text-xs sm:text-2xl font-black font-['Orbitron'] tracking-widest text-white neon-glow-red">
                SECTOR {stats.wave}
              </span>
            </div>
          )}

          {/* Boss Health Bar */}
          {bossInfo.active && (
            <div className="cyber-panel-danger mt-1.5 sm:mt-2 px-3 sm:px-4 py-1 sm:py-2 w-48 sm:w-80 md:w-96 flex flex-col gap-1 pointer-events-auto animate-pulse-glow">
              <div className="flex justify-between items-center text-[9px] sm:text-xs font-mono font-bold">
                <span className="text-red-400 tracking-wider font-['Orbitron'] uppercase truncate">
                  {bossInfo.name}
                </span>
                <span className="text-yellow-400 tracking-widest shrink-0">
                  PHASE {bossInfo.phase}
                </span>
              </div>
              <div className="bar-track h-2 sm:h-3.5">
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
            <div className="mt-1.5 sm:mt-2.5 px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-black/90 border border-yellow-500/70 flex items-center gap-1.5 sm:gap-2 shadow-[0_0_20px_rgba(250,204,21,0.5)] animate-bounce">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 animate-pulse" />
              <span className="text-[10px] sm:text-sm font-black font-['Orbitron'] text-yellow-300 tracking-wider">
                x{stats.comboMultiplier} ({stats.combo} KILLS)
              </span>
              <div className="w-8 sm:w-12 h-1 sm:h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 transition-all duration-75"
                  style={{ width: `${((stats.comboTimer || 0) / 2.5) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Top Right: High Score, Pause & Telemetry */}
        <div className="flex flex-col items-end gap-1.5 sm:gap-2 pointer-events-auto">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Best Score: desktop only */}
            <div className="hidden sm:flex cyber-panel-military px-3 py-1.5 items-center gap-2 border-red-500/40">
              <Trophy className="w-4 h-4 text-red-400" />
              <div className="flex flex-col text-right">
                <span className="text-[9px] sm:text-[10px] font-mono tracking-widest text-gray-400 font-bold uppercase">
                  BEST SCORE
                </span>
                <span className="text-sm sm:text-base font-bold font-mono text-white tracking-wider neon-glow-red">
                  {stats.highScore.toString().padStart(6, '0')}
                </span>
              </div>
            </div>

            {/* Quick Pause Button */}
            <button
              onClick={handlePauseClick}
              className="cyber-panel-military p-1.5 sm:p-2.5 rounded-lg border border-red-500/40 bg-black/70 hover:bg-red-500/20 text-red-400 transition-all cursor-pointer"
              title="Pause Game (ESC)"
            >
              <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Survival Time Display */}
          <div className="cyber-panel-military px-2 sm:px-3 py-0.5 sm:py-1 flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-mono text-gray-300 border-red-900/30">
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-400 shrink-0" />
            <span className="text-gray-400 font-bold hidden sm:inline">TIME:</span>
            <span className="font-bold text-white tracking-wider">{timeFormatted}</span>
          </div>

          {/* Interactive Music Widget (Mute, Prev, Next, Current Track) */}
          <div className="cyber-panel-military px-1.5 sm:px-2.5 py-1 sm:py-1.5 flex items-center gap-1 sm:gap-2 border-red-500/40 bg-black/85 pointer-events-auto shadow-[0_0_15px_rgba(255,0,51,0.25)]">
            {/* Mute / Unmute Button */}
            <button
              onClick={handleToggleMute}
              className="p-1 rounded hover:bg-red-500/20 text-red-400 hover:text-red-200 transition-colors cursor-pointer"
              title={isMuted ? 'Unmute Audio (M)' : 'Mute Audio (M)'}
            >
              {isMuted ? (
                <VolumeX className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-500 animate-pulse" />
              ) : (
                <Volume2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-400" />
              )}
            </button>

            {/* Prev Track Button */}
            <button
              onClick={handlePrevTrack}
              className="p-0.5 sm:p-1 rounded hover:bg-red-500/20 text-gray-400 hover:text-white transition-colors cursor-pointer"
              title="Previous Song"
            >
              <SkipBack className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </button>

            {/* Play / Pause Toggle Button */}
            <button
              onClick={handleTogglePlay}
              className="p-0.5 sm:p-1 rounded hover:bg-red-500/20 text-red-400 hover:text-white transition-colors cursor-pointer"
              title={isPlaying ? 'Pause Music' : 'Play Music'}
            >
              {isPlaying ? (
                <Pause className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-red-400" />
              ) : (
                <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-red-400" />
              )}
            </button>

            {/* Track Info */}
            <div className="flex items-center gap-1 max-w-[80px] sm:max-w-[170px] truncate text-[9px] sm:text-xs font-mono">
              <Music className={`w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-400 shrink-0 ${isPlaying && !isMuted ? 'animate-spin' : 'opacity-40'}`} />
              <span className={`truncate font-semibold ${isMuted ? 'text-gray-500 line-through' : 'text-red-200'}`}>
                {activeTrack ? activeTrack.title : 'AUDIO READY'}
              </span>
            </div>

            {/* Next Track Button */}
            <button
              onClick={handleNextTrack}
              className="p-0.5 sm:p-1 rounded hover:bg-red-500/20 text-gray-400 hover:text-white transition-colors cursor-pointer"
              title="Next Song (N)"
            >
              <SkipForward className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </button>
          </div>

          {/* Red Weapon Telemetry Indicator: Desktop only */}
          <div className="hidden sm:flex cyber-panel-military px-2.5 py-1 items-center gap-1.5 text-[9px] font-mono text-rose-300 border-red-500/30">
            <Radio className="w-3 h-3 text-red-400 animate-pulse" />
            <span>RED EMITTER: ONLINE</span>
          </div>
        </div>
      </div>

      {/* Center Safe-Area Priority Alert Banner (Auto-dismiss 2.4s) */}
      {currentAlert && (
        <div className="absolute top-20 sm:top-24 left-1/2 -translate-x-1/2 pointer-events-none z-30 flex flex-col items-center animate-pulse">
          <div
            className={`px-4 sm:px-8 py-2 rounded-lg border flex flex-col items-center text-center shadow-2xl backdrop-blur-xs ${
              currentAlert.type === 'BOSS'
                ? 'bg-red-950/90 border-red-500 text-red-100 shadow-[0_0_40px_rgba(255,0,51,0.7)]'
                : currentAlert.type === 'LEVEL_UP'
                ? 'bg-black/90 border-amber-500 text-amber-100 shadow-[0_0_35px_rgba(245,158,11,0.6)]'
                : 'bg-black/90 border-rose-500 text-rose-100 shadow-[0_0_30px_rgba(244,63,94,0.5)]'
            }`}
          >
            <span
              className={`text-[9px] sm:text-xs font-mono font-black tracking-[0.2em] uppercase ${
                currentAlert.type === 'BOSS'
                  ? 'text-red-400'
                  : currentAlert.type === 'LEVEL_UP'
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {currentAlert.title}
            </span>
            {currentAlert.subtitle && (
              <span className="text-sm sm:text-xl font-black font-['Orbitron'] tracking-wider text-white mt-0.5">
                {currentAlert.subtitle}
              </span>
            )}
          </div>
        </div>
      )}

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
});
