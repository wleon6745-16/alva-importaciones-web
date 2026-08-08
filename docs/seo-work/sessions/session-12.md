# Sesión 12 — Uñas, maquillaje y capilares (páginas individuales)

**Fecha:** 2026-08-08
**Fase:** 12
**Tarea:** SEO-012
**Rama:** `feature/alva-seo-ai-discovery`

## Objetivo

Curar y publicar productos reales (con foto real, precio, y marca/código cuando existan) de
uñas, capilares y maquillaje, con páginas individuales siguiendo el mismo patrón de SEO-003.

## Proceso de curación (sin inventar datos)

1. Extendí temporalmente el extractor de SEO-009 (script de scratch, no commiteado) para
   capturar, por cada mensaje de Telegram, **la foto adjunta en ese mismo mensaje** (no de otro
   mensaje) junto con nombre, precio y código cuando existían.
2. Clasifiqué candidatos por categoría (uñas/capilares/maquillaje) por palabras clave y elegí a
   mano una selección representativa por categoría (9 uñas, 8 capilares, 8 maquillaje — de un
   universo de cientos de publicaciones sin curar todavía, ver `reports/telegram-data-candidates.md`
   de SEO-009), priorizando mensajes con nombre claro, precio, foto y — cuando la fuente lo traía
   — código.
3. Verifiqué que cada archivo de foto existiera de verdad en el export antes de copiarlo (una
   selección inicial tenía una fecha de archivo mal transcrita; se corrigió antes de copiar).
4. Copié las 25 fotos reales a `src/assets/products/{unas,capilares,maquillaje}/` con nombres
   descriptivos.
5. Extraje el texto completo de cada mensaje elegido (no solo el resumen) para no inventar
   ninguna característica — todo lo que aparece como `features`/`brand`/`code` en el catálogo
   viene literal de la publicación original.

## Trabajo realizado

1. `scripts/sync-public-catalog.ts`: `SeedItem` ahora admite `brand`; se agregaron
   `UNAS_SEED`/`CAPILARES_SEED`/`MAQUILLAJE_SEED` (9/8/8 productos) y `main()` genera las 4
   categorías juntas. `products.generated.json` pasó de 25 a 50 productos.
2. `src/pages/productos/[category]/[slug].astro`: ruta dinámica **compartida** para uñas,
   capilares y maquillaje (muebles conserva su propia ruta de SEO-003, sin tocar). Mismo patrón
   que `productos/muebles/[slug].astro`: breadcrumbs, imagen, precio/marca/código opcionales,
   características, JSON-LD `Product`+`Brand`+`Offer` condicional, relacionados por subcategoría,
   título único (desambiguado por precio si el nombre se repite). Aplica desde el inicio el fix
   de scope de `getStaticPaths` ya documentado en SEO-003 (no hubo que redescubrirlo, pero se
   volvió a golpear al escribir el archivo por primera vez — corregido antes de hacer commit).
3. `src/pages/productos/{unas,capilares,maquillaje}.astro`: reemplacé la galería genérica de 4
   fotos de stock por los productos reales agrupados por subcategoría (mismo patrón visual que
   `muebles.astro`), cada tarjeta enlazando a su página individual.

## Validaciones ejecutadas

- `npm run build` → ✅ 77 páginas (52 + 25 de producto nuevas).
- 9/8/8 páginas generadas por categoría, un solo `<h1>` cada una.
- Cero títulos y cero meta descriptions duplicados en las 50 páginas de producto combinadas
  (muebles + las 3 nuevas categorías).
- JSON-LD `Product` verificado en un caso con marca+código+precio (Monómero Master Nails 16 OZ).
- Revisado en navegador: `/productos/unas` muestra los 9 productos reales agrupados; el detalle
  de "Máquina de cabello WAHL Edición Legend" muestra marca, código, precio y relacionados
  correctamente.
- Verificado que las imágenes genéricas de categoría (`nails-1.jpg`, etc.) siguen en uso en
  `index.astro`/`productos/index.astro` (tarjetas de categoría) — no quedaron huérfanas.

## Resultado

`SEO-012` completada. Evidencia en `tasks/evidence/SEO-012.log`.

## Siguiente tarea

`SEO-013` — Imágenes, rendimiento y accesibilidad.
