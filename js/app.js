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
    color: "#b8d86a",
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
const skillsMenuButton = document.querySelector("#skills-menu-button");
const skillsMenu = document.querySelector("#skills-menu");
const passiveButton = document.querySelector("#passive-view");
const condensationButton = document.querySelector("#condensation-view");
const breedingButton = document.querySelector("#breeding-view");
const partnerButton = document.querySelector("#partner-view");
const combatPartnerButton = document.querySelector("#combat-partner-view");
const memoButton = document.querySelector("#memo-view");
const intro = document.querySelector(".intro");
const pageEyebrow = document.querySelector("#page-eyebrow");
const pageCopy = document.querySelector("#page-copy");
const formatter = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });

let selectedId = jobs[0].id;
let selectedPassiveJobId = jobs[0].id;
let selectedPartnerActivityId = partnerActivities[0].id;
let selectedCondensationPalId = null;
let condensationStars = 0;
let condensationQuery = "";
let currentView = "jobs";
let viewTransitionTimer;
let skillsMenuCloseTimer;
let draggedMemoId = null;
let memoDragPlaceholder = null;
let memoDragGhost = null;
let memoDragOffset = { x: 0, y: 0 };
let memoDragPointerId = null;

const memoStorageKey = "palworld-nyu-tools:memo";
const breedingStorageKey = "palworld-nyu-tools:breeding-v0.8";

function loadMemoTasks() {
  try {
    const storedTasks = JSON.parse(localStorage.getItem(memoStorageKey) || "[]");
    if (!Array.isArray(storedTasks)) return [];
    return storedTasks
      .filter((task) => task && typeof task.id === "string")
      .map((task) => ({
        id: task.id,
        title: typeof task.title === "string" ? task.title : "",
        note: typeof task.note === "string" ? task.note : "",
      }));
  } catch {
    return [];
  }
}

let memoTasks = loadMemoTasks();

const condensationPals = window.CONDENSATION_PALS || [];
const breedingSource = window.BREEDING_DATA || { pals: [], children: [], genderCombos: [] };
const breedingPals = breedingSource.pals.map(([id, name, portrait, order]) => ({
  id,
  name,
  portrait,
  order,
}));
const breedingPalById = new Map(breedingPals.map((pal) => [pal.id, pal]));
const breedingChildren = breedingSource.children || [];
const breedingGenderCombos = breedingSource.genderCombos || [];
const breedingRouteEdges = new Map();
const condensationStepCosts = [0, 4, 8, 12, 24];
const condensationTotalCosts = [0, 4, 12, 24, 48];

function loadBreedingState() {
  const emptyState = {
    secondRole: "parentB",
    parentA: null,
    parentB: null,
    target: null,
    sexA: "Male",
    sexB: "Female",
    routeRequested: false,
  };
  try {
    const stored = JSON.parse(localStorage.getItem(breedingStorageKey) || "null");
    if (!stored || typeof stored !== "object") return emptyState;
    return {
      ...emptyState,
      secondRole: stored.secondRole === "target" || stored.mode === "route" ? "target" : "parentB",
      parentA: breedingPalById.has(stored.parentA) ? stored.parentA : null,
      parentB: breedingPalById.has(stored.parentB) ? stored.parentB : null,
      target: breedingPalById.has(stored.target) ? stored.target : null,
      sexA: stored.sexA === "Female" ? "Female" : "Male",
      sexB: stored.sexB === "Male" ? "Male" : "Female",
      routeRequested: Boolean(stored.routeRequested),
    };
  } catch {
    return emptyState;
  }
}

let breedingState = loadBreedingState();
let breedingQuery = "";
let breedingSelectionSlot = "parentA";
let breedingCanvas = { x: 0, y: 0, scale: 1, fitted: false };
let breedingPan = null;

function saveBreedingState() {
  try {
    localStorage.setItem(breedingStorageKey, JSON.stringify(breedingState));
  } catch {
    // Le planificateur reste utilisable pendant la session si le stockage est indisponible.
  }
}

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

