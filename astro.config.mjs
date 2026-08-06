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
    plugins: [tailwindcss()]
  }
});