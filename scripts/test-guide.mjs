import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

function loadWindowScript(path) {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(path, "utf8"), context, { filename: path });
  return context.window;
}

const guide = loadWindowScript("js/guide-data.js").GUIDE_DATA;
const passives = loadWindowScript("js/passive-data.js").PALWORLD_PASSIVES;
const pals = loadWindowScript("js/condensation-data.js").CONDENSATION_PALS;
const partnerSkills = JSON.parse(fs.readFileSync("data/partner-skills-fr.json", "utf8")).skills;
const indexHtml = fs.readFileSync("index.html", "utf8");
const appSource = fs.readFileSync("js/app.js", "utf8");
const passiveIds = new Set(passives.map((passive) => passive.id));
const palCodes = new Set(pals.map((pal) => pal.code));

assert.deepEqual(Array.from(guide.categories, (category) => category.name), ["Combat", "Farming", "Pêche", "Capture", "Exploration"]);
assert.deepEqual(Array.from(guide.categories, (category) => category.eyebrow), ["Guide de combat", "Guide de farming", "Guide de pêche", "Guide de capture", "Guide d'exploration"]);
for (const category of guide.categories) assert(category.copy, `Texte d’en-tête absent : ${category.name}`);
assert.equal(guide.elements.length, 9);
const relations = Object.fromEntries(Array.from(guide.elements, (element) => [element.id, { strong: Array.from(element.strong), weak: Array.from(element.weak) }]));
assert.deepEqual(relations, {
  neutral: { strong: [], weak: ["dark"] },
  fire: { strong: ["grass", "ice"], weak: ["water"] },
  water: { strong: ["fire"], weak: ["electric"] },
  grass: { strong: ["ground"], weak: ["fire"] },
  electric: { strong: ["water"], weak: ["ground"] },
  ice: { strong: ["dragon"], weak: ["fire"] },
  ground: { strong: ["electric"], weak: ["grass"] },
  dark: { strong: ["neutral"], weak: ["dragon"] },
  dragon: { strong: ["dark"], weak: ["ice"] },
});

for (const ids of Object.values(guide.combat.passives)) {
  for (const id of ids) assert(passiveIds.has(id), `Passif inconnu dans le Guide : ${id}`);
}
for (const id of guide.farming.logging.passives.concat(guide.farming.mining.passives)) assert(passiveIds.has(id), `Passif inconnu : ${id}`);

const references = [];
function collect(value) {
  if (!value || typeof value !== "object") return;
  if (typeof value.pal === "string") references.push(value);
  for (const nested of Object.values(value)) collect(nested);
}
collect(guide);
assert(references.length > 20, "Le Guide doit contenir une sélection pratique de Pals.");
for (const reference of references) {
  assert.notEqual(reference.pal, "NegativeKoala", "Depresso ne doit pas être réintroduit.");
  assert(palCodes.has(reference.pal), `Pal ou portrait canonique inconnu : ${reference.pal}`);
  const skill = partnerSkills[reference.pal];
  assert(skill, `Compétence partenaire inconnue : ${reference.pal}`);
  for (const effect of reference.effects || []) {
    const label = effect.sourceLabel || effect.label;
    assert(skill.effects.some((entry) => entry.label === label), `Effet partenaire inconnu pour ${reference.pal} : ${label}`);
    assert.equal("description" in effect, false, `Description parallèle interdite pour ${reference.pal}.`);
  }
  assert.equal("description" in reference, false, `Résumé partenaire interdit pour ${reference.pal}.`);
}

