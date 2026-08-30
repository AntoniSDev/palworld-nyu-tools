import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

function loadWindowScript(path) {
  const source = fs.readFileSync(path, "utf8");
  const context = { window: {} };
  vm.runInNewContext(source, context, { filename: path });
  return context.window;
}

const config = loadWindowScript("js/work-optimization-data.js").WORK_OPTIMIZATION;
const passives = loadWindowScript("js/passive-data.js").PALWORLD_PASSIVES;
const pals = loadWindowScript("js/condensation-data.js").CONDENSATION_PALS;
const partnerSource = JSON.parse(fs.readFileSync("data/partner-skills-fr.json", "utf8")).skills;
const indexHtml = fs.readFileSync("index.html", "utf8");
const appSource = fs.readFileSync("js/app.js", "utf8");
const passiveById = new Map(passives.map((passive) => [passive.id, passive]));
const palByCode = new Map(pals.map((pal) => [pal.code, pal]));
const jobIds = Object.keys(config.passiveJobProfiles);
const partnerActivityIds = Object.keys(config.partnerActivities);

assert.equal(jobIds.length, 12, "Le filtre Passives doit contenir 12 métiers.");
assert.equal(partnerActivityIds.length, 14, "Le filtre Partenaire doit contenir 14 activités.");
assert(!jobIds.includes("global") && !jobIds.includes("breeding"), "Base et Élevage sont réservés au mode Partenaire.");
assert(partnerActivityIds.includes("global") && partnerActivityIds.includes("breeding"));

const passiveIds = new Set(Object.values(config.passiveProfiles).flat());
for (const id of passiveIds) assert(passiveById.has(id), `Passif inconnu : ${id}`);
assert.equal(passiveById.get("Nocturnal").rank, 1);
assert.equal(passiveById.get("WorkSuitabilityAddRank_MonsterFarm_1").rank, 3);
assert(config.passiveProfiles.standard.includes("PAL_conceited"), "Vaniteux doit appartenir au socle Travail.");
assert(!config.passiveProfiles.transport.some((id) => id.startsWith("CraftSpeed")), "Transport ne doit pas inclure Work Speed.");
assert(config.passiveProfiles.farming.includes("WorkSuitabilityAddRank_MonsterFarm_2"));
assert(config.passiveProfiles.farming.includes("WorkSuitabilityAddRank_MonsterFarm_1"));
assert.match(indexHtml, /breeding-view[\s\S]*single-view[\s\S]*work-view[\s\S]*combat-view[\s\S]*condensation-view[\s\S]*memo-view/);
assert(!indexHtml.includes("skills-menu"), "L’ancien menu Compétences doit être supprimé.");
assert.match(appSource, /let currentView = "breeding"/);
assert.match(appSource, /switchView\("breeding"\);\s*window\.scrollTo\(0, 0\)/);

const partnerCodes = Object.values(config.partnerActivities).flat().map((entry) => entry.pal);
assert(!partnerCodes.includes("NegativeKoala"), "Depresso doit rester exclu.");
for (const entries of Object.values(config.partnerActivities)) {
  for (const entry of entries) {
    const skill = partnerSource[entry.pal];
    assert(skill, `Compétence partenaire inconnue : ${entry.pal}`);
    assert(palByCode.has(entry.pal), `Pal ou portrait canonique inconnu : ${entry.pal}`);
    assert(skill.effects.some((effect) => effect.label === entry.effect), `Effet absent pour ${entry.pal} : ${entry.effect}`);
  }
}

console.log("Work optimization data: OK");
