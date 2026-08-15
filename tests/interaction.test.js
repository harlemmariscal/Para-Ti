import { describe, it, expect } from 'vitest';
import { targetTile, findTarget, inZone } from '../src/interaction.js';

describe('targetTile', () => {
  it('returns the tile one step ahead per facing', () => {
    expect(targetTile(5, 5, 'up')).toEqual({ x: 5, y: 4 });
    expect(targetTile(5, 5, 'down')).toEqual({ x: 5, y: 6 });
    expect(targetTile(5, 5, 'left')).toEqual({ x: 4, y: 5 });
    expect(targetTile(5, 5, 'right')).toEqual({ x: 6, y: 5 });
  });
});

describe('findTarget', () => {
  const note = { x: 5, y: 4, id: 'note' };
  const npc = { x: 6, y: 5, id: 'npc' };

  it('finds the interactable directly faced', () => {
    expect(findTarget({ tileX: 5, tileY: 5, facing: 'up' }, [note, npc])).toBe(note);
    expect(findTarget({ tileX: 5, tileY: 5, facing: 'right' }, [note, npc])).toBe(npc);
  });

  it('finds an interactable on the tile the player stands on', () => {
    const memory = { x: 5, y: 5, id: 'memory' };
    expect(findTarget({ tileX: 5, tileY: 5, facing: 'down' }, [memory])).toBe(memory);
  });

  it('returns null when nothing is faced or underfoot', () => {
    expect(findTarget({ tileX: 5, tileY: 5, facing: 'down' }, [note, npc])).toBeNull();
    expect(findTarget({ tileX: 1, tileY: 1, facing: 'up' }, [note, npc])).toBeNull();
  });
});

describe('inZone', () => {
  const zone = { x: 12, y: 1, w: 6, h: 3 };

  it('is true inside and on the inclusive edges', () => {
    expect(inZone(12, 1, zone)).toBe(true);
    expect(inZone(17, 3, zone)).toBe(true);
    expect(inZone(14, 2, zone)).toBe(true);
  });

  it('is false just outside every edge', () => {
    expect(inZone(11, 2, zone)).toBe(false);
    expect(inZone(18, 2, zone)).toBe(false);
    expect(inZone(14, 0, zone)).toBe(false);
    expect(inZone(14, 4, zone)).toBe(false);
  });
});
