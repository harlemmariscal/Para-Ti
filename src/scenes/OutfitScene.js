import Phaser from 'phaser';
import { SCENES, COLORS, FONT, GAME_WIDTH, GAME_HEIGHT } from '../constants.js';

// UC-4 shell — full outfit selection lands in Task 7.
export default class OutfitScene extends Phaser.Scene {
  constructor() { super(SCENES.OUTFIT); }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.NAVY);
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'OUTFIT — Task 7', {
      fontFamily: FONT, fontSize: '10px', color: COLORS.WHITE,
    }).setOrigin(0.5);
  }
}
