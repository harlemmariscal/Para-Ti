// Classic Game Boy movement: 4 directions, no diagonals.
// Horizontal wins when both axes are held (deterministic, matches Pokémon feel).
export function resolveDirection({ left, right, up, down }) {
  const h = (right ? 1 : 0) - (left ? 1 : 0);
  const v = (down ? 1 : 0) - (up ? 1 : 0);

  if (h !== 0) return { vx: h, vy: 0, facing: h > 0 ? 'right' : 'left' };
  if (v !== 0) return { vx: 0, vy: v, facing: v > 0 ? 'down' : 'up' };
  return { vx: 0, vy: 0, facing: null };
}
