import assert from "node:assert/strict";
import fs from "node:fs";

const html = fs.readFileSync("index.html", "utf8");
const app = fs.readFileSync("js/app.js", "utf8");
const css = fs.readFileSync("css/styles.css", "utf8");

assert.match(html, /<body data-view="home">/);
assert.match(html, /class="brand" href="#accueil"/);
assert.doesNotMatch(html, /class="site-nav"/);
assert.match(app, /\["", "home"\]/);
assert.match(app, /\["#accueil", "home"\]/);

const destinations = ["#cumoir", "#capacites", "#optimisation", "#guide", "#condensation", "#memo"];
for (const destination of destinations) {
  assert(app.includes(`href: "${destination}"`), `Carte d’accueil absente : ${destination}`);
}
assert.equal((app.match(/view: "(?:breeding|jobs|work|guide|condensation|memo)"/g) || []).length, 6);
assert.match(app, /class="home-tools"/);
assert.match(app, /data-tool-switcher aria-haspopup="menu" aria-expanded="false"/);
assert.match(app, /event\.key !== "Escape"/);
assert.match(css, /\.home-tools\s*\{[^}]*grid-template-columns:\s*repeat\(3,/s);
assert.match(css, /\.tool-nav\s*\{/);

for (const asset of [
  "assets/ui/breeding-farm.webp",
  "assets/ui/technology-book-g2.webp",
  "assets/ui/treasure-map-01.webp",
  "assets/ui/palbox.png",
  "assets/structures/pal-essence-condenser-icon.png",
]) assert(fs.existsSync(asset), `Asset d’accueil absent : ${asset}`);

assert.match(app, /icons: jobs\.map\(\(job\) => job\.icon\)/);
assert.match(css, /\.home-tool-card__visual--mosaic\s*\{[^}]*place-content:\s*center;/s);
assert.match(css, /\.home-tool-card:nth-child\(5\)[^}]*object-fit:\s*contain;/s);
assert.match(css, /\.tool-nav\s*\{[^}]*width:\s*min\(1180px, 100%\);[^}]*margin:\s*-18px auto 24px;/s);

console.log("Accueil et navigation des outils : OK");
