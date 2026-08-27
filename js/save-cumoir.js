/* Palworld Nyu Tools — Cumoir avec sauvegarde locale. GPL-3.0. */
(() => {
  "use strict";

  const MODE_KEY = "palworld-nyu-tools:cumoir-source";
  const STATE_KEY = "palworld-nyu-tools:cumoir-save-state-v1";
  const DB_NAME = "palworld-nyu-tools";
  const DB_STORE = "cumoir-save";
  const content = document.querySelector("#content");
  const passives = window.PALWORLD_PASSIVES || [];
  const passiveById = new Map(passives.map((passive) => [passive.id, passive]));
  const breedingRaw = window.BREEDING_DATA || { pals: [], children: [], genderCombos: [] };
  const species = breedingRaw.pals.map(([id, name, portrait, order]) => ({ id, name, portrait, order }));
  const speciesById = new Map(species.map((pal) => [pal.id.toLowerCase(), pal]));
  const condensation = window.CONDENSATION_PALS || [];
  const condensationByCode = new Map(condensation.map((pal) => [String(pal.code).toLowerCase(), pal]));
  const allAvailable = new Set();

  let mode = localStorage.getItem(MODE_KEY) === "save" ? "save" : "manual";
  let roster = [];
  let activeWorld = null;
  let pendingWorlds = [];
  let parsing = false;
  let progress = "";
  let error = "";
  let query = "";
  let passiveQuery = "";
  let passiveModalOpen = false;
  let worldModalOpen = false;
  let selectionSlot = "parentA";
  let solveTimer = 0;
  let graph = null;

  const state = loadState();

  function loadState() {
    const fallback = {
      calculation: "parents",
      parentA: null,
      parentB: null,
      target: null,
      selectedPassives: [],
      forced: [],
    };
    try {
      const saved = JSON.parse(localStorage.getItem(STATE_KEY) || "null");
      if (!saved || typeof saved !== "object") return fallback;
      return {
        ...fallback,
        calculation: saved.calculation === "target" ? "target" : "parents",
        parentA: typeof saved.parentA === "string" ? saved.parentA : null,
        parentB: typeof saved.parentB === "string" ? saved.parentB : null,
        target: typeof saved.target === "string" ? saved.target : null,
        selectedPassives: Array.isArray(saved.selectedPassives) ? saved.selectedPassives.filter((id) => passiveById.has(id)).slice(0, 4) : [],
        forced: Array.isArray(saved.forced) ? saved.forced.filter((id) => typeof id === "string").slice(0, 2) : [],
      };
    } catch {
      return fallback;
    }
  }

  function saveState() {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character]);
  }

  function normalize(value) {
    return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  function palInfo(id) {
    if (!id) return null;
    const key = String(id).replace(/^BOSS_/i, "").toLowerCase();
    const breeding = speciesById.get(key);
    const details = condensationByCode.get(key);
    return breeding ? { ...breeding, number: details?.number ?? null, elements: details?.elements || [] } : null;
  }

  function passiveInfo(id) {
    return passiveById.get(id) || { id, name: id, effect: "Effet non localisé", rank: 0 };
  }

  function passiveClass(rank) {
    if (rank >= 5) return "save-passive--world-tree";
    if (rank >= 4) return "save-passive--legendary";
    if (rank >= 3) return "save-passive--rare";
    if (rank < 0) return "save-passive--negative";
    return "save-passive--common";
  }

  function passiveChip(id, removable = false) {
    const passive = passiveInfo(id);
    const title = `${passive.name}\n${passive.effect}`;
    return `<span class="save-passive ${passiveClass(passive.rank)}" title="${escapeHtml(title)}" data-passive-id="${escapeHtml(id)}">
      <span>${escapeHtml(passive.name)}</span>${removable ? `<button type="button" data-remove-passive="${escapeHtml(id)}" aria-label="Retirer ${escapeHtml(passive.name)}">×</button>` : ""}
    </span>`;
  }

  function sexSymbol(sex) {
    return sex === "Male" ? "♂" : sex === "Female" ? "♀" : "?";
  }

  function dbOpen() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(DB_STORE);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function dbGet() {
    const db = await dbOpen();
    return new Promise((resolve, reject) => {
      const request = db.transaction(DB_STORE).objectStore(DB_STORE).get("active");
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    }).finally(() => db.close());
  }

  async function dbPut(value) {
    const db = await dbOpen();
    return new Promise((resolve, reject) => {
      const request = db.transaction(DB_STORE, "readwrite").objectStore(DB_STORE).put(value, "active");
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    }).finally(() => db.close());
  }

  async function dbDelete() {
    const db = await dbOpen();
    return new Promise((resolve, reject) => {
      const request = db.transaction(DB_STORE, "readwrite").objectStore(DB_STORE).delete("active");
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    }).finally(() => db.close());
  }

  function persistMode(next) {
    mode = next;
    localStorage.setItem(MODE_KEY, next);
  }

  function sourceSwitch() {
    return `<div class="breeding-source" role="group" aria-label="Source des Pals">
      <span>Source des Pals</span>
      <div><button type="button" data-cumoir-source="manual" aria-pressed="${mode === "manual"}">Manuel</button><button type="button" data-cumoir-source="save" aria-pressed="${mode === "save"}">Sauvegarde</button></div>
    </div>`;
  }

  function currentRoster() {
    const selected = new Set(state.selectedPassives);
    return roster.slice().sort((a, b) => {
      if (selected.size) {
        const aScore = a.passives.filter((id) => selected.has(id)).length;
        const bScore = b.passives.filter((id) => selected.has(id)).length;
        if (aScore !== bScore) return bScore - aScore;
      }
      const aPal = palInfo(a.speciesId);
      const bPal = palInfo(b.speciesId);
      return (Number(aPal?.number) || 9999) - (Number(bPal?.number) || 9999) || (aPal?.name || a.speciesId).localeCompare(bPal?.name || b.speciesId, "fr") || a.id.localeCompare(b.id);
    });
  }

  function rosterCard(individual) {
    const pal = palInfo(individual.speciesId);
    if (!pal) return "";
    const selected = state.parentA === individual.id || state.parentB === individual.id || state.forced.includes(individual.id);
    const forcedIndex = state.forced.indexOf(individual.id);
    return `<button type="button" class="save-pal-card${selected ? " save-pal-card--selected" : ""}" data-save-pal="${escapeHtml(individual.id)}">
      <img src="${escapeHtml(pal.portrait)}" alt="" loading="lazy" />
      <span class="save-pal-card__body"><span class="save-pal-card__name"><strong>${escapeHtml(pal.name)}</strong><small>Niv. ${individual.level} · <b class="save-pal-card__sex save-pal-card__sex--${individual.sex.toLowerCase()}">${sexSymbol(individual.sex)}</b></small></span>
      <span class="save-pal-card__passives">${individual.passives.map((id) => passiveChip(id)).join("")}</span></span>
      ${forcedIndex >= 0 ? `<i class="save-pal-card__forced">Source ${forcedIndex + 1}</i>` : ""}
    </button>`;
  }

  function rosterList() {
    const search = normalize(query);
    if (state.calculation === "target" && selectionSlot === "target") {
      const targets = species.filter((pal) => !search || normalize(pal.name).includes(search));
      return targets.map((pal) => `<button type="button" class="save-pal-card save-target-card" data-save-target="${escapeHtml(pal.id)}"><img src="${escapeHtml(pal.portrait)}" alt="" loading="lazy" /><span class="save-pal-card__body"><span class="save-pal-card__name"><strong>${escapeHtml(pal.name)}</strong></span><small>Choisir comme cible</small></span></button>`).join("");
    }
    const matches = currentRoster().filter((individual) => {
      const pal = palInfo(individual.speciesId);
      return pal && (!search || normalize(pal.name).includes(search));
    });
    return matches.length ? matches.map(rosterCard).join("") : `<p class="save-roster__empty">Aucun Pal trouvé.</p>`;
  }

  function importEmpty() {
    return `<div class="save-import-empty">
      <div class="save-import-empty__icon" aria-hidden="true">⇩</div>
      <strong>Importez votre sauvegarde Steam</strong>
      <p>Tout est lu localement dans votre navigateur. Aucun fichier n’est envoyé.</p>
      <button type="button" class="save-primary" data-import-save>Importer une sauvegarde</button>
      <small>1. Ouvrez le sélecteur · 2. Choisissez le dossier <code>SaveGames</code> · 3. Sélectionnez votre monde</small>
      <input class="save-file-input" data-save-directory type="file" webkitdirectory directory multiple />
    </div>`;
  }

  function worldStatus() {
    const player = activeWorld?.players?.[0];
    return `<div class="save-world-status">
      <div><small>Sauvegarde active</small><strong>${escapeHtml(activeWorld?.label || "Monde Palworld")}</strong><span>${player ? `${escapeHtml(player.name)} · niveau ${player.level} · ` : ""}${roster.length.toLocaleString("fr-FR")} Pals</span></div>
      <div><button type="button" data-import-save>Mettre à jour</button><button type="button" class="save-danger" data-delete-save>Supprimer</button></div>
      <input class="save-file-input" data-save-directory type="file" webkitdirectory directory multiple />
    </div>`;
  }

  function targetPicker() {
    const target = palInfo(state.target);
    return `<div class="save-target-picker">
      <span class="eyebrow">Pal cible</span>
      <button type="button" data-open-target>${target ? `<img src="${target.portrait}" alt="" /><strong>${escapeHtml(target.name)}</strong>` : `<b>+</b><strong>Choisir une espèce</strong>`}</button>
    </div>`;
  }

  function passivesPanel() {
    return `<section class="save-passive-goal">
      <div><span class="eyebrow">Passifs désirés</span><small>${state.selectedPassives.length}/4</small></div>
      <button type="button" class="save-passive-button" data-open-passives>✦ Choisir les passifs</button>
      <div class="save-passive-goal__chips">${state.selectedPassives.length ? state.selectedPassives.map((id) => passiveChip(id, true)).join("") : `<span class="save-passive-goal__hint">Facultatif — jusqu’à quatre passifs présents dans la sauvegarde.</span>`}</div>
    </section>`;
  }

  function selectionSummary() {
    if (state.calculation === "target") {
      return `${targetPicker()}${passivesPanel()}<p class="save-forced-help">Cliquez sur une carte du roster pour forcer jusqu’à deux sources. Sans sélection, le Cumoir choisit automatiquement.</p>`;
    }
    const a = roster.find((pal) => pal.id === state.parentA);
    const b = roster.find((pal) => pal.id === state.parentB);
    const card = (individual, slot, label) => {
      const pal = individual && palInfo(individual.speciesId);
      return `<button type="button" class="save-parent-slot${selectionSlot === slot ? " save-parent-slot--active" : ""}" data-save-slot="${slot}">${pal ? `<img src="${pal.portrait}" alt=""><span><small>${label}</small><strong>${escapeHtml(pal.name)}</strong><b>${sexSymbol(individual.sex)} · Niv. ${individual.level}</b><em>${individual.passives.map((id) => escapeHtml(passiveInfo(id).name)).join(" · ")}</em></span>` : `<b>+</b><span><small>${label}</small><strong>Choisir un Pal</strong></span>`}</button>`;
    };
    return `<div class="save-parent-slots">${card(a, "parentA", "Parent A")}${card(b, "parentB", "Parent B")}</div>${passivesPanel()}`;
  }

  function modalTemplates() {
    return `${worldModalOpen ? worldModal() : ""}${passiveModalOpen ? passiveModal() : ""}`;
  }

  function worldModal() {
    return `<div class="save-modal-backdrop" data-close-world-modal><section class="save-modal save-world-modal" role="dialog" aria-modal="true" aria-labelledby="world-modal-title">
      <header><div><span class="eyebrow">Sauvegardes détectées</span><h2 id="world-modal-title">Choisir le monde</h2></div><button type="button" data-close-world-modal aria-label="Fermer">×</button></header>
      <div class="save-world-list">${pendingWorlds.map((world, index) => `<button type="button" data-world-index="${index}"><span class="save-world-list__icon">◈</span><span><strong>${escapeHtml(world.label)}</strong><small>${new Date(world.modified).toLocaleString("fr-FR")} · ${(world.level.size / 1024 / 1024).toFixed(1)} Mo</small><em>${world.players.length} fichier${world.players.length > 1 ? "s" : ""} joueur</em></span><b>Importer ce monde</b></button>`).join("")}</div>
    </section></div>`;
  }

  function passiveModal() {
    const search = normalize(passiveQuery);
    const rows = passives.filter((passive) => !search || normalize(passive.name).includes(search));
    return `<div class="save-modal-backdrop" data-close-passive-modal><section class="save-modal save-passive-modal" role="dialog" aria-modal="true" aria-labelledby="passive-modal-title">
      <header><div><span class="eyebrow">Objectif d’élevage</span><h2 id="passive-modal-title">Compétences passives</h2></div><button type="button" data-close-passive-modal aria-label="Fermer">×</button></header>
      <div class="save-passive-modal__tools"><input type="search" data-passive-search placeholder="Rechercher un passif…" value="${escapeHtml(passiveQuery)}" autofocus /><span>${state.selectedPassives.length}/4</span><button type="button" data-clear-passives>Tout effacer</button></div>
      <div class="save-passive-list">${rows.map((passive) => {
        const available = allAvailable.has(passive.id);
        const selected = state.selectedPassives.includes(passive.id);
        return `<button type="button" data-toggle-passive="${escapeHtml(passive.id)}" class="${passiveClass(passive.rank)}${selected ? " is-selected" : ""}" ${available ? "" : "disabled"} title="${escapeHtml(`${passive.name}\n${passive.effect}`)}"><span><strong>${escapeHtml(passive.name)}</strong><small>${escapeHtml(passive.effect)}</small></span><i>${selected ? "✓" : available ? "+" : "—"}</i></button>`;
      }).join("")}</div>
      <footer><span>${rows.length} compétence${rows.length > 1 ? "s" : ""}</span><button type="button" class="save-primary" data-close-passive-modal>Terminer</button></footer>
    </section></div>`;
  }

  function template() {
    const graphMarkup = graphTemplate();
    return `<section class="breeding-page breeding-page--save" aria-label="Cumoir avec sauvegarde">
      <header class="breeding-page__header"><p class="eyebrow">Planificateur d’élevage</p><p>Le Cumoir travaille avec les Pals réellement présents dans votre sauvegarde.</p></header>
      ${sourceSwitch()}
      ${activeWorld ? worldStatus() : importEmpty()}
      ${parsing ? `<div class="save-progress"><span></span>${escapeHtml(progress || "Lecture de la sauvegarde…")}</div>` : ""}
      ${error ? `<div class="save-error">${escapeHtml(error)}</div>` : ""}
      ${activeWorld ? `<div class="breeding-layout breeding-layout--save">
        <aside class="breeding-panel save-breeding-panel">
          <div class="breeding-panel__heading"><p class="eyebrow">Calcul</p><button type="button" class="breeding-reset" data-save-reset>Réinitialiser</button></div>
          <div class="breeding-role" role="group" aria-label="Type de calcul"><button type="button" data-save-calculation="parents" aria-pressed="${state.calculation === "parents"}">Deux parents</button><button type="button" data-save-calculation="target" aria-pressed="${state.calculation === "target"}">Pal cible</button></div>
          ${selectionSummary()}
          <label class="breeding-search"><span>Rechercher un Pal</span><span class="pal-search__field"><input data-save-search type="search" placeholder="Nom du Pal…" value="${escapeHtml(query)}" autocomplete="off" /><i class="breeding-search__icon"></i></span></label>
          <div class="save-roster" data-save-roster>${rosterList()}</div>
        </aside>
        <section class="breeding-canvas" data-save-viewport aria-label="Arbre généalogique interactif"><div class="breeding-canvas__tip">Molette : zoom · Cliquer-glisser : déplacer</div><div class="breeding-canvas__summary">${escapeHtml(graph?.summary || "Arbre généalogique")}</div>${graphMarkup}</section>
      </div>` : ""}
      ${modalTemplates()}
    </section>`;
  }

  function eggKind(palId) {
    const element = palInfo(palId)?.elements?.[0] || "Neutre";
    return ({
      Feu: ["fire_01", "Œuf brûlant"],
      Eau: ["water_01", "Œuf humide"],
      Ténèbres: ["dark_01", "Œuf sombre"],
      Dragon: ["dragon_01", "Œuf draconique"],
      Électricité: ["electricity_01", "Œuf électrique"],
      Glace: ["ice_01", "Œuf gelé"],
      Terre: ["earth_01", "Œuf rocailleux"],
      Plante: ["leaf_01", "Œuf verdoyant"],
      Neutre: ["", "Œuf commun"],
    })[element] || ["", "Œuf commun"];
  }

  function treeToGraph(root) {
    const nodes = [];
    const edges = [];
    let leafCursor = 0;
    function visit(node, depth = 0) {
      const key = `node-${nodes.length}`;
      if (!node.parents) {
        nodes.push({ key, node, x: leafCursor++ * 205, depth });
        return key;
      }
      const a = visit(node.parents[0], depth + 1);
      const b = visit(node.parents[1], depth + 1);
      const left = nodes.find((entry) => entry.key === a);
      const right = nodes.find((entry) => entry.key === b);
      nodes.push({ key, node, x: (left.x + right.x) / 2, depth });
      edges.push([a, key], [b, key]);
      return key;
    }
    visit(root);
    const maxDepth = Math.max(...nodes.map((node) => node.depth), 0);
    nodes.forEach((node) => { node.y = node.depth * 178 + 30; node.x += 55; });
    return { nodes, edges, width: Math.max(500, leafCursor * 205 + 110), height: (maxDepth + 1) * 178 + 130 };
  }

  function graphTemplate() {
    if (!graph?.root) return `<div class="breeding-canvas__empty"><span aria-hidden="true">⌁</span><p>${escapeHtml(graph?.error || (state.calculation === "target" ? "Choisissez un Pal cible pour calculer une route." : "Choisissez deux individus de votre sauvegarde."))}</p></div>`;
    const layout = treeToGraph(graph.root);
    const nodeByKey = new Map(layout.nodes.map((entry) => [entry.key, entry]));
    const paths = layout.edges.map(([fromKey, toKey]) => {
      const from = nodeByKey.get(fromKey); const to = nodeByKey.get(toKey);
      const sx = from.x + 76; const sy = from.y; const ex = to.x + 76; const ey = to.y + 112; const mid = (sy + ey) / 2;
      return `<path d="M ${sx} ${sy} C ${sx} ${mid}, ${ex} ${mid}, ${ex} ${ey}" />`;
    }).join("");
    const nodes = layout.nodes.map(({ node, x, y }) => {
      const pal = palInfo(node.speciesId); if (!pal) return "";
      const final = node === graph.root;
      const useful = state.selectedPassives.filter((id) => (node.mask & (1 << state.selectedPassives.indexOf(id))) !== 0);
      const [eggSuffix, eggName] = eggKind(node.speciesId);
      const eggAsset = `assets/eggs/t_itemicon_material_palegg${eggSuffix ? `_${eggSuffix}` : ""}.webp`;
      return `<article class="breeding-node save-tree-node${final ? " save-tree-node--final" : ""}" style="left:${x}px;top:${y}px">
        ${node.owned ? "" : `<span class="save-egg" title="À obtenir par reproduction · ${escapeHtml(eggName)}"><img src="${eggAsset}" alt="${escapeHtml(eggName)}" /></span>`}
        <span class="breeding-node__portrait"><img src="${pal.portrait}" alt="" /></span><strong>${escapeHtml(pal.name)}</strong>${node.sex ? `<b class="breeding-node__sex">${sexSymbol(node.sex)}</b>` : ""}
        ${useful.length ? `<span class="save-tree-node__passives">${useful.map((id) => passiveChip(id)).join("")}</span>` : ""}
      </article>`;
    }).join("");
    return `<div class="breeding-canvas__world" data-save-world><div class="breeding-tree" data-save-tree style="width:${layout.width}px;height:${layout.height}px"><svg class="breeding-tree__links" width="${layout.width}" height="${layout.height}" viewBox="0 0 ${layout.width} ${layout.height}">${paths}</svg>${nodes}</div></div>`;
  }

  function pairIndex(a, b) {
    const low = Math.min(a, b); const high = Math.max(a, b);
    return low * species.length - (low * (low - 1)) / 2 + high - low;
  }

  function childFor(aId, bId, sexA = null, sexB = null) {
    const a = speciesById.get(String(aId).toLowerCase());
    const b = speciesById.get(String(bId).toLowerCase());
    if (!a || !b) return null;
    let hasGenderRule = false;
    for (const combo of breedingRaw.genderCombos || []) {
      let expectedA; let expectedB; let childIndex;
      if (combo[0] === a.order && combo[2] === b.order) {
        expectedA = combo[1] === "M" ? "Male" : "Female";
        expectedB = combo[3] === "M" ? "Male" : "Female";
        childIndex = combo[4];
      } else if (combo[0] === b.order && combo[2] === a.order) {
        expectedA = combo[3] === "M" ? "Male" : "Female";
        expectedB = combo[1] === "M" ? "Male" : "Female";
        childIndex = combo[4];
      } else continue;
      hasGenderRule = true;
      if ((!sexA || sexA === "Unknown" || sexA === expectedA) && (!sexB || sexB === "Unknown" || sexB === expectedB)) return species[childIndex]?.id || null;
    }
    if (hasGenderRule && sexA && sexB) return null;
    const childIndex = breedingRaw.children[pairIndex(a.order, b.order)];
    return childIndex >= 0 ? species[childIndex]?.id || null : null;
  }

  function maskFor(individual) {
    return state.selectedPassives.reduce((mask, id, index) => individual.passives.includes(id) ? mask | (1 << index) : mask, 0);
  }

  function stateScore(item) {
    return item.newCount * 10000 + item.generation * 100 + item.parasites * 3 + item.speciesId.toLowerCase().charCodeAt(0);
  }

  function solveTarget() {
    const target = palInfo(state.target);
    if (!target) return { error: "Choisissez un Pal cible pour calculer une route." };
    const fullMask = (1 << state.selectedPassives.length) - 1;
    const forcedBits = new Map(state.forced.map((id, index) => [id, 1 << index]));
    const allForced = (1 << state.forced.length) - 1;
    const existing = roster.filter((individual) => individual.speciesId.toLowerCase() === target.id.toLowerCase() && (maskFor(individual) & fullMask) === fullMask && (!state.forced.length || state.forced.every((id) => id === individual.id)));
    if (existing.length) {
      const individual = existing.sort((a, b) => a.passives.length - b.passives.length || b.level - a.level)[0];
      return { summary: "Déjà présent dans votre sauvegarde", root: { speciesId: target.id, mask: fullMask, owned: true, sex: individual.sex, individualId: individual.id } };
    }

    const seeds = roster.map((individual) => ({
      speciesId: palInfo(individual.speciesId)?.id,
      mask: maskFor(individual),
      forcedMask: forcedBits.get(individual.id) || 0,
      generation: 0,
      newCount: 0,
      parasites: individual.passives.filter((id) => !state.selectedPassives.includes(id)).length,
      owned: true,
      sex: individual.sex,
      individualId: individual.id,
    })).filter((item) => item.speciesId);
    if (!seeds.length) return { error: "Aucun Pal compatible n’a été trouvé dans cette sauvegarde." };

    const best = new Map();
    const accept = (item) => {
      const key = `${item.speciesId}|${item.mask}|${item.forcedMask}`;
      const previous = best.get(key);
      if (!previous || stateScore(item) < stateScore(previous)) { best.set(key, item); return true; }
      return false;
    };
    seeds.forEach(accept);
    let frontier = Array.from(best.values()).sort((a, b) => stateScore(a) - stateScore(b)).slice(0, 420);
    let answer = null;
    for (let round = 1; round <= 5 && !answer; round++) {
      const pool = Array.from(best.values()).sort((a, b) => stateScore(a) - stateScore(b)).slice(0, 520);
      const next = [];
      for (const a of frontier) {
        for (const b of pool) {
          if (a === b && a.owned) continue;
          if (a.owned && b.owned && a.sex !== "Unknown" && b.sex !== "Unknown" && a.sex === b.sex) continue;
          const child = childFor(a.speciesId, b.speciesId, a.sex, b.sex); if (!child) continue;
          const item = {
            speciesId: child,
            mask: a.mask | b.mask,
            forcedMask: a.forcedMask | b.forcedMask,
            generation: Math.max(a.generation, b.generation) + 1,
            newCount: a.newCount + b.newCount + 1,
            parasites: a.parasites + b.parasites,
            owned: false,
            sex: null,
            parents: [a, b],
          };
          if (accept(item)) next.push(item);
          if (child.toLowerCase() === target.id.toLowerCase() && item.mask === fullMask && item.forcedMask === allForced) {
            if (!answer || stateScore(item) < stateScore(answer)) answer = item;
          }
        }
      }
      frontier = next.sort((a, b) => stateScore(a) - stateScore(b)).slice(0, 420);
      if (!frontier.length) break;
    }
    return answer ? { summary: `${answer.generation} génération${answer.generation > 1 ? "s" : ""} · ${answer.newCount} Pal${answer.newCount > 1 ? "s" : ""} à obtenir`, root: answer } : { error: "Aucune route valide trouvée avec cette sauvegarde." };
  }

  function solveDirect() {
    const a = roster.find((pal) => pal.id === state.parentA);
    const b = roster.find((pal) => pal.id === state.parentB);
    if (!a || !b) return { error: "Choisissez deux individus de votre sauvegarde." };
    if (a.sex !== "Unknown" && b.sex !== "Unknown" && a.sex === b.sex) return { error: "Un couple doit comporter un Pal mâle et un Pal femelle." };
    const child = childFor(a.speciesId, b.speciesId, a.sex, b.sex);
    if (!child) return { error: "Aucun croisement valide pour ces deux individus." };
    const selectedMask = maskFor(a) | maskFor(b);
    return { summary: "Croisement direct", root: { speciesId: child, mask: selectedMask, owned: false, parents: [
      { speciesId: palInfo(a.speciesId).id, mask: maskFor(a), owned: true, sex: a.sex, individualId: a.id },
      { speciesId: palInfo(b.speciesId).id, mask: maskFor(b), owned: true, sex: b.sex, individualId: b.id },
    ] } };
  }

  function scheduleSolve(immediate = false) {
    clearTimeout(solveTimer);
    const run = () => {
      graph = activeWorld ? (state.calculation === "target" ? solveTarget() : solveDirect()) : null;
      render(true);
    };
    solveTimer = setTimeout(run, immediate ? 0 : 80);
  }

  function render(fit = true) {
    if (mode !== "save" || !content || document.querySelector("#breeding-view")?.classList.contains("active") !== true) return;
    content.innerHTML = template();
    bindCanvas(fit);
    const search = content.querySelector("[data-passive-search]");
    if (passiveModalOpen && search) { search.focus(); search.setSelectionRange(search.value.length, search.value.length); }
  }

  let canvas = { x: 0, y: 0, scale: 1 };
  function bindCanvas(fit) {
    const viewport = content.querySelector("[data-save-viewport]");
    const world = content.querySelector("[data-save-world]");
    const tree = content.querySelector("[data-save-tree]");
    if (!viewport || !world || !tree) return;
    const apply = () => { world.style.left = `${canvas.x}px`; world.style.top = `${canvas.y}px`; world.style.zoom = canvas.scale; };
    if (fit) {
      requestAnimationFrame(() => {
        const padding = 45;
        canvas.scale = Math.min(1.1, Math.max(.28, Math.min((viewport.clientWidth - padding) / tree.offsetWidth, (viewport.clientHeight - padding) / tree.offsetHeight)));
        canvas.x = (viewport.clientWidth - tree.offsetWidth * canvas.scale) / 2;
        canvas.y = (viewport.clientHeight - tree.offsetHeight * canvas.scale) / 2;
        apply();
      });
    } else apply();
    let pan = null;
    viewport.addEventListener("pointerdown", (event) => { if (event.button !== 0 || event.target.closest("button")) return; pan = { id: event.pointerId, x: event.clientX, y: event.clientY, ox: canvas.x, oy: canvas.y }; viewport.setPointerCapture(event.pointerId); viewport.classList.add("breeding-canvas--panning"); });
    viewport.addEventListener("pointermove", (event) => { if (!pan || pan.id !== event.pointerId) return; canvas.x = pan.ox + event.clientX - pan.x; canvas.y = pan.oy + event.clientY - pan.y; apply(); });
    const stop = () => { pan = null; viewport.classList.remove("breeding-canvas--panning"); };
    viewport.addEventListener("pointerup", stop); viewport.addEventListener("pointercancel", stop);
    viewport.addEventListener("wheel", (event) => { event.preventDefault(); const rect = viewport.getBoundingClientRect(); const x = event.clientX - rect.left; const y = event.clientY - rect.top; const old = canvas.scale; const next = Math.min(2.2, Math.max(.25, old * Math.exp(-event.deltaY * .0012))); canvas.x = x - (x - canvas.x) * next / old; canvas.y = y - (y - canvas.y) * next / old; canvas.scale = next; apply(); }, { passive: false });
  }

  function detectWorlds(files) {
    const entries = Array.from(files).map((file) => ({ file, path: file.webkitRelativePath || file.name }));
    const levels = entries.filter(({ file, path }) => file.name.toLowerCase() === "level.sav" && !/[\\/]backup[\\/]/i.test(path));
    return levels.map(({ file: level, path }) => {
      const directory = path.slice(0, path.lastIndexOf("/"));
      const prefix = `${directory}/Players/`.toLowerCase();
      const players = entries.filter((entry) => entry.path.toLowerCase().startsWith(prefix) && entry.file.name.toLowerCase().endsWith(".sav")).map((entry) => entry.file);
      const label = directory.split("/").filter(Boolean).pop() || "Monde Palworld";
      return { label, path, level, players, modified: level.lastModified };
    }).sort((a, b) => b.modified - a.modified);
  }

  async function parseWorld(world) {
    const replacingSameWorld = activeWorld?.path === world.path;
    const previousGoal = replacingSameWorld ? {
      target: state.target,
      selectedPassives: [...state.selectedPassives],
      forced: [...state.forced],
      calculation: state.calculation,
    } : null;
    parsing = true; error = ""; progress = "Préparation de la sauvegarde…"; worldModalOpen = false; render();
    const buffer = await world.level.arrayBuffer();
    const worker = new Worker("js/save-parser.worker.js?v=1", { type: "module" });
    const requestId = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
    worker.onmessage = async ({ data }) => {
      if (data.requestId !== requestId) return;
      if (data.type === "progress") { progress = data.stage; render(false); return; }
      if (data.type === "parse-error") {
        parsing = false; error = "Problème lors de l’import de la sauvegarde. Contactez-nous."; worker.terminate(); render(); return;
      }
      if (data.type === "parsed-world") {
        worker.terminate();
        roster = data.result.roster.filter((individual) => palInfo(individual.speciesId));
        activeWorld = { label: world.label, path: world.path, modified: world.modified, players: data.result.players, parseMs: data.result.parseMs, warnings: data.result.warnings };
        allAvailable.clear(); roster.forEach((pal) => pal.passives.forEach((id) => allAvailable.add(id)));
        state.parentA = null; state.parentB = null;
        state.target = previousGoal?.target || null;
        state.selectedPassives = previousGoal ? previousGoal.selectedPassives.filter((id) => allAvailable.has(id)).slice(0, 4) : [];
        state.forced = previousGoal ? previousGoal.forced.filter((id) => roster.some((pal) => pal.id === id)).slice(0, 2) : [];
        state.calculation = previousGoal?.calculation || "parents";
        graph = null; selectionSlot = "parentA"; query = "";
        parsing = false; progress = ""; saveState();
        await dbPut({ activeWorld, roster });
        scheduleSolve(true);
      }
    };
    worker.onerror = () => { parsing = false; error = "Problème lors de l’import de la sauvegarde. Contactez-nous."; worker.terminate(); render(); };
    worker.postMessage({ type: "parse-world", requestId, level: buffer }, [buffer]);
  }

  async function removeSave() {
    await dbDelete(); roster = []; activeWorld = null; allAvailable.clear(); graph = null; error = "";
    Object.assign(state, { parentA: null, parentB: null, target: null, selectedPassives: [], forced: [] }); saveState(); render();
  }

  function handleClick(event) {
    const source = event.target.closest("[data-cumoir-source]");
    if (source) {
      persistMode(source.dataset.cumoirSource);
      if (mode === "manual") window.renderBreedingPage?.(); else scheduleSolve(true);
      return;
    }
    if (mode !== "save" || !event.target.closest(".breeding-page--save")) return;
    if (event.target.closest("[data-import-save]")) { content.querySelector("[data-save-directory]")?.click(); return; }
    if (event.target.closest("[data-delete-save]")) { void removeSave(); return; }
    const calculation = event.target.closest("[data-save-calculation]");
    if (calculation) { state.calculation = calculation.dataset.saveCalculation; state.parentA = null; state.parentB = null; state.forced = []; selectionSlot = "parentA"; saveState(); scheduleSolve(true); return; }
    const slot = event.target.closest("[data-save-slot]"); if (slot) { selectionSlot = slot.dataset.saveSlot; render(false); return; }
    const palButton = event.target.closest("[data-save-pal]");
    if (palButton) {
      const id = palButton.dataset.savePal;
      if (state.calculation === "parents") {
        state[selectionSlot] = id; selectionSlot = selectionSlot === "parentA" ? "parentB" : "parentA";
      } else {
        state.forced = state.forced.includes(id) ? state.forced.filter((entry) => entry !== id) : state.forced.length < 2 ? [...state.forced, id] : [state.forced[1], id];
      }
      saveState(); scheduleSolve(); return;
    }
    const targetButton = event.target.closest("[data-save-target]");
    if (targetButton) {
      state.target = targetButton.dataset.saveTarget;
      selectionSlot = null;
      query = "";
      saveState(); scheduleSolve(true); return;
    }
    if (event.target.closest("[data-open-passives]")) { passiveModalOpen = true; passiveQuery = ""; render(false); return; }
    const remove = event.target.closest("[data-remove-passive]"); if (remove) { state.selectedPassives = state.selectedPassives.filter((id) => id !== remove.dataset.removePassive); saveState(); scheduleSolve(); return; }
    const toggle = event.target.closest("[data-toggle-passive]");
    if (toggle && !toggle.disabled) {
      const id = toggle.dataset.togglePassive;
      state.selectedPassives = state.selectedPassives.includes(id) ? state.selectedPassives.filter((entry) => entry !== id) : state.selectedPassives.length < 4 ? [...state.selectedPassives, id] : state.selectedPassives;
      saveState(); scheduleSolve(); return;
    }
    if (event.target.closest("[data-clear-passives]")) { state.selectedPassives = []; saveState(); scheduleSolve(); return; }
    if (event.target.matches(".save-modal-backdrop[data-close-passive-modal]") || event.target.closest("button[data-close-passive-modal]")) { passiveModalOpen = false; render(false); return; }
    const worldChoice = event.target.closest("[data-world-index]"); if (worldChoice) { void parseWorld(pendingWorlds[Number(worldChoice.dataset.worldIndex)]); return; }
    if (event.target.matches(".save-modal-backdrop[data-close-world-modal]") || event.target.closest("button[data-close-world-modal]")) { worldModalOpen = false; render(false); return; }
    if (event.target.closest("[data-save-reset]")) { Object.assign(state, { parentA: null, parentB: null, target: null, selectedPassives: [], forced: [] }); graph = null; saveState(); render(); return; }
    if (event.target.closest("[data-open-target]")) { selectionSlot = "target"; query = ""; render(false); content.querySelector("[data-save-search]")?.focus(); }
  }

  function handleInput(event) {
    if (mode !== "save") return;
    if (event.target.matches("[data-save-search]")) { query = event.target.value; const rosterElement = content.querySelector("[data-save-roster]"); if (rosterElement) rosterElement.innerHTML = rosterList(); }
    if (event.target.matches("[data-passive-search]")) { passiveQuery = event.target.value; render(false); }
  }

  function handleChange(event) {
    if (!event.target.matches("[data-save-directory]")) return;
    pendingWorlds = detectWorlds(event.target.files);
    event.target.value = "";
    if (!pendingWorlds.length) { error = "Aucun monde Palworld valide n’a été trouvé dans ce dossier."; render(); return; }
    worldModalOpen = true; render(false);
  }

  document.addEventListener("click", handleClick);
  document.addEventListener("input", handleInput);
  document.addEventListener("change", handleChange);
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || mode !== "save") return;
    if (passiveModalOpen) { passiveModalOpen = false; render(false); }
    else if (worldModalOpen) { worldModalOpen = false; render(false); }
  });

  dbGet().then((saved) => {
    if (!saved?.activeWorld || !Array.isArray(saved.roster)) return;
    activeWorld = saved.activeWorld; roster = saved.roster;
    allAvailable.clear(); roster.forEach((pal) => pal.passives.forEach((id) => allAvailable.add(id)));
    state.forced = state.forced.filter((id) => roster.some((pal) => pal.id === id));
    if (mode === "save") scheduleSolve(true);
  }).catch(() => {});

  window.SaveCumoir = {
    isSaveMode: () => mode === "save",
    sourceSwitch,
    template,
    render,
    __test: {
      loadRoster(items) {
        roster = items;
        activeWorld = { label: "Fixture", players: [] };
        allAvailable.clear(); roster.forEach((pal) => pal.passives.forEach((id) => allAvailable.add(id)));
      },
      setTarget(target, selectedPassives = [], forced = []) {
        state.calculation = "target";
        state.target = target;
        state.selectedPassives = selectedPassives;
        state.forced = forced;
      },
      solveTarget,
      solveDirect,
      childFor,
    },
  };
})();
