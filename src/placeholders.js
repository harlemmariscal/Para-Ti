import { HEX } from './constants.js';

// Texture keys for the player's four facings. Phase 3 swaps the generated
// rectangles for Alexei's real spritesheet without changing these keys.
export const PLAYER_TEXTURES = {
  down: 'player-down',
  up: 'player-up',
  left: 'player-left',
  right: 'player-right',
};

// White 4x4 "face" dot per facing (none when walking away from camera).
const FACE_DOTS = {
  down: [6, 10],
  up: null,
  left: [3, 10],
  right: [9, 10],
};

// Generates every texture Phase 1 needs at runtime — zero asset files.
// Returns the created texture keys in creation order.
export function createPlaceholderTextures(scene) {
  const created = [];
  const g = scene.add.graphics();

  // Tile strip: index 0 = floor, index 1 = wall.
  g.fillStyle(HEX.FLOOR).fillRect(0, 0, 16, 16);
  g.fillStyle(HEX.WALL).fillRect(16, 0, 16, 16);
  g.generateTexture('tiles', 32, 16);
  created.push('tiles');

  // Player: 16x32 body with a face dot showing the facing.
  for (const dir of ['down', 'up', 'left', 'right']) {
    g.clear();
    g.fillStyle(HEX.BODY).fillRect(2, 6, 12, 24);
    const dot = FACE_DOTS[dir];
    if (dot) g.fillStyle(0xffffff).fillRect(dot[0], dot[1], 4, 4);
    g.generateTexture(PLAYER_TEXTURES[dir], 16, 32);
    created.push(PLAYER_TEXTURES[dir]);
  }

  g.destroy();
  return created;
}
