// Single source of truth for sizes, keys, and colors.
export const GAME_WIDTH = 480;   // 30 tiles
export const GAME_HEIGHT = 320;  // 20 tiles
export const TILE_SIZE = 16;
export const PLAYER_SPEED = 100; // px/sec, 4-direction only

// Black/White 2 frames the world tight and lets it scroll: roughly 15x10 tiles
// on screen with the camera trailing the player, instead of one flat map shown
// whole. The era maps are already 30x20, so 2x zoom turns each into ~4 screens
// of world without redrawing a single map.
export const CAMERA_ZOOM = 2;
export const CAMERA_LERP = 0.12;  // trail rather than snap

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

  // Ground and solids, in BW2's register: muted naturals with a top-left light
  // source, three tones per material so nothing reads as a flat fill.
  GRASS: 0x7fb069,
  GRASS_LIT: 0x93bf7c,
  GRASS_DARK: 0x6b9a57,
  BLOCK: 0x8a7f6d,
  BLOCK_LIT: 0xa2957f,
  BLOCK_DARK: 0x655c4e,
  BLOCK_EDGE: 0x3f3a33,
};

// Outfit colors are drawn into Alexei's sprite rather than tinted over it —
// a whole-sprite tint would stain her skin and hair with the shirt color.
export const OUTFIT_COLORS = {
  casual:   { shirt: 0xe07a92, shirtShade: 0xb85c73 },
  athletic: { shirt: 0x5b8fd6, shirtShade: 0x4470ad },
};

export const FONT = '"Press Start 2P"';
