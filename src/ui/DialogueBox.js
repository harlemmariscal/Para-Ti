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

    const bg = scene.add.rectangle(4, 4, GAME_WIDTH - 8, BOX_HEIGHT - 8, HEX.PANEL, 0.95)
      .setOrigin(0)
      .setStrokeStyle(2, HEX.PANEL_BORDER);
    this.speaker = scene.add.text(14, 12, '', {
      fontFamily: FONT, fontSize: '8px', color: COLORS.PINK_SOFT,
    });
    this.body = scene.add.text(14, 28, '', {
      fontFamily: FONT, fontSize: '8px', color: COLORS.WHITE, lineSpacing: 6,
    });
    this.attribution = scene.add.text(GAME_WIDTH - 14, BOX_HEIGHT - 24, '', {
      fontFamily: FONT, fontSize: '7px', color: '#9a9ab0', fontStyle: 'italic',
    }).setOrigin(1, 1);
    this.more = scene.add.text(GAME_WIDTH - 14, BOX_HEIGHT - 10, '>', {
      fontFamily: FONT, fontSize: '8px', color: COLORS.PINK_SOFT,
    }).setOrigin(1, 1);

    this.root.add([bg, this.speaker, this.body, this.attribution, this.more]);
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
