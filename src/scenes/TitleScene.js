import Phaser from 'phaser';
import { SCENES, COLORS, FONT, GAME_WIDTH, GAME_HEIGHT } from '../constants.js';

// UC-2 + UC-3: the sacred title screen. Layout, colors, and font are locked
// by the approved screenshot — do not restyle.
export default class TitleScene extends Phaser.Scene {
  constructor() { super(SCENES.TITLE); }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.NAVY);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT * 0.28, 'PARA TI', {
      fontFamily: FONT, fontSize: '32px', color: COLORS.WHITE,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT * 0.44, 'from harley', {
      fontFamily: FONT, fontSize: '10px', color: COLORS.PINK_SOFT,
    }).setOrigin(0.5);

    const play = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT * 0.76, '[ PLAY ]', {
      fontFamily: FONT, fontSize: '14px', color: COLORS.PINK_MAUVE,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    play.on('pointerover', () => play.setColor(COLORS.WHITE));
    play.on('pointerout', () => play.setColor(COLORS.PINK_MAUVE));
    play.on('pointerdown', () => {
      play.disableInteractive();
      this.cameras.main.fadeOut(300, 13, 13, 26);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.start(SCENES.OUTFIT);
      });
    });

    // TODO(Phase 3): title music begins softly here — track from Harley's playlist.
  }
}
