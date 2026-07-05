import Phaser from 'phaser';
import {
  SCENES, COLORS, HEX, FONT, GAME_WIDTH, OUTFIT_TINTS,
} from '../constants.js';
import { setOutfit } from '../state.js';
import { PLAYER_TEXTURES } from '../placeholders.js';

// UC-4: choose Casual or Athletic. Exactly two options (BR-6).
export default class OutfitScene extends Phaser.Scene {
  constructor() { super(SCENES.OUTFIT); }

  create() {
    this.selected = null;
    this.cameras.main.setBackgroundColor(COLORS.NAVY);
    this.cameras.main.fadeIn(300, 13, 13, 26);

    this.add.text(GAME_WIDTH / 2, 40, 'CHOOSE YOUR OUTFIT', {
      fontFamily: FONT, fontSize: '12px', color: COLORS.WHITE,
    }).setOrigin(0.5);

    this.panels = {
      casual: this.makeOption(GAME_WIDTH * 0.32, 'casual', 'CASUAL'),
      athletic: this.makeOption(GAME_WIDTH * 0.68, 'athletic', 'ATHLETIC'),
    };

    this.confirm = this.add.text(GAME_WIDTH / 2, 285, "[ LET'S GO ]", {
      fontFamily: FONT, fontSize: '12px', color: COLORS.PINK_MAUVE,
    }).setOrigin(0.5).setVisible(false).setInteractive({ useHandCursor: true });

    this.confirm.on('pointerover', () => this.confirm.setColor(COLORS.WHITE));
    this.confirm.on('pointerout', () => this.confirm.setColor(COLORS.PINK_MAUVE));
    this.confirm.on('pointerdown', () => this.launchEra());
  }

  makeOption(x, outfit, label) {
    const panel = this.add.rectangle(x, 160, 110, 160, HEX.PANEL)
      .setStrokeStyle(2, HEX.PANEL_BORDER)
      .setInteractive({ useHandCursor: true });

    // TODO(Phase 3): tinted placeholder becomes Alexei's real outfit sprite —
    // sprites provided by Harley.
    this.add.image(x, 145, PLAYER_TEXTURES.down).setScale(3).setTint(OUTFIT_TINTS[outfit]);

    this.add.text(x, 215, label, {
      fontFamily: FONT, fontSize: '10px', color: COLORS.WHITE,
    }).setOrigin(0.5);

    panel.on('pointerdown', () => this.select(outfit));
    return panel;
  }

  select(outfit) {
    this.selected = outfit;
    for (const [key, panel] of Object.entries(this.panels)) {
      panel.setStrokeStyle(2, key === outfit ? HEX.PINK_SOFT : HEX.PANEL_BORDER);
    }
    this.confirm.setVisible(true);
  }

  launchEra() {
    const runState = setOutfit(this.registry.get('runState'), this.selected);
    this.registry.set('runState', runState);

    this.confirm.disableInteractive();
    this.cameras.main.fadeOut(300, 13, 13, 26);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start(SCENES.ERA, { eraKey: 'era1' });
    });
  }
}
