import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";

const context = vm.createContext({ console, performance, window: {} });
context.window = context;
vm.runInContext(fs.readFileSync(new URL("../js/carrier-breeding-solver.js", import.meta.url), "utf8"), context, { filename: "carrier-breeding-solver.js" });
const solver = context.CarrierBreedingSolver;

function graphChild(recipes, a, b, sexA, sexB) {
  const directional = recipes[`${a}:${sexA}+${b}:${sexB}`];
  if (directional !== undefined) return directional;
  return recipes[[a, b].sort().join("+")] ?? null;
}

function run({ roster, targetId = "Target", desiredPassives = [], recipes = {}, speciesIds, maxCombinations }) {
  const ids = speciesIds || [...new Set(roster.map((pal) => pal.speciesId).concat(targetId, Object.values(recipes).filter(Boolean)))];
  return solver.solve({ roster, targetId, desiredPassives, speciesIds: ids, maxCombinations,
    childFor: (a, b, sexA, sexB) => graphChild(recipes, a, b, sexA, sexB) });
}

function plannedCount(node) {
  return node.owned ? 0 : 1 + plannedCount(node.parents[0]) + plannedCount(node.parents[1]);
}

function validate(result, roster, desiredPassives, recipes) {
  const ownedIds = new Set(roster.map((pal) => pal.id));
  const fullMask = (1 << desiredPassives.length) - 1;
  function visit(node) {
    if (node.owned) {
      assert.ok(ownedIds.has(node.individualId), `owned leaf ${node.individualId} exists in roster`);
      return node.mask;
    }
    assert.equal(node.parents.length, 2, "planned carrier has two parents");
    const [a, b] = node.parents;
    assert.notEqual(a.sex, b.sex, "parents have opposite sexes");
    const child = graphChild(recipes, a.speciesId, b.speciesId, a.sex, b.sex);
    assert.equal(child, node.speciesId, "dataset confirms planned child");
    const union = visit(a) | visit(b);
    assert.equal(node.mask & ~union, 0, "no desired passive appears spontaneously");
    assert.equal(node.mask, union, "planned carrier keeps the desired union");
    return node.mask;
  }
  assert.equal(visit(result.root), fullMask, "target carries every desired passive");
  assert.equal(plannedCount(result.root), result.breedingCount, "cost equals total planned breedings");
}

const baseRecipes = { "A+B": "C", "C+D": "Target" };
const baseRoster = [
  { id: "a", speciesId: "A", sex: "Male", level: 10, passives: ["P1"] },
  { id: "b", speciesId: "B", sex: "Female", level: 20, passives: ["P2"] },
  { id: "d", speciesId: "D", sex: "Female", level: 30, passives: [] },
];

// T01 — cible déjà possédée.
const owned = run({ roster: baseRoster.concat({ id: "ready", speciesId: "Target", sex: "Male", passives: ["P1", "P2"] }), desiredPassives: ["P1", "P2"], recipes: baseRecipes });
assert.equal(owned.status, "already-owned");
assert.equal(owned.breedingCount, 0);
assert.equal(owned.root.individualId, "ready");

// T02 — croisement direct.
const directRecipes = { "A+B": "Target" };
const direct = run({ roster: baseRoster.slice(0, 2), desiredPassives: ["P1", "P2"], recipes: directRecipes });
assert.equal(direct.status, "found");
assert.equal(direct.breedingCount, 1);
validate(direct, baseRoster.slice(0, 2), ["P1", "P2"], directRecipes);

// T03 — chaîne simple.
const chain = run({ roster: baseRoster, desiredPassives: ["P1", "P2"], recipes: baseRecipes });
assert.equal(chain.breedingCount, 2);
validate(chain, baseRoster, ["P1", "P2"], baseRecipes);

