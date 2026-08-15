# Para Ti — Phase 2 Core Loop & Ending Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete UC-8 through UC-16 — interaction system, dialogue box, NPCs, era objectives, memory collection, tracker, era advancement across all four eras, and the ending — so the game plays end to end (Title → Outfit → Era 1→2→3→4 → Ending → Play Again).

**Architecture:** Extends Phase 1's split: pure logic (dialogue paging, interaction targeting, memory state, map rect helper) lives in tested ES modules; Phaser wiring lives in scenes. EraScene stays the single reusable engine — eras 2–4 are **new config files only**. A shared `hillMap.js` layout serves eras 2 and 4 (same hill, relit golden → sunset); era 3 is a new rainy-street layout. A reusable `DialogueBox` UI class serves EraScene and EndScene.

**Tech Stack:** Phaser 3, Vite, Vitest, JS ES modules — unchanged from Phase 1.

## Global Constraints

- **Specs:** `docs/superpowers/specs/2026-07-05-para-ti-v2-design.md` (source of truth), `3_Use_Cases.md` v2.1 (UC-8..UC-16), `5_Level_Design_Spec.md`.
- **Harley's settled decisions (2026-07-05, this session):** Era 3 = **a rainy street between two places** (new layout, grey rain, no NPCs — emptiness is the point). Era 4 = **the same hill as era 2 at full sunset, Harley already waiting at the top**.
- **Personal text is Harley's.** Build with literal `[ ... — Harley writes this ]` placeholder strings; Task 12 replaces them era-by-era via AskUserQuestion checkpoints with Harley. Never invent his lines.
- **One screen per era. No save state. Desktop only. JS only, no TypeScript.**
- **NPCs are optional flavor** (BR-3) — never required to progress. Placeholder NPCs/Harley do not block movement in v1 demo (noted in code).
- **Every commit leaves `npm test` passing and `npm run dev` runnable.** Work directly on `main` (Harley's explicit instruction — no feature branch).
- **Browser verification:** after each scene-affecting task, use the project's `verify` skill (real Chrome + screenshots) in addition to the listed manual checks.
- Test files must never import Phaser or scene files (node environment).
- Commit messages end with: `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>` (second `-m` flag).

## File Structure (Phase 2 delta)

```
src/
├── constants.js              ← MODIFY: add SCENES.END
├── state.js                  ← MODIFY: add addMemory()
├── dialogue.js               ← NEW: pure paged-dialogue state machine
├── interaction.js            ← NEW: pure facing-target + zone logic
├── placeholders.js           ← MODIFY: NPC/Harley/note/memory-icon textures
├── eras/
│   ├── mapUtils.js           ← MODIFY: add wallRect()
│   ├── validate.js           ← MODIFY: objective/memory/npc/harley validation
│   ├── era1-childhood.js     ← MODIFY: full config (note objective, memory, NPCs)
│   ├── hillMap.js            ← NEW: shared hill layout (eras 2 & 4)
│   ├── era2-young-love.js    ← NEW
│   ├── era3-drift.js         ← NEW (rainy street)
│   ├── era4-now.js           ← NEW (hill at sunset, Harley waiting)
│   └── index.js              ← MODIFY: register eras 2-4
├── ui/
│   └── DialogueBox.js        ← NEW: Pokémon-style box (EraScene + EndScene)
└── scenes/
    ├── EraScene.js           ← MODIFY: interaction, dialogue, NPCs, objective,
    │                            memory, tracker, advance (UC-8..14)
    ├── EndScene.js           ← NEW: montage → sunset → message → Play Again (UC-15/16)
    └── (main.js registers EndScene)
tests/
├── state.test.js             ← MODIFY
├── dialogue.test.js          ← NEW
├── interaction.test.js       ← NEW
├── mapUtils.test.js          ← MODIFY
├── placeholders.test.js      ← MODIFY
├── validate.test.js          ← MODIFY
├── eras.test.js              ← MODIFY
└── constants.test.js         ← MODIFY (SCENES.END)
```

---

### Task 1: `addMemory` in the run state (UC-12 data layer)

**Files:**
- Modify: `src/state.js`
- Test: `tests/state.test.js`

**Interfaces:**
- Consumes: existing `createRunState()`.
- Produces: `addMemory(state, memoryId) → newState` — appends to `state.memories` immutably; throws `Error('Memory "<id>" already collected')` on duplicates (BR-2). EraScene calls this on collect; the tracker and EndScene read `memories`.

- [ ] **Step 1: Add failing tests to `tests/state.test.js`** (append inside the file, new describe block; also add `addMemory` to the import)

```js
describe('addMemory', () => {
  it('appends a memory without mutating the original state', () => {
    const state = createRunState();
    const next = addMemory(state, 'era1');
    expect(next.memories).toEqual(['era1']);
    expect(state.memories).toEqual([]);
    expect(next).not.toBe(state);
  });

  it('keeps collection order across eras', () => {
    let state = createRunState();
    for (const id of ['era1', 'era2', 'era3', 'era4']) state = addMemory(state, id);
    expect(state.memories).toEqual(['era1', 'era2', 'era3', 'era4']);
  });

  it('throws when the same memory is collected twice (BR-2)', () => {
    const state = addMemory(createRunState(), 'era1');
    expect(() => addMemory(state, 'era1')).toThrow('Memory "era1" already collected');
  });
});
```

- [ ] **Step 2: Run `npm test`** — expected: FAIL (`addMemory` is not exported).

- [ ] **Step 3: Implement in `src/state.js`** (replace the trailing `// Phase 2 (UC-12) adds addMemory...` comment)

```js
// UC-12/BR-2: one memory per era, never re-collected within a play.
export function addMemory(state, memoryId) {
  if (state.memories.includes(memoryId)) {
    throw new Error(`Memory "${memoryId}" already collected`);
  }
  return { ...state, memories: [...state.memories, memoryId] };
}
```

- [ ] **Step 4: Run `npm test`** — expected: PASS, all suites.

- [ ] **Step 5: Commit**

```bash
git add src/state.js tests/state.test.js
git commit -m "feat: add addMemory to run state (UC-12 data layer)" -m "Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: Pure dialogue state machine (UC-9 logic)

**Files:**
- Create: `src/dialogue.js`
- Test: `tests/dialogue.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces: a **page** is `{ speaker: string|null, lines: string[], attribution?: string|null }`. `createDialogue(pages) → { pages, index: 0, done: false }` (throws `Error('Dialogue needs at least one page')` on empty/non-array). `currentPage(d) → page`. `advanceDialogue(d) → d'` — increments `index`; past the last page sets `done: true` (index stays on the last page); advancing a done dialogue is a no-op. `DialogueBox` (Task 8) is a thin renderer over this.

- [ ] **Step 1: Write the failing test** — create `tests/dialogue.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { createDialogue, currentPage, advanceDialogue } from '../src/dialogue.js';

const pages = [
  { speaker: 'Townsperson', lines: ['first page'], attribution: '"3005," Childish Gambino' },
  { speaker: null, lines: ['second page, line a', 'second page, line b'] },
];

describe('createDialogue', () => {
  it('starts on the first page, not done', () => {
    const d = createDialogue(pages);
    expect(d.index).toBe(0);
    expect(d.done).toBe(false);
    expect(currentPage(d)).toEqual(pages[0]);
  });

  it('throws on an empty page list', () => {
    expect(() => createDialogue([])).toThrow('Dialogue needs at least one page');
  });
});

describe('advanceDialogue', () => {
  it('moves to the next page without mutating', () => {
    const d = createDialogue(pages);
    const next = advanceDialogue(d);
    expect(next.index).toBe(1);
    expect(currentPage(next)).toEqual(pages[1]);
    expect(d.index).toBe(0);
  });

  it('marks done when advanced past the last page, keeping the last index', () => {
    const d = advanceDialogue(advanceDialogue(createDialogue(pages)));
    expect(d.done).toBe(true);
    expect(d.index).toBe(1);
  });

  it('is a no-op once done', () => {
    const d = advanceDialogue(advanceDialogue(createDialogue(pages)));
    expect(advanceDialogue(d)).toEqual(d);
  });
});
```

- [ ] **Step 2: Run `npm test`** — expected: FAIL (cannot resolve `../src/dialogue.js`).

- [ ] **Step 3: Write `src/dialogue.js`**

```js
// UC-9: pure paged-dialogue state. A page: { speaker, lines[], attribution? }.
// DialogueBox (src/ui/DialogueBox.js) renders this; scenes drive advance on Space/Enter.
export function createDialogue(pages) {
  if (!Array.isArray(pages) || pages.length === 0) {
    throw new Error('Dialogue needs at least one page');
  }
  return { pages, index: 0, done: false };
}

export function currentPage(d) {
  return d.pages[d.index];
}

export function advanceDialogue(d) {
  if (d.done) return d;
  if (d.index + 1 >= d.pages.length) return { ...d, done: true };
  return { ...d, index: d.index + 1 };
}
```

- [ ] **Step 4: Run `npm test`** — expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/dialogue.js tests/dialogue.test.js
git commit -m "feat: add pure paged-dialogue state machine (UC-9 logic)" -m "Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Pure interaction targeting (UC-8 logic)

**Files:**
- Create: `src/interaction.js`
- Test: `tests/interaction.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `targetTile(tileX, tileY, facing) → { x, y }` — the tile one step ahead in `facing` (`'up'|'down'|'left'|'right'`).
  - `findTarget({ tileX, tileY, facing }, interactables) → interactable|null` — matches an interactable whose `{ x, y }` tile equals the tile ahead **or** the player's own tile (floor items like memories can be stood on). First match wins.
  - `inZone(tileX, tileY, zone) → boolean` — zone is `{ x, y, w, h }` in tile coords, inclusive of `x..x+w-1`, `y..y+h-1`. Used by `reach` objectives (UC-11).
  - EraScene passes interactable entries shaped `{ x, y, sprite, onInteract }` — this module only reads `x`/`y`.

- [ ] **Step 1: Write the failing test** — create `tests/interaction.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { targetTile, findTarget, inZone } from '../src/interaction.js';

describe('targetTile', () => {
  it('returns the tile one step ahead per facing', () => {
    expect(targetTile(5, 5, 'up')).toEqual({ x: 5, y: 4 });
    expect(targetTile(5, 5, 'down')).toEqual({ x: 5, y: 6 });
    expect(targetTile(5, 5, 'left')).toEqual({ x: 4, y: 5 });
    expect(targetTile(5, 5, 'right')).toEqual({ x: 6, y: 5 });
  });
});

describe('findTarget', () => {
  const note = { x: 5, y: 4, id: 'note' };
  const npc = { x: 6, y: 5, id: 'npc' };

  it('finds the interactable directly faced', () => {
    expect(findTarget({ tileX: 5, tileY: 5, facing: 'up' }, [note, npc])).toBe(note);
    expect(findTarget({ tileX: 5, tileY: 5, facing: 'right' }, [note, npc])).toBe(npc);
  });

  it('finds an interactable on the tile the player stands on', () => {
    const memory = { x: 5, y: 5, id: 'memory' };
    expect(findTarget({ tileX: 5, tileY: 5, facing: 'down' }, [memory])).toBe(memory);
  });

  it('returns null when nothing is faced or underfoot', () => {
    expect(findTarget({ tileX: 5, tileY: 5, facing: 'down' }, [note, npc])).toBeNull();
    expect(findTarget({ tileX: 1, tileY: 1, facing: 'up' }, [note, npc])).toBeNull();
  });
});

describe('inZone', () => {
  const zone = { x: 12, y: 1, w: 6, h: 3 };

  it('is true inside and on the inclusive edges', () => {
    expect(inZone(12, 1, zone)).toBe(true);
    expect(inZone(17, 3, zone)).toBe(true);
    expect(inZone(14, 2, zone)).toBe(true);
  });

  it('is false just outside every edge', () => {
    expect(inZone(11, 2, zone)).toBe(false);
    expect(inZone(18, 2, zone)).toBe(false);
    expect(inZone(14, 0, zone)).toBe(false);
    expect(inZone(14, 4, zone)).toBe(false);
  });
});
```

- [ ] **Step 2: Run `npm test`** — expected: FAIL (cannot resolve `../src/interaction.js`).

- [ ] **Step 3: Write `src/interaction.js`**

```js
// UC-8: pure targeting for the generic interaction system.
// An interactable only needs { x, y } tile coords here; scenes attach sprites/handlers.
const AHEAD = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};

