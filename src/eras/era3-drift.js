import { buildMapData, wallRect } from './mapUtils.js';
import { MEMORY_TEXTURES } from '../placeholders.js';

// Era 3 — The drift: a rainy street between two places (Harley's call, 2026-07-05).
// Two homes that never quite face each other; the player walks the wet street
// between them. One screen, one honest breath — then on.
const BUILDINGS = [
  ...wallRect(1, 1, 8, 6),     // one home, top-left
  ...wallRect(21, 13, 28, 18), // the other, bottom-right
];

export const era3 = {
  key: 'era3',
  name: 'The drift',
  next: 'era4',
  tint: 0xaab3c8, // muted grey-blue
  weather: 'rain',
  map: {
    tileSize: 16,
    data: buildMapData(30, 20, BUILDINGS),
    collision: [1],
  },
  spawn: { x: 2, y: 10 }, // stepping out from the first home's side of the street

  // UC-11: cross the rain to the far end of the street.
  objective: { type: 'reach', zone: { x: 26, y: 8, w: 3, h: 4 } },

  memory: {
    id: 'era3',
    name: 'Finding my way back',
    texture: MEMORY_TEXTURES.era3,
    x: 27, y: 10,
    // Harley's memory text (2026-07-05).
    scene: [{ speaker: null, lines: ['* Finding my way back *', 'Even when we drifted, I never stopped', 'finding my way back to you.'] }],
  },

  npcs: [], // emptiness is the point (level design spec, era 3)
};
