import Phaser from 'phaser';
import { SCENES, COLORS, FONT, GAME_WIDTH, GAME_HEIGHT } from '../constants.js';

// UC-15/16 shell — the full ending lands in Task 11.
export default class EndScene extends Phaser.Scene {
  constructor() { super(SCENES.END); }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.NAVY);
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'ENDING — Task 11', {
      fontFamily: FONT, fontSize: '10px', color: COLORS.WHITE,
    }).setOrigin(0.5);
  }
}