export function targetTile(tileX, tileY, facing) {
  const [dx, dy] = AHEAD[facing];
  return { x: tileX + dx, y: tileY + dy };
}

// Matches the tile ahead (Pokémon-style facing) or the player's own tile
// (floor items — a revealed memory can be walked onto).
export function findTarget({ tileX, tileY, facing }, interactables) {
  const ahead = targetTile(tileX, tileY, facing);
  return (
    interactables.find(
      (i) =>
        (i.x === ahead.x && i.y === ahead.y) ||
        (i.x === tileX && i.y === tileY),
    ) ?? null
  );
}

// UC-11 'reach' objectives: inclusive tile rectangle.
export function inZone(tileX, tileY, zone) {
  return (
    tileX >= zone.x && tileX < zone.x + zone.w &&
    tileY >= zone.y && tileY < zone.y + zone.h
  );
}

// EraScene converts the player's feet-center to tile coords with:
//   tileX = floor(player.x / TILE_SIZE), tileY = floor((player.y + 10) / TILE_SIZE)
// (+10 because the 12x12 feet hitbox sits at offset (2,20) of the 16x32 sprite).
```

- [ ] **Step 4: Run `npm test`** — expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/interaction.js tests/interaction.test.js
git commit -m "feat: add pure interaction targeting and reach zones (UC-8 logic)" -m "Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: `wallRect` map helper (era 3 buildings)

**Files:**
- Modify: `src/eras/mapUtils.js`
- Test: `tests/mapUtils.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces: `wallRect(x0, y0, x1, y1) → [x, y][]` — every tile pair in the inclusive rectangle, feedable to `buildMapData`'s `extraWalls`. Era 3's two buildings use it (Task 7).

- [ ] **Step 1: Add failing tests to `tests/mapUtils.test.js`** (add `wallRect` to the import, append a describe block)

```js
describe('wallRect', () => {
  it('covers the full inclusive rectangle', () => {
    const walls = wallRect(2, 3, 4, 5);
    expect(walls).toHaveLength(9); // 3 x 3
    expect(walls).toContainEqual([2, 3]);
    expect(walls).toContainEqual([4, 5]);
    expect(walls).toContainEqual([3, 4]);
  });

  it('handles a single-tile rect', () => {
    expect(wallRect(7, 7, 7, 7)).toEqual([[7, 7]]);
  });
});
```

- [ ] **Step 2: Run `npm test`** — expected: FAIL (`wallRect` not exported).

- [ ] **Step 3: Append to `src/eras/mapUtils.js`**

```js
// Inclusive rectangle of wall tiles — building blocks for extraWalls.
export function wallRect(x0, y0, x1, y1) {
  const walls = [];
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) walls.push([x, y]);
  }
  return walls;
}
```

- [ ] **Step 4: Run `npm test`** — expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/eras/mapUtils.js tests/mapUtils.test.js
git commit -m "feat: add wallRect map helper for building footprints" -m "Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: Placeholder textures v2 (NPC, Harley, note, memory icons)

**Files:**
- Modify: `src/placeholders.js`
- Test: `tests/placeholders.test.js`

