/* Palworld Nyu Tools — probabilité de transmission des passifs (Palworld 1.0+). GPL-3.0. */
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

  function inheritance(parentUnionSize, desiredCount, allowedExtras) {
    if (![parentUnionSize, desiredCount, allowedExtras].every(Number.isInteger)
      || parentUnionSize < 0 || parentUnionSize > 8 || desiredCount < 0
      || desiredCount > Math.min(parentUnionSize, MAX_PASSIVES)
      || allowedExtras < 0 || desiredCount + allowedExtras > MAX_PASSIVES) return 0;
    let result = 0;
    for (let inheritedRoll = 1; inheritedRoll <= MAX_PASSIVES; inheritedRoll += 1) {
      const inheritedCount = Math.min(inheritedRoll, parentUnionSize);
      if (inheritedCount < desiredCount) continue;
      const inheritedExtras = inheritedCount - desiredCount;
      const selection = choose(parentUnionSize - desiredCount, inheritedExtras) / choose(parentUnionSize, inheritedCount);
      if (!Number.isFinite(selection) || selection <= 0) continue;
      for (let randomRoll = 0; randomRoll < RANDOM.length; randomRoll += 1) {
        const randomExtras = Math.min(randomRoll, MAX_PASSIVES - inheritedCount);
        if (inheritedExtras + randomExtras <= allowedExtras) result += INHERITED[inheritedRoll] * selection * RANDOM[randomRoll];
      }
    }
    return result;
  }

  window.PassiveProbability = { choose, inheritance };
})();
