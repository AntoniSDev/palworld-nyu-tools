const speedA = [50, 80, 140, 240, 400, 680, 1100, 1900, 3200, 5400];
const speedB = [50, 70, 100, 140, 190, 260, 370, 510, 720, 1000];
const iconRoot = "assets/work-suitabilities/";

const jobs = [
  {
    id: "kindling",
    name: "Allumage de feu",
    shortName: "Allumage de feu",
    icon: `${iconRoot}00.webp`,
    color: "#ff8c4b",
    unit: "Capacité de travail",
    note: "Cuisine, fonte et structures nécessitant du feu.",
    values: speedA,
  },
  {
    id: "watering",
    name: "Arrosage",
    shortName: "Arrosage",
    icon: `${iconRoot}01.webp`,
    color: "#63cfff",
    unit: "Capacité de travail",
    note: "Arrosage des plantations, moulins, broyeurs et concasseurs.",
    values: speedB,
  },
  {
    id: "planting",
    name: "Semence",
    shortName: "Semence",
    icon: `${iconRoot}02.webp`,
    color: "#83d769",
    unit: "Capacité de travail",
    note: "Plantation des graines dans les différentes cultures.",
    values: speedB,
  },
  {
    id: "electricity",
    name: "Génération d’énergie",
    shortName: "Génération d’énergie",
    icon: `${iconRoot}03.webp`,
    color: "#ffe15b",
    unit: "Capacité de travail",
    note: "Recharge des générateurs de la base.",
    values: [250, 325, 400, 500, 750, 1000, 1500, 2000, 3000, 4000],
  },
  {
    id: "handiwork",
    name: "Artisanat",
    shortName: "Artisanat",
    icon: `${iconRoot}04.webp`,
    color: "#dda982",
    unit: "Capacité de travail",
    note: "Fabrication, construction et travail sur les chaînes de production.",
    values: speedA,
  },
  {
    id: "gathering",
    name: "Collecte",
    shortName: "Collecte",
    icon: `${iconRoot}05.webp`,
    color: "#d9e87a",
    unit: "Capacité de travail",
    extraLabel: "Récolte",
    extraPrefix: "×",
    extra: [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5],
    note: "Récolte les cultures ; le niveau augmente aussi la quantité obtenue.",
    values: speedB,
  },
  {
    id: "lumbering",
    name: "Abattage",
    shortName: "Abattage",
    icon: `${iconRoot}06.webp`,
    color: "#c39160",
    unit: "Capacité de travail",
    extraLabel: "Dégâts ressources",
    extraPrefix: "×",
    extra: [0.05, 0.1, 0.18, 0.26, 0.38, 0.5, 0.6, 0.7, 0.85, 1],
    note: "Coupe les arbres et travaille sur les sites d’abattage.",
    values: speedB,
  },
  {
    id: "mining",
    name: "Extraction",
    shortName: "Extraction",
    icon: `${iconRoot}07.webp`,
    color: "#aeb8c8",
    unit: "Capacité de travail",
    extraLabel: "Dégâts ressources",
    extraPrefix: "×",
    extra: [0.07, 0.12, 0.23, 0.31, 0.43, 0.55, 0.65, 0.75, 0.9, 1.1],
    note: "Extrait pierre, minerai, charbon, soufre et quartz.",
    values: speedB,
  },
  {
    id: "medicine",
    name: "Pharmacie",
    shortName: "Pharmacie",
    icon: `${iconRoot}08.webp`,
    color: "#bb83ef",
    unit: "Capacité de travail",
    note: "Production de médicaments et travail dans les cliniques.",
    values: speedA,
  },
  {
    id: "cooling",
    name: "Réfrigération",
    shortName: "Réfrigération",
    icon: `${iconRoot}10.webp`,
    color: "#8ce6ff",
    unit: "Capacité de travail",
    note: "Conservation de la nourriture et fonctionnement des structures froides.",
    values: speedA,
  },
  {
    id: "transport",
    name: "Transport",
    shortName: "Transport",
    icon: `${iconRoot}11.webp`,
    color: "#cfaa77",
    unit: "Objets portés",
    note: "Le niveau augmente la quantité portée en un trajet, pas la vitesse de déplacement.",
    values: [2, 5, 10, 20, 40, 70, 120, 200, 320, 500],
  },
  {
    id: "farming",
    name: "Exploitation",
    shortName: "Exploitation",
    icon: `${iconRoot}12.webp`,
    color: "#f1c177",
    unit: "Valeur d’aptitude",
    note: "Travail en ferme. Le résultat exact dépend aussi de l’espèce du Pal.",
    values: [12, 14, 16, 18, 20, 22, 24, 26, 28, 30],
  },
];

