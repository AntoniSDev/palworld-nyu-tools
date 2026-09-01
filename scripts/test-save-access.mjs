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
const fakeFile = (name, modified = 1) => ({ name, lastModified: modified, arrayBuffer: async () => new ArrayBuffer(2) });
const fileHandle = (file) => ({ kind: "file", name: file.name, getFile: async () => file });
const directoryHandle = (name, children, permission = "granted") => ({
  kind: "directory",
  name,
  async *entries() { for (const entry of Object.entries(children)) yield entry; },
  async getDirectoryHandle(childName) {
    const child = children[childName];
    if (!child || child.kind !== "directory") { const error = new Error("missing"); error.name = "NotFoundError"; throw error; }
    return child;
  },
  async getFileHandle(childName) {
    const child = children[childName];
    if (!child || child.kind !== "file") { const error = new Error("missing"); error.name = "NotFoundError"; throw error; }
    return child;
  },
  async queryPermission() { return permission; },
  async requestPermission() { return permission; },
});
const world = (name, modified) => directoryHandle(name, {
  "Level.sav": fileHandle(fakeFile("Level.sav", modified)),
  "LevelMeta.sav": fileHandle(fakeFile("LevelMeta.sav", modified)),
});
const root = directoryHandle("SaveGames", {
  Steam: directoryHandle("Steam", {
    WorldA: world("WorldA", 10),
    WorldB: world("WorldB", 20),
    Backup: directoryHandle("Backup", { Old: world("Old", 30) }),
  }),
});

assert(api.supportsDirectoryPicker() === false, "Feature detection should use showDirectoryPicker.");
context.showDirectoryPicker = async () => root;
assert(api.supportsDirectoryPicker() === true, "File System Access support was not detected.");
delete context.showDirectoryPicker;

const worlds = await api.detectWorldsFromHandle(root);
assert(worlds.length === 2, "DirectoryHandle scan should find two worlds and ignore Backup.");
assert(worlds[0].relativePath === "Steam/WorldB", "Worlds should retain their relative path and sort by date.");
assert((await api.worldAtRelativePath(root, "Steam/WorldA")).path === "Steam/WorldA/Level.sav", "Remembered world lookup failed.");
assert(api.chooseWorldAction([], "", "").type === "none", "Zero-world routing failed.");
assert(api.chooseWorldAction([worlds[0]], "", "").type === "direct", "One-world routing should import directly.");
assert(api.chooseWorldAction(worlds, "", "").type === "choice", "Multiple worlds should open the chooser.");
assert(api.chooseWorldAction(worlds, "Steam/WorldA", "").world.relativePath === "Steam/WorldA", "Remembered world should bypass the chooser.");
assert(api.chooseWorldAction(worlds, "missing", "legacy/WorldB/Level.sav").world.relativePath === "Steam/WorldB", "Legacy path migration should recover the same world.");

let requests = 0;
assert(await api.ensureReadPermission({ queryPermission: async () => "granted", requestPermission: async () => { requests += 1; return "granted"; } }), "Granted permission should pass.");
assert(requests === 0, "Granted permission should not be requested again.");
assert(await api.ensureReadPermission({ queryPermission: async () => "prompt", requestPermission: async () => { requests += 1; return "granted"; } }), "Prompt permission should be requestable.");
assert(requests === 1, "Prompt permission should issue one request.");
assert(!await api.ensureReadPermission({ queryPermission: async () => "denied", requestPermission: async () => { requests += 1; return "granted"; } }), "Denied permission should fail without a request.");
assert(requests === 1, "Denied permission should not invoke requestPermission.");

const legacy = api.normalizeStoredSave({ activeWorld: { path: "old/Level.sav" }, roster: [] });
assert(legacy && legacy.directoryHandle === null && legacy.worldRelativePath === "", "Legacy IndexedDB records should remain valid.");
assert(api.normalizeStoredSave(null) === null, "Invalid stored records should be ignored.");
const linked = api.storedSaveRecord({ path: "Steam/WorldA/Level.sav" }, [{ id: "pal" }], root, "Steam/WorldA");
assert(linked.directoryHandle === root && linked.worldRelativePath === "Steam/WorldA", "Directory handle and world path should be persisted together.");
assert(api.isSameWorld({ path: "legacy/WorldA/Level.sav" }, worlds.find((entry) => entry.relativePath === "Steam/WorldA")), "The same world should preserve the current target and passives after migration.");

const fallbackFiles = [
  Object.assign(fakeFile("Level.sav", 1), { webkitRelativePath: "SaveGames/Only/Level.sav" }),
  Object.assign(fakeFile("Level.sav", 2), { webkitRelativePath: "SaveGames/Only/Backup/Level.sav" }),
];
const fallbackWorlds = api.detectWorlds(fallbackFiles);
assert(fallbackWorlds.length === 1, "webkitdirectory fallback should retain its world detection rules.");
assert(api.chooseWorldAction(fallbackWorlds).type === "direct", "Fallback with one world should import directly.");
assert(source.includes('showDirectoryPicker({ id: "palworld-savegames", mode: "read" })'), "The primary picker must remain read-only and stable.");
assert(source.includes('type="file" webkitdirectory directory multiple'), "The webkitdirectory fallback is missing.");
assert(source.includes('role="status" aria-live="polite"') && source.includes("Mise à jour…"), "Accessible success toast or loading label is missing.");

console.log(JSON.stringify({ fileSystemAccess: true, worlds: worlds.map((entry) => entry.relativePath), permissionTests: true, legacyMigration: true, fallback: true }));
