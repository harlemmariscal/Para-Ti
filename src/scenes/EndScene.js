import Phaser from 'phaser';
import {
  SCENES, COLORS, FONT, GAME_WIDTH, GAME_HEIGHT,
} from '../constants.js';
import { ERAS } from '../eras/index.js';
import { playerTexture, HARLEY_TEXTURE } from '../placeholders.js';
import { createRunState } from '../state.js';
import DialogueBox from '../ui/DialogueBox.js';

// UC-16: montage → sunset pan → Harley's message → the two of them → Play Again.
export default class EndScene extends Phaser.Scene {
  constructor() { super(SCENES.END); }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.NAVY);
    this.cameras.main.fadeIn(400, 13, 13, 26);
    this.keys = this.input.keyboard.addKeys('SPACE,ENTER');
    this.box = null;
    // TODO(Phase 3): ending song from Harley's playlist starts here.
    this.playMontage();
  }

  update() {
    if (this.box?.isOpen()) {
      const pressed =
        Phaser.Input.Keyboard.JustDown(this.keys.SPACE) ||
        Phaser.Input.Keyboard.JustDown(this.keys.ENTER);
      if (pressed) this.box.advance();
    }
  }

  // 1) The four memories replay as a small constellation.
  playMontage() {
    const title = this.add.text(GAME_WIDTH / 2, 48, 'FOUR MEMORIES', {
      fontFamily: FONT, fontSize: '12px', color: COLORS.PINK_SOFT,
    }).setOrigin(0.5);

    const items = [title];
    ERAS.forEach((era, i) => {
      const x = GAME_WIDTH / 2 + (i - 1.5) * 100;
      const icon = this.add.image(x, 140, era.memory.texture).setScale(2).setAlpha(0);
      const label = this.add.text(x, 166, era.memory.name, {
        fontFamily: FONT, fontSize: '7px', color: COLORS.WHITE,
        align: 'center', wordWrap: { width: 92 },
      }).setOrigin(0.5, 0).setAlpha(0);
      items.push(icon, label);
      this.tweens.add({ targets: [icon, label], alpha: 1, delay: 500 + i * 650, duration: 450 });
    });

    this.time.delayedCall(500 + 4 * 650 + 1000, () => {
      this.tweens.add({
        targets: items, alpha: 0, duration: 500,
        onComplete: () => this.playSunset(),
      });
    });
  }

  // 2) Placeholder pixel sunset pans up into view (real art in Phase 3).
  playSunset() {
    const bands = [0x2b1b4d, 0x7b2d5e, 0xc94f6d, 0xf2846b, 0xffc178];
    this.sky = this.add.container(0, GAME_HEIGHT);
    bands.forEach((color, i) => {
      this.sky.add(this.add.rectangle(0, i * 64, GAME_WIDTH, 64, color).setOrigin(0));
    });
    this.sky.add(this.add.circle(GAME_WIDTH / 2, 235, 26, 0xffe9a8)); // low sun
    this.sky.add(this.add.rectangle(0, 276, GAME_WIDTH, 44, 0x14101f).setOrigin(0)); // hill silhouette
    this.tweens.add({
      targets: this.sky, y: 0, duration: 2600, ease: 'Sine.easeInOut',
      onComplete: () => this.showMessage(),
    });
  }

  // 3) Harley's message — the most important text in the game.
  showMessage() {
    // TODO: Harley writes this (the ending message).
    const pages = [
      { speaker: 'Harley', lines: ['[ ENDING MESSAGE ]', '[ Harley writes this ]'] },
    ];
    this.box = new DialogueBox(this);
    this.box.open(pages, () => this.showTogether());
  }

  // 4) Both of them on the hilltop, then a quiet Play Again (UC-16 / BR-7).
  showTogether() {
    const y = 262; // standing on the silhouette hilltop
    const outfit = this.registry.get('runState')?.outfit;
    this.add.sprite(GAME_WIDTH / 2 - 12, y, playerTexture(outfit, 'down'), 0);
    this.add.sprite(GAME_WIDTH / 2 + 12, y, HARLEY_TEXTURE, 0);

    const again = this.add.text(GAME_WIDTH - 8, GAME_HEIGHT - 8, '[ PLAY AGAIN ]', {
      fontFamily: FONT, fontSize: '8px', color: COLORS.PINK_MAUVE,
    }).setOrigin(1).setInteractive({ useHandCursor: true });

    again.on('pointerover', () => again.setColor(COLORS.WHITE));
    again.on('pointerout', () => again.setColor(COLORS.PINK_MAUVE));
    again.on('pointerdown', () => {
      again.disableInteractive();
      this.registry.set('runState', createRunState()); // BR-7: fresh every play
      this.cameras.main.fadeOut(400, 13, 13, 26);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.start(SCENES.TITLE);
      });
    });
  }
}
