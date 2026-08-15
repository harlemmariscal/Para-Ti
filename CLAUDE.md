# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Para Ti** ("For You") is a browser-based, desktop-only pixel art **story-RPG** built as a personal gift by Harley for **Alexei**. It is a ~10-minute playthrough that retraces their real fifteen-year history across **four era-worlds** — Childhood → Young love → The drift → Now, for good — in retro Pokémon-Red pixel art. The player (Alexei) walks each single-screen era, completes one light objective, collects one hidden **memory**, and unlocks the next era; the four memories pay off in the ending. The game is given to Alexei *after* Harley asks her to be his girlfriend in real life, so it lands as a celebration keepsake. The project is in the planning/documentation phase — no code exists yet.

> **Source of truth for the design:** `docs/superpowers/specs/2026-07-05-para-ti-v2-design.md`. This supersedes the original v1 "collect 3 hearts in 3 buildings" concept.

## Development Commands

Once the project is initialized with Vite:

```bash
npm install          # Install dependencies
npm run dev          # Start local dev server (hot reload)
npm run build        # Build for production
npm run preview      # Preview production build locally
```

## Architecture

### Scene Flow
```
BootScene → TitleScene → OutfitScene → EraScene(1..4) → EndScene
```

- **BootScene** (`src/scenes/BootScene.js`) — Preloads all assets (sprites, tilemaps, audio)
- **TitleScene** (`src/scenes/TitleScene.js`) — Title screen with music and PLAY button (finalized design)
- **OutfitScene** (`src/scenes/OutfitScene.js`) — Outfit selection (Casual or Athletic) with character preview
- **EraScene** (`src/scenes/EraScene.js`) — **One reusable scene** that runs all four eras, data-driven by a per-era config object (tilemap, palette/tint, music, objective, NPC lines, memory). This is the core engineering decision — not four bespoke scenes.
- **EndScene** (`src/scenes/EndScene.js`) — Memory montage → sunset camera pan → Harley's personal message → both characters → Play Again

### Entry Points
- `index.html` — Served by Vite; root HTML shell
- `src/main.js` — Phaser game config and scene registry

### Project Structure (target layout)
```
para-ti/
├── index.html
├── src/
│   ├── main.js
│   ├── eras/            ← era config objects (1..4)
│   └── scenes/
│       ├── BootScene.js
│       ├── TitleScene.js
│       ├── OutfitScene.js
│       ├── EraScene.js
│       └── EndScene.js
└── public/
    └── assets/
        ├── tilemaps/    ← Tiled JSON + tileset PNGs (asset packs)
        ├── sprites/     ← Alexei, Harley, memory icons (custom) + NPC packs
        ├── audio/       ← MP3/OGG music files
        └── images/      ← UI elements, title screen
```

### EraScene Subsystems
- **Era config** — Each era is a plain data object; EraScene reads it. Add an era by adding a config, not a scene.
- **Tilemap** — Tiled-exported JSON; one 30×20 map per era viewed through a scrolling 2× camera; separate collision layer; per-era tint for mood. Cosmetic ground variants are sprinkled in at load and never affect collision.
- **Player movement** — Arcade physics, 4-direction (arrow keys + WASD), collision with tilemap
- **Objective** — One light task per era (find the note, reach the hilltop, etc.); completing it makes the memory reachable
- **NPCs** — Optional flavor; Space/Enter triggers a Pokémon-style dialogue box (playlist lyric and/or a real line)
- **Memory** — One hidden collectible per era; collecting plays a short scene, unlocks the next era, and is stored for the ending montage

## Tech Stack

| Layer | Choice |
|---|---|
| Game engine | Phaser 3 |
| Language | JavaScript (ES6+, no TypeScript) |
| Bundler | Vite |
| Map editor | Tiled (exports JSON for Phaser) |
| Sprite editor | Piskel (16×16 tiles, 16×32 characters, 3-frame walk strips) — only for custom sprites |
| World/NPC art | Asset packs (16×16 top-down RPG tilesets), re-tinted per era |
| Font | Press Start 2P (Google Fonts) |
| Audio | MP3 + OGG (always provide both for browser compat) |
| Hosting | GitHub Pages / Netlify / Vercel |

