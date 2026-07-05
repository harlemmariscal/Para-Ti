# Para Ti — Phase 1 Engine Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the playable engine shell for Para Ti — boot, title screen, outfit selection, and a data-driven EraScene where the player walks a placeholder single-screen map with collision (UC-1 through UC-7).

**Architecture:** A Vite + Phaser 3 app with four scenes (Boot → Title → Outfit → Era). All game logic that doesn't need a Phaser runtime (run state, era configs, map building, config validation, movement resolution, placeholder-texture generation) lives in pure ES modules under `src/`, unit-tested with Vitest. Scenes stay thin: they wire pure modules to Phaser and are verified manually in the browser. Eras are **data configs, not scenes** — one reusable `EraScene` reads a config object; adding an era later means adding a config file, never a scene.

**Tech Stack:** Phaser `^3.90.0`, Vite `^6.3.5`, Vitest `^3.2.4`, JavaScript ES modules (no TypeScript), Press Start 2P (Google Fonts). Node v24 is installed.

## Global Constraints

- **Spec:** `docs/superpowers/specs/2026-07-05-para-ti-v2-design.md` is the source of truth; use cases in `3_Use_Cases.md` (v2.1).
- **Desktop only.** Keyboard + mouse. No touch, no mobile layout.
- **JavaScript ES6+ only. No TypeScript.**
- **Internal resolution 480×320** (exactly 30×20 tiles at 16px), `Phaser.Scale.FIT` + `CENTER_BOTH`, `pixelArt: true`, `roundPixels: true`.
- **Tiles are 16×16; character sprites are 16×32.**
- **Title screen is sacred:** background `#0d0d1a`; `PARA TI` large white, upper third; `from harley` soft pink below it; `[ PLAY ]` darker pink/mauve, lower third; **Press Start 2P for all text in the game.** Exact pink hex values are provisional (`#f5b8c4` soft, `#b06a7f` mauve) — Harley verifies against his approved screenshot at the Task 6 checkpoint.
- **No save state.** Nothing persists; each page load starts fresh.
- **No personal content invented, ever.** Where personal content will eventually go, leave `// TODO: Harley writes this` (or `TODO(Phase N)`) comments. Music files are Harley's playlist and are wired in Phase 3 — this phase leaves clearly-marked hooks only.
- **Every commit leaves the app runnable** (`npm run dev` works, `npm test` passes).
- **Repo root is the project root** (`/Users/harlemmariscal/Desktop/para ti`) — `index.html` and `src/` live alongside the planning `.md` docs, per CLAUDE.md's target layout. The stray 86-byte `package-lock.json` at root gets overwritten by the real one during Task 1's `npm install`; that is expected.
- Commit messages end with: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>` (use a second `-m` flag).

## File Structure (end state of Phase 1)

```
para ti/
├── index.html                    ← HTML shell, font links, CSS reset
├── package.json                  ← scripts + deps
├── .gitignore
├── src/
│   ├── main.js                   ← Phaser config + scene registry + font-gate boot
│   ├── constants.js              ← sizes, speeds, scene keys, colors (single source)
│   ├── state.js                  ← run state (outfit, memories) — pure, tested
│   ├── movement.js               ← resolveDirection() — pure, tested
│   ├── placeholders.js           ← runtime placeholder textures — tested via mock
│   ├── eras/
│   │   ├── index.js              ← ERAS list + getEraConfig(key) — tested
│   │   ├── validate.js           ← validateEraConfig(config) — pure, tested
│   │   ├── mapUtils.js           ← buildMapData(cols, rows, extraWalls) — pure, tested
│   │   └── era1-childhood.js     ← Era 1 placeholder config (the classroom)
│   └── scenes/
│       ├── BootScene.js          ← UC-1: textures + run state, hands off to Title
│       ├── TitleScene.js         ← UC-2/UC-3: exact title layout, PLAY → Outfit
│       ├── OutfitScene.js        ← UC-4: 2 options, preview, confirm → Era
│       └── EraScene.js           ← UC-5/6/7: config-driven map, movement, collision
└── tests/
    ├── constants.test.js
    ├── state.test.js
    ├── mapUtils.test.js
    ├── validate.test.js
    ├── eras.test.js
    ├── movement.test.js
    └── placeholders.test.js
```

**Testing strategy:** Pure modules get real TDD with Vitest (node environment — test files must never import Phaser or scene files). Phaser scenes can't be meaningfully unit-tested without a heavyweight canvas shim, so each scene task ends with a precise manual browser verification checklist instead. Run `npm run dev` → http://localhost:5173.

---

### Task 1: Project Scaffold (Vite + Phaser + Vitest boots to a canvas)

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `index.html`
- Create: `src/constants.js`
- Create: `src/main.js`
- Test: `tests/constants.test.js`

**Interfaces:**
- Consumes: nothing (root task).
- Produces: `constants.js` exports used by every later task — `GAME_WIDTH: 480`, `GAME_HEIGHT: 320`, `TILE_SIZE: 16`, `PLAYER_SPEED: 100`, `SCENES: { BOOT: 'BootScene', TITLE: 'TitleScene', OUTFIT: 'OutfitScene', ERA: 'EraScene' }`, `COLORS` (CSS strings), `HEX` (numeric colors), `OUTFIT_TINTS: { casual, athletic }`, `FONT: '"Press Start 2P"'`. Also `npm run dev|build|test` scripts.

- [ ] **Step 1: Write the failing test**

Create `tests/constants.test.js`:

```js
import { describe, it, expect } from 'vitest';
import {
  GAME_WIDTH, GAME_HEIGHT, TILE_SIZE, PLAYER_SPEED, SCENES, COLORS, HEX, OUTFIT_TINTS, FONT,
} from '../src/constants.js';

