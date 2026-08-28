/* Palworld Nyu Tools — probabilités d’héritage des passifs (Palworld 1.0+). GPL-3.0. */
(() => {
  "use strict";

  const INHERITED = [0, .4, .3, .2, .1];
  const RANDOM = [.4, .3, .2, .1];
  const MAX_PASSIVES = 4;

  function choose(total, count) {
    if (!Number.isInteger(total) || !Number.isInteger(count) || count < 0 || count > total) return 0;
    if (count === 0 || count === total) return 1;
    let value = 1;
    for (let index = 1; index <= Math.min(count, total - count); index += 1) value = value * (total - index + 1) / index;
    return value;
  }

  function standard(parentUnionSize, desiredCount, allowedExtras) {
    if (![parentUnionSize, desiredCount, allowedExtras].every(Number.isInteger)
      || parentUnionSize < 0 || parentUnionSize > 8 || desiredCount < 0
      || desiredCount > Math.min(parentUnionSize, MAX_PASSIVES)
      || allowedExtras < 0 || desiredCount + allowedExtras > MAX_PASSIVES) return 0;
    let probability = 0;
    for (let inheritedRoll = 1; inheritedRoll <= MAX_PASSIVES; inheritedRoll += 1) {
      const inheritedCount = Math.min(inheritedRoll, parentUnionSize);
      if (inheritedCount < desiredCount) continue;
      const inheritedExtras = inheritedCount - desiredCount;
      const selection = choose(parentUnionSize - desiredCount, inheritedExtras) / choose(parentUnionSize, inheritedCount);
      if (!Number.isFinite(selection) || selection <= 0) continue;
      for (let randomRoll = 0; randomRoll < RANDOM.length; randomRoll += 1) {
        const randomExtras = Math.min(randomRoll, MAX_PASSIVES - inheritedCount);
        if (inheritedExtras + randomExtras <= allowedExtras) probability += INHERITED[inheritedRoll] * selection * RANDOM[randomRoll];
      }
    }
    return probability;
  }

  function vegetable(standardProbability) {
    return standardProbability > 0 ? 1 - (1 - standardProbability) ** 2 : 0;
  }

  // Pour N > 4, la sélection uniforme des quatre passifs est une hypothèse
  // communautaire explicite : la donnée 1.0 confirme l’override à 4, pas l’ordre de sélection.
  function special(parentUnionSize, desiredCount, allowedExtras) {
    if (![parentUnionSize, desiredCount, allowedExtras].every(Number.isInteger)
      || parentUnionSize < 0 || parentUnionSize > 8 || desiredCount < 0 || allowedExtras < 0) return 0;
    const inheritedCount = Math.min(MAX_PASSIVES, parentUnionSize);
    if (desiredCount > inheritedCount || inheritedCount - desiredCount > allowedExtras) return 0;
    if (parentUnionSize <= MAX_PASSIVES) return desiredCount <= parentUnionSize ? 1 : 0;
    return choose(parentUnionSize - desiredCount, inheritedCount - desiredCount) / choose(parentUnionSize, inheritedCount);
  }

  function recommend(parentUnionSize, desiredCount, allowedExtras) {
    const probabilities = {
      standard: standard(parentUnionSize, desiredCount, allowedExtras),
      vegetable: 0,
      special: special(parentUnionSize, desiredCount, allowedExtras),
    };
    probabilities.vegetable = vegetable(probabilities.standard);
    const priority = { special: 0, vegetable: 1, standard: 2 };
    const cake = Object.keys(probabilities).filter((key) => probabilities[key] > 0).sort((a, b) =>
      probabilities[b] - probabilities[a] || priority[a] - priority[b])[0];
    return cake ? { cake, probability: probabilities[cake], probabilities } : null;
  }

  window.PassiveProbability = { choose, standard, vegetable, special, recommend };
})();