const passiveSkills = {
  demonsHand: {
    name: "Main du Démon",
    rarity: "rank-5",
    effects: [
      "Vitesse de travail +90 %",
      "Chute des points MEN accélérée +15 %",
      "Permet de récolter les arbres et rochers de l’Arbre-Monde sans les faire disparaître.",
    ],
  },
  remarkableCraftsmanship: {
    name: "Maîtrise Exceptionnelle",
    rarity: "rank-4",
    effects: ["Vitesse de travail +75 %"],
  },
  artisan: {
    name: "Appliqué",
    rarity: "rank-3",
    effects: ["Vitesse de travail +50 %"],
  },
  workSlave: {
    name: "Soumis",
    rarity: "rank-1",
    effects: ["Vitesse de travail +30 %", "Attaque -30 %"],
  },
  lucky: {
    name: "Chanceux",
    rarity: "rank-4",
    effects: ["Attaque +15 %", "Défense +15 %", "Vitesse de travail +20 %"],
  },
  serious: {
    name: "Sérieux",
    rarity: "rank-1",
    effects: ["Vitesse de travail +20 %"],
  },
  nocturnal: {
    name: "Nocturne",
    rarity: "rank-3",
    effects: ["Ne dort pas et continue à travailler la nuit."],
    note: "Inutile pour un Pal qui travaille déjà naturellement la nuit.",
  },
  vampiric: {
    name: "Vampire",
    rarity: "rank-4",
    effects: [
      "Absorbe 5 % des dégâts infligés pour restaurer ses PV.",
      "Ne dort pas et continue à travailler la nuit.",
    ],
    note: "Inutile pour un Pal qui travaille déjà naturellement la nuit.",
  },
  worldTraverser: {
    name: "Traverse-Mondes",
    rarity: "rank-5",
    effects: [
      "Vitesse de déplacement +50 %",
      "Chute du degré de satiété accélérée +15 %",
      "Permet de récolter les arbres et rochers de l’Arbre-Monde sans les faire disparaître.",
    ],
  },
  swift: {
    name: "Sprinteur",
    rarity: "rank-4",
    effects: ["Vitesse de déplacement +30 %"],
  },
  legend: {
    name: "Légende",
    rarity: "rank-4",
    effects: ["Attaque +20 %", "Défense +20 %", "Vitesse de déplacement +20 %"],
  },
  runner: {
    name: "Coursier",
    rarity: "rank-3",
    effects: ["Vitesse de déplacement +20 %"],
  },
  nimble: {
    name: "Vif",
    rarity: "rank-1",
    effects: ["Vitesse de déplacement +10 %"],
  },
  masteryOfFasting: {
    name: "Maîtrise de la Faim",
    rarity: "rank-4",
    effects: ["Le degré de satiété diminue 20 % plus lentement."],
  },
  immortalSage: {
    name: "Sage Immortel",
    rarity: "rank-5",
    effects: [
      "Les points MEN diminuent 50 % plus lentement.",
      "Vitesse de travail -20 %",
      "Permet de récolter les arbres et rochers de l’Arbre-Monde sans les faire disparaître.",
    ],
  },
  divineCradle: {
    name: "Berceau Divin",
    rarity: "rank-5",
    effects: [
      "Le degré de satiété diminue 50 % plus lentement.",
      "PV -20 %",
      "Permet de récolter les arbres et rochers de l’Arbre-Monde sans les faire disparaître.",
    ],
  },
  unwavering: {
    name: "Inébranlable",
    rarity: "rank-4",
    effects: ["Les points MEN diminuent 20 % plus lentement."],
  },
  workaholic: {
    name: "Acharné",
    rarity: "rank-3",
    effects: ["Les points MEN diminuent 15 % plus lentement."],
  },
  positiveThinker: {
    name: "Optimiste",
    rarity: "rank-1",
    effects: ["Les points MEN diminuent 10 % plus lentement."],
  },
  nutritionist: {
    name: "Nutritionniste",
    rarity: "rank-3",
    effects: ["Le degré de satiété diminue 15 % plus lentement."],
  },
  frugal: {
    name: "Frugal",
    rarity: "rank-1",
    effects: ["Le degré de satiété diminue 10 % plus lentement."],
  },
  ranchMaster: {
    name: "Maître Éleveur",
    rarity: "rank-4",
    effects: ["Exploitation : Capacité de travail +2"],
  },
  ranchApprentice: {
    name: "Apprenti Éleveur",
    rarity: "rank-1",
    effects: ["Exploitation : Capacité de travail +1"],
  },
};

