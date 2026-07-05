import { describe, it, expect } from 'vitest';
import { createPlaceholderTextures, PLAYER_TEXTURES } from '../src/placeholders.js';

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
  it('generates the tiles strip and all four player facings, in order', () => {
    const scene = mockScene();
    const keys = createPlaceholderTextures(scene);
    const expected = ['tiles', 'player-down', 'player-up', 'player-left', 'player-right'];
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
});
