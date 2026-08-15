// Run state: everything the current playthrough knows. No persistence — by design (BR-7).
export const OUTFITS = ['casual', 'athletic'];

export function createRunState() {
  return { outfit: null, memories: [] };
}

export function setOutfit(state, outfit) {
  if (!OUTFITS.includes(outfit)) {
    throw new Error(`Invalid outfit "${outfit}"`);
  }
  return { ...state, outfit };
}

// UC-12/BR-2: one memory per era, never re-collected within a play.
export function addMemory(state, memoryId) {
  if (state.memories.includes(memoryId)) {
    throw new Error(`Memory "${memoryId}" already collected`);
  }
  return { ...state, memories: [...state.memories, memoryId] };
}
