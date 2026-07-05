# Para Ti — Use Cases
### Version 2.1

> Redesign source of truth: `docs/superpowers/specs/2026-07-05-para-ti-v2-design.md`
>
> The original 8 narrative use cases are expanded here into **16 dependency-ordered
> capabilities.** They are listed in **build order**: UC-1 is the root that everything
> else needs; each use case depends only on the ones before it. Build top to bottom.

---

## Dependency / Build Order

```
FOUNDATION (engine)
  UC-1  Boot & load assets        ── root, depends on nothing
  UC-2  View the title screen     ← UC-1
  UC-3  Start the game (Play)     ← UC-2
  UC-4  Select an outfit          ← UC-3
  UC-5  Load an era (EraScene)    ← UC-4      ★ reusable engine core
  UC-6  Move the player           ← UC-5
  UC-7  Collide with the world    ← UC-6

CORE LOOP (gameplay — repeats per era)
  UC-8  Interact with an object   ← UC-6      ★ generic interaction system
  UC-9  Read a dialogue box       ← UC-8
  UC-10 Talk to an NPC            ← UC-9
  UC-11 Complete an era objective ← UC-8
  UC-12 Find & collect a memory   ← UC-11, UC-9
  UC-13 Memory tracker updates    ← UC-12
  UC-14 Advance to the next era   ← UC-12     (loops UC-5→UC-14 for eras 1→4)

ENDING
  UC-15 Collect the final memory  ← UC-14
  UC-16 Trigger the ending        ← UC-15
```

**Maps to build phases:** UC-1→UC-7 = Phase 1 (Foundation); UC-8→UC-16 = Phase 2 (Core
Loop, end to end). See `tech-stack-dev-plan.md`.

**Traceability to the original 8:** old UC-1→new UC-2 · old UC-2→UC-4 · old UC-3 (explore)
→UC-5/6/7 · old UC-4 (NPC)→UC-8/9/10 · old UC-5→UC-11 · old UC-6→UC-12/13/14 · old UC-7
→UC-15 · old UC-8→UC-16. (Boot UC-1 and Start UC-3 were implicit before; now explicit.)

---

## FOUNDATION

### UC-1: Boot & Load Assets
| Field | Detail |
|---|---|
| **Depends on** | — (root) |
| **Enables** | Everything |
| **Actor** | System (BootScene) |
| **Trigger** | Page loads at the game URL |
| **Postconditions** | All assets in memory; TitleScene starts |
| **Normal Flow** | 1. BootScene starts. 2. Preloads sprites, tilemaps, audio, and the Press Start 2P font. 3. Shows a minimal loading state. 4. On complete, hands off to TitleScene. |
| **Priority** | Critical |

### UC-2: View the Title Screen
| Field | Detail |
|---|---|
| **Depends on** | UC-1 |
| **Actor** | Player (Alexei) |
| **Trigger** | Boot completes |
| **Postconditions** | Title displayed; title music playing |
| **Normal Flow** | 1. Dark navy background. 2. "PARA TI" white pixel font upper third; "from harley" soft pink below; "[ PLAY ]" darker pink lower third. 3. Title music begins softly. |
| **Priority** | Critical |
| **Notes** | Must match the approved screenshot exactly. |

### UC-3: Start the Game
| Field | Detail |
|---|---|
| **Depends on** | UC-2 |
| **Actor** | Player |
| **Trigger** | Clicks [ PLAY ] |
| **Postconditions** | OutfitScene loads |
| **Normal Flow** | 1. Player clicks [ PLAY ]. 2. Fade transition from TitleScene to OutfitScene. |
| **Priority** | Critical |

### UC-4: Select an Outfit
| Field | Detail |
|---|---|
| **Depends on** | UC-3 |
| **Enables** | Player sprite used from UC-5 on |
| **Actor** | Player |
| **Trigger** | OutfitScene loads |
| **Postconditions** | Outfit stored; Era 1 requested |
| **Normal Flow** | 1. Two options side by side: Casual, Athletic — each showing a preview of Alexei's sprite. 2. Player selects one (preview updates on switch). 3. Confirm button appears. 4. Player confirms → chosen outfit stored → Era 1 loads. |
| **Priority** | High |
| **Notes** | ⚠️ *[Outfit sprites — Harley provides.]* Exactly 2 options. |

