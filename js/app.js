const speedA = [50, 80, 140, 240, 400, 680, 1100, 1900, 3200, 5400];
const speedB = [50, 70, 100, 140, 190, 260, 370, 510, 720, 1000];
const iconRoot = "assets/work-suitabilities/";

const jobs = [
  {
    id: "kindling",
    name: "Allumage de feu",
    shortName: "Allumage",
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
    shortName: "Énergie",
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
    rarity: "world-tree",
    source: "Arbre-Monde",
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
    rarity: "world-tree",
    source: "Arbre-Monde",
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
    "remarkableCraftsmanship",
    "lucky",
    "vampiric",
    "artisan",
    "nocturnal",
    "workSlave",
    "serious",
  ],
  transport: [
    "worldTraverser",
    "swift",
    "legend",
    "vampiric",
    "masteryOfFasting",
    "runner",
    "nocturnal",
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

const passiveJobNames = {
  handiwork: "Travaux manuels",
  farming: "Ferme",
};

const passiveJobs = jobs.map((job) => ({
  ...job,
  displayName: passiveJobNames[job.id] || job.name,
  group: job.id === "transport" ? "transport" : job.id === "farming" ? "farming" : "classic",
}));

const picker = document.querySelector("#job-picker");
const content = document.querySelector("#content");
const brand = document.querySelector(".brand");
const singleButton = document.querySelector("#single-view");
const passiveButton = document.querySelector("#passive-view");
const infoButton = document.querySelector("#info-view");
const pageEyebrow = document.querySelector("#page-eyebrow");
const pageTitle = document.querySelector("#page-title");
const pageCopy = document.querySelector("#page-copy");
const formatter = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });

let selectedId = jobs[0].id;
let selectedPassiveJobId = jobs[0].id;
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
          <div>
            <p>Aptitude de travail</p>
            <h2>${job.name}</h2>
          </div>
        </div>
        <p class="work-card__note"><span>Rôle</span>${job.note}</p>
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
  const source = skill.source ? `<span class="passive-skill__source">${skill.source}</span>` : "";

  return `
    <article class="passive-skill passive-skill--${skill.rarity}">
      <header class="passive-skill__header">
        <span class="passive-skill__rarity" aria-hidden="true"></span>
        <h3>${skill.name}</h3>
        ${source}
      </header>
      <div class="passive-skill__effects">
        ${skill.effects.map((effect) => `<p>${effect}</p>`).join("")}
      </div>
      ${skill.note ? `<p class="passive-skill__note">${skill.note}</p>` : ""}
    </article>`;
}

function passivePageTemplate() {
  const selectedJob = passiveJobs.find((job) => job.id === selectedPassiveJobId) || passiveJobs[0];
  const skillIds = passiveGroups[selectedJob.group];
  const context =
    selectedJob.group === "transport"
      ? "La Vitesse de travail n’améliore pas le Transport : privilégiez la vitesse de déplacement et l’autonomie."
      : selectedJob.group === "farming"
        ? "La Ferme bénéficie de ses passifs dédiés et des bonus de Vitesse de travail."
        : "Ces passifs améliorent la Vitesse de travail ou permettent de poursuivre l’activité la nuit.";

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
                <span>${job.displayName}</span>
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
            <h2 id="passive-result-title">${selectedJob.displayName}</h2>
            <span>${context}</span>
          </div>
        </header>
        <div class="passive-list">
          ${skillIds.map(passiveSkillTemplate).join("")}
        </div>
      </div>
    </section>`;
}

function updateIntro() {
  if (currentView === "passives") {
    pageEyebrow.textContent = "Aide à la Palbox";
    pageTitle.textContent = "Compétences passives";
    pageCopy.textContent =
      "Sélectionnez une capacité de travail pour afficher les compétences passives intéressantes pour les Pals affectés à cette tâche.";
    return;
  }

  pageEyebrow.textContent = "Guide rapide de la base";
  pageTitle.textContent = "Aptitudes de travail";
  pageCopy.textContent = "Compare immédiatement ce que produit chaque niveau, de 1 à 10.";
}

function render() {
  renderPicker();
  updateIntro();
  singleButton.classList.toggle("active", currentView === "jobs");
  passiveButton.classList.toggle("active", currentView === "passives");
  infoButton.classList.toggle("active", currentView === "info");
  picker.classList.toggle("hidden", currentView !== "jobs");

  if (currentView === "info") {
    content.innerHTML = `
      <section class="info-card" aria-labelledby="info-title">
        <p class="eyebrow">Mécaniques de Palworld</p>
        <h2 id="info-title">Infos utiles</h2>
        <h3>Condensation des Pals</h3>
        <p>La condensation renforce un Pal en utilisant d’autres Pals de la même espèce. Chaque palier ajoute une étoile et améliore une ou plusieurs de ses aptitudes de travail.</p>
        <div class="condensation-steps">
          <div><strong>1★</strong><span>4 Pals</span><p>+1 à son aptitude de travail prioritaire.</p></div>
          <div><strong>2★</strong><span>8 Pals</span><p>+1 à sa deuxième aptitude de travail prioritaire.</p></div>
          <div><strong>3★</strong><span>12 Pals</span><p>+1 à sa troisième aptitude de travail prioritaire.</p></div>
          <div><strong>4★</strong><span>24 Pals</span><p>+1 à toutes ses aptitudes de travail.</p></div>
        </div>
        <p class="info-card__note">Il faut donc 48 Pals au total pour atteindre 4★. Les quantités indiquées correspondent au coût de chaque palier.</p>
      </section>`;
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
  const button = event.target.closest("[data-passive-job]");
  if (!button) return;
  selectedPassiveJobId = button.dataset.passiveJob;
  render();
});

brand.addEventListener("click", () => {
  currentView = "jobs";
  render();
});

singleButton.addEventListener("click", () => {
  currentView = "jobs";
  render();
});

passiveButton.addEventListener("click", () => {
  currentView = "passives";
  render();
});

infoButton.addEventListener("click", () => {
  currentView = "info";
  render();
});

render();
