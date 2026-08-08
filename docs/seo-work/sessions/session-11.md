# Sesión 11 — Robots, sitemap, llms.txt e IndexNow

**Fecha:** 2026-08-08
**Fase:** 11
**Tarea:** SEO-011
**Rama:** `feature/alva-seo-ai-discovery`

## Objetivo

Revisar `robots.txt`, validar el sitemap, añadir `llms.txt`, e implementar IndexNow (mecánica y
documentación, sin publicar ninguna clave real).

## Trabajo realizado

1. `public/robots.txt`: se mantiene `Allow: /` para `*`, y se añaden bloques explícitos para
   bots tradicionales (Googlebot, Bingbot) y de búsqueda/asistentes con IA (OAI-SearchBot,
   ChatGPT-User, GPTBot, PerplexityBot, Perplexity-User, ClaudeBot, anthropic-ai,
   Google-Extended), todos con `Allow: /`. No hay rutas privadas/administrativas en el sitio
   (verificado listando `src/pages/` completo) — nada que bloquear.
2. Sitemap: validado sin cambios de config necesarios. `dist/sitemap-0.xml` tiene 51 URLs (de 52
   páginas construidas — el `404.astro` queda excluido automáticamente por `@astrojs/sitemap`,
   comportamiento correcto). Las 25 páginas de producto están incluidas.
3. `public/llms.txt`: nuevo, describe el sitio para agentes/LLMs (qué vende, catálogo, guías,
   locales, único canal de venta = WhatsApp) con notas explícitas para agentes: no asumir que el
   precio sigue vigente sin confirmar, y no asumir cobertura de envíos (ver hallazgo de SEO-009,
   sin confirmar todavía).
4. IndexNow — implementado sin clave real (no existe ninguna todavía, ver
   `MANUAL_ACTIONS.md` #10):
   - `scripts/indexnow-prepare-keyfile.mjs`: hook `prebuild` (corre antes de cada `astro build`).
     Si `INDEXNOW_KEY` existe en el entorno, escribe `public/{key}.txt`; si no, no hace nada
     (build sigue funcionando). Probado con una clave de prueba: genera el archivo correctamente,
     limpiado después de la prueba.
   - `scripts/indexnow-submit.mjs` (`npm run indexnow`): envía URLs a la API de IndexNow después
     de un despliegue. Sin `INDEXNOW_KEY`, no-op seguro (probado).
   - `docs/AUTOMATED_TASKS.md` sección 4 actualizada con el detalle de implementación. La clave
     nunca vive en el repo en texto plano — se lee de `process.env.INDEXNOW_KEY`.

## Validaciones ejecutadas

- `npm run build` → ✅ 52 páginas, `dist/robots.txt` y `dist/llms.txt` presentes y correctos.
- `dist/sitemap-0.xml`: 51 URLs, incluye las 25 páginas de producto, excluye `/404`.
- Prueba manual de `indexnow-prepare-keyfile.mjs` con clave falsa: genera `public/{key}.txt`
  correctamente (archivo de prueba eliminado antes de continuar, no se commiteó).
- Prueba manual de `indexnow-submit.mjs` sin clave: confirma no-op seguro con mensaje claro.

## Resultado

`SEO-011` completada. Evidencia en `tasks/evidence/SEO-011.log`.

## Siguiente tarea

`SEO-012` — Uñas, maquillaje y capilares (páginas individuales).
