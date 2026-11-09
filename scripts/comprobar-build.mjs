import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { comprobarSuscripcion } from "./comprobar-suscripcion.mjs";

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
  assert.ok(page.includes('¿Primera vez en el podcast?') && page.includes('Mira por dónde empezar →'), `${file}: falta el acceso a la guía`);
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

// La guía es una página estática, fuera del feed de episodios.
const guideHref = "/podcast/empieza-aqui/";
const guide = await html("podcast/empieza-aqui/index.html");
assert.match(guide, /<title>Empieza aquí · Podcast Eudemonía<\/title>/);
assert.ok(guide.includes(`rel="canonical" href="https://eudemonia.es${guideHref}"`));
assert.ok(!guide.includes('name="robots" content="noindex'));
assert.ok((await html("sitemap-0.xml")).includes(guideHref));
assert.ok(!feed.includes(guideHref), "La guía no es un episodio RSS");
const podcastIndex = await html("podcast/index.html");
for (let n = 1; n <= 8; n++) {
  assert.ok(guide.includes(`id="itinerario-${n}"`), `Falta itinerario ${n}`);
  assert.ok(guide.includes(`href="#itinerario-${n}"`), `Falta botón ${n}`);
  assert.ok(podcastIndex.includes(`href="${guideHref}#itinerario-${n}"`), `Falta acceso desde índice ${n}`);
}
const recommendedSlugs = [...new Set([...guide.matchAll(/href="\/podcast\/(ep[^"/]+)\/"/g)].map(m => m[1]))];
assert.ok(recommendedSlugs.length >= 46, "Faltan episodios recomendados");
for (const slug of recommendedSlugs) {
  assert.ok(episodes.includes(`${slug}.md`), `Episodio desconocido: ${slug}`);
  assert.ok((await html(`podcast/${slug}/index.html`)).includes("player.simplecast.com/"), `${slug}: destino sin reproductor`);
}
console.log(`Guía del podcast: ocho itinerarios y ${recommendedSlugs.length} destinos con reproductor comprobados.`);

comprobarSuscripcion({ home, epistolas: await html("epistolas/index.html") });
assert.ok((await html("libro/index.html")).includes('action="https://dashboard.mailerlite.com/jsonp/2756175/forms/202778184196818343/subscribe"'), "Libro: el formulario debe pertenecer a la cuenta nueva EDE");
assert.ok(estoicismo.includes('action="https://dashboard.mailerlite.com/jsonp/2756175/forms/202778185704670640/subscribe"'), "Estoicismo: el formulario debe pertenecer a la cuenta nueva EDE");
console.log("Suscripción de epístolas y acceso desde la home comprobados.");

const graciasCtv = await html("creatuvida/gracias-ctv/index.html");
assert.match(graciasCtv, /Gracias de corazón/);
assert.match(graciasCtv, /content="noindex,nofollow"/);
assert.match(graciasCtv, /href="https:\/\/eudemonia\.es\/creatuvida\/gracias-ctv\/"/);
assert.match(graciasCtv, /name="_kb_form_id" value="3431_3db68d-cd"/);
assert.equal((graciasCtv.match(/name="kb_field_\d"/g) ?? []).length, 8);
assert.ok(!(await html("sitemap-0.xml")).includes("/creatuvida/gracias-ctv/"));
console.log("Gracias CTV: canonical, formulario, noindex y exclusión del sitemap correctos.");
