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

const workOptimization = window.WORK_OPTIMIZATION || { passiveProfiles: {}, passiveJobProfiles: {}, partnerActivities: {} };
const guideData = window.GUIDE_DATA || { categories: [], elements: [] };
const passiveById = new Map((window.PALWORLD_PASSIVES || []).map((passive) => [passive.id, passive]));
const specialPartnerActivities = [
  { id: "global", name: "Base", shortName: "Base", icon: "assets/ui/palbox.png", color: "#8fcf9e" },
  { id: "breeding", name: "Élevage / Œufs", shortName: "Élevage / Œufs", icon: "assets/ui/mutant-pal-egg.png", color: "#f0b987" },
];
const partnerActivities = [...jobs, ...specialPartnerActivities];
const picker = document.querySelector("#job-picker");
const content = document.querySelector("#content");
const singleButton = document.querySelector("#single-view");
const workButton = document.querySelector("#work-view");
const combatButton = document.querySelector("#combat-view");
const condensationButton = document.querySelector("#condensation-view");
const breedingButton = document.querySelector("#breeding-view");
const memoButton = document.querySelector("#memo-view");
const intro = document.querySelector(".intro");
const pageEyebrow = document.querySelector("#page-eyebrow");
const pageCopy = document.querySelector("#page-copy");
const primaryNavLinks = [breedingButton, singleButton, workButton, combatButton, condensationButton, memoButton];
const jobTooltip = document.createElement("div");
jobTooltip.id = "work-job-tooltip";
jobTooltip.className = "work-job-tooltip";
jobTooltip.setAttribute("role", "tooltip");
jobTooltip.hidden = true;
document.body.append(jobTooltip);
const formatter = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });

