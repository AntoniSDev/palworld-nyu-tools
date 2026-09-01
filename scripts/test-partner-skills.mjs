import assert from "node:assert/strict";
import fs from "node:fs";

const source = JSON.parse(fs.readFileSync("data/partner-skills-fr.json", "utf8"));
const skills = source.skills;

function values(code, label) {
  const skill = skills[code];
  assert(skill, `Compétence partenaire absente : ${code}`);
  const effect = skill.effects.find((entry) => entry.label === label);
  assert(effect, `Effet absent pour ${code} : ${label}`);
  assert.equal(effect.values.length, 5, `Progression incomplète pour ${code} : ${label}`);
  return effect.values;
}

assert.deepEqual(values("StuffedShark_Fire", "Dégâts de Feu aux points faibles"), ["+25%", "+27%", "+30%", "+34%", "+40%"]);
assert.deepEqual(values("TentacleTurtle_Ground", "Dégâts de Terre aux points faibles"), ["+25%", "+27%", "+30%", "+34%", "+40%"]);
assert.deepEqual(values("PinkRabbit_Grass", "Dégâts de Herbe aux points faibles"), ["+25%", "+27%", "+30%", "+34%", "+40%"]);
assert(values("PinkRabbit_Grass", "Vitesse de travail"), "Ribbuny Botan doit conserver son effet Base.");
assert.deepEqual(values("CaptainPenguin", "Objets obtenus sur les Pals de Feu"), ["+40%", "+50%", "+60%", "+70%", "+80%"]);
assert.deepEqual(values("CatMage", "Objets obtenus sur les Pals de Non élém."), ["+40%", "+50%", "+60%", "+70%", "+80%"]);
assert(values("CatMage", "Récupération des Sphères"), "Katress doit conserver l’économie de sphères.");
assert.deepEqual(values("IceNarwhal", "Progression initiale de pêche"), ["+5%", "+7%", "+9%", "+11%", "+14%"]);
assert.deepEqual(values("IceNarwhal", "Progression de la jauge de pêche"), ["+5%", "+7%", "+9%", "+11%", "+14%"]);
assert.deepEqual(values("IceNarwhal_Fire", "Progression initiale de pêche"), ["+7%", "+9%", "+11%", "+13%", "+17%"]);
assert.deepEqual(values("IceNarwhal_Fire", "Progression de la jauge de pêche"), ["+7%", "+9%", "+11%", "+13%", "+17%"]);
assert(values("JellyfishFairy", "Objets supplémentaires obtenus en pêche"));
assert(values("JellyfishFairy", "Butin supplémentaire sur les ennemis pêchés"));
assert(values("JellyfishFairy", "Vitesse de travail"), "Jelliette doit conserver son effet Base.");
assert.deepEqual(values("GuardianDog", "Chance de rencontrer un Pal avec la même compétence passive"), ["+15%", "+18%", "+21%", "+24%", "+30%"]);
assert.deepEqual(skills.Sekhmet.effects.map((effect) => effect.values), [["+20%", "+24%", "+28%", "+32%", "+40%"], ["+30%", "+36%", "+42%", "+48%", "+60%"]]);

const forbiddenEnglishStatuses = /\b(?:Burn|Burning|Wet|Wetness|Ivy Cling|Electrical|Electrified|Freeze|Frozen|Muddy|Darkness|Poison|Poisoned)\b/;
for (const [code, skill] of Object.entries(skills)) {
  assert(skill.name, `Nom absent pour ${code}`);
  assert(skill.description, `Description absente pour ${code}`);
  assert.match(skill.icon, /^assets\/partner-skills\/[A-Za-z0-9_]+\.webp$/, `Icône non locale pour ${code}`);
  assert(fs.existsSync(skill.icon), `Fichier d’icône absent pour ${code} : ${skill.icon}`);
  const iconBytes = fs.readFileSync(skill.icon);
  assert.equal(iconBytes.subarray(0, 4).toString("ascii"), "RIFF", `Icône WebP invalide pour ${code}`);
  assert.equal(iconBytes.subarray(8, 12).toString("ascii"), "WEBP", `Icône WebP invalide pour ${code}`);
  for (const effect of skill.effects) {
    assert(!forbiddenEnglishStatuses.test(effect.label), `Altération anglaise dans ${code} : ${effect.label}`);
    assert.equal(effect.values.length, 5, `Progression incomplète dans ${code} : ${effect.label}`);
  }
}

assert.match(skills.BlackPuppy.description, /Lorsqu'activée.*détecter le Chromite.*Lorsqu'il combat à vos côtés.*Chromite/s);
assert.match(skills.GuardianDog.description, /combat à vos côtés.*même compétence passive.*exception/s);
assert.match(skills.GhostBlackCat.description, /dans l'équipe.*capture.*derrière/s);
assert.match(skills.FluffyBird.description, /dans l'équipe.*Gel/s);
assert.match(skills.DandelionGirl.description, /Entrave.*dans l'équipe/s);
assert.match(skills.CatBat.description, /Lorsqu'activée.*donjons.*coffres.*débris/s);
assert.match(skills.SifuDog.description, /Lorsqu'il est activé.*téléporter.*Inutilisable dans les donjons/s);
assert.match(skills.MimicDog.description, /combat à vos côtés.*ouvrir les coffres sans utiliser de clé/s);
assert.match(skills.NightFox.description, /statues de Pal.*lorsqu'il est appelé/s);

assert.match(source.meta.localizationSource, /retrieved 2026-09-01$/);
assert.match(source.meta.scaleSource, /retrieved 2026-09-01$/);
console.log("Partner skills: OK");
