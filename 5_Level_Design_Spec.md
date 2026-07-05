# Para Ti — World & Level Design Spec
### Version 2.0

> Redesign source of truth: `docs/superpowers/specs/2026-07-05-para-ti-v2-design.md`
>
> ⚠️ **NOTE FOR CLAUDE:** Sections marked [TODO — Harley] use placeholders. Do not invent
> personal content, settings, or dialogue. Build scaffolds with clear TODO comments.
> Sections marked [CONFIRMED] are ready to implement.

---

## Global Rules

- **Structure:** Four era-worlds played in chronological order. Each is a **single
  screen** (~10-minute total game). Fade transition between eras.
- **One reusable EraScene:** all four eras run through one Phaser scene, data-driven by an
  era config (tilemap, palette/tint, music, objective, NPC lines, memory). Not four
  bespoke scenes.
- **Player spawns** at a clear point at the start of each era.
- **Movement:** arrow keys or WASD, 4-direction. No jumping, no gravity. Space/Enter to
  interact.
- **No combat, no enemies, no minigames.** Explore → objective → memory.
- **No save.** One sitting.

---

## The Four Eras

Her passions (fitness, movies, faith, the 7-song playlist) appear as **scenery in every
era** — a gym detail here, a marquee there, a small chapel, townsfolk humming the
playlist. They are texture, not separate levels.

### Era 1 — Childhood (2nd grade) · [CONFIRMED setting]

| Field | Detail |
|---|---|
| **Setting** | **The classroom** where they first met as seven-year-olds. |
| **Objective** | Find the note passed to her. |
| **Memory** | The first spark. ⚠️ *[Scene text — Harley]* |
| **Mood** | Bright, innocent. |
| **NPCs** | A few classmates. ⚠️ *[Lines — Harley]* |

### Era 2 — Young love (high school) · [CONFIRMED setting]

| Field | Detail |
|---|---|
| **Setting** | **The hill overlooking the city**, where they'd sit together. |
| **Objective** | Reach the top of the hill. |
| **Memory** | First real love. ⚠️ *[Scene text — Harley]* |
| **Mood** | Warm, golden. |
| **NPCs** | HS-era townsfolk. ⚠️ *[Lines — Harley]* |

### Era 3 — The drift (the breakup / off-and-on) · [TODO — Harley: setting]

| Field | Detail |
|---|---|
| **Setting** | ⚠️ *[TODO — Harley decides.]* Option on the table: **the same hill, alone, in grey rain** — the place that held both of them, now empty. |
| **Objective** | Climb back / cross the rain to the spot. |
| **Memory** | "I never stopped finding my way back." ⚠️ *[Scene text — Harley]* |
| **Mood** | Short, muted. **One screen, one honest breath** — not a dark world. |
| **NPCs** | Few or none — emptiness is the point. |

### Era 4 — Now, for good (college) · [TODO — Harley: setting]

| Field | Detail |
|---|---|
| **Setting** | ⚠️ *[TODO — Harley decides.]* Option on the table: **the same hill at full sunset, Harley already waiting.** |
| **Objective** | Reach the final spot where Harley waits. |
| **Memory** | The two of you, now. ⚠️ *[Scene text — Harley]* |
| **Mood** | Radiant, resolved. |
| **NPCs** | Warm college-era townsfolk; passions bloom back in full color. ⚠️ *[Lines — Harley]* |

**Recurring-hill option (offered, not locked):** Eras 2–4 can be the *same hill* relit
across three seasons (golden → grey rain → sunset), with the classroom as the distinct
origin. Emotionally strong and art-efficient (one hill tileset, re-tinted). Harley was
undecided — this is his call to make later.

---

## Memories (replaces v1 hearts)

- One memory per era, 4 total.
- Each is a small hand-made pixel **memory icon** + a short scene.
- Collecting a memory plays its scene and unlocks the next era.
- All four are held and **replayed in the ending montage**.
- ⚠️ *[Memory icons — hand-made art. Scene text — Harley writes.]*

---

## NPCs

- A small number per era (roughly 3–4 max), from asset-pack townsfolk sprites, re-tinted
  per era mood.
- **Behavior:** short back-and-forth patrol; stop and face the player when interacted with.
- **Dialogue format:**
  ```
  [NPC name or "Townsperson"]
  "[LINE — a playlist lyric and/or a real line]"
    — "Song Title," Artist   (shown only when the line is a lyric)
  ```
- NPCs are **optional flavor** — never required to progress.
- ⚠️ *[All NPC lines — Harley writes. Use "[ NPC LINE ]" placeholders during build.]*

**Playlist to pull lyrics from:**
- "3005" — Childish Gambino
- "Nothing On You" — Bruno Mars
- "August" — 4rif
- "I Love You So" — The Walters
- "Lover Is a Day" — Cuco
- "Lost Without You" — Robin Thicke
- "P.S. I Love You" — Paul Partohap

---

## Ending Sequence

1. Era 4 memory collected.
2. The 4 memories replay as a short montage/constellation.
3. Music shifts to the ending song. *(Proposed: "P.S. I Love You" — Harley's call.)*
4. Camera pans slowly toward the pixel sunset (warm oranges, pinks, purples; town/hill
   silhouettes in the foreground).
5. Screen settles on **Harley's personal message.** ⚠️ *[Text — Harley writes. This is the
   most important text in the game.]*
6. Both characters shown together.
7. "Play Again" appears quietly in a corner.

---

## Notes for Claude During Build

1. **Build the reusable EraScene first** — one scene, driven by an era config object. Prove
   the full loop with placeholder tiles: spawn → objective → memory → next era.

2. **Test the full chain end-to-end early:** Title → Outfit → Era 1 → Era 2 → Era 3 →
   Era 4 → Ending. Make the skeleton walk before any polish.

3. **Placeholder all personal content** with `// TODO: Harley writes this` — NPC lines,
   memory scene text, the ending message, and the drift/"now" settings.

4. **Keep each era to one screen.** If an era wants to grow, that's scope creep — stop.

5. **Re-tint, don't redraw.** Use one asset pack across eras with per-era palette/tint for
   mood, rather than sourcing separate art per era.