let selectedId = jobs[0].id;
let workMode = "passives";
let selectedWorkPassiveJobId = null;
let selectedWorkPartnerActivityId = null;
let partnerSkillsData = null;
let partnerSkillsError = false;
let partnerSkillsPromise = null;
let selectedGuideCategory = "combat";
let selectedGuideCombatMode = "elements";
let selectedGuideCombatFilter = "general";
let selectedGuideFarmingTab = "logging";
let selectedGuideLootElement = "fire";
let selectedGuideExplorationTab = "movement";
let selectedCondensationPalId = null;
let condensationStars = 0;
let condensationQuery = "";
const viewRoutes = new Map([
  ["#cumoir", "breeding"],
  ["#capacites", "jobs"],
  ["#optimisation", "work"],
  ["#guide", "guide"],
  ["#combat", "guide"],
  ["#guide-combat", "guide"],
  ["#guide-farming", "guide"],
  ["#guide-fishing", "guide"],
  ["#guide-capture", "guide"],
  ["#guide-exploration", "guide"],
  ["#condensation", "condensation"],
  ["#memo", "memo"],
]);
const viewFromHash = (hash) => viewRoutes.get(hash) || "breeding";
let currentView = viewFromHash(window.location.hash);
let viewTransitionTimer;
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
          data-job-tooltip="${escapeHtml(job.name)}"
          class="${selectedId === job.id && currentView === "jobs" ? "selected" : ""}"
          aria-pressed="${selectedId === job.id && currentView === "jobs"}"
          aria-label="${escapeHtml(job.name)}"
          aria-describedby="work-job-tooltip"
          style="--job-color:${job.color}"
        >
          <img src="${job.icon}" alt="" />
        </button>`,
    )
    .join("");
}

function cleanPassiveEffect(effect) {
  return String(effect || "")
    .replace(/<[^>]+>/g, "")
    .replace(/(\d+)\.0(?=\s*%)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function passiveSkillTemplate(skillId) {
  const skill = passiveById.get(skillId);
  if (!skill) return "";
  const rarity = `rank-${skill.rank}`;

  return `
    <article class="passive-skill passive-skill--${rarity}">
      <header class="passive-skill__header">
        <span class="passive-skill__rarity" aria-hidden="true"></span>
        <h3>${escapeHtml(skill.name)}</h3>
        <span class="passive-skill__rank-icon" aria-hidden="true"></span>
      </header>
      <div class="passive-skill__effects"><p>${escapeHtml(cleanPassiveEffect(skill.effect))}</p></div>
    </article>`;
}

function passiveListTemplate(skillIds) {
  const ranks = [...new Set(skillIds.map((id) => passiveById.get(id)?.rank).filter(Number.isFinite))]
    .sort((a, b) => b - a);
  return ranks
    .map((rank) => {
      const tierSkills = skillIds.filter((id) => passiveById.get(id)?.rank === rank);
      return `<div class="passive-tier-group passive-tier-group--rank-${rank}">
        ${tierSkills.map(passiveSkillTemplate).join("")}
      </div>`;
    })
    .join("");
}

function workActivityPickerTemplate(mode) {
  const isPartner = mode === "partners";
  const selectedId = isPartner ? selectedWorkPartnerActivityId : selectedWorkPassiveJobId;
  const activities = isPartner ? partnerActivities : jobs;
  return `<nav class="work-activity-picker" aria-label="${isPartner ? "Choisir une activité" : "Choisir une capacité de travail"}">
    ${activities.map((activity, index) => `
      ${isPartner && index === jobs.length ? '<span class="work-activity-picker__separator" aria-hidden="true"></span>' : ""}
      <button type="button" data-work-activity="${activity.id}" class="${selectedId === activity.id ? "selected" : ""}"
        aria-pressed="${selectedId === activity.id}" aria-label="${escapeHtml(activity.name)}"
        aria-describedby="work-job-tooltip" data-job-tooltip="${escapeHtml(activity.name)}"
        style="--job-color:${activity.color}">
        <img src="${activity.icon}" alt="" />
      </button>`).join("")}
  </nav>`;
}

function passiveResultsTemplate() {
  if (!selectedWorkPassiveJobId) {
    return `<div class="work-empty"><strong>Choisissez une capacité de travail</strong><span>Sélectionnez une icône pour afficher les compétences utiles.</span></div>`;
  }
  const job = jobs.find((entry) => entry.id === selectedWorkPassiveJobId);
  const profile = workOptimization.passiveJobProfiles[job.id];
  const skillIds = profile === "farming"
    ? [...workOptimization.passiveProfiles.standard, ...workOptimization.passiveProfiles.farming]
    : workOptimization.passiveProfiles[profile];
  const context = profile === "transport"
    ? "Vitesse de déplacement · activité nocturne · MEN / satiété"
    : profile === "farming"
      ? "Vitesse de travail · capacité d’Exploitation · activité nocturne · MEN / satiété"
      : "Vitesse de travail · activité nocturne · MEN / satiété";
  return `<div class="passive-results">
    <header class="passive-results__header" style="--job-color:${job.color}">
      <span class="work-card__icon"><img src="${job.icon}" alt="" /></span>
      <div><h2>${escapeHtml(job.name)}</h2><span>${context}</span></div>
    </header>
    <div class="passive-list">${passiveListTemplate(skillIds)}</div>
  </div>`;
}

function formatPartnerValue(value, magnitude = false) {
  let formatted = String(value || "")
    .replace(/^\+-(?=\d)/, "-")
    .replace(/\s*%$/, " %")
    .replace(/\s+/g, " ")
    .trim();
  if (magnitude) formatted = formatted.replace(/^[+-](?=\d)/, "");
  return formatted;
}

function highlightPartnerText(text, highlights = []) {
  const canonicalHighlights = [
    "Lorsqu'activée", "Lorsqu'activé", "Lorsqu'il est activé", "Lorsqu'elle est activée", "lorsqu'il est dans l'équipe", "lorsqu'elle est dans l'équipe",
    "lorsqu'il combat à vos côtés", "lorsqu'elle combat à vos côtés", "lorsqu'il est monté", "une fois monté",
    "dans la base", "à affecter à une Ferme", "Effet non cumulable", "effet non cumulable",
    "Chromite", "Gel", "Entrave", "Ferme",
  ];
  return [...new Set([...canonicalHighlights, ...highlights])].sort((a, b) => b.length - a.length).reduce(
    (html, term) => html.replaceAll(escapeHtml(term), `<strong class="partner-skill-card__keyword">${escapeHtml(term)}</strong>`),
    escapeHtml(text),
  );
}

function partnerEffectTemplate(effect, metadata) {
  const formatted = (effect.values || []).map((value) => formatPartnerValue(value, metadata.magnitude));
  if (!formatted.length) return "";
  const label = metadata.label || effect.label;
  if (new Set(formatted).size === 1) {
    return `<section class="partner-effect partner-effect--constant" aria-label="${escapeHtml(label)}">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(formatted[0])}</strong>
      <small>Identique de <span>0</span><b>★</b> à <span>4</span><b>★</b></small>
    </section>`;
  }
  return `<section class="partner-effect" aria-label="${escapeHtml(label)}">
    <p class="partner-effect__label">${escapeHtml(label)}</p>
    <div class="partner-effect__progress">
      ${formatted.map((value, star) => `<span><small><span>${star}</span><b>★</b></small><strong>${escapeHtml(value)}</strong></span>`).join("")}
    </div>
  </section>`;
}

function workPartnerCardTemplate(reference) {
  const skill = partnerSkillsData?.skills?.[reference.pal];
  const pal = condensationPals.find((entry) => entry.code === reference.pal);
  const resolvedEffects = (reference.effects || []).map((metadata) => ({
    metadata,
    effect: skill?.effects?.find((entry) => entry.label === (metadata.sourceLabel || metadata.label)),
  }));
  if (!skill || !pal || resolvedEffects.some((entry) => !entry.effect)) return "";
  const description = highlightPartnerText(skill.description, reference.highlights);
  const notes = [reference.note ? highlightPartnerText(reference.note, reference.highlights) : ""].filter(Boolean);

  return `<article class="partner-skill-card">
    <div class="partner-skill-card__portrait"><img src="${pal.portrait}" alt="" /></div>
    <div class="partner-skill-card__body">
      <header class="partner-skill-card__identity">
        <div class="partner-skill-card__pal-row">
          <p>${escapeHtml(pal.name)}</p>
          ${reference.nonCumulative ? '<span class="partner-skill-card__non-cumulative">Non cumulable</span>' : ""}
        </div>
        <div class="partner-skill-card__skill">
          ${skill.icon ? `<img src="${escapeHtml(skill.icon)}" alt="" />` : ""}
          <h3>${escapeHtml(skill.name)}</h3>
        </div>
      </header>
      <div class="partner-skill-card__description"><p>${description}</p></div>
      <div class="partner-skill-card__effects">
        ${resolvedEffects.map(({ effect, metadata }) => partnerEffectTemplate(effect, metadata)).join("")}
      </div>
      ${notes.length ? `<div class="partner-skill-card__notes">${notes.map((note) => `<p>${note}</p>`).join("")}</div>` : ""}
    </div>
  </article>`;
}


function partnerResultsTemplate() {
  if (!selectedWorkPartnerActivityId) {
    return `<div class="work-empty"><strong>Choisissez une activité</strong><span>Sélectionnez une icône pour afficher les compétences partenaires utiles.</span></div>`;
  }
  const activity = partnerActivities.find((entry) => entry.id === selectedWorkPartnerActivityId);
  if (partnerSkillsError) return '<div class="work-empty work-empty--error"><strong>Données indisponibles</strong><span>Les compétences partenaires n’ont pas pu être chargées.</span><button type="button" data-work-partner-retry>Réessayer</button></div>';
  if (!partnerSkillsData) return '<div class="work-empty"><strong>Chargement des données…</strong></div>';
  const references = workOptimization.partnerActivities[activity.id] || [];
  return `<div class="partner-results" style="--job-color:${activity.color}">
    <header class="partner-results__header">
      <span class="work-card__icon"><img src="${activity.icon}" alt="" /></span>
      <div><h2>${escapeHtml(activity.name)}</h2></div>
    </header>
    <div class="partner-list">${references.map(workPartnerCardTemplate).join("")}</div>
  </div>`;
}

function ensurePartnerSkills() {
  if (partnerSkillsData || partnerSkillsError || partnerSkillsPromise) return;
  const partnerSkillsUrl = new URL("data/partner-skills-fr.json?v=0.9.3", document.baseURI).href;
  partnerSkillsPromise = fetch(partnerSkillsUrl)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);
      return response.json();
    })
    .then((data) => { partnerSkillsData = data; })
    .catch((error) => {
      partnerSkillsError = true;
      console.error("[Données partenaires] Échec du chargement des compétences partenaires.", {
        url: partnerSkillsUrl,
        error,
      });
    })
    .finally(() => {
      partnerSkillsPromise = null;
      if ((currentView === "work" && workMode === "partners") || currentView === "guide") render();
    });
}

function workPageTemplate() {
  const partnerMode = workMode === "partners";
  return `<section class="work-optimization-page">
    <header class="work-optimization-header">
      <p class="eyebrow">Optimisation du travail</p>
      <p>Trouvez les compétences adaptées pour optimiser le travail des Pals de votre base.</p>
      <nav class="work-mode-tabs" aria-label="Type de compétence">
        <button type="button" data-work-mode="passives" class="${partnerMode ? "" : "active"}" aria-pressed="${!partnerMode}">Compétences passives</button>
        <button type="button" data-work-mode="partners" class="${partnerMode ? "active" : ""}" aria-pressed="${partnerMode}">Compétences partenaires</button>
      </nav>
    </header>
    ${workActivityPickerTemplate(workMode)}
    <div class="work-optimization-results">${partnerMode ? partnerResultsTemplate() : passiveResultsTemplate()}</div>
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
      <div class="condensation-partner__title">
        ${partner.icon ? `<img src="${escapeHtml(partner.icon)}" alt="" />` : ""}
        <h3>${escapeHtml(partner.name)}</h3>
      </div>
      <p class="condensation-partner__description">${highlightPartnerText(partner.description)}</p>
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

