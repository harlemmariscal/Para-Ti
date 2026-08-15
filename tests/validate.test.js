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
    objective: { type: 'reach', zone: { x: 1, y: 1, w: 1, h: 1 } },
    memory: { id: 'test', name: 'Test memory', texture: 'memory-era1', x: 1, y: 1, scene: [{ speaker: null, lines: ['x'] }] },
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

  it('throws when objective is missing', () => {
    const config = tinyValidConfig();
    delete config.objective;
    expect(() => validateEraConfig(config)).toThrow('missing "objective"');
  });

  it('throws on an unknown objective type', () => {
    const config = tinyValidConfig();
    config.objective = { type: 'puzzle' };
    expect(() => validateEraConfig(config)).toThrow('objective.type');
  });

  it('throws when a reach zone leaks out of bounds', () => {
    const config = tinyValidConfig();
    config.objective = { type: 'reach', zone: { x: 1, y: 1, w: 9, h: 1 } };
    expect(() => validateEraConfig(config)).toThrow('zone');
  });

  it('throws when an interact target is out of bounds', () => {
    const config = tinyValidConfig();
    config.objective = { type: 'interact', target: { x: 9, y: 9 }, texture: 't', found: [] };
    expect(() => validateEraConfig(config)).toThrow('target');
  });

  it('throws when the memory sits on a collision tile', () => {
    const config = tinyValidConfig();
    config.memory.x = 0;
    config.memory.y = 0;
    expect(() => validateEraConfig(config)).toThrow('memory');
  });

  it('throws when an NPC stands on a wall', () => {
    const config = tinyValidConfig();
    config.npcs = [{ name: 'X', x: 0, y: 1, axis: 'h', range: 1, line: 'hi', attribution: null }];
    expect(() => validateEraConfig(config)).toThrow('NPC');
  });

  it('throws when harley stands on a wall', () => {
    const config = tinyValidConfig();
    config.harley = { x: 2, y: 2 };
    expect(() => validateEraConfig(config)).toThrow('harley');
  });
});
