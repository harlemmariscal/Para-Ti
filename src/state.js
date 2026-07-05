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

// Phase 2 (UC-12) adds addMemory(state, memoryKey) here.
