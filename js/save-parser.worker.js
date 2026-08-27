/*
 * Read-only Palworld save parser worker.
 * Parsing stays in the browser; no save bytes leave this worker.
 * GPL-3.0 — see LICENSE and THIRD_PARTY_NOTICES.md.
 */
import { inspectWorld } from "../vendor/palworld-save-toolkit/js/migrate.js";
import { decompress as ooz } from "../vendor/ooz-wasm/index.js";

self.addEventListener("message", async ({ data }) => {
  if (data?.type !== "parse-world" || !(data.level instanceof ArrayBuffer)) return;
  try {
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