const passiveGroups = {
  classic: [
    "demonsHand",
    "immortalSage",
    "divineCradle",
    "remarkableCraftsmanship",
    "lucky",
    "vampiric",
    "unwavering",
    "masteryOfFasting",
    "artisan",
    "nocturnal",
    "workaholic",
    "nutritionist",
    "workSlave",
    "serious",
    "positiveThinker",
    "frugal",
  ],
  transport: [
    "worldTraverser",
    "immortalSage",
    "divineCradle",
    "swift",
    "legend",
    "vampiric",
    "unwavering",
    "masteryOfFasting",
    "workaholic",
    "nutritionist",
    "runner",
    "nocturnal",
    "positiveThinker",
    "frugal",
    "nimble",
  ],
  farming: [
    "demonsHand",
    "ranchMaster",
    "remarkableCraftsmanship",
    "lucky",
    "artisan",
    "workSlave",
    "serious",
    "ranchApprentice",
  ],
};

const passiveJobs = jobs.map((job) => ({
  ...job,
  group: job.id === "transport" ? "transport" : job.id === "farming" ? "farming" : "classic",
}));

const partnerActivities = [
  ...jobs,
  {
    id: "global",
    name: "Global",
    shortName: "Global",
    icon: "assets/ui/palbox.png",
    color: "#8fcf9e",
  },
  {
    id: "breeding",
    name: "Élevage / Œufs",
    shortName: "Élevage / Œufs",
    icon: "assets/ui/mutant-pal-egg.png",
    color: "#f0b987",
  },
];