function guideTabsTemplate(items, selected, attribute, label, withIcons = false) {
  return `<nav class="guide-tabs ${withIcons ? "guide-tabs--icons" : ""}" aria-label="${escapeHtml(label)}">
    ${items.map((item) => `<button type="button" data-${attribute}="${item.id}" class="${selected === item.id ? "active" : ""}" aria-pressed="${selected === item.id}"${withIcons ? ` aria-label="${escapeHtml(item.name)}" title="${escapeHtml(item.name)}"` : ""} style="--guide-accent:${item.color || "#63ebe4"}">
      ${withIcons && item.icon ? `<img src="${item.icon}" alt="" />` : ""}<span>${escapeHtml(item.name)}</span>
    </button>`).join("")}
  </nav>`;
}

function guidePartnerSectionTemplate(title, references) {
  if (!references?.length) return "";
  if (partnerSkillsError) return `<section class="guide-section"><h2>${escapeHtml(title)}</h2><div class="work-empty work-empty--error"><strong>Données indisponibles</strong><span>Les compétences partenaires n’ont pas pu être chargées.</span><button type="button" data-work-partner-retry>Réessayer</button></div></section>`;
  if (!partnerSkillsData) return `<section class="guide-section"><h2>${escapeHtml(title)}</h2><div class="work-empty"><strong>Chargement des données…</strong></div></section>`;
  const cards = references.map(workPartnerCardTemplate).filter(Boolean).join("");
  return cards ? `<section class="guide-section"><h2>${escapeHtml(title)}</h2><div class="partner-list">${cards}</div></section>` : "";
}

