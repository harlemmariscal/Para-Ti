import { era1 } from './era1-childhood.js';

// Ordered list of eras. Phase 2 appends era2 (Young love), era3 (The drift),
// era4 (Now, for good). Adding an era = adding a config file + one line here.
export const ERAS = [era1];

export function getEraConfig(key) {
  const era = ERAS.find((e) => e.key === key);
  if (!era) throw new Error(`Unknown era "${key}"`);
  return era;
}
