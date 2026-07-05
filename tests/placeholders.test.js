import { describe, it, expect } from 'vitest';
import {
  createPlaceholderTextures, PLAYER_TEXTURES, NPC_TEXTURE, HARLEY_TEXTURE,
  OBJECT_TEXTURES, MEMORY_TEXTURES,
} from '../src/placeholders.js';

// Minimal stand-in for a Phaser scene: records generateTexture calls.
function mockScene() {
  const generated = [];
  const gfx = {
    fillStyle() { return this; },
    fillRect() { return this; },
    clear() { return this; },
    destroy() {},
    generateTexture(key) { generated.push(key); return this; },
  };
  return { add: { graphics: () => gfx }, generated };
}

describe('createPlaceholderTextures', () => {
  it('generates every Phase 2 texture, in order', () => {
    const scene = mockScene();
    const keys = createPlaceholderTextures(scene);
    const expected = [
      'tiles', 'player-down', 'player-up', 'player-left', 'player-right',
      'npc', 'harley', 'obj-note',
      'memory-era1', 'memory-era2', 'memory-era3', 'memory-era4',
    ];
    expect(keys).toEqual(expected);
    expect(scene.generated).toEqual(expected);
  });

  it('exposes a texture key for every facing the movement resolver can produce', () => {
    expect(PLAYER_TEXTURES).toEqual({
      down: 'player-down',
      up: 'player-up',
      left: 'player-left',
      right: 'player-right',
    });
  });

  it('exposes one memory icon per era key', () => {
    expect(Object.keys(MEMORY_TEXTURES)).toEqual(['era1', 'era2', 'era3', 'era4']);
    expect(NPC_TEXTURE).toBe('npc');
    expect(HARLEY_TEXTURE).toBe('harley');
    expect(OBJECT_TEXTURES.note).toBe('obj-note');
  });
});
