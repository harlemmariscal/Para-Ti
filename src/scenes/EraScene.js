import Phaser from 'phaser';
import {
  SCENES, COLORS, FONT, TILE_SIZE, OUTFIT_TINTS,
} from '../constants.js';
import { getEraConfig } from '../eras/index.js';
import { validateEraConfig } from '../eras/validate.js';
import { PLAYER_TEXTURES } from '../placeholders.js';

// UC-5: the reusable era engine. One scene, four data configs (Phase 2 adds
// eras 2-4). An era is DATA — never subclass or fork this scene per era.
export default class EraScene extends Phaser.Scene {
  constructor() { super(SCENES.ERA); }

  init(data) {
    this.eraKey = data.eraKey ?? 'era1';
  }

  create() {
    const era = getEraConfig(this.eraKey);
    validateEraConfig(era);
    this.era = era;

    this.cameras.main.fadeIn(300, 13, 13, 26);

    // Build the single-screen map from the config's 2D array.
    const map = this.make.tilemap({
      data: era.map.data,
      tileWidth: era.map.tileSize,
      tileHeight: era.map.tileSize,
    });
    const tileset = map.addTilesetImage('tiles');
    this.layer = map.createLayer(0, tileset, 0, 0);

    // Per-era mood tint (bright / golden / muted / sunset later).
    this.layer.forEachTile((tile) => { tile.tint = era.tint; });

    // Spawn the player centered on the spawn tile.
    const spawnX = era.spawn.x * TILE_SIZE + TILE_SIZE / 2;
    const spawnY = era.spawn.y * TILE_SIZE + TILE_SIZE / 2;
    this.player = this.physics.add.sprite(spawnX, spawnY, PLAYER_TEXTURES.down);

    // TODO(Phase 3): outfit tint becomes Alexei's real outfit spritesheet.
    const runState = this.registry.get('runState');
    if (runState?.outfit) this.player.setTint(OUTFIT_TINTS[runState.outfit]);

    // Dev aid: era label. Removed in Phase 2 when the dialogue box arrives.
    this.add.text(4, 4, era.name, {
      fontFamily: FONT, fontSize: '8px', color: COLORS.WHITE,
    }).setDepth(10);

    // TODO(Phase 2, UC-5): Era 1 intro line via dialogue box — wording is Harley's.
    // TODO(Phase 2): objective, NPCs, memory, era music hook.
  }
}