function normalizeSearch(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr-FR")
    .trim();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatPalNumber(number) {
  if (!number) return "";
  const match = String(number).match(/^(\d+)(.*)$/);
  return match ? `#${match[1].padStart(3, "0")}${match[2]}` : `#${number}`;
}

const condensationElementIcons = {
  Neutre: "assets/elements/neutral.webp",
  Feu: "assets/elements/fire.png",
  Eau: "assets/elements/water.png",
  Plante: "assets/elements/grass.png",
  Électrique: "assets/elements/electric.png",
  Glace: "assets/elements/ice.png",
  Terre: "assets/elements/ground.png",
  Ténèbres: "assets/elements/dark.png",
  Dragon: "assets/elements/dragon.png",
};

function condensationWorkGridTemplate(pal, stars) {
  const levels = pal?.levels[stars] || jobs.map(() => 0);
  const baseLevels = pal?.levels[0] || jobs.map(() => 0);
  const previousLevels = stars > 0 ? pal?.levels[stars - 1] : baseLevels;

  return jobs
    .map((job, index) => {
      const ownsWork = baseLevels[index] > 0;
      const improvedNow = ownsWork && stars > 0 && levels[index] > previousLevels[index];
      const improvedBefore = ownsWork && !improvedNow && levels[index] > baseLevels[index];
      const stateClass = improvedNow
        ? " condensation-work--improved-now"
        : improvedBefore
          ? " condensation-work--improved-before"
          : "";

      return `
        <div class="condensation-work${ownsWork ? "" : " condensation-work--absent"}${stateClass}" style="--job-color:${job.color}" title="${escapeHtml(job.name)}" aria-label="${escapeHtml(job.name)} : ${ownsWork ? `niveau ${levels[index]}` : "aptitude absente"}">
          ${ownsWork && (improvedNow || improvedBefore) ? '<span class="condensation-work__caret" aria-hidden="true">⌃</span>' : ""}
          <img src="${job.icon}" alt="" />
          <span class="condensation-work__level" aria-label="${ownsWork ? `Niveau ${levels[index]}` : "Aptitude absente"}">
            ${ownsWork ? `<strong>${levels[index]}</strong>` : ""}
          </span>
        </div>`;
    })
    .join("");
}

function condensationCostTemplate(stars) {
  if (stars === 0) {
    return `<p class="condensation-cost__empty">Aucun Pal requis à 0★.</p>`;
  }

  return `
    <p><strong>+${condensationStepCosts[stars]} Pals</strong><span>pour ce palier</span></p>
    <p><strong>${condensationTotalCosts[stars]} Pals</strong><span>au total depuis 0★</span></p>`;
}

function condensationPartnerTemplate(pal, stars) {
  if (!pal) {
    return '<div class="condensation-partner condensation-partner--ghost" aria-hidden="true"><span></span><span></span><span></span></div>';
  }

  const partner = pal.partner;
  const effects = partner.effects
    .map((effect) => {
      const value = effect.values[stars];
      const changed = stars > 0 && value !== effect.values[stars - 1];
      return `<p><span>${escapeHtml(effect.label)}</span><strong class="${changed ? "condensation-partner__value--changed" : ""}">${escapeHtml(value)}</strong></p>`;
    })
    .join("");

  return `
    <div class="condensation-partner">
      <div class="condensation-partner__eyebrow"><span>Compétence partenaire</span><small>${stars}★</small></div>
      <h3>${escapeHtml(partner.name)}</h3>
      <p class="condensation-partner__description">${escapeHtml(partner.description)}</p>
      ${
        effects
          ? `<div class="condensation-partner__effects">${effects}</div>`
          : '<p class="condensation-partner__fixed">Aucune valeur évolutive visible.</p>'
      }
    </div>`;
}

function condensationCardTemplate(pal) {
  const isGhost = !pal;
  const displayedStars = isGhost ? 0 : condensationStars;
  const number = pal ? formatPalNumber(pal.number) : "";
  const elements = pal?.elements || [];

  return `
    <article class="condensation-card${isGhost ? " condensation-card--ghost" : ""}" aria-live="polite">
      <header class="condensation-card__header">
        <div class="condensation-card__portrait">
          ${pal ? `<img src="${pal.portrait}" alt="${escapeHtml(pal.name)}" />` : '<span aria-hidden="true">?</span>'}
        </div>
        <div class="condensation-card__identity">
          ${number ? `<p>${number}</p>` : ""}
          ${pal ? `<h2>${escapeHtml(pal.name)}</h2>` : '<div class="condensation-card__ghost-lines" aria-hidden="true"><span></span><span></span></div>'}
          ${
            elements.length
              ? `<div class="condensation-card__elements" aria-label="${elements.length > 1 ? "Éléments" : "Élément"} : ${elements.map(escapeHtml).join(", ")}">${elements
                  .map(
                    (element) =>
                      `<img src="${condensationElementIcons[element]}" alt="${escapeHtml(element)}" title="${escapeHtml(element)}" />`,
                  )
                  .join("")}</div>`
              : ""
          }
        </div>
        <div data-condensation-partner>
          ${condensationPartnerTemplate(pal, displayedStars)}
        </div>
      </header>

      <div class="condensation-work-grid" data-condensation-work-grid>
        ${condensationWorkGridTemplate(pal, displayedStars)}
      </div>

      <div class="condensation-controls">
        <div class="condensation-slider">
          <label for="condensation-stars">Niveau de condensation</label>
          <input id="condensation-stars" type="range" min="0" max="4" step="1" value="${displayedStars}" ${isGhost ? "disabled" : ""} />
          <div class="condensation-slider__steps" aria-label="Choisir un niveau de condensation">
            ${[0, 1, 2, 3, 4]
              .map(
                (stars) => `<button type="button" data-condensation-star="${stars}" class="${stars === displayedStars ? "active" : ""}" ${isGhost ? "disabled" : ""}>${stars}★</button>`,
              )
              .join("")}
          </div>
        </div>
        <div class="condensation-cost" data-condensation-cost>
          ${condensationCostTemplate(displayedStars)}
        </div>
      </div>
    </article>`;
}

function condensationTemplate() {
  const selectedPal = condensationPals.find((pal) => pal.id === selectedCondensationPalId) || null;

  return `
    <section class="condensation-simulator" aria-labelledby="condensation-title">
      <p id="condensation-title" class="info-section-copy">Recherchez un Pal et choisissez son niveau de condensation pour voir directement l’évolution de ses aptitudes de travail.</p>
      <div class="pal-search">
        <div class="pal-search__field">
          <input id="pal-search-input" type="search" placeholder="Rechercher un Pal…" aria-label="Rechercher un Pal" value="${escapeHtml(condensationQuery)}" autocomplete="off" spellcheck="false" />
          <span aria-hidden="true">⌕</span>
        </div>
        <div class="pal-search__results" data-pal-search-results></div>
      </div>
      <div data-condensation-card>${condensationCardTemplate(selectedPal)}</div>
    </section>`;
}

function renderCondensationSearchResults() {
  const resultsContainer = content.querySelector("[data-pal-search-results]");
  if (!resultsContainer) return;
  const query = normalizeSearch(condensationQuery);

  if (query.length < 3) {
    resultsContainer.innerHTML = query.length
      ? '<p class="pal-search__hint">Saisissez au moins 3 caractères.</p>'
      : "";
    return;
  }

  const results = condensationPals.filter((pal) => normalizeSearch(pal.name).includes(query));
  if (!results.length) {
    resultsContainer.innerHTML = '<p class="pal-search__empty">Aucun Pal trouvé — contactez Nyu</p>';
    return;
  }

  resultsContainer.innerHTML = `<div class="pal-search__grid">
    ${results
      .map(
        (pal) => `
          <button type="button" data-condensation-pal="${pal.id}" class="${pal.id === selectedCondensationPalId ? "selected" : ""}">
            <img src="${pal.portrait}" alt="" />
            <span>${escapeHtml(pal.name)}</span>
          </button>`,
      )
      .join("")}
  </div>`;
}

function renderCondensationCard() {
  const cardContainer = content.querySelector("[data-condensation-card]");
  if (!cardContainer) return;
  const selectedPal = condensationPals.find((pal) => pal.id === selectedCondensationPalId) || null;
  cardContainer.innerHTML = condensationCardTemplate(selectedPal);
}

function updateCondensationState() {
  const selectedPal = condensationPals.find((pal) => pal.id === selectedCondensationPalId) || null;
  const grid = content.querySelector("[data-condensation-work-grid]");
  const cost = content.querySelector("[data-condensation-cost]");
  const partner = content.querySelector("[data-condensation-partner]");
  if (grid) grid.innerHTML = condensationWorkGridTemplate(selectedPal, condensationStars);
  if (cost) cost.innerHTML = condensationCostTemplate(condensationStars);
  if (partner) partner.innerHTML = condensationPartnerTemplate(selectedPal, condensationStars);
  content.querySelectorAll("[data-condensation-star]").forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.condensationStar) === condensationStars);
  });
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
        <h2 id="combat-construction-title">En cours de construction</h2>
        <p>Cette rubrique arrivera dans une prochaine version.</p>
      </div>
    </section>`;
}

function breedingPairIndex(parentAIndex, parentBIndex) {
  const low = Math.min(parentAIndex, parentBIndex);
  const high = Math.max(parentAIndex, parentBIndex);
  return low * breedingPals.length - (low * (low - 1)) / 2 + high - low;
}

function breedingGenderComboMatch(combo, parentAIndex, parentBIndex) {
  if (combo[0] === parentAIndex && combo[2] === parentBIndex) {
    return { genderA: combo[1] === "M" ? "Male" : "Female", genderB: combo[3] === "M" ? "Male" : "Female" };
  }
  if (combo[0] === parentBIndex && combo[2] === parentAIndex) {
    return { genderA: combo[3] === "M" ? "Male" : "Female", genderB: combo[1] === "M" ? "Male" : "Female" };
  }
  return null;
}

function breedingOutcomes(parentAId, parentBId, genderA = null, genderB = null) {
  const parentA = breedingPalById.get(parentAId);
  const parentB = breedingPalById.get(parentBId);
  if (!parentA || !parentB || (genderA && genderA === genderB)) return [];
  let pairHasGenderRule = false;
  const genderOutcomes = [];
  breedingGenderCombos.forEach((combo) => {
    const match = breedingGenderComboMatch(combo, parentA.order, parentB.order);
    if (!match) return;
    pairHasGenderRule = true;
    if (genderA && (match.genderA !== genderA || match.genderB !== genderB)) return;
    genderOutcomes.push({
      child: breedingPals[combo[4]],
      genders: match.genderA ? match : null,
      special: true,
    });
  });
  if (genderOutcomes.length || pairHasGenderRule) return genderOutcomes;

  const childIndex = breedingChildren[breedingPairIndex(parentA.order, parentB.order)];
  const child = childIndex >= 0 ? breedingPals[childIndex] : null;
  return child ? [{ child, genders: null, special: false }] : [];
}

function breedingEdgesFor(parentId) {
  if (breedingRouteEdges.has(parentId)) return breedingRouteEdges.get(parentId);
  const edges = [];
  breedingPals.forEach((partner) => {
    breedingOutcomes(parentId, partner.id).forEach((outcome) => {
      edges.push({
        parent: parentId,
        partner: partner.id,
        child: outcome.child.id,
        genders: outcome.genders,
      });
    });
  });
  breedingRouteEdges.set(parentId, edges);
  return edges;
}

function findBreedingRoute(startId, targetId) {
  if (!breedingPalById.has(startId) || !breedingPalById.has(targetId)) return null;
  if (startId === targetId) return [];
  const previous = new Map([[startId, null]]);
  const queue = [startId];
  let cursor = 0;

  while (cursor < queue.length && !previous.has(targetId)) {
    const current = queue[cursor++];
    for (const edge of breedingEdgesFor(current)) {
      if (previous.has(edge.child)) continue;
      previous.set(edge.child, edge);
      queue.push(edge.child);
      if (edge.child === targetId) break;
    }
  }
  if (!previous.has(targetId)) return null;

  const route = [];
  let current = targetId;
  while (current !== startId) {
    const edge = previous.get(current);
    route.push(edge);
    current = edge.parent;
  }
  return route.reverse();
}

function breedingSelectedCard(slot, label, genderKey = null) {
  const pal = breedingPalById.get(breedingState[slot]);
  const gender = genderKey ? breedingState[genderKey] : null;
  return `
    <div class="breeding-selection${breedingSelectionSlot === slot ? " breeding-selection--active" : ""}">
      <button type="button" class="breeding-selection__pal" data-breeding-pick="${slot}">
        <span class="breeding-selection__portrait">${pal ? `<img src="${pal.portrait}" alt="" />` : "+"}</span>
        <span><small>${escapeHtml(label)}</small><strong>${pal ? escapeHtml(pal.name) : "Choisir un Pal"}</strong></span>
      </button>
      ${pal && slot !== "target" ? `<button type="button" class="breeding-parent-remove" data-breeding-remove="${slot}" aria-label="Retirer ${escapeHtml(label)}">×</button>` : ""}
      ${pal && genderKey ? `<span class="breeding-gender" aria-label="Sexe de ${escapeHtml(pal.name)}">
        <button type="button" data-breeding-sex="${genderKey}" data-sex="Male" aria-pressed="${gender === "Male"}">♂</button>
        <button type="button" data-breeding-sex="${genderKey}" data-sex="Female" aria-pressed="${gender === "Female"}">♀</button>
      </span>` : ""}
    </div>`;
}

function buildBreedingGraph() {
  if (!breedingState.parentA) return null;
  if (breedingState.secondRole === "parentB") {
    if (!breedingState.parentB) return null;
    const outcome = breedingOutcomes(breedingState.parentA, breedingState.parentB, breedingState.sexA, breedingState.sexB)[0];
    if (!outcome) return { error: "Un couple doit comporter un Pal mâle et un Pal femelle." };
    return {
      summary: "Croisement direct",
      nodes: [
        { key: "child", palId: outcome.child.id, x: 150, y: 20, role: "Enfant" },
        { key: "parent-a", palId: breedingState.parentA, x: 30, y: 205, role: "Parent", gender: breedingState.sexA },
        { key: "parent-b", palId: breedingState.parentB, x: 270, y: 205, role: "Parent", gender: breedingState.sexB },
      ],
      edges: [["parent-a", "child"], ["parent-b", "child"]],
      width: 430,
      height: 325,
    };
  }

  if (!breedingState.target) return null;
  const route = findBreedingRoute(breedingState.parentA, breedingState.target);
  if (route === null) return { error: "Aucune route d’élevage valide trouvée avec les données actuelles." };
  if (!route.length) return { error: "Le Pal de départ est déjà le Pal cible." };
  const nodes = [];
  const edges = [];
  const nodeWidth = 132;
  const verticalGap = 175;
  const horizontalStep = 82;
  const partnerGap = 185;
  const generations = route.length;
  route.forEach((step, index) => {
    const stage = index;
    const parentKey = `line-${stage}`;
    const childKey = `line-${stage + 1}`;
    const parentX = (generations - stage) * -horizontalStep;
    const parentY = (generations - stage) * verticalGap + 25;
    if (!nodes.some((node) => node.key === parentKey)) {
      nodes.push({ key: parentKey, palId: step.parent, x: parentX, y: parentY, role: stage ? "Lignée" : "Départ" });
    }
    if (!nodes.some((node) => node.key === childKey)) {
      nodes.push({ key: childKey, palId: step.child, x: parentX + horizontalStep, y: parentY - verticalGap, role: stage === generations - 1 ? "Cible" : "Descendant" });
    }
    const partnerKey = `partner-${stage}`;
    nodes.push({ key: partnerKey, palId: step.partner, x: parentX + partnerGap, y: parentY, role: "Partenaire", gender: step.genders?.genderB || null });
    const lineage = nodes.find((node) => node.key === parentKey);
    if (step.genders) lineage.gender = step.genders.genderA;
    edges.push([parentKey, childKey], [partnerKey, childKey]);
  });
  const minX = Math.min(...nodes.map((node) => node.x));
  nodes.forEach((node) => { node.x += 45 - minX; });
  return {
    summary: `${generations} génération${generations > 1 ? "s" : ""}`,
    nodes,
    edges,
    width: Math.max(...nodes.map((node) => node.x)) + nodeWidth + 45,
    height: (generations + 1) * verticalGap + 15,
  };
}

function breedingGraphTemplate(graph) {
  if (!graph || graph.error) return "";
  const nodeByKey = new Map(graph.nodes.map((node) => [node.key, node]));
  const paths = graph.edges.map(([fromKey, toKey]) => {
    const from = nodeByKey.get(fromKey);
    const to = nodeByKey.get(toKey);
    const startX = from.x + 66;
    const startY = from.y;
    const endX = to.x + 66;
    const endY = to.y + 96;
    const middleY = (startY + endY) / 2;
    return `<path d="M ${startX} ${startY} C ${startX} ${middleY}, ${endX} ${middleY}, ${endX} ${endY}" />`;
  }).join("");
  const sexSymbol = (gender) => gender === "Male" ? "♂" : gender === "Female" ? "♀" : "";
  const nodes = graph.nodes.map((node) => {
    const pal = breedingPalById.get(node.palId);
    const usefulRole = node.role === "Cible" || node.role === "Enfant" ? `<span class="breeding-node__role">${escapeHtml(node.role)}</span>` : "";
    return `<article class="breeding-node${node.role === "Cible" || node.role === "Enfant" ? " breeding-node--result" : ""}" style="left:${node.x}px;top:${node.y}px">
      ${usefulRole}
      <span class="breeding-node__portrait"><img src="${pal.portrait}" alt="" /></span>
      <strong>${escapeHtml(pal.name)}</strong>${node.gender ? `<b class="breeding-node__sex">${sexSymbol(node.gender)}</b>` : ""}
    </article>`;
  }).join("");
  return `<div class="breeding-tree" data-breeding-tree style="width:${graph.width}px;height:${graph.height}px">
    <svg class="breeding-tree__links" width="${graph.width}" height="${graph.height}" viewBox="0 0 ${graph.width} ${graph.height}" aria-hidden="true">${paths}</svg>
    ${nodes}
  </div>`;
}

function breedingPanelTemplate() {
  const secondSlot = breedingState.secondRole === "target" ? "target" : "parentB";
  return `<aside class="breeding-panel">
    <div class="breeding-panel__heading"><p class="eyebrow">Sélection</p><button type="button" class="breeding-reset" data-breeding-reset>Réinitialiser</button></div>
    <div class="breeding-role" role="group" aria-label="Type de calcul">
      <button type="button" data-breeding-second-role="parentB" aria-pressed="${breedingState.secondRole === "parentB"}">Deux parents</button>
      <button type="button" data-breeding-second-role="target" aria-pressed="${breedingState.secondRole === "target"}">Pal cible</button>
    </div>
    <div class="breeding-selections">
      ${breedingSelectedCard("parentA", breedingState.secondRole === "target" ? "Pal de départ" : "Parent A", "sexA")}
      ${breedingSelectedCard(secondSlot, breedingState.secondRole === "target" ? "Pal cible" : "Parent B", breedingState.secondRole === "target" ? null : "sexB")}
    </div>
    <label class="breeding-search" for="breeding-search-input">
      <span class="pal-search__field"><input id="breeding-search-input" type="search" placeholder="Rechercher un Pal…" aria-label="Rechercher un Pal" value="${escapeHtml(breedingQuery)}" autocomplete="off" spellcheck="false" /><span aria-hidden="true">⌕</span></span>
    </label>
    <div class="breeding-picker__results" data-breeding-results></div>
  </aside>`;
}

function breedingTemplate() {
  if (window.SaveCumoir?.isSaveMode?.()) return window.SaveCumoir.template();
  const graph = buildBreedingGraph();
  const emptyMessage = graph?.error || "Sélectionnez deux paramètres pour afficher l’arbre.";
  return `<section class="breeding-page" aria-labelledby="breeding-title">
    <header class="breeding-page__header"><p class="eyebrow" id="breeding-title">Planificateur d’élevage</p><p>Deux parents pour un enfant, ou un départ et une cible pour la route la plus courte.</p></header>
    <div class="breeding-manual-tools breeding-top-tools">
      ${window.SaveCumoir?.sourceSwitch?.() || `<div class="breeding-source" role="group" aria-label="Source des Pals"><p class="eyebrow">Source des Pals</p><div><button type="button" data-cumoir-source="manual" aria-pressed="true">Manuel</button><button type="button" data-cumoir-source="save" aria-pressed="false">Sauvegarde</button></div></div>`}
    </div>
    <div class="breeding-layout">
      ${breedingPanelTemplate()}
      <section class="breeding-canvas" data-breeding-viewport aria-label="Arbre généalogique interactif">
        <div class="breeding-canvas__tip">Molette : zoom · Cliquer-glisser : déplacer</div>
        <div class="breeding-canvas__summary">${graph?.summary ? escapeHtml(graph.summary) : "Arbre généalogique"}</div>
        ${graph && !graph.error
          ? `<div class="breeding-canvas__world" data-breeding-world>${breedingGraphTemplate(graph)}</div>`
          : `<div class="breeding-canvas__empty"><span aria-hidden="true">⌁</span><p>${escapeHtml(emptyMessage)}</p></div>`}
      </section>
    </div>
  </section>`;
}

function renderBreedingPickerResults() {
  const results = content.querySelector("[data-breeding-results]");
  if (!results) return;
  const query = normalizeSearch(breedingQuery);
  if (query.length === 1) {
    results.innerHTML = '<p class="pal-search__hint">Saisissez au moins 2 caractères.</p>';
    return;
  }
  const matches = breedingPals.filter((pal) => !query || normalizeSearch(pal.name).includes(query));
  results.innerHTML = matches.length
    ? `<div class="breeding-pal-grid">${matches.map((pal) => `<button type="button" data-breeding-select="${pal.id}"><img src="${pal.portrait}" alt="" /><span>${escapeHtml(pal.name)}</span></button>`).join("")}</div>`
    : '<p class="pal-search__empty">Aucun Pal trouvé — contactez Nyu</p>';
}

function applyBreedingCanvasTransform() {
  const world = content.querySelector("[data-breeding-world]");
  if (!world) return;
  world.style.left = `${breedingCanvas.x}px`;
  world.style.top = `${breedingCanvas.y}px`;
  world.style.zoom = breedingCanvas.scale;
}

function fitBreedingCanvas() {
  const viewport = content.querySelector("[data-breeding-viewport]");
  const tree = content.querySelector("[data-breeding-tree]");
  if (!viewport || !tree) return;
  const padding = 38;
  const scale = Math.min(1.12, Math.max(0.32, Math.min((viewport.clientWidth - padding) / tree.offsetWidth, (viewport.clientHeight - padding) / tree.offsetHeight)));
  breedingCanvas = {
    scale,
    x: (viewport.clientWidth - tree.offsetWidth * scale) / 2,
    y: (viewport.clientHeight - tree.offsetHeight * scale) / 2,
    fitted: true,
  };
  applyBreedingCanvasTransform();
}

function bindBreedingCanvas() {
  const viewport = content.querySelector("[data-breeding-viewport]");
  if (!viewport) return;
  viewport.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    breedingPan = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, originX: breedingCanvas.x, originY: breedingCanvas.y };
    viewport.setPointerCapture(event.pointerId);
    viewport.classList.add("breeding-canvas--panning");
  });
  viewport.addEventListener("pointermove", (event) => {
    if (!breedingPan || breedingPan.pointerId !== event.pointerId) return;
    breedingCanvas.x = breedingPan.originX + event.clientX - breedingPan.x;
    breedingCanvas.y = breedingPan.originY + event.clientY - breedingPan.y;
    applyBreedingCanvasTransform();
  });
  const stopPan = (event) => {
    if (!breedingPan || breedingPan.pointerId !== event.pointerId) return;
    breedingPan = null;
    viewport.classList.remove("breeding-canvas--panning");
  };
  viewport.addEventListener("pointerup", stopPan);
  viewport.addEventListener("pointercancel", stopPan);
  viewport.addEventListener("wheel", (event) => {
    event.preventDefault();
    const rect = viewport.getBoundingClientRect();
    const cursorX = event.clientX - rect.left;
    const cursorY = event.clientY - rect.top;
    const previousScale = breedingCanvas.scale;
    const nextScale = Math.min(2.2, Math.max(0.28, previousScale * Math.exp(-event.deltaY * 0.0012)));
    breedingCanvas.x = cursorX - (cursorX - breedingCanvas.x) * (nextScale / previousScale);
    breedingCanvas.y = cursorY - (cursorY - breedingCanvas.y) * (nextScale / previousScale);
    breedingCanvas.scale = nextScale;
    applyBreedingCanvasTransform();
  }, { passive: false });
}

function renderBreedingPage(focusSearch = false, preserveCanvas = false) {
  if (window.SaveCumoir?.isSaveMode?.()) {
    window.SaveCumoir.render(!preserveCanvas);
    return;
  }
  content.innerHTML = breedingTemplate();
  renderBreedingPickerResults();
  bindBreedingCanvas();
  if (preserveCanvas && breedingCanvas.fitted) applyBreedingCanvasTransform();
  else requestAnimationFrame(fitBreedingCanvas);
  if (focusSearch) content.querySelector("#breeding-search-input")?.focus();
}

window.renderBreedingPage = renderBreedingPage;

function saveMemoTasks() {
  try {
    localStorage.setItem(memoStorageKey, JSON.stringify(memoTasks));
  } catch {
    // Le mémo reste utilisable pendant la session si le stockage est indisponible.
  }
}

function createMemoId() {
  return typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `memo-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function memoCardTemplate(task) {
  return `
    <article class="memo-card" data-memo-id="${task.id}">
      <div class="memo-card__topline">
        <span class="memo-card__handle" title="Déplacer cette tâche" aria-label="Déplacer cette tâche">↕</span>
        <input class="memo-card__title" data-memo-title type="text" value="${escapeHtml(task.title)}" placeholder="Titre (facultatif)" aria-label="Titre de la tâche" />
        <button class="memo-card__delete" data-memo-delete type="button" title="Supprimer cette tâche" aria-label="Supprimer cette tâche">×</button>
      </div>
      <textarea class="memo-card__note" data-memo-note placeholder="Écrivez votre note…" aria-label="Note de la tâche">${escapeHtml(task.note)}</textarea>
    </article>`;
}

