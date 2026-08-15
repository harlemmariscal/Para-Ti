import { HEX, OUTFIT_COLORS } from './constants.js';

// Procedural stand-in art in the Pokémon Black/White 2 register: soft shaded
// pixels, dark-hue outlines instead of pure black, a light source at top-left,
// and a contact shadow under everything that stands up.
//
// Still placeholders — Phase 3 swaps these for real spritesheets without
// changing a single key. The look, not the fidelity, is what these establish.

// Index 0 is the ground the era maps are authored with and 1 the solid; the
// extra grass indices are cosmetic variants sprinkled in at load time. A single
// ground tile repeated across a scrolling map reads as a visible lattice, which
// is exactly what BW2's varied ground avoids.
export const TILES = { GRASS: 0, BLOCK: 1, GRASS_A: 2, GRASS_B: 3, GRASS_C: 4 };
export const GRASS_VARIANTS = [TILES.GRASS, TILES.GRASS_A, TILES.GRASS_B, TILES.GRASS_C];

export const NPC_TEXTURE = 'npc';
export const HARLEY_TEXTURE = 'harley';
export const OBJECT_TEXTURES = { note: 'obj-note' };
export const PROP_TEXTURES = { tuft: 'prop-tuft', flower: 'prop-flower' };
export const MEMORY_TEXTURES = {
  era1: 'memory-era1', era2: 'memory-era2', era3: 'memory-era3', era4: 'memory-era4',
};

export const FACINGS = ['down', 'up', 'left', 'right'];
export const WALK_FRAMES = 3; // 0 = idle, 1 = left stride, 2 = right stride

// Outfit is baked into the sprite rather than applied as a whole-sprite tint —
// tinting the texture would wash Alexei's skin and hair through the shirt color.
export const playerTexture = (outfit, dir) => `player-${outfit ?? 'casual'}-${dir}`;
export const playerAnim = (outfit, dir) => `walk-${outfit ?? 'casual'}-${dir}`;

// One era memory each: spark gold, warm orange, rain blue, sunset rose.
const MEMORY_COLORS = {
  era1: 0xffe066, era2: 0xffa94d, era3: 0x74c0fc, era4: 0xff8787,
};

const OUTLINE = 0x241c2e;   // dark violet-grey; BW2 never outlines in pure black
const SHADOW = 0x000000;

// Alexei, per the non-negotiables in CLAUDE.md: curly hair worn down, warm
// medium-brown skin, athletic build, beauty mark above the LEFT side of the
// lip — which faces the viewer's RIGHT.
const ALEXEI = {
  skin: 0xc98d5e,
  skinShade: 0xa9714a,
  hair: 0x2b1b12,
  hairLit: 0x40291c,
  pants: 0x3a4256,
  shoes: 0x24242e,
  beautyMark: true,
};

const NPC_LOOK = {
  skin: 0xd8a87c, skinShade: 0xb5875f, hair: 0x4a3728, hairLit: 0x5d4636,
  shirt: 0x8a8fa3, shirtShade: 0x6f748a, pants: 0x494f60, shoes: 0x2b2b34,
};

// Harley reads cool against Alexei's warm shirt on purpose: era 4 puts the two
// of them side by side under a heavy sunset tint, and a pink-on-pink pair was
// impossible to tell apart there. Still a placeholder — his real sprite waits
// on reference photos.
const HARLEY_LOOK = {
  skin: 0xb97a4e, skinShade: 0x98603a, hair: 0x1f1610, hairLit: 0x342419,
  shirt: 0x3f7d78, shirtShade: 0x2d5c58, pants: 0x333a4d, shoes: 0x24242e,
};

// Fill a rect with a 1px outline already around it: draw the outline, inset the fill.
function plate(g, fill, x, y, w, h) {
  g.fillStyle(OUTLINE).fillRect(x, y, w, h);
  g.fillStyle(fill).fillRect(x + 1, y + 1, w - 2, h - 2);
}