// T04 — deux branches planifiées.
const branchRoster = [
  { id: "a", speciesId: "A", sex: "Female", passives: ["P1"] },
  { id: "b", speciesId: "B", sex: "Male", passives: ["P2"] },
  { id: "d", speciesId: "D", sex: "Female", passives: ["P3"] },
  { id: "e", speciesId: "E", sex: "Male", passives: ["P4"] },
];
const branchRecipes = { "A+B": "C", "D+E": "F", "C+F": "Target" };
const branches = run({ roster: branchRoster, desiredPassives: ["P1", "P2", "P3", "P4"], recipes: branchRecipes });
assert.equal(branches.breedingCount, 3);
assert.ok(branches.root.parents.every((parent) => !parent.owned));
validate(branches, branchRoster, ["P1", "P2", "P3", "P4"], branchRecipes);

// T05 — un passif transporté depuis une source possédée.
const onePassive = run({ roster: baseRoster, desiredPassives: ["P1"], recipes: baseRecipes });
assert.equal(onePassive.status, "found");
assert.equal(onePassive.root.mask, 1);

// T06 — quatre passifs distribués et fusionnés progressivement.
assert.equal(branches.root.mask, 15);

// T07 — passif manquant.
const missing = run({ roster: baseRoster, desiredPassives: ["ABSENT"], recipes: baseRecipes });
assert.equal(missing.status, "missing-passive");
assert.deepEqual([...missing.missingPassiveIds], ["ABSENT"]);

// T08 — zéro passif, route d’espèces uniquement.
const noPassive = run({ roster: baseRoster, recipes: baseRecipes });
assert.equal(noPassive.status, "found");
assert.equal(noPassive.breedingCount, 2);

// T09 — uniquement des sources de même sexe.
const incompatible = run({ roster: [
  { id: "a", speciesId: "A", sex: "Male", passives: [] },
  { id: "b", speciesId: "B", sex: "Male", passives: [] },
], recipes: { "A+B": "Target" } });
assert.equal(incompatible.status, "no-route");

// T10 — le bon sexe de l’intermédiaire est planifié.
const sexRecipes = {
  "A+B": "C",
  "C:Male+D:Female": "Target",
  "D:Female+C:Male": "Target",
};
const sexRoute = run({ roster: baseRoster, desiredPassives: ["P1", "P2"], recipes: sexRecipes });
assert.equal(sexRoute.status, "found");
assert.equal(sexRoute.root.parents.find((parent) => parent.speciesId === "C").sex, "Male");

// T11 — exception directionnelle liée au sexe.
const specialRecipes = { "Kat:Female+Wix:Male": "Special", "Wix:Male+Kat:Female": "Special" };
const special = run({ roster: [
  { id: "kat", speciesId: "Kat", sex: "Female", passives: ["S1"] },
  { id: "wix", speciesId: "Wix", sex: "Male", passives: ["S2"] },
], targetId: "Special", desiredPassives: ["S1", "S2"], recipes: specialRecipes });
assert.equal(special.status, "found");
assert.equal(special.breedingCount, 1);