function guidePassiveSectionTemplate(skillIds = []) {
  return skillIds.length ? `<section class="guide-section"><h2>Compétences passives</h2><div class="passive-list">${passiveListTemplate(skillIds)}</div></section>` : "";
}

function guideElementMatrixTemplate() {
  const byId = new Map(guideData.elements.map((element) => [element.id, element]));
  const relation = (ids, empty = "Aucun") => ids.length
    ? ids.map((id) => { const element = byId.get(id); return `<span><img src="${element.icon}" alt="" />${escapeHtml(element.name)}</span>`; }).join("")
    : `<span class="guide-element-card__none">${empty}</span>`;
  return `<section class="guide-element-panel" aria-labelledby="guide-elements-title">
    <header><h2 id="guide-elements-title">Affinités élémentaires</h2><p>Consultez rapidement les forces et faiblesses des neuf éléments.</p></header>
    <div class="guide-element-grid">
      ${guideData.elements.map((element) => `<article class="guide-element-card">
        <span class="guide-element-card__identity"><img src="${element.icon}" alt="" /><strong>${escapeHtml(element.name)}</strong></span>
        <span class="guide-element-card__relation"><small>Fort contre</small>${relation(element.strong)}</span>
        <span class="guide-element-card__relation"><small>Faible contre</small>${relation(element.weak)}</span>
      </article>`).join("")}
    </div>
  </section>`;
}

