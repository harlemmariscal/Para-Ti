import Phaser from 'phaser';
import {
  SCENES, COLORS, FONT, TILE_SIZE, OUTFIT_TINTS, PLAYER_SPEED,
} from '../constants.js';
import { getEraConfig } from '../eras/index.js';
import { validateEraConfig } from '../eras/validate.js';
import { PLAYER_TEXTURES, NPC_TEXTURE } from '../placeholders.js';
import { resolveDirection } from '../movement.js';
import { findTarget } from '../interaction.js';
import DialogueBox from '../ui/DialogueBox.js';

// UC-5..UC-14: the reusable era engine. One scene, four data configs —
// an era is DATA; never subclass or fork this scene per era.
export default class EraScene extends Phaser.Scene {
  constructor() { super(SCENES.ERA); }

  init(data) {
    this.eraKey = data.eraKey ?? 'era1';
  }

  create() {
    const era = getEraConfig(this.eraKey);
    validateEraConfig(era);
    this.era = era;
    this.facing = 'down';
    this.interactables = [];

    this.cameras.main.fadeIn(300, 13, 13, 26);

    // --- map (UC-5) ---
    const map = this.make.tilemap({
      data: era.map.data,
      tileWidth: era.map.tileSize,
      tileHeight: era.map.tileSize,
    });
    const tileset = map.addTilesetImage('tiles');
    this.layer = map.createLayer(0, tileset, 0, 0);
    this.layer.forEachTile((tile) => { tile.tint = era.tint; });

    // --- player (UC-5/6/7) ---
    const spawnX = era.spawn.x * TILE_SIZE + TILE_SIZE / 2;
    const spawnY = era.spawn.y * TILE_SIZE + TILE_SIZE / 2;
    this.player = this.physics.add.sprite(spawnX, spawnY, PLAYER_TEXTURES.down);
    const runState = this.registry.get('runState');
    if (runState?.outfit) this.player.setTint(OUTFIT_TINTS[runState.outfit]);

    // Feet-only hitbox: the top of the 16x32 sprite may overlap walls behind
    // the player (top-down depth illusion); only the bottom 12x12 collides.
    this.player.body.setSize(12, 12).setOffset(2, 20);
    this.layer.setCollision(era.map.collision);
    this.physics.add.collider(this.player, this.layer);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.player.setCollideWorldBounds(true);

    // --- input (UC-6 + UC-8) ---
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D,SPACE,ENTER');

    // --- interaction prompt (UC-8) ---
    this.prompt = this.add.text(0, 0, 'SPACE', {
      fontFamily: FONT, fontSize: '7px', color: COLORS.WHITE, backgroundColor: '#1a1a2e',
      padding: { x: 2, y: 2 },
    }).setOrigin(0.5, 1).setDepth(15).setVisible(false);

    // --- dialogue (UC-9) ---
    this.dialogueBox = new DialogueBox(this);
    if (era.intro) this.dialogueBox.open(era.intro);

    // --- NPCs (UC-10): optional flavor, never required to progress (BR-3) ---
    this.npcs = [];
    for (const npcCfg of era.npcs ?? []) this.spawnNpc(npcCfg);

    // TODO(Phase 3): era music from Harley's playlist starts here.
  }

  spawnNpc(cfg) {
    const startX = cfg.x * TILE_SIZE + TILE_SIZE / 2;
    const startY = cfg.y * TILE_SIZE + TILE_SIZE / 2;
    const sprite = this.add.sprite(startX, startY, NPC_TEXTURE);

    // Short back-and-forth patrol along one axis. Placeholder NPCs don't
    // collide with the player; they're flavor, not obstacles.
    const prop = cfg.axis === 'h' ? 'x' : 'y';
    const tween = this.tweens.add({
      targets: sprite,
      [prop]: (cfg.axis === 'h' ? startX : startY) + cfg.range * TILE_SIZE,
      duration: cfg.range * 900,
      yoyo: true,
      repeat: -1,
      ease: 'Linear',
    });

    const entry = { x: cfg.x, y: cfg.y, sprite, onInteract: () => this.talkTo(cfg, tween) };
    this.interactables.push(entry);
    this.npcs.push({ sprite, entry, tween });
  }

  talkTo(cfg, tween) {
    tween.pause(); // NPC stops (facing swap arrives with real sprites, Phase 3)
    const pages = [{ speaker: cfg.name, lines: [cfg.line], attribution: cfg.attribution ?? null }];
    this.dialogueBox.open(pages, () => tween.resume());
  }

  // Feet-center tile: the 12x12 feet box sits at offset (2,20) of the 16x32 sprite,
  // so its center is 10px below the sprite center.
  playerTile() {
    return {
      tileX: Math.floor(this.player.x / TILE_SIZE),
      tileY: Math.floor((this.player.y + 10) / TILE_SIZE),
      facing: this.facing,
    };
  }

  interactPressed() {
    return (
      Phaser.Input.Keyboard.JustDown(this.keys.SPACE) ||
      Phaser.Input.Keyboard.JustDown(this.keys.ENTER)
    );
  }

  update() {
    // Interactables track patrolling NPCs by their live tile.
    for (const { sprite, entry } of this.npcs) {
      entry.x = Math.floor(sprite.x / TILE_SIZE);
      entry.y = Math.floor((sprite.y + 10) / TILE_SIZE);
    }

    // Dialogue mode: world frozen, Space/Enter pages through (UC-9).
    if (this.dialogueBox.isOpen()) {
      this.player.setVelocity(0, 0);
      this.prompt.setVisible(false);
      if (this.interactPressed()) this.dialogueBox.advance();
      return;
    }

    // Explore mode: movement (UC-6) ...
    const pressed = {
      left: this.cursors.left.isDown || this.keys.A.isDown,
      right: this.cursors.right.isDown || this.keys.D.isDown,
      up: this.cursors.up.isDown || this.keys.W.isDown,
      down: this.cursors.down.isDown || this.keys.S.isDown,
    };
    const { vx, vy, facing } = resolveDirection(pressed);
    this.player.setVelocity(vx * PLAYER_SPEED, vy * PLAYER_SPEED);
    if (facing) {
      this.facing = facing;
      this.player.setTexture(PLAYER_TEXTURES[facing]);
    }

    // ... and targeting (UC-8): prompt over the faced interactable.
    const target = findTarget(this.playerTile(), this.interactables);
    if (target) {
      this.prompt.setPosition(target.sprite.x, target.sprite.y - 20).setVisible(true);
      if (this.interactPressed()) target.onInteract();
    } else {
      this.prompt.setVisible(false);
    }
  }
}
