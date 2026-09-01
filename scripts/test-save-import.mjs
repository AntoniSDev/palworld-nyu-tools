import fs from "node:fs";
import vm from "node:vm";

const storage = new Map();
const context = vm.createContext({
  console,
  setTimeout,
  clearTimeout,
  crypto: { randomUUID: () => "test" },
  indexedDB: { open: () => { throw new Error("disabled in unit test"); } },
  localStorage: { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
  document: { querySelector: () => null, addEventListener: () => {} },
  window: {},
});
context.window = context;
for (const file of ["js/condensation-data.js", "js/egg-size-data.js", "js/breeding-data.js", "js/passive-data.js", "js/save-cumoir.js"]) {
  vm.runInContext(fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8"), context, { filename: file });
}

const api = context.SaveCumoir.__test;
const source = fs.readFileSync(new URL("../js/save-cumoir.js", import.meta.url), "utf8");
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const fakeFile = (name, path, modified = 1) => ({ name, webkitRelativePath: path, lastModified: modified, arrayBuffer: async () => new ArrayBuffer(2) });

assert(source.includes('type="file" webkitdirectory directory multiple'), "The webkitdirectory input is missing.");
assert(!source.includes("showDirectoryPicker") && !source.includes("FileSystemDirectoryHandle") && !source.includes("queryPermission"), "File System Access code remains active.");

const noWorld = api.detectWorlds([fakeFile("notes.txt", "SaveGames/notes.txt")]);
assert(api.worldSelection(noWorld) === "none", "Zero-world routing failed.");

const oneWorldFiles = [
  fakeFile("Level.sav", "SaveGames/Steam/WorldA/Level.sav", 10),
  fakeFile("LevelMeta.sav", "SaveGames/Steam/WorldA/LevelMeta.sav", 10),
  fakeFile("WorldOption.sav", "SaveGames/Steam/WorldA/WorldOption.sav", 10),
  fakeFile("Level.sav", "SaveGames/Steam/WorldA/Backup/Level.sav", 20),
];
const oneWorld = api.detectWorlds(oneWorldFiles);
assert(oneWorld.length === 1, "Backup should be ignored.");
assert(api.worldSelection(oneWorld) === "direct", "One world should import directly without a modal.");
assert(oneWorld[0].levelMeta && oneWorld[0].worldOption, "Optional metadata files should remain attached to the world.");

const twoWorlds = api.detectWorlds([...oneWorldFiles, fakeFile("Level.sav", "SaveGames/Steam/WorldB/Level.sav", 30)]);
assert(twoWorlds.length === 2 && api.worldSelection(twoWorlds) === "choice", "Multiple worlds should open the chooser.");

const legacyWithExtraFields = api.normalizeStoredSave({
  activeWorld: { path: "SaveGames/Steam/WorldA/Level.sav" },
  roster: [{ id: "pal" }],
  directoryHandle: { obsolete: true },
  worldRelativePath: "Steam/WorldA",
});
assert(legacyWithExtraFields && Object.keys(legacyWithExtraFields).length === 2, "Obsolete IndexedDB fields should be ignored.");
assert(Object.keys(api.storedSaveRecord({ path: "world" }, [])).join(",") === "activeWorld,roster", "IndexedDB storage should only contain activeWorld and roster.");

assert(source.includes("data-show-update-help") && source.includes("data-open-save-picker"), "The manual update help flow is missing.");
assert(source.includes("Sélectionnez à nouveau votre dossier") && source.includes("%localappdata%\\\\Pal\\\\Saved\\\\SaveGames"), "The update path reminder is missing.");
assert(/worldSelection\(pendingWorlds\) === "direct"[^]*parseWorld\(pendingWorlds\[0\]\)/.test(source), "Single-world direct import is not wired to parsing.");
assert(/const replacingSameWorld = activeWorld\?\.path === world\.path/.test(source), "Same-world target/passive preservation is missing.");

console.log(JSON.stringify({ webkitdirectory: true, backupIgnored: true, zeroWorld: true, oneWorldDirect: true, multipleWorldChoice: true, legacyIndexedDb: true, updateHelp: true }));
