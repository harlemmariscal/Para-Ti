import Phaser from 'phaser';
import { SCENES } from '../constants.js';
import { createPlaceholderTextures } from '../placeholders.js';
import { createRunState } from '../state.js';

// UC-1: Boot & load assets.
export default class BootScene extends Phaser.Scene {
  constructor() { super(SCENES.BOOT); }

  preload() {
    // TODO(Phase 3): load real assets here — Alexei/Harley spritesheets,
    // asset-pack tilesets, Tiled JSON maps, and Harley's playlist audio (MP3+OGG).
  }

  create() {
    createPlaceholderTextures(this);
    this.registry.set('runState', createRunState());
    this.scene.start(SCENES.TITLE);
  }
}
