import Phaser from 'phaser';
import {
  SCENES, COLORS, FONT, TILE_SIZE, PLAYER_SPEED, GAME_WIDTH, GAME_HEIGHT,
  CAMERA_ZOOM, CAMERA_LERP,
} from '../constants.js';
import { getEraConfig, ERAS } from '../eras/index.js';
import { validateEraConfig } from '../eras/validate.js';
import {
  playerTexture, playerAnim, NPC_TEXTURE, HARLEY_TEXTURE, PROP_TEXTURES, TILES,
  GRASS_VARIANTS,
} from '../placeholders.js';
import { resolveDirection } from '../movement.js';
import { findTarget, inZone } from '../interaction.js';
import { addMemory } from '../state.js';
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

    // Two cameras: the world scrolls and zooms, the HUD does neither. Without
    // this split the tracker and dialogue box would scroll off with the map and
    // render at 2x. Every object must be handed to world() or ui().
    this.uiCam = this.cameras.add(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.cameras.main.fadeIn(300, 13, 13, 26);
    this.uiCam.fadeIn(300, 13, 13, 26);

    // --- map (UC-5) ---
    const map = this.make.tilemap({
      data: era.map.data,
      tileWidth: era.map.tileSize,
      tileHeight: era.map.tileSize,
    });
    const tileset = map.addTilesetImage('tiles');
    this.layer = this.world(map.createLayer(0, tileset, 0, 0));
    this.layer.forEachTile((tile) => { tile.tint = era.tint; });
    this.scatterProps(map, era);

    // --- player (UC-5/6/7) ---
    const spawnX = era.spawn.x * TILE_SIZE + TILE_SIZE / 2;
    const spawnY = era.spawn.y * TILE_SIZE + TILE_SIZE / 2;
    const runState = this.registry.get('runState');
    this.outfit = runState?.outfit ?? 'casual';
    this.player = this.world(
      this.physics.add.sprite(spawnX, spawnY, playerTexture(this.outfit, 'down')),
    );

    // Feet-only hitbox: the top of the 16x32 sprite may overlap walls behind
    // the player (top-down depth illusion); only the bottom 12x12 collides.
    this.player.body.setSize(12, 12).setOffset(2, 20);
    this.layer.setCollision(era.map.collision);
    this.physics.add.collider(this.player, this.layer);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.player.setCollideWorldBounds(true);

    // --- camera (BW2 framing) ---
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.setZoom(CAMERA_ZOOM);
    this.cameras.main.startFollow(this.player, true, CAMERA_LERP, CAMERA_LERP);

    // --- input (UC-6 + UC-8) ---
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D,SPACE,ENTER');

    // --- interaction prompt (UC-8) ---
    // Lives in the world so it tracks its target, but counter-scaled against the
    // camera zoom so the pixel font still renders 1:1 instead of doubled.
    this.prompt = this.world(this.add.text(0, 0, 'SPACE', {
      fontFamily: FONT, fontSize: '7px', color: COLORS.WHITE, backgroundColor: '#1a1a2e',
      padding: { x: 2, y: 2 },
    })).setOrigin(0.5, 1).setScale(1 / CAMERA_ZOOM).setDepth(9000).setVisible(false);

    // --- dialogue (UC-9) ---
    this.dialogueBox = new DialogueBox(this);
    this.ui(this.dialogueBox.root);
    if (era.intro) this.dialogueBox.open(era.intro);

    // --- NPCs (UC-10): optional flavor, never required to progress (BR-3) ---
    this.npcs = [];
    for (const npcCfg of era.npcs ?? []) this.spawnNpc(npcCfg);

    // --- objective + memory + tracker (UC-11..13) ---
    this.objectiveDone = false;
    this.memoryCollected = false;
    this.setupObjective();
    this.buildTracker();

    // Era 4: Harley waits at the summit (UC-15).
    if (era.harley) {
      this.harleySprite = this.world(this.add.sprite(
        era.harley.x * TILE_SIZE + TILE_SIZE / 2,
        era.harley.y * TILE_SIZE + TILE_SIZE / 2,
        HARLEY_TEXTURE,
      ));
    }

    if (era.weather === 'rain') this.startRain();

    // TODO(Phase 3): era music from Harley's playlist starts here.
  }

  // Camera routing. Each object belongs to exactly one camera; anything that
  // skips both would draw twice, once scrolled and once not.
  world(obj) { this.uiCam.ignore(obj); return obj; }

  ui(obj) { this.cameras.main.ignore(obj); return obj; }

  // Ground dressing, in one pass over the walkable tiles: swap some to cosmetic
  // ground variants so the map doesn't read as a lattice, and stand a few tufts
  // and flowers on top. Seeded by era key, so an era looks identical on replay.
  scatterProps(map, era) {
    const rng = new Phaser.Math.RandomDataGenerator([era.key]);
    const props = [PROP_TEXTURES.tuft, PROP_TEXTURES.tuft, PROP_TEXTURES.flower];
    const variants = GRASS_VARIANTS.slice(1); // index 0 stays the clean majority

    for (let ty = 0; ty < map.height; ty++) {
      for (let tx = 0; tx < map.width; tx++) {
        const tile = map.getTileAt(tx, ty);
        if (tile?.index !== TILES.GRASS) continue;

        // Cosmetic only — every variant is still ground, so collision (set on
        // the solid index alone) is untouched by this swap.
        if (rng.frac() > 0.62) {
          tile.index = rng.pick(variants);
          tile.tint = era.tint;
        }

        if (rng.frac() > 0.12) continue;
        const prop = this.world(this.add.image(
          tx * TILE_SIZE + TILE_SIZE / 2,
          ty * TILE_SIZE + TILE_SIZE / 2,
          rng.pick(props),
        ));
        prop.setTint(era.tint).setDepth(prop.y);
      }
    }
  }

  // Painter's-algorithm depth: whoever stands lower on the screen draws in
  // front. This is what lets Alexei pass behind a townsperson.
  sortDepth() {
    this.player.setDepth(this.player.y);
    for (const { sprite } of this.npcs) sprite.setDepth(sprite.y);
    if (this.harleySprite) this.harleySprite.setDepth(this.harleySprite.y);
    if (this.memorySprite) this.memorySprite.setDepth(this.memorySprite.y);
  }

  setupObjective() {
    const obj = this.era.objective;
    if (obj.type !== 'interact') return; // 'reach' zones are polled in update()
    const sprite = this.world(this.add.image(
      obj.target.x * TILE_SIZE + TILE_SIZE / 2,
      obj.target.y * TILE_SIZE + TILE_SIZE / 2,
      obj.texture,
    ));
    sprite.setDepth(sprite.y);
    this.interactables.push({
      x: obj.target.x,
      y: obj.target.y,
      sprite,
      onInteract: () => {
        if (this.objectiveDone) return;
        this.dialogueBox.open(obj.found, () => this.completeObjective());
      },
    });
  }

  completeObjective() {
    if (this.objectiveDone) return;
    this.objectiveDone = true;
    this.revealMemory();
  }

  revealMemory() {
    const m = this.era.memory;
    const x = m.x * TILE_SIZE + TILE_SIZE / 2;
    // In era 4 the icon floats above waiting Harley instead of sitting on the floor.
    const y = this.harleySprite
      ? this.harleySprite.y - 26
      : m.y * TILE_SIZE + TILE_SIZE / 2;

    this.memorySprite = this.world(this.add.image(x, y, m.texture)).setAlpha(0);
    this.tweens.add({ targets: this.memorySprite, alpha: 1, duration: 400 });
    this.tweens.add({
      targets: this.memorySprite, y: y - 3, duration: 700,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
    this.interactables.push({ x: m.x, y: m.y, sprite: this.memorySprite, onInteract: () => this.collectMemory() });
  }

  collectMemory() {
    if (this.memoryCollected) return;
    this.memoryCollected = true;
    const m = this.era.memory;

    // Collection cue: the icon floats up and fades (UC-12).
    // TODO(Phase 3): collection SFX.
    this.tweens.add({
      targets: this.memorySprite, y: this.memorySprite.y - 24, alpha: 0,
      duration: 700, ease: 'Sine.easeIn',
    });

    this.dialogueBox.open(m.scene, () => {
      const runState = addMemory(this.registry.get('runState'), m.id);
      this.registry.set('runState', runState);
      this.updateTracker(runState.memories.length);
      this.time.delayedCall(500, () => this.advance());
    });
  }

  // UC-13: four corner icons, dim until collected.
  buildTracker() {
    this.trackerIcons = ERAS.map((era, i) =>
      this.ui(this.add.image(GAME_WIDTH - 66 + i * 18, 12, era.memory.texture))
        .setDepth(10).setAlpha(0.25));
    this.updateTracker(this.registry.get('runState').memories.length);
  }

  updateTracker(count) {
    this.trackerIcons.forEach((icon, i) => icon.setAlpha(i < count ? 1 : 0.25));
  }

  // UC-14: fade to the next era, or the ending after the last (UC-16).
  advance() {
    this.cameras.main.fadeOut(400, 13, 13, 26);
    this.uiCam.fadeOut(400, 13, 13, 26);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      if (this.era.next) this.scene.start(SCENES.ERA, { eraKey: this.era.next });
      else this.scene.start(SCENES.END);
    });
  }

  // Era 3's grey rain: thin falling streaks. Placeholder-grade on purpose.
  startRain() {
    // Screen-space, not world-space: rain should fill the view no matter where
    // the camera has scrolled to, so it rides the UI camera.
    for (let i = 0; i < 60; i++) {
      const drop = this.ui(this.add.rectangle(
        Phaser.Math.Between(0, GAME_WIDTH),
        Phaser.Math.Between(-GAME_HEIGHT, 0),
        1, 6, 0xcfd6e6, 0.6,
      )).setDepth(8);
      this.tweens.add({
        targets: drop,
        y: GAME_HEIGHT + 8,
        duration: Phaser.Math.Between(600, 1100),
        repeat: -1,
        delay: Phaser.Math.Between(0, 800),
      });
    }
  }

  spawnNpc(cfg) {
    const startX = cfg.x * TILE_SIZE + TILE_SIZE / 2;
    const startY = cfg.y * TILE_SIZE + TILE_SIZE / 2;
    const sprite = this.world(this.add.sprite(startX, startY, NPC_TEXTURE));

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

    this.sortDepth();

    // Dialogue mode: world frozen, Space/Enter pages through (UC-9).
    if (this.dialogueBox.isOpen()) {
      this.player.setVelocity(0, 0);
      this.player.anims.stop();
      this.player.setFrame(0);
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
      this.player.play(playerAnim(this.outfit, facing), true);
    } else {
      // Standing still rests on the idle frame rather than freezing mid-stride.
      this.player.anims.stop();
      this.player.setFrame(0);
    }

    // ... and targeting (UC-8): prompt over the faced interactable.
    const target = findTarget(this.playerTile(), this.interactables);
    if (target) {
      this.prompt.setPosition(target.sprite.x, target.sprite.y - 18).setVisible(true);
      if (this.interactPressed()) target.onInteract();
    } else {
      this.prompt.setVisible(false);
    }

    // 'reach' objectives complete on entering the zone (UC-11).
    if (!this.objectiveDone && this.era.objective.type === 'reach') {
      const { tileX, tileY } = this.playerTile();
      if (inZone(tileX, tileY, this.era.objective.zone)) this.completeObjective();
    }
  }
}
