import { describe, it, expect } from 'vitest';
import {
  GAME_WIDTH, GAME_HEIGHT, TILE_SIZE, PLAYER_SPEED, SCENES, COLORS, HEX, OUTFIT_COLORS, FONT,
  CAMERA_ZOOM, CAMERA_LERP,
} from '../src/constants.js';

describe('constants', () => {
  it('uses a 480x320 internal resolution that divides evenly into 16px tiles', () => {
    expect(GAME_WIDTH).toBe(480);
    expect(GAME_HEIGHT).toBe(320);
    expect(GAME_WIDTH % TILE_SIZE).toBe(0);
    expect(GAME_HEIGHT % TILE_SIZE).toBe(0);
  });

  it('defines all five scene keys', () => {
    expect(SCENES).toEqual({
      BOOT: 'BootScene',
      TITLE: 'TitleScene',
      OUTFIT: 'OutfitScene',
      ERA: 'EraScene',
      END: 'EndScene',
    });
  });

  it('locks the sacred title-screen navy', () => {
    expect(COLORS.NAVY).toBe('#0d0d1a');
  });

  it('has a shirt color and a shade for each outfit option', () => {
    expect(Object.keys(OUTFIT_COLORS).sort()).toEqual(['athletic', 'casual']);
    for (const c of Object.values(OUTFIT_COLORS)) {
      expect(typeof c.shirt).toBe('number');
      expect(typeof c.shirtShade).toBe('number');
      expect(c.shirtShade).not.toBe(c.shirt); // the shade must actually shade
    }
  });

  it('frames the world close, the way Black/White 2 does', () => {
    // At 2x zoom a 480x320 viewport shows 15x10 tiles of a 30x20 era map,
    // so every era becomes scrollable world instead of one flat screen.
    expect(CAMERA_ZOOM).toBe(2);
    expect(GAME_WIDTH / CAMERA_ZOOM / TILE_SIZE).toBe(15);
    expect(GAME_HEIGHT / CAMERA_ZOOM / TILE_SIZE).toBe(10);
    // The camera trails the player rather than snapping to her.
    expect(CAMERA_LERP).toBeGreaterThan(0);
    expect(CAMERA_LERP).toBeLessThan(1);
  });

  it('gives ground and solids three tones each, never a flat fill', () => {
    for (const set of [['GRASS', 'GRASS_LIT', 'GRASS_DARK'], ['BLOCK', 'BLOCK_LIT', 'BLOCK_DARK']]) {
      const tones = set.map((k) => HEX[k]);
      expect(new Set(tones).size).toBe(3);
    }
  });

  it('exports the pixel font family and a positive player speed', () => {
    expect(FONT).toBe('"Press Start 2P"');
    expect(PLAYER_SPEED).toBeGreaterThan(0);
    // Note: pink values are deliberately NOT pinned — Harley tunes them against
    // his approved screenshot at the Task 6 checkpoint. Only NAVY is sacred.
    expect(typeof HEX.PINK_SOFT).toBe('number');
  });
});
