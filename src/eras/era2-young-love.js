import { buildMapData } from './mapUtils.js';
import { HILL_WALLS, HILL_SPAWN, SUMMIT_ZONE } from './hillMap.js';
import { MEMORY_TEXTURES } from '../placeholders.js';

// Era 2 — Young love: the hill overlooking the city, golden hour.
export const era2 = {
  key: 'era2',
  name: 'Young love',
  next: 'era3',
  tint: 0xffd9a0, // warm, golden
  map: {
    tileSize: 16,
    data: buildMapData(30, 20, HILL_WALLS),
    collision: [1],
  },
  spawn: HILL_SPAWN,

  // UC-11: reach the top of the hill together.
  objective: { type: 'reach', zone: SUMMIT_ZONE },

  memory: {
    id: 'era2',
    name: 'First real love',
    texture: MEMORY_TEXTURES.era2,
    x: 15, y: 2, // the summit
    // Harley's memory text (2026-07-05).
    scene: [{ speaker: null, lines: ['* First real love *', 'Up here it was just us', 'and the city lights.'] }],
  },

  npcs: [
    // Song-title nods approved by Harley (2026-07-05); swap for exact lyric lines anytime.
    { name: 'Townsperson', x: 10, y: 16, axis: 'h', range: 3, line: "Nice night for the hill. Somebody's playing Bruno Mars up there.", attribution: '"Nothing On You," Bruno Mars' },
    { name: 'Townsperson', x: 12, y: 7, axis: 'h', range: 2, line: "Can't get that Walters song out of my head tonight.", attribution: '"I Love You So," The Walters' },
  ],
};
