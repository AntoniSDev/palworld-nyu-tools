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
const pagesConfig = fs.readFileSync("_config.yml", "utf8");
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
assert(!pagesConfig.includes("data/partner-skills-fr.json"), "Le JSON partenaire doit être publié par GitHub Pages.");
const primaryRoutes = ["#cumoir", "#capacites", "#optimisation", "#guide", "#condensation", "#memo"];
const primaryLinks = [...indexHtml.matchAll(/<a id="(?:breeding|single|work|combat|condensation|memo)-view"[^>]+href="([^"]+)"/g)];
assert.equal(primaryLinks.length, 6, "La navigation principale doit contenir six liens.");
assert.deepEqual(primaryLinks.map((match) => match[1]), primaryRoutes);
assert.match(indexHtml, /<a class="brand" href="#cumoir"/);
assert(!indexHtml.includes("skills-menu"), "L’ancien menu Compétences doit être supprimé.");
assert.match(appSource, /const viewFromHash = \(hash\) => viewRoutes\.get\(hash\) \|\| "breeding"/);
for (const route of primaryRoutes) assert(appSource.includes(`["${route}",`), `Route absente : ${route}`);
assert(appSource.includes('["#combat", "guide"]'), "#combat doit rester un alias du Guide pratique.");
assert(!appSource.includes("brand.addEventListener"), "Le logo doit conserver son comportement natif de lien.");
assert(!appSource.includes('title="${escapeHtml(activity.name)}"'), "Les icônes ne doivent plus dépendre du title natif.");
assert.match(appSource, /data-job-tooltip=/);
assert.match(appSource, /aria-label=/);
assert.match(indexHtml, />Optimisation de la base<\/a>/, "Le libellé de navigation doit être explicite.");
assert.match(indexHtml, />Guide pratique<\/a>/, "La navigation doit présenter le Guide pratique.");

const partnerCodes = Object.values(config.partnerActivities).flat().map((entry) => entry.pal);
assert(!partnerCodes.includes("NegativeKoala"), "Depresso doit rester exclu.");
for (const entries of Object.values(config.partnerActivities)) {
  for (const entry of entries) {
    const skill = partnerSource[entry.pal];
    assert(skill, `Compétence partenaire inconnue : ${entry.pal}`);
    assert(palByCode.has(entry.pal), `Pal ou portrait canonique inconnu : ${entry.pal}`);
    assert(Array.isArray(entry.effects) && entry.effects.length > 0, `Effets structurés absents pour ${entry.pal}.`);
    for (const effect of entry.effects) {
      const sourceLabel = effect.sourceLabel || effect.label;
      assert(skill.effects.some((sourceEffect) => sourceEffect.label === sourceLabel), `Effet absent pour ${entry.pal} : ${sourceLabel}`);
      assert(!/\d/.test(effect.description), `La description de ${entry.pal} ne doit pas dupliquer les valeurs de progression.`);
    }
    if (entry.note) assert(!/\d/.test(entry.note), `La note UX de ${entry.pal} ne doit pas dupliquer de valeur numérique.`);
  }
}

const sekhmet = config.partnerActivities.handiwork.find((entry) => entry.pal === "Sekhmet");
assert.equal(sekhmet.effects.length, 2, "Sekhmet doit exposer ses deux effets de travail.");
assert.deepEqual(
  partnerSource.Sekhmet.effects.map((effect) => Array.from(effect.values)),
  [["+20%", "+24%", "+28%", "+32%", "+40%"], ["+30%", "+36%", "+42%", "+48%", "+60%"]],
  "Les deux progressions de Sekhmet doivent rester conformes aux données validées.",
);
const wateringPartners = config.partnerActivities.watering;
for (const [code, palName] of [["JellyfishFairy", "Jelliette"], ["JellyfishGhost", "Jellroy"]]) {
  const reference = wateringPartners.find((entry) => entry.pal === code);
  const effect = reference.effects[0];
  assert.equal(effect.label, `Vitesse d’arrosage de ${palName}`);
  assert.equal(effect.sourceLabel, "Vitesse de travail");
  assert(effect.description.includes(palName), `${palName} doit être présenté comme bénéficiaire personnel.`);
  assert(effect.description.includes("Jelliette et Jellroy"), `La condition du duo doit être indiquée pour ${palName}.`);
  assert(reference.note.includes("Jelliette et Jellroy"));
  assert.equal(reference.nonCumulative, true);
  assert.deepEqual(
    Array.from(partnerSource[code].effects.find((entry) => entry.label === effect.sourceLabel).values),
    ["+50%", "+60%", "+70%", "+90%", "+120%"],
  );
}
const prunelia = config.partnerActivities.gathering.find((entry) => entry.pal === "BlueberryFairy");
assert.equal(prunelia.nonCumulative, undefined, "Prunelia doit rester cumulable.");
assert.deepEqual(
  Array.from(partnerSource.BlueberryFairy.effects.find((entry) => entry.label === prunelia.effects[0].label).values),
  ["+18%", "+22%", "+26%", "+30%", "+35%"],
);
const braloha = config.partnerActivities.breeding.find((entry) => entry.pal === "Plesiosaur");
assert.equal(braloha.effects[0].label, "Vitesse de production des œufs");
assert.equal(braloha.effects[0].sourceLabel, "Vitesse de reproduction à la base");
assert.deepEqual(
  Array.from(partnerSource.Plesiosaur.effects.find((entry) => entry.label === braloha.effects[0].sourceLabel).values),
  ["+20%", "+26%", "+32%", "+38%", "+50%"],
);
const wumpo = config.partnerActivities.transport.find((entry) => entry.pal === "Yeti");
assert.deepEqual(
  Array.from(partnerSource.Yeti.effects.find((effect) => effect.label === wumpo.effects[0].label).values),
  ["+1", "+1", "+1", "+1", "+1"],
);
assert.match(appSource, /\(reference\.effects \|\| \[\]\)\.map/, "Le rendu partenaire doit accepter plusieurs effets.");
assert.match(appSource, /if \(magnitude\) formatted = formatted\.replace/, "Les réductions doivent afficher une grandeur positive.");
assert.match(appSource, /notes\.length \? `<div class="partner-skill-card__notes">/, "Un bloc notes ne doit être rendu que lorsqu’une note existe.");

console.log("Work optimization data: OK");