// A standing 16x32 character. `look` supplies the palette, `dir` the facing,
// `frame` the stride. Origin is the strip offset so frames tile horizontally.
function drawPerson(g, ox, look, dir, frame) {
  const { skin, skinShade, hair, hairLit, shirt, shirtShade, pants, shoes } = look;

  // Contact shadow — the single cheapest thing that stops a sprite floating.
  g.fillStyle(SHADOW, 0.22).fillEllipse(ox + 8, 30, 13, 5);

  // Legs. The idle frame plants both; stride frames swap which leg reaches.
  const legs = [
    [[4, 24, 4, 6], [8, 24, 4, 6]],  // idle
    [[4, 24, 4, 7], [8, 24, 4, 4]],  // left reaches
    [[4, 24, 4, 4], [8, 24, 4, 7]],  // right reaches
  ][frame];
  for (const [lx, ly, lw, lh] of legs) {
    plate(g, pants, ox + lx, ly, lw, lh);
    g.fillStyle(shoes).fillRect(ox + lx + 1, ly + lh - 2, lw - 2, 1);
  }

  // Torso, with the light coming from the left so the right side sits in shade.
  plate(g, shirt, ox + 3, 13, 10, 12);
  g.fillStyle(shirtShade).fillRect(ox + 9, 14, 3, 10);

  // Arms
  if (dir === 'left') {
    plate(g, skin, ox + 2, 15, 3, 7);
  } else if (dir === 'right') {
    plate(g, skin, ox + 11, 15, 3, 7);
  } else {
    plate(g, skin, ox + 1, 15, 3, 7);
    plate(g, skin, ox + 12, 15, 3, 7);
  }

  // Head: hair mass first, face carved into it. Curly hair worn down means
  // volume at the sides, so the mass is wider than the face beneath it.
  plate(g, hair, ox + 3, 2, 10, 12);
  g.fillStyle(hairLit).fillRect(ox + 4, 3, 4, 2);          // top-left highlight
  g.fillStyle(hair).fillRect(ox + 2, 6, 1, 5);              // side curl volume
  g.fillStyle(hair).fillRect(ox + 13, 6, 1, 5);

  if (dir === 'up') {
    // Facing away: all hair, no face. A nape shadow keeps it from reading flat.
    g.fillStyle(hairLit).fillRect(ox + 6, 11, 4, 1);
    return;
  }

  const face = dir === 'left' ? [4, 5] : dir === 'right' ? [7, 5] : [5, 6];
  const [fx, fw] = face;
  g.fillStyle(skin).fillRect(ox + fx, 7, fw, 6);
  g.fillStyle(skinShade).fillRect(ox + fx + fw - 1, 8, 1, 5); // jaw shade

  if (dir === 'down') {
    g.fillStyle(OUTLINE).fillRect(ox + 6, 9, 1, 1).fillRect(ox + 9, 9, 1, 1);
    g.fillStyle(skinShade).fillRect(ox + 7, 11, 2, 1);       // mouth
    // Beauty mark: above the left side of her lip → viewer's right.
    if (look.beautyMark) g.fillStyle(0x6b4a30).fillRect(ox + 9, 10, 1, 1);
  } else {
    const eye = dir === 'left' ? 5 : 9;
    g.fillStyle(OUTLINE).fillRect(ox + eye, 9, 1, 1);
    g.fillStyle(skinShade).fillRect(ox + (dir === 'left' ? 4 : 10), 11, 2, 1);
  }
}

// A full walk strip for one facing: WALK_FRAMES frames side by side, then
// registered as individual frames so Phaser can animate them.
function personStrip(scene, g, key, look, dir) {
  g.clear();
  for (let f = 0; f < WALK_FRAMES; f++) drawPerson(g, f * 16, look, dir, f);
  g.generateTexture(key, 16 * WALK_FRAMES, 32);
  const tex = scene.textures.get(key);
  for (let f = 0; f < WALK_FRAMES; f++) tex.add(f, 0, f * 16, 0, 16, 32);
}

function walkAnim(scene, key, texture) {
  if (scene.anims.exists(key)) return;
  scene.anims.create({
    key,
    // 0-1-0-2 reads as a stride rather than a two-pose flicker.
    frames: [0, 1, 0, 2].map((frame) => ({ key: texture, frame })),
    frameRate: 8,
    repeat: -1,
  });
}

