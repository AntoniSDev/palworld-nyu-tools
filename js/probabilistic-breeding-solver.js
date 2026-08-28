/* Palworld Nyu Tools — solveur probabiliste indépendant du calcul historique. GPL-3.0. */
(() => {
  "use strict";

  const EPSILON = 1e-9;

  function bits(value) {
    let count = 0;
    for (let remaining = value; remaining; remaining &= remaining - 1) count += 1;
    return count;
  }

  function normalizeSex(sex) {
    return sex === "Male" || sex === "Female" ? sex : "Unknown";
  }

  function compareStates(a, b) {
    if (Math.abs(a.cost - b.cost) > EPSILON) return a.cost - b.cost;
    return a.stepCount - b.stepCount
      || a.maxUnknownExtras - b.maxUnknownExtras
      || b.ownedSources - a.ownedSources
      || a.speciesId.localeCompare(b.speciesId)
      || String(a.individualId || a.signature).localeCompare(String(b.individualId || b.signature));
  }

  class Queue {
    constructor() { this.items = []; }
    get size() { return this.items.length; }
    push(item) {
      let index = this.items.length;
      this.items.push(item);
      while (index) {
        const parent = Math.floor((index - 1) / 2);
        if (compareStates(this.items[parent], item) <= 0) break;
        this.items[index] = this.items[parent]; index = parent;
      }
      this.items[index] = item;
    }
    pop() {
      if (!this.items.length) return null;
      const first = this.items[0];
      const tail = this.items.pop();
      if (this.items.length) {
        let index = 0;
        while (true) {
          const left = index * 2 + 1;
          if (left >= this.items.length) break;
          const right = left + 1;
          const child = right < this.items.length && compareStates(this.items[right], this.items[left]) < 0 ? right : left;
          if (compareStates(tail, this.items[child]) <= 0) break;
          this.items[index] = this.items[child]; index = child;
        }
        this.items[index] = tail;
      }
      return first;
    }
  }

  function solve(input) {
    const probability = window.PassiveProbability;
    if (!probability) return { error: "Le module de probabilités n’est pas disponible." };
    const { roster, targetId, desiredPassives, childFor } = input;
    const startedAt = performance.now();
    const desiredIndex = new Map(desiredPassives.map((id, index) => [id, index]));
    const fullMask = (1 << desiredPassives.length) - 1;
    const targetKey = String(targetId).toLowerCase();
    const unique = (ids) => [...new Set(ids || [])];
    const maskOf = (ids) => unique(ids).reduce((mask, id) => {
      const index = desiredIndex.get(id); return index === undefined ? mask : mask | (1 << index);
    }, 0);
    const owned = roster.map((pal, index) => {
      const passiveIds = unique(pal.passives);
      const mask = maskOf(passiveIds);
      return {
        speciesId: pal.speciesId, mask, exactPassives: passiveIds,
        maxUnknownExtras: passiveIds.filter((id) => !desiredIndex.has(id)).length,
        sex: normalizeSex(pal.sex), owned: true, individualId: pal.id || `owned-${index}`,
        cost: 0, stepCount: 0, ownedSources: 1,
        plannedJoinCount: 0,
        signature: `${pal.speciesId}|${normalizeSex(pal.sex)}|${passiveIds.slice().sort().join(",")}|${pal.id || index}`,
      };
    }).sort(compareStates);

    const existing = owned.filter((pal) => pal.speciesId.toLowerCase() === targetKey && (pal.mask & fullMask) === fullMask)
      .sort((a, b) => a.maxUnknownExtras - b.maxUnknownExtras || compareStates(a, b))[0];
    if (existing) return { summary: "Déjà présent dans votre sauvegarde", root: existing, expectedBatches: 0, expanded: 0, durationMs: performance.now() - startedAt };
    if (!owned.length) return { error: "Aucun Pal compatible n’a été trouvé dans cette sauvegarde." };
    const available = new Set(owned.flatMap((pal) => pal.exactPassives));
    const missing = desiredPassives.filter((id) => !available.has(id));
    if (missing.length) return { error: "Un ou plusieurs passifs choisis sont absents de cette sauvegarde." };

    const representativeOwned = [];
    const byEquivalentRole = new Map();
    for (const pal of owned) {
      const key = `${pal.speciesId.toLowerCase()}|${pal.sex}|${pal.mask}`;
      const group = byEquivalentRole.get(key) || [];
      const passiveSet = new Set(pal.exactPassives);
      if (group.some((kept) => kept.exactPassives.every((id) => passiveSet.has(id)))) continue;
      const survivors = group.filter((kept) => !pal.exactPassives.every((id) => new Set(kept.exactPassives).has(id)));
      survivors.push(pal); byEquivalentRole.set(key, survivors);
    }
    byEquivalentRole.forEach((group) => representativeOwned.push(...group));
    representativeOwned.sort(compareStates);

    const keyOf = (pal) => `${pal.speciesId.toLowerCase()}|${pal.mask}|${pal.maxUnknownExtras}|${pal.sex}`;
    const bestExact = new Map();
    const pareto = new Map();
    const queue = new Queue();
    const settled = [];
    const settledBySpecies = new Map();
    const settledByMaskAndSex = new Map();
    const targetPartners = new Map();
    const partnerActionCache = new Map();
    let bestAnswer = null;
    let bestBranchedAnswer = null;
    let expanded = 0;
    const joinStats = { considered: 0, noMaskGain: 0, stale: 0, invalid: 0, generated: 0 };

    const speciesIds = (input.speciesIds || [...new Set(owned.map((pal) => pal.speciesId))]).slice().sort();
    const sexes = ["Female", "Male"];
    for (let first = 0; first < speciesIds.length; first += 1) {
      for (let second = first; second < speciesIds.length; second += 1) {
        let reachesTarget = false;
        for (const firstSex of sexes) for (const secondSex of sexes) {
          if (firstSex !== secondSex && childFor(speciesIds[first], speciesIds[second], firstSex, secondSex)?.toLowerCase() === targetKey) reachesTarget = true;
        }
        if (!reachesTarget) continue;
        const add = (from, to) => { const set = targetPartners.get(from.toLowerCase()) || new Set(); set.add(to.toLowerCase()); targetPartners.set(from.toLowerCase(), set); };
        add(speciesIds[first], speciesIds[second]); add(speciesIds[second], speciesIds[first]);
      }
    }

    function accept(candidate) {
      if (!Number.isFinite(candidate.cost) || candidate.cost >= (bestAnswer?.cost ?? Infinity) - EPSILON) return false;
      const exactKey = keyOf(candidate);
      const previous = bestExact.get(exactKey);
      if (previous && compareStates(previous, candidate) <= 0) return false;
      const frontKey = `${candidate.speciesId.toLowerCase()}|${candidate.mask}|${candidate.sex}`;
      const front = pareto.get(frontKey) || [];
      if (front.some((item) => item.cost <= candidate.cost + EPSILON && item.maxUnknownExtras <= candidate.maxUnknownExtras)) return false;
      const removed = front.filter((item) => candidate.cost <= item.cost + EPSILON && candidate.maxUnknownExtras <= item.maxUnknownExtras);
      removed.forEach((item) => { if (bestExact.get(keyOf(item)) === item) bestExact.delete(keyOf(item)); });
      const survivors = front.filter((item) => !removed.includes(item));
      survivors.push(candidate); pareto.set(frontKey, survivors); bestExact.set(exactKey, candidate); queue.push(candidate); return true;
    }

    function validPair(a, b) {
      if (a.owned && b.owned && a.individualId === b.individualId) return false;
      return !(a.sex !== "Unknown" && b.sex !== "Unknown" && a.sex === b.sex);
    }

    function plannedPartnerActions(planned) {
      const cacheKey = `${planned.speciesId.toLowerCase()}|${planned.sex}`;
      if (partnerActionCache.has(cacheKey)) return partnerActionCache.get(cacheKey);
      const best = new Map();
      for (const partner of representativeOwned) {
        if (!validPair(planned, partner)) continue;
        const child = childFor(planned.speciesId, partner.speciesId, planned.sex, partner.sex);
        if (!child) continue;
        const key = `${child.toLowerCase()}|${partner.mask}|${partner.sex}`;
        const previous = best.get(key);
        if (!previous || partner.maxUnknownExtras < previous.maxUnknownExtras
          || (partner.maxUnknownExtras === previous.maxUnknownExtras && compareStates(partner, previous) < 0)) best.set(key, partner);
      }
      const actions = [...best.values()].sort(compareStates);
      partnerActionCache.set(cacheKey, actions);
      return actions;
    }

    function poolSize(a, b, nextMask) {
      if (a.owned && b.owned) return new Set(a.exactPassives.concat(b.exactPassives)).size;
      const outside = (pal) => pal.owned
        ? pal.exactPassives.filter((id) => {
          const index = desiredIndex.get(id); return index === undefined || (nextMask & (1 << index)) === 0;
        }).length
        : pal.maxUnknownExtras;
      return Math.min(8, bits(nextMask) + outside(a) + outside(b));
    }

    // Une route structurelle déjà connue peut servir uniquement de borne haute
    // initiale. Elle est entièrement réévaluée avec les probabilités du nouveau
    // moteur et n’influence ni sa queue ni ses règles de dominance.
    function scoreInitialRoute(node, final = false) {
      if (!node) return null;
      if (!node.parents) {
        const source = owned.find((pal) => pal.individualId === node.individualId)
          || owned.find((pal) => pal.speciesId.toLowerCase() === String(node.speciesId).toLowerCase() && pal.mask === node.mask);
        return source || null;
      }
      const first = scoreInitialRoute(node.parents[0]);
      const second = scoreInitialRoute(node.parents[1]);
      if (!first || !second || !validPair(first, second)) return null;
      if (childFor(first.speciesId, second.speciesId, first.sex, second.sex)?.toLowerCase() !== String(node.speciesId).toLowerCase()) return null;
      const mask = first.mask | second.mask;
      const extras = final ? 4 - desiredPassives.length : 0;
      const recommendation = probability.recommend(poolSize(first, second, mask), bits(mask), extras);
      if (!recommendation) return null;
      return {
        speciesId: node.speciesId, mask, maxUnknownExtras: extras, sex: normalizeSex(node.sex), owned: false,
        parents: [first, second], recommendedCake: recommendation.cake,
        cost: first.cost + second.cost + 1 / recommendation.probability,
        stepCount: first.stepCount + second.stepCount + 1,
        ownedSources: first.ownedSources + second.ownedSources,
        plannedJoinCount: first.plannedJoinCount + second.plannedJoinCount + Number(!first.owned && !second.owned),
        signature: `warm|${first.signature}>${second.signature}|${node.speciesId}|${extras}`,
      };
    }

    if (input.initialRoute) {
      const warm = scoreInitialRoute(input.initialRoute, true);
      if (warm && warm.speciesId.toLowerCase() === targetKey && (warm.mask & fullMask) === fullMask) bestAnswer = warm;
    }

    function createChildren(a, b, finalOnly = false, plannedJoin = false) {
      if (!validPair(a, b)) { if (plannedJoin) joinStats.invalid += 1; return; }
      const childSpecies = childFor(a.speciesId, b.speciesId, a.sex, b.sex);
      if (!childSpecies) { if (plannedJoin) joinStats.invalid += 1; return; }
      const nextMask = a.mask | b.mask;
      const isTarget = childSpecies.toLowerCase() === targetKey && (nextMask & fullMask) === fullMask;
      if (finalOnly && !isTarget) return;
      const desiredCount = bits(nextMask);
      const unionSize = poolSize(a, b, nextMask);
      const maxAllowed = isTarget ? 4 - desiredPassives.length : 4 - desiredCount;
      const extrasVariants = isTarget ? [maxAllowed] : Array.from({ length: maxAllowed + 1 }, (_, index) => index);
      for (const extras of extrasVariants) {
        const recommendation = probability.recommend(unionSize, desiredCount, extras);
        if (!recommendation) continue;
        const cost = a.cost + b.cost + 1 / recommendation.probability;
        const child = {
          speciesId: childSpecies, mask: nextMask, maxUnknownExtras: extras,
          sex: "Unknown", owned: false, parents: [a, b], recommendedCake: recommendation.cake,
          cost, stepCount: a.stepCount + b.stepCount + 1,
          ownedSources: a.ownedSources + b.ownedSources,
          plannedJoinCount: a.plannedJoinCount + b.plannedJoinCount + Number(!a.owned && !b.owned),
          signature: `${childSpecies}|${nextMask}|${extras}|${a.signature}>${b.signature}|${recommendation.cake}`,
        };
        if (isTarget) {
          if (child.plannedJoinCount > 0 && (!bestBranchedAnswer || compareStates(child, bestBranchedAnswer) < 0)) bestBranchedAnswer = child;
          if (!bestAnswer || compareStates(child, bestAnswer) < 0) bestAnswer = child;
        } else {
          for (const sex of ["Female", "Male"]) {
            if (accept({ ...child, sex, signature: `${child.signature}|${sex}` }) && plannedJoin) joinStats.generated += 1;
          }
        }
      }
    }

    // Tous les couples réels constituent des arêtes de coût initial nul + un batch.
    for (let first = 0; first < representativeOwned.length; first += 1) {
      for (let second = first + 1; second < representativeOwned.length; second += 1) createChildren(representativeOwned[first], representativeOwned[second]);
    }

    const maxExpanded = input.maxExpanded || 80000;
    const maxDurationMs = input.maxDurationMs || 4500;
    while (queue.size && expanded < maxExpanded && performance.now() - startedAt < maxDurationMs) {
      const current = queue.pop();
      if (!current || bestExact.get(keyOf(current)) !== current || current.cost >= (bestAnswer?.cost ?? Infinity) - EPSILON) continue;
      expanded += 1; settled.push(current);
      const speciesGroup = settledBySpecies.get(current.speciesId.toLowerCase()) || [];
      speciesGroup.push(current); settledBySpecies.set(current.speciesId.toLowerCase(), speciesGroup);
      for (const partner of plannedPartnerActions(current)) createChildren(current, partner);

      if (input.allowPlannedIntermediates !== false) {
        // Jointures multi-branches ciblées, indexées par masque et sexe. Les états
        // sont déjà des représentants Pareto coût/propreté ; les entrées devenues
        // dominées sont ignorées avant d'évaluer le croisement.
        const oppositeSex = current.sex === "Female" ? "Male" : "Female";
        for (let partnerMask = 0; partnerMask <= fullMask; partnerMask += 1) {
          const nextMask = current.mask | partnerMask;
          // Une jointure doit améliorer au moins l’une des deux branches. Une
          // amélioration unilatérale reste utile pour changer d’espèce sur le
          // chemin vers la cible, notamment avec un partenaire structurel vide.
          if (nextMask === current.mask && nextMask === partnerMask) { joinStats.noMaskGain += 1; continue; }
          const partners = settledByMaskAndSex.get(`${partnerMask}|${oppositeSex}`) || [];
          for (const partner of partners) {
            joinStats.considered += 1;
            if (bestExact.get(keyOf(partner)) !== partner) { joinStats.stale += 1; continue; }
            createChildren(current, partner, false, true);
          }
        }
      } else {
        // Mode de comparaison reproduisant la restriction historique du nouveau solveur.
        for (const partnerSpecies of targetPartners.get(current.speciesId.toLowerCase()) || []) {
          for (const partner of settledBySpecies.get(partnerSpecies) || []) {
            if (partner === current || (current.mask | partner.mask) !== fullMask) continue;
            createChildren(current, partner, true);
          }
        }
      }

      const maskSexGroup = settledByMaskAndSex.get(`${current.mask}|${current.sex}`) || [];
      maskSexGroup.push(current); settledByMaskAndSex.set(`${current.mask}|${current.sex}`, maskSexGroup);
    }

    if (!bestAnswer) return { error: "Aucune route probabiliste valide trouvée avec cette sauvegarde.", expanded, joinStats, durationMs: performance.now() - startedAt };
    return {
      summary: `${bestAnswer.stepCount} étape${bestAnswer.stepCount > 1 ? "s" : ""} d’élevage`,
      root: bestAnswer, expectedBatches: bestAnswer.cost, expanded,
      joinStats,
      bestBranched: bestBranchedAnswer ? {
        expectedBatches: bestBranchedAnswer.cost,
        stepCount: bestBranchedAnswer.stepCount,
        plannedJoinCount: bestBranchedAnswer.plannedJoinCount,
      } : null,
      durationMs: performance.now() - startedAt,
      truncated: queue.size > 0 && (expanded >= maxExpanded || performance.now() - startedAt >= maxDurationMs),
    };
  }

  window.ProbabilisticBreedingSolver = { solve, bits, compareStates };
})();
