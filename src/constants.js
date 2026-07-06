// Single source of truth for sizes, keys, and colors.
export const GAME_WIDTH = 480;   // 30 tiles
export const GAME_HEIGHT = 320;  // 20 tiles
export const TILE_SIZE = 16;
export const PLAYER_SPEED = 100; // px/sec, 4-direction only

export const SCENES = {
  BOOT: 'BootScene',
  TITLE: 'TitleScene',
  OUTFIT: 'OutfitScene',
  ERA: 'EraScene',
  END: 'EndScene',
};

// CSS color strings (for text styles / backgrounds).
export const COLORS = {
  NAVY: '#0d0d1a',       // sacred title background — do not change
  WHITE: '#ffffff',
  PINK_SOFT: '#f5b8c4',  // ⚠ verify against approved title screenshot (Task 6 checkpoint)
  PINK_MAUVE: '#b06a7f', // ⚠ verify against approved title screenshot (Task 6 checkpoint)
};

// Numeric colors (for tints, fills, strokes).
export const HEX = {
  NAVY: 0x0d0d1a,
  PINK_SOFT: 0xf5b8c4,
  PANEL: 0x1a1a2e,
  PANEL_BORDER: 0x50506a,
  FLOOR: 0x9bc86f,
  WALL: 0x50506a,
  BODY: 0x30304a,
};

// Placeholder outfit tints until Harley's real outfit sprites arrive (Phase 3).
export const OUTFIT_TINTS = {
  casual: 0xffd1dc,
  athletic: 0x9bd1ff,
};

export const FONT = '"Press Start 2P"';