assert(!guide.combat.partners.grass[0].effects.some((effect) => effect.label === "Vitesse de travail"), "Combat ne doit pas afficher l’effet Base de Ribbuny Botan.");
for (const section of guide.fishing) {
  for (const reference of section.partners) assert(!reference.effects.some((effect) => effect.label === "Vitesse de travail"), "Pêche ne doit pas afficher d’effet Base.");
}
assert.match(indexHtml, /<a id="combat-view" tabindex="0" aria-haspopup="menu">Guide pratique<\/a>/);
assert.doesNotMatch(indexHtml, /id="combat-view"[^>]*href=/);
assert.deepEqual([...indexHtml.matchAll(/site-nav__guide-menu[\s\S]*?<\/nav>/g)].length, 1);
const styles = fs.readFileSync("css/styles.css", "utf8");
assert.match(styles, /\.site-nav__guide:hover \.site-nav__guide-menu/);
assert.match(styles, /\.site-nav__guide:focus-within \.site-nav__guide-menu/);
assert.match(styles, /body \.site-nav \.site-nav__guide-menu a\s*\{[^}]*min-height:\s*36px;[^}]*font-size:\s*\.8rem;/s);
assert.match(appSource, /primaryNavigation\?\.addEventListener\("dragstart",[\s\S]*?event\.preventDefault\(\)/);
for (const [hash, label] of [["#guide-combat", "Combat"], ["#guide-farming", "Farming"], ["#guide-fishing", "Pêche"], ["#guide-capture", "Capture"], ["#guide-exploration", "Exploration"]]) {
  assert(indexHtml.includes(`href="${hash}">${label}</a>`), `Lien direct absent : ${label}`);
  assert(appSource.includes(`["${hash}", "guide"]`), `Route directe absente : ${hash}`);
}
assert.match(indexHtml, /js\/guide-data\.js\?v=/);
assert.match(appSource, /\["#guide", "guide"\]/);
assert.match(appSource, /\["#combat", "guide"\]/);
assert.match(appSource, /currentView === "guide"/);
assert.match(appSource, /name: "Éléments"/);
assert.match(appSource, /name: "Aides au combat"/);
assert.doesNotMatch(appSource, /data-guide-combat-element/);
assert.match(appSource, /<article class="guide-element-card">/);
assert.match(appSource, /selectedGuideCombatMode === "elements"/);
const referenceCodes = (items) => Array.from(items, (item) => item.pal);
const assertIncludesAll = (actual, expected, label) => {
  for (const value of expected) assert(actual.includes(value), `${label} : ${value} absent.`);
};

assert.deepEqual(Array.from(guide.farming.tabs, (tab) => tab.name), ["Abattage", "Extraction", "Loot"]);
assert.equal("special" in guide.farming, false, "Ressources spéciales ne doit plus exister.");
for (const tab of guide.farming.tabs) assert(tab.icon && fs.existsSync(tab.icon), `Icône Farming absente : ${tab.name}`);
assertIncludesAll(referenceCodes(guide.farming.logging.partners), ["GrassMammoth", "GrassMammoth_Ice"], "Abattage");
assertIncludesAll(referenceCodes(guide.farming.mining.partners), [
  "DrillGame", "BlackMetalDragon", "TentacleTurtle", "TentacleTurtle_Ground", "VolcanicMonster",
  "VolcanicMonster_Ice", "GrassMammoth", "GrassMammoth_Ice", "BlackPuppy",
], "Extraction");
assert(referenceCodes(guide.farming.loot.specific).includes("GhostRabbit"), "Nitemary doit apparaître dans Loot spécifique.");

assert.deepEqual(Object.keys(guide.combat.passives), ["general", "neutral", "fire", "water", "grass", "electric", "ice", "ground", "dark", "dragon"]);
assertIncludesAll(Array.from(guide.combat.passives.general), [
  "PAL_ALLAttack_up3", "Legend", "PAL_ALLAttack_up2", "Deffence_up3", "MutationPal_Immortal", "Vampire", "CoolTimeReduction_Up_1",
  "TrainerATK_UP_1", "TrainerDEF_UP_1", "ReloadSpeedUp_Passive", "AutoHPRegeneRate_Passive",
], "Combat général");
for (const [id, filters] of Object.entries({
  EternalFlame: ["fire", "electric"], Invader: ["dark", "dragon"], Salvation: ["neutral", "grass"],
  Witch: ["dark", "ice"], Nushi: ["water", "ice"],
})) {
  for (const filter of filters) assert(guide.combat.passives[filter].includes(id), `${id} absent du filtre ${filter}.`);
}

assertIncludesAll(Array.from(guide.exploration.movement.passives), [
  "MoveSpeed_up_1", "MoveSpeed_up_2", "MoveSpeed_up_3", "Legend", "WorldTree_MoveSpeed",
  "SwimSpeed_up_1", "SwimSpeed_up_2", "SwimSpeed_up_3", "Stamina_Up_2", "Stamina_Up_1", "Stamina_Up_3",
  "RideJumpCount_Increase1", "RideJumpCount_Increase2",
], "Passifs de déplacement");
assertIncludesAll(referenceCodes(guide.exploration.movement.partners), ["FengyunDeeper", "Garm", "BlueThunderHorse", "LongCat"], "Pals de déplacement");
assertIncludesAll(referenceCodes(guide.exploration.detection), ["NightFox", "CatBat", "DarkCrow"], "Détection");
assert(!referenceCodes(guide.exploration.detection).includes("BlackPuppy"), "Smokie ne doit plus apparaître dans Détection.");
const utilityCodes = guide.exploration.utilities.flatMap((section) => referenceCodes(section.partners));
assertIncludesAll(utilityCodes, ["FlowerRabbit", "IceCrocodile", "MysteryMask", "LavaGirl", "SakuraSaurus", "SakuraSaurus_Water"], "Utilitaires");

assert(!referenceCodes(guide.farming.mining.partners).some((code) => ["DarkAlien", "WhiteAlienDragon"].includes(code)), "Xenovader et Xenogard ne doivent pas apparaître dans Extraction.");
assert(!references.some((reference) => reference.pal === "GhostAnglerfish"), "Ghangler ne doit pas apparaître dans le Guide.");
assert(!Object.values(guide.combat.passives).flat().some((id) => ["SelfDeathAddItemDrop_up_2", "SelfDeathAddItemDrop_up_3"].includes(id)), "Généreux et Grand Prince ne doivent pas être recommandés.");
assert.match(appSource, /guidePartnerSectionTemplate\("Loot spécifique", current\.specific\)/);
assert.match(appSource, /guidePassiveSectionTemplate\(selection\.passives\)/);
assert(!fs.readFileSync("js/guide-data.js", "utf8").includes("description:"), "guide-data.js ne doit pas réécrire les pouvoirs.");

console.log("Guide pratique: OK");
