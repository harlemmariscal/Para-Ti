import { describe, it, expect } from 'vitest';
import { ERAS, getEraConfig } from '../src/eras/index.js';
import { validateEraConfig } from '../src/eras/validate.js';
import { GAME_WIDTH, GAME_HEIGHT, TILE_SIZE } from '../src/constants.js';

describe('era registry', () => {
  it('every registered era passes validation', () => {
    for (const era of ERAS) expect(validateEraConfig(era)).toBe(true);
  });

  it('every era map fills exactly one screen (30x20 tiles)', () => {
    for (const era of ERAS) {
      expect(era.map.data[0]).toHaveLength(GAME_WIDTH / TILE_SIZE);  // 30
      expect(era.map.data).toHaveLength(GAME_HEIGHT / TILE_SIZE);    // 20
    }
  });

  it('getEraConfig returns era1 (the classroom)', () => {
    const era = getEraConfig('era1');
    expect(era.key).toBe('era1');
    expect(era.name).toBe('Childhood');
  });

  it('getEraConfig throws on an unknown key', () => {
    expect(() => getEraConfig('era99')).toThrow('Unknown era "era99"');
  });

  it('registers all four eras in chronological order', () => {
    expect(ERAS.map((e) => e.key)).toEqual(['era1', 'era2', 'era3', 'era4']);
  });

  it('chains era1 → era2 → era3 → era4 → ending (BR-1)', () => {
    expect(ERAS.map((e) => e.next)).toEqual(['era2', 'era3', 'era4', null]);
  });

  it('gives every era a unique memory id matching its key (BR-2)', () => {
    expect(ERAS.map((e) => e.memory.id)).toEqual(['era1', 'era2', 'era3', 'era4']);
  });

  it('puts Harley on the hill in era 4 only', () => {
    expect(ERAS.filter((e) => e.harley).map((e) => e.key)).toEqual(['era4']);
  });

  it('rains only in the drift', () => {
    expect(ERAS.filter((e) => e.weather === 'rain').map((e) => e.key)).toEqual(['era3']);
  });

  it('reuses the same hill layout for eras 2 and 4 (relit, not redrawn)', () => {
    const era2 = getEraConfig('era2');
    const era4 = getEraConfig('era4');
    expect(era4.map.data).toEqual(era2.map.data);
    expect(era4.tint).not.toBe(era2.tint);
  });
});