// T11/T12 — règles sexuées et cible Terraria dans le dataset local réel.
vm.runInContext(fs.readFileSync(new URL("../js/breeding-data.js", import.meta.url), "utf8"), context, { filename: "breeding-data.js" });
const raw = context.BREEDING_DATA;
const realIds = raw.pals.map(([id]) => id);
const realById = new Map(raw.pals.map((pal) => [String(pal[0]).toLowerCase(), pal]));
const pairIndex = (a, b) => {
  const low = Math.min(a, b); const high = Math.max(a, b);
  return low * raw.pals.length - (low * (low - 1)) / 2 + high - low;
};
const realChildFor = (aId, bId, sexA, sexB) => {
  const a = realById.get(String(aId).toLowerCase());
  const b = realById.get(String(bId).toLowerCase());
  if (!a || !b) return null;
  let hasRule = false;
  for (const combo of raw.genderCombos || []) {
    let expectedA; let expectedB; let child;
    if (combo[0] === a[3] && combo[2] === b[3]) {
      expectedA = combo[1] === "M" ? "Male" : "Female";
      expectedB = combo[3] === "M" ? "Male" : "Female";
      child = combo[4];
    } else if (combo[0] === b[3] && combo[2] === a[3]) {
      expectedA = combo[3] === "M" ? "Male" : "Female";
      expectedB = combo[1] === "M" ? "Male" : "Female";
      child = combo[4];
    } else continue;
    hasRule = true;
    if (sexA === expectedA && sexB === expectedB) return raw.pals[child]?.[0] || null;
  }
  if (hasRule) return null;
  return raw.pals[raw.children[pairIndex(a[3], b[3])]]?.[0] || null;
};
const genderCombo = raw.genderCombos[0];
const genderRoster = [
  { id: "gender-a", speciesId: raw.pals[genderCombo[0]][0], sex: genderCombo[1] === "M" ? "Male" : "Female", passives: [] },
  { id: "gender-b", speciesId: raw.pals[genderCombo[2]][0], sex: genderCombo[3] === "M" ? "Male" : "Female", passives: [] },
];
const actualSpecial = solver.solve({ roster: genderRoster, targetId: raw.pals[genderCombo[4]][0], desiredPassives: [], speciesIds: realIds, childFor: realChildFor });
assert.equal(actualSpecial.status, "found");
assert.equal(actualSpecial.breedingCount, 1);

let terrariaPair = null;
for (let a = 0; a < raw.pals.length && !terrariaPair; a += 1) {
  for (let b = a; b < raw.pals.length; b += 1) {
    const child = raw.pals[raw.children[pairIndex(a, b)]]?.[0];
    if (String(child).startsWith("Yakushima") && child !== raw.pals[a][0] && child !== raw.pals[b][0]) { terrariaPair = [a, b, child]; break; }
  }
}
assert.ok(terrariaPair, "Terraria breeding fixture exists");
const terraria = solver.solve({
  roster: [
    { id: "terraria-a", speciesId: raw.pals[terrariaPair[0]][0], sex: "Male", passives: [] },
    { id: "terraria-b", speciesId: raw.pals[terrariaPair[1]][0], sex: "Female", passives: [] },
  ],
  targetId: terrariaPair[2], desiredPassives: [], speciesIds: realIds, childFor: realChildFor,
});
assert.equal(terraria.status, "found");
assert.equal(terraria.breedingCount, 1);

// T13 — déterminisme.
const chainAgain = run({ roster: baseRoster, desiredPassives: ["P1", "P2"], recipes: baseRecipes });
assert.deepEqual(JSON.parse(JSON.stringify(chainAgain.root)), JSON.parse(JSON.stringify(chain.root)));

// Interruption technique distincte d’une absence de route.
const interrupted = run({ roster: branchRoster, desiredPassives: ["P1", "P2", "P3", "P4"], recipes: branchRecipes, maxCombinations: 0 });
assert.equal(interrupted.status, "interrupted");

// T14 — roster synthétique ~700 individus, dédupliqué en états fonctionnels.
const largeRoster = Array.from({ length: 700 }, (_, index) => ({
  id: `pal-${index}`, speciesId: index % 2 ? "A" : "B", sex: index % 2 ? "Male" : "Female",
  level: index, passives: index < 4 ? [`L${index + 1}`] : [],
}));
largeRoster.push(
  { id: "l1", speciesId: "A", sex: "Male", passives: ["L1", "L2"] },
  { id: "l2", speciesId: "B", sex: "Female", passives: ["L3", "L4"] },
);
const largeStarted = performance.now();
const large = run({ roster: largeRoster, desiredPassives: ["L1", "L2", "L3", "L4"], recipes: { "A+B": "Target" } });
assert.equal(large.status, "found");
assert.equal(large.breedingCount, 1);
assert.ok(performance.now() - largeStarted < 500, "700-individual fixture stays interactive");

console.log(JSON.stringify({
  tests: 15, deterministic: true, independentBranches: true, invariants: true, terraria: terrariaPair[2],
  largeRosterMs: large.durationMs, largeExpanded: large.stats.expanded, largeCombinations: large.stats.combinations,
}));
