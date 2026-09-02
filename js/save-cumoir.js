/* Palworld Nyu Tools — Cumoir avec sauvegarde locale. GPL-3.0. */
(() => {
  "use strict";

  const STATE_KEY = "palworld-nyu-tools:cumoir-save-state-v1";
  const HISTORY_KEY = "palworld-nyu-tools:cumoir-history-v1";
  const MAX_RECENT_HISTORY = 10;
  const MAX_PINNED_HISTORY = 40;
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
  const ownedSpecies = new Set();

  let roster = [];
  let activeWorld = null;
  let pendingWorlds = [];
  let parsing = false;
  let progress = "";
  let error = "";
  let updating = false;
  let updateHelpOpen = false;
  let targetQuery = "";
  let passiveQuery = "";
  let passiveModalOpen = false;
  let worldModalOpen = false;
  let selectedWorldIndex = 0;
  let solveTimer = 0;
  let carrierWorker = null;
  let solveRequestId = 0;
  let calculating = false;
  let treeResult = null;
  let modalPointerDownOnBackdrop = null;
  let passiveSearchShouldFocus = false;
  let history = loadHistory();
  let activeHistoryId = null;

  const MIN_SCALE = .10;
  const MAX_SCALE = 2.50;
  const ZOOM_STEP = 1.18;

  const state = loadState();

  function loadState() {
    const fallback = { target: null, selectedPassives: [] };
    try {
      const saved = JSON.parse(localStorage.getItem(STATE_KEY) || "null");
      if (!saved || typeof saved !== "object") return fallback;
      return {
        ...fallback,
        target: typeof saved.target === "string" ? saved.target : null,
        selectedPassives: Array.isArray(saved.selectedPassives) ? saved.selectedPassives.filter((id) => passiveById.has(id)).slice(0, 4) : [],
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

  function passiveEffectText(effect) {
    return String(effect || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  }

  function passiveClass(rank) {
    if (rank >= 5) return "save-passive--world-tree";
    if (rank >= 4) return "save-passive--legendary";
    if (rank >= 2) return "save-passive--rare";
    if (rank < 0) return "save-passive--negative";
    return "save-passive--common";
  }

  function passiveRank(rank) {
    if (rank >= 5) return "5";
    if (rank >= 4) return "4";
    if (rank >= 3) return "3";
    if (rank === 2) return "2";
    if (rank < 0) return `negative-${Math.min(3, Math.abs(rank))}`;
    return "1";
  }

  function passiveRankIcon(passive) {
    return `<i class="save-passive-rank save-passive-rank--${passiveRank(passive.rank)}" aria-hidden="true"></i>`;
  }

  function passiveChip(id, interactive = false) {
    const passive = passiveInfo(id);
    const tag = interactive ? "button" : "span";
    return `<${tag}${interactive ? ` type="button" data-open-passives aria-label="Modifier les passifs désirés"` : ""} class="save-passive ${passiveClass(passive.rank)}" data-passive-id="${escapeHtml(id)}" data-passive-tooltip="${escapeHtml(id)}" tabindex="0">
      <span>${escapeHtml(passive.name)}</span>${passiveRankIcon(passive)}
    </${tag}>`;
  }

  function sexIcon(sex) {
    if (sex === "Male") return `<svg class="sex-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="9.8" cy="14.2" r="5.2" fill="none" stroke="currentColor" stroke-width="2.4"></circle><path d="M13.9 10.1 20 4m0 0h-5.2M20 4v5.2" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;
    if (sex === "Female") return `<svg class="sex-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="8.5" r="5.2" fill="none" stroke="currentColor" stroke-width="2.4"></circle><path d="M12 13.7V21M8.6 17.6h6.8" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"></path></svg>`;
    return `<span aria-hidden="true">?</span>`;
  }

  function historyPlanKey(target, selectedPassives) {
    return `${String(target || "").toLowerCase()}|${[...new Set(selectedPassives || [])].sort().join("|")}`;
  }

  function normalizeHistoryEntries(raw) {
    if (!Array.isArray(raw)) return [];
    const seenIds = new Set();
    const entries = raw.flatMap((entry) => {
      if (!entry || typeof entry !== "object") return [];
      const target = typeof entry.target === "string" && palInfo(entry.target) ? palInfo(entry.target).id : null;
      const selectedPassives = Array.isArray(entry.selectedPassives) ? [...new Set(entry.selectedPassives.filter((id) => passiveById.has(id)))].slice(0, 4) : [];
      const id = typeof entry.id === "string" && entry.id && !seenIds.has(entry.id) ? entry.id : null;
      if (!target || !id) return [];
      seenIds.add(id);
      return [{ id, target, selectedPassives, pinned: entry.pinned === true, updatedAt: Number.isFinite(entry.updatedAt) ? entry.updatedAt : 0 }];
    });
    const sorted = entries.sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt);
    return [...sorted.filter((entry) => entry.pinned).slice(0, MAX_PINNED_HISTORY), ...sorted.filter((entry) => !entry.pinned).slice(0, MAX_RECENT_HISTORY)];
  }

  function loadHistory() {
    try { return normalizeHistoryEntries(JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]")); }
    catch { return []; }
  }

  function saveHistory() {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); }
    catch (storageError) { console.warn("Historique du Cumoir non sauvegardé :", storageError); }
  }

  function historyId() {
    return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  function upsertHistoryEntries(entries, plan, currentId = null, now = Date.now(), createId = historyId) {
    const clean = normalizeHistoryEntries(entries).map((entry) => ({ ...entry, selectedPassives: [...entry.selectedPassives] }));
    const key = historyPlanKey(plan.target, plan.selectedPassives);
    const active = clean.find((entry) => entry.id === currentId);
    const duplicate = clean.find((entry) => entry.id !== currentId && historyPlanKey(entry.target, entry.selectedPassives) === key);
    let nextId = currentId;
    if (active && duplicate) {
      duplicate.pinned = duplicate.pinned || active.pinned; duplicate.updatedAt = now;
      clean.splice(clean.indexOf(active), 1); nextId = duplicate.id;
    } else if (active) {
      active.target = plan.target; active.selectedPassives = [...new Set(plan.selectedPassives)].sort(); active.updatedAt = now;
    } else if (duplicate) {
      duplicate.updatedAt = now; nextId = duplicate.id;
    } else {
      nextId = createId();
      clean.push({ id: nextId, target: plan.target, selectedPassives: [...new Set(plan.selectedPassives)].sort(), pinned: false, updatedAt: now });
    }
    return { entries: normalizeHistoryEntries(clean), activeId: nextId };
  }

  function recordHistory() {
    if (!state.target || !treeResult?.root || !["found", "already-owned"].includes(treeResult.status)) return;
    const next = upsertHistoryEntries(history, { target: state.target, selectedPassives: state.selectedPassives }, activeHistoryId);
    history = next.entries; activeHistoryId = next.activeId; saveHistory();
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

  function normalizeStoredSave(saved) {
    if (!saved?.activeWorld || !Array.isArray(saved.roster)) return null;
    return { activeWorld: saved.activeWorld, roster: saved.roster };
  }

  function storedSaveRecord(world = activeWorld, items = roster) {
    return { activeWorld: world, roster: items };
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
    return `<article class="save-pal-card">
      <img src="${escapeHtml(pal.portrait)}" alt="" loading="lazy" />
      <span class="save-pal-card__body"><span class="save-pal-card__name"><strong>${escapeHtml(pal.name)}</strong><small>Niv. ${individual.level} · <b class="save-pal-card__sex save-pal-card__sex--${individual.sex.toLowerCase()}">${sexIcon(individual.sex)}</b></small></span>
      <span class="save-pal-card__passives">${individual.passives.map((id) => passiveChip(id)).join("")}</span></span>
    </article>`;
  }

  // Renderer conservé pour un futur navigateur de roster, sans être instancié
  // ni déclencher le chargement de portraits dans le Cumoir actuel.
  function rosterList(searchValue = "") {
    const search = normalize(searchValue);
    const matches = currentRoster().filter((individual) => {
      const pal = palInfo(individual.speciesId);
      return pal && (!search || normalize(pal.name).includes(search));
    });
    return matches.length ? matches.map(rosterCard).join("") : `<p class="save-roster__empty">Aucun Pal trouvé.</p>`;
  }

  function importEmpty() {
    const busy = parsing && !updating;
    return `<div class="save-import-empty">
      <div class="save-import-empty__icon" aria-hidden="true">⇩</div>
      <strong>Importez votre sauvegarde Steam</strong>
      <div class="save-import-path"><code>%localappdata%\\Pal\\Saved\\SaveGames</code><button type="button" data-copy-save-path>Copier le chemin</button></div>
      <ol><li>Ouvrez le sélecteur.</li><li>Collez le chemin.</li><li>Sélectionnez le dossier <code>SaveGames</code>, puis votre monde.</li></ol>
      <button type="button" class="save-primary" data-import-save ${busy ? "disabled" : ""}>${busy ? `<span class="save-button-spinner" aria-hidden="true"></span> Importation…` : "Importer une sauvegarde"}</button>
      <p>Lecture locale : aucun fichier n’est envoyé.</p>
      <input class="save-file-input" data-save-directory type="file" webkitdirectory directory multiple />
    </div>`;
  }

  function worldStatus() {
    const player = activeWorld?.players?.[0];
    const busy = parsing && updating;
    return `<div class="save-world-status-wrap"><div class="save-world-status">
      <div><small>Sauvegarde active</small><strong>${escapeHtml(activeWorld?.label || "Monde Palworld")}</strong><span class="save-world-status__details">${player ? `<b>${escapeHtml(player.name)}</b><i>Niveau ${player.level}</i>` : ""}<i>${roster.length.toLocaleString("fr-FR")} Pals détectés</i></span></div>
      <div><button type="button" data-show-update-help ${busy ? "disabled" : ""}>${busy ? `<span class="save-button-spinner" aria-hidden="true"></span> Mise à jour…` : "Mettre à jour"}</button><button type="button" class="save-danger" data-delete-save ${parsing ? "disabled" : ""}>Supprimer</button></div>
      <input class="save-file-input" data-save-directory type="file" webkitdirectory directory multiple />
    </div>${updateHelpOpen ? `<div class="save-update-help"><p>Sélectionnez à nouveau votre dossier <strong>SaveGames</strong> pour actualiser la sauvegarde.</p><div><code>%localappdata%\\Pal\\Saved\\SaveGames</code><button type="button" data-copy-save-path>Copier le chemin</button><button type="button" class="save-primary" data-open-save-picker>Ouvrir le sélecteur</button></div></div>` : ""}</div>`;
  }

  function transmissionPanel() {
    return `<aside class="save-transmission-panel" aria-labelledby="transmission-title">
      <span class="eyebrow" id="transmission-title">Transmission des passifs</span>
      <p>À chaque accouplement, le jeu prend en compte les passifs présents chez les deux parents et en transmet aléatoirement 1 à 4 au descendant.</p>
      <div class="save-transmission-rates" aria-label="Probabilités de transmission"><span><b>1 :</b>40 %</span><span><b>2 :</b>30 %</span><span><b>3 :</b>20 %</span><span><b>4 :</b>10 %</span></div>
      <p>Les doublons ne comptent qu’une fois ; les passifs indésirables réduisent les chances d’obtenir exactement la combinaison voulue.</p>
      <small>Des passifs aléatoires peuvent apparaître s’il reste des emplacements.</small>
    </aside>`;
  }

  function targetPicker() {
    const target = palInfo(state.target);
    return `<div class="save-target-picker">
      <span class="eyebrow">Pal cible</span>
      ${target ? `<div class="save-target-selected"><img src="${target.portrait}" alt="" /><strong>${escapeHtml(target.name)}</strong><button type="button" class="breeding-parent-remove" data-clear-save-target aria-label="Retirer ${escapeHtml(target.name)}">×</button></div>` : `<label class="save-target-search"><span class="pal-search__field"><input data-target-search type="search" placeholder="Rechercher un Pal…" aria-label="Rechercher un Pal" value="${escapeHtml(targetQuery)}" autocomplete="off" /><span aria-hidden="true">⌕</span></span></label><div class="save-target-results" data-target-results>${targetResults()}</div>`}
    </div>`;
  }

  function targetResults(searchValue = targetQuery) {
    const search = normalize(searchValue);
    if (search.length < 2) return "";
    const targets = species
      .filter((pal) => normalize(pal.name).includes(search))
      .sort((a, b) => Number(!normalize(a.name).startsWith(search)) - Number(!normalize(b.name).startsWith(search))
        || normalize(a.name).indexOf(search) - normalize(b.name).indexOf(search)
        || a.order - b.order);
    return targets.length ? targets.map((pal) => `<button type="button" data-save-target="${escapeHtml(pal.id)}"><img src="${escapeHtml(pal.portrait)}" alt="" loading="lazy" /><span>${escapeHtml(pal.name)}</span></button>`).join("") : `<p>Aucun Pal trouvé.</p>`;
  }

  function passivesPanel() {
    const slots = state.selectedPassives.map((id) => passiveChip(id, true));
    if (state.selectedPassives.length < 4) slots.push(`<button type="button" class="save-passive-add" data-open-passives><span aria-hidden="true">+</span> Ajouter un passif</button>`);
    return `<section class="save-passive-goal">
      <div><span class="eyebrow">Passifs désirés</span><small>${state.selectedPassives.length}/4</small></div>
      <div class="save-passive-goal__chips">${slots.join("")}</div>
    </section>`;
  }

  function toggledPassives(current, id) {
    if (current.includes(id)) return current.filter((entry) => entry !== id);
    return current.length < 4 ? [...current, id] : current;
  }

  function selectionSummary() {
    return `<section class="save-goal-card">${targetPicker()}${passivesPanel()}</section>${historyPanel()}`;
  }

  function historyPinIcon() {
    return `<svg class="history-pin-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.48 122.88" aria-hidden="true" focusable="false"><path fill="currentColor" fill-rule="evenodd" d="M121.21,36.53,85.92,1.23c-3-3-7.77.1-9.2,2.74-.24.45.19.86-.2,3.92A46.27,46.27,0,0,1,73.8,19.21L58.11,34.91c-6.27,6.26-15.23,3.48-22.87-.32-1.62-.8-3.69-2.57-5.48-.78l-6.64,6.64a2.49,2.49,0,0,0,0,3.53L78.9,99.76a2.5,2.5,0,0,0,3.53,0l6.64-6.64c1.77-1.77-.49-4.06-1.41-6-3.4-7-6.45-16.41-.78-22.08l16.39-16.39a84.14,84.14,0,0,1,11.35-2.57c3.09-.49,3.47-.11,3.91-.4,2.71-1.74,5.7-6.15,2.68-9.17Z"/><polygon fill="currentColor" fill-rule="evenodd" points="53.48 82.11 40.77 69.4 0 120.96 1.92 122.88 53.48 82.11"/></svg>`;
  }

  function historyPanel() {
    if (!history.length) return `<section class="save-history"><header><span class="eyebrow">Historique</span></header><p>Aucun calcul récent.</p></section>`;
    return `<section class="save-history"><header><span class="eyebrow">Historique</span></header><div>${history.map((entry) => {
      const pal = palInfo(entry.target); if (!pal) return "";
      return `<article class="save-history__entry${entry.id === activeHistoryId ? " is-active" : ""}" data-history-tooltip="${escapeHtml(entry.id)}">
        <button type="button" class="save-history__load" data-load-history="${escapeHtml(entry.id)}"><img src="${escapeHtml(pal.portrait)}" alt="" /><span>${escapeHtml(pal.name)}</span></button>
        <button type="button" class="save-history__pin${entry.pinned ? " is-pinned" : ""}" data-pin-history="${escapeHtml(entry.id)}" aria-label="${entry.pinned ? "Désépingler ce plan" : "Épingler ce plan"}" title="${entry.pinned ? "Désépingler ce plan" : "Épingler ce plan"}" aria-pressed="${entry.pinned}">${historyPinIcon()}</button>
        <button type="button" class="save-history__delete breeding-parent-remove" data-delete-history="${escapeHtml(entry.id)}" aria-label="Supprimer ${escapeHtml(pal.name)} de l’historique">×</button>
      </article>`;
    }).join("")}</div></section>`;
  }

  function modalTemplates() {
    return `${worldModalOpen ? worldModal() : ""}${passiveModalOpen ? passiveModal() : ""}`;
  }

  function worldModal() {
    const selectedWorld = pendingWorlds[selectedWorldIndex];
    return `<div class="save-modal-backdrop" data-close-world-modal><section class="save-modal save-world-modal" role="dialog" aria-modal="true" aria-labelledby="world-modal-title">
      <header><div><span class="eyebrow">Sauvegardes détectées</span><h2 id="world-modal-title">Choisir un monde</h2><p>Sélectionnez un monde, puis confirmez son import.</p></div><button type="button" data-close-world-modal aria-label="Fermer">×</button></header>
      <div class="save-world-list" role="radiogroup" aria-label="Mondes Palworld détectés">${pendingWorlds.map((world, index) => {
        const metadata = world.metadata || {};
        const selected = index === selectedWorldIndex;
        const savedAt = metadata.savedAt || world.modified;
        return `<button type="button" role="radio" aria-checked="${selected}" data-world-index="${index}" class="${selected ? "is-selected" : ""}">
          <span class="save-world-list__selector" aria-hidden="true"></span>
          <span class="save-world-list__identity"><strong>${escapeHtml(metadata.name || "Monde Palworld")}</strong><small>${new Date(savedAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}</small></span>
          ${metadata.day != null ? `<span class="save-world-list__meta"><small>Jour</small><b>${escapeHtml(metadata.day)}</b></span>` : ""}
          ${metadata.playerName ? `<span class="save-world-list__meta"><small>Joueur</small><b>${escapeHtml(metadata.playerName)}</b></span>` : ""}
          ${metadata.playerLevel != null ? `<span class="save-world-list__meta"><small>Niveau</small><b>${escapeHtml(metadata.playerLevel)}</b></span>` : ""}
          ${typeof metadata.multiplayer === "boolean" ? `<span class="save-world-list__meta"><small>Multijoueur</small><b>${metadata.multiplayer ? "Oui" : "Non"}</b></span>` : ""}
        </button>`;
      }).join("")}</div>
      <footer><small>Seul le monde confirmé est importé dans le Cumoir.</small><button type="button" class="save-primary" data-import-world ${selectedWorld ? "" : "disabled"}>Importer ce monde</button></footer>
    </section></div>`;
  }

  function searchPassives(searchValue = passiveQuery) {
    const search = normalize(searchValue);
    return passives.filter((passive) => !search
      || normalize(passive.name).includes(search)
      || normalize(passiveEffectText(passive.effect)).includes(search));
  }

  function passiveModal() {
    const rows = searchPassives();
    const groups = [
      { label: "Arbre-Monde", match: (rank) => rank >= 5 },
      { label: "Légendaires", match: (rank) => rank === 4 },
      { label: "Rares", match: (rank) => rank === 3 },
      { label: "Supérieurs", match: (rank) => rank === 2 },
      { label: "Communs", match: (rank) => rank >= 0 && rank < 2 },
      { label: "Négatifs", match: (rank) => rank < 0 },
    ];
    return `<div class="save-modal-backdrop" data-close-passive-modal><section class="save-modal save-passive-modal" role="dialog" aria-modal="true" aria-labelledby="passive-modal-title">
      <header><div><span class="eyebrow">Objectif d’élevage</span><h2 id="passive-modal-title">Compétences passives</h2></div><button type="button" data-close-passive-modal aria-label="Fermer">×</button></header>
      <div class="save-passive-modal__tools"><label class="save-passive-modal__search"><small>Rechercher par nom ou effet</small><span class="pal-search__field"><input type="search" data-passive-search placeholder="Vitesse, attaque, satiété…" aria-label="Rechercher par nom ou effet" value="${escapeHtml(passiveQuery)}" /><span aria-hidden="true">⌕</span></span></label><span class="save-passive-modal__count">${state.selectedPassives.length}/4</span><button type="button" class="save-passive-modal__clear" data-clear-passives>Tout effacer</button></div>
      <div class="save-passive-list">${groups.map((group) => {
        const groupRows = rows.filter((passive) => group.match(passive.rank));
        if (!groupRows.length) return "";
        return `<section class="save-passive-tier"><header><strong>${group.label}</strong><span>${groupRows.length}</span></header><div>${groupRows.map((passive) => {
          const selected = state.selectedPassives.includes(passive.id);
          const owned = allAvailable.has(passive.id);
          const blocked = (!owned && !selected) || (state.selectedPassives.length >= 4 && !selected);
          return `<button type="button" data-toggle-passive="${escapeHtml(passive.id)}" data-passive-tooltip="${escapeHtml(passive.id)}" aria-pressed="${selected}" class="${passiveClass(passive.rank)}${selected ? " is-selected" : ""}${owned ? "" : " is-unowned"}${blocked && owned ? " is-limit-blocked" : ""}" ${blocked ? `disabled aria-disabled="true"` : ""}><strong>${escapeHtml(passive.name)}</strong>${passiveRankIcon(passive)}<span class="save-passive-tier__selection" aria-hidden="true">${selected ? "✓" : "+"}</span></button>`;
        }).join("")}</div></section>`;
      }).join("")}</div>
      <footer><span>${rows.length} compétence${rows.length > 1 ? "s" : ""}</span><button type="button" class="save-primary" data-close-passive-modal>Terminer</button></footer>
    </section></div>`;
  }

  function template() {
    const graphMarkup = calculating ? calculationStateTemplate() : graphTemplate(treeResult);
    return `<section class="breeding-page breeding-page--save" aria-label="Cumoir avec sauvegarde">
      ${activeWorld ? `<div class="save-workspace"><div class="breeding-layout breeding-layout--save">
        <aside class="breeding-panel save-breeding-panel">
          <section class="save-source-panel" aria-label="Planificateur d’élevage, sauvegarde active et transmission des passifs"><header><span class="eyebrow">Planificateur d’élevage</span></header>${worldStatus()}${transmissionPanel()}</section>
          ${selectionSummary()}
        </aside>
        <section class="breeding-canvas" data-save-viewport aria-label="Arbre généalogique interactif"><div class="breeding-canvas__tip">Molette : zoom · Cliquer-glisser : déplacer</div><div class="breeding-canvas__summary">${escapeHtml(resultSummary(treeResult))}</div><div class="breeding-canvas__controls" aria-label="Contrôles du terrain"><button type="button" data-canvas-zoom-out aria-label="Dézoomer">−</button><button type="button" data-canvas-zoom-in aria-label="Zoomer">+</button><button type="button" data-canvas-fit title="Recentrer l’arbre">Recentrer</button><output data-canvas-scale>100 %</output></div>${graphMarkup}</section>
      </div></div>` : `<header class="breeding-page__header"><p class="eyebrow">Planificateur d’élevage</p></header>${importEmpty()}`}
      ${parsing ? `<div class="save-progress"><span></span>${escapeHtml(progress || "Lecture de la sauvegarde…")}</div>` : ""}
      ${error ? `<div class="save-error">${escapeHtml(error)}</div>` : ""}
      ${modalTemplates()}
    </section>`;
  }

  function eggKind(palId) {
    const pal = palInfo(palId);
    const element = pal?.elements?.[0] || "Neutre";
    const [suffix, name] = ({
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
    const size = window.PAL_EGG_SIZES?.[pal?.id] || "regular";
    const sizeLabel = size === "giant" ? "taille géante" : size === "large" ? "grande taille" : "taille normale";
    return [suffix, `${name} · ${sizeLabel}`];
  }

  function calculationStateTemplate() {
    return `<div class="save-calculating" role="status"><span aria-hidden="true"></span><strong>Calcul en cours…</strong></div>`;
  }

  function emptyGraphTemplate(message) {
    return `<div class="breeding-canvas__empty"><span class="breeding-canvas__mascot"><img src="assets/ui/gerard-empty.webp" alt="" /></span><p>${escapeHtml(message)}</p></div>`;
  }

  function resultSummary(result) {
    if (!result) return "Arbre généalogique";
    if (result.status === "already-owned") return "Déjà présent dans votre sauvegarde";
    if (result.status === "found") return `${result.breedingCount} étape${result.breedingCount > 1 ? "s" : ""} d’élevage`;
    return "Arbre généalogique";
  }

  function resultError(result) {
    if (!result) return "Choisissez un Pal cible pour calculer une route.";
    if (result.error) return result.error;
    if (result.status === "missing-passive") {
      const names = (result.missingPassiveIds || []).map((id) => passiveInfo(id).name).join(", ");
      return `Le passif ${names || "demandé"} n’est présent sur aucun Pal de cette sauvegarde.`;
    }
    if (result.status === "interrupted") return "La recherche a été interrompue avant de pouvoir prouver une route.";
    if (result.status === "no-route") return "Aucune route d’élevage valide n’existe avec les Pals de cette sauvegarde.";
    return "Choisissez un Pal cible pour calculer une route.";
  }

  function treeToGraph(root) {
    const nodes = [];
    const families = [];
    let leafCursor = 0;
    let keyCursor = 0;
    const nodeWidth = 350;
    const horizontalStep = 366;
    const verticalStep = 250;
    const nodeHeight = 165;
    function visit(node, depth = 0) {
      const key = `node-${keyCursor++}`;
      if (!node.parents) {
        nodes.push({ key, node, x: leafCursor++ * horizontalStep, depth, height: nodeHeight });
        return key;
      }
      const a = visit(node.parents[0], depth + 1);
      const b = visit(node.parents[1], depth + 1);
      const left = nodes.find((entry) => entry.key === a);
      const right = nodes.find((entry) => entry.key === b);
      nodes.push({ key, node, x: (left.x + right.x) / 2, depth, height: nodeHeight });
      families.push({ parents: [a, b], child: key });
      return key;
    }
    visit(root);
    const maxDepth = Math.max(...nodes.map((node) => node.depth), 0);
    nodes.forEach((node) => { node.y = node.depth * verticalStep + 42; node.x += 64; });
    return { nodes, families, nodeWidth, width: Math.max(560, leafCursor * horizontalStep + 128), height: Math.max(...nodes.map((node) => node.y + node.height), 158) + 84 };
  }

  function graphTemplate(result) {
    if (!result?.root) return emptyGraphTemplate(resultError(result));
    const layout = treeToGraph(result.root);
    const nodeByKey = new Map(layout.nodes.map((entry) => [entry.key, entry]));
    const paths = layout.families.map(({ parents, child }) => {
      const [left, right] = parents.map((key) => nodeByKey.get(key));
      const target = nodeByKey.get(child);
      const leftX = left.x + layout.nodeWidth / 2;
      const rightX = right.x + layout.nodeWidth / 2;
      const childX = target.x + layout.nodeWidth / 2;
      const parentY = left.y;
      const childY = target.y + target.height;
      const joinY = childY + (parentY - childY) * .48;
      const radius = 12;
      const path = `M ${leftX} ${parentY} V ${joinY + radius} Q ${leftX} ${joinY} ${leftX + radius} ${joinY} H ${rightX - radius} Q ${rightX} ${joinY} ${rightX} ${joinY + radius} V ${parentY} M ${childX} ${joinY} V ${childY}`;
      const incomingFlowPath = (parentX) => {
        const direction = Math.sign(childX - parentX);
        if (!direction) return `M ${parentX} ${parentY} V ${joinY}`;
        return `M ${parentX} ${parentY} V ${joinY + radius} Q ${parentX} ${joinY} ${parentX + direction * radius} ${joinY} H ${childX}`;
      };
      const leftFlow = incomingFlowPath(leftX);
      const rightFlow = incomingFlowPath(rightX);
      const outgoingFlow = `M ${childX} ${joinY} V ${childY}`;
      return `<path class="save-family-link" d="${path}" /><path class="save-family-link-flow save-family-link-flow--incoming" pathLength="1" d="${leftFlow}" /><path class="save-family-link-flow save-family-link-flow--incoming" pathLength="1" d="${rightFlow}" /><circle class="save-family-junction" cx="${childX}" cy="${joinY}" r="7" /><path class="save-family-link-flow save-family-link-flow--outgoing" pathLength="1" d="${outgoingFlow}" />`;
    }).join("");
    const nodes = layout.nodes.map(({ node, x, y }) => {
      const pal = palInfo(node.speciesId); if (!pal) return "";
      const final = node === result.root;
      const requiredSex = final ? null : node.sex;
      const useful = state.selectedPassives.filter((id) => (node.mask & (1 << state.selectedPassives.indexOf(id))) !== 0);
      const [eggSuffix, eggName] = eggKind(node.speciesId);
      const eggAsset = `assets/eggs/t_itemicon_material_palegg${eggSuffix ? `_${eggSuffix}` : ""}.webp`;
      const isNewSpecies = !isSpeciesKnown(node.speciesId);
      return `<article class="breeding-node save-tree-node${final ? " save-tree-node--final" : ""}" style="left:${x}px;top:${y}px">
        ${node.owned ? "" : `<span class="save-egg"><img src="${eggAsset}" alt="${escapeHtml(eggName)}" /></span>`}
        ${isNewSpecies ? `<span class="save-tree-node__new">Nouveau</span>` : ""}
        <span class="save-tree-node__identity"><span class="breeding-node__portrait"><img src="${pal.portrait}" alt="" /></span><span class="save-tree-node__name"><strong>${escapeHtml(pal.name)}</strong>${requiredSex ? `<b class="breeding-node__sex breeding-node__sex--${requiredSex.toLowerCase()}" aria-label="${requiredSex === "Male" ? "Mâle requis" : "Femelle requise"}">${sexIcon(requiredSex)}</b>` : ""}</span></span>
        <span class="save-tree-node__passives">${useful.map((id) => passiveChip(id)).join("")}</span>
      </article>`;
    }).join("");
    return `<div class="breeding-canvas__world" data-save-world><div class="breeding-tree" data-save-tree style="width:${layout.width}px;height:${layout.height}px"><svg class="breeding-tree__links" width="${layout.width}" height="${layout.height}" viewBox="0 0 ${layout.width} ${layout.height}">${paths}</svg>${nodes}</div></div>`;
  }

  function normalizeSpeciesId(speciesId) {
    return String(speciesId || "").replace(/^BOSS_/i, "").toLowerCase();
  }

  function isSpeciesKnown(speciesId) {
    return ownedSpecies.has(normalizeSpeciesId(speciesId));
  }

  function refreshRosterIndexes() {
    allAvailable.clear();
    ownedSpecies.clear();
    roster.forEach((pal) => {
      ownedSpecies.add(normalizeSpeciesId(pal.speciesId));
      pal.passives.forEach((id) => allAvailable.add(id));
    });
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

  function scheduleSolve(immediate = false) {
    clearTimeout(solveTimer);
    const run = () => {
      if (!activeWorld) { carrierWorker?.terminate(); carrierWorker = null; treeResult = null; render(true); return; }
      if (!state.target) { carrierWorker?.terminate(); carrierWorker = null; treeResult = null; calculating = false; render(true); return; }
      calculating = true;
      render(true);
      carrierWorker?.terminate();
      const requestId = ++solveRequestId;
      carrierWorker = new Worker("js/carrier-solver.worker.js?v=0.9.1");
      carrierWorker.onmessage = ({ data }) => {
        if (data.requestId !== requestId) return;
        treeResult = data.type === "solved" ? data.result : { error: "Le calcul n’a pas pu être terminé." };
        calculating = false; carrierWorker.terminate(); carrierWorker = null; recordHistory(); render(true);
      };
      carrierWorker.onerror = (workerError) => {
        console.error("Échec du solveur :", workerError.message);
        if (requestId !== solveRequestId) return;
        treeResult = { error: "Le calcul n’a pas pu être terminé." };
        calculating = false; carrierWorker?.terminate(); carrierWorker = null; render(true);
      };
      carrierWorker.postMessage({
        type: "solve", requestId,
        input: {
          roster, targetId: state.target, desiredPassives: state.selectedPassives,
        },
      });
    };
    solveTimer = setTimeout(run, immediate ? 0 : 80);
  }

  function render(fit = true) {
    if (!content || document.body.dataset.view !== "breeding") return;
    content.innerHTML = template();
    bindCanvas(fit);
    const search = content.querySelector("[data-passive-search]");
    if (passiveModalOpen && passiveSearchShouldFocus && search) {
      search.focus(); search.setSelectionRange(search.value.length, search.value.length); passiveSearchShouldFocus = false;
    }
  }

  let canvas = { x: 0, y: 0, scale: 1 };
  function cameraAroundPoint(nextScale, point, camera = canvas) {
    const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, nextScale));
    const ratio = scale / camera.scale;
    return { x: point.x - (point.x - camera.x) * ratio, y: point.y - (point.y - camera.y) * ratio, scale };
  }

  function fittedCamera(viewportWidth, viewportHeight, treeWidth, treeHeight, padding = 70) {
    const usableWidth = Math.max(1, viewportWidth - padding * 2);
    const usableHeight = Math.max(1, viewportHeight - padding * 2);
    const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, Math.min(usableWidth / treeWidth, usableHeight / treeHeight, 1.1)));
    return { x: (viewportWidth - treeWidth * scale) / 2, y: (viewportHeight - treeHeight * scale) / 2, scale };
  }

  function visibleViewportCenter(rect, windowWidth, windowHeight, occludedTop = 0) {
    const left = Math.max(0, rect.left);
    const right = Math.min(windowWidth, rect.right);
    const top = Math.max(occludedTop, rect.top);
    const bottom = Math.min(windowHeight, rect.bottom);
    if (right <= left || bottom <= top) return { x: rect.width / 2, y: rect.height / 2 };
    const screenCenterY = windowHeight / 2;
    const visibleCenterY = screenCenterY >= top && screenCenterY <= bottom ? screenCenterY : (top + bottom) / 2;
    return { x: (left + right) / 2 - rect.left, y: visibleCenterY - rect.top };
  }

  function centeredCamera(viewportCenterX, viewportCenterY, targetCenterX, targetCenterY) {
    return { x: viewportCenterX - targetCenterX, y: viewportCenterY - targetCenterY, scale: 1 };
  }

  function pannedCamera(origin, start, current) {
    return { x: origin.x + current.x - start.x, y: origin.y + current.y - start.y, scale: origin.scale };
  }

  function bindCanvas(fit) {
    const viewport = content.querySelector("[data-save-viewport]");
    const world = content.querySelector("[data-save-world]");
    const tree = content.querySelector("[data-save-tree]");
    if (!viewport || !world || !tree) return;
    const scaleOutput = viewport.querySelector("[data-canvas-scale]");
    const apply = () => {
      const pixelRatio = window.devicePixelRatio || 1;
      const renderX = Math.round(canvas.x * pixelRatio) / pixelRatio;
      const renderY = Math.round(canvas.y * pixelRatio) / pixelRatio;
      world.style.transform = `translate3d(${renderX}px, ${renderY}px, 0)`;
      tree.style.zoom = canvas.scale;
      if (scaleOutput) scaleOutput.value = `${Math.round(canvas.scale * 100)} %`;
    };
    const fitBreedingCanvas = () => { canvas = fittedCamera(viewport.clientWidth, viewport.clientHeight, tree.offsetWidth, tree.offsetHeight); apply(); };
    const centerFinalPal = () => {
      const finalNode = tree.querySelector(".save-tree-node--final");
      if (!finalNode) return;
      const viewportRect = viewport.getBoundingClientRect();
      const stickyHeaderBottom = document.querySelector(".site-nav")?.getBoundingClientRect().bottom || 0;
      const visibleCenter = visibleViewportCenter(viewportRect, window.innerWidth, window.innerHeight, stickyHeaderBottom);
      canvas = centeredCamera(
        visibleCenter.x,
        visibleCenter.y,
        finalNode.offsetLeft + finalNode.offsetWidth / 2,
        finalNode.offsetTop + finalNode.offsetHeight / 2,
      );
      apply();
    };
    if (fit) requestAnimationFrame(fitBreedingCanvas); else apply();
    let pan = null;
    viewport.addEventListener("pointerdown", (event) => { if (event.button !== 0 || event.target.closest(".breeding-canvas__controls")) return; pan = { id: event.pointerId, x: event.clientX, y: event.clientY, ox: canvas.x, oy: canvas.y }; viewport.setPointerCapture(event.pointerId); viewport.classList.add("breeding-canvas--panning"); });
    viewport.addEventListener("pointermove", (event) => { if (!pan || pan.id !== event.pointerId) return; canvas = pannedCamera({ x: pan.ox, y: pan.oy, scale: canvas.scale }, { x: pan.x, y: pan.y }, { x: event.clientX, y: event.clientY }); apply(); });
    const stop = () => { pan = null; viewport.classList.remove("breeding-canvas--panning"); };
    viewport.addEventListener("pointerup", stop); viewport.addEventListener("pointercancel", stop);
    const zoomAt = (nextScale, point = { x: viewport.clientWidth / 2, y: viewport.clientHeight / 2 }) => { canvas = cameraAroundPoint(nextScale, point); apply(); };
    viewport.addEventListener("wheel", (event) => { event.preventDefault(); const rect = viewport.getBoundingClientRect(); zoomAt(canvas.scale * Math.exp(-event.deltaY * .0012), { x: event.clientX - rect.left, y: event.clientY - rect.top }); }, { passive: false });
    viewport.querySelector("[data-canvas-zoom-out]")?.addEventListener("click", () => zoomAt(canvas.scale / ZOOM_STEP));
    viewport.querySelector("[data-canvas-zoom-in]")?.addEventListener("click", () => zoomAt(canvas.scale * ZOOM_STEP));
    viewport.querySelector("[data-canvas-fit]")?.addEventListener("click", centerFinalPal);
  }

  function detectWorlds(files) {
    const entries = Array.from(files).map((file) => ({ file, path: file.webkitRelativePath || file.name }));
    const levels = entries.filter(({ file, path }) => file.name.toLowerCase() === "level.sav" && !/[\\/]backup[\\/]/i.test(path));
    return levels.map(({ file: level, path }) => {
      const directory = path.slice(0, path.lastIndexOf("/"));
      const prefix = `${directory}/Players/`.toLowerCase();
      const players = entries.filter((entry) => entry.path.toLowerCase().startsWith(prefix) && entry.file.name.toLowerCase().endsWith(".sav")).map((entry) => entry.file);
      const inDirectory = (name) => entries.find((entry) => entry.path.toLowerCase() === `${directory}/${name}`.toLowerCase())?.file || null;
      const label = directory.split("/").filter(Boolean).pop() || "Monde Palworld";
      return { label, path, level, levelMeta: inDirectory("LevelMeta.sav"), worldOption: inDirectory("WorldOption.sav"), players, modified: level.lastModified };
    }).sort((a, b) => b.modified - a.modified);
  }

  function worldSelection(worlds) {
    if (!worlds.length) return "none";
    return worlds.length === 1 ? "direct" : "choice";
  }

  async function readWorldMetadata(world) {
    const [levelMeta, worldOption] = await Promise.all([world.levelMeta?.arrayBuffer() || null, world.worldOption?.arrayBuffer() || null]);
    if (!levelMeta && !worldOption) return null;
    return new Promise((resolve) => {
      const worker = new Worker("js/save-parser.worker.js?v=0.9.3", { type: "module" });
      const requestId = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
      const finish = (result) => { worker.terminate(); resolve(result); };
      worker.onmessage = ({ data }) => {
        if (data.requestId !== requestId) return;
        if (data.type === "parsed-metadata") finish(data.result);
        else if (data.type === "parse-error") finish(null);
      };
      worker.onerror = () => finish(null);
      const transfers = [levelMeta, worldOption].filter((buffer) => buffer instanceof ArrayBuffer);
      worker.postMessage({ type: "parse-metadata", requestId, levelMeta, worldOption }, transfers);
    });
  }

  async function parseWorld(world) {
    const replacingSameWorld = activeWorld?.path === world.path;
    const previousGoal = replacingSameWorld ? {
      target: state.target,
      selectedPassives: [...state.selectedPassives],
    } : null;
    parsing = true; error = ""; progress = "Préparation de la sauvegarde…"; worldModalOpen = false; render();
    try {
      const buffer = world.levelBuffer ? world.levelBuffer.slice(0) : await world.level.arrayBuffer();
      const worker = new Worker("js/save-parser.worker.js?v=0.9.3", { type: "module" });
      const requestId = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
      worker.onmessage = async ({ data }) => {
      if (data.requestId !== requestId) return;
      if (data.type === "progress") { progress = data.stage; render(false); return; }
      if (data.type === "parse-error") {
        console.error("Échec du parsing Palworld :", data.message);
        parsing = false; updating = false; error = "La sauvegarde n’a pas pu être lue. Vérifiez qu’elle provient bien de Palworld 1.0."; worker.terminate(); render(); return;
      }
      if (data.type === "parsed-world") {
        worker.terminate();
        roster = data.result.roster.filter((individual) => palInfo(individual.speciesId));
        activeWorld = { label: world.metadata?.name || world.label, path: world.path, modified: world.modified, players: data.result.players, parseMs: data.result.parseMs, warnings: data.result.warnings };
        refreshRosterIndexes();
        state.target = previousGoal?.target || null;
        state.selectedPassives = previousGoal ? previousGoal.selectedPassives.filter((id) => allAvailable.has(id)).slice(0, 4) : [];
        treeResult = null; targetQuery = "";
        parsing = false; updating = false; updateHelpOpen = false; progress = ""; saveState();
        await dbPut(storedSaveRecord()).catch((dbError) => console.error("Échec de la sauvegarde locale du roster :", dbError));
        scheduleSolve(true);
      }
      };
      worker.onerror = (workerError) => { console.error("Échec du worker de sauvegarde :", workerError.message || workerError); parsing = false; updating = false; error = "Le module de lecture de sauvegarde n’a pas pu démarrer."; worker.terminate(); render(); };
      worker.postMessage({ type: "parse-world", requestId, level: buffer }, [buffer]);
    } catch (parseError) {
      console.error("Échec de la préparation de la sauvegarde :", parseError);
      parsing = false; updating = false; progress = ""; error = "Le fichier Level.sav n’a pas pu être ouvert."; render();
    }
  }

  async function removeSave() {
    await dbDelete(); roster = []; activeWorld = null; refreshRosterIndexes(); treeResult = null; error = ""; updating = false; updateHelpOpen = false;
    Object.assign(state, { target: null, selectedPassives: [] }); saveState(); render();
  }

  function handleClick(event) {
    if (!event.target.closest(".breeding-page--save")) return;
    if (event.target.closest("[data-import-save], [data-open-save-picker]")) { if (!parsing) content.querySelector("[data-save-directory]")?.click(); return; }
    if (event.target.closest("[data-show-update-help]")) { if (!parsing) { updateHelpOpen = true; render(false); } return; }
    if (event.target.closest("[data-copy-save-path]")) {
      const path = "%localappdata%\\Pal\\Saved\\SaveGames";
      const copy = navigator.clipboard?.writeText
        ? navigator.clipboard.writeText(path)
        : Promise.reject(new Error("Clipboard API indisponible"));
      copy.catch(() => {
        const field = document.createElement("textarea");
        field.value = path; field.style.position = "fixed"; field.style.opacity = "0"; document.body.append(field); field.select();
        document.execCommand("copy"); field.remove();
      }).then(() => {
        const button = content.querySelector("[data-copy-save-path]");
        if (button) { button.textContent = "Chemin copié"; setTimeout(() => { if (button.isConnected) button.textContent = "Copier le chemin"; }, 1600); }
      });
      return;
    }
    if (event.target.closest("[data-delete-save]")) { void removeSave(); return; }
    const targetButton = event.target.closest("[data-save-target]");
    if (targetButton) {
      state.target = targetButton.dataset.saveTarget;
      activeHistoryId = null;
      targetQuery = "";
      saveState(); scheduleSolve(true); return;
    }
    if (event.target.closest("[data-open-passives]")) { passiveModalOpen = true; passiveQuery = ""; passiveSearchShouldFocus = true; render(false); return; }
    const toggle = event.target.closest("[data-toggle-passive]");
    if (toggle && !toggle.disabled) {
      const id = toggle.dataset.togglePassive;
      state.selectedPassives = toggledPassives(state.selectedPassives, id);
      saveState(); render(false); scheduleSolve(); return;
    }
    if (event.target.closest("[data-clear-passives]")) { state.selectedPassives = []; saveState(); render(false); scheduleSolve(); return; }
    const historyPin = event.target.closest("[data-pin-history]");
    if (historyPin) {
      const entry = history.find((item) => item.id === historyPin.dataset.pinHistory);
      if (entry) { entry.pinned = !entry.pinned; history = normalizeHistoryEntries(history); saveHistory(); render(false); }
      return;
    }
    const historyDelete = event.target.closest("[data-delete-history]");
    if (historyDelete) {
      const id = historyDelete.dataset.deleteHistory; history = history.filter((entry) => entry.id !== id);
      if (activeHistoryId === id) activeHistoryId = null;
      saveHistory(); render(false); return;
    }
    const historyLoad = event.target.closest("[data-load-history]");
    if (historyLoad) {
      const entry = history.find((item) => item.id === historyLoad.dataset.loadHistory);
      if (entry) { activeHistoryId = entry.id; state.target = entry.target; state.selectedPassives = [...entry.selectedPassives]; targetQuery = ""; saveState(); scheduleSolve(true); }
      return;
    }
    if (event.target.closest("button[data-close-passive-modal]") || (event.target.matches("[data-close-passive-modal]") && shouldCloseFromBackdrop(event.target))) { passiveModalOpen = false; modalPointerDownOnBackdrop = null; render(false); return; }
    const worldChoice = event.target.closest("[data-world-index]"); if (worldChoice) { selectedWorldIndex = Number(worldChoice.dataset.worldIndex); render(false); return; }
    if (event.target.closest("[data-import-world]")) { const world = pendingWorlds[selectedWorldIndex]; if (world) void parseWorld(world); return; }
    if (event.target.closest("button[data-close-world-modal]") || (event.target.matches("[data-close-world-modal]") && shouldCloseFromBackdrop(event.target))) { worldModalOpen = false; modalPointerDownOnBackdrop = null; render(false); return; }
    if (event.target.closest("[data-clear-save-target]")) { state.target = null; activeHistoryId = null; treeResult = null; saveState(); scheduleSolve(true); return; }
  }

  function handleInput(event) {
    if (event.target.matches("[data-target-search]")) { targetQuery = event.target.value; const results = content.querySelector("[data-target-results]"); if (results) results.innerHTML = targetResults(); }
    if (event.target.matches("[data-passive-search]")) { passiveQuery = event.target.value; passiveSearchShouldFocus = true; render(false); }
  }

  function handlePointerDown(event) {
    modalPointerDownOnBackdrop = event.target.matches?.(".save-modal-backdrop") ? event.target : null;
  }

  function shouldCloseFromBackdrop(target) {
    return Boolean(target?.matches?.(".save-modal-backdrop") && modalPointerDownOnBackdrop === target);
  }

  function showTooltip(target) {
    const historyEntry = target.dataset.historyTooltip && history.find((entry) => entry.id === target.dataset.historyTooltip);
    const passive = passiveInfo(target.dataset.passiveTooltip);
    let tooltip = document.querySelector(".save-passive-tooltip");
    if (!tooltip) {
      tooltip = document.createElement("div");
      tooltip.className = "save-passive-tooltip";
      tooltip.setAttribute("role", "tooltip");
      document.body.append(tooltip);
    }
    tooltip.classList.toggle("save-history-tooltip", Boolean(historyEntry));
    tooltip.innerHTML = historyEntry
      ? `<strong>${escapeHtml(palInfo(historyEntry.target)?.name || historyEntry.target)}</strong><span class="save-history-tooltip__chips">${historyEntry.selectedPassives.length ? historyEntry.selectedPassives.map((id) => passiveChip(id)).join("") : "Aucun passif demandé"}</span>`
      : `<strong>${escapeHtml(passive.name)}</strong><span>${escapeHtml(passiveEffectText(passive.effect))}</span>`;
    tooltip.hidden = false;
    const rect = target.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    if (historyEntry) {
      const right = rect.right + 10;
      const left = right + tooltipRect.width <= window.innerWidth - 10 ? right : Math.max(10, rect.left - tooltipRect.width - 10);
      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${Math.min(window.innerHeight - tooltipRect.height - 10, Math.max(10, rect.top + rect.height / 2 - tooltipRect.height / 2))}px`;
    } else {
      const left = Math.min(window.innerWidth - tooltipRect.width - 10, Math.max(10, rect.left + rect.width / 2 - tooltipRect.width / 2));
      const above = rect.top - tooltipRect.height - 9;
      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${above >= 8 ? above : rect.bottom + 9}px`;
    }
  }

  function hideTooltip() {
    const tooltip = document.querySelector(".save-passive-tooltip");
    if (tooltip) tooltip.hidden = true;
  }

  async function handleChange(event) {
    if (!event.target.matches("[data-save-directory]")) return;
    pendingWorlds = detectWorlds(event.target.files);
    updating = Boolean(activeWorld); parsing = true; error = ""; progress = "Recherche des mondes Palworld…"; render();
    if (worldSelection(pendingWorlds) === "none") {
      parsing = false; updating = false; error = "Aucun monde Palworld valide n’a été trouvé dans ce dossier."; render(); return;
    }
    try {
      progress = "Lecture des informations des mondes…"; render(false);
      await Promise.all(pendingWorlds.map(async (world) => { world.metadata = await readWorldMetadata(world); }));
      if (worldSelection(pendingWorlds) === "direct") { await parseWorld(pendingWorlds[0]); return; }
      selectedWorldIndex = 0; worldModalOpen = true; parsing = false; render(false);
    } catch (readError) {
      console.error("Échec de la lecture du dossier de sauvegarde :", readError);
      parsing = false; updating = false; error = "Impossible d’ouvrir le fichier Level.sav de ce dossier."; render();
    }
  }

  document.addEventListener("click", handleClick);
  document.addEventListener("input", handleInput);
  document.addEventListener("change", handleChange);
  document.addEventListener("pointerdown", handlePointerDown);
  document.addEventListener("pointerover", (event) => { const target = event.target.closest("[data-passive-tooltip], [data-history-tooltip]"); if (target) showTooltip(target); });
  document.addEventListener("pointerout", (event) => { const target = event.target.closest("[data-passive-tooltip], [data-history-tooltip]"); if (target && !target.contains(event.relatedTarget)) hideTooltip(); });
  document.addEventListener("focusin", (event) => { const target = event.target.closest("[data-passive-tooltip], [data-history-tooltip]"); if (target) showTooltip(target); });
  document.addEventListener("focusout", (event) => { if (event.target.closest("[data-passive-tooltip], [data-history-tooltip]")) hideTooltip(); });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (passiveModalOpen) { passiveModalOpen = false; render(false); }
    else if (worldModalOpen) { worldModalOpen = false; render(false); }
  });

  dbGet().then((saved) => {
    const restored = normalizeStoredSave(saved);
    if (!restored) return;
    activeWorld = restored.activeWorld; roster = restored.roster;
    refreshRosterIndexes();
    scheduleSolve(true);
  }).catch(() => {});

  window.SaveCumoir = {
    template,
    render,
    setCalculating(value) { calculating = Boolean(value); render(false); },
    __test: {
      loadRoster(items) {
        roster = items;
        activeWorld = { label: "Fixture", players: [] };
        refreshRosterIndexes();
      },
      setTarget(target, selectedPassives = []) {
        state.target = target;
        state.selectedPassives = selectedPassives;
      },
      solveCarrier(options = {}) {
        return window.CarrierBreedingSolver.solve({ roster, targetId: state.target, desiredPassives: state.selectedPassives, childFor, speciesIds: species.map((pal) => pal.id), ...options });
      },
      renderGraph: graphTemplate,
      eggKind,
      childFor,
      rosterCard,
      rosterList,
      targetResults,
      searchPassives,
      passiveModal,
      passivesPanel,
      passiveClass,
      toggledPassives,
      isSpeciesKnown,
      cameraAroundPoint,
      fittedCamera,
      visibleViewportCenter,
      centeredCamera,
      pannedCamera,
      scaleLimits: { min: MIN_SCALE, max: MAX_SCALE },
      handlePointerDown,
      shouldCloseFromBackdrop,
      sexIcon,
      historyPlanKey,
      normalizeHistoryEntries,
      upsertHistoryEntries,
      historyPanel,
      historyPinIcon,
      detectWorlds,
      worldSelection,
      normalizeStoredSave,
      storedSaveRecord,
    },
  };
})();