function memoTemplate() {
  return `
    <section class="memo-page" aria-label="Mémo personnel">
      <div class="memo-page__toolbar">
        <p>Un petit carnet pour garder vos prochains objectifs Palworld sous la main.</p>
        <button class="memo-page__add" data-memo-add type="button"><span aria-hidden="true">+</span> Nouvelle tâche</button>
      </div>
      <div class="memo-list" data-memo-list>
        ${
          memoTasks.length
            ? memoTasks.map(memoCardTemplate).join("")
            : '<p class="memo-empty" data-memo-empty>Aucune tâche pour le moment.</p>'
        }
      </div>
    </section>`;
}

function resizeMemoTextarea(textarea) {
  textarea.style.height = "auto";
  textarea.style.height = `${Math.min(textarea.scrollHeight, 210)}px`;
  textarea.classList.toggle("memo-card__note--scrolling", textarea.scrollHeight > 210);
}

function resizeMemoTextareas() {
  content.querySelectorAll("[data-memo-note]").forEach(resizeMemoTextarea);
}

function renderMemoPage(focusNewTask = false) {
  content.innerHTML = memoTemplate();
  resizeMemoTextareas();
  if (focusNewTask) content.querySelector("[data-memo-id]:last-child [data-memo-title]")?.focus();
}

