import { describe, it, expect } from 'vitest';
import {
  createPlaceholderTextures, playerTexture, playerAnim, NPC_TEXTURE, HARLEY_TEXTURE,
  OBJECT_TEXTURES, MEMORY_TEXTURES, PROP_TEXTURES, FACINGS, WALK_FRAMES, TILES,
  GRASS_VARIANTS,
} from '../src/placeholders.js';
import { OUTFIT_COLORS } from '../src/constants.js';

// Minimal stand-in for a Phaser scene: records generateTexture calls, the
// frames added to each texture, and the animations created.
function mockScene() {
  const out = {};
  const generated = [];
  const frames = {};
  const animList = [];
  const gfx = {
    fillStyle() { return this; },
    fillRect() { return this; },
    fillEllipse() { return this; },
    fillRoundedRect() { return this; },
    clear() { return this; },
    destroy() {},
    generateTexture(key, w) {
      generated.push(key);
      frames[key] = [];
      if (key === 'tiles') out.tileStripWidth = w;
      return this;
    },
  };
  return Object.assign(out, {
    add: { graphics: () => gfx },
    textures: { get: (key) => ({ add: (frame) => frames[key].push(frame) }) },
    anims: {
      exists: (key) => animList.some((a) => a.key === key),
      create: (cfg) => animList.push(cfg),
    },
    generated, frames, animList,
  });
}

describe('createPlaceholderTextures', () => {
  it('generates a walk strip per outfit per facing, plus world textures', () => {
    const scene = mockScene();
    const keys = createPlaceholderTextures(scene);

    expect(keys).toContain('tiles');
    for (const outfit of Object.keys(OUTFIT_COLORS)) {
      for (const dir of FACINGS) expect(keys).toContain(playerTexture(outfit, dir));
    }
    for (const key of [
      NPC_TEXTURE, HARLEY_TEXTURE, OBJECT_TEXTURES.note,
      PROP_TEXTURES.tuft, PROP_TEXTURES.flower,
      ...Object.values(MEMORY_TEXTURES),
    ]) expect(keys).toContain(key);

    expect(keys).toEqual(scene.generated);
    expect(new Set(keys).size).toBe(keys.length); // no key generated twice
  });

  it('slices every character strip into walk frames', () => {
    const scene = mockScene();
    createPlaceholderTextures(scene);
    for (const dir of FACINGS) {
      expect(scene.frames[playerTexture('casual', dir)]).toEqual([0, 1, 2]);
    }
    expect(scene.frames[NPC_TEXTURE]).toHaveLength(WALK_FRAMES);
    expect(scene.frames[HARLEY_TEXTURE]).toHaveLength(WALK_FRAMES);
  });

  it('registers one looping walk animation per outfit per facing', () => {
    const scene = mockScene();
    createPlaceholderTextures(scene);
    for (const outfit of Object.keys(OUTFIT_COLORS)) {
      for (const dir of FACINGS) {
        const anim = scene.animList.find((a) => a.key === playerAnim(outfit, dir));
        expect(anim).toBeDefined();
        expect(anim.repeat).toBe(-1);
        // 0-1-0-2 reads as a stride, not a two-pose flicker.
        expect(anim.frames.map((f) => f.frame)).toEqual([0, 1, 0, 2]);
        expect(anim.frames.every((f) => f.key === playerTexture(outfit, dir))).toBe(true);
      }
    }
  });

  it('never creates an animation twice', () => {
    const scene = mockScene();
    createPlaceholderTextures(scene);
    const first = scene.animList.length;
    createPlaceholderTextures(scene);
    expect(scene.animList).toHaveLength(first);
  });

  it('exposes stable keys for eras, props and tile indices', () => {
    expect(Object.keys(MEMORY_TEXTURES)).toEqual(['era1', 'era2', 'era3', 'era4']);
    expect(NPC_TEXTURE).toBe('npc');
    expect(HARLEY_TEXTURE).toBe('harley');
    expect(OBJECT_TEXTURES.note).toBe('obj-note');
    // The era configs author ground as 0 and solids as 1; those two are the
    // contract. Variants are cosmetic and must never collide with the solid.
    expect(TILES.GRASS).toBe(0);
    expect(TILES.BLOCK).toBe(1);
    expect(GRASS_VARIANTS[0]).toBe(TILES.GRASS);
    expect(GRASS_VARIANTS).not.toContain(TILES.BLOCK);
    expect(new Set(GRASS_VARIANTS).size).toBe(GRASS_VARIANTS.length);
  });

  it('draws a tile strip wide enough for the solid and every ground variant', () => {
    const scene = mockScene();
    createPlaceholderTextures(scene);
    // Tileset indices are strip positions, so the strip must cover 0..max index.
    const maxIndex = Math.max(TILES.BLOCK, ...GRASS_VARIANTS);
    expect(scene.tileStripWidth).toBe((maxIndex + 1) * 16);
  });

  it('defaults to the casual outfit when none was chosen', () => {
    expect(playerTexture(null, 'down')).toBe(playerTexture('casual', 'down'));
    expect(playerAnim(undefined, 'up')).toBe(playerAnim('casual', 'up'));
  });
});
