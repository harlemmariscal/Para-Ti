// Fails fast and loudly if an era config is malformed — a bad config should
// crash at load with a clear message, never mid-play with a mystery.
export function validateEraConfig(config) {
  const label = `Era "${config?.key ?? '?'}"`;

  for (const field of ['key', 'name', 'next', 'tint', 'map', 'spawn', 'objective', 'memory']) {
    if (!(field in config)) throw new Error(`${label}: missing "${field}"`);
  }

  const { tileSize, data, collision } = config.map;
  if (!Number.isInteger(tileSize) || tileSize <= 0) {
    throw new Error(`${label}: map.tileSize must be a positive integer`);
  }
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(`${label}: map.data must be a non-empty 2D array`);
  }
  const cols = data[0].length;
  for (const row of data) {
    if (!Array.isArray(row) || row.length !== cols) {
      throw new Error(`${label}: map rows must all be the same width`);
    }
  }
  if (!Array.isArray(collision)) {
    throw new Error(`${label}: map.collision must be an array of tile indices`);
  }

  const { x, y } = config.spawn;
  if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || y < 0 || y >= data.length || x >= cols) {
    throw new Error(`${label}: spawn { x: ${x}, y: ${y} } is out of bounds`);
  }
  if (collision.includes(data[y][x])) {
    throw new Error(`${label}: spawn sits on a collision tile`);
  }

  const inBounds = (px, py) =>
    Number.isInteger(px) && Number.isInteger(py) && px >= 0 && py >= 0 && px < cols && py < data.length;
  const walkable = (px, py) => inBounds(px, py) && !collision.includes(data[py][px]);

  const { objective, memory } = config;
  if (objective.type === 'interact') {
    if (!inBounds(objective.target?.x, objective.target?.y)) {
      throw new Error(`${label}: objective target is out of bounds`);
    }
  } else if (objective.type === 'reach') {
    const z = objective.zone;
    if (!z || !inBounds(z.x, z.y) || !inBounds(z.x + z.w - 1, z.y + z.h - 1)) {
      throw new Error(`${label}: objective zone is out of bounds`);
    }
  } else {
    throw new Error(`${label}: objective.type must be "interact" or "reach"`);
  }

  if (!walkable(memory.x, memory.y)) {
    throw new Error(`${label}: memory must sit on a walkable tile`);
  }
  for (const npc of config.npcs ?? []) {
    if (!walkable(npc.x, npc.y)) {
      throw new Error(`${label}: NPC "${npc.name}" must stand on a walkable tile`);
    }
  }
  if (config.harley && !walkable(config.harley.x, config.harley.y)) {
    throw new Error(`${label}: harley must stand on a walkable tile`);
  }

  return true;
}
