import { era1 } from './era1-childhood.js';
import { era2 } from './era2-young-love.js';
import { era3 } from './era3-drift.js';
import { era4 } from './era4-now.js';

// Ordered, chronological (BR-1). Adding an era = a config file + one line here.
export const ERAS = [era1, era2, era3, era4];

export function getEraConfig(key) {
  const era = ERAS.find((e) => e.key === key);
  if (!era) throw new Error(`Unknown era "${key}"`);
  return era;
}
