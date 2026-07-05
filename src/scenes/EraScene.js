import Phaser from 'phaser';
import { SCENES, COLORS, FONT, GAME_WIDTH, GAME_HEIGHT } from '../constants.js';

// UC-5/6/7 shell — the real data-driven era engine lands in Tasks 8-9.
export default class EraScene extends Phaser.Scene {
  constructor() { super(SCENES.ERA); }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.NAVY);
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'ERA — Task 8', {
      fontFamily: FONT, fontSize: '10px', color: COLORS.WHITE,
    }).setOrigin(0.5);
  }
}
