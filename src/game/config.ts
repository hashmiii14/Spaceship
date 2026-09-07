import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { BackgroundScene } from './scenes/BackgroundScene';
import { GameScene } from './scenes/GameScene';

export const createGameConfig = (parent: HTMLElement): Phaser.Types.Core.GameConfig => ({
  type: Phaser.AUTO,
  parent: parent,
  backgroundColor: '#030712',
  scale: {
    mode: Phaser.Scale.RESIZE,
    parent: parent,
    width: '100%',
    height: '100%',
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, BackgroundScene, GameScene],
  render: {
    pixelArt: false,
    antialias: true,
    powerPreference: 'high-performance',
  },
});
