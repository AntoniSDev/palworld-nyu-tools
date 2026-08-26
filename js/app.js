const speedA = [50, 80, 140, 240, 400, 680, 1100, 1900, 3200, 5400];
const speedB = [50, 70, 100, 140, 190, 260, 370, 510, 720, 1000];
const iconRoot = "https://cdn.paldb.cc/image/Pal/Texture/UI/InGame/T_icon_palwork_";

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

const picker = document.querySelector("#job-picker");
const content = document.querySelector("#content");
const singleButton = document.querySelector("#single-view");
const allButton = document.querySelector("#all-view");
const infoButton = document.querySelector("#info-view");
const printButton = document.querySelector("#print-view");
const formatter = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });

let selectedId = jobs[0].id;
let showAll = false;
let showInfo = false;

function tableTemplate(job, compact = false) {
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
    <article class="work-card ${compact ? "work-card--compact" : ""}">
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
        ${compact ? "" : `<p class="work-card__note">${job.note}</p>`}
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
          class="${selectedId === job.id && !showAll ? "selected" : ""}"
          aria-pressed="${selectedId === job.id && !showAll}"
          style="--job-color:${job.color}"
        >
          <img src="${job.icon}" alt="" />
          <span>${job.shortName}</span>
        </button>`,
    )
    .join("");
}

function render() {
  renderPicker();
  singleButton.classList.toggle("active", !showAll && !showInfo);
  allButton.classList.toggle("active", showAll);
  infoButton.classList.toggle("active", showInfo);
  printButton.classList.toggle("hidden", !showAll);
  picker.classList.toggle("hidden", showInfo);

  if (showInfo) {
    content.innerHTML = `
      <section class="info-card" aria-labelledby="info-title">
        <p class="eyebrow">Mécaniques de Palworld</p>
        <h2 id="info-title">Infos utiles</h2>
        <h3>Condensation des Pals</h3>
        <p>La condensation renforce un Pal en utilisant d’autres Pals de la même espèce. Chaque palier ajoute une étoile et améliore une ou plusieurs de ses aptitudes de travail.</p>
        <div class="condensation-steps">
          <div><strong>1★</strong><span>4 Pals</span><p>+1 à sa meilleure aptitude de travail.</p></div>
          <div><strong>2★</strong><span>8 Pals</span><p>+1 à sa deuxième meilleure aptitude.</p></div>
          <div><strong>3★</strong><span>12 Pals</span><p>+1 à sa troisième meilleure aptitude.</p></div>
          <div><strong>4★</strong><span>24 Pals</span><p>+1 à toutes ses aptitudes de travail.</p></div>
        </div>
        <p class="info-card__note">Il faut donc 48 Pals au total pour atteindre 4★. Les quantités indiquées correspondent au coût de chaque palier.</p>
      </section>`;
    return;
  }

  if (showAll) {
    content.innerHTML = `<section class="all-tables" aria-label="Toutes les aptitudes">
      ${jobs.map((job) => tableTemplate(job, true)).join("")}
    </section>`;
    return;
  }

  const selectedJob = jobs.find((job) => job.id === selectedId) || jobs[0];
  content.innerHTML = `<section class="single-table">${tableTemplate(selectedJob)}</section>`;
}

picker.addEventListener("click", (event) => {
  const button = event.target.closest("[data-job]");
  if (!button) return;
  selectedId = button.dataset.job;
  showAll = false;
  showInfo = false;
  render();
});

singleButton.addEventListener("click", () => {
  showAll = false;
  showInfo = false;
  render();
});

allButton.addEventListener("click", () => {
  showAll = true;
  showInfo = false;
  render();
});

infoButton.addEventListener("click", () => {
  showAll = false;
  showInfo = true;
  render();
});

printButton.addEventListener("click", () => window.print());

render();