**Interfaces:**
- Consumes: `HEX` from constants; a Phaser scene's `add.graphics()` (mockable).
- Produces (Phase 3 swaps art without changing keys):
  - `NPC_TEXTURE = 'npc'` (16×32 grey townsperson)
  - `HARLEY_TEXTURE = 'harley'` (16×32, warm brown with a soft-pink chest mark — placeholder until Harley's reference-photo sprite)
  - `OBJECT_TEXTURES = { note: 'obj-note' }` (16×16 folded note)
  - `MEMORY_TEXTURES = { era1: 'memory-era1', era2: 'memory-era2', era3: 'memory-era3', era4: 'memory-era4' }` (16×16 icons, one color per era)
  - `createPlaceholderTextures(scene)` now returns, in order: `['tiles', 'player-down', 'player-up', 'player-left', 'player-right', 'npc', 'harley', 'obj-note', 'memory-era1', 'memory-era2', 'memory-era3', 'memory-era4']`.

- [ ] **Step 1: Update `tests/placeholders.test.js`** — extend the import and replace/extend the assertions:

```js
import { describe, it, expect } from 'vitest';
import {
  createPlaceholderTextures, PLAYER_TEXTURES, NPC_TEXTURE, HARLEY_TEXTURE,
  OBJECT_TEXTURES, MEMORY_TEXTURES,
} from '../src/placeholders.js';

// (keep the existing mockScene helper unchanged)

describe('createPlaceholderTextures', () => {
  it('generates every Phase 2 texture, in order', () => {
    const scene = mockScene();
    const keys = createPlaceholderTextures(scene);
    const expected = [
      'tiles', 'player-down', 'player-up', 'player-left', 'player-right',
      'npc', 'harley', 'obj-note',
      'memory-era1', 'memory-era2', 'memory-era3', 'memory-era4',
    ];
    expect(keys).toEqual(expected);
    expect(scene.generated).toEqual(expected);
  });

  it('exposes a texture key for every facing the movement resolver can produce', () => {
    expect(PLAYER_TEXTURES).toEqual({
      down: 'player-down', up: 'player-up', left: 'player-left', right: 'player-right',
    });
  });

  it('exposes one memory icon per era key', () => {
    expect(Object.keys(MEMORY_TEXTURES)).toEqual(['era1', 'era2', 'era3', 'era4']);
    expect(NPC_TEXTURE).toBe('npc');
    expect(HARLEY_TEXTURE).toBe('harley');
    expect(OBJECT_TEXTURES.note).toBe('obj-note');
  });
});
```

- [ ] **Step 2: Run `npm test`** — expected: FAIL (new exports missing / key list short).

- [ ] **Step 3: Extend `src/placeholders.js`** — add exports after `PLAYER_TEXTURES` and extend the generator before `g.destroy()`:

```js
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
```

Inside `createPlaceholderTextures`, after the player-facing loop (before `g.destroy()`):

```js
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
```

- [ ] **Step 4: Run `npm test`** — expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/placeholders.js tests/placeholders.test.js
git commit -m "feat: add NPC, Harley, note, and memory-icon placeholder textures" -m "Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: Era config schema v2 + full Era 1 config

**Files:**
- Modify: `src/eras/validate.js`
- Modify: `src/eras/era1-childhood.js`
- Test: `tests/validate.test.js`, `tests/eras.test.js` (era1 assertions)

**Interfaces:**
- Consumes: `MEMORY_TEXTURES`, `OBJECT_TEXTURES` (Task 5 — safe in node tests, no Phaser import).
- Produces the **era config schema v2** every era file and EraScene follow:
  ```js
  {
    key, name, next, tint, map, spawn,          // Phase 1 fields, unchanged
    intro?: page[],                              // optional era-opening dialogue
    objective: { type: 'interact', target: {x,y}, texture, found: page[] }
             | { type: 'reach', zone: {x,y,w,h} },
    memory: { id, name, texture, x, y, scene: page[] },   // REQUIRED
    npcs?: [{ name, x, y, axis: 'h'|'v', range, line, attribution }],
    harley?: { x, y },                           // era 4 only
    weather?: 'rain',                            // era 3 only
  }
  ```
  (`page` is the Task 2 dialogue page shape.) `validateEraConfig` now also requires `objective` + `memory` and checks: objective type is `interact`/`reach`; interact target in bounds; reach zone fully in bounds; memory tile in bounds **and walkable**; every NPC and `harley` on a walkable tile.

- [ ] **Step 1: Update `tests/validate.test.js`** — extend `tinyValidConfig()` and add cases. New `tinyValidConfig` (replace the old one; the 3×3 map has one walkable tile at (1,1)):

```js
function tinyValidConfig() {
  return {
    key: 'test-era',
    name: 'Test Era',
    next: null,
    tint: 0xffffff,
    map: {
      tileSize: 16,
      data: [
        [1, 1, 1],
        [1, 0, 1],
        [1, 1, 1],
      ],
      collision: [1],
    },
    spawn: { x: 1, y: 1 },
    objective: { type: 'reach', zone: { x: 1, y: 1, w: 1, h: 1 } },
    memory: { id: 'test', name: 'Test memory', texture: 'memory-era1', x: 1, y: 1, scene: [{ speaker: null, lines: ['x'] }] },
  };
}
```

Append new cases to the describe block (existing cases stay and must still pass):

```js
  it('throws when objective is missing', () => {
    const config = tinyValidConfig();
    delete config.objective;
    expect(() => validateEraConfig(config)).toThrow('missing "objective"');
  });

  it('throws on an unknown objective type', () => {
    const config = tinyValidConfig();
    config.objective = { type: 'puzzle' };
    expect(() => validateEraConfig(config)).toThrow('objective.type');
  });

  it('throws when a reach zone leaks out of bounds', () => {
    const config = tinyValidConfig();
    config.objective = { type: 'reach', zone: { x: 1, y: 1, w: 9, h: 1 } };
    expect(() => validateEraConfig(config)).toThrow('zone');
  });

  it('throws when an interact target is out of bounds', () => {
    const config = tinyValidConfig();
    config.objective = { type: 'interact', target: { x: 9, y: 9 }, texture: 't', found: [] };
    expect(() => validateEraConfig(config)).toThrow('target');
  });

  it('throws when the memory sits on a collision tile', () => {
    const config = tinyValidConfig();
    config.memory.x = 0;
    config.memory.y = 0;
    expect(() => validateEraConfig(config)).toThrow('memory');
  });

  it('throws when an NPC stands on a wall', () => {
    const config = tinyValidConfig();
    config.npcs = [{ name: 'X', x: 0, y: 1, axis: 'h', range: 1, line: 'hi', attribution: null }];
    expect(() => validateEraConfig(config)).toThrow('NPC');
  });

  it('throws when harley stands on a wall', () => {
    const config = tinyValidConfig();
    config.harley = { x: 2, y: 2 };
    expect(() => validateEraConfig(config)).toThrow('harley');
  });
```

- [ ] **Step 2: Run `npm test`** — expected: FAIL — the new required fields blow up `tinyValidConfig` acceptance and/or the new cases don't throw yet. (`tests/eras.test.js` will also fail: era1 lacks `objective`/`memory` — fixed in Step 4.)

- [ ] **Step 3: Extend `src/eras/validate.js`** — change the required-fields list and append checks before `return true`:

```js
  for (const field of ['key', 'name', 'next', 'tint', 'map', 'spawn', 'objective', 'memory']) {
    if (!(field in config)) throw new Error(`${label}: missing "${field}"`);
  }
```

Append before `return true;`:

```js
  const inBounds = (px, py) =>
    Number.isInteger(px) && Number.isInteger(py) && px >= 0 && py >= 0 && px < cols && py < data.length;
  const walkable = (px, py) => inBounds(px, py) && !collision.includes(data[py][px]);

  const { objective, memory } = config;
  if (objective.type === 'interact') {
    if (!inBounds(objective.target?.x, objective.target?.y)) {
      throw new Error(`${label}: objective target is out of bounds`);
    }
  } else if (objective.type === 'reach') {
    const z = objective.zone;
    if (!z || !inBounds(z.x, z.y) || !inBounds(z.x + z.w - 1, z.y + z.h - 1)) {
      throw new Error(`${label}: objective zone is out of bounds`);
    }
  } else {
    throw new Error(`${label}: objective.type must be "interact" or "reach"`);
  }

  if (!walkable(memory.x, memory.y)) {
    throw new Error(`${label}: memory must sit on a walkable tile`);
  }
  for (const npc of config.npcs ?? []) {
    if (!walkable(npc.x, npc.y)) {
      throw new Error(`${label}: NPC "${npc.name}" must stand on a walkable tile`);
    }
  }
  if (config.harley && !walkable(config.harley.x, config.harley.y)) {
    throw new Error(`${label}: harley must stand on a walkable tile`);
  }
```

- [ ] **Step 4: Replace `src/eras/era1-childhood.js`** with the full v2 config:

```js
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
```

- [ ] **Step 5: Run `npm test`** — expected: PASS — validate suite green, eras suite green (era1 satisfies schema v2).

- [ ] **Step 6: Commit**

```bash
git add src/eras/validate.js src/eras/era1-childhood.js tests/validate.test.js
git commit -m "feat: era config schema v2 (objective, memory, npcs) + full era 1 config" -m "Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 7: Eras 2–4 configs + shared hill layout

**Files:**
- Create: `src/eras/hillMap.js`
- Create: `src/eras/era2-young-love.js`
- Create: `src/eras/era3-drift.js`
- Create: `src/eras/era4-now.js`
- Modify: `src/eras/index.js`
- Test: `tests/eras.test.js`

**Interfaces:**
- Consumes: `buildMapData`/`wallRect` (Task 4), schema v2 (Task 6), `MEMORY_TEXTURES` (Task 5).
- Produces: `ERAS = [era1, era2, era3, era4]`; `hillMap.js` exports `HILL_WALLS` (terraced hill used by eras 2 & 4), `HILL_SPAWN = { x: 4, y: 17 }`, `SUMMIT_ZONE = { x: 12, y: 1, w: 6, h: 3 }`. The hill path: bottom band → gap at x20–22 (row 14) → middle band → gap at x6–8 (row 9) → upper band → gap at x15–16 (row 5) → summit.

- [ ] **Step 1: Add failing tests to `tests/eras.test.js`** (append to the describe block):

```js
  it('registers all four eras in chronological order', () => {
    expect(ERAS.map((e) => e.key)).toEqual(['era1', 'era2', 'era3', 'era4']);
  });

  it('chains era1 → era2 → era3 → era4 → ending (BR-1)', () => {
    expect(ERAS.map((e) => e.next)).toEqual(['era2', 'era3', 'era4', null]);
  });

  it('gives every era a unique memory id matching its key (BR-2)', () => {
    expect(ERAS.map((e) => e.memory.id)).toEqual(['era1', 'era2', 'era3', 'era4']);
  });

  it('puts Harley on the hill in era 4 only', () => {
    expect(ERAS.filter((e) => e.harley).map((e) => e.key)).toEqual(['era4']);
  });

  it('rains only in the drift', () => {
    expect(ERAS.filter((e) => e.weather === 'rain').map((e) => e.key)).toEqual(['era3']);
  });

  it('reuses the same hill layout for eras 2 and 4 (relit, not redrawn)', () => {
    const era2 = getEraConfig('era2');
    const era4 = getEraConfig('era4');
    expect(era4.map.data).toEqual(era2.map.data);
    expect(era4.tint).not.toBe(era2.tint);
  });
```

- [ ] **Step 2: Run `npm test`** — expected: FAIL (only era1 registered).

- [ ] **Step 3: Write `src/eras/hillMap.js`**

```js
// The hill overlooking the city — shared by era 2 (golden) and era 4 (sunset).
// Same place, relit: one layout, two tints (spec §3, recurring-hill note).
function terrace(y, gaps) {
  const walls = [];
  for (let x = 1; x < 29; x++) {
    if (!gaps.includes(x)) walls.push([x, y]);
  }
  return walls;
}

// Three terraces with staggered gaps — a short zigzag climb, never a maze.
export const HILL_WALLS = [
  ...terrace(14, [20, 21, 22]),
  ...terrace(9, [6, 7, 8]),
  ...terrace(5, [15, 16]),
];

export const HILL_SPAWN = { x: 4, y: 17 };
export const SUMMIT_ZONE = { x: 12, y: 1, w: 6, h: 3 };
```

- [ ] **Step 4: Write `src/eras/era2-young-love.js`**

```js
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
    // TODO: Harley writes this (memory scene text).
    scene: [{ speaker: null, lines: ['[ MEMORY: First real love ]', '[ Harley writes this ]'] }],
  },

  npcs: [
    // TODO: Harley writes these lines.
    { name: 'Townsperson', x: 10, y: 16, axis: 'h', range: 3, line: '[ NPC LINE — Harley writes this ]', attribution: null },
    { name: 'Townsperson', x: 12, y: 7, axis: 'h', range: 2, line: '[ NPC LINE — Harley writes this ]', attribution: null },
  ],
};
```

- [ ] **Step 5: Write `src/eras/era3-drift.js`**

```js
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
    // TODO: Harley writes this (memory scene text).
    scene: [{ speaker: null, lines: ['[ MEMORY: I never stopped', 'finding my way back ]', '[ Harley writes this ]'] }],
  },

  npcs: [], // emptiness is the point (level design spec, era 3)
};
```

- [ ] **Step 6: Write `src/eras/era4-now.js`**

```js
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
    // TODO: Harley writes this (the final dialogue moment — UC-15).
    scene: [{ speaker: 'Harley', lines: ['[ FINAL WORDS ON THE HILL ]', '[ Harley writes this ]'] }],
  },

  npcs: [
    // TODO: Harley writes these lines.
    { name: 'Townsperson', x: 8, y: 12, axis: 'h', range: 3, line: '[ NPC LINE — Harley writes this ]', attribution: null },
    { name: 'Townsperson', x: 20, y: 16, axis: 'h', range: 2, line: '[ NPC LINE — Harley writes this ]', attribution: null },
  ],
};
```

- [ ] **Step 7: Update `src/eras/index.js`**

```js
import { era1 } from './era1-childhood.js';
import { era2 } from './era2-young-love.js';
import { era3 } from './era3-drift.js';
import { era4 } from './era4-now.js';

