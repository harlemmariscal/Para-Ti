import { describe, it, expect } from 'vitest';
import {
  GAME_WIDTH, GAME_HEIGHT, TILE_SIZE, PLAYER_SPEED, SCENES, COLORS, HEX, OUTFIT_TINTS, FONT,
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

  it('has a tint for each outfit option', () => {
    expect(Object.keys(OUTFIT_TINTS).sort()).toEqual(['athletic', 'casual']);
  });

  it('exports the pixel font family and a positive player speed', () => {
    expect(FONT).toBe('"Press Start 2P"');
    expect(PLAYER_SPEED).toBeGreaterThan(0);
    // Note: pink values are deliberately NOT pinned — Harley tunes them against
    // his approved screenshot at the Task 6 checkpoint. Only NAVY is sacred.
    expect(typeof HEX.PINK_SOFT).toBe('number');
  });
});
