/* Palworld Nyu Tools — planificateur exact de carriers d’élevage. GPL-3.0. */
(() => {
  "use strict";

  const UNKNOWN = 0xffffffff;
  const NO_PARENT = -1;

  function normalizeSex(sex) {
    return sex === "Male" || sex === "Female" ? sex : null;
  }

  function compareLabel(a, b) {
    return a.cost - b.cost
      || a.depth - b.depth
      || a.planned - b.planned
      || b.ownedLeaves - a.ownedLeaves
      || a.stable - b.stable;
  }

  class Queue {
    constructor(capacity, compare) {
      this.heap = new Int32Array(capacity);
      this.positions = new Int32Array(capacity);
      this.positions.fill(-1);
      this.length = 0;
      this.compare = compare;
    }

    get size() { return this.length; }

    less(a, b) { return this.compare(a, b) < 0; }

    swap(a, b) {
      const first = this.heap[a];
      const second = this.heap[b];
      this.heap[a] = second;
      this.heap[b] = first;
      this.positions[first] = b;
      this.positions[second] = a;
    }

    update(state) {
      let index = this.positions[state];
      if (index < 0) {
        index = this.length;
        this.length += 1;
        this.heap[index] = state;
        this.positions[state] = index;
      }
      while (index > 0) {
        const parent = (index - 1) >> 1;
        if (!this.less(this.heap[index], this.heap[parent])) break;
        this.swap(index, parent);
        index = parent;
      }
    }

    pop() {
      if (!this.length) return -1;
      const result = this.heap[0];
      this.positions[result] = -1;
      this.length -= 1;
      if (this.length) {
        const tail = this.heap[this.length];
        this.heap[0] = tail;
        this.positions[tail] = 0;
        let index = 0;
        while (true) {
          const left = index * 2 + 1;
          if (left >= this.length) break;
          const right = left + 1;
          const child = right < this.length && this.less(this.heap[right], this.heap[left]) ? right : left;
          if (!this.less(this.heap[child], this.heap[index])) break;
          this.swap(index, child);
          index = child;
        }
      }
      return result;
    }
  }

  function solve(input) {
    const startedAt = performance.now();
    const finish = (result) => ({ ...result, durationMs: performance.now() - startedAt });
    const roster = Array.isArray(input?.roster) ? input.roster : [];
    const desired = [...new Set(input?.desiredPassives || [])].slice(0, 4);
    const speciesIds = [...new Set([...(input?.speciesIds || []), input?.targetId].filter(Boolean).map(String))];
    const speciesIndex = new Map(speciesIds.map((id, index) => [id.toLowerCase(), index]));
    const target = speciesIndex.get(String(input?.targetId || "").toLowerCase());

    if (target === undefined) return finish({ status: "no-route", reason: "missing-target", stats: { expanded: 0, combinations: 0 } });
    if (!roster.length) return finish({ status: "no-route", reason: "empty-roster", stats: { expanded: 0, combinations: 0 } });
    if (typeof input.childFor !== "function") return finish({ status: "interrupted", reason: "missing-breeding-data", stats: { expanded: 0, combinations: 0 } });

    const desiredIndex = new Map(desired.map((id, index) => [id, index]));
    const maskCount = 1 << desired.length;
    const fullMask = maskCount - 1;
    const maskOf = (passives) => [...new Set(passives || [])].reduce((mask, id) => {
      const bit = desiredIndex.get(id);
      return bit === undefined ? mask : mask | (1 << bit);
    }, 0);

    const available = new Set(roster.flatMap((pal) => Array.isArray(pal.passives) ? pal.passives : []));
    const missingPassiveIds = desired.filter((id) => !available.has(id));
    if (missingPassiveIds.length) return finish({ status: "missing-passive", missingPassiveIds, stats: { expanded: 0, combinations: 0 } });

    const encode = (species, sex, mask) => ((species * 2 + sex) * maskCount) + mask;
    const decode = (state) => {
      const mask = state % maskCount;
      const value = (state - mask) / maskCount;
      return { species: value >> 1, sex: value & 1, mask };
    };
    const stateCount = speciesIds.length * 2 * maskCount;
    const stateSpecies = new Uint16Array(stateCount);
    const stateSex = new Uint8Array(stateCount);
    const stateMask = new Uint8Array(stateCount);
    for (let species = 0; species < speciesIds.length; species += 1) {
      for (let sex = 0; sex < 2; sex += 1) {
        for (let mask = 0; mask < maskCount; mask += 1) {
          const state = encode(species, sex, mask);
          stateSpecies[state] = species;
          stateSex[state] = sex;
          stateMask[state] = mask;
        }
      }
    }
    const sourceByState = new Array(stateCount).fill(null);

    const candidates = roster.map((pal, index) => ({
      individualId: String(pal.id || `owned-${index}`),
      species: speciesIndex.get(String(pal.speciesId || "").toLowerCase()),
      sexName: normalizeSex(pal.sex),
      mask: maskOf(pal.passives),
      passives: [...new Set(pal.passives || [])],
      level: Number(pal.level) || 0,
      nickname: pal.nickname || "",
    })).filter((pal) => pal.species !== undefined && pal.sexName);

    const compareId = (a, b) => a.individualId < b.individualId ? -1 : a.individualId > b.individualId ? 1 : 0;
    candidates.sort((a, b) => b.level - a.level || compareId(a, b));
    for (const pal of candidates) {
      const sex = pal.sexName === "Male" ? 1 : 0;
      const state = encode(pal.species, sex, pal.mask);
      if (!sourceByState[state]) sourceByState[state] = pal;
    }

    const existingStates = [encode(target, 0, fullMask), encode(target, 1, fullMask)];
    const existing = existingStates.map((state) => sourceByState[state]).filter(Boolean)
      .sort((a, b) => b.level - a.level || compareId(a, b))[0];
    const ownedNode = (pal) => ({
      speciesId: speciesIds[pal.species], mask: pal.mask, exactPassives: pal.passives,
      sex: pal.sexName, owned: true, individualId: pal.individualId, level: pal.level, nickname: pal.nickname,
    });
    if (existing) return finish({ status: "already-owned", root: ownedNode(existing), breedingCount: 0, depth: 0, stats: { expanded: 0, combinations: 0, states: sourceByState.filter(Boolean).length } });

    const costs = new Float64Array(stateCount); costs.fill(Infinity);
    const depths = new Uint32Array(stateCount); depths.fill(UNKNOWN);
    const planned = new Uint32Array(stateCount); planned.fill(UNKNOWN);
    const ownedLeaves = new Uint32Array(stateCount);
    const stable = new Float64Array(stateCount); stable.fill(Number.MAX_SAFE_INTEGER);
    const parentA = new Int32Array(stateCount); parentA.fill(NO_PARENT);
    const parentB = new Int32Array(stateCount); parentB.fill(NO_PARENT);
    const settled = new Uint8Array(stateCount);
    const settledBySex = [new Int32Array(stateCount), new Int32Array(stateCount)];
    const settledCountBySex = new Uint32Array(2);
    const label = (state) => ({ cost: costs[state], depth: depths[state], planned: planned[state], ownedLeaves: ownedLeaves[state], stable: stable[state] });
    const compareStates = (a, b) => costs[a] - costs[b]
      || depths[a] - depths[b]
      || planned[a] - planned[b]
      || ownedLeaves[b] - ownedLeaves[a]
      || stable[a] - stable[b]
      || a - b;
    const queue = new Queue(stateCount, compareStates);

    function dominatedBySuperset(state, candidate) {
      const species = stateSpecies[state];
      const sex = stateSex[state];
      const mask = stateMask[state];
      for (let superset = mask; superset < maskCount; superset += 1) {
        if ((superset | mask) !== superset) continue;
        const other = encode(species, sex, superset);
        if (other === state || !Number.isFinite(costs[other])) continue;
        if (compareLabel(label(other), candidate) <= 0) return true;
      }
      return false;
    }

    function relax(state, next, first = NO_PARENT, second = NO_PARENT) {
      if (settled[state]) return false;
      if (Number.isFinite(costs[state])) {
        const order = next.cost - costs[state]
          || next.depth - depths[state]
          || next.planned - planned[state]
          || ownedLeaves[state] - next.ownedLeaves
          || next.stable - stable[state];
        if (order >= 0) return false;
      }
      if (dominatedBySuperset(state, next)) return false;
      costs[state] = next.cost;
      depths[state] = next.depth;
      planned[state] = next.planned;
      ownedLeaves[state] = next.ownedLeaves;
      stable[state] = next.stable;
      parentA[state] = first;
      parentB[state] = second;
      queue.update(state);
      return true;
    }

    let sourceRank = 0;
    for (let state = 0; state < stateCount; state += 1) {
      if (!sourceByState[state]) continue;
      relax(state, { cost: 0, depth: 0, planned: 0, ownedLeaves: 1, stable: sourceRank });
      sourceRank += 1;
    }

    const childMatrix = new Int16Array(speciesIds.length * speciesIds.length); childMatrix.fill(-2);
    function childOf(maleSpecies, femaleSpecies) {
      const offset = maleSpecies * speciesIds.length + femaleSpecies;
      if (childMatrix[offset] !== -2) return childMatrix[offset];
      const childId = input.childFor(speciesIds[maleSpecies], speciesIds[femaleSpecies], "Male", "Female");
      childMatrix[offset] = childId == null ? -1 : (speciesIndex.get(String(childId).toLowerCase()) ?? -1);
      return childMatrix[offset];
    }
    for (let male = 0; male < speciesIds.length; male += 1) {
      for (let female = 0; female < speciesIds.length; female += 1) childOf(male, female);
    }

    const maxCombinations = Number.isFinite(input.maxCombinations) ? Math.max(0, input.maxCombinations) : Infinity;
    let expanded = 0;
    let combinations = 0;
    let generated = sourceRank;
    let answer = -1;
    let interrupted = false;
    let bestTargetCost = Infinity;

    while (queue.size) {
      const current = queue.pop();
      if (current < 0 || settled[current]) continue;
      if (dominatedBySuperset(current, label(current))) continue;
      settled[current] = 1;
      expanded += 1;
      const currentSpecies = stateSpecies[current];
      const currentSex = stateSex[current];
      const currentMask = stateMask[current];
      if (currentSpecies === target && currentMask === fullMask) {
        answer = current;
        break;
      }

      const partners = settledBySex[currentSex ^ 1];
      const partnerCount = settledCountBySex[currentSex ^ 1];
      for (let index = 0; index < partnerCount; index += 1) {
        if (combinations >= maxCombinations) { interrupted = true; break; }
        const partner = partners[index];
        combinations += 1;
        const candidateCost = costs[current] + costs[partner] + 1;
        if (candidateCost > bestTargetCost) continue;
        const partnerSpecies = stateSpecies[partner];
        const maleSpecies = currentSex ? currentSpecies : partnerSpecies;
        const femaleSpecies = currentSex ? partnerSpecies : currentSpecies;
        const child = childMatrix[maleSpecies * speciesIds.length + femaleSpecies];
        if (child < 0) continue;
        const childMask = currentMask | stateMask[partner];
        const first = Math.min(current, partner);
        const second = Math.max(current, partner);
        const next = {
          cost: candidateCost,
          depth: Math.max(depths[current], depths[partner]) + 1,
          planned: planned[current] + planned[partner] + 1,
          ownedLeaves: ownedLeaves[current] + ownedLeaves[partner],
          stable: first * stateCount + second,
        };
        for (let sex = 0; sex < 2; sex += 1) {
          if (relax(encode(child, sex, childMask), next, current, partner)) {
            generated += 1;
            if (child === target && childMask === fullMask) bestTargetCost = Math.min(bestTargetCost, candidateCost);
          }
        }
      }
      if (interrupted) break;
      settledBySex[currentSex][settledCountBySex[currentSex]] = current;
      settledCountBySex[currentSex] += 1;
    }

    const stats = { expanded, combinations, generated, states: stateCount };
    if (interrupted) return finish({ status: "interrupted", reason: "safety-limit", stats });
    if (answer < 0) return finish({ status: "no-route", stats });

    function buildNode(state) {
      const data = decode(state);
      const source = sourceByState[state];
      if (costs[state] === 0 && source) return ownedNode(source);
      const first = buildNode(parentA[state]);
      const second = buildNode(parentB[state]);
      return {
        speciesId: speciesIds[data.species], mask: data.mask, sex: data.sex ? "Male" : "Female",
        owned: false, parents: [first, second], breedingCount: costs[state], depth: depths[state],
      };
    }

    return finish({ status: "found", root: buildNode(answer), breedingCount: costs[answer], depth: depths[answer], stats });
  }

  window.CarrierBreedingSolver = { solve, compareLabel };
})();
