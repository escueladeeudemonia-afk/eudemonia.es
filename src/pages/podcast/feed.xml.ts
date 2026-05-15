import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  const episodes = (await getCollection("episodes", ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime()
  );

  return rss({
    title: "Podcast Eudemonía",
    description:
      "Conversaciones sobre cómo vivir una buena vida. Pablo Tovar entrevista a científicos, filósofos, emprendedores, maestros, deportistas y gente corriente que ha tomado decisiones extraordinarias.",
    site: context.site ?? "https://eudemonia.es",
    items: episodes.map((ep) => ({
      title: ep.data.title,
      description: ep.data.description,
      pubDate: ep.data.pubDate,
      link: `/podcast/${ep.slug}`,
      ...(ep.data.audioUrl && {
        enclosure: {
          url: ep.data.audioUrl,
          length: 0,
          type: "audio/mpeg",
        },
      }),
    })),
    customData: `<language>es-ES</language>
<copyright>Fundación Escuela de Eudemonía</copyright>`,
  });
}
