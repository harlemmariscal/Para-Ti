# Para Ti — Art Direction & Visual Spec
### Version 2.0

> Redesign source of truth: `docs/superpowers/specs/2026-07-05-para-ti-v2-design.md`
>
> ⚠️ **NOTE FOR CLAUDE:** [TODO — Harley] sections use placeholders only. Do not invent
> personal details. Confirmed sections must be followed precisely.

---

## 1. Overall Visual Style

**Style:** Pokémon Red/Blue Game Boy Color era — top-down overworld pixel art.
- 16×16px tiles for the environment
- Player and NPC sprites: ~16×32px (2 tiles tall)
- Bold black outlines on all sprites
- Limited color palettes per area (8–16 colors)
- Clear silhouettes — every sprite readable at small size

**Reference:** the Pokémon Red/Blue overworld — that exact feel and scale.

**Per-era mood via tint:** the four eras share asset-pack art, re-tinted for mood —
bright (Childhood), golden (Young love), grey/muted (Drift), sunset (Now).

---

## 2. Art Pipeline (v2 — how the pixels get made)

**This is the decision that keeps the game shippable.** The world does not need to be
hand-drawn to feel personal; the two characters do.

| Category | Source |
|---|---|
| Era environments / tiles | **Asset packs** (free/paid 16×16 top-down RPG tilesets, e.g. itch.io), laid out in Tiled, re-tinted per era |
| Townsfolk NPC sprites | **Asset packs** (generic Pokémon-style walk cycles), re-tinted per era |
| **Alexei's sprite** | **Hand-made** — from Harley's reference photo (§3) |
| **Harley's sprite** | **Hand-made** — from Harley's reference photo (§4) |
| **4 memory icons** | **Hand-made** — one small custom pixel icon per era |
| Title screen | Unchanged (finalized, §5) |

> Supersedes v1, which assumed everything was custom Piskel art. Only the two characters
> and the four memory icons are hand-made now.

---

## 3. Player Character — Alexei (CONFIRMED DETAILS)

### Physical Features

| Feature | Description |
|---|---|
| **Hair** | Curly, voluminous, worn down past the shoulders. Dark brown/black. In pixel art: a rounded chunky silhouette above and around the head. |
| **Beauty Mark** | Small filled pixel dot above the LEFT side of her lip (her perspective) — appears on the viewer's RIGHT on the sprite. **NON-NEGOTIABLE**, must be visible at sprite size. |
| **Build** | Athletic. Medium height. |
| **Skin Tone** | Warm medium brown (Mexican/Asian heritage, reads more Mexican). 2–3 shades of highlight/shadow. |
| **Heritage** | Mexican and Asian |

### Outfit Options

Two only:
- **Casual** — ⚠️ *[TODO — sprite provided by Harley]*
- **Athletic** — ⚠️ *[TODO — sprite provided by Harley]*

### Animations (top-down)

| Animation | Frames | Notes |
|---|---|---|
| Walk Down | 4 | Toward camera |
| Walk Up | 4 | Away from camera |
| Walk Left | 4 | Side view |
| Walk Right | 4 | Mirrored from left |
| Idle | 2 | Gentle idle |

### Photo Reference

⚠️ *[TODO — Harley pastes a reference photo into the build session. Match hair curl, face
shape, beauty mark placement, skin tone — within Pokémon Red pixel constraints.]*

---

## 4. Partner Character — Harley (PARTIALLY CONFIRMED)

**Role:** appears in the final era (Now, for good), already waiting where Alexei arrives,
and in the ending, seated beside her.

**Sprites needed:** a standing/seated sprite for the final era + ending.

⚠️ *[TODO — Harley pastes a reference photo into the build session. Placeholder male sprite
in matching pixel style until then.]*

---

## 5. Title Screen (FINALIZED — DO NOT DEVIATE)

| Element | Spec |
|---|---|
| Background | Dark navy (#0d0d1a or close) |
| "PARA TI" | Large white pixel font, centered, upper third |
| "from harley" | Soft pink pixel font, centered, below the title |
| "[ PLAY ]" | Darker pink/mauve pixel font, centered, lower third |
| Font | Press Start 2P (Google Fonts) throughout |
| Music | Title track begins softly on this screen |

Must match the reference screenshot exactly.

---

## 6. NPC Characters

- A small cast per era (~3–4 max), from asset-pack townsfolk sprites.
- Standard Pokémon-style 4-direction walk cycles.
- Re-tinted per era mood; no two visible NPCs identical.
- ⚠️ *[Specific appearances flexible — asset-pack sprites are fine.]*

---

## 7. Memory Icons (hand-made)

- One small custom pixel icon per era (4 total), representing that memory.
- Readable at small size; matches the game's outline/palette style.
- Floats up on collection; all four appear in the ending montage.
- ⚠️ *[Designs — Harley art-directs.]*

---

## 8. Era Environments

Each era is a single screen built from asset-pack tiles, re-tinted for mood. Her passions
(gym/fitness details, movie marquee, small chapel/faith detail, playlist references)
appear as scenery across the eras.

- **Era 1 — Childhood:** the classroom. Bright, innocent palette. [CONFIRMED]
- **Era 2 — Young love:** the hill over the city. Warm golden palette. [CONFIRMED]
- **Era 3 — The drift:** ⚠️ *[TODO — Harley]*. Grey/muted palette. One screen.
- **Era 4 — Now, for good:** ⚠️ *[TODO — Harley]*. Sunset palette; Harley present.

---

## 9. Dialogue Box

Pokémon-style:
- Bottom of the screen, dark background with light border
- White pixel font
- Speaker name at the top
- Song attribution in smaller italic below a lyric: *— "Song Title," Artist Name*
- Space/Enter to dismiss

---

## 10. UI Elements

| Element | Spec |
|---|---|
| Memory tracker | Corner of the screen. Shows memories collected (e.g. ✦ ✦ ✧ ✧ for 2/4). |
| Font | Press Start 2P throughout |
| Color scheme | Matches title screen — dark backgrounds, white and pink text |

---

## 11. Ending Sequence Visuals

**Memory montage:** the four collected memory icons replay together (constellation/row).

**Sunset pan:**
- Warm pixel sky, deep blue → orange → pink → purple at the horizon
- Silhouettes of the hill/town and trees in the foreground
- Camera pans slowly toward the sunset; smooth fade

**Ending screen:**
- Both characters together
- Warm sunset palette
- **Harley's personal message.** ⚠️ *[TODO — Harley writes]*
- Soft ending music
- "Play Again" visible but unobtrusive

---

## 12. Working With Photos in Claude (Build Session)

1. Paste a photo of Alexei: *"Create a top-down Pokémon Red overworld sprite based on this
   person. Non-negotiable: curly hair worn down, beauty mark above the LEFT side of the
   lip, athletic build, warm medium-brown skin. 16×32px, top-down."*
2. Paste a photo of Harley: *"Create a matching top-down partner sprite in the same style;
   he appears in the final scene."*
3. Refine the sprites in Piskel (piskelapp.com) from Claude's guidance. Everything else
   (worlds, NPCs) comes from asset packs — no need to hand-draw them.
