# Sesión 03 — Slugs y páginas individuales de muebles

**Fecha:** 2026-08-08
**Fase:** 3
**Tarea:** SEO-003
**Rama:** `feature/alva-seo-ai-discovery`

## Objetivo

Generar una página indexable por cada uno de los 25 productos de muebles, a partir del catálogo
sanitizado creado en SEO-002 (`src/data/products.generated.json`).

## Trabajo realizado

1. `src/pages/productos/muebles/[slug].astro`: ruta dinámica con `getStaticPaths()` que genera
   las 25 páginas de producto (una por `slug` de `products.generated.json`, filtrado por
   `category === "muebles"`).
2. Cada página incluye: breadcrumbs (Inicio > Productos > Muebles > [nombre]), imagen principal
   vía `astro:assets` (mismo mecanismo `import.meta.glob` que la página de listado), un solo
   `<h1>` con el nombre del producto, precio (o "Consultar precio" si no hay `price` — caso real:
   "Lavacabezas SILETI ST-3000-1"), código si existe, lista de características, CTA de WhatsApp
   con mensaje contextual (nombre + código), y una sección "También te puede interesar" con hasta
   4 productos de la misma `subcategory`.
3. `src/pages/productos/muebles.astro`: las tarjetas del listado ahora enlazan a
   `/productos/muebles/[slug]/` (imagen y nombre son link; el botón de WhatsApp queda fuera del
   `<a>` para no anidar enlaces).

## Bug encontrado y corregido

`getStaticPaths()` es hoisted por Astro a scope de módulo (corre en build time, antes de
renderizar el componente), pero el resto del frontmatter de un `.astro` corre dentro de la
función del componente. Declarar `const muebles = ...` una sola vez arriba del archivo y usarla
tanto en `getStaticPaths()` como en el render causó `muebles is not defined` en build (el build
generó igual las 12 páginas normales, pero fallaba justo al generar las de producto). Solución:
recalcular la lista filtrada de forma independiente dentro de `getStaticPaths()` y otra vez en el
cuerpo del componente — ambas leen del mismo import (`products.generated.json`), que sí es
module-scope. Documentado con un comentario en el propio archivo para que no se repita el error
en SEO-012 (páginas de uñas/maquillaje/capilares, mismo patrón).

## Validaciones ejecutadas

- `npm run build` → ✅ 37 páginas generadas (12 anteriores + 25 de producto), sin errores.
- Verificado que las 25 carpetas de producto se generaron con slugs únicos (`dist/productos/muebles/*`).
- Verificado con `grep` que cada página de producto tiene exactamente un `<h1>`.
- Caso sin precio/código ("Lavacabezas SILETI ST-3000-1") revisado en el HTML generado: no rompe
  el build, muestra "Consultar precio" y omite la línea de código.
- Revisado en navegador (`astro dev`): página de producto individual con imagen, precio,
  características, CTA de WhatsApp y relacionados; navegación desde el listado (`/productos/muebles`)
  hasta un producto funciona con clic real.
- Canonical de cada página de producto es absoluta (`https://alvaimportaciones.com/...`), no
  localhost.

## Resultado

`SEO-003` completada. Evidencia en `tasks/evidence/SEO-003.log`.

## Siguiente tarea

`SEO-004` — WhatsApp contextual y conversiones. Instrucciones completas reescritas en
`docs/seo-work/NEXT_SESSION.md`.
