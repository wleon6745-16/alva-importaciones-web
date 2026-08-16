/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** Measurement ID de Google Analytics 4 (formato "G-XXXXXXXXXX"). Opcional — si no está
   *  definida, Analytics.astro no carga gtag.js y el sitio funciona igual. Ver docs/ANALYTICS.md. */
  readonly PUBLIC_GA_MEASUREMENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
