/*
 * Read-only Palworld save parser worker.
 * Parsing stays in the browser; no save bytes leave this worker.
 * GPL-3.0 — see LICENSE and THIRD_PARTY_NOTICES.md.
 */
self.addEventListener("message", async ({ data }) => {
  if (!data?.type) return;
  try {
    const [{ inspectWorld }, { decompress: ooz }, { decompressSav }, { GvasFile, PALWORLD_TYPE_HINTS }] = await Promise.all([
      import("../vendor/palworld-save-toolkit/js/migrate.js"),
      import("../vendor/ooz-wasm/index.js"),
      import("../vendor/palworld-save-toolkit/js/sav.js"),
      import("../vendor/palworld-save-toolkit/js/gvas.js"),
    ]);

    if (data.type === "parse-metadata") {
      const readSave = async (buffer) => {
        if (!(buffer instanceof ArrayBuffer)) return null;
        const { gvas } = await decompressSav(new Uint8Array(buffer), ooz);
        return GvasFile.read(gvas, PALWORLD_TYPE_HINTS, {}).properties;
      };
      const valueOf = (property) => {
        if (property == null) return null;
        let value = property.value;
        while (value && typeof value === "object" && !Array.isArray(value) && "value" in value && Object.keys(value).length <= 3) value = value.value;
        return typeof value === "bigint" ? value.toString() : value;
      };
      const [metaResult, optionsResult] = await Promise.allSettled([readSave(data.levelMeta), readSave(data.worldOption)]);
      const meta = metaResult.status === "fulfilled" ? metaResult.value : null;
      const options = optionsResult.status === "fulfilled" ? optionsResult.value : null;
      const base = meta?.SaveData?.value || {};
      const settings = options?.OptionWorldData?.value?.Settings?.value || {};
      const ticks = meta?.Timestamp?.value;
      let savedAt = null;
      if (typeof ticks === "bigint" && ticks >= 621355968000000000n) {
        // Palworld stores this FDateTime as local wall-clock ticks (no timezone).
        savedAt = new Date(Number((ticks - 621355968000000000n) / 10000n)).toISOString().replace(/Z$/, "");
      }
      self.postMessage({ type: "parsed-metadata", requestId: data.requestId, result: {
        name: valueOf(base.WorldName),
        playerName: valueOf(base.HostPlayerName),
        playerLevel: valueOf(base.HostPlayerLevel),
        day: valueOf(base.InGameDay),
        multiplayer: valueOf(settings.bIsMultiplay),
        savedAt,
      } });
      return;
    }

    if (data.type !== "parse-world" || !(data.level instanceof ArrayBuffer)) return;
    self.postMessage({ type: "progress", requestId: data.requestId, stage: "Chargement du lecteur de sauvegarde…" });
    self.postMessage({ type: "progress", requestId: data.requestId, stage: "Décompression de la sauvegarde…" });
    const started = performance.now();
    const parsed = await inspectWorld(new Uint8Array(data.level), ooz);
    const roster = parsed.pals.map((pal) => ({
      id: pal.instanceId,
      speciesId: String(pal.species || pal.characterId || "").replace(/^BOSS_/i, ""),
      characterId: pal.characterId,
      nickname: pal.nickname || "",
      sex: pal.gender === "Male" || pal.gender === "Female" ? pal.gender : "Unknown",
      level: Number(pal.level) || 1,
      passives: Array.isArray(pal.passives) ? pal.passives.slice(0, 4) : [],
    }));
    self.postMessage({
      type: "parsed-world",
      requestId: data.requestId,
      result: {
        roster,
        players: parsed.players.map((player) => ({
          id: player.uid,
          name: player.nickname,
          level: Number(player.level) || 0,
        })),
        warnings: parsed.warnings || [],
        parseMs: Math.round(performance.now() - started),
      },
    });
  } catch (error) {
    self.postMessage({
      type: "parse-error",
      requestId: data.requestId,
      message: error instanceof Error ? error.message : String(error),
    });
  }
});
