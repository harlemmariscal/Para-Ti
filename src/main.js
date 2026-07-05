import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, FONT } from './constants.js';

// Temporary proof-of-boot scene. Replaced by the real scene registry in Task 6.
class ScaffoldScene extends Phaser.Scene {
  create() {
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'PARA TI — ENGINE OK', {
      fontFamily: FONT,
      fontSize: '12px',
      color: COLORS.WHITE,
    }).setOrigin(0.5);
  }
}

const config = {
  type: Phaser.AUTO,
  parent: 'app',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: COLORS.NAVY,
  pixelArt: true,
  roundPixels: true,
  physics: { default: 'arcade', arcade: { debug: false } },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [ScaffoldScene],
};

// Gate boot on the pixel font so no text ever renders in a fallback font.
const start = () => new Phaser.Game(config);
document.fonts.load(`16px ${FONT}`).then(start, start);
