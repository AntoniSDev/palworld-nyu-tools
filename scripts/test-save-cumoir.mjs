/**
 * Integration check for the private-save Cumoir path.
 * Usage: node scripts/test-save-cumoir.mjs C:\path\to\Level.sav
 * The save is read only and never copied into the repository.
 */
import fs from "node:fs";
import vm from "node:vm";
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
  crypto: { randomUUID: () => "test" },
  indexedDB: { open: () => { throw new Error("disabled in test"); } },
  localStorage: { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
  document: { querySelector: () => null, addEventListener: () => {} },
  window: {},
});
context.window = context;
for (const file of ["js/condensation-data.js", "js/egg-size-data.js", "js/breeding-data.js", "js/passive-data.js", "js/save-cumoir.js"]) {
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
api.loadRoster(normalized);

const target = context.BREEDING_DATA.pals.find(([id]) => id === "Anubis")?.[0];
if (!target) throw new Error("Anubis missing from breeding data.");
const available = [...new Set(normalized.flatMap((pal) => pal.passives))];
const objectives = available.filter((id) => context.PALWORLD_PASSIVES.some((passive) => passive.id === id)).slice(0, 4);
const solveChecks = [];
for (let count = 0; count <= 4; count += 1) {
  api.setTarget(target, objectives.slice(0, count));
  const result = api.solveTarget();
  if (!result.root && !result.error) throw new Error(`Solver returned neither a plan nor an explicit error (${count} passives).`);
  solveChecks.push({ count, solved: Boolean(result.root), result: result.summary || result.error });
}
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
  solveChecks,
  directChild: directResult,
  eggTooltips: {
    anubis: api.eggKind("Anubis")[1],
    penking: api.eggKind("CaptainPenguin")[1],
    lamball: api.eggKind("SheepBall")[1],
  },
}));