// Ordered, chronological (BR-1). Adding an era = a config file + one line here.
export const ERAS = [era1, era2, era3, era4];

export function getEraConfig(key) {
  const era = ERAS.find((e) => e.key === key);
  if (!era) throw new Error(`Unknown era "${key}"`);
  return era;
}
```

- [ ] **Step 8: Run `npm test`** — expected: PASS — every era passes schema v2 validation, all new chain/uniqueness/hill-reuse assertions green.

- [ ] **Step 9: Commit**

```bash
git add src/eras/ tests/eras.test.js
git commit -m "feat: add eras 2-4 configs with shared hill layout and rainy street (UC-5 data)" -m "Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 8: DialogueBox UI + EraScene interaction & dialogue (UC-8, UC-9)

**Files:**
- Create: `src/ui/DialogueBox.js`
- Modify: `src/scenes/EraScene.js` (full replace below)

**Interfaces:**
- Consumes: `createDialogue`/`currentPage`/`advanceDialogue` (Task 2), `findTarget` (Task 3), era `intro` pages (Task 6).
- Produces:
  - `new DialogueBox(scene)` → `.open(pages, onDone?)`, `.advance()`, `.isOpen()`. Bottom-anchored Pokémon-style box: dark panel, light border, pink speaker name, white 8px body lines, grey italic right-aligned attribution, `>` more-hint. Scenes forward Space/Enter to `.advance()`; `onDone` fires when the last page is dismissed. EndScene (Task 11) reuses this class unchanged.
  - EraScene properties later tasks build on: `this.interactables` (array of `{ x, y, sprite, onInteract }`), `this.facing`, `this.dialogueBox`, `this.keys` (WASD + SPACE + ENTER), `this.playerTile()`, `this.interactPressed()`, and an explore-vs-dialogue mode split in `update()`.