describe('constants', () => {
  it('uses a 480x320 internal resolution that divides evenly into 16px tiles', () => {
    expect(GAME_WIDTH).toBe(480);
    expect(GAME_HEIGHT).toBe(320);
    expect(GAME_WIDTH % TILE_SIZE).toBe(0);
    expect(GAME_HEIGHT % TILE_SIZE).toBe(0);
  });

  it('defines all four Phase 1 scene keys', () => {
    expect(SCENES).toEqual({
      BOOT: 'BootScene',
      TITLE: 'TitleScene',
      OUTFIT: 'OutfitScene',
      ERA: 'EraScene',
    });
  });

  it('locks the sacred title-screen navy', () => {
    expect(COLORS.NAVY).toBe('#0d0d1a');
  });

  it('has a tint for each outfit option', () => {
    expect(Object.keys(OUTFIT_TINTS).sort()).toEqual(['athletic', 'casual']);
  });

  it('exports the pixel font family and a positive player speed', () => {
    expect(FONT).toBe('"Press Start 2P"');
    expect(PLAYER_SPEED).toBeGreaterThan(0);
    // Note: pink values are deliberately NOT pinned — Harley tunes them against
    // his approved screenshot at the Task 6 checkpoint. Only NAVY is sacred.
    expect(typeof HEX.PINK_SOFT).toBe('number');
  });
});
```

- [ ] **Step 2: Create `package.json` and `.gitignore`, install deps**

`package.json`:

```json
{
  "name": "para-ti",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "phaser": "^3.90.0"
  },
  "devDependencies": {
    "vite": "^6.3.5",
    "vitest": "^3.2.4"
  }
}
```

`.gitignore`:

```
node_modules/
dist/
.DS_Store
```

Run: `npm install`
Expected: completes without errors; real `package-lock.json` replaces the stray 86-byte one; `node_modules/` appears (ignored).

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '../src/constants.js'` (or equivalent resolve error).

- [ ] **Step 4: Write `src/constants.js`**

```js
// Single source of truth for sizes, keys, and colors.
export const GAME_WIDTH = 480;   // 30 tiles
export const GAME_HEIGHT = 320;  // 20 tiles
export const TILE_SIZE = 16;
export const PLAYER_SPEED = 100; // px/sec, 4-direction only

export const SCENES = {
  BOOT: 'BootScene',
  TITLE: 'TitleScene',
  OUTFIT: 'OutfitScene',
  ERA: 'EraScene',
};

// CSS color strings (for text styles / backgrounds).
export const COLORS = {
  NAVY: '#0d0d1a',       // sacred title background — do not change
  WHITE: '#ffffff',
  PINK_SOFT: '#f5b8c4',  // ⚠ verify against approved title screenshot (Task 6 checkpoint)
  PINK_MAUVE: '#b06a7f', // ⚠ verify against approved title screenshot (Task 6 checkpoint)
};

// Numeric colors (for tints, fills, strokes).
export const HEX = {
  NAVY: 0x0d0d1a,
  PINK_SOFT: 0xf5b8c4,
  PANEL: 0x1a1a2e,
  PANEL_BORDER: 0x50506a,
  FLOOR: 0x9bc86f,
  WALL: 0x50506a,
  BODY: 0x30304a,
};

// Placeholder outfit tints until Harley's real outfit sprites arrive (Phase 3).
export const OUTFIT_TINTS = {
  casual: 0xffd1dc,
  athletic: 0x9bd1ff,
};

export const FONT = '"Press Start 2P"';
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test`
Expected: PASS — 5 tests in `tests/constants.test.js`.

- [ ] **Step 6: Write `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Para Ti</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
      rel="stylesheet"
    />
    <style>
      html, body { margin: 0; height: 100%; background: #0d0d1a; }
      body { display: grid; place-items: center; }
      canvas { image-rendering: pixelated; }
    </style>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

- [ ] **Step 7: Write `src/main.js` (temporary scaffold scene — replaced in Task 6)**

```js
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, FONT } from './constants.js';

// Temporary proof-of-boot scene. Replaced by the real scene registry in Task 6.
class ScaffoldScene extends Phaser.Scene {
  create() {
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'PARA TI — ENGINE OK', {
      fontFamily: FONT,
      fontSize: '12px',
      color: COLORS.WHITE,
    }).setOrigin(0.5);
  }
}

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
  scene: [ScaffoldScene],
};

// Gate boot on the pixel font so no text ever renders in a fallback font.
const start = () => new Phaser.Game(config);
document.fonts.load(`16px ${FONT}`).then(start, start);
```

- [ ] **Step 8: Manual verification**

Run: `npm run dev` and open http://localhost:5173
Expected: navy page, centered game canvas, crisp `PARA TI — ENGINE OK` in Press Start 2P (blocky pixel letters — if it renders in a smooth default font, the font gate is broken). No console errors. Stop the server.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json .gitignore index.html src/constants.js src/main.js tests/constants.test.js
git commit -m "feat: scaffold Vite + Phaser 3 + Vitest engine shell" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: Run State Module (outfit + memories holder)

**Files:**
- Create: `src/state.js`
- Test: `tests/state.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces: `OUTFITS: ['casual', 'athletic']`; `createRunState() → { outfit: null, memories: [] }`; `setOutfit(state, outfit) → newState` (throws `Error('Invalid outfit "<x>"')` on unknown outfit; never mutates input). BootScene seeds this into the Phaser registry under key `'runState'`; OutfitScene calls `setOutfit`. `memories` stays empty until Phase 2 (UC-12).

- [ ] **Step 1: Write the failing test**

Create `tests/state.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { createRunState, setOutfit, OUTFITS } from '../src/state.js';

describe('createRunState', () => {
  it('starts with no outfit and no memories', () => {
    expect(createRunState()).toEqual({ outfit: null, memories: [] });
  });
});

describe('setOutfit', () => {
  it('returns a new state with the outfit set, without mutating the original', () => {
    const state = createRunState();
    const next = setOutfit(state, 'casual');
    expect(next.outfit).toBe('casual');
    expect(state.outfit).toBeNull();
    expect(next).not.toBe(state);
  });

  it('accepts every outfit in OUTFITS', () => {
    expect(OUTFITS).toEqual(['casual', 'athletic']);
    for (const outfit of OUTFITS) {
      expect(setOutfit(createRunState(), outfit).outfit).toBe(outfit);
    }
  });

  it('throws on an unknown outfit', () => {
    expect(() => setOutfit(createRunState(), 'formal')).toThrow('Invalid outfit "formal"');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `../src/state.js`.

- [ ] **Step 3: Write `src/state.js`**

```js
// Run state: everything the current playthrough knows. No persistence — by design (BR-7).
export const OUTFITS = ['casual', 'athletic'];