function guideCombatTemplate() {
  const modes = [{ id: "elements", name: "Éléments" }, { id: "helpers", name: "Aides au combat" }];
  if (selectedGuideCombatMode === "elements") {
    return `${guideTabsTemplate(modes, selectedGuideCombatMode, "guide-combat-mode", "Rubrique de combat")}${guideElementMatrixTemplate()}`;
  }
  const filters = [{ id: "general", name: "Général" }, ...guideData.elements];
  const passives = guideData.combat.passives[selectedGuideCombatFilter] || [];
  const partners = guideData.combat.partners[selectedGuideCombatFilter] || [];
  return `${guideTabsTemplate(modes, selectedGuideCombatMode, "guide-combat-mode", "Rubrique de combat")}
    ${guideTabsTemplate(filters, selectedGuideCombatFilter, "guide-combat-filter", "Filtrer les aides de combat", true)}
    <div class="guide-results">${guidePassiveSectionTemplate(passives)}${guidePartnerSectionTemplate("Pals / compétences partenaires", partners)}</div>`;
}

function guideLootPartners() {
  if (!partnerSkillsData) return [];
  const element = guideData.elements.find((entry) => entry.id === selectedGuideLootElement);
  if (!element) return [];
  const label = `Objets obtenus sur les Pals de ${element.name}`;
  return Object.entries(partnerSkillsData.skills)
    .filter(([pal, skill]) => pal !== "NegativeKoala" && skill.effects?.some((effect) => effect.label === label))
    .map(([pal]) => ({ pal, nonCumulative: true, effects: [{ label }] }));
}

function guideLootSectionTemplate() {
  if (partnerSkillsError) return `<section class="guide-section"><h2>Pals améliorant le loot</h2><div class="work-empty work-empty--error"><strong>Données indisponibles</strong><span>Les compétences partenaires n’ont pas pu être chargées.</span><button type="button" data-work-partner-retry>Réessayer</button></div></section>`;
  if (!partnerSkillsData) return `<section class="guide-section"><h2>Pals améliorant le loot</h2><div class="work-empty"><strong>Chargement des données…</strong></div></section>`;
  const references = guideLootPartners();
  if (!references.length) return `<section class="guide-section"><h2>Pals améliorant le loot</h2><div class="work-empty"><strong>Aucun bonus partenaire répertorié</strong><span>Aucune compétence canonique n’augmente le loot pour cet élément.</span></div></section>`;
  return guidePartnerSectionTemplate("Pals améliorant le loot", references);
}

