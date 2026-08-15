import { describe, it, expect } from 'vitest';
import { createRunState, setOutfit, addMemory, OUTFITS } from '../src/state.js';

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

describe('addMemory', () => {
  it('appends a memory without mutating the original state', () => {
    const state = createRunState();
    const next = addMemory(state, 'era1');
    expect(next.memories).toEqual(['era1']);
    expect(state.memories).toEqual([]);
    expect(next).not.toBe(state);
  });

  it('keeps collection order across eras', () => {
    let state = createRunState();
    for (const id of ['era1', 'era2', 'era3', 'era4']) state = addMemory(state, id);
    expect(state.memories).toEqual(['era1', 'era2', 'era3', 'era4']);
  });

  it('throws when the same memory is collected twice (BR-2)', () => {
    const state = addMemory(createRunState(), 'era1');
    expect(() => addMemory(state, 'era1')).toThrow('Memory "era1" already collected');
  });
});
