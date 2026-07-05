// UC-8: pure targeting for the generic interaction system.
// An interactable only needs { x, y } tile coords here; scenes attach sprites/handlers.
const AHEAD = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};

export function targetTile(tileX, tileY, facing) {
  const [dx, dy] = AHEAD[facing];
  return { x: tileX + dx, y: tileY + dy };
}

// Matches the tile ahead (Pokémon-style facing) or the player's own tile
// (floor items — a revealed memory can be walked onto).
export function findTarget({ tileX, tileY, facing }, interactables) {
  const ahead = targetTile(tileX, tileY, facing);
  return (
    interactables.find(
      (i) =>
        (i.x === ahead.x && i.y === ahead.y) ||
        (i.x === tileX && i.y === tileY),
    ) ?? null
  );
}

// UC-11 'reach' objectives: inclusive tile rectangle.
export function inZone(tileX, tileY, zone) {
  return (
    tileX >= zone.x && tileX < zone.x + zone.w &&
    tileY >= zone.y && tileY < zone.y + zone.h
  );
}

// EraScene converts the player's feet-center to tile coords with:
//   tileX = floor(player.x / TILE_SIZE), tileY = floor((player.y + 10) / TILE_SIZE)
// (+10 because the 12x12 feet hitbox sits at offset (2,20) of the 16x32 sprite).
