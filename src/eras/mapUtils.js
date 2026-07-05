// Builds a single-screen map: walls (1) around the border, floor (0) inside,
// plus any extra wall blocks. Phase 3 replaces array maps with Tiled JSON.
export function buildMapData(cols, rows, extraWalls = []) {
  const data = [];
  for (let y = 0; y < rows; y++) {
    const row = [];
    for (let x = 0; x < cols; x++) {
      const isBorder = x === 0 || y === 0 || x === cols - 1 || y === rows - 1;
      row.push(isBorder ? 1 : 0);
    }
    data.push(row);
  }
  for (const [x, y] of extraWalls) {
    data[y][x] = 1;
  }
  return data;
}
