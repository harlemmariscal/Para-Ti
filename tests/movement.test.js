import { describe, it, expect } from 'vitest';
import { resolveDirection } from '../src/movement.js';

const keys = (pressed = {}) => ({ left: false, right: false, up: false, down: false, ...pressed });

describe('resolveDirection', () => {
  it('is idle with no keys pressed', () => {
    expect(resolveDirection(keys())).toEqual({ vx: 0, vy: 0, facing: null });
  });

  it('moves in each single direction', () => {
    expect(resolveDirection(keys({ right: true }))).toEqual({ vx: 1, vy: 0, facing: 'right' });
    expect(resolveDirection(keys({ left: true }))).toEqual({ vx: -1, vy: 0, facing: 'left' });
    expect(resolveDirection(keys({ down: true }))).toEqual({ vx: 0, vy: 1, facing: 'down' });
    expect(resolveDirection(keys({ up: true }))).toEqual({ vx: 0, vy: -1, facing: 'up' });
  });

  it('never moves diagonally — horizontal wins when both axes are held', () => {
    expect(resolveDirection(keys({ right: true, down: true }))).toEqual({ vx: 1, vy: 0, facing: 'right' });
    expect(resolveDirection(keys({ left: true, up: true }))).toEqual({ vx: -1, vy: 0, facing: 'left' });
  });

  it('cancels opposing horizontal keys and falls through to vertical', () => {
    expect(resolveDirection(keys({ left: true, right: true, up: true })))
      .toEqual({ vx: 0, vy: -1, facing: 'up' });
  });

  it('is idle when all four keys are held', () => {
    expect(resolveDirection(keys({ left: true, right: true, up: true, down: true })))
      .toEqual({ vx: 0, vy: 0, facing: null });
  });
});