function guideFarmingTemplate() {
  const tabs = guideData.farming.tabs;
  const current = guideData.farming[selectedGuideFarmingTab] || {};
  const loot = selectedGuideFarmingTab === "loot";
  return `<div class="guide-farming-picker">${guideTabsTemplate(tabs, selectedGuideFarmingTab, "guide-farming-tab", "Objectif de farming", true)}</div>
    ${loot ? guideTabsTemplate(guideData.elements, selectedGuideLootElement, "guide-loot-element", "Type de Pal ciblé", true) : ""}
    <div class="guide-results">
      ${guidePassiveSectionTemplate(current.passives || [])}
      ${loot ? guideLootSectionTemplate() : guidePartnerSectionTemplate("Pals / compétences partenaires", current.partners)}
    </div>`;
}

function guideDirectSectionsTemplate(sections) {
  return `<div class="guide-results">${sections.map((section) => guidePartnerSectionTemplate(section.title, section.partners)).join("")}</div>`;
}

function guideExplorationTemplate() {
  return `${guideTabsTemplate(guideData.exploration.tabs, selectedGuideExplorationTab, "guide-exploration-tab", "Objectif d’exploration")}
    <div class="guide-results">${guidePartnerSectionTemplate("Pals / compétences partenaires", guideData.exploration[selectedGuideExplorationTab])}</div>`;
}