const basePartnerSkills = [
  {
    activity: "kindling",
    pal: "Katress Ignis",
    portrait: "katress-ignis",
    skill: "Passion Magie Noire",
    effects: ["Augmente de +1 l’Allumage de feu des autres Pals présents dans la base."],
    note: "Effet non cumulable.",
  },
  {
    activity: "watering",
    pal: "Amione",
    portrait: "amione",
    skill: "Jumelage Magique",
    effects: ["Augmente de +1 l’Arrosage des autres Pals présents dans la base."],
    note: "Effet non cumulable.",
  },
  {
    activity: "planting",
    pal: "Petallia",
    portrait: "petallia",
    skill: "Bénédiction Florale",
    effects: ["Augmente de +1 la Semence des autres Pals présents dans la base."],
    note: "Effet non cumulable.",
  },
  {
    activity: "planting",
    pal: "Lullu",
    portrait: "lullu",
    skill: "Turbo Floral",
    effects: ["Augmente de 50 % la vitesse de croissance des cultures lorsqu’elle est présente dans la base."],
  },
  {
    activity: "electricity",
    pal: "Puffolt",
    portrait: "puffolt",
    skill: "Poussée Crépitante",
    effects: ["Augmente de +1 la Génération d’énergie des autres Pals présents dans la base."],
    note: "Effet non cumulable.",
  },
  {
    activity: "handiwork",
    pal: "Ribbuny",
    portrait: "ribbuny",
    skill: "Princesse Lapinou Souriant",
    effects: ["Augmente de +1 l’Artisanat des autres Pals présents dans la base."],
    note: "Effet non cumulable.",
  },
  {
    activity: "handiwork",
    pal: "Sekhmet",
    portrait: "sekhmet",
    skill: "Impératrice des Sables",
    effects: [
      "Augmente de 20 % la Vitesse de travail des Anubis présents dans la base.",
      "Augmente de 30 % l’efficacité de Sekhmet lorsqu’elle travaille sur un établi ou dans une usine.",
    ],
    note: "Le bonus destiné aux Anubis est non cumulable.",
  },
  {
    activity: "handiwork",
    pal: "Ribbuny Botan",
    portrait: "ribbuny-botan",
    skill: "Lapin Dézerbe",
    effects: ["Augmente de 200 % l’efficacité de Ribbuny Botan sur un établi ou dans une usine d’armes."],
    note: "Bonus spécifique aux installations d’armes, pas à l’Artisanat en général.",
  },
  {
    activity: "gathering",
    pal: "Clovee",
    portrait: "clovee",
    skill: "Joyeux Trèfle",
    effects: ["Augmente de +1 la Collecte des autres Pals présents dans la base."],
    note: "Effet non cumulable.",
  },
  {
    activity: "lumbering",
    pal: "Eikthyrdeer Terra",
    portrait: "eikthyrdeer-terra",
    skill: "Gardien des Bois Dorés",
    effects: ["Augmente de +1 l’Abattage des autres Pals présents dans la base."],
    note: "Effet non cumulable.",
  },
  {
    activity: "mining",
    pal: "Tetroise",
    portrait: "tetroise",
    skill: "Tortue Maçonne",
    effects: ["Augmente de +1 l’Extraction des autres Pals présents dans la base."],
    note: "Effet non cumulable.",
  },
  {
    activity: "medicine",
    pal: "Mycora",
    portrait: "mycora",
    skill: "Spores Charmants",
    effects: ["Augmente de +1 la Pharmacie des autres Pals présents dans la base."],
    note: "Effet non cumulable.",
  },
  {
    activity: "cooling",
    pal: "Smokie Cryst",
    portrait: "smokie-cryst",
    skill: "Froide Bête",
    effects: ["Augmente de +1 la Réfrigération des autres Pals présents dans la base."],
    note: "Effet non cumulable.",
  },
  {
    activity: "transport",
    pal: "Wumpo",
    portrait: "wumpo",
    skill: "Gardien des Montagnes Enneigées",
    effects: ["Augmente de +1 le Transport des autres Pals présents dans la base."],
    note: "Effet non cumulable.",
  },
  {
    activity: "farming",
    pal: "Cinnamoth",
    portrait: "cinnamoth",
    skill: "Écailles Mystérieuses",
    effects: ["Augmente de +1 l’Exploitation des autres Pals présents dans la base."],
    note: "Effet non cumulable.",
  },
  {
    activity: "global",
    pal: "Shroomer Noct",
    portrait: "shroomer-noct",
    skill: "Spores Fumantes",
    effects: ["Les points MEN des Pals présents dans la base diminuent 10 % plus lentement."],
  },
  {
    activity: "global",
    pal: "Woolipop",
    portrait: "woolipop",
    skill: "Petit Bonbon",
    effects: ["La satiété des Pals présents dans la base diminue 10 % plus lentement."],
    note: "Effet non cumulable.",
  },
  {
    activity: "global",
    pal: "Woolipop Terra",
    portrait: "woolipop-terra",
    skill: "Bonbon Amer",
    effects: ["La satiété des Pals présents dans la base diminue 15 % plus lentement."],
    note: "Effet non cumulable.",
  },
  {
    activity: "breeding",
    pal: "Braloha",
    portrait: "braloha",
    skill: "Soleil Accablant",
    effects: ["Augmente de 20 % la vitesse de production des œufs des Pals affectés à un Élevage."],
    note: "Effet non cumulable.",
  },
  {
    activity: "breeding",
    pal: "Dynamoff",
    portrait: "dynamoff",
    skill: "Couvaison Électromassante",
    effects: ["Augmente de 20 % la vitesse d’éclosion des œufs lorsqu’il est présent dans la base."],
    note: "Effet non cumulable.",
  },
];