- [ ] **Step 1: Write `src/ui/DialogueBox.js`**

```js
import { COLORS, HEX, FONT, GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { createDialogue, currentPage, advanceDialogue } from '../dialogue.js';

const BOX_HEIGHT = 84;

// UC-9: Pokémon-style dialogue box. Pure rendering over src/dialogue.js state —
// the owning scene forwards Space/Enter to advance().
export default class DialogueBox {
  constructor(scene) {
    this.scene = scene;
    this.dialogue = null;
    this.onDone = null;

    const top = GAME_HEIGHT - BOX_HEIGHT;
    this.root = scene.add.container(0, top).setDepth(20).setVisible(false);

    const bg = scene.add.rectangle(4, 4, GAME_WIDTH - 8, BOX_HEIGHT - 8, HEX.PANEL, 0.95)
      .setOrigin(0)
      .setStrokeStyle(2, HEX.PANEL_BORDER);
    this.speaker = scene.add.text(14, 12, '', {
      fontFamily: FONT, fontSize: '8px', color: COLORS.PINK_SOFT,
    });
    this.body = scene.add.text(14, 28, '', {
      fontFamily: FONT, fontSize: '8px', color: COLORS.WHITE, lineSpacing: 6,
    });
    this.attribution = scene.add.text(GAME_WIDTH - 14, BOX_HEIGHT - 24, '', {
      fontFamily: FONT, fontSize: '7px', color: '#9a9ab0', fontStyle: 'italic',
    }).setOrigin(1, 1);
    this.more = scene.add.text(GAME_WIDTH - 14, BOX_HEIGHT - 10, '>', {
      fontFamily: FONT, fontSize: '8px', color: COLORS.PINK_SOFT,
    }).setOrigin(1, 1);

    this.root.add([bg, this.speaker, this.body, this.attribution, this.more]);
  }

  open(pages, onDone = null) {
    this.dialogue = createDialogue(pages);
    this.onDone = onDone;
    this.render();
    this.root.setVisible(true);
  }

  advance() {
    if (!this.isOpen()) return;
    this.dialogue = advanceDialogue(this.dialogue);
    if (this.dialogue.done) {
      this.root.setVisible(false);
      const done = this.onDone;
      this.dialogue = null;
      this.onDone = null;
      done?.();
      return;
    }
    this.render();
  }

  isOpen() {
    return this.dialogue !== null;
  }

  render() {
    const page = currentPage(this.dialogue);
    this.speaker.setText(page.speaker ?? '');
    this.body.setText(page.lines.join('\n'));
    this.attribution.setText(page.attribution ? `— ${page.attribution}` : '');
  }
}
```

- [ ] **Step 2: Replace `src/scenes/EraScene.js`** (full file — adds facing state, interactables, prompt, dialogue mode, era intro; drops the Phase 1 dev-aid era label as planned):

```js
import Phaser from 'phaser';
import {
  SCENES, COLORS, FONT, TILE_SIZE, OUTFIT_TINTS, PLAYER_SPEED,
} from '../constants.js';
import { getEraConfig } from '../eras/index.js';
import { validateEraConfig } from '../eras/validate.js';
import { PLAYER_TEXTURES } from '../placeholders.js';
import { resolveDirection } from '../movement.js';
import { findTarget } from '../interaction.js';
import DialogueBox from '../ui/DialogueBox.js';

// UC-5..UC-14: the reusable era engine. One scene, four data configs —
// an era is DATA; never subclass or fork this scene per era.
export default class EraScene extends Phaser.Scene {
  constructor() { super(SCENES.ERA); }

  init(data) {
    this.eraKey = data.eraKey ?? 'era1';
  }

  create() {
    const era = getEraConfig(this.eraKey);
    validateEraConfig(era);
    this.era = era;
    this.facing = 'down';
    this.interactables = [];

    this.cameras.main.fadeIn(300, 13, 13, 26);

    // --- map (UC-5) ---
    const map = this.make.tilemap({
      data: era.map.data,
      tileWidth: era.map.tileSize,
      tileHeight: era.map.tileSize,
    });
    const tileset = map.addTilesetImage('tiles');
    this.layer = map.createLayer(0, tileset, 0, 0);
    this.layer.forEachTile((tile) => { tile.tint = era.tint; });

    // --- player (UC-5/6/7) ---
    const spawnX = era.spawn.x * TILE_SIZE + TILE_SIZE / 2;
    const spawnY = era.spawn.y * TILE_SIZE + TILE_SIZE / 2;
    this.player = this.physics.add.sprite(spawnX, spawnY, PLAYER_TEXTURES.down);
    const runState = this.registry.get('runState');
    if (runState?.outfit) this.player.setTint(OUTFIT_TINTS[runState.outfit]);

    this.player.body.setSize(12, 12).setOffset(2, 20);
    this.layer.setCollision(era.map.collision);
    this.physics.add.collider(this.player, this.layer);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.player.setCollideWorldBounds(true);

    // --- input (UC-6 + UC-8) ---
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D,SPACE,ENTER');

    // --- interaction prompt (UC-8) ---
    this.prompt = this.add.text(0, 0, 'SPACE', {
      fontFamily: FONT, fontSize: '7px', color: COLORS.WHITE, backgroundColor: '#1a1a2e',
      padding: { x: 2, y: 2 },
    }).setOrigin(0.5, 1).setDepth(15).setVisible(false);

    // --- dialogue (UC-9) ---
    this.dialogueBox = new DialogueBox(this);
    if (era.intro) this.dialogueBox.open(era.intro);

    // TODO(Phase 3): era music from Harley's playlist starts here.
  }

  // Feet-center tile: the 12x12 feet box sits at offset (2,20) of the 16x32 sprite,
  // so its center is 10px below the sprite center.
  playerTile() {
    return {
      tileX: Math.floor(this.player.x / TILE_SIZE),
      tileY: Math.floor((this.player.y + 10) / TILE_SIZE),
      facing: this.facing,
    };
  }

  interactPressed() {
    return (
      Phaser.Input.Keyboard.JustDown(this.keys.SPACE) ||
      Phaser.Input.Keyboard.JustDown(this.keys.ENTER)
    );
  }

  update() {
    // Dialogue mode: world frozen, Space/Enter pages through (UC-9).
    if (this.dialogueBox.isOpen()) {
      this.player.setVelocity(0, 0);
      this.prompt.setVisible(false);
      if (this.interactPressed()) this.dialogueBox.advance();
      return;
    }

    // Explore mode: movement (UC-6) ...
    const pressed = {
      left: this.cursors.left.isDown || this.keys.A.isDown,
      right: this.cursors.right.isDown || this.keys.D.isDown,
      up: this.cursors.up.isDown || this.keys.W.isDown,
      down: this.cursors.down.isDown || this.keys.S.isDown,
    };
    const { vx, vy, facing } = resolveDirection(pressed);
    this.player.setVelocity(vx * PLAYER_SPEED, vy * PLAYER_SPEED);
    if (facing) {
      this.facing = facing;
      this.player.setTexture(PLAYER_TEXTURES[facing]);
    }

    // ... and targeting (UC-8): prompt over the faced interactable.
    const target = findTarget(this.playerTile(), this.interactables);
    if (target) {
      this.prompt.setPosition(target.sprite.x, target.sprite.y - 20).setVisible(true);
      if (this.interactPressed()) target.onInteract();
    } else {
      this.prompt.setVisible(false);
    }
  }
}
```

- [ ] **Step 3: Run `npm test`** — expected: PASS (no test imports scenes).

