# Sesión 05 — Metadatos y Schema de productos

**Fecha:** 2026-08-08
**Fase:** 5
**Tarea:** SEO-005
**Rama:** `feature/alva-seo-ai-discovery`

## Objetivo

Completar los metadatos y el Schema.org de las 25 páginas de producto: títulos únicos, Open
Graph con imagen propia por producto, y JSON-LD `Product` + `Brand` (además del `BreadcrumbList`
que ya existía desde SEO-003).

## Trabajo realizado

1. `src/lib/structured-data.ts`: nueva función `productSchema(product, pageUrl, imageUrl)`.
   - `brand`: usa "SILETI" cuando el nombre del producto ya lo menciona (3 productos), y
     "Alva Importaciones" (el vendedor real) como fallback para el resto — no es un dato
     inventado.
   - `offers` **solo** se agrega cuando `product.price !== undefined` (caso real sin precio:
     "Lavacabezas SILETI ST-3000-1" → sin `offers`, verificado en el HTML generado).
   - Sin `availability` ni `itemCondition` (no hay dato real que respalde ninguno de los dos).
   - Sin `aggregateRating` ni `review` en ningún producto — verificado con grep sobre el `dist/`
     generado, cero coincidencias.
2. `src/pages/productos/muebles/[slug].astro`:
   - Título único por página: se detectó que 4 productos comparten el nombre exacto "Sillón de
     peluquería" (slugs `sillon-de-peluqueria`, `-4`, `-5`, `-6`); el `<title>` ahora agrega el
     precio como desambiguador solo en ese caso (`"Sillón de peluquería - $349"`), sin tocar el
     nombre visible del producto en la página. Verificado: 25 títulos únicos, cero duplicados.
   - Imagen de Open Graph propia por producto: se resuelve con `getImage()` de `astro:assets`
     sobre la misma imagen ya usada en la página (no el `/og-image.jpg` genérico).
   - JSON-LD `Product` añadido al array `structuredData` del `BaseLayout`, junto al
     `BreadcrumbList` que ya existía.

## Validaciones ejecutadas

- `npm run build` → ✅ 37 páginas, sin errores.
- 25 títulos `<title>` únicos (`grep ... | sort | uniq -d` → vacío).
- 25 meta descriptions únicas (mismo chequeo → vacío).
- Canonical absoluta verificada (`https://alvaimportaciones.com/...`, no localhost).
- `og:image`/`twitter:image` diferenciados por producto (verificado en dos páginas distintas).
- JSON-LD parseado con `JSON.parse()` sobre el HTML generado — válido en los casos con y sin
  precio, y en un caso con marca SILETI.
- Cero coincidencias de `aggregateRating`/`review` en todo `dist/productos/muebles/`.

## Resultado

`SEO-005` completada. Evidencia en `tasks/evidence/SEO-005.log`.

## Siguiente tarea

`SEO-006` — Categorías y enlaces internos.
