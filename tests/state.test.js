import { describe, it, expect } from 'vitest';
import { createRunState, setOutfit, OUTFITS } from '../src/state.js';

describe('createRunState', () => {
  it('starts with no outfit and no memories', () => {
    expect(createRunState()).toEqual({ outfit: null, memories: [] });
  });
});

describe('setOutfit', () => {
  it('returns a new state with the outfit set, without mutating the original', () => {
    const state = createRunState();
    const next = setOutfit(state, 'casual');
    expect(next.outfit).toBe('casual');
    expect(state.outfit).toBeNull();
    expect(next).not.toBe(state);
  });

  it('accepts every outfit in OUTFITS', () => {
    expect(OUTFITS).toEqual(['casual', 'athletic']);
    for (const outfit of OUTFITS) {
      expect(setOutfit(createRunState(), outfit).outfit).toBe(outfit);
    }
  });

  it('throws on an unknown outfit', () => {
    expect(() => setOutfit(createRunState(), 'formal')).toThrow('Invalid outfit "formal"');
  });
});
