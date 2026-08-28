import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";

const context = vm.createContext({ console, performance, window: {} });
context.window = context;
for (const file of ["js/passive-probability.js", "js/probabilistic-breeding-solver.js"]) {
  vm.runInContext(fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8"), context, { filename: file });
}

const p = context.PassiveProbability;
for (const [pool, desired, extras, expected] of [
  [1, 1, 0, .4], [2, 2, 0, .24], [3, 3, 0, .12], [4, 4, 0, .1],
  [2, 1, 0, .08], [4, 2, 0, .02], [4, 2, 1, .075],
]) assert.ok(Math.abs(p.standard(pool, desired, extras) - expected) < 1e-12, `${pool}/${desired}/${extras}`);
assert.ok(Math.abs(p.vegetable(.4) - .64) < 1e-12);
assert.equal(p.special(4, 4, 0), 1);
assert.ok(Math.abs(p.special(8, 4, 0) - 1 / 70) < 1e-12);

const childFor = (a, b, sexA, sexB) => {
  if (a === b && sexA !== "Unknown" && sexB !== "Unknown" && sexA === sexB) return null;
  const key = [a, b].sort().join("+");
  return ({ "A+B": "C", "C+D": "Target", "A+D": "Target" })[key] || "C";
};
const roster = [
  { id: "a-clean", speciesId: "A", sex: "Male", passives: ["P1"] },
  { id: "a-dirty", speciesId: "A", sex: "Male", passives: ["P1", "J1", "J2"] },
  { id: "b", speciesId: "B", sex: "Female", passives: ["P2"] },
  { id: "d", speciesId: "D", sex: "Female", passives: [] },
];
const solve = (desiredPassives) => context.ProbabilisticBreedingSolver.solve({ roster, targetId: "Target", desiredPassives, childFor, maxDurationMs: 1000 });
for (let count = 1; count <= 2; count += 1) {
  const result = solve(["P1", "P2"].slice(0, count));
  assert.ok(result.root, `route ${count} passive(s)`);
  assert.ok(["vegetable", "special", "standard"].includes(result.root.recommendedCake));
}
const first = solve(["P1", "P2"]);
const second = solve(["P1", "P2"]);
assert.equal(first.root.signature, second.root.signature, "deterministic route");
assert.ok(first.root.signature.includes("a-clean"), "clean source should dominate the polluted equivalent");

const present = context.ProbabilisticBreedingSolver.solve({
  roster: roster.concat({ id: "ready", speciesId: "Target", sex: "Female", passives: ["P1", "P2", "J"] }),
  targetId: "Target", desiredPassives: ["P1", "P2"], childFor,
});
assert.equal(present.summary, "Déjà présent dans votre sauvegarde");

for (const count of [3, 4]) {
  const wanted = Array.from({ length: count }, (_, index) => `Q${index + 1}`);
  const split = Math.ceil(count / 2);
  const result = context.ProbabilisticBreedingSolver.solve({
    roster: [
      { id: "left", speciesId: "Left", sex: "Female", passives: wanted.slice(0, split) },
      { id: "right", speciesId: "Right", sex: "Male", passives: wanted.slice(split) },
    ],
    targetId: "Goal", desiredPassives: wanted,
    childFor: (a, b) => [a, b].sort().join("+") === "Left+Right" ? "Goal" : null,
  });
  assert.ok(result.root, `${count}-passive route`);
}

const branchResult = context.ProbabilisticBreedingSolver.solve({
  roster: [
    { id: "a", speciesId: "A", sex: "Female", passives: ["R1"] },
    { id: "b", speciesId: "B", sex: "Male", passives: ["R2"] },
    { id: "d", speciesId: "D", sex: "Female", passives: ["R3"] },
    { id: "e", speciesId: "E", sex: "Male", passives: ["R4"] },
  ],
  targetId: "Target", desiredPassives: ["R1", "R2", "R3", "R4"],
  speciesIds: ["A", "B", "C", "D", "E", "F", "Target"],
  childFor: (a, b) => ({ "A+B": "C", "D+E": "F", "C+F": "Target" })[[a, b].sort().join("+")] || null,
  maxDurationMs: 1000,
});
assert.ok(branchResult.root?.parents?.every((parent) => !parent.owned), "independent planned branches");

const deepBranchResult = context.ProbabilisticBreedingSolver.solve({
  roster: [
    { id: "a", speciesId: "A", sex: "Female", passives: ["T1"] },
    { id: "b", speciesId: "B", sex: "Male", passives: [] },
    { id: "d", speciesId: "D", sex: "Female", passives: ["T2"] },
    { id: "e", speciesId: "E", sex: "Male", passives: [] },
    { id: "h", speciesId: "H", sex: "Female", passives: ["T3"] },
    { id: "i", speciesId: "I", sex: "Male", passives: ["T4"] },
  ],
  targetId: "Target", desiredPassives: ["T1", "T2", "T3", "T4"],
  speciesIds: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "Target"],
  childFor: (a, b) => ({
    "A+B": "C", "D+E": "F", "C+F": "G", "H+I": "J", "G+J": "Target",
  })[[a, b].sort().join("+")] || null,
  maxDurationMs: 1000,
});
assert.ok(deepBranchResult.root?.plannedJoinCount >= 2, "multi-level planned branches remain reusable");
const restrictedDeepBranchResult = context.ProbabilisticBreedingSolver.solve({
  roster: [
    { id: "a", speciesId: "A", sex: "Female", passives: ["T1"] },
    { id: "b", speciesId: "B", sex: "Male", passives: [] },
    { id: "d", speciesId: "D", sex: "Female", passives: ["T2"] },
    { id: "e", speciesId: "E", sex: "Male", passives: [] },
    { id: "h", speciesId: "H", sex: "Female", passives: ["T3"] },
    { id: "i", speciesId: "I", sex: "Male", passives: ["T4"] },
  ],
  targetId: "Target", desiredPassives: ["T1", "T2", "T3", "T4"],
  speciesIds: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "Target"],
  childFor: (a, b) => ({
    "A+B": "C", "D+E": "F", "C+F": "G", "H+I": "J", "G+J": "Target",
  })[[a, b].sort().join("+")] || null,
  allowPlannedIntermediates: false,
  maxDurationMs: 1000,
});
assert.ok(!restrictedDeepBranchResult.root, "historical restriction cannot solve a multi-level planned topology");

const specialSex = context.ProbabilisticBreedingSolver.solve({
  roster: [
    { id: "female", speciesId: "Kat", sex: "Female", passives: ["S1"] },
    { id: "male", speciesId: "Wix", sex: "Male", passives: ["S2"] },
  ],
  targetId: "Target", desiredPassives: ["S1", "S2"],
  childFor: (a, b, sexA, sexB) => a === "Kat" && b === "Wix" && sexA === "Female" && sexB === "Male" ? "Target" : null,
});
assert.ok(specialSex.root, "gender-constrained special breeding");

console.log(JSON.stringify({ probabilityFixtures: 10, deterministic: true, cleanSource: true, branches: true, deepBranches: true, specialSex: true, sampleMs: first.durationMs }));
