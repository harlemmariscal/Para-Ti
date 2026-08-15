// UC-9: pure paged-dialogue state. A page: { speaker, lines[], attribution? }.
// DialogueBox (src/ui/DialogueBox.js) renders this; scenes drive advance on Space/Enter.
export function createDialogue(pages) {
  if (!Array.isArray(pages) || pages.length === 0) {
    throw new Error('Dialogue needs at least one page');
  }
  return { pages, index: 0, done: false };
}

export function currentPage(d) {
  return d.pages[d.index];
}

export function advanceDialogue(d) {
  if (d.done) return d;
  if (d.index + 1 >= d.pages.length) return { ...d, done: true };
  return { ...d, index: d.index + 1 };
}
