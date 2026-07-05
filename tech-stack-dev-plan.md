# Para Ti — Tech Stack & Development Plan
### Version 2.0

> Redesign source of truth: `docs/superpowers/specs/2026-07-05-para-ti-v2-design.md`
>
> Phases below are **ordered milestones, not a weekly schedule** — there's no deadline.
> Build in this order; take each phase at whatever pace the week allows.

---

## Tech Stack

### Game Engine
**Phaser 3** — JavaScript game framework. Handles tilemap rendering, top-down movement,
collision, the reusable EraScene, dialogue boxes, camera pan, and audio.

### Language
**JavaScript (ES6+)** — No TypeScript. Fast to write, easy for Claude to build and tweak.

### Map Editor
**Tiled** (free, tiled.org) — Build each era's single-screen map from asset-pack tiles.
Export JSON; Phaser reads it directly.

### Art
- **Asset packs** — 16×16 top-down RPG tilesets and townsfolk NPC sprites (itch.io etc.)
  for the era worlds. Re-tinted per era for mood. This is ~90% of the visual art.
- **Piskel** (free, piskelapp.com) — Only for the hand-made art: **Alexei's sprite,
  Harley's sprite, and the 4 memory icons.**

### Audio
**MP3 + OGG** — Always ship both. Trim songs to clean loops in Audacity (free). Phaser
handles playback and looping. Roughly one song per era + title + ending.

### Hosting
**GitHub Pages / Netlify / Vercel** — Free static hosting. Alexei opens a URL and plays.

### Dev Tools
- **VS Code** — Editor
- **Vite** — Fast local dev server with hot reload
- **Chrome DevTools** — Debugging

### Version Control
**Git + GitHub** — Source control. (Not yet initialized — do this first.)

---

## Project Structure

```
para-ti/
├── index.html
├── src/
│   ├── main.js              ← Phaser game config + scene registry
│   ├── eras/                ← era config objects (era1..era4)
│   │   ├── era1-childhood.js
│   │   ├── era2-younglove.js
│   │   ├── era3-drift.js
│   │   └── era4-now.js
│   └── scenes/
│       ├── BootScene.js      ← Preloads all assets
│       ├── TitleScene.js     ← Title screen (matches approved design)
│       ├── OutfitScene.js    ← Outfit selection (Casual / Athletic)
│       ├── EraScene.js       ← ONE reusable scene, driven by an era config
│       └── EndScene.js       ← Memory montage → sunset pan → ending
├── public/
│   └── assets/
│       ├── tilemaps/         ← Tiled JSON + tileset images (asset packs)
│       ├── sprites/          ← Alexei, Harley, memory icons (custom) + NPC packs
│       ├── audio/            ← MP3/OGG music + SFX
│       └── images/           ← UI elements, title screen assets
└── package.json
```

---

## Development Plan

### Phase 1 — Foundation

**Goal:** The shell runs and the EraScene skeleton walks. No polish.

- [x] `git init` + first commit of the v2 docs
- [x] Initialize Phaser 3 project with Vite; set up folder structure
- [x] BootScene — preload assets (placeholders fine)
- [ ] TitleScene — exact match to the approved screenshot *(built & verified against the documented spec; awaiting Harley's side-by-side check against his screenshot — the pinks in `src/constants.js` are tunable)*
- [x] OutfitScene — 2 options, character preview, confirm
- [x] **EraScene skeleton** — loads a single era config; player walks a placeholder
      single-screen map with 4-direction movement (arrows + WASD) and collision
- [x] One placeholder era config to prove the data-driven pattern

**Deliverable:** Title → Outfit → Era 1 loads; you can walk around a placeholder screen.

---

### Phase 2 — Core Loop, End to End

**Goal:** The full skeleton walks — all four eras chain to the ending. Placeholder art/text.

- [ ] EraScene: **objective** hook (one light task per era) → makes the memory reachable
- [ ] EraScene: **memory** collectible — interact to collect, plays a short scene, unlocks
      the next era; store collected memories for the ending
- [ ] EraScene: **NPC** interaction + Pokémon-style **dialogue box** (placeholder lines)
- [ ] **Memory tracker** UI (e.g. ✦ ✦ ✧ ✧ for 2/4)
- [ ] Four placeholder era configs wired in sequence (era1→era2→era3→era4)
- [ ] EndScene skeleton — memory montage placeholder → sunset pan (camera + fade) →
      "[ ENDING MESSAGE TBD ]" → Play Again
- [ ] Fade transitions between eras and into the ending

**Deliverable:** Title → Outfit → Era 1→2→3→4 → sunset → end, completable with placeholders.

---

### Phase 3 — Real Eras, Art & Audio

**Goal:** Replace placeholders with the real worlds, sprites, and music.

- [ ] Build the real era maps in Tiled from asset-pack tiles, **re-tinted per era**:
      Era 1 classroom (bright), Era 2 hill (golden), Era 3 drift (grey/muted),
      Era 4 now (sunset). *(Drift & now settings: use Harley's decisions once given.)*
- [ ] Weave passion scenery across eras (gym/fitness, movie marquee, chapel/faith detail)
- [ ] **Alexei sprite** — both outfits, 4 walk directions + idle (from reference photo)
- [ ] **Harley sprite** — for Era 4 + ending (from reference photo)
- [ ] **4 memory icons** — one hand-made pixel icon per era
- [ ] NPC sprites from asset packs, re-tinted per era
- [ ] Memory collection animation; per-era music tracks; SFX (footsteps, collect, dialogue
      blip, ending transition)

**Deliverable:** The game looks and sounds real end to end.

---

### Phase 4 — Personal Content

**Goal:** Fill in everything only Harley can write. (Claude only ever leaves placeholders.)

- [ ] Finalize the **drift-era and now-era settings**
- [ ] All **NPC lines** (playlist lyrics + any real lines) inserted
- [ ] Each era's **memory scene text** inserted
- [ ] The **ending personal message** inserted; ending screen shows both characters
- [ ] Full playtest — the story reads naturally, memories land, no bugs

**Deliverable:** The game is personal, complete, and true to the fifteen years.

---

### Phase 5 — Polish & Deploy

- [ ] Full playtest on laptop (Chrome, Safari, Firefox)
- [ ] Smooth scene transitions; dialogue timing/readability
- [ ] Music loops cleanly; ~10-minute run feels tight, nothing drags
- [ ] Deploy to GitHub Pages / Netlify / Vercel
- [ ] Give Alexei the link 🎮

---

## Definition of Done

A feature is done when:
- It works without crashing in Chrome on desktop
- Placeholder personal content is clearly marked with `// TODO: Harley writes this`
- It doesn't block the rest of the era chain

---

## Notes for Claude During Build Sessions

- **Build the reusable EraScene first, then walk the full chain** (Title → 4 eras →
  Ending) before polishing anything. Skeleton before skin.
- **Eras are data, not scenes** — add or change an era by editing its config object, not by
  writing a new scene.
- **One screen per era.** If an era wants to grow, that's scope creep — stop.
- **Re-tint, don't redraw** — one asset pack across eras, per-era palette/tint for mood.
- **The title screen is sacred** — match the approved screenshot exactly.
- **Never generate personal content** — NPC lines, memory scenes, the ending message, and
  the drift/now settings are Harley's. Use clearly-marked placeholders only.
