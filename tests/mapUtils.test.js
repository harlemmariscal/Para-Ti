import { describe, it, expect } from 'vitest';
import { buildMapData, wallRect } from '../src/eras/mapUtils.js';

describe('buildMapData', () => {
  it('returns rows x cols of tiles', () => {
    const data = buildMapData(30, 20);
    expect(data).toHaveLength(20);
    for (const row of data) expect(row).toHaveLength(30);
  });

  it('makes every border tile a wall (1)', () => {
    const data = buildMapData(5, 4);
    for (let x = 0; x < 5; x++) {
      expect(data[0][x]).toBe(1);
      expect(data[3][x]).toBe(1);
    }
    for (let y = 0; y < 4; y++) {
      expect(data[y][0]).toBe(1);
      expect(data[y][4]).toBe(1);
    }
  });

  it('makes interior tiles floor (0) by default', () => {
    const data = buildMapData(5, 4);
    expect(data[1][1]).toBe(0);
    expect(data[2][3]).toBe(0);
  });

  it('places extra walls at [x, y] positions', () => {
    const data = buildMapData(5, 4, [[2, 1], [3, 2]]);
    expect(data[1][2]).toBe(1);
    expect(data[2][3]).toBe(1);
  });
});

describe('wallRect', () => {
  it('covers the full inclusive rectangle', () => {
    const walls = wallRect(2, 3, 4, 5);
    expect(walls).toHaveLength(9); // 3 x 3
    expect(walls).toContainEqual([2, 3]);
    expect(walls).toContainEqual([4, 5]);
    expect(walls).toContainEqual([3, 4]);
  });

  it('handles a single-tile rect', () => {
    expect(wallRect(7, 7, 7, 7)).toEqual([[7, 7]]);
  });
});
