# Para Ti — v2 Design Spec
### Story-RPG redesign · 2026-07-05

> This is the **source of truth** for the Para Ti redesign. The five project docs
> (`1_Project_Glossary`, `2_Vision_and_Scope`, `3_Use_Cases`, `4_Art_Direction`,
> `5_Level_Design_Spec`) and `CLAUDE.md` all descend from this spec. Where they
> disagree, this document wins.

---

## 1. What changed, and why

**v1** was a ~10-minute scavenger hunt: one town, three buildings, collect 3 hearts,
find a bench, sunset. It had a *look* but no *story*.

**v2** is a **~10-minute story-RPG keepsake**. It keeps the retro Pokémon-Red
aesthetic but adds a real emotional arc: it retraces Harley and Alexei's actual
fifteen-year history across four small era-worlds, ending on the two of them,
together, for good.

The recipient is **Alexei**. She is not yet Harley's girlfriend when the game is
built — the game is given to her **after Harley asks her in real life**, as a
celebration keepsake, not as the proposal itself. This removes all "must land the
question" pressure: the ending is pure warmth.

---

## 2. Locked decisions

| Decision | Value |
|---|---|
| **Genre** | Story-RPG, light mechanics (no battle engine) |
| **Recipient** | Alexei |
| **When given** | After Harley asks her in real life — a celebration keepsake |
| **Story style** | Blend: real emotional spine, fun themed skin |
| **Real arc** | 2nd grade → school-long crush → HS dating → jr-year breakup → off/on → now (jr year of college), for good |
| **Emotional shape** | Mostly sweet; **one** honest bittersweet beat (the drift), then warmth |
| **Structure** | Timeline is the spine — 4 era-worlds in chronological order |
| **Passions** | Fitness, movies, faith, the playlist — **scenery throughout**, not separate levels |
| **Core loop** | explore → one small objective → talk to NPCs → find the hidden **memory** → next era unlocks |
| **Collectible** | 4 **memories** (one per era) replace v1's 3 hearts; they pay off in the ending |
| **Length** | ~10 minutes total; ~1 screen per era |
| **Save** | None — one sitting, resets fresh each play |
| **Art pipeline** | Asset-pack tiles/NPCs for the worlds; hand-made only for **Alexei, Harley, and the 4 memory icons** |
| **Tech** | Phaser 3 + Vite + Tiled + Press Start 2P; static host; desktop-only |
| **Roles** | Harley art-directs & provides all personal content; Claude does all engineering |
| **Title screen** | Unchanged from v1 (finalized) |

---

## 3. The four eras (the spine)

Chronological. Her passions appear as texture in every one.

| # | Era | Setting | Objective | Memory | Mood / palette |
|---|-----|---------|-----------|--------|----------------|
| 1 | **Childhood** (2nd grade) | **The classroom** *(sacred, confirmed)* | Find the note passed to her | The first spark | Bright, innocent |
| 2 | **Young love** (high school) | **The hill overlooking the city** *(sacred, confirmed)* | Reach the top of the hill together | First real love | Warm, golden |
| 3 | **The drift** (the breakup / off-and-on) | ⚠️ **TODO — Harley decides.** One option on the table: *the same hill, alone, in grey rain.* | Climb back / cross the rain | "I never stopped finding my way back" | Short, muted — **one screen only** |
| 4 | **Now, for good** (college) | ⚠️ **TODO — Harley decides.** One option: *the same hill at full sunset, Harley already waiting.* | Reach the final spot | The two of you, now | Radiant, resolved |

**Note on the recurring-hill option:** Eras 2–4 could all be the *same hill* relit
across three seasons of the relationship (golden → grey rain → sunset), with the
classroom as the distinct origin. This is emotionally strong and art-efficient, but
**Harley was undecided** — it is offered, not locked. The drift and "now" settings
are open decisions Harley fills in later, exactly like the NPC lyrics and ending
message.

---

## 4. Core gameplay loop

Identical structure in every era (built once, reused four times):

