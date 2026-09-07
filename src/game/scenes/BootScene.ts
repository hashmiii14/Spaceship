import Phaser from 'phaser';
import { TextureGenerator } from '../utils/TextureGenerator';
import { EventBus } from '../../utils/EventBus';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Generate all procedural sci-fi textures directly
    TextureGenerator.generateTextures(this);
  }

  create(): void {
    EventBus.emit('game:ready');
    // Launch Background parallax scene in parallel
    this.scene.launch('BackgroundScene');
    // Start main gameplay scene
    this.scene.start('GameScene');
  }
}