export function createPlaceholderTextures(scene) {
  const created = [];
  const g = scene.add.graphics();

  // --- tile strip: 0 = ground, 1 = solid block, 2..4 = ground variants ----
  // Variant 0 is deliberately clean and gets the largest share at scatter time;
  // the rest carry a couple of faint blades each. Keeping the contrast low and
  // the marks few is what stops the ground from reading as wallpaper.
  const GRASS_MARKS = [
    [],
    [[4, 5, HEX.GRASS_DARK], [11, 9, HEX.GRASS_LIT]],
    [[8, 3, HEX.GRASS_LIT], [3, 11, HEX.GRASS_DARK]],
    [[13, 6, HEX.GRASS_DARK], [6, 12, HEX.GRASS_LIT]],
  ];
  const TILE_ORDER = [TILES.GRASS, TILES.BLOCK, TILES.GRASS_A, TILES.GRASS_B, TILES.GRASS_C];
  TILE_ORDER.forEach((tile, slot) => {
    const ox = slot * 16;
    if (tile === TILES.BLOCK) {
      // Solid block: lit cap, mid body, shadowed front face — reads as raised.
      g.fillStyle(HEX.BLOCK_EDGE).fillRect(ox, 0, 16, 16);
      g.fillStyle(HEX.BLOCK_LIT).fillRect(ox + 1, 1, 14, 3);
      g.fillStyle(HEX.BLOCK).fillRect(ox + 1, 4, 14, 8);
      g.fillStyle(HEX.BLOCK_DARK).fillRect(ox + 1, 12, 14, 3);
      return;
    }
    g.fillStyle(HEX.GRASS).fillRect(ox, 0, 16, 16);
    for (const [x, y, color] of GRASS_MARKS[GRASS_VARIANTS.indexOf(tile)]) {
      g.fillStyle(color).fillRect(ox + x, y, 2, 1);
    }
  });
  g.generateTexture('tiles', 16 * TILE_ORDER.length, 16);
  created.push('tiles');

  // --- Alexei, one strip per outfit per facing ---------------------------
  for (const [outfit, colors] of Object.entries(OUTFIT_COLORS)) {
    const look = { ...ALEXEI, shirt: colors.shirt, shirtShade: colors.shirtShade };
    for (const dir of FACINGS) {
      const key = playerTexture(outfit, dir);
      personStrip(scene, g, key, look, dir);
      walkAnim(scene, playerAnim(outfit, dir), key);
      created.push(key);
    }
  }

  // --- NPC + Harley (single facing each; they don't walk toward you) ------
  personStrip(scene, g, NPC_TEXTURE, NPC_LOOK, 'down');
  created.push(NPC_TEXTURE);
  personStrip(scene, g, HARLEY_TEXTURE, HARLEY_LOOK, 'down');
  created.push(HARLEY_TEXTURE);

  // --- the note ----------------------------------------------------------
  g.clear();
  g.fillStyle(SHADOW, 0.2).fillEllipse(8, 13, 11, 3);
  plate(g, 0xfdfcf5, 2, 4, 12, 9);
  g.fillStyle(0xc9c9d4).fillRect(4, 7, 8, 1).fillRect(4, 9, 6, 1);
  g.generateTexture(OBJECT_TEXTURES.note, 16, 16);
  created.push(OBJECT_TEXTURES.note);

  // --- scatter props: break up the ground plane --------------------------
  g.clear();
  g.fillStyle(HEX.GRASS_DARK).fillRect(6, 9, 1, 4).fillRect(9, 8, 1, 5);
  g.fillStyle(HEX.GRASS_LIT).fillRect(7, 7, 1, 6).fillRect(11, 10, 1, 3);
  g.generateTexture(PROP_TEXTURES.tuft, 16, 16);
  created.push(PROP_TEXTURES.tuft);

  g.clear();
  g.fillStyle(HEX.GRASS_DARK).fillRect(8, 10, 1, 3);
  g.fillStyle(0xf7e08a).fillRect(7, 8, 3, 2);
  g.fillStyle(0xfff6c9).fillRect(8, 8, 1, 1);
  g.generateTexture(PROP_TEXTURES.flower, 16, 16);
  created.push(PROP_TEXTURES.flower);

  // --- memory icons: faceted gem with a lit core -------------------------
  for (const era of ['era1', 'era2', 'era3', 'era4']) {
    const color = MEMORY_COLORS[era];
    g.clear();
    g.fillStyle(color, 0.25).fillEllipse(8, 8, 15, 15);   // aura
    g.fillStyle(OUTLINE);
    g.fillRect(6, 1, 4, 14).fillRect(1, 6, 14, 4);
    g.fillStyle(color);
    g.fillRect(7, 2, 2, 12).fillRect(2, 7, 12, 2);
    g.fillStyle(color).fillRect(6, 6, 4, 4);
    g.fillStyle(0xffffff).fillRect(7, 7, 2, 2);           // specular core
    g.generateTexture(MEMORY_TEXTURES[era], 16, 16);
    created.push(MEMORY_TEXTURES[era]);
  }

  g.destroy();
  return created;
}