### UC-5: Load an Era (EraScene from config) ★
| Field | Detail |
|---|---|
| **Depends on** | UC-4 |
| **Enables** | UC-6 through UC-14 |
| **Actor** | System (EraScene) |
| **Trigger** | An era is requested (Era 1 after outfit; later eras via UC-14) |
| **Postconditions** | The era's single-screen world is built; player spawned; era music playing |
| **Normal Flow** | 1. EraScene reads an **era config** object (tilemap, palette/tint, music, objective, NPC lines, memory). 2. Builds the single-screen tilemap with its collision layer. 3. Applies the era's tint/mood. 4. Spawns the player (with chosen outfit). 5. Starts the era's music. 6. On Era 1, a brief intro line frames the journey. |
| **Priority** | Critical |
| **Notes** | **The reusable engine core.** All four eras run through this one scene; an era is a data config, not a new scene. Eras: 1 Childhood (classroom), 2 Young love (hill), 3 The drift ⚠️*[TBD]*, 4 Now ⚠️*[TBD]*. |

### UC-6: Move the Player
| Field | Detail |
|---|---|
| **Depends on** | UC-5 |
| **Actor** | Player |
| **Trigger** | An era is loaded |
| **Postconditions** | Player moves around the screen |
| **Normal Flow** | 1. Arrow keys or WASD move the player in 4 directions. 2. Walk animation plays per direction; idle animation when still. No jumping, no gravity. |
| **Priority** | Critical |

### UC-7: Collide with the World
| Field | Detail |
|---|---|
| **Depends on** | UC-6 |
| **Actor** | Player |
| **Trigger** | Player moves toward a solid tile/object |
| **Postconditions** | Movement blocked |
| **Normal Flow** | 1. The era's collision layer blocks walls, edges, and solid objects. 2. Player cannot leave the screen or pass through scenery. |
| **Priority** | Critical |

---

## CORE LOOP (repeats per era)

### UC-8: Interact with an Object ★
| Field | Detail |
|---|---|
| **Depends on** | UC-6 |
| **Enables** | UC-9, UC-11, UC-12 |
| **Actor** | Player |
| **Trigger** | Player faces an interactable within range and presses Space/Enter |
| **Postconditions** | An interaction event fires for that object |
| **Normal Flow** | 1. When the player faces an interactable (NPC, memory, objective target, Harley) within range, a small prompt appears. 2. Player presses Space/Enter. 3. A generic interaction event fires, which the specific object handles. |
| **Priority** | Critical |
| **Notes** | **Generic system** — NPCs, memories, objectives, and Harley all build on this. Build it once. |

### UC-9: Read a Dialogue Box
| Field | Detail |
|---|---|
| **Depends on** | UC-8 |
| **Enables** | UC-10, UC-12 (memory scenes), UC-16 (message) |
| **Actor** | Player |
| **Trigger** | An interaction produces text |
| **Postconditions** | Text shown, then dismissed |
| **Normal Flow** | 1. A Pokémon-style box appears at the bottom: dark background, light border, speaker name, white pixel text. 2. Supports multi-line/paged text and smaller italic song attribution. 3. Space/Enter advances/dismisses. |
| **Priority** | Critical |

### UC-10: Talk to an NPC
| Field | Detail |
|---|---|
| **Depends on** | UC-9 |
| **Actor** | Player |
| **Trigger** | Interact with an NPC |
| **Postconditions** | NPC line shown |
| **Normal Flow** | 1. NPC stops and faces the player. 2. Dialogue box shows the NPC's line — a playlist lyric and/or a real line; song title + artist in italic when it's a lyric. 3. Dismiss → NPC resumes patrol. |
| **Priority** | Medium — NPCs are optional flavor, never required to progress |
| **Notes** | ⚠️ *[All NPC lines — Harley writes. Placeholder: "[ NPC LINE ]".]* |