## Critical Design Rules

**Title screen** — Must match the approved screenshot: dark navy `#0d0d1a` background, "PARA TI" in white, "from harley" in soft pink, `[ PLAY ]` in dark pink/mauve. All text uses Press Start 2P. Unchanged from v1.

**Player character (Alexei)** — Curly hair worn down, beauty mark above the LEFT side of the lip (appears on viewer's RIGHT), athletic build, warm medium-brown skin tone (Mexican/Asian). These details are non-negotiable.

**Art style** — Pokémon **Black/White 2** (DS, 2012), not Red/Blue. Still 16×16 tiles and 16×32 characters, but: soft shading with a top-left light source, outlines in a dark tone of the base hue (never pure black), three tones per material so nothing is a flat fill, a contact shadow under anything that stands up, and a contact-sorted world where whoever stands lower draws in front. Ground uses several cosmetic variants — a single repeated ground tile reads as a lattice once the camera scrolls.

> Superseded the original Red/Blue GBC direction on 2026-08-15 at Harley's call. BW2's real overworld is 3D (perspective camera, camera swings); Phaser is 2D, so the reproducible parts are the framing, palette, shading, animation and UI — not the perspective.

**Camera** — BW2 frames tight and scrolls. 2× zoom shows ~15×10 tiles of a 30×20 era map, camera trailing the player. This replaced the original "one screen per era" rule; the maps did not change size, only the framing.

**Two cameras** — `EraScene` runs a scrolling/zoomed world camera plus a fixed 1× UI camera. Every display object must be handed to `world()` or `ui()`; an object given to neither draws twice, once scrolled and once not.

**Art pipeline** — Asset packs for era worlds and NPCs (re-tinted per era); hand-made only for Alexei's sprite, Harley's sprite, and the 4 memory icons. Do NOT plan to hand-draw the worlds. Until those land, `src/placeholders.js` generates every texture procedurally at runtime in the BW2 register — swapping in real art must not change a single texture key.

**Outfits are drawn, not tinted** — Alexei's outfit color is baked into her sprite. A whole-sprite tint stains her skin and hair with the shirt color, which is why `OUTFIT_TINTS` became `OUTFIT_COLORS`.

**Structure** — Four eras, chronological. Each era is one 30×20 map; growing a map beyond that is scope creep.

**No save state** — The game holds no persistent data. One ~10-minute sitting, fresh from the title screen each play.

**Out of scope (v1)** — No battle system, enemies, leveling, catchable creatures, minigames, mobile support, or characters beyond Alexei/Harley/generic NPCs.

**Desktop only** — No mobile layout or touch controls.

## Personal Content — Harley Writes, Claude Uses Placeholders

The following must come from Harley, never invented by Claude. Use clearly marked `// TODO: Harley writes this` placeholders when scaffolding:
- The **drift-era** and **now-era settings** (open decisions)
- All **NPC lines** (playlist lyrics + any real lines)
- Each era's **memory scene text**
- The **ending personal message** (the most important text in the game)
- **Reference photos** for Alexei's and Harley's sprites

## Confirmed Music Playlist

Roughly one song per era, plus title and ending (per-era assignment is Harley's to finalize):

1. "3005" — Childish Gambino
2. "Nothing On You" — Bruno Mars
3. "August" — 4rif
4. "I Love You So" — The Walters
5. "Lover Is a Day" — Cuco
6. "Lost Without You" — Robin Thicke
7. "P.S. I Love You" — Paul Partohap

## Key Docs

- `docs/superpowers/specs/2026-07-05-para-ti-v2-design.md` — **v2 design spec (source of truth)**
- `1_Project_Glossary.md` — Shared vocabulary (era, memory, EraScene, the drift, etc.)
- `2_Vision_and_Scope.md` — Business requirements and scope boundaries
- `3_Use_Cases.md` — Gameplay use cases
- `4_Art_Direction.md` — Visual specs, art pipeline, character design
- `5_Level_Design_Spec.md` — The four eras, memories, NPCs, ending
- `tech-stack-dev-plan.md` — Development roadmap (⚠️ predates v2 — update before use)