- [ ] **Step 4: Verify in the browser (use the `verify` skill)**
1. Title → outfit → Era 1 loads; the intro dialogue box is open at the bottom: dark panel, light border, `[ ERA 1 INTRO — Harley writes this ]` in white pixel text.
2. While the box is open, arrow keys do nothing (world frozen). Space dismisses it.
3. The note placeholder is visible on the front-row desk at tile (13,6); walking below it and facing up shows the small `SPACE` prompt above it.
4. Pressing Space on the note opens `[ THE NOTE — Harley writes this ]`; dismissing returns to explore mode.
5. No era-name label in the corner anymore. Zero console errors.

- [ ] **Step 5: Commit**

```bash
git add src/ui/DialogueBox.js src/scenes/EraScene.js
git commit -m "feat: add interaction system and Pokemon-style dialogue box (UC-8, UC-9)" -m "Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 9: NPCs — patrol and talk (UC-10)

**Files:**
- Modify: `src/scenes/EraScene.js`

**Interfaces:**
- Consumes: era `npcs` configs (Tasks 6–7), `NPC_TEXTURE` (Task 5), `this.interactables`/`this.dialogueBox` (Task 8).
- Produces: `this.npcs` — array of `{ sprite, entry, tween }`; each NPC patrols on a yoyo tween, is interactable at its **live** tile (entries refreshed every frame), pauses while talking, resumes on dismiss. Placeholder NPCs don't block the player (BR-3 flavor only; collision arrives with real sprites in Phase 3 if wanted).

- [ ] **Step 1: Extend `src/scenes/EraScene.js`** — add to the placeholders import:

```js
import { PLAYER_TEXTURES, NPC_TEXTURE } from '../placeholders.js';
```

In `create()`, after the dialogue block, add:

```js
    // --- NPCs (UC-10): optional flavor, never required to progress (BR-3) ---
    this.npcs = [];
    for (const npcCfg of era.npcs ?? []) this.spawnNpc(npcCfg);
```

Add these methods to the class:

```js
  spawnNpc(cfg) {
    const startX = cfg.x * TILE_SIZE + TILE_SIZE / 2;
    const startY = cfg.y * TILE_SIZE + TILE_SIZE / 2;
    const sprite = this.add.sprite(startX, startY, NPC_TEXTURE);

    // Short back-and-forth patrol along one axis. Placeholder NPCs don't
    // collide with the player; they're flavor, not obstacles.
    const prop = cfg.axis === 'h' ? 'x' : 'y';
    const tween = this.tweens.add({
      targets: sprite,
      [prop]: (cfg.axis === 'h' ? startX : startY) + cfg.range * TILE_SIZE,
      duration: cfg.range * 900,
      yoyo: true,
      repeat: -1,
      ease: 'Linear',
    });

    const entry = { x: cfg.x, y: cfg.y, sprite, onInteract: () => this.talkTo(cfg, tween) };
    this.interactables.push(entry);
    this.npcs.push({ sprite, entry, tween });
  }

  talkTo(cfg, tween) {
    tween.pause(); // NPC stops (facing swap arrives with real sprites, Phase 3)
    const pages = [{ speaker: cfg.name, lines: [cfg.line], attribution: cfg.attribution ?? null }];
    this.dialogueBox.open(pages, () => tween.resume());
  }
```

At the **top of `update()`** (before the dialogue-mode check), refresh live NPC tiles:

```js
    for (const { sprite, entry } of this.npcs) {
      entry.x = Math.floor(sprite.x / TILE_SIZE);
      entry.y = Math.floor((sprite.y + 10) / TILE_SIZE);
    }
```

- [ ] **Step 2: Run `npm test`** — expected: PASS (unchanged).

- [ ] **Step 3: Verify in the browser (use the `verify` skill)**
1. Era 1 shows two grey classmates: one pacing vertically near the left desks, one horizontally lower-right.
2. Standing in a patroller's path and facing it shows the `SPACE` prompt tracking the NPC.
3. Space: the NPC stops; box shows `Classmate` in pink and `[ NPC LINE — Harley writes this ]`.
4. Dismiss: the NPC resumes exactly where it paused.
5. NPCs never open dialogue on their own; walking past without Space does nothing. Zero console errors.

- [ ] **Step 4: Commit**

```bash
git add src/scenes/EraScene.js
git commit -m "feat: add patrolling, talkable NPCs (UC-10)" -m "Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 10: Objectives, memory collection, tracker, era advancement (UC-11..UC-14)

**Files:**
- Modify: `src/constants.js` (add `SCENES.END`)
- Modify: `tests/constants.test.js`
- Create: `src/scenes/EndScene.js` (thin shell — full in Task 11)
- Modify: `src/main.js` (register EndScene)
- Modify: `src/scenes/EraScene.js`

**Interfaces:**
- Consumes: `inZone` (Task 3), `addMemory` (Task 1), era `objective`/`memory`/`harley`/`weather` (Tasks 6–7), `HARLEY_TEXTURE`/`MEMORY_TEXTURES` (Task 5), `ERAS` (Task 7).
- Produces: the full per-era loop — objective completes → memory revealed (bobbing icon; above Harley in era 4) → interact → float-up cue → memory scene dialogue → `addMemory` → tracker updates (4 corner icons, dim → lit) → fade → next era, or `SCENES.END` when `era.next === null`. Also `SCENES.END = 'EndScene'` and rain in era 3.

- [ ] **Step 1: Failing test — `SCENES.END`.** In `tests/constants.test.js`, update the scene-keys assertion:

```js
    expect(SCENES).toEqual({
      BOOT: 'BootScene',
      TITLE: 'TitleScene',
      OUTFIT: 'OutfitScene',
      ERA: 'EraScene',
      END: 'EndScene',
    });
```

Run `npm test` — expected: FAIL. Then add to `SCENES` in `src/constants.js`:

```js
  END: 'EndScene',
```

Run `npm test` — expected: PASS.

- [ ] **Step 2: EndScene shell + registration.** Create `src/scenes/EndScene.js`:

```js
import Phaser from 'phaser';
import { SCENES, COLORS, FONT, GAME_WIDTH, GAME_HEIGHT } from '../constants.js';

// UC-15/16 shell — the full ending lands in Task 11.
export default class EndScene extends Phaser.Scene {
  constructor() { super(SCENES.END); }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.NAVY);
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'ENDING — Task 11', {
      fontFamily: FONT, fontSize: '10px', color: COLORS.WHITE,
    }).setOrigin(0.5);
  }
}
```

In `src/main.js`: `import EndScene from './scenes/EndScene.js';` and change the registry line to

```js
  scene: [BootScene, TitleScene, OutfitScene, EraScene, EndScene],
```

- [ ] **Step 3: Extend `src/scenes/EraScene.js`.** Update imports:

```js
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js'; // merge into the existing constants import
import { findTarget, inZone } from '../interaction.js';
import { PLAYER_TEXTURES, NPC_TEXTURE, HARLEY_TEXTURE } from '../placeholders.js';
import { ERAS } from '../eras/index.js'; // merge into the existing eras import line
import { addMemory } from '../state.js';
```

In `create()`, after the NPC block, add:

```js
    // --- objective + memory + tracker (UC-11..13) ---
    this.objectiveDone = false;
    this.memoryCollected = false;
    this.setupObjective();
    this.buildTracker();

    // Era 4: Harley waits at the summit (UC-15).
    if (era.harley) {
      this.harleySprite = this.add.sprite(
        era.harley.x * TILE_SIZE + TILE_SIZE / 2,
        era.harley.y * TILE_SIZE + TILE_SIZE / 2,
        HARLEY_TEXTURE,
      ).setDepth(5);
    }

    if (era.weather === 'rain') this.startRain();
```

Add these methods:

