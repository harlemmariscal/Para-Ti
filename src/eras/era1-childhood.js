import { buildMapData } from './mapUtils.js';

// Era 1 — Childhood: the 2nd-grade classroom where it all quietly started.
// Placeholder layout: three pairs of desk rows to walk between (they test
// interior collision too). Real classroom tiles arrive in Phase 3.
const DESKS = [
  [8, 6], [9, 6], [13, 6], [14, 6], [18, 6], [19, 6],
  [8, 10], [9, 10], [13, 10], [14, 10], [18, 10], [19, 10],
  [8, 14], [9, 14], [13, 14], [14, 14], [18, 14], [19, 14],
];

export const era1 = {
  key: 'era1',
  name: 'Childhood',
  next: 'era2', // Era 2 (the hill) is added in Phase 2
  tint: 0xfff2cc, // bright, warm-morning mood
  map: {
    tileSize: 16,
    data: buildMapData(30, 20, DESKS),
    collision: [1],
  },
  spawn: { x: 4, y: 16 }, // near the classroom door, lower-left

  // TODO(Phase 2, UC-5): Era 1 intro line via dialogue box — wording is Harley's.
  // TODO(Phase 2): objective (find the note), NPCs, memory — per the v2 spec.
};
