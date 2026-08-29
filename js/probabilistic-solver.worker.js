/* Palworld Nyu Tools — exécution hors thread du solveur probabiliste. GPL-3.0. */
self.window = self;
importScripts(
  "breeding-data.js?v=0.9",
  "passive-probability.js?v=0.9.1",
  "probabilistic-breeding-solver.js?v=0.9.3",
);

const raw = self.BREEDING_DATA;
const pals = raw.pals.map(([id, name, portrait, order]) => ({ id, name, portrait, order }));
const byId = new Map(pals.map((pal) => [pal.id.toLowerCase(), pal]));

function pairIndex(a, b) {
  const low = Math.min(a, b); const high = Math.max(a, b);
  return low * pals.length - (low * (low - 1)) / 2 + high - low;
}

function childFor(aId, bId, sexA = null, sexB = null) {
  const a = byId.get(String(aId).toLowerCase());
  const b = byId.get(String(bId).toLowerCase());
  if (!a || !b) return null;
  let hasGenderRule = false;
  for (const combo of raw.genderCombos || []) {
    let expectedA; let expectedB; let childIndex;
    if (combo[0] === a.order && combo[2] === b.order) {
      expectedA = combo[1] === "M" ? "Male" : "Female";
      expectedB = combo[3] === "M" ? "Male" : "Female"; childIndex = combo[4];
    } else if (combo[0] === b.order && combo[2] === a.order) {
      expectedA = combo[3] === "M" ? "Male" : "Female";
      expectedB = combo[1] === "M" ? "Male" : "Female"; childIndex = combo[4];
    } else continue;
    hasGenderRule = true;
    if ((!sexA || sexA === "Unknown" || sexA === expectedA) && (!sexB || sexB === "Unknown" || sexB === expectedB)) return pals[childIndex]?.id || null;
  }
  if (hasGenderRule && sexA && sexB) return null;
  const childIndex = raw.children[pairIndex(a.order, b.order)];
  return childIndex >= 0 ? pals[childIndex]?.id || null : null;
}

self.onmessage = ({ data }) => {
  if (data?.type !== "solve") return;
  try {
    const result = self.ProbabilisticBreedingSolver.solve({
      ...data.input, childFor, speciesIds: pals.map((pal) => pal.id),
    });
    self.postMessage({ type: "solved", requestId: data.requestId, result });
  } catch (error) {
    self.postMessage({ type: "error", requestId: data.requestId, message: error instanceof Error ? error.message : String(error) });
  }
};
