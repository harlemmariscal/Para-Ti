import { describe, it, expect } from 'vitest';
import { createDialogue, currentPage, advanceDialogue } from '../src/dialogue.js';

const pages = [
  { speaker: 'Townsperson', lines: ['first page'], attribution: '"3005," Childish Gambino' },
  { speaker: null, lines: ['second page, line a', 'second page, line b'] },
];

describe('createDialogue', () => {
  it('starts on the first page, not done', () => {
    const d = createDialogue(pages);
    expect(d.index).toBe(0);
    expect(d.done).toBe(false);
    expect(currentPage(d)).toEqual(pages[0]);
  });

  it('throws on an empty page list', () => {
    expect(() => createDialogue([])).toThrow('Dialogue needs at least one page');
  });
});

describe('advanceDialogue', () => {
  it('moves to the next page without mutating', () => {
    const d = createDialogue(pages);
    const next = advanceDialogue(d);
    expect(next.index).toBe(1);
    expect(currentPage(next)).toEqual(pages[1]);
    expect(d.index).toBe(0);
  });

  it('marks done when advanced past the last page, keeping the last index', () => {
    const d = advanceDialogue(advanceDialogue(createDialogue(pages)));
    expect(d.done).toBe(true);
    expect(d.index).toBe(1);
  });

  it('is a no-op once done', () => {
    const d = advanceDialogue(advanceDialogue(createDialogue(pages)));
    expect(advanceDialogue(d)).toEqual(d);
  });
});
