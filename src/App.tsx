import React, { useEffect, useRef, useState } from 'react';
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

export const App: React.FC = () => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<Phaser.Game | null>(null);

  const [gameState, setGameState] = useState<GameState>('MAIN_MENU');
  const [highScore, setHighScore] = useState<number>(() => Storage.getHighScore());
  const [musicEnabled, setMusicEnabled] = useState<boolean>(() => Storage.getMusicEnabled());
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => Storage.getSoundEnabled());
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(() => MusicManager.getCurrentTrack());
  const [bossWarning, setBossWarning] = useState<boolean>(false);
  const [isNewHighScore, setIsNewHighScore] = useState<boolean>(false);
  const [levelUpOptions, setLevelUpOptions] = useState<LevelUpOption[] | null>(null);

  const [stats, setStats] = useState<PlayerStats>({
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

    // Listen for stats updates from GameScene
    EventBus.on('stats:update', (newStats: Partial<PlayerStats>) => {
      setStats((prev) => {
        const updated = { ...prev, ...newStats };
        if (updated.score > updated.highScore) {
          updated.highScore = updated.score;
          Storage.setHighScore(updated.score);
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

    // Listen for Game Over
    EventBus.on('game:over', ({ score, wave, bestCombo, survivalTime }: { score: number; wave: number; bestCombo: number; survivalTime: number }) => {
      const savedHigh = Storage.getHighScore();
      const isNew = score > savedHigh;
      if (isNew) {
        Storage.setHighScore(score);
        setHighScore(score);
      }
      setIsNewHighScore(isNew);
      setGameState('GAME_OVER');
      setLevelUpOptions(null);
      MusicManager.fadeOut(600);
    });

    // Listen for Toggle Pause via ESC key
    EventBus.on('game:togglePause', () => {
      setGameState((currentState) => {
        if (currentState === 'PLAYING') {
          handlePause();
          return 'PAUSED';
        } else if (currentState === 'PAUSED') {
          handleResume();
          return 'PLAYING';
        }
        return currentState;
      });
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

  // Handlers
  const handleStartGame = () => {
    const game = gameInstanceRef.current;
    if (game) {
      game.scene.wake('GameScene');
      game.scene.start('GameScene');
    }
    setGameState('PLAYING');
    setIsNewHighScore(false);
    setLevelUpOptions(null);
    setBossInfo({ active: false, name: '', currentHp: 0, maxHp: 0, phase: 1 });

    if (musicEnabled) {
      MusicManager.play();
    }
  };

  const handlePause = () => {
    const game = gameInstanceRef.current;
    if (game) {
      game.scene.pause('GameScene');
    }
    setGameState('PAUSED');
    MusicManager.pause();
  };

  const handleResume = () => {
    const game = gameInstanceRef.current;
    if (game) {
      game.scene.resume('GameScene');
    }
    setGameState('PLAYING');
    if (musicEnabled) {
      MusicManager.resume();
    }
  };

  const handleRestart = () => {
    const game = gameInstanceRef.current;
    if (game) {
      game.scene.resume('GameScene');
      game.scene.start('GameScene');
    }
    setGameState('PLAYING');
    setIsNewHighScore(false);
    setLevelUpOptions(null);
    setBossInfo({ active: false, name: '', currentHp: 0, maxHp: 0, phase: 1 });
    if (musicEnabled) {
      MusicManager.play();
    }
  };

  const handleMainMenu = () => {
    const game = gameInstanceRef.current;
    if (game) {
      game.scene.sleep('GameScene');
    }
    setGameState('MAIN_MENU');
    setLevelUpOptions(null);
    setBossInfo({ active: false, name: '', currentHp: 0, maxHp: 0, phase: 1 });
    MusicManager.fadeOut(400);
  };

  const handleToggleMusic = () => {
    const nextVal = !musicEnabled;
    setMusicEnabled(nextVal);
    MusicManager.setMuted(!nextVal);
  };

  const handleToggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    SoundEffects.setEnabled(nextVal);
  };

  const handleSelectUpgrade = (option: LevelUpOption) => {
    setLevelUpOptions(null);
    EventBus.emit('upgrade:selected', option);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black flex items-center justify-center select-none font-['Rajdhani']">
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
          score={stats.score}
          highScore={highScore}
          wave={stats.wave}
          bestCombo={stats.combo}
          survivalTime={stats.survivalTime}
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
