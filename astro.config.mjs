// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // TODO: reemplazar por el dominio real cuando se compre/asigne
  site: 'https://alvaimportaciones.com',
  integrations: [react(), sitemap()],

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