function updateIntro() {
  intro.classList.toggle(
    "hidden",
    currentView === "condensation" || currentView === "breeding" || currentView === "partners" || currentView === "combat-partners" || currentView === "memo",
  );

  if (currentView === "passives") {
    pageEyebrow.textContent = "Aide à la Palbox";
    pageCopy.textContent =
      "Sélectionnez une capacité de travail pour afficher les compétences passives intéressantes pour les Pals affectés à cette tâche.";
    return;
  }

  pageEyebrow.textContent = "Guide rapide de la base";
  pageCopy.textContent = "Compare l’efficacité de chaque niveau d’aptitude, de 1 à 10.";
}

function switchView(nextView) {
  if (nextView === currentView && !content.classList.contains("view-leaving")) return;
  clearTimeout(viewTransitionTimer);

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    currentView = nextView;
    render();
    return;
  }

  content.classList.add("view-leaving");
  viewTransitionTimer = window.setTimeout(() => {
    currentView = nextView;
    render();
    content.classList.remove("view-leaving");
    content.classList.add("view-entering");
    window.setTimeout(() => content.classList.remove("view-entering"), 230);
  }, 115);
}

function setSkillsMenu(open, focusFirst = false) {
  clearTimeout(skillsMenuCloseTimer);
  skillsMenu.setAttribute("aria-hidden", String(!open));
  skillsMenuButton.setAttribute("aria-expanded", String(open));
  skillsMenuButton.parentElement.classList.toggle("site-nav__group--open", open);
  if (open && focusFirst) skillsMenu.querySelector('[role="menuitem"]')?.focus();
}

