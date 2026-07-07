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
  },
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
