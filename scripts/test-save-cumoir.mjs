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
for (const file of ["js/condensation-data.js", "js/egg-size-data.js", "js/breeding-data.js", "js/passive-data.js", "js/carrier-breeding-solver.js", "js/save-cumoir.js"]) {
  vm.runInContext(fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8"), context, { filename: file });
}

const normalized = parsed.pals.map((pal) => ({
  id: pal.instanceId,
  speciesId: String(pal.species || pal.characterId || "").replace(/^BOSS_/i, ""),
  sex: pal.gender === "Male" || pal.gender === "Female" ? pal.gender : "Unknown",
  level: Number(pal.level) || 1,
  passives: Array.isArray(pal.passives) ? pal.passives.slice(0, 4) : [],
}));
const breedingSpeciesIds = new Set(context.BREEDING_DATA.pals.map(([id]) => id.toLowerCase()));
const unknownSpecies = [...new Set(normalized.filter((pal) => !breedingSpeciesIds.has(pal.speciesId.toLowerCase())).map((pal) => pal.speciesId))];
if (unknownSpecies.length) throw new Error(`Imported species missing from breeding data: ${unknownSpecies.join(", ")}`);
const api = context.SaveCumoir.__test;
const styles = fs.readFileSync(new URL("../css/styles.css", import.meta.url), "utf8");
if (!/\.save-tree-node__new\s*\{[^}]*position:\s*absolute;[^}]*top:\s*7px;[^}]*left:\s*50%;[^}]*transform:\s*translateX\(-50%\)/s.test(styles)) {
  throw new Error("The Nouveau badge is not positioned at the centered top of the Pal card.");
}
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
if (activeTemplate.includes("Transmission des passifs") || activeTemplate.includes("Estimations communautaires")) {
  throw new Error("The retired probability panel is still rendered.");
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
const ownedSpeciesId = normalized[0]?.speciesId;
const absentSpeciesId = context.BREEDING_DATA.pals.find(([id]) => !normalized.some((pal) => pal.speciesId.toLowerCase() === id.toLowerCase()))?.[0];
if (!ownedSpeciesId || !absentSpeciesId) throw new Error("Owned/unowned species fixtures are unavailable.");
if (!api.renderGraph({ status: "found", root: { speciesId: ownedSpeciesId, mask: 0, sex: "Male", owned: false } }).includes('save-tree-node__new">Nouveau')) {
  throw new Error("A planned individual of an owned species is missing the Nouveau badge.");
}
if (!api.renderGraph({ root: { speciesId: absentSpeciesId, mask: 0, owned: false } }).includes('save-tree-node__new">Nouveau')) {
  throw new Error("An unowned species is missing the Nouveau badge.");
}
if (api.renderGraph({ status: "already-owned", root: { speciesId: ownedSpeciesId, mask: 0, sex: "Female", owned: true, individualId: "fixture" } }).includes('save-tree-node__new">Nouveau')) {
  throw new Error("An owned individual is incorrectly marked Nouveau.");
}
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
const benchmarkTarget = process.argv.find((argument) => argument.startsWith("--benchmark="))?.split("=")[1];
if (benchmarkTarget) {
  const benchmarkPassives = ["CoolTimeReduction_Up_2", "Legend", "Rare", "MoveSpeed_up_3"];
  if (!benchmarkPassives.every((id) => available.includes(id))) throw new Error("Private benchmark passives are unavailable.");
  api.setTarget(benchmarkTarget, benchmarkPassives);
  const benchmark = api.solveCarrier();
  console.log(JSON.stringify({ benchmark: benchmarkTarget, status: benchmark.status, breedingCount: benchmark.breedingCount,
    depth: benchmark.depth, durationMs: benchmark.durationMs, ...benchmark.stats }));
  process.exit(benchmark.root ? 0 : 1);
}
const solveChecks = [];
for (let count = 0; count <= 4; count += 1) {
  api.setTarget(target, objectives.slice(0, count));
  const result = api.solveCarrier();
  if (!result.status) throw new Error(`Carrier solver returned no explicit status (${count} passives).`);
  solveChecks.push({ count, solved: Boolean(result.root), status: result.status, breedingCount: result.breedingCount, durationMs: result.durationMs });
}
if (objectives.length) {
  api.setTarget(target, objectives.slice(0, Math.min(3, objectives.length)));
  const carrier = api.solveCarrier();
  if (!carrier.status) throw new Error("Carrier solver returned no explicit status.");
  if (carrier.root) {
    const graph = api.renderGraph(carrier);
    if (graph.includes("data-cake-tooltip") || graph.includes("assets/items/") || graph.includes("recommendedCake")) throw new Error("Cake recommendations remain in the tree renderer.");
    if (!graph.includes('save-tree-node__new">Nouveau')) throw new Error("Planned intermediates are missing the Nouveau badge.");
    if (graph.includes("expectedBatches") || graph.includes("probability")) throw new Error("Retired probability data leaked into the UI.");
  }
  solveChecks.push({ count: "carrier", solved: Boolean(carrier.root), status: carrier.status, breedingCount: carrier.breedingCount, durationMs: carrier.durationMs, expanded: carrier.stats?.expanded });
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
  const anubis = api.solveCarrier();
  if (!anubis.root) throw new Error(`Anubis four-passive benchmark failed: ${JSON.stringify(anubis)}`);
  solveChecks.push({ count: "anubis-4", solved: true, status: anubis.status, breedingCount: anubis.breedingCount,
    durationMs: anubis.durationMs, expanded: anubis.stats.expanded, generated: anubis.stats.generated,
    combinations: anubis.stats.combinations, depth: plannedDepth(anubis.root), branchMerges: branchMerges(anubis.root),
    topology: topology(anubis.root) });

  api.setTarget("SheepBall", anubisObjective);
  const lamball = api.solveCarrier();
  if (!lamball.root) throw new Error(`Lamball four-passive benchmark failed: ${JSON.stringify(lamball)}`);
  solveChecks.push({ count: "lamball-4", solved: true, status: lamball.status, breedingCount: lamball.breedingCount, durationMs: lamball.durationMs,
    expanded: lamball.stats.expanded, generated: lamball.stats.generated, combinations: lamball.stats.combinations,
    depth: plannedDepth(lamball.root) });
}
api.setTarget("Baphomet_Dark", []);
const incineramNoct = api.solveCarrier();
if (!incineramNoct.root) throw new Error(`Structural zero-passive route failed: ${JSON.stringify(incineramNoct)}`);
const zeroPassiveGraph = api.renderGraph(incineramNoct);
if (zeroPassiveGraph.includes("save-tree-node__passives")) throw new Error("Zero-passive graph renders empty passive areas.");
solveChecks.push({
  count: "incineram-noct-0", solved: true, status: incineramNoct.status, breedingCount: incineramNoct.breedingCount,
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
  unknownSpecies: unknownSpecies.length,
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