function guidePageTemplate() {
  const category = guideData.categories.find((entry) => entry.id === selectedGuideCategory) || guideData.categories[0];
  const categoryContent = {
    combat: guideCombatTemplate,
    farming: guideFarmingTemplate,
    fishing: () => guideDirectSectionsTemplate(guideData.fishing),
    capture: () => guideDirectSectionsTemplate(guideData.capture),
    exploration: guideExplorationTemplate,
  }[selectedGuideCategory]?.() || "";
  return `<section class="guide-page">
    <header class="guide-header"><p class="eyebrow">${escapeHtml(category.eyebrow)}</p><p>${escapeHtml(category.copy)}</p></header>
    <div class="guide-content">${categoryContent}</div>
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
  return window.SaveCumoir?.template?.() || "";
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
  window.SaveCumoir?.render(!preserveCanvas);
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
    currentView !== "jobs",
  );

  pageEyebrow.textContent = "Guide rapide de la base";
  pageCopy.textContent = "Compare l’efficacité de chaque niveau de capacité de travail, de 1 à 10.";
}

function switchView(nextView) {
  if (nextView === currentView && !content.classList.contains("view-leaving")) {
    render();
    return;
  }
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

function syncViewFromHash() {
  const guideCategoryRoutes = {
    "#guide": "combat", "#combat": "combat", "#guide-combat": "combat", "#guide-farming": "farming",
    "#guide-fishing": "fishing", "#guide-capture": "capture", "#guide-exploration": "exploration",
  };
  if (guideCategoryRoutes[window.location.hash]) selectedGuideCategory = guideCategoryRoutes[window.location.hash];
  const nextView = viewFromHash(window.location.hash);
  if (nextView === "condensation" && currentView !== "condensation") {
    selectedCondensationPalId = null;
    condensationStars = 0;
    condensationQuery = "";
  }
  if (nextView === "breeding" && currentView !== "breeding") breedingQuery = "";
  switchView(nextView);
  window.scrollTo(0, 0);
}

function positionJobTooltip(button) {
  const bounds = button.getBoundingClientRect();
  const margin = 12;
  const tooltipBounds = jobTooltip.getBoundingClientRect();
  const left = Math.min(
    window.innerWidth - tooltipBounds.width / 2 - 10,
    Math.max(tooltipBounds.width / 2 + 10, bounds.left + bounds.width / 2),
  );
  const preferredTop = bounds.top - tooltipBounds.height - margin;
  jobTooltip.style.left = `${left}px`;
  jobTooltip.style.top = `${preferredTop >= 10 ? preferredTop : bounds.bottom + margin}px`;
}

function showJobTooltip(button) {
  if (!button?.dataset.jobTooltip) return;
  jobTooltip.textContent = button.dataset.jobTooltip;
  jobTooltip.hidden = false;
  jobTooltip.dataset.owner = button.dataset.job || button.dataset.workActivity || "";
  positionJobTooltip(button);
}

function hideJobTooltip() {
  jobTooltip.hidden = true;
  jobTooltip.removeAttribute("data-owner");
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
  const activeLink = {
    jobs: singleButton,
    work: workButton,
    guide: combatButton,
    condensation: condensationButton,
    breeding: breedingButton,
    memo: memoButton,
  }[currentView];
  primaryNavLinks.forEach((link) => {
    const active = link === activeLink;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
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

  if (currentView === "work") {
    content.innerHTML = workPageTemplate();
    if (workMode === "partners") ensurePartnerSkills();
    return;
  }

  if (currentView === "guide") {
    content.innerHTML = guidePageTemplate();
    ensurePartnerSkills();
    return;
  }

  if (currentView === "memo") {
    renderMemoPage();
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
  if (event.target.closest("[data-work-partner-retry]")) {
    partnerSkillsError = false;
    partnerSkillsData = null;
    partnerSkillsPromise = null;
    render();
    ensurePartnerSkills();
    return;
  }

  const guideCombatModeButton = event.target.closest("[data-guide-combat-mode]");
  if (guideCombatModeButton) {
    selectedGuideCombatMode = guideCombatModeButton.dataset.guideCombatMode;
    render();
    return;
  }

  const guideCombatButton = event.target.closest("[data-guide-combat-filter]");
  if (guideCombatButton) {
    selectedGuideCombatFilter = guideCombatButton.dataset.guideCombatFilter;
    render();
    return;
  }

  const guideFarmingButton = event.target.closest("[data-guide-farming-tab]");
  if (guideFarmingButton) {
    selectedGuideFarmingTab = guideFarmingButton.dataset.guideFarmingTab;
    render();
    return;
  }

  const guideLootButton = event.target.closest("[data-guide-loot-element]");
  if (guideLootButton) {
    selectedGuideLootElement = guideLootButton.dataset.guideLootElement;
    render();
    return;
  }

  const guideExplorationButton = event.target.closest("[data-guide-exploration-tab]");
  if (guideExplorationButton) {
    selectedGuideExplorationTab = guideExplorationButton.dataset.guideExplorationTab;
    render();
    return;
  }

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

  const workModeButton = event.target.closest("[data-work-mode]");
  if (workModeButton) {
    workMode = workModeButton.dataset.workMode;
    render();
    return;
  }

  const workActivityButton = event.target.closest("[data-work-activity]");
  if (workActivityButton) {
    if (workMode === "partners") selectedWorkPartnerActivityId = workActivityButton.dataset.workActivity;
    else selectedWorkPassiveJobId = workActivityButton.dataset.workActivity;
    render();
    return;
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

document.addEventListener("pointerover", (event) => {
  const button = event.target.closest("[data-job-tooltip]");
  if (button && !button.contains(event.relatedTarget)) showJobTooltip(button);
});

document.addEventListener("pointerout", (event) => {
  const button = event.target.closest("[data-job-tooltip]");
  if (button && !button.contains(event.relatedTarget)) hideJobTooltip();
});

document.addEventListener("focusin", (event) => {
  const button = event.target.closest("[data-job-tooltip]");
  if (button) showJobTooltip(button);
});

document.addEventListener("focusout", (event) => {
  if (event.target.closest("[data-job-tooltip]")) hideJobTooltip();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") hideJobTooltip();
});

window.addEventListener("hashchange", syncViewFromHash);
window.addEventListener("DOMContentLoaded", () => {
  syncViewFromHash();
}, { once: true });