### UC-11: Complete an Era Objective
| Field | Detail |
|---|---|
| **Depends on** | UC-8 |
| **Enables** | UC-12 |
| **Actor** | Player |
| **Trigger** | Player performs the era's one light task |
| **Postconditions** | Objective complete; the memory becomes reachable |
| **Normal Flow** | 1. Each era has one light objective (Childhood: *find the note*; Young love: *reach the hilltop*; Drift: *climb back/cross*; Now: *reach the final spot*). 2. Completing it reveals/unlocks the era's memory. |
| **Priority** | Critical |
| **Notes** | Never a puzzle that can hard-block. ⚠️ *[Drift & Now objectives finalize with their settings — Harley.]* |

### UC-12: Find & Collect a Memory
| Field | Detail |
|---|---|
| **Depends on** | UC-11, UC-9 |
| **Enables** | UC-13, UC-14 |
| **Actor** | Player |
| **Trigger** | Player interacts with the (now-reachable) memory |
| **Postconditions** | Memory collected and stored; short scene played |
| **Normal Flow** | 1. The memory is reachable after the objective. 2. Interact → collection cue (memory icon floats up, SFX). 3. A short memory scene plays via the dialogue box. 4. The memory is added to the player's collection (kept for the ending). |
| **Priority** | Critical |
| **Notes** | One memory per era; 4 total. ⚠️ *[Memory scene text — Harley writes.]* |

### UC-13: Memory Tracker Updates
| Field | Detail |
|---|---|
| **Depends on** | UC-12 |
| **Actor** | System (UI) |
| **Trigger** | A memory is collected |
| **Postconditions** | Tracker reflects progress |
| **Normal Flow** | 1. A corner UI element shows memories collected (e.g. ✦ ✦ ✧ ✧ for 2/4). 2. Updates immediately on each collect. |
| **Priority** | High |

### UC-14: Advance to the Next Era
| Field | Detail |
|---|---|
| **Depends on** | UC-12 |
| **Enables** | Loops back to UC-5 with the next era config |
| **Actor** | System |
| **Trigger** | An era's memory is collected (eras 1–3) |
| **Postconditions** | The next era loads |
| **Normal Flow** | 1. Collecting the memory unlocks the next era. 2. Fade transition. 3. EraScene loads the next config (UC-5). 4. This loop repeats for eras 1→2→3→4. |
| **Priority** | Critical |

---

## ENDING

### UC-15: Collect the Final Memory (Now, For Good)
| Field | Detail |
|---|---|
| **Depends on** | UC-14 (reaching Era 4) |
| **Enables** | UC-16 |
| **Actor** | Player |
| **Trigger** | Player reaches the memory in Era 4, where Harley waits |
| **Postconditions** | 4th memory collected; ending begins |
| **Normal Flow** | 1. In the final era, Harley's character is present at the destination. 2. Player reaches and interacts. 3. A final dialogue moment plays. ⚠️ *[Text — Harley writes.]* 4. The 4th memory is collected. 5. Instead of advancing (UC-14), the ending triggers (UC-16). |
| **Priority** | Critical |
| **Notes** | Emotional peak. No failure state — reaching it *is* the payoff; the game is given after Harley has already asked her in real life. |

### UC-16: Trigger the Ending
| Field | Detail |
|---|---|
| **Depends on** | UC-15 |
| **Actor** | System (EndScene) |
| **Trigger** | Final memory collected |
| **Postconditions** | Ending screen shown; Play Again available |
| **Normal Flow** | 1. The 4 collected memories replay as a short montage/constellation. 2. Music shifts to the ending song. 3. Camera pans slowly toward the pixel sunset. 4. Fade → Harley's personal message. ⚠️ *[Text — Harley writes.]* 5. Both characters shown together. 6. "Play Again" appears quietly in a corner (restart → UC-1/UC-2). |
| **Priority** | Critical |

---

## Business Rules

**BR-1:** The game is linear — eras play in chronological order; each unlocks the next via
its memory (UC-14).

**BR-2:** Each era has exactly one memory (4 total). Memories cannot be re-collected within
a play.

**BR-3:** NPC lines are optional flavor — talking to NPCs is never required to progress.

**BR-4:** Desktop only. No mobile optimization.

**BR-5:** The title screen must match the approved design exactly.

**BR-6:** Outfit selection offers exactly 2 options: Casual and Athletic.

**BR-7:** No save state. Each play starts fresh from the title screen and is completed in
one ~10-minute sitting.

**BR-8:** No battle system, enemies, leveling, or minigames in v1.
