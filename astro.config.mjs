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
    // /equipo/ era solo la carpeta de fotos de public/ y nginx respondía 403.
    // El equipo se presenta dentro de /fundacion/.
    "/equipo": "/fundacion/#equipo",
    // La #21 se publicó primero en WordPress con un guion bajo. Conservamos
    // esa URL por si ya se compartió, pero la canónica usa solo guiones.
    "/epistolas/21_prueba-con-el-martes": "/epistolas/21-prueba-con-el-martes/",
    // Borrador de la página de venta del CreaTuVida (sep-2026), ya publicado en /creatuvida/.
    // Se conserva porque el enlace se compartió con Pablo.
    "/creatuvida-borrador-9f2c": "/creatuvida/",
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