```js
  setupObjective() {
    const obj = this.era.objective;
    if (obj.type !== 'interact') return; // 'reach' zones are polled in update()
    const sprite = this.add.image(
      obj.target.x * TILE_SIZE + TILE_SIZE / 2,
      obj.target.y * TILE_SIZE + TILE_SIZE / 2,
      obj.texture,
    ).setDepth(5);
    this.interactables.push({
      x: obj.target.x,
      y: obj.target.y,
      sprite,
      onInteract: () => {
        if (this.objectiveDone) return;
        this.dialogueBox.open(obj.found, () => this.completeObjective());
      },
    });
  }

  completeObjective() {
    if (this.objectiveDone) return;
    this.objectiveDone = true;
    this.revealMemory();
  }

  revealMemory() {
    const m = this.era.memory;
    const x = m.x * TILE_SIZE + TILE_SIZE / 2;
    // In era 4 the icon floats above waiting Harley instead of sitting on the floor.
    const y = this.harleySprite
      ? this.harleySprite.y - 26
      : m.y * TILE_SIZE + TILE_SIZE / 2;

    this.memorySprite = this.add.image(x, y, m.texture).setDepth(6).setAlpha(0);
    this.tweens.add({ targets: this.memorySprite, alpha: 1, duration: 400 });
    this.tweens.add({
      targets: this.memorySprite, y: y - 3, duration: 700,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
    this.interactables.push({ x: m.x, y: m.y, sprite: this.memorySprite, onInteract: () => this.collectMemory() });
  }

  collectMemory() {
    if (this.memoryCollected) return;
    this.memoryCollected = true;
    const m = this.era.memory;

    // Collection cue: the icon floats up and fades (UC-12).
    // TODO(Phase 3): collection SFX.
    this.tweens.add({
      targets: this.memorySprite, y: this.memorySprite.y - 24, alpha: 0,
      duration: 700, ease: 'Sine.easeIn',
    });

    this.dialogueBox.open(m.scene, () => {
      const runState = addMemory(this.registry.get('runState'), m.id);
      this.registry.set('runState', runState);
      this.updateTracker(runState.memories.length);
      this.time.delayedCall(500, () => this.advance());
    });
  }

  // UC-13: four corner icons, dim until collected.
  buildTracker() {
    this.trackerIcons = ERAS.map((era, i) =>
      this.add.image(GAME_WIDTH - 66 + i * 18, 12, era.memory.texture).setDepth(10).setAlpha(0.25));
    this.updateTracker(this.registry.get('runState').memories.length);
  }

  updateTracker(count) {
    this.trackerIcons.forEach((icon, i) => icon.setAlpha(i < count ? 1 : 0.25));
  }

  // UC-14: fade to the next era, or the ending after the last (UC-16).
  advance() {
    this.cameras.main.fadeOut(400, 13, 13, 26);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      if (this.era.next) this.scene.start(SCENES.ERA, { eraKey: this.era.next });
      else this.scene.start(SCENES.END);
    });
  }

  // Era 3's grey rain: thin falling streaks. Placeholder-grade on purpose.
  startRain() {
    for (let i = 0; i < 60; i++) {
      const drop = this.add.rectangle(
        Phaser.Math.Between(0, GAME_WIDTH),
        Phaser.Math.Between(-GAME_HEIGHT, 0),
        1, 6, 0xcfd6e6, 0.6,
      ).setDepth(8);
      this.tweens.add({
        targets: drop,
        y: GAME_HEIGHT + 8,
        duration: Phaser.Math.Between(600, 1100),
        repeat: -1,
        delay: Phaser.Math.Between(0, 800),
      });
    }
  }
```

At the **end of `update()`** (explore mode, after the targeting block), poll reach zones:

```js
    if (!this.objectiveDone && this.era.objective.type === 'reach') {
      const { tileX, tileY } = this.playerTile();
      if (inZone(tileX, tileY, this.era.objective.zone)) this.completeObjective();
    }
```

- [ ] **Step 4: Run `npm test`** — expected: PASS (constants suite updated, rest unchanged).

- [ ] **Step 5: Verify the full loop in the browser (use the `verify` skill)**
1. Era 1: tracker shows 4 dim icons top-right. Read the note → memory icon fades in bobbing at the classroom front → interact → icon floats up, memory scene text shows → tracker icon 1 lights → fade → Era 2.
2. Era 2 (golden hill): zigzag up through the three terrace gaps; entering the summit reveals the memory; collect → tracker 2 lit → Era 3.
3. Era 3 (rainy street): grey-blue tint, rain streaks falling, no NPCs; cross right → memory reveals → collect → Era 4.
4. Era 4 (sunset hill, same layout as 2): Harley stands at the summit; reaching the summit floats the memory icon above her; interacting plays the final placeholder dialogue (speaker `Harley`) → tracker 4 lit → fade → `ENDING — Task 11` shell.
5. Tracker carries across eras (2 lit icons on entering Era 3, etc.). Zero console errors.

- [ ] **Step 6: Commit**

```bash
git add src/constants.js tests/constants.test.js src/scenes/ src/main.js
git commit -m "feat: era objectives, memory collection, tracker, and era advancement (UC-11..UC-14)" -m "Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 11: EndScene — montage, sunset, message, Play Again (UC-15, UC-16)

**Files:**
- Modify: `src/scenes/EndScene.js` (replace the shell entirely)

**Interfaces:**
- Consumes: `ERAS` (Task 7 — montage pulls each `era.memory`), `DialogueBox` (Task 8), `PLAYER_TEXTURES`/`HARLEY_TEXTURE` (Task 5), `createRunState` (Phase 1), `OUTFIT_TINTS`.
- Produces: the ending sequence — memory montage → sunset pan → Harley's message (placeholder until Task 12) → both sprites together → `[ PLAY AGAIN ]` → reset runState → TitleScene (BR-7: fresh every play).

- [ ] **Step 1: Replace `src/scenes/EndScene.js`**

```js
import Phaser from 'phaser';
import {
  SCENES, COLORS, FONT, GAME_WIDTH, GAME_HEIGHT, OUTFIT_TINTS,
} from '../constants.js';
import { ERAS } from '../eras/index.js';
import { PLAYER_TEXTURES, HARLEY_TEXTURE } from '../placeholders.js';
import { createRunState } from '../state.js';
import DialogueBox from '../ui/DialogueBox.js';

