/**
 * Integration check for the private-save Cumoir path.
 * Usage: node scripts/test-save-cumoir.mjs C:\path\to\Level.sav
 * The save is read only and never copied into the repository.
 */
import fs from "node:fs";
import vm from "node:vm";
import { performance } from "node:perf_hooks";
import { inspectWorld } from "../vendor/palworld-save-toolkit/js/migrate.js";
import { decompress } from "../vendor/ooz-wasm/index.js";

const savePath = process.argv[2];
if (!savePath || !fs.existsSync(savePath)) throw new Error("Provide a local Level.sav path.");

const parsed = await inspectWorld(new Uint8Array(fs.readFileSync(savePath)), decompress);
const storage = new Map();
const context = vm.createContext({
  console,
  setTimeout,
  clearTimeout,
  performance,
  crypto: { randomUUID: () => "test" },
  indexedDB: { open: () => { throw new Error("disabled in test"); } },
  localStorage: { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
  document: { querySelector: () => null, addEventListener: () => {} },
  window: {},
});
context.window = context;
for (const file of ["js/condensation-data.js", "js/egg-size-data.js", "js/breeding-data.js", "js/passive-data.js", "js/passive-probability.js", "js/probabilistic-breeding-solver.js", "js/save-cumoir.js"]) {
  vm.runInContext(fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8"), context, { filename: file });
}

const normalized = parsed.pals.map((pal) => ({
  id: pal.instanceId,
  speciesId: String(pal.species || pal.characterId || "").replace(/^BOSS_/i, ""),
  sex: pal.gender === "Male" || pal.gender === "Female" ? pal.gender : "Unknown",
  level: Number(pal.level) || 1,
  passives: Array.isArray(pal.passives) ? pal.passives.slice(0, 4) : [],
}));
const api = context.SaveCumoir.__test;
const emptyTemplate = context.SaveCumoir.template();
if (emptyTemplate.includes("Source des Pals") || emptyTemplate.includes("Transmission des passifs")) throw new Error("Empty save UI still exposes removed Cumoir blocks.");
if (!(emptyTemplate.indexOf("SaveGames") < emptyTemplate.indexOf("Importer une sauvegarde"))) throw new Error("Import instructions are not ordered correctly.");
api.loadRoster(normalized);
const activeTemplate = context.SaveCumoir.template();
if (activeTemplate.includes("data-save-roster") || activeTemplate.includes("data-save-search") || activeTemplate.includes("save-pal-card")) {
  throw new Error("The active Cumoir still renders the owned-Pal browser.");
}
if (activeTemplate.includes("Ancien calcul") || activeTemplate.includes("Nouveau calcul") || activeTemplate.includes("data-tree-view")) {
  throw new Error("The retired solver switch is still rendered.");
}
const targetAutocomplete = {
  empty: api.targetResults("") === "",
  oneCharacter: api.targetResults("a") === "",
  unlimited: (api.targetResults("an").match(/data-save-target=/g) || []).length > 8,
  missing: api.targetResults("zzzzzz").includes("Aucun Pal trouvé"),
  crossoverEye: api.targetResults("Cthulhu").includes("Œil de Cthulhu"),
  crossoverSlimes: (api.targetResults("Gelée").match(/data-save-target=/g) || []).length >= 6,
};
if (!Object.values(targetAutocomplete).every(Boolean)) throw new Error("Target autocomplete constraints failed.");
const movementSearch = api.searchPassives("vi");
if (!movementSearch.length || !movementSearch.some((passive) => !passive.name.toLowerCase().includes("vi") && passive.effect.toLowerCase().includes("vi"))) {
  throw new Error("Passive search does not include effect-only matches.");
}
const passiveModal = api.passiveModal();
if (!passiveModal.includes("Rechercher par nom ou effet")
  || !passiveModal.includes('placeholder="Vitesse, attaque, satiété…"')
  || !passiveModal.includes('aria-hidden="true">⌕</span>')) {
  throw new Error("Passive search guidance or icon is missing from the modal.");
}
const plannedDepth = (node) => node?.parents ? 1 + Math.max(...node.parents.map(plannedDepth)) : 0;

const target = context.BREEDING_DATA.pals.find(([id]) => id === "Anubis")?.[0];
if (!target) throw new Error("Anubis missing from breeding data.");
const available = [...new Set(normalized.flatMap((pal) => pal.passives))];
const objectives = available.filter((id) => context.PALWORLD_PASSIVES.some((passive) => passive.id === id)).slice(0, 4);
const solveChecks = [];
for (let count = 0; count <= 4; count += 1) {
  api.setTarget(target, objectives.slice(0, count));
  const result = api.solveProbabilistic({ maxDurationMs: 5000 });
  if (!result.root && !result.error) throw new Error(`Solver returned neither a plan nor an explicit error (${count} passives).`);
  solveChecks.push({ count, solved: Boolean(result.root), result: result.summary || result.error });
}
if (objectives.length) {
  api.setTarget(target, objectives.slice(0, Math.min(3, objectives.length)));
  const probabilistic = api.solveProbabilistic();
  if (!probabilistic.root && !probabilistic.error) throw new Error("Probabilistic solver returned neither a plan nor an explicit error.");
  if (probabilistic.root) {
    const graph = api.renderGraph(probabilistic);
    if (!graph.includes("data-cake-tooltip=\"") || !graph.includes("assets/items/")) throw new Error("Cake recommendation is missing from the shared tree renderer.");
    if (!graph.includes('save-tree-node__new">Nouveau')) throw new Error("Planned intermediates are missing the Nouveau badge.");
    if (graph.includes("expectedBatches") || graph.includes("probability")) throw new Error("Internal probability data leaked into the UI.");
  }
  solveChecks.push({ count: "unified", solved: Boolean(probabilistic.root), result: probabilistic.summary || probabilistic.error, durationMs: probabilistic.durationMs, expanded: probabilistic.expanded });
}
const anubisObjective = ["CoolTimeReduction_Up_2", "Legend", "Rare", "MoveSpeed_up_3"];
if (anubisObjective.every((id) => available.includes(id))) {
  api.setTarget(target, anubisObjective);
  const topology = (node) => node?.parents
    ? `${node.speciesId}(${topology(node.parents[0])},${topology(node.parents[1])})`
    : node?.speciesId;
  const branchMerges = (node) => node?.parents
    ? Number(node.parents.every((parent) => !parent.owned)) + node.parents.reduce((sum, parent) => sum + branchMerges(parent), 0)
    : 0;
  const anubis = api.solveProbabilistic({ maxDurationMs: 5000 });
  solveChecks.push({ count: "anubis-4", solved: Boolean(anubis.root), result: anubis.summary || anubis.error,
    durationMs: anubis.durationMs, expanded: anubis.expanded, generated: anubis.generated,
    expectedBatches: anubis.expectedBatches, depth: plannedDepth(anubis.root), branchMerges: branchMerges(anubis.root),
    topology: topology(anubis.root), joinsConsidered: anubis.joinsConsidered, truncated: anubis.truncated });

  api.setTarget("SheepBall", anubisObjective);
  const lamball = api.solveProbabilistic({ maxDurationMs: 5000 });
  if (!lamball.root) throw new Error(`Lamball four-passive benchmark failed: ${JSON.stringify(lamball)}`);
  solveChecks.push({ count: "lamball-4", solved: true, result: lamball.summary, durationMs: lamball.durationMs,
    expanded: lamball.expanded, generated: lamball.generated, expectedBatches: lamball.expectedBatches,
    depth: plannedDepth(lamball.root), joinsConsidered: lamball.joinsConsidered });
}
api.setTarget("Baphomet_Dark", []);
const incineramNoct = api.solveProbabilistic({ maxDurationMs: 5000 });
if (!incineramNoct.root) throw new Error(`Structural zero-passive route failed: ${incineramNoct.error}`);
const zeroPassiveGraph = api.renderGraph(incineramNoct);
if (zeroPassiveGraph.includes("save-tree-node__passives")) throw new Error("Zero-passive graph renders empty passive areas.");
solveChecks.push({
  count: "incineram-noct-0", solved: true, result: incineramNoct.summary,
  owned: Boolean(incineramNoct.root.owned), depth: plannedDepth(incineramNoct.root),
});
const male = normalized.find((pal) => pal.sex === "Male");
const female = normalized.find((pal) => pal.sex === "Female");
const directResult = male && female ? api.childFor(male.speciesId, female.speciesId) : null;
if (!directResult) throw new Error("Direct breeding lookup failed for imported individuals.");
if (api.eggKind("Anubis")[1] !== "Œuf rocailleux · taille géante") throw new Error("Anubis egg tooltip is incorrect.");
if (!api.eggKind("CaptainPenguin")[1].endsWith("grande taille")) throw new Error("Large egg tooltip is incorrect.");
if (!api.eggKind("SheepBall")[1].endsWith("taille normale")) throw new Error("Regular egg tooltip is incorrect.");

const duplicateSpecies = Object.values(Object.groupBy(normalized, (pal) => pal.speciesId)).filter((group) => group.length > 1).length;
console.log(JSON.stringify({
  pals: normalized.length,
  species: new Set(normalized.map((pal) => pal.speciesId)).size,
  duplicateSpecies,
  zeroPassives: normalized.filter((pal) => pal.passives.length === 0).length,
  fourPassives: normalized.filter((pal) => pal.passives.length === 4).length,
  objectives,
  targetAutocomplete,
  passiveDescriptionSearch: movementSearch.length,
  solveChecks,
  directChild: directResult,
  eggTooltips: {
    anubis: api.eggKind("Anubis")[1],
    penking: api.eggKind("CaptainPenguin")[1],
    lamball: api.eggKind("SheepBall")[1],
  },
}));