export function createRunState() {
  return { outfit: null, memories: [] };
}

export function setOutfit(state, outfit) {
  if (!OUTFITS.includes(outfit)) {
    throw new Error(`Invalid outfit "${outfit}"`);
  }
  return { ...state, outfit };
}

// Phase 2 (UC-12) adds addMemory(state, memoryKey) here.
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS — all tests green (constants + state).

- [ ] **Step 5: Commit**

```bash
git add src/state.js tests/state.test.js
git commit -m "feat: add run-state module (outfit selection, memory list)" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: Era Data Layer (map builder, config validation, Era 1 config, registry)

**Files:**
- Create: `src/eras/mapUtils.js`
- Create: `src/eras/validate.js`
- Create: `src/eras/era1-childhood.js`
- Create: `src/eras/index.js`
- Test: `tests/mapUtils.test.js`, `tests/validate.test.js`, `tests/eras.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `buildMapData(cols, rows, extraWalls = []) → number[][]` — bordered map: edge tiles are `1` (wall), interior `0` (floor), plus `extraWalls` as `[x, y]` pairs set to `1`.
  - `validateEraConfig(config) → true` — throws `Error` naming the era key and the problem.
  - Era config shape (the contract every era file follows, and what `EraScene` consumes in Task 8):
    ```js
    {
      key: 'era1',            // unique string
      name: 'Childhood',      // shown during dev; era label
      next: 'era2' | null,    // era key that follows (null = last era)
      tint: 0xfff2cc,         // per-era mood tint applied to map tiles
      map: {
        tileSize: 16,
        data: number[][],     // rows of tile indices; 0 floor, 1 wall in Phase 1
        collision: [1],       // tile indices that block movement
      },
      spawn: { x: 4, y: 16 }, // tile coords; must be a walkable tile
    }
    ```
  - `ERAS: [era1]` (ordered) and `getEraConfig(key) → config` (throws `Error('Unknown era "<key>"')`).

- [ ] **Step 1: Write the failing tests (all three files)**

Create `tests/mapUtils.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { buildMapData } from '../src/eras/mapUtils.js';

describe('buildMapData', () => {
  it('returns rows x cols of tiles', () => {
    const data = buildMapData(30, 20);
    expect(data).toHaveLength(20);
    for (const row of data) expect(row).toHaveLength(30);
  });

  it('makes every border tile a wall (1)', () => {
    const data = buildMapData(5, 4);
    for (let x = 0; x < 5; x++) {
      expect(data[0][x]).toBe(1);
      expect(data[3][x]).toBe(1);
    }
    for (let y = 0; y < 4; y++) {
      expect(data[y][0]).toBe(1);
      expect(data[y][4]).toBe(1);
    }
  });

  it('makes interior tiles floor (0) by default', () => {
    const data = buildMapData(5, 4);
    expect(data[1][1]).toBe(0);
    expect(data[2][3]).toBe(0);
  });

  it('places extra walls at [x, y] positions', () => {
    const data = buildMapData(5, 4, [[2, 1], [3, 2]]);
    expect(data[1][2]).toBe(1);
    expect(data[2][3]).toBe(1);
  });
});
```

Create `tests/validate.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { validateEraConfig } from '../src/eras/validate.js';

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
  };
}

describe('validateEraConfig', () => {
  it('accepts a valid config', () => {
    expect(validateEraConfig(tinyValidConfig())).toBe(true);
  });

  it('throws when a required field is missing', () => {
    const config = tinyValidConfig();
    delete config.spawn;
    expect(() => validateEraConfig(config)).toThrow('missing "spawn"');
  });

  it('throws when map rows are not all the same width', () => {
    const config = tinyValidConfig();
    config.map.data[1] = [1, 0];
    expect(() => validateEraConfig(config)).toThrow('same width');
  });

  it('throws when spawn is out of bounds', () => {
    const config = tinyValidConfig();
    config.spawn = { x: 9, y: 1 };
    expect(() => validateEraConfig(config)).toThrow('out of bounds');
  });

  it('throws when spawn sits on a collision tile', () => {
    const config = tinyValidConfig();
    config.spawn = { x: 0, y: 0 };
    expect(() => validateEraConfig(config)).toThrow('collision tile');
  });
});
```

