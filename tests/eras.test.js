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
});
