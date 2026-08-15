import { COLORS, HEX, FONT, GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { createDialogue, currentPage, advanceDialogue } from '../dialogue.js';

const BOX_HEIGHT = 84;

// UC-9: Pokémon-style dialogue box. Pure rendering over src/dialogue.js state —
// the owning scene forwards Space/Enter to advance().
export default class DialogueBox {
  constructor(scene) {
    this.scene = scene;
    this.dialogue = null;
    this.onDone = null;

    const top = GAME_HEIGHT - BOX_HEIGHT;
    this.root = scene.add.container(0, top).setDepth(20).setVisible(false);

    // BW2's box is a rounded, layered panel that sits ON the screen: a dark
    // drop shadow, a bright outer frame, then the fill inset inside it. Kept in
    // the game's navy/pink identity rather than BW2's own blue.
    const W = GAME_WIDTH - 16;
    const H = BOX_HEIGHT - 12;
    const shadow = scene.add.graphics();
    shadow.fillStyle(0x000000, 0.35).fillRoundedRect(10, 10, W, H, 8);
    const frame = scene.add.graphics();
    frame.fillStyle(HEX.PANEL_BORDER, 1).fillRoundedRect(8, 6, W, H, 8);
    frame.fillStyle(HEX.PANEL, 0.98).fillRoundedRect(11, 9, W - 6, H - 6, 6);
    // Inner highlight along the top edge — the lit lip of the frame.
    frame.fillStyle(0xffffff, 0.07).fillRoundedRect(11, 9, W - 6, 10, 6);

    this.speaker = scene.add.text(22, 16, '', {
      fontFamily: FONT, fontSize: '8px', color: COLORS.PINK_SOFT,
    });
    this.body = scene.add.text(22, 32, '', {
      fontFamily: FONT, fontSize: '8px', color: COLORS.WHITE, lineSpacing: 6,
    });
    this.attribution = scene.add.text(GAME_WIDTH - 22, BOX_HEIGHT - 22, '', {
      fontFamily: FONT, fontSize: '7px', color: '#9a9ab0', fontStyle: 'italic',
    }).setOrigin(1, 1);

    // The advance cue bounces, the way BW2's does, so a waiting box reads as
    // waiting rather than stuck.
    this.more = scene.add.text(GAME_WIDTH - 22, BOX_HEIGHT - 10, '▼', {
      fontFamily: FONT, fontSize: '8px', color: COLORS.PINK_SOFT,
    }).setOrigin(1, 1);
    scene.tweens.add({
      targets: this.more, y: this.more.y + 3, duration: 520,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    this.root.add([shadow, frame, this.speaker, this.body, this.attribution, this.more]);
  }

  open(pages, onDone = null) {
    this.dialogue = createDialogue(pages);
    this.onDone = onDone;
    this.render();
    this.root.setVisible(true);
  }

  advance() {
    if (!this.isOpen()) return;
    this.dialogue = advanceDialogue(this.dialogue);
    if (this.dialogue.done) {
      this.root.setVisible(false);
      const done = this.onDone;
      this.dialogue = null;
      this.onDone = null;
      done?.();
      return;
    }
    this.render();
  }

  isOpen() {
    return this.dialogue !== null;
  }

  render() {
    const page = currentPage(this.dialogue);
    this.speaker.setText(page.speaker ?? '');
    this.body.setText(page.lines.join('\n'));
    this.attribution.setText(page.attribution ? `— ${page.attribution}` : '');
  }
}
