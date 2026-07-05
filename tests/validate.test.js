import { describe, it, expect } from 'vitest';
import { validateEraConfig } from '../src/eras/validate.js';

function tinyValidConfig() {
  return {
    key: 'test-era',
    name: 'Test Era',
    next: null,
    tint: 0xffffff,
    map: {
      tileSize: 16,
      data: [
        [1, 1, 1],
        [1, 0, 1],
        [1, 1, 1],
      ],
      collision: [1],
    },
    spawn: { x: 1, y: 1 },
  };
}

describe('validateEraConfig', () => {
  it('accepts a valid config', () => {
    expect(validateEraConfig(tinyValidConfig())).toBe(true);
  });

  it('throws when a required field is missing', () => {
    const config = tinyValidConfig();
    delete config.spawn;
    expect(() => validateEraConfig(config)).toThrow('missing "spawn"');
  });

  it('throws when map rows are not all the same width', () => {
    const config = tinyValidConfig();
    config.map.data[1] = [1, 0];
    expect(() => validateEraConfig(config)).toThrow('same width');
  });

  it('throws when spawn is out of bounds', () => {
    const config = tinyValidConfig();
    config.spawn = { x: 9, y: 1 };
    expect(() => validateEraConfig(config)).toThrow('out of bounds');
  });

  it('throws when spawn sits on a collision tile', () => {
    const config = tinyValidConfig();
    config.spawn = { x: 0, y: 0 };
    expect(() => validateEraConfig(config)).toThrow('collision tile');
  });
});
