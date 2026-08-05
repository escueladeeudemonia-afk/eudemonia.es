// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://eudemonia.es",
  trailingSlash: "always",
  build: {
    format: "directory",
  },
  redirects: {
    // El cuestionario de vida (test) vive en Tally
    "/test": "https://tally.so/r/A7veYN",
    // /equipo/ era solo la carpeta de fotos de public/ y nginx respondía 403.
    // El equipo se presenta dentro de /fundacion/.
    "/equipo": "/fundacion/#equipo",
  },
  integrations: [
    sitemap({
      // Las epístolas van noindex (el original vivirá en Substack), así que tampoco
      // deben anunciarse en el sitemap. El índice /epistolas/ sí se queda, y el podcast entero también.
      // /home-provisional/ es un borrador interno: no debe aparecer en ningún índice.
      filter: (page) => !/\/epistolas\/.+/.test(page) && !/\/home-provisional\/$/.test(page),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