function animateMemoReflow(mutateLayout) {
  const cards = [...content.querySelectorAll("[data-memo-id]:not(.memo-card--dragging)")];
  const previousPositions = new Map(cards.map((card) => [card, card.getBoundingClientRect()]));
  mutateLayout();
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  cards.forEach((card) => {
    const previous = previousPositions.get(card);
    const current = card.getBoundingClientRect();
    const deltaX = previous.left - current.left;
    const deltaY = previous.top - current.top;
    if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) return;
    card.getAnimations().forEach((animation) => {
      if (animation.id === "memo-reflow") animation.cancel();
    });
    const animation = card.animate(
      [{ transform: `translate(${deltaX}px, ${deltaY}px)` }, { transform: "translate(0, 0)" }],
      { duration: 180, easing: "cubic-bezier(0.2, 0.75, 0.25, 1)" },
    );
    animation.id = "memo-reflow";
  });
}

function render() {
  document.body.dataset.view = currentView;
  renderPicker();
  updateIntro();
  singleButton.classList.toggle("active", currentView === "jobs");
  const skillsViewActive = ["passives", "partners", "combat-partners"].includes(currentView);
  skillsMenuButton.classList.toggle("active", skillsViewActive);
  passiveButton.classList.toggle("active", currentView === "passives");
  condensationButton.classList.toggle("active", currentView === "condensation");
  breedingButton.classList.toggle("active", currentView === "breeding");
  partnerButton.classList.toggle("active", currentView === "partners");
  combatPartnerButton.classList.toggle("active", currentView === "combat-partners");
  memoButton.classList.toggle("active", currentView === "memo");
  picker.classList.toggle("hidden", currentView !== "jobs");

  if (currentView === "condensation") {
    content.innerHTML = `<section class="standalone-page" aria-label="Condensation des Pals">
      <p class="eyebrow">Amélioration des Pals</p>
      ${condensationTemplate()}
    </section>`;
    renderCondensationSearchResults();
    return;
  }

  if (currentView === "breeding") {
    renderBreedingPage();
    return;
  }

  if (currentView === "partners") {
    content.innerHTML = `<section class="standalone-page" aria-label="Compétences partenaire utilitaires">
      <p class="eyebrow">Gestion de la base</p>
      ${basePartnersTemplate()}
    </section>`;
    return;
  }

  if (currentView === "combat-partners") {
    content.innerHTML = combatPartnersTemplate();
    return;
  }

  if (currentView === "memo") {
    renderMemoPage();
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
  const breedingRoleButton = event.target.closest("[data-breeding-second-role]");
  if (breedingRoleButton) {
    breedingState.secondRole = breedingRoleButton.dataset.breedingSecondRole;
    breedingSelectionSlot = breedingState.parentA
      ? (breedingState.secondRole === "target" ? "target" : "parentB")
      : "parentA";
    breedingCanvas.fitted = false;
    saveBreedingState();
    renderBreedingPage();
    return;
  }

  const breedingPickButton = event.target.closest("[data-breeding-pick]");
  if (breedingPickButton) {
    breedingSelectionSlot = breedingPickButton.dataset.breedingPick;
    renderBreedingPage(true);
    return;
  }

  const breedingRemoveButton = event.target.closest("[data-breeding-remove]");
  if (breedingRemoveButton) {
    const slot = breedingRemoveButton.dataset.breedingRemove;
    breedingState[slot] = null;
    breedingSelectionSlot = slot;
    breedingCanvas.fitted = false;
    saveBreedingState();
    renderBreedingPage();
    return;
  }

  const breedingSelectButton = event.target.closest("[data-breeding-select]");
  if (breedingSelectButton && breedingSelectionSlot) {
    breedingState[breedingSelectionSlot] = breedingSelectButton.dataset.breedingSelect;
    if (breedingSelectionSlot === "parentA") {
      breedingSelectionSlot = breedingState.secondRole === "target" ? "target" : "parentB";
    }
    breedingCanvas.fitted = false;
    breedingQuery = "";
    saveBreedingState();
    renderBreedingPage();
    return;
  }

  const breedingSexButton = event.target.closest("[data-breeding-sex]");
  if (breedingSexButton) {
    const key = breedingSexButton.dataset.breedingSex;
    const otherKey = key === "sexA" ? "sexB" : "sexA";
    breedingState[key] = breedingSexButton.dataset.sex;
    breedingState[otherKey] = breedingState[key] === "Male" ? "Female" : "Male";
    breedingCanvas.fitted = false;
    saveBreedingState();
    renderBreedingPage();
    return;
  }

  if (event.target.closest("[data-breeding-reset]")) {
    breedingState = {
      secondRole: "parentB",
      parentA: null,
      parentB: null,
      target: null,
      sexA: "Male",
      sexB: "Female",
      routeRequested: false,
    };
    breedingSelectionSlot = "parentA";
    breedingQuery = "";
    breedingCanvas = { x: 0, y: 0, scale: 1, fitted: false };
    saveBreedingState();
    renderBreedingPage();
    return;
  }

  const addMemoButton = event.target.closest("[data-memo-add]");
  if (addMemoButton) {
    memoTasks.push({ id: createMemoId(), title: "", note: "" });
    saveMemoTasks();
    renderMemoPage(true);
    return;
  }

  const deleteMemoButton = event.target.closest("[data-memo-delete]");
  if (deleteMemoButton) {
    const card = deleteMemoButton.closest("[data-memo-id]");
    memoTasks = memoTasks.filter((task) => task.id !== card?.dataset.memoId);
    saveMemoTasks();
    renderMemoPage();
    return;
  }

  const condensationPalButton = event.target.closest("[data-condensation-pal]");
  if (condensationPalButton) {
    selectedCondensationPalId = condensationPalButton.dataset.condensationPal;
    condensationStars = 0;
    renderCondensationSearchResults();
    renderCondensationCard();
    return;
  }

  const condensationStarButton = event.target.closest("[data-condensation-star]");
  if (condensationStarButton) {
    condensationStars = Number(condensationStarButton.dataset.condensationStar);
    const slider = content.querySelector("#condensation-stars");
    if (slider) slider.value = condensationStars;
    updateCondensationState();
    return;
  }

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

content.addEventListener("input", (event) => {
  if (event.target.matches("#breeding-search-input")) {
    breedingQuery = event.target.value;
    renderBreedingPickerResults();
    return;
  }

  const memoCard = event.target.closest("[data-memo-id]");
  if (memoCard && (event.target.matches("[data-memo-title]") || event.target.matches("[data-memo-note]"))) {
    const task = memoTasks.find((entry) => entry.id === memoCard.dataset.memoId);
    if (task) {
      if (event.target.matches("[data-memo-title]")) task.title = event.target.value;
      if (event.target.matches("[data-memo-note]")) {
        task.note = event.target.value;
        resizeMemoTextarea(event.target);
      }
      saveMemoTasks();
    }
    return;
  }

  if (event.target.matches("#pal-search-input")) {
    condensationQuery = event.target.value;
    renderCondensationSearchResults();
    return;
  }

  if (event.target.matches("#condensation-stars")) {
    condensationStars = Number(event.target.value);
    updateCondensationState();
  }
});

content.addEventListener("pointerdown", (event) => {
  const handle = event.target.closest(".memo-card__handle");
  if (!handle || event.button !== 0) return;
  const card = handle.closest("[data-memo-id]");
  draggedMemoId = card?.dataset.memoId || null;
  if (!draggedMemoId) return;
  event.preventDefault();
  memoDragPointerId = event.pointerId;
  const bounds = card.getBoundingClientRect();
  memoDragOffset = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
  memoDragPlaceholder = document.createElement("div");
  memoDragPlaceholder.className = "memo-card-placeholder";
  memoDragPlaceholder.setAttribute("aria-hidden", "true");
  memoDragPlaceholder.style.height = `${bounds.height}px`;
  card.after(memoDragPlaceholder);
  memoDragGhost = card.cloneNode(true);
  memoDragGhost.classList.add("memo-card--drag-ghost");
  memoDragGhost.setAttribute("aria-hidden", "true");
  memoDragGhost.querySelectorAll("input, textarea, button").forEach((field) => field.setAttribute("tabindex", "-1"));
  memoDragGhost.style.width = `${bounds.width}px`;
  memoDragGhost.style.height = `${bounds.height}px`;
  memoDragGhost.style.left = `${bounds.left}px`;
  memoDragGhost.style.top = `${bounds.top}px`;
  document.body.append(memoDragGhost);
  card.classList.add("memo-card--dragging");
});

document.addEventListener("pointermove", (event) => {
  if (!draggedMemoId || event.pointerId !== memoDragPointerId || !memoDragGhost) return;
  event.preventDefault();
  memoDragGhost.style.left = `${event.clientX - memoDragOffset.x}px`;
  memoDragGhost.style.top = `${event.clientY - memoDragOffset.y}px`;
  const hoveredCard = document.elementFromPoint(event.clientX, event.clientY)?.closest("[data-memo-id]");
  if (!hoveredCard || hoveredCard.dataset.memoId === draggedMemoId || !memoDragPlaceholder) return;
  const bounds = hoveredCard.getBoundingClientRect();
  const after = event.clientY > bounds.top + bounds.height / 2 ||
    (Math.abs(event.clientY - (bounds.top + bounds.height / 2)) < bounds.height / 3 && event.clientX > bounds.left + bounds.width / 2);
  const alreadyPlaced = after
    ? hoveredCard.nextElementSibling === memoDragPlaceholder
    : hoveredCard.previousElementSibling === memoDragPlaceholder;
  if (!alreadyPlaced) animateMemoReflow(() => hoveredCard[after ? "after" : "before"](memoDragPlaceholder));
}, { passive: false });

function finishMemoDrag(event) {
  if (!draggedMemoId || (event.pointerId !== undefined && event.pointerId !== memoDragPointerId)) return;
  const draggingCard = content.querySelector(`[data-memo-id="${draggedMemoId}"]`);
  if (draggingCard && memoDragPlaceholder) memoDragPlaceholder.before(draggingCard);
  draggingCard?.classList.remove("memo-card--dragging");
  memoDragPlaceholder?.remove();
  memoDragGhost?.remove();
  memoDragPlaceholder = null;
  memoDragGhost = null;
  memoDragPointerId = null;
  const order = [...content.querySelectorAll("[data-memo-id]")].map((card) => card.dataset.memoId);
  memoTasks.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  saveMemoTasks();
  draggedMemoId = null;
}

document.addEventListener("pointerup", finishMemoDrag);
document.addEventListener("pointercancel", finishMemoDrag);

brand.addEventListener("click", (event) => {
  event.preventDefault();
  switchView("jobs");
  window.scrollTo(0, 0);
});

singleButton.addEventListener("click", () => {
  setSkillsMenu(false);
  switchView("jobs");
});

skillsMenuButton.addEventListener("click", () => {
  const mouseIsInside = window.matchMedia("(hover: hover)").matches && skillsMenuButton.parentElement.matches(":hover");
  setSkillsMenu(mouseIsInside || skillsMenuButton.getAttribute("aria-expanded") !== "true");
});

skillsMenuButton.parentElement.addEventListener("pointerenter", (event) => {
  if (event.pointerType !== "touch") setSkillsMenu(true);
});

skillsMenuButton.parentElement.addEventListener("pointerleave", (event) => {
  if (event.pointerType === "touch") return;
  skillsMenuCloseTimer = window.setTimeout(() => setSkillsMenu(false), 90);
});

skillsMenuButton.addEventListener("keydown", (event) => {
  if (event.key === "ArrowDown") {
    event.preventDefault();
    setSkillsMenu(true, true);
  }
});

skillsMenu.addEventListener("keydown", (event) => {
  const items = [...skillsMenu.querySelectorAll('[role="menuitem"]')];
  const index = items.indexOf(document.activeElement);
  if (event.key === "Escape") {
    setSkillsMenu(false);
    skillsMenuButton.focus();
  } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    items[(index + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length].focus();
  }
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".site-nav__group")) setSkillsMenu(false);
});

passiveButton.addEventListener("click", () => {
  setSkillsMenu(false);
  switchView("passives");
});

condensationButton.addEventListener("click", () => {
  if (currentView !== "condensation") {
    selectedCondensationPalId = null;
    condensationStars = 0;
    condensationQuery = "";
  }
  switchView("condensation");
});

breedingButton.addEventListener("click", () => {
  breedingQuery = "";
  switchView("breeding");
});

partnerButton.addEventListener("click", () => {
  setSkillsMenu(false);
  switchView("partners");
});

combatPartnerButton.addEventListener("click", () => {
  setSkillsMenu(false);
  switchView("combat-partners");
});

memoButton.addEventListener("click", () => {
  switchView("memo");
});

render();
