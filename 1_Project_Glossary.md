# Para Ti — Project Glossary
### Version 2.0

> Redesign source of truth: `docs/superpowers/specs/2026-07-05-para-ti-v2-design.md`

---

## Table of Contents

1. Introduction
2. Definitions

---

## 1. Introduction

### 1.1 Purpose

This document defines the shared vocabulary used throughout the planning, design, and
development of **Para Ti** — a personal top-down Pokémon-style **story-RPG** built by
Harley as a gift for **Alexei**.

### 1.2 Scope

Applies to all Para Ti documents: Vision & Scope, Use Cases, Art Direction, Level Design
Spec, Tech Stack, and the v2 design spec.

---

## 2. Definitions

### 2.1 Core Game Concepts

**Para Ti** — ("For You" in Spanish) A browser-based, desktop-only top-down story-RPG built
as a gift for Alexei. A ~10-minute playthrough that retraces Harley and Alexei's real
fifteen-year history across four era-worlds in retro Pokémon-Red pixel art.

**Alexei** — The recipient. The player controls a custom character based on her.

**Harley** — The sender/creator. Appears in-game in the final era and the ending.

**Era / Era-world** — One of the four chronological chapters the player walks through:
**Childhood, Young love, The drift, Now (for good).** Each is a single screen with its own
setting, mood, objective, and memory. Eras play in order; each unlocks the next.

**EraScene** — The single reusable Phaser scene that runs all four eras, data-driven by a
per-era config (tilemap, palette/tint, music, objective, NPC lines, memory).

**The drift** — Era 3. The one honest, bittersweet beat representing the breakup and
off-and-on years. Short, muted, a single screen — not a dark world. ⚠️ *[Setting TBD —
Harley.]*

**Objective** — The one light task in each era (e.g. find the note, reach the hilltop).
Never a puzzle that can hard-block the player. Completing it makes the memory reachable.

**Memory** — The collectible in each era (4 total), the evolved successor to v1's "heart."
A small hand-made pixel icon + a short scene. Collecting one plays its scene, unlocks the
next era, and adds it to the ending montage.

**Memory montage** — The ending replay of all four collected memories together, just before
the sunset pan.

**Player Character (Alexei)** — Alexei's in-game avatar. Curly hair worn down, beauty mark
above the LEFT side of the lip, athletic build, warm medium-brown skin. Outfit chosen
before play.

**Partner Character (Harley)** — Harley's in-game avatar. Appears in the final era, waiting,
and beside Alexei in the ending.

**NPC (Non-Player Character)** — A townsperson within an era. Speaks a line — a playlist
lyric and/or a real line Harley writes. NPCs are optional flavor, never required to progress.

**Ending Scene** — The final sequence: memory montage → sunset pan → Harley's personal
message → both characters together → "Play Again." ⚠️ *[Message text TBD — Harley.]*

**Sunset Pan** — The cinematic transition at the end: the camera pans slowly toward a warm
pixel sunset before the ending screen settles.

---

### 2.2 Screens & Scenes

**Title Screen** — The first screen. Dark navy, "PARA TI" white, "from harley" soft pink,
"[ PLAY ]" darker pink. Matches the reference screenshot exactly.

**Outfit Selection Screen** — After Play. Choose Casual or Athletic; preview updates.
⚠️ *[Outfit sprites — Harley.]*

**Dialogue Box** — Pokémon-style text box at the bottom of the screen for NPC lines,
memory scenes, and messages. Shows speaker name and text.

**Scene** — A Phaser screen. Scenes in Para Ti: BootScene, TitleScene, OutfitScene,
**EraScene** (runs all four eras), EndScene.

---

### 2.3 Audio

**Playlist** — The confirmed songs, roughly one per era plus title and ending:
- "3005" — Childish Gambino
- "Nothing On You" — Bruno Mars
- "August" — 4rif
- "I Love You So" — The Walters
- "Lover Is a Day" — Cuco
- "Lost Without You" — Robin Thicke
- "P.S. I Love You" — Paul Partohap

⚠️ *[Per-era song assignments proposed in the v2 spec; Harley finalizes.]* Always ship both
MP3 and OGG.

**Sound Effects (SFX)** — Short cues for: footsteps, collecting a memory, interacting with
an NPC, and the ending transition.

---

### 2.4 Visual Style

**Art Style** — Pokémon Red/Blue Game Boy Color era top-down pixel art. 16×16px tiles,
~16×32px character sprites, bold black outlines, limited palettes, clear silhouettes.

**Art Pipeline** — Asset packs for era environments and NPCs (re-tinted per era); hand-made
only for Alexei's sprite, Harley's sprite, and the 4 memory icons.

**Pixel Font** — Press Start 2P (Google Fonts, free), used throughout.

**Per-era palette** — Bright (Childhood), golden (Young love), grey/muted (Drift), sunset
(Now).

**Sunset Palette** — Warm oranges, pinks, purples, golds used in the ending.

---

### 2.5 Technical

**Phaser 3** — The JavaScript game framework. Handles rendering, input, tilemaps, animation,
audio, camera, and scene flow.

**Tilemap** — Grid-based era maps built in Tiled (free), exported as JSON for Phaser.

**Top-Down Movement** — 4-direction (arrow keys or WASD). No jumping, no gravity.

**Collision** — Walls, edges, and objects block movement.

**No Save State** — The game holds no persistent data. Each play is a single ~10-minute
sitting, starting fresh from the title screen.

**Web App** — Runs in a desktop browser via a URL (GitHub Pages / Netlify / Vercel). No
download, no account. Desktop only.
