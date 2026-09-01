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
assert.match(indexHtml, /href="#guide">Guide pratique<\/a>/);
assert.deepEqual([...indexHtml.matchAll(/site-nav__guide-menu[\s\S]*?<\/nav>/g)].length, 1);
const styles = fs.readFileSync("css/styles.css", "utf8");
assert.match(styles, /\.site-nav__guide:hover \.site-nav__guide-menu/);
assert.match(styles, /\.site-nav__guide:focus-within \.site-nav__guide-menu/);
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
assert.deepEqual(Array.from(guide.farming.tabs, (tab) => tab.name), ["Abattage", "Extraction", "Loot", "Ressources spéciales"]);
for (const tab of guide.farming.tabs) assert(tab.icon && fs.existsSync(tab.icon), `Icône Farming absente : ${tab.name}`);
assert(!fs.readFileSync("js/guide-data.js", "utf8").includes("description:"), "guide-data.js ne doit pas réécrire les pouvoirs.");

console.log("Guide pratique: OK");