Create `tests/eras.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { ERAS, getEraConfig } from '../src/eras/index.js';
import { validateEraConfig } from '../src/eras/validate.js';
import { GAME_WIDTH, GAME_HEIGHT, TILE_SIZE } from '../src/constants.js';

describe('era registry', () => {
  it('every registered era passes validation', () => {
    for (const era of ERAS) expect(validateEraConfig(era)).toBe(true);
  });

  it('every era map fills exactly one screen (30x20 tiles)', () => {
    for (const era of ERAS) {
      expect(era.map.data[0]).toHaveLength(GAME_WIDTH / TILE_SIZE);  // 30
      expect(era.map.data).toHaveLength(GAME_HEIGHT / TILE_SIZE);    // 20
    }
  });

  it('getEraConfig returns era1 (the classroom)', () => {
    const era = getEraConfig('era1');
    expect(era.key).toBe('era1');
    expect(era.name).toBe('Childhood');
  });

  it('getEraConfig throws on an unknown key', () => {
    expect(() => getEraConfig('era99')).toThrow('Unknown era "era99"');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — cannot resolve the three `src/eras/*` modules.

- [ ] **Step 3: Write `src/eras/mapUtils.js`**

```js
// Builds a single-screen map: walls (1) around the border, floor (0) inside,
// plus any extra wall blocks. Phase 3 replaces array maps with Tiled JSON.
export function buildMapData(cols, rows, extraWalls = []) {
  const data = [];
  for (let y = 0; y < rows; y++) {
    const row = [];
    for (let x = 0; x < cols; x++) {
      const isBorder = x === 0 || y === 0 || x === cols - 1 || y === rows - 1;
      row.push(isBorder ? 1 : 0);
    }
    data.push(row);
  }
  for (const [x, y] of extraWalls) {
    data[y][x] = 1;
  }
  return data;
}
```

- [ ] **Step 4: Write `src/eras/validate.js`**

```js
// Fails fast and loudly if an era config is malformed — a bad config should
// crash at load with a clear message, never mid-play with a mystery.
export function validateEraConfig(config) {
  const label = `Era "${config?.key ?? '?'}"`;

  for (const field of ['key', 'name', 'next', 'tint', 'map', 'spawn']) {
    if (!(field in config)) throw new Error(`${label}: missing "${field}"`);
  }

  const { tileSize, data, collision } = config.map;
  if (!Number.isInteger(tileSize) || tileSize <= 0) {
    throw new Error(`${label}: map.tileSize must be a positive integer`);
  }
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(`${label}: map.data must be a non-empty 2D array`);
  }
  const cols = data[0].length;
  for (const row of data) {
    if (!Array.isArray(row) || row.length !== cols) {
      throw new Error(`${label}: map rows must all be the same width`);
    }
  }
  if (!Array.isArray(collision)) {
    throw new Error(`${label}: map.collision must be an array of tile indices`);
  }

  const { x, y } = config.spawn;
  if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || y < 0 || y >= data.length || x >= cols) {
    throw new Error(`${label}: spawn { x: ${x}, y: ${y} } is out of bounds`);
  }
  if (collision.includes(data[y][x])) {
    throw new Error(`${label}: spawn sits on a collision tile`);
  }

  return true;
}
```

- [ ] **Step 5: Write `src/eras/era1-childhood.js`**

```js
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
```

- [ ] **Step 6: Write `src/eras/index.js`**

```js
import { era1 } from './era1-childhood.js';

// Ordered list of eras. Phase 2 appends era2 (Young love), era3 (The drift),
// era4 (Now, for good). Adding an era = adding a config file + one line here.
export const ERAS = [era1];

export function getEraConfig(key) {
  const era = ERAS.find((e) => e.key === key);
  if (!era) throw new Error(`Unknown era "${key}"`);
  return era;
}
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `npm test`
Expected: PASS — all test files green (constants, state, mapUtils, validate, eras).

- [ ] **Step 8: Commit**

```bash
git add src/eras/ tests/mapUtils.test.js tests/validate.test.js tests/eras.test.js
git commit -m "feat: add era data layer (map builder, validation, era1 classroom config)" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: Movement Resolver (pure 4-direction logic)

**Files:**
- Create: `src/movement.js`
- Test: `tests/movement.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces: `resolveDirection({ left, right, up, down }) → { vx, vy, facing }` where `vx`/`vy` ∈ {-1, 0, 1} are unit velocities (caller multiplies by `PLAYER_SPEED`), and `facing` ∈ `'left' | 'right' | 'up' | 'down' | null` (`null` = not moving; caller keeps last facing). **Rule: strictly 4-directional, no diagonals; horizontal wins over vertical when both are held** (Game Boy convention, and deterministic for tests). EraScene consumes this in Task 9.

- [ ] **Step 1: Write the failing test**

Create `tests/movement.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { resolveDirection } from '../src/movement.js';

const keys = (pressed = {}) => ({ left: false, right: false, up: false, down: false, ...pressed });

describe('resolveDirection', () => {
  it('is idle with no keys pressed', () => {
    expect(resolveDirection(keys())).toEqual({ vx: 0, vy: 0, facing: null });
  });

  it('moves in each single direction', () => {
    expect(resolveDirection(keys({ right: true }))).toEqual({ vx: 1, vy: 0, facing: 'right' });
    expect(resolveDirection(keys({ left: true }))).toEqual({ vx: -1, vy: 0, facing: 'left' });
    expect(resolveDirection(keys({ down: true }))).toEqual({ vx: 0, vy: 1, facing: 'down' });
    expect(resolveDirection(keys({ up: true }))).toEqual({ vx: 0, vy: -1, facing: 'up' });
  });

  it('never moves diagonally — horizontal wins when both axes are held', () => {
    expect(resolveDirection(keys({ right: true, down: true }))).toEqual({ vx: 1, vy: 0, facing: 'right' });
    expect(resolveDirection(keys({ left: true, up: true }))).toEqual({ vx: -1, vy: 0, facing: 'left' });
  });

  it('cancels opposing horizontal keys and falls through to vertical', () => {
    expect(resolveDirection(keys({ left: true, right: true, up: true })))
      .toEqual({ vx: 0, vy: -1, facing: 'up' });
  });

  it('is idle when all four keys are held', () => {
    expect(resolveDirection(keys({ left: true, right: true, up: true, down: true })))
      .toEqual({ vx: 0, vy: 0, facing: null });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `../src/movement.js`.

- [ ] **Step 3: Write `src/movement.js`**

```js
// Classic Game Boy movement: 4 directions, no diagonals.
// Horizontal wins when both axes are held (deterministic, matches Pokémon feel).
export function resolveDirection({ left, right, up, down }) {
  const h = (right ? 1 : 0) - (left ? 1 : 0);
  const v = (down ? 1 : 0) - (up ? 1 : 0);

  if (h !== 0) return { vx: h, vy: 0, facing: h > 0 ? 'right' : 'left' };
  if (v !== 0) return { vx: 0, vy: v, facing: v > 0 ? 'down' : 'up' };
  return { vx: 0, vy: 0, facing: null };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS — all suites green.

- [ ] **Step 5: Commit**

```bash
git add src/movement.js tests/movement.test.js
git commit -m "feat: add pure 4-direction movement resolver" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 5: Placeholder Texture Generator

**Files:**
- Create: `src/placeholders.js`
- Test: `tests/placeholders.test.js`

**Interfaces:**
- Consumes: a Phaser scene (only `scene.add.graphics()` — which is why it's testable with a tiny mock).
- Produces:
  - `PLAYER_TEXTURES = { down: 'player-down', up: 'player-up', left: 'player-left', right: 'player-right' }` — texture keys EraScene uses for facing swaps (Tasks 8–9) and OutfitScene uses for previews (Task 7).
  - `createPlaceholderTextures(scene) → string[]` — generates the `'tiles'` strip (index 0 floor, index 1 wall, a 32×16 texture) and four 16×32 player facings; returns the created keys in order `['tiles', 'player-down', 'player-up', 'player-left', 'player-right']`. Phase 3 replaces these with real art loaded in `BootScene.preload()`.

- [ ] **Step 1: Write the failing test**

Create `tests/placeholders.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { createPlaceholderTextures, PLAYER_TEXTURES } from '../src/placeholders.js';

// Minimal stand-in for a Phaser scene: records generateTexture calls.
function mockScene() {
  const generated = [];
  const gfx = {
    fillStyle() { return this; },
    fillRect() { return this; },
    clear() { return this; },
    destroy() {},
    generateTexture(key) { generated.push(key); return this; },
  };
  return { add: { graphics: () => gfx }, generated };
}

describe('createPlaceholderTextures', () => {
  it('generates the tiles strip and all four player facings, in order', () => {
    const scene = mockScene();
    const keys = createPlaceholderTextures(scene);
    const expected = ['tiles', 'player-down', 'player-up', 'player-left', 'player-right'];
    expect(keys).toEqual(expected);
    expect(scene.generated).toEqual(expected);
  });

  it('exposes a texture key for every facing the movement resolver can produce', () => {
    expect(PLAYER_TEXTURES).toEqual({
      down: 'player-down',
      up: 'player-up',
      left: 'player-left',
      right: 'player-right',
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `../src/placeholders.js`.

- [ ] **Step 3: Write `src/placeholders.js`**

```js
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS — all suites green.

- [ ] **Step 5: Commit**

```bash
git add src/placeholders.js tests/placeholders.test.js
git commit -m "feat: add runtime placeholder texture generator (tiles + player facings)" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 6: BootScene + TitleScene + real scene registry (UC-1, UC-2, UC-3)

**Files:**
- Create: `src/scenes/BootScene.js`
- Create: `src/scenes/TitleScene.js`
- Create: `src/scenes/OutfitScene.js` (thin shell — filled in Task 7)
- Create: `src/scenes/EraScene.js` (thin shell — filled in Task 8)
- Modify: `src/main.js` (replace ScaffoldScene with the real registry)

**Interfaces:**
- Consumes: `createPlaceholderTextures` (Task 5), `createRunState` (Task 2), `SCENES`/`COLORS`/`FONT` (Task 1).
- Produces: the running scene chain `BootScene → TitleScene → OutfitScene`. BootScene seeds `this.registry.set('runState', createRunState())` — every later scene reads `this.registry.get('runState')`. Camera fades use RGB `(13, 13, 26)` (the navy) everywhere.

- [ ] **Step 1: Write `src/scenes/BootScene.js`**

```js
import Phaser from 'phaser';
import { SCENES } from '../constants.js';
import { createPlaceholderTextures } from '../placeholders.js';
import { createRunState } from '../state.js';

// UC-1: Boot & load assets.
export default class BootScene extends Phaser.Scene {
  constructor() { super(SCENES.BOOT); }

  preload() {
    // TODO(Phase 3): load real assets here — Alexei/Harley spritesheets,
    // asset-pack tilesets, Tiled JSON maps, and Harley's playlist audio (MP3+OGG).
  }

  create() {
    createPlaceholderTextures(this);
    this.registry.set('runState', createRunState());
    this.scene.start(SCENES.TITLE);
  }
}
```

- [ ] **Step 2: Write `src/scenes/TitleScene.js`**

```js
import Phaser from 'phaser';
import { SCENES, COLORS, FONT, GAME_WIDTH, GAME_HEIGHT } from '../constants.js';

// UC-2 + UC-3: the sacred title screen. Layout, colors, and font are locked
// by the approved screenshot — do not restyle.
export default class TitleScene extends Phaser.Scene {
  constructor() { super(SCENES.TITLE); }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.NAVY);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT * 0.28, 'PARA TI', {
      fontFamily: FONT, fontSize: '32px', color: COLORS.WHITE,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT * 0.44, 'from harley', {
      fontFamily: FONT, fontSize: '10px', color: COLORS.PINK_SOFT,
    }).setOrigin(0.5);

    const play = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT * 0.76, '[ PLAY ]', {
      fontFamily: FONT, fontSize: '14px', color: COLORS.PINK_MAUVE,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    play.on('pointerover', () => play.setColor(COLORS.WHITE));
    play.on('pointerout', () => play.setColor(COLORS.PINK_MAUVE));
    play.on('pointerdown', () => {
      play.disableInteractive();
      this.cameras.main.fadeOut(300, 13, 13, 26);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.start(SCENES.OUTFIT);
      });
    });

    // TODO(Phase 3): title music begins softly here — track from Harley's playlist.
  }
}
```

- [ ] **Step 3: Write the two thin shells**

`src/scenes/OutfitScene.js`:

```js
import Phaser from 'phaser';
import { SCENES, COLORS, FONT, GAME_WIDTH, GAME_HEIGHT } from '../constants.js';

// UC-4 shell — full outfit selection lands in Task 7.
export default class OutfitScene extends Phaser.Scene {
  constructor() { super(SCENES.OUTFIT); }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.NAVY);
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'OUTFIT — Task 7', {
      fontFamily: FONT, fontSize: '10px', color: COLORS.WHITE,
    }).setOrigin(0.5);
  }
}
```

`src/scenes/EraScene.js`:

```js
import Phaser from 'phaser';
import { SCENES, COLORS, FONT, GAME_WIDTH, GAME_HEIGHT } from '../constants.js';

// UC-5/6/7 shell — the real data-driven era engine lands in Tasks 8-9.
export default class EraScene extends Phaser.Scene {
  constructor() { super(SCENES.ERA); }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.NAVY);
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'ERA — Task 8', {
      fontFamily: FONT, fontSize: '10px', color: COLORS.WHITE,
    }).setOrigin(0.5);
  }
}
```

- [ ] **Step 4: Replace the scene registry in `src/main.js`**

Full new contents of `src/main.js`:

```js
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, FONT } from './constants.js';
import BootScene from './scenes/BootScene.js';
import TitleScene from './scenes/TitleScene.js';
import OutfitScene from './scenes/OutfitScene.js';
import EraScene from './scenes/EraScene.js';

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
  scene: [BootScene, TitleScene, OutfitScene, EraScene], // EndScene arrives in Phase 2
};

// Gate boot on the pixel font so no text ever renders in a fallback font.
const start = () => new Phaser.Game(config);
document.fonts.load(`16px ${FONT}`).then(start, start);
```

- [ ] **Step 5: Run tests (regression) and manual verification**

Run: `npm test`
Expected: PASS — no test imports scene files, all suites still green.

Run: `npm run dev`, open http://localhost:5173. Verify **every** item:
1. Title appears in under ~2 seconds (boot is instant — no real assets yet).
2. Background is the navy `#0d0d1a` (whole page and canvas match seamlessly).
3. `PARA TI` — large, white, pixel font, upper third, centered.
4. `from harley` — small, soft pink, centered beneath the title.
5. `[ PLAY ]` — mauve/dark pink, lower third; turns white on hover, hand cursor.
6. Clicking `[ PLAY ]` fades to navy, then shows the `OUTFIT — Task 7` shell.
7. Zero console errors.

**⚠ HARLEY CHECKPOINT — do not skip:** compare this title screen side-by-side with the approved screenshot. If `#f5b8c4` (soft pink) or `#b06a7f` (mauve) look off, adjust `COLORS.PINK_SOFT` / `COLORS.PINK_MAUVE` in `src/constants.js` until they match, then re-run the constants test (it only pins NAVY).

- [ ] **Step 6: Commit**

```bash
git add src/main.js src/scenes/
git commit -m "feat: add BootScene and sacred TitleScene with real scene registry (UC-1..UC-3)" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 7: OutfitScene (UC-4)

**Files:**
- Modify: `src/scenes/OutfitScene.js` (replace the shell entirely)

**Interfaces:**
- Consumes: `setOutfit` (Task 2), `PLAYER_TEXTURES` (Task 5), `OUTFIT_TINTS`/`HEX` (Task 1), the `'runState'` registry entry (Task 6).
- Produces: on confirm, `runState.outfit` is set to `'casual'` or `'athletic'` in the registry, and the scene starts `SCENES.ERA` with `{ eraKey: 'era1' }` — the exact launch data EraScene's `init()` expects in Task 8.

- [ ] **Step 1: Replace `src/scenes/OutfitScene.js` with the full implementation**

```js
import Phaser from 'phaser';
import {
  SCENES, COLORS, HEX, FONT, GAME_WIDTH, OUTFIT_TINTS,
} from '../constants.js';
import { setOutfit } from '../state.js';
import { PLAYER_TEXTURES } from '../placeholders.js';

// UC-4: choose Casual or Athletic. Exactly two options (BR-6).
export default class OutfitScene extends Phaser.Scene {
  constructor() { super(SCENES.OUTFIT); }

  create() {
    this.selected = null;
    this.cameras.main.setBackgroundColor(COLORS.NAVY);
    this.cameras.main.fadeIn(300, 13, 13, 26);

    this.add.text(GAME_WIDTH / 2, 40, 'CHOOSE YOUR OUTFIT', {
      fontFamily: FONT, fontSize: '12px', color: COLORS.WHITE,
    }).setOrigin(0.5);

    this.panels = {
      casual: this.makeOption(GAME_WIDTH * 0.32, 'casual', 'CASUAL'),
      athletic: this.makeOption(GAME_WIDTH * 0.68, 'athletic', 'ATHLETIC'),
    };

    this.confirm = this.add.text(GAME_WIDTH / 2, 285, "[ LET'S GO ]", {
      fontFamily: FONT, fontSize: '12px', color: COLORS.PINK_MAUVE,
    }).setOrigin(0.5).setVisible(false).setInteractive({ useHandCursor: true });

    this.confirm.on('pointerover', () => this.confirm.setColor(COLORS.WHITE));
    this.confirm.on('pointerout', () => this.confirm.setColor(COLORS.PINK_MAUVE));
    this.confirm.on('pointerdown', () => this.launchEra());
  }

  makeOption(x, outfit, label) {
    const panel = this.add.rectangle(x, 160, 110, 160, HEX.PANEL)
      .setStrokeStyle(2, HEX.PANEL_BORDER)
      .setInteractive({ useHandCursor: true });

    // TODO(Phase 3): tinted placeholder becomes Alexei's real outfit sprite —
    // sprites provided by Harley.
    this.add.image(x, 145, PLAYER_TEXTURES.down).setScale(3).setTint(OUTFIT_TINTS[outfit]);

    this.add.text(x, 215, label, {
      fontFamily: FONT, fontSize: '10px', color: COLORS.WHITE,
    }).setOrigin(0.5);

    panel.on('pointerdown', () => this.select(outfit));
    return panel;
  }

  select(outfit) {
    this.selected = outfit;
    for (const [key, panel] of Object.entries(this.panels)) {
      panel.setStrokeStyle(2, key === outfit ? HEX.PINK_SOFT : HEX.PANEL_BORDER);
    }
    this.confirm.setVisible(true);
  }

  launchEra() {
    const runState = setOutfit(this.registry.get('runState'), this.selected);
    this.registry.set('runState', runState);

    this.confirm.disableInteractive();
    this.cameras.main.fadeOut(300, 13, 13, 26);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start(SCENES.ERA, { eraKey: 'era1' });
    });
  }
}
```

- [ ] **Step 2: Run tests (regression) and manual verification**

Run: `npm test`
Expected: PASS — unchanged.

Run: `npm run dev`, click through Title → `[ PLAY ]`. Verify **every** item:
1. Fade-in reveals `CHOOSE YOUR OUTFIT` heading, two panels side by side.
2. Each panel: a 3×-scaled player placeholder (pink-tinted CASUAL, blue-tinted ATHLETIC) and its label.
3. No confirm button visible before any selection.
4. Clicking a panel gives it a soft-pink border; clicking the other moves the highlight (extension 3a of UC-4 — switching works).
5. `[ LET'S GO ]` appears after first selection; hover turns it white.
6. Clicking `[ LET'S GO ]` fades out and shows the `ERA — Task 8` shell.
7. Zero console errors.

- [ ] **Step 3: Commit**

```bash
git add src/scenes/OutfitScene.js
git commit -m "feat: implement outfit selection with preview and confirm (UC-4)" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 8: EraScene — config-driven map + spawn + tint (UC-5)

**Files:**
- Modify: `src/scenes/EraScene.js` (replace the shell entirely)

**Interfaces:**
- Consumes: `getEraConfig`/`validateEraConfig` (Task 3), `PLAYER_TEXTURES` (Task 5), `OUTFIT_TINTS`/`TILE_SIZE` (Task 1), launch data `{ eraKey: 'era1' }` (Task 7), the `'tiles'` texture (Task 5 — tile index 0 = first 16px of the strip, index 1 = second, matching `map.data` values).
- Produces: `this.player` (arcade sprite) and `this.layer` (tilemap layer) as scene properties — Task 9 wires movement and collision onto exactly these two. The era label text object is a dev aid removed in Phase 2 when dialogue boxes land.

- [ ] **Step 1: Replace `src/scenes/EraScene.js` with the map-building implementation**

```js
import Phaser from 'phaser';
import {
  SCENES, COLORS, FONT, TILE_SIZE, OUTFIT_TINTS,
} from '../constants.js';
import { getEraConfig } from '../eras/index.js';
import { validateEraConfig } from '../eras/validate.js';
import { PLAYER_TEXTURES } from '../placeholders.js';

// UC-5: the reusable era engine. One scene, four data configs (Phase 2 adds
// eras 2-4). An era is DATA — never subclass or fork this scene per era.
export default class EraScene extends Phaser.Scene {
  constructor() { super(SCENES.ERA); }

  init(data) {
    this.eraKey = data.eraKey ?? 'era1';
  }

  create() {
    const era = getEraConfig(this.eraKey);
    validateEraConfig(era);
    this.era = era;

    this.cameras.main.fadeIn(300, 13, 13, 26);

    // Build the single-screen map from the config's 2D array.
    const map = this.make.tilemap({
      data: era.map.data,
      tileWidth: era.map.tileSize,
      tileHeight: era.map.tileSize,
    });
    const tileset = map.addTilesetImage('tiles');
    this.layer = map.createLayer(0, tileset, 0, 0);

    // Per-era mood tint (bright / golden / muted / sunset later).
    this.layer.forEachTile((tile) => { tile.tint = era.tint; });

    // Spawn the player centered on the spawn tile.
    const spawnX = era.spawn.x * TILE_SIZE + TILE_SIZE / 2;
    const spawnY = era.spawn.y * TILE_SIZE + TILE_SIZE / 2;
    this.player = this.physics.add.sprite(spawnX, spawnY, PLAYER_TEXTURES.down);

    // TODO(Phase 3): outfit tint becomes Alexei's real outfit spritesheet.
    const runState = this.registry.get('runState');
    if (runState?.outfit) this.player.setTint(OUTFIT_TINTS[runState.outfit]);

    // Dev aid: era label. Removed in Phase 2 when the dialogue box arrives.
    this.add.text(4, 4, era.name, {
      fontFamily: FONT, fontSize: '8px', color: COLORS.WHITE,
    }).setDepth(10);

    // TODO(Phase 2, UC-5): Era 1 intro line via dialogue box — wording is Harley's.
    // TODO(Phase 2): objective, NPCs, memory, era music hook.
  }
}
```

- [ ] **Step 2: Run tests (regression) and manual verification**

Run: `npm test`
Expected: PASS — unchanged.

Run: `npm run dev`, click through Title → outfit → `[ LET'S GO ]`. Verify **every** item:
1. Fade-in reveals a full-screen tile map: green floor, dark border walls all around, warm cream tint over everything (era 1's bright mood).
2. Three rows of desk-block pairs (dark tiles) inside the classroom.
3. The player (dark 16×32 rectangle with white face dot, tinted by chosen outfit) stands in the lower-left, near tile (4, 16).
4. `Childhood` label in the top-left corner.
5. Player does not move yet (movement is Task 9). Zero console errors.

- [ ] **Step 3: Commit**

```bash
git add src/scenes/EraScene.js
git commit -m "feat: build data-driven EraScene with tilemap, tint, and spawn (UC-5)" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 9: EraScene — movement + facing + collision (UC-6, UC-7)

**Files:**
- Modify: `src/scenes/EraScene.js` (add physics setup to `create()`, add `update()`)

**Interfaces:**
- Consumes: `resolveDirection` (Task 4), `PLAYER_SPEED` (Task 1), `this.player`/`this.layer` (Task 8), `era.map.collision` (Task 3).
- Produces: a walkable, collidable era — the complete Phase 1 deliverable. Facing changes swap the player texture (walk-cycle *animations* arrive with real sprites in Phase 3 — placeholder facings are the Phase 1 contract per the dev plan).

- [ ] **Step 1: Extend imports and `create()` in `src/scenes/EraScene.js`**

Update the constants import line to include `PLAYER_SPEED`:

```js
import {
  SCENES, COLORS, FONT, TILE_SIZE, OUTFIT_TINTS, PLAYER_SPEED,
} from '../constants.js';
import { resolveDirection } from '../movement.js';
```

Append to the **end of `create()`** (after the era label / TODO comments):

```js
    // --- UC-7: collision ---
    // Feet-only hitbox: the top of the 16x32 sprite may overlap walls behind
    // the player (top-down depth illusion); only the bottom 12x12 collides.
    this.player.body.setSize(12, 12).setOffset(2, 20);
    this.layer.setCollision(era.map.collision);
    this.physics.add.collider(this.player, this.layer);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.player.setCollideWorldBounds(true);

    // --- UC-6: input ---
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D');
```

- [ ] **Step 2: Add `update()` to the class**

```js
  update() {
    const pressed = {
      left: this.cursors.left.isDown || this.wasd.A.isDown,
      right: this.cursors.right.isDown || this.wasd.D.isDown,
      up: this.cursors.up.isDown || this.wasd.W.isDown,
      down: this.cursors.down.isDown || this.wasd.S.isDown,
    };
    const { vx, vy, facing } = resolveDirection(pressed);
    this.player.setVelocity(vx * PLAYER_SPEED, vy * PLAYER_SPEED);
    if (facing) this.player.setTexture(PLAYER_TEXTURES[facing]);
  }
```

- [ ] **Step 3: Run tests (regression) and manual verification**

Run: `npm test`
Expected: PASS — unchanged.

Run: `npm run dev`, click through to the classroom. Verify **every** item:
1. Arrow keys move the player in all 4 directions; WASD does exactly the same.
2. Movement is never diagonal — holding right+down slides right (horizontal wins).
3. The white face dot flips side per facing: bottom-center (down), left edge (left), right edge (right), no dot (up).
4. The player **cannot** cross the border walls on any of the four sides, and cannot leave the screen.
5. The player **cannot** walk through any desk block, but slides cleanly between desk rows.
6. The sprite's head may overlap a wall tile above while walking up — correct (feet-only hitbox).
7. Releasing all keys stops the player instantly; last facing is kept.
8. Zero console errors.

- [ ] **Step 4: Commit**

```bash
git add src/scenes/EraScene.js
git commit -m "feat: add 4-direction movement, facing swaps, and collision (UC-6, UC-7)" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 10: Phase 1 Acceptance Pass

**Files:**
- Modify: `tech-stack-dev-plan.md` (tick completed Phase 1 checkboxes)

**Interfaces:**
- Consumes: everything above.
- Produces: a verified, tagged Phase 1 — the foundation Phase 2 (UC-8..UC-16) builds on.

- [ ] **Step 1: Full regression**

Run: `npm test`
Expected: PASS — 7 test files (constants, state, mapUtils, validate, eras, movement, placeholders), zero failures.

Run: `npm run build`
Expected: Vite production build completes without errors or warnings that indicate breakage (`dist/` is created; it stays untracked).

- [ ] **Step 2: Full-flow manual acceptance (the Phase 1 deliverable)**

Run: `npm run dev`. In one unbroken session verify:
1. Boot → title in Press Start 2P on navy, exact layout.
2. `[ PLAY ]` → fade → outfit selection.
3. Pick CASUAL, switch to ATHLETIC, confirm with `[ LET'S GO ]`.
4. Classroom loads: tinted map, desks, `Childhood` label, player at lower-left with the athletic (blue) tint.
5. Walk the full border and between all desk rows — collision holds everywhere.
6. Refresh the page → back to the title with everything reset (no save — BR-7 holds).

- [ ] **Step 3: Tick the completed Phase 1 items in `tech-stack-dev-plan.md`**

In the `### Phase 1 — Foundation` section, change these lines' `- [ ]` to `- [x]`:
- `git init` + first commit (done by Harley before this plan)
- Initialize Phaser 3 project with Vite; set up folder structure
- BootScene — preload assets (placeholders fine)
- TitleScene — exact match to the approved screenshot *(only if the Task 6 Harley checkpoint passed — otherwise leave unticked and note what's pending)*
- OutfitScene — 2 options, character preview, confirm
- EraScene skeleton — single-screen map, 4-direction movement, collision
- One placeholder era config to prove the data-driven pattern

- [ ] **Step 4: Commit and tag**

```bash
git add tech-stack-dev-plan.md
git commit -m "chore: complete Phase 1 engine foundation (UC-1..UC-7)" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
git tag phase-1-foundation
```

---

## Spec Coverage Notes

| Use case | Where implemented |
|---|---|
| UC-1 Boot & load | Task 5 (textures) + Task 6 (BootScene); real asset loading is Phase 3 by design |
| UC-2 Title screen | Task 6 (music hook is a marked TODO — playlist files are Harley's, wired Phase 3) |
| UC-3 Start | Task 6 (PLAY → fade → Outfit) |
| UC-4 Outfit | Task 7 (2 options, switchable, confirm; sprites are placeholder-tinted per dev plan) |
| UC-5 Load era | Task 3 (data layer) + Task 8 (runtime); era intro line deferred to Phase 2 with the dialogue box (UC-9), marked TODO |
| UC-6 Move | Task 4 (logic) + Task 9 (wiring); facing swaps now, walk animations with real sprites in Phase 3 per dev plan |
| UC-7 Collide | Task 3 (collision data) + Task 9 (collider + world bounds) |

Known deliberate deferrals (all marked with TODOs in code): title/era music (Phase 3), Era 1 intro dialogue line (Phase 2, needs UC-9 dialogue box + Harley's wording), walk-cycle animations (Phase 3, needs real spritesheets), Tiled JSON maps (Phase 3 — Phase 1 proves the config pattern with array maps).
