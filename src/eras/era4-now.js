import { buildMapData } from './mapUtils.js';
import { HILL_WALLS, HILL_SPAWN, SUMMIT_ZONE } from './hillMap.js';
import { MEMORY_TEXTURES } from '../placeholders.js';

// Era 4 — Now, for good: the same hill at full sunset. Harley is already
// waiting at the top (Harley's call, 2026-07-05). Radiant, resolved.
export const era4 = {
  key: 'era4',
  name: 'Now, for good',
  next: null, // last era — collecting its memory triggers the ending (UC-15/16)
  tint: 0xffb08a, // full sunset
  map: {
    tileSize: 16,
    data: buildMapData(30, 20, HILL_WALLS),
    collision: [1],
  },
  spawn: HILL_SPAWN,

  harley: { x: 15, y: 2 }, // waiting at the summit

  // UC-11: reach the final spot where Harley waits.
  objective: { type: 'reach', zone: SUMMIT_ZONE },

  memory: {
    id: 'era4',
    name: 'The two of you, now',
    texture: MEMORY_TEXTURES.era4,
    x: 15, y: 2, // with Harley — the icon floats above her sprite once revealed
    // Harley's final words on the hill (2026-07-05).
    scene: [{ speaker: 'Harley', lines: ['Hey. Took us fifteen years', 'to get up here.', "I'd do every one again."] }],
  },

  npcs: [
    // Song-title nods approved by Harley (2026-07-05); swap for exact lyric lines anytime.
    { name: 'Townsperson', x: 8, y: 12, axis: 'h', range: 3, line: "Cuco on the radio today. Fits the sunset, doesn't it?", attribution: '"Lover Is a Day," Cuco' },
    { name: 'Townsperson', x: 20, y: 16, axis: 'h', range: 2, line: "Someone's waiting at the top. Didn't seem to mind the wait.", attribution: null },
  ],
};