const picker = document.querySelector("#job-picker");
const content = document.querySelector("#content");
const brand = document.querySelector(".brand");
const singleButton = document.querySelector("#single-view");
const passiveButton = document.querySelector("#passive-view");
const condensationButton = document.querySelector("#condensation-view");
const partnerButton = document.querySelector("#partner-view");
const combatPartnerButton = document.querySelector("#combat-partner-view");
const intro = document.querySelector(".intro");
const pageEyebrow = document.querySelector("#page-eyebrow");
const pageTitle = document.querySelector("#page-title");
const pageCopy = document.querySelector("#page-copy");
const formatter = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });

let selectedId = jobs[0].id;
let selectedPassiveJobId = jobs[0].id;
let selectedPartnerActivityId = partnerActivities[0].id;
let currentView = "jobs";

function tableTemplate(job) {
  const rows = job.values
    .map((value, index) => {
      const comparison = job.extra
        ? `${job.extraPrefix || ""}${formatter.format(job.extra[index])}`
        : `×${formatter.format(value / job.values[0])}`;

      return `
        <tr>
          <td><span class="level-badge">${index + 1}</span></td>
          <td class="value-cell">${formatter.format(value)}</td>
          <td class="ratio-cell">${comparison}</td>
        </tr>`;
    })
    .join("");

  return `
    <article class="work-card">
      <header class="work-card__header">
        <div class="work-card__identity">
          <span class="work-card__icon" style="--job-color:${job.color}">
            <img src="${job.icon}" alt="" />
          </span>
          <h2>${job.name}</h2>
        </div>
      </header>
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Niveau</th>
              <th>${job.unit}</th>
              <th>${job.extraLabel || "Équivalent niv. 1"}</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </article>`;
}

function renderPicker() {
  picker.innerHTML = jobs
    .map(
      (job) => `
        <button
          type="button"
          data-job="${job.id}"
          class="${selectedId === job.id && currentView === "jobs" ? "selected" : ""}"
          aria-pressed="${selectedId === job.id && currentView === "jobs"}"
          style="--job-color:${job.color}"
        >
          <img src="${job.icon}" alt="" />
          <span>${job.shortName}</span>
        </button>`,
    )
    .join("");
}

function passiveSkillTemplate(skillId) {
  const skill = passiveSkills[skillId];

  return `
    <article class="passive-skill passive-skill--${skill.rarity}">
      <header class="passive-skill__header">
        <span class="passive-skill__rarity" aria-hidden="true"></span>
        <h3>${skill.name}</h3>
        <span class="passive-skill__rank-icon" aria-hidden="true"></span>
      </header>
      <div class="passive-skill__effects">
        ${skill.effects.map((effect) => `<p>${effect}</p>`).join("")}
      </div>
      ${skill.note ? `<p class="passive-skill__note">${skill.note}</p>` : ""}
    </article>`;
}

function passiveListTemplate(skillIds) {
  return ["rank-5", "rank-4", "rank-3", "rank-1"]
    .map((rarity) => {
      const tierSkills = skillIds.filter((skillId) => passiveSkills[skillId].rarity === rarity);
      if (!tierSkills.length) return "";

      return `
        <div class="passive-tier-group passive-tier-group--${rarity}">
          ${tierSkills.map(passiveSkillTemplate).join("")}
        </div>`;
    })
    .join("");
}

function passivePageTemplate() {
  const selectedJob = passiveJobs.find((job) => job.id === selectedPassiveJobId) || passiveJobs[0];
  const skillIds = passiveGroups[selectedJob.group];
  const context =
    selectedJob.group === "transport"
      ? "La Vitesse de travail n’améliore pas le Transport : privilégiez la vitesse de déplacement et l’autonomie."
      : selectedJob.group === "farming"
        ? "L’Exploitation bénéficie de ses passifs dédiés et des bonus de Vitesse de travail."
        : "Ces passifs peuvent soutenir la Vitesse de travail, les MEN, la satiété ou l’activité nocturne.";

  return `
    <section class="passive-page" aria-labelledby="passive-result-title">
      <nav class="job-picker passive-job-picker" aria-label="Choisir une capacité de travail">
        ${passiveJobs
          .map(
            (job) => `
              <button
                type="button"
                data-passive-job="${job.id}"
                class="${selectedJob.id === job.id ? "selected" : ""}"
                aria-pressed="${selectedJob.id === job.id}"
                style="--job-color:${job.color}"
              >
                <img src="${job.icon}" alt="" />
                <span>${job.name}</span>
              </button>`,
          )
          .join("")}
      </nav>
      <div class="passive-results">
        <header class="passive-results__header" style="--job-color:${selectedJob.color}">
          <span class="work-card__icon">
            <img src="${selectedJob.icon}" alt="" />
          </span>
          <div>
            <p>Passifs utiles pour</p>
            <h2 id="passive-result-title">${selectedJob.name}</h2>
            <span>${context}</span>
          </div>
        </header>
        <div class="passive-list">
          ${passiveListTemplate(skillIds)}
        </div>
      </div>
    </section>`;
}

