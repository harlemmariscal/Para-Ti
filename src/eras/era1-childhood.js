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

  // Harley's intro (2026-07-05).
  intro: [{ speaker: null, lines: ['Fifteen years ago, a classroom.', 'Walk a while with me?'] }],

  // UC-11: find the note passed to her — it waits on a desk in the front row.
  objective: {
    type: 'interact',
    target: { x: 13, y: 6 },
    texture: OBJECT_TEXTURES.note,
    // The note, as Harley wrote it (2026-07-05).
    found: [{ speaker: null, lines: ['do you want to be my friend?', '[ ]yes    [ ]yes'] }],
  },

  memory: {
    id: 'era1',
    name: 'The first spark',
    texture: MEMORY_TEXTURES.era1,
    x: 15, y: 3, // open floor at the front of the classroom
    // Harley's memory text (2026-07-05).
    scene: [{ speaker: null, lines: ['* The first spark *', "I didn't have the words yet.", 'But I knew.'] }],
  },

  npcs: [
    // Song-title nods approved by Harley (2026-07-05); swap for exact lyric lines anytime.
    { name: 'Classmate', x: 6, y: 8, axis: 'v', range: 2, line: "That song again! It's been stuck in my head all week.", attribution: '"August," 4rif' },
    { name: 'Classmate', x: 22, y: 12, axis: 'h', range: 3, line: 'Pass it on: someone in the front row is blushing.', attribution: null },
  ],
};
