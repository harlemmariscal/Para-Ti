import { HEX } from './constants.js';

// Texture keys for the player's four facings. Phase 3 swaps the generated
// rectangles for Alexei's real spritesheet without changing these keys.
export const PLAYER_TEXTURES = {
  down: 'player-down',
  up: 'player-up',
  left: 'player-left',
  right: 'player-right',
};

export const NPC_TEXTURE = 'npc';
export const HARLEY_TEXTURE = 'harley'; // placeholder until Harley's reference-photo sprite (Phase 3)
export const OBJECT_TEXTURES = { note: 'obj-note' };
export const MEMORY_TEXTURES = {
  era1: 'memory-era1', era2: 'memory-era2', era3: 'memory-era3', era4: 'memory-era4',
};

// One color per era's memory icon: spark gold, warm orange, rain blue, sunset rose.
const MEMORY_COLORS = {
  era1: 0xffe066, era2: 0xffa94d, era3: 0x74c0fc, era4: 0xff8787,
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

  // Townsperson: grey 16x32 body, face dot.
  g.clear();
  g.fillStyle(0x6b6b80).fillRect(2, 6, 12, 24);
  g.fillStyle(0xffffff).fillRect(6, 10, 4, 4);
  g.generateTexture(NPC_TEXTURE, 16, 32);
  created.push(NPC_TEXTURE);

  // Harley: warm brown 16x32 body, soft-pink chest mark, face dot.
  g.clear();
  g.fillStyle(0x7a4a2b).fillRect(2, 6, 12, 24);
  g.fillStyle(HEX.PINK_SOFT).fillRect(6, 18, 4, 4);
  g.fillStyle(0xffffff).fillRect(6, 10, 4, 4);
  g.generateTexture(HARLEY_TEXTURE, 16, 32);
  created.push(HARLEY_TEXTURE);

  // The note: small white page with a fold shadow.
  g.clear();
  g.fillStyle(0xffffff).fillRect(3, 5, 10, 7);
  g.fillStyle(0xc9c9d4).fillRect(3, 5, 10, 2);
  g.generateTexture(OBJECT_TEXTURES.note, 16, 16);
  created.push(OBJECT_TEXTURES.note);

  // Memory icons: chunky pixel diamond per era color with a white core.
  for (const era of ['era1', 'era2', 'era3', 'era4']) {
    g.clear();
    g.fillStyle(MEMORY_COLORS[era]);
    g.fillRect(6, 2, 4, 12).fillRect(2, 6, 12, 4);
    g.fillStyle(0xffffff).fillRect(6, 6, 4, 4);
    g.generateTexture(MEMORY_TEXTURES[era], 16, 16);
    created.push(MEMORY_TEXTURES[era]);
  }

  g.destroy();
  return created;
}