function condensationTemplate() {
  return `
    <article class="info-card" aria-labelledby="condensation-title">
      <header class="info-card__header">
        <img src="assets/structures/pal-essence-condenser.jpg" alt="Condensateur d’essence de Pal" />
        <div>
          <h3 id="condensation-title">Fonctionnement de la condensation</h3>
          <p>La condensation renforce un Pal en utilisant d’autres Pals de la même espèce. Chaque palier ajoute une étoile et améliore une ou plusieurs de ses aptitudes de travail.</p>
        </div>
      </header>
      <div class="condensation-steps">
        <div><strong>1★</strong><span>4 Pals</span><p>+1 à son aptitude de travail prioritaire.</p></div>
        <div><strong>2★</strong><span>8 Pals</span><p>+1 à sa deuxième aptitude de travail prioritaire.</p></div>
        <div><strong>3★</strong><span>12 Pals</span><p>+1 à sa troisième aptitude de travail prioritaire.</p></div>
        <div><strong>4★</strong><span>24 Pals</span><p>+1 à toutes ses aptitudes de travail.</p></div>
      </div>
      <p class="info-card__note">Il faut donc 48 Pals au total pour atteindre 4★. Les quantités indiquées correspondent au coût de chaque palier.</p>
    </article>`;
}

function basePartnerCardTemplate(entry) {
  return `
    <article class="partner-card">
      <img class="partner-card__portrait" src="assets/pals/${entry.portrait}.png" alt="${entry.pal}" />
      <div class="partner-card__content">
        <p class="partner-card__pal">${entry.pal}</p>
        <h3>${entry.skill}</h3>
        <div class="partner-card__effects">
          ${entry.effects.map((effect) => `<p>${effect}</p>`).join("")}
        </div>
        ${entry.note ? `<p class="partner-card__note">${entry.note}</p>` : ""}
      </div>
    </article>`;
}

function basePartnersTemplate() {
  const selectedActivity =
    partnerActivities.find((activity) => activity.id === selectedPartnerActivityId) || partnerActivities[0];
  const entries = basePartnerSkills.filter((entry) => entry.activity === selectedActivity.id);

  return `
    <section class="partner-page" aria-labelledby="partner-result-title">
      <p class="info-section-copy">Choisissez une activité pour identifier rapidement les Pals dont la Compétence partenaire apporte un bonus utile à la base.</p>
      <nav class="job-picker partner-activity-picker" aria-label="Choisir une activité de base">
        ${partnerActivities
          .map(
            (activity) => `
              <button
                type="button"
                data-partner-activity="${activity.id}"
                class="${selectedActivity.id === activity.id ? "selected" : ""}"
                aria-pressed="${selectedActivity.id === activity.id}"
                style="--job-color:${activity.color}"
              >
                <img src="${activity.icon}" alt="" />
                <span>${activity.name}</span>
              </button>`,
          )
          .join("")}
      </nav>
      <div class="partner-results" style="--job-color:${selectedActivity.color}">
        <header class="partner-results__header">
          <span class="work-card__icon"><img src="${selectedActivity.icon}" alt="" /></span>
          <div>
            <p>Compétences partenaire utiles pour</p>
            <h2 id="partner-result-title">${selectedActivity.name}</h2>
          </div>
        </header>
        <div class="partner-list">${entries.map(basePartnerCardTemplate).join("")}</div>
      </div>
    </section>`;
}

