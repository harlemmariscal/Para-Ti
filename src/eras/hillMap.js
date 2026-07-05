// The hill overlooking the city — shared by era 2 (golden) and era 4 (sunset).
// Same place, relit: one layout, two tints (spec §3, recurring-hill note).
function terrace(y, gaps) {
  const walls = [];
  for (let x = 1; x < 29; x++) {
    if (!gaps.includes(x)) walls.push([x, y]);
  }
  return walls;
}

// Three terraces with staggered gaps — a short zigzag climb, never a maze.
export const HILL_WALLS = [
  ...terrace(14, [20, 21, 22]),
  ...terrace(9, [6, 7, 8]),
  ...terrace(5, [15, 16]),
];

export const HILL_SPAWN = { x: 4, y: 17 };
export const SUMMIT_ZONE = { x: 12, y: 1, w: 6, h: 3 };
