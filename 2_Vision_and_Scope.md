# Para Ti — Vision and Scope
### Version 2.0

> Redesign source of truth: `docs/superpowers/specs/2026-07-05-para-ti-v2-design.md`

---

## 1. Introduction

### 1.1 Background

**Para Ti** ("For You") is a personal project built by Harley as a gift for **Alexei**.
It is a browser-based, desktop-only top-down Pokémon-style **story-RPG** — a ~10-minute
playthrough that retraces Harley and Alexei's real fifteen-year history across four small
pixel-art era-worlds, ending on the two of them together, for good.

The game is delivered as a URL — she clicks the link, the title screen appears, and she
plays start to finish in one sitting. No download. No account.

### 1.2 The moment it's for

Harley and Alexei have known each other since 2nd grade. They liked each other through
years of school, dated in high school, broke up junior year, and were on-and-off until
now — junior year of college. Harley will ask Alexei to be his girlfriend **in real
life**; this game is given to her **afterward**, as a celebration keepsake. It is not the
proposal itself, so it carries no suspense — it is pure warmth and remembrance.

### 1.3 The problem it solves

Generic gifts don't reflect who someone is or what a relationship survived. This game is
something only Harley could make — because only Harley lived these fifteen years with her.
Her passions (fitness, movies, faith, their shared playlist) and their real milestones are
built into every screen.

---

## 2. Project Requirements

### 2.1 Vision Statement

| For | Alexei |
|---|---|
| Who | Has grown up alongside Harley for fifteen years and is now, for good, his |
| The product | **Para Ti** |
| That | Is a ~10-minute browser story-RPG that retraces their real history across four era-worlds, in retro Pokémon-Red pixel art |
| Unlike | Any gift you can buy, and unlike a simple scavenger hunt |
| Our product | Was made by Harley, for her — so playing it feels like being truly known |

### 2.2 Objectives

**OBJ-1:** Deliver a complete, ~10-minute playable story-RPG she can open via URL.

**OBJ-2:** Title screen matches the approved design exactly — dark navy, "PARA TI,"
"from harley," "[ PLAY ]."

**OBJ-3:** Alexei's character looks like her — Pokémon Red pixel art, curly hair worn
down, beauty mark above the LEFT side of the lip, athletic build, warm medium-brown skin.

**OBJ-4:** Four era-worlds, in chronological order, tell the real arc: **Childhood →
Young love → The drift → Now, for good.**

**OBJ-5:** Each era hides one **memory** to collect; collecting it unlocks the next era.
The four memories pay off in the ending.

**OBJ-6:** Her passions (fitness, movies, faith, the 7-song playlist) appear as living
scenery — NPCs, buildings, details — inside every era.

**OBJ-7:** The ending replays the memories, pans to a pixel sunset, shows Harley's
personal message, and ends on both characters together. ⚠️ *[Message text — Harley writes]*

**OBJ-8:** Music from their relationship plays throughout, mapped roughly one song per era.

### 2.3 Risks

**RI-1:** Scope creep back toward "a full Pokémon game." *(Mitigation: this is a
story-RPG with light mechanics — no battle engine, no minigames in v1. See Scope §4.2.)*

**RI-2:** Art volume stalls the build. *(Mitigation: asset packs do the worlds and NPCs;
only Alexei, Harley, and 4 memory icons are hand-made.)*

**RI-3:** The eras feel generic without the real personal content. *(Mitigation: memory
scenes and NPC lines are the most important content. Harley writes them. Two era settings
— the drift and "now" — are Harley's open decisions.)*

**RI-4:** The character doesn't look enough like her. *(Mitigation: Harley provides a
reference photo in the build session. Curly hair and beauty mark are non-negotiable.)*

### 2.4 Assumptions & Dependencies

**AS-1:** Desktop browser only (Chrome, Safari, Firefox). No mobile support.

**AS-2:** Harley provides reference photos, all NPC lines, memory scene text, the ending
message, and the drift/"now" era settings before final build.

**AS-3:** Harley art-directs and makes all creative/personal decisions; Claude does all
engineering.

**DE-1:** Phaser 3 (JavaScript game framework).

**DE-2:** Tiled (free tilemap editor) for the era maps.

**DE-3:** GitHub Pages / Netlify / Vercel for free static hosting.

---

## 3. Audience

**Primary:** Alexei. She receives the URL, opens it on her laptop, and plays it once
through after Harley asks her in real life.

**Secondary:** People Harley shows it to as a project he built.

---

## 4. Scope

### 4.1 What's In

- Title screen (exact design confirmed, unchanged)
- Outfit selection (Casual / Athletic — 2 options)
- **Four era-worlds** in chronological order, each ~1 screen: Childhood, Young love,
  The drift, Now/for good
- One light **objective** per era
- **Memory** collectible in each era (4 total); collecting unlocks the next era
- NPCs with dialogue — playlist lyrics and/or real lines
- Ending: memory montage → sunset pan → personal message → both characters together
- Playlist of 7 confirmed songs, roughly one per era

### 4.2 What's Out (v1)

- Mobile / touch support
- Battle system, enemies, leveling, catchable creatures
- Save states / checkpoints (one-sitting play only)
- Per-era custom minigames
- Any character beyond Alexei, Harley, and generic NPCs
- More than four eras

### 4.3 Deployment

Static web app hosted on GitHub Pages / Netlify / Vercel. Alexei receives a URL, opens it
in a desktop browser, and plays immediately.
