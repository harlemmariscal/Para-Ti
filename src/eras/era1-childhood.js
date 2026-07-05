import { buildMapData } from './mapUtils.js';
import { MEMORY_TEXTURES, OBJECT_TEXTURES } from '../placeholders.js';

// Era 1 — Childhood: the 2nd-grade classroom where it all quietly started.
// Placeholder desk layout; real classroom tiles arrive in Phase 3.
const DESKS = [
  [8, 6], [9, 6], [13, 6], [14, 6], [18, 6], [19, 6],
  [8, 10], [9, 10], [13, 10], [14, 10], [18, 10], [19, 10],
  [8, 14], [9, 14], [13, 14], [14, 14], [18, 14], [19, 14],
];

export const era1 = {
  key: 'era1',
  name: 'Childhood',
  next: 'era2',
  tint: 0xfff2cc, // bright, warm-morning mood
  map: {
    tileSize: 16,
    data: buildMapData(30, 20, DESKS),
    collision: [1],
  },
  spawn: { x: 4, y: 16 }, // near the classroom door, lower-left

  // TODO: Harley writes this (era intro framing the journey — UC-5).
  intro: [{ speaker: null, lines: ['[ ERA 1 INTRO — Harley writes this ]'] }],

  // UC-11: find the note passed to her — it waits on a desk in the front row.
  objective: {
    type: 'interact',
    target: { x: 13, y: 6 },
    texture: OBJECT_TEXTURES.note,
    // TODO: Harley writes this (what the note says).
    found: [{ speaker: null, lines: ['[ THE NOTE — Harley writes this ]'] }],
  },

  memory: {
    id: 'era1',
    name: 'The first spark',
    texture: MEMORY_TEXTURES.era1,
    x: 15, y: 3, // open floor at the front of the classroom
    // TODO: Harley writes this (memory scene text).
    scene: [{ speaker: null, lines: ['[ MEMORY: The first spark ]', '[ Harley writes this ]'] }],
  },

  npcs: [
    // TODO: Harley writes these lines (playlist lyric and/or real line).
    { name: 'Classmate', x: 6, y: 8, axis: 'v', range: 2, line: '[ NPC LINE — Harley writes this ]', attribution: null },
    { name: 'Classmate', x: 22, y: 12, axis: 'h', range: 3, line: '[ NPC LINE — Harley writes this ]', attribution: null },
  ],
};
