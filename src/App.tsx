import React, { useEffect, useRef, useState, useCallback } from 'react';
import Phaser from 'phaser';
import { createGameConfig } from './game/config';
import { GameState, PlayerStats, BossInfo, AudioTrack, LevelUpOption } from './types/game';
import { Storage } from './utils/storage';
import { EventBus } from './utils/EventBus';
import { MusicManager } from './audio/MusicManager';
import { SoundEffects } from './audio/SoundEffects';
import { MainMenu } from './ui/MainMenu';
import { HUD } from './ui/HUD';
import { PauseModal } from './ui/PauseModal';
import { GameOverModal } from './ui/GameOverModal';
import { HowToPlayModal } from './ui/HowToPlayModal';
import { MobileControls } from './ui/MobileControls';
import { LevelUpModal } from './ui/LevelUpModal';
import { IntroOverlay } from './ui/IntroOverlay';

export const App: React.FC = () => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<Phaser.Game | null>(null);
  const [gameState, setGameState] = useState<GameState>('MAIN_MENU');
  const gameStateRef = useRef<GameState>(gameState);
  gameStateRef.current = gameState;
  const [highScore, setHighScore] = useState<number>(() => Storage.getHighScore());
  const [musicEnabled, setMusicEnabled] = useState<boolean>(() => Storage.getMusicEnabled());
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => Storage.getSoundEnabled());
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(() => MusicManager.getCurrentTrack());
  const [bossWarning, setBossWarning] = useState<boolean>(false);
  const [isNewHighScore, setIsNewHighScore] = useState<boolean>(false);
  const [levelUpOptions, setLevelUpOptions] = useState<LevelUpOption[] | null>(null);
  const [gameOverData, setGameOverData] = useState<{
    score: number;
    highScore: number;
    level: number;
    wave: number;
    bestCombo: number;
    survivalTime: number;
  }>({
    score: 0,
    highScore: Storage.getHighScore(),
    level: 1,
    wave: 1,
    bestCombo: 0,
    survivalTime: 0,
  });

  const getInitialStats = (): PlayerStats => ({
    score: 0,
    highScore: Storage.getHighScore(),
    health: 100,
    maxHealth: 100,
    shield: 100,
    maxShield: 100,
    wave: 1,
    level: 1,
    xp: 0,
    nextLevelXp: 100,
    combo: 0,
    comboMultiplier: 1,
    comboTimer: 0,
    survivalTime: 0,
    activeWeapon: 'BLASTER',
    lives: 3,
    activePowerUps: [],
  });

  const [stats, setStats] = useState<PlayerStats>(getInitialStats);

  const [bossInfo, setBossInfo] = useState<BossInfo>({
    active: false,
    name: '',
    currentHp: 0,
    maxHp: 0,
    phase: 1,
  });

  // Initialize Phaser once
  useEffect(() => {
    if (!gameContainerRef.current || gameInstanceRef.current) return;

    const config = createGameConfig(gameContainerRef.current);
    const game = new Phaser.Game(config);
    gameInstanceRef.current = game;

    // Listen for GameScene ready
    EventBus.on('game:ready', () => {
      // In main menu state, sleep GameScene initially so only BackgroundScene runs
      game.scene.sleep('GameScene');
    });

    // Listen for stats updates from GameScene (dirty-checked, zero unnecessary re-renders)
    EventBus.on('stats:update', (newStats: Partial<PlayerStats>) => {
      setStats((prev) => {
        let changed = false;
        for (const k in newStats) {
          const key = k as keyof PlayerStats;
          if (newStats[key] !== prev[key]) {
            changed = true;
            break;
          }
        }
        if (!changed) return prev;

        const updated = { ...prev, ...newStats };
        if (updated.score > updated.highScore) {
          updated.highScore = updated.score;
          setHighScore(updated.score);
        }
        return updated;
      });
    });

    // Listen for Boss events
    EventBus.on('boss:warning', () => {
      setBossWarning(true);
      setTimeout(() => setBossWarning(false), 2400);
    });

    EventBus.on('boss:update', (info: BossInfo) => {
      setBossInfo(info);
    });

    // Listen for Level Up options
    EventBus.on('game:levelUp', (options: LevelUpOption[]) => {
      setLevelUpOptions(options);
    });

    // Listen for Game Over - persist high score here once
    EventBus.on('game:over', ({ score, level, wave, bestCombo, survivalTime }: { score: number; level?: number; wave?: number; bestCombo?: number; survivalTime?: number }) => {
      const savedHigh = Storage.getHighScore();
      const finalHigh = Math.max(score, savedHigh);
      const isNew = score > savedHigh;
      if (isNew) {
        Storage.setHighScore(score);
        setHighScore(score);
      }
      setIsNewHighScore(isNew);
      setGameOverData({
        score: score ?? 0,
        highScore: finalHigh,
        level: level ?? 1,
        wave: wave ?? 1,
        bestCombo: bestCombo ?? 0,
        survivalTime: survivalTime ?? 0,
      });
      setGameState('GAME_OVER');
      setLevelUpOptions(null);
      MusicManager.stop();
    });

    // Listen for Toggle Pause via ESC key
    EventBus.on('game:togglePause', () => {
      if (gameStateRef.current === 'PLAYING') {
        handlePause();
      } else if (gameStateRef.current === 'PAUSED') {
        handleResume();
      }
    });

    // Track changes
    EventBus.on('music:trackChanged', (track: AudioTrack) => {
      setCurrentTrack(track);
    });

    return () => {
      EventBus.removeAllListeners();
      game.destroy(true);
      gameInstanceRef.current = null;
    };
  }, []);

  // Prevent default browser scrolling when playing with Space or Arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        const target = e.target as HTMLElement;
        if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return;
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Pause automatically when tab is hidden to prevent frame-time runaway and audio desync
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (gameStateRef.current === 'PLAYING') {
          handlePause();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Handlers
  const handleStartGame = useCallback(() => {
    SoundEffects.unlock();
    MusicManager.unlock();
    setStats(getInitialStats());
    const game = gameInstanceRef.current;
    if (game) {
      game.scene.wake('GameScene');
      game.scene.resume('BackgroundScene');
      const gameScene = game.scene.getScene('GameScene') as any;
      if (gameScene && typeof gameScene.prepareForIntro === 'function') {
        gameScene.prepareForIntro();
      } else {
        game.scene.start('GameScene', { isRestart: false });
      }
    }
    setGameState('INTRO');
    setIsNewHighScore(false);
    setLevelUpOptions(null);
    setBossInfo({ active: false, name: '', currentHp: 0, maxHp: 0, phase: 1 });

    if (musicEnabled) {
      MusicManager.startPlaylist(0);
    }
  }, [musicEnabled]);

  const handleIntroComplete = useCallback(() => {
    setGameState('PLAYING');
    EventBus.emit('intro:complete');
  }, []);

  const handlePause = useCallback(() => {
    const game = gameInstanceRef.current;
    if (game) {
      game.scene.pause('GameScene');
      game.scene.pause('BackgroundScene');
    }
    setGameState('PAUSED');
    MusicManager.pause();
  }, []);

  const handleResume = useCallback(() => {
    const game = gameInstanceRef.current;
    if (game) {
      game.scene.resume('GameScene');
      game.scene.resume('BackgroundScene');
    }
    setGameState('PLAYING');
    if (musicEnabled) {
      MusicManager.ensurePlaying();
    }
  }, [musicEnabled]);

  const handleRestart = useCallback(() => {
    SoundEffects.unlock();
    MusicManager.unlock();
    // Reset all React state to pristine game start values immediately
    setStats(getInitialStats());
    setIsNewHighScore(false);
    setLevelUpOptions(null);
    setBossWarning(false);
    setBossInfo({ active: false, name: '', currentHp: 0, maxHp: 0, phase: 1 });

    const game = gameInstanceRef.current;
    if (game) {
      game.scene.resume('GameScene');
      game.scene.resume('BackgroundScene');
      const gameScene = game.scene.getScene('GameScene') as any;
      if (gameScene && typeof gameScene.restartGame === 'function') {
        gameScene.restartGame();
      } else {
        game.scene.stop('GameScene');
        game.scene.start('GameScene', { isRestart: true });
      }
    }
    // Directly enter PLAYING mode for immediate action
    setGameState('PLAYING');

    if (musicEnabled) {
      MusicManager.startPlaylist(0);
    }
  }, [musicEnabled]);

  const handleMainMenu = useCallback(() => {
    setStats(getInitialStats());
    const game = gameInstanceRef.current;
    if (game) {
      const gameScene = game.scene.getScene('GameScene') as any;
      if (gameScene && typeof gameScene.cleanupSceneState === 'function') {
        gameScene.cleanupSceneState();
      }
      game.scene.sleep('GameScene');
      game.scene.resume('BackgroundScene');
    }
    setGameState('MAIN_MENU');
    setLevelUpOptions(null);
    setBossWarning(false);
    setBossInfo({ active: false, name: '', currentHp: 0, maxHp: 0, phase: 1 });
    MusicManager.stop();
  }, []);

  const handleToggleMusic = useCallback(() => {
    setMusicEnabled((prev) => {
      const nextVal = !prev;
      MusicManager.setMuted(!nextVal);
      if (nextVal && gameStateRef.current === 'PLAYING') {
        MusicManager.ensurePlaying();
      }
      return nextVal;
    });
  }, []);

  const handleToggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const nextVal = !prev;
      SoundEffects.setEnabled(nextVal);
      return nextVal;
    });
  }, []);

  const handleSelectUpgrade = useCallback((option: LevelUpOption) => {
    setLevelUpOptions(null);
    EventBus.emit('upgrade:selected', option);
  }, []);

  return (
    <div className="fixed inset-0 w-full h-[100dvh] overflow-hidden bg-black flex items-center justify-center select-none font-['Rajdhani'] touch-none">
      {/* Sci-Fi Scanline Overlay */}
      <div className="scanlines" />

      {/* Phaser Canvas Container */}
      <div
        ref={gameContainerRef}
        className="w-full h-full absolute inset-0 flex items-center justify-center overflow-hidden z-0"
      />

      {/* UI States */}
      {gameState === 'MAIN_MENU' && (
        <MainMenu
          onStartGame={handleStartGame}
          onOpenHowToPlay={() => setShowHowToPlay(true)}
          highScore={highScore}
          musicEnabled={musicEnabled}
          soundEnabled={soundEnabled}
          onToggleMusic={handleToggleMusic}
          onToggleSound={handleToggleSound}
        />
      )}

      {gameState === 'INTRO' && (
        <IntroOverlay onComplete={handleIntroComplete} />
      )}

      {gameState === 'PLAYING' && (
        <>
          <HUD
            stats={stats}
            bossInfo={bossInfo}
            currentTrack={currentTrack}
            onPause={handlePause}
            bossWarning={bossWarning}
          />
          <MobileControls />

          {/* Level Up Selection Modal */}
          {levelUpOptions && (
            <LevelUpModal
              options={levelUpOptions}
              onSelect={handleSelectUpgrade}
            />
          )}
        </>
      )}

      {gameState === 'PAUSED' && (
        <PauseModal
          onResume={handleResume}
          onRestart={handleRestart}
          onMainMenu={handleMainMenu}
          musicEnabled={musicEnabled}
          soundEnabled={soundEnabled}
          onToggleMusic={handleToggleMusic}
          onToggleSound={handleToggleSound}
          currentTrack={currentTrack}
        />
      )}

      {gameState === 'GAME_OVER' && (
        <GameOverModal
          score={gameOverData.score}
          highScore={gameOverData.highScore}
          level={gameOverData.level}
          wave={gameOverData.wave}
          bestCombo={gameOverData.bestCombo}
          survivalTime={gameOverData.survivalTime}
          isNewHighScore={isNewHighScore}
          onRestart={handleRestart}
          onMainMenu={handleMainMenu}
        />
      )}

      {/* How To Play Modal */}
      {showHowToPlay && (
        <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
      )}
    </div>
  );
};

export default App;