// UC-16: montage → sunset pan → Harley's message → the two of them → Play Again.
export default class EndScene extends Phaser.Scene {
  constructor() { super(SCENES.END); }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.NAVY);
    this.cameras.main.fadeIn(400, 13, 13, 26);
    this.keys = this.input.keyboard.addKeys('SPACE,ENTER');
    this.box = null;
    // TODO(Phase 3): ending song from Harley's playlist starts here.
    this.playMontage();
  }

  update() {
    if (this.box?.isOpen()) {
      const pressed =
        Phaser.Input.Keyboard.JustDown(this.keys.SPACE) ||
        Phaser.Input.Keyboard.JustDown(this.keys.ENTER);
      if (pressed) this.box.advance();
    }
  }

  // 1) The four memories replay as a small constellation.
  playMontage() {
    const title = this.add.text(GAME_WIDTH / 2, 48, 'FOUR MEMORIES', {
      fontFamily: FONT, fontSize: '12px', color: COLORS.PINK_SOFT,
    }).setOrigin(0.5);

    const items = [title];
    ERAS.forEach((era, i) => {
      const x = GAME_WIDTH / 2 + (i - 1.5) * 100;
      const icon = this.add.image(x, 140, era.memory.texture).setScale(2).setAlpha(0);
      const label = this.add.text(x, 166, era.memory.name, {
        fontFamily: FONT, fontSize: '7px', color: COLORS.WHITE,
        align: 'center', wordWrap: { width: 92 },
      }).setOrigin(0.5, 0).setAlpha(0);
      items.push(icon, label);
      this.tweens.add({ targets: [icon, label], alpha: 1, delay: 500 + i * 650, duration: 450 });
    });

    this.time.delayedCall(500 + 4 * 650 + 1000, () => {
      this.tweens.add({
        targets: items, alpha: 0, duration: 500,
        onComplete: () => this.playSunset(),
      });
    });
  }

  // 2) Placeholder pixel sunset pans up into view (real art in Phase 3).
  playSunset() {
    const bands = [0x2b1b4d, 0x7b2d5e, 0xc94f6d, 0xf2846b, 0xffc178];
    this.sky = this.add.container(0, GAME_HEIGHT);
    bands.forEach((color, i) => {
      this.sky.add(this.add.rectangle(0, i * 64, GAME_WIDTH, 64, color).setOrigin(0));
    });
    this.sky.add(this.add.circle(GAME_WIDTH / 2, 235, 26, 0xffe9a8)); // low sun
    this.sky.add(this.add.rectangle(0, 276, GAME_WIDTH, 44, 0x14101f).setOrigin(0)); // hill silhouette
    this.tweens.add({
      targets: this.sky, y: 0, duration: 2600, ease: 'Sine.easeInOut',
      onComplete: () => this.showMessage(),
    });
  }

  // 3) Harley's message — the most important text in the game.
  showMessage() {
    // TODO: Harley writes this (replaced at the Task 12 ending checkpoint).
    const pages = [
      { speaker: 'Harley', lines: ['[ ENDING MESSAGE ]', '[ Harley writes this ]'] },
    ];
    this.box = new DialogueBox(this);
    this.box.open(pages, () => this.showTogether());
  }

  // 4) Both of them on the hilltop, then a quiet Play Again (UC-16 / BR-7).
  showTogether() {
    const y = 262; // standing on the silhouette hilltop
    const alexei = this.add.sprite(GAME_WIDTH / 2 - 12, y, PLAYER_TEXTURES.down);
    const outfit = this.registry.get('runState')?.outfit;
    if (outfit) alexei.setTint(OUTFIT_TINTS[outfit]);
    this.add.sprite(GAME_WIDTH / 2 + 12, y, HARLEY_TEXTURE);

    const again = this.add.text(GAME_WIDTH - 8, GAME_HEIGHT - 8, '[ PLAY AGAIN ]', {
      fontFamily: FONT, fontSize: '8px', color: COLORS.PINK_MAUVE,
    }).setOrigin(1).setInteractive({ useHandCursor: true });

    again.on('pointerover', () => again.setColor(COLORS.WHITE));
    again.on('pointerout', () => again.setColor(COLORS.PINK_MAUVE));
    again.on('pointerdown', () => {
      again.disableInteractive();
      this.registry.set('runState', createRunState()); // BR-7: fresh every play
      this.cameras.main.fadeOut(400, 13, 13, 26);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.start(SCENES.TITLE);
      });
    });
  }
}
```

- [ ] **Step 2: Run `npm test`** — expected: PASS (unchanged).

- [ ] **Step 3: Verify in the browser (use the `verify` skill)** — full playthrough into the ending:
1. After era 4's memory: fade into `FOUR MEMORIES`; the four icons + names appear one by one, then fade.
2. Sunset bands pan up with sun and dark hilltop silhouette.
3. Message box: speaker `Harley`, placeholder message; Space advances.
4. Both sprites appear together on the hilltop (Alexei keeps the chosen outfit tint).
5. `[ PLAY AGAIN ]` sits quietly bottom-right; hover whitens; click fades to the title.
6. After Play Again: outfit selection is fresh, tracker fully dim in era 1 — nothing persisted (BR-7). Zero console errors.

- [ ] **Step 4: Commit**

```bash
git add src/scenes/EndScene.js
git commit -m "feat: add ending montage, sunset, message, and Play Again (UC-15, UC-16)" -m "Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 12: Harley text pass (era-by-era checkpoints)

**Files:**
- Modify: `src/eras/era1-childhood.js`, `era2-young-love.js`, `era3-drift.js`, `era4-now.js`, `src/scenes/EndScene.js`

**Interfaces:**
- Consumes: every `[ ... — Harley writes this ]` placeholder from Tasks 6, 7, 11.
- Produces: Harley's real text in the configs. **Process, per Harley's 2026-07-05 instruction ("give me an option of questions when they come up"):** five AskUserQuestion checkpoints — Era 1 (intro, note text, memory scene, 2 NPC lines), Era 2 (memory scene, 2 NPC lines), Era 3 (memory scene), Era 4 (final dialogue, 2 NPC lines), Ending (the personal message). Each question offers suggested framings as options (e.g. lyric vs. real line for NPCs, which playlist song to quote) with "Other" for Harley's own words. **Claude never invents the final text — options only frame the choice; the words that ship are Harley's picks or his typed text.** Any piece Harley defers stays a placeholder (that is a valid answer).

- [ ] **Step 1: Era 1 checkpoint** — ask, then edit `era1-childhood.js` (intro, `objective.found`, `memory.scene`, both NPC `line`/`attribution`).
- [ ] **Step 2: Era 2 checkpoint** — edit `era2-young-love.js`.
- [ ] **Step 3: Era 3 checkpoint** — edit `era3-drift.js`.
- [ ] **Step 4: Era 4 checkpoint** — edit `era4-now.js` (the final dialogue moment).
- [ ] **Step 5: Ending checkpoint** — edit `EndScene.js` `showMessage()` pages (may be multiple pages).
- [ ] **Step 6: `npm test`** — expected: PASS (text changes only). Spot-check each changed era in the browser (dialogue renders within the box; long lines wrapped by hand into `lines` entries of ~34 chars max at 8px).
- [ ] **Step 7: Commit**

```bash
git add src/eras/ src/scenes/EndScene.js
git commit -m "feat: add Harley's text across eras and ending" -m "Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 13: Phase 2 acceptance pass

**Files:**
- Modify: `tech-stack-dev-plan.md` (tick Phase 2 items; note it predates v2 where wording differs)

- [ ] **Step 1: Full regression** — `npm test`: all suites green (constants, state, dialogue, interaction, mapUtils, validate, eras, movement, placeholders). `npm run build`: completes clean.
- [ ] **Step 2: Full-flow acceptance (use the `verify` skill for evidence)** — one unbroken run: Title → Outfit → Era 1 (intro, note, NPCs, memory) → Era 2 (hill climb, memory) → Era 3 (rain crossing, memory) → Era 4 (Harley at the summit, final memory) → Ending (montage, sunset, message, both sprites) → Play Again → fresh title. Confirm: tracker progresses 1→4; refresh mid-game resets everything (BR-7); ~10-minute pacing feels right.
- [ ] **Step 3: Tick Phase 2 items in `tech-stack-dev-plan.md`**, flagging any wording that predates v2 rather than rewriting history.
- [ ] **Step 4: Commit and tag**

```bash
git add tech-stack-dev-plan.md
git commit -m "chore: complete Phase 2 core loop and ending (UC-8..UC-16)" -m "Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
git tag phase-2-core-loop
```

---

## Spec Coverage Notes

| Use case | Where implemented |
|---|---|
| UC-8 Interact | Task 3 (targeting logic) + Task 8 (prompt + Space/Enter wiring) |
| UC-9 Dialogue box | Task 2 (paging logic) + Task 8 (DialogueBox UI, speaker, attribution) |
| UC-10 NPC | Task 9 (patrol, stop, talk, resume); lines are Harley's via Task 12 |
| UC-11 Objective | Tasks 6–7 (per-era configs) + Task 10 (interact + reach handling) |
| UC-12 Memory | Task 1 (state) + Task 10 (reveal, collect cue, scene, store) |
| UC-13 Tracker | Task 10 (four corner icons, dim → lit) |
| UC-14 Advance | Task 10 (`advance()` — next era or ending) |
| UC-15 Final memory | Task 7 (era 4 config: Harley at summit) + Task 10 (icon above Harley) |
| UC-16 Ending | Task 11 (montage → sunset → message → together → Play Again) |

**Deliberate deferrals (marked TODO in code):** all music (Phase 3 — Harley's files), real sprites/tilesets/Tiled maps (Phase 3), walk-cycle animations (Phase 3), NPC facing swap on talk (Phase 3, needs real sprites), collection SFX (Phase 3). NPC/Harley placeholder sprites don't block movement (noted; revisit with real art if Harley wants Pokémon-style blocking).
