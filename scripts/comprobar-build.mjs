import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import { join } from "node:path";

const dist = new URL("../dist/", import.meta.url);
const source = new URL("../src/content/episodes/", import.meta.url);
const html = async (path) => readFile(new URL(path, dist), "utf8");

const home = await html("index.html");
assert.match(home, /<meta property="og:image" content="https:\/\/eudemonia\.es\/og-default\.jpg"/);
assert.ok((await stat(new URL("og-default.jpg", dist))).size > 10_000);

const error = await html("404.html");
assert.match(error, /Página no encontrada/);
assert.match(error, /content="noindex,nofollow"/);
assert.match(error, /href="\/"/);

const estoicismo = await html("estoicismo/index.html");
assert.match(estoicismo, /poster="\/estoicismo\/reproductor-podcast\.webp"/);
assert.match(estoicismo, /src="\/estoicismo\/video-estoicismo\.mp4"/);
assert.ok((await stat(new URL("estoicismo/video-estoicismo.mp4", dist))).size > 20_000_000);
assert.ok((await stat(new URL("estoicismo/reproductor-podcast.webp", dist))).size > 10_000);

for (const name of ["cronotipo", "pittsburgh", "epworth", "atenas"]) {
  const page = await html(`descanso/${name}/index.html`);
  assert.match(page, /id="cookie-consent"/);
  assert.match(page, /\/descanso\/quiz\.css/);
  assert.ok(page.includes(`data-test="${name}"`), `${name}: falta el test`);
  assert.ok(page.includes("G-6H8PEESGGG"), `${name}: falta la medición`);
}

const episodes = (await readdir(source)).filter((file) => file.endsWith(".md"));
let published = 0;
let players = 0;
for (const file of episodes) {
  const content = await readFile(new URL(file, source), "utf8");
  if (/^draft:\s*true\s*$/m.test(content)) continue;
  published++;
  const page = await html(join("podcast", file.replace(/\.md$/, ""), "index.html"));
  const id = content.match(/^simplecastId:\s*["']?([\w-]+)/m)?.[1];
  if (id) {
    assert.ok(page.includes(`player.simplecast.com/${id}`), `${file}: falta el reproductor`);
    players++;
  }
}
assert.ok(published >= 60, "Faltan episodios publicados");
assert.ok(players >= 60, "Faltan reproductores Simplecast");

const feed = await html("podcast/feed.xml");
assert.equal((feed.match(/<item>/g) ?? []).length, published, "El RSS no contiene todos los episodios");

console.log(`Build comprobado: ${published} episodios en RSS y ${players} reproductores.`);
