import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, FONT } from './constants.js';
import BootScene from './scenes/BootScene.js';
import TitleScene from './scenes/TitleScene.js';
import OutfitScene from './scenes/OutfitScene.js';
import EraScene from './scenes/EraScene.js';
import EndScene from './scenes/EndScene.js';

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
  scene: [BootScene, TitleScene, OutfitScene, EraScene, EndScene],
};

// Gate boot on the pixel font so no text ever renders in a fallback font.
// The instance is exposed for the verify skill's headless browser driver.
const start = () => { window.__game = new Phaser.Game(config); };
document.fonts.load(`16px ${FONT}`).then(start, start);
