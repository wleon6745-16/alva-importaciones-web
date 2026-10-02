// @ts-check
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

const SITE_URL = 'https://alvaimportaciones.com';

// Las fichas de producto del catalogo en vivo son on-demand (no se generan en el
// build, ver src/pages/productos/[category]/p/**), asi que @astrojs/sitemap no las
// puede descubrir solo -- se le pasan a mano. El archivo lo escribe scripts/fetch-
// storefront-sitemap-urls.ts (parte de "npm run prebuild"); si todavia no existe
// (primer `astro dev` en una maquina nueva, antes del primer prebuild) el sitemap
// simplemente sale sin estas URLs -- no rompe el build.
function productSitemapUrls() {
  try {
    const filePath = fileURLToPath(new URL('./src/data/storefront-sitemap-urls.json', import.meta.url));
    const paths = JSON.parse(readFileSync(filePath, 'utf-8'));
    return paths.map((p) => new URL(p, SITE_URL).toString());
  } catch {
    return [];
  }
}

// https://astro.build/config
export default defineConfig({
  // Dominio real, confirmado 2026-08-15 — ya agregado a Cloudflare por el usuario.
  site: SITE_URL,
  integrations: [react(), sitemap({ customPages: productSitemapUrls() })],
  // El sitio sigue siendo estatico por defecto (cada pagina se sigue generando en
  // build salvo que declare "export const prerender = false"). Este adapter solo
  // habilita ESE opt-in puntual -- hoy usado por las paginas de detalle de producto
  // del catalogo en vivo (src/pages/productos/[category]/p/**), que necesitan datos
  // frescos de Omviqa en cada visita y no se pueden congelar en el build. Ver
  // wrangler.jsonc: el Worker pasa de "solo assets" a tener un "main" que ejecuta
  // estas rutas puntuales.
  adapter: cloudflare({ imageService: 'passthrough' }),
  // El adapter activa sesiones con un KV binding de Cloudflare por defecto si no se
  // configura nada -- exigiria crear un KV namespace real en Cloudflare para una
  // funcion que este sitio no usa (no hay ningun Astro.session.* en el codigo).
  // Driver "null" (no-op, de unstorage): declara la sesion sin pedir ningun
  // binding nuevo.
  session: {
    driver: 'null',
  },

  vite: {
    plugins: [tailwindcss()],
    server: {
      // Permite probar el servidor de desarrollo a través de un túnel ngrok (dominio cambia
      // cada vez en el plan gratuito). Solo afecta a "astro dev"/"vite dev", no al build de
      // producción ni al server.ts que sirve dist/.
      allowedHosts: [".ngrok-free.dev", ".ngrok-free.app", ".ngrok.io", ".ngrok.app"]
    }
  }
});