```
enter era → complete one small objective → (optionally) talk to NPCs
          → find the hidden MEMORY → short memory scene plays
          → next era unlocks
```

- **Objective** is light and single: find a note, reach a spot, cross a screen.
  Never a puzzle that can hard-block a non-gamer.
- **NPCs** are optional flavor. Each speaks a line — a playlist lyric and/or a real
  line Harley writes — with song attribution when it's a lyric.
- **Memory** is the one required collectible per era. Collecting it plays a short
  scene (a few lines + the memory icon) and unlocks the next era.
- The 4 collected memories are held and **replayed in the ending**.

---

## 5. Scene flow (Phaser)

```
BootScene → TitleScene → OutfitScene → EraScene(1..4) → EndScene
```

- **EraScene is a single reusable scene** parameterized by era config (tilemap,
  palette/tint, music track, objective, NPC lines, memory). This is the key
  engineering decision: one scene, four data-driven configs — not four bespoke
  scenes. It keeps the build small and consistent.
- OutfitScene is retained from v1 (Casual / Athletic, 2 options).
- No save/checkpoint layer.

---

## 6. Ending

1. Final (era 4) memory collected.
2. The 4 memories replay as a short constellation/montage.
3. Camera pans to the pixel sunset (warm oranges, pinks, purples).
4. **Harley's personal message** appears. ⚠️ *TODO — Harley writes this.*
5. Both sprites shown together on the bench/hilltop.
6. "Play Again" tucked quietly in a corner.

---

## 7. Music map (proposed — Harley's to finalize)

These are Harley's songs; placement is his call. Starting point:

| Moment | Song |
|---|---|
| Title | *I Love You So* — The Walters |
| Era 1 — Childhood | *August* — 4rif |
| Era 2 — Young love | *Nothing On You* — Bruno Mars |
| Era 3 — The drift | *Lost Without You* — Robin Thicke |
| Era 4 — Now | *Lover Is a Day* — Cuco |
| Ending | *P.S. I Love You* — Paul Partohap |
| Floating NPC lyrics | *3005* — Childish Gambino (anywhere) |

Always ship both MP3 and OGG for browser compatibility.

---

## 8. Art plan

- **Worlds & townsfolk NPCs:** free/paid 16×16 top-down RPG asset packs (itch.io etc.),
  laid out in Tiled. Re-tinted per era for mood.
- **Hand-made (the only custom art):**
  - **Alexei's sprite** — curly hair worn down, beauty mark above the LEFT side of the
    lip (viewer's right), athletic build, warm medium-brown skin (Mexican/Asian).
    Non-negotiable features. From a reference photo Harley provides.
  - **Harley's sprite** — from a reference photo; appears seated at the ending.
  - **4 memory icons** — one small custom pixel icon per era.
- Title screen art is unchanged (finalized).

---

## 9. Scope guardrails (what keeps this shippable)

- **10 minutes, 1 screen per era.** No era grows past a single screen without a reason.
- **One reusable EraScene.** No bespoke per-era engines. No minigames in v1.
- **No save system.** One sitting.
- **Asset packs do 90% of the art.** Custom art limited to 3 sprites + 4 icons.
- **Personal content is Harley's, always placeholdered by Claude** (see §10).

---

## 10. Personal content — Harley writes, Claude placeholders

Claude never invents these. They ship as clearly-marked `// TODO: Harley writes this`:

- Drift-era and "now"-era **settings** (open decisions)
- All **NPC lines** (playlist lyrics + any real lines)
- Each era's **memory scene text**
- The **ending message**
- **Reference photos** for Alexei's and Harley's sprites

---

## 11. Out of scope (v1 ship)

- Mobile / touch
- Battle system, enemies, leveling, catchable creatures
- Save states / checkpoints
- Per-era custom minigames
- Any character beyond Alexei, Harley, and generic NPCs
- More than 4 eras

Post-v1 expansion ideas (not now): minigames per era, a longer college chapter,
extra hidden memories.