function combatPartnersTemplate() {
  return `
    <section class="construction-page" aria-labelledby="combat-construction-title">
      <div class="construction-page__visual" aria-hidden="true">
        <img src="assets/ui/cattiva-construction.gif" alt="" />
      </div>
      <div>
        <p class="eyebrow">Prochaine fonctionnalité</p>
        <h2 id="combat-construction-title">Compétences partenaire de combat</h2>
        <strong>En cours de construction</strong>
        <p>Cette rubrique arrivera dans une prochaine version.</p>
      </div>
    </section>`;
}

function updateIntro() {
  intro.classList.toggle(
    "hidden",
    currentView === "condensation" || currentView === "partners" || currentView === "combat-partners",
  );

  if (currentView === "passives") {
    pageEyebrow.textContent = "Aide à la Palbox";
    pageTitle.textContent = "Compétences passives";
    pageCopy.textContent =
      "Sélectionnez une capacité de travail pour afficher les compétences passives intéressantes pour les Pals affectés à cette tâche.";
    return;
  }

  pageEyebrow.textContent = "Guide rapide de la base";
  pageTitle.textContent = "Aptitudes de travail";
  pageCopy.textContent = "Compare l’efficacité de chaque niveau d’aptitude, de 1 à 10.";
}

function render() {
  renderPicker();
  updateIntro();
  singleButton.classList.toggle("active", currentView === "jobs");
  passiveButton.classList.toggle("active", currentView === "passives");
  condensationButton.classList.toggle("active", currentView === "condensation");
  partnerButton.classList.toggle("active", currentView === "partners");
  combatPartnerButton.classList.toggle("active", currentView === "combat-partners");
  picker.classList.toggle("hidden", currentView !== "jobs");

  if (currentView === "condensation") {
    content.innerHTML = `<section class="standalone-page" aria-label="Condensation des Pals">
      <p class="eyebrow">Amélioration des Pals</p>
      <h1 class="standalone-page__title">Condensation des Pals</h1>
      ${condensationTemplate()}
    </section>`;
    return;
  }

  if (currentView === "partners") {
    content.innerHTML = `<section class="standalone-page" aria-label="Compétences partenaire utilitaires">
      <p class="eyebrow">Gestion de la base</p>
      <h1 class="standalone-page__title">Compétences partenaire utilitaires</h1>
      ${basePartnersTemplate()}
    </section>`;
    return;
  }

  if (currentView === "combat-partners") {
    content.innerHTML = combatPartnersTemplate();
    return;
  }

  if (currentView === "passives") {
    content.innerHTML = passivePageTemplate();
    return;
  }

  const selectedJob = jobs.find((job) => job.id === selectedId) || jobs[0];
  content.innerHTML = `<section class="single-table">${tableTemplate(selectedJob)}</section>`;
}

picker.addEventListener("click", (event) => {
  const button = event.target.closest("[data-job]");
  if (!button) return;
  selectedId = button.dataset.job;
  currentView = "jobs";
  render();
});

content.addEventListener("click", (event) => {
  const passiveJobButton = event.target.closest("[data-passive-job]");
  if (passiveJobButton) {
    selectedPassiveJobId = passiveJobButton.dataset.passiveJob;
    render();
    return;
  }

  const partnerActivityButton = event.target.closest("[data-partner-activity]");
  if (partnerActivityButton) {
    selectedPartnerActivityId = partnerActivityButton.dataset.partnerActivity;
    render();
  }
});

brand.addEventListener("click", (event) => {
  event.preventDefault();
  currentView = "jobs";
  render();
  window.scrollTo(0, 0);
});

singleButton.addEventListener("click", () => {
  currentView = "jobs";
  render();
});

passiveButton.addEventListener("click", () => {
  currentView = "passives";
  render();
});

condensationButton.addEventListener("click", () => {
  currentView = "condensation";
  render();
});

partnerButton.addEventListener("click", () => {
  currentView = "partners";
  render();
});

combatPartnerButton.addEventListener("click", () => {
  currentView = "combat-partners";
  render();
});

render();
