# Sesión 02 — Fuente central del catálogo (sanitizada)

**Fecha:** 2026-08-07
**Fase:** 2
**Tarea:** SEO-002
**Rama:** `feature/alva-seo-ai-discovery`

## Objetivo

Sacar los 25 productos de muebles del hardcode en `src/pages/productos/muebles.astro` y
convertirlos en una fuente de datos pública y sanitizada, tipada, que ese `.astro` (y las tareas
futuras SEO-003 en adelante) puedan consumir.

## Decisión: sin conexión en vivo a la base de datos de ASISTENTE

`NEXT_SESSION.md` pedía evaluar si `scripts/sync-public-catalog.ts` debía leer en vivo de la
tabla `products` de `assistant_sacc` (Docker/Postgres del repo `ASISTENTE`). Se decidió **no
hacerlo en esta sesión**:

- El sitio se compila estático (`astro build`) y se despliega sin backend propio; no hay dónde
  guardar credenciales de Postgres fuera del repo en este momento.
- Conectarse en vivo desde un script que corre en la máquina del desarrollador es viable hoy,
  pero no es reproducible en un pipeline de build/CI sin exponer esas credenciales.
- El seed manual (ya verificado en Sesión 1 contra esa misma base de datos para los conflictos
  detectados) es sanitizado y suficiente para completar SEO-002 sin inventar nada.

Queda documentado como limitación conocida, no como conflicto de datos. Cuando se decida
sincronizar en vivo, `scripts/sync-public-catalog.ts` es el punto de reemplazo: cambiar
`MUEBLES_SEED`/`loadSeedProducts()` por una consulta de solo lectura, manteniendo el mismo
saneamiento (sin `costo`, sin margen, sin datos de cliente).

## Trabajo realizado

1. `src/types/product.ts`: tipo `Product` público (id, slug, name, category, subcategory?, code?,
   price?, currency?, brand?, features, image, imageAlt) y `ProductCategoryGroup`. Sin campos de
   costo, margen ni cliente.
2. `scripts/sync-public-catalog.ts`: seed manual con los 25 productos de muebles (copiados de
   `muebles.astro`, mismos datos, mismo orden), genera `src/data/products.generated.json`.
   Incluye:
   - `slugify()` + `buildSlug()`: slug estable a partir del nombre; si colisiona (4 sillones sin
     código ni modelo se llaman todos "Sillón de peluquería"), desambigua con el código de
     producto si existe, si no con el número de la imagen (`sillon-peluqueria-4.jpg` →
     `sillon-de-peluqueria-4`), si no con un contador.
   - `assertSanitized()`: valida que no haya claves con `cost`/`costo`/`margen`/`margin`/
     `cliente`/`customer`/`token`/`password`/`secret`, que no haya slugs ni IDs duplicados, y que
     todo producto tenga nombre.
3. `src/data/products.generated.json`: generado por el script (25 productos, `category: "muebles"`,
   agrupados por `subcategory`).
4. `package.json`: nuevo script `catalog:sync` → `node scripts/sync-public-catalog.ts` (usa
   soporte nativo de TypeScript de Node, sin `tsx`/`ts-node`; requiere Node ≥22.12 con
   `--experimental-strip-types` en versiones que no lo traigan por defecto, o Node ≥23.6 sin flag;
   verificado con Node 24.18 instalado localmente).
5. `src/pages/productos/muebles.astro`: reescrito para leer `products.generated.json` en vez de
   hardcodear arrays. Las imágenes se resuelven con `import.meta.glob(..., { eager: true })`
   sobre `src/assets/products/muebles/*` para seguir usando `astro:assets` (optimización WebP
   real, no rutas públicas sin procesar). El precio se formatea igual que antes (`$17.50` con
   decimales solo cuando el precio no es un entero).
6. `.claude/launch.json`: creado (no existía) para poder previsualizar con `astro dev` vía el
   navegador integrado, según instrucción de `CLAUDE.md`.

## Validaciones ejecutadas

- `npm run build` → ✅ 12 páginas generadas, sin errores, `/productos/muebles/index.html` incluido
  con las 43 imágenes optimizadas (incluye las 25 de muebles).
- Servidor `astro dev` levantado y `/productos/muebles` revisado en el navegador: los 25 productos
  se ven con nombre, precio, características, código (cuando existe) e imagen — contenido idéntico
  al `.astro` anterior (verificado también comparando texto extraído del HTML generado antes/
  después del cambio, incluyendo el caso `$17.50` que inicialmente salió mal formateado como
  `$17.5` y se corrigió).
- Revisión manual de `products.generated.json`: sin `costo`/margen/cliente/credenciales, 25 IDs
  únicos, 25 slugs únicos.

## Resultado

`SEO-002` completada. Evidencia en `tasks/evidence/SEO-002.log`.

## Siguiente tarea

`SEO-003` — Slugs y páginas individuales de muebles. Instrucciones completas reescritas en
`docs/seo-work/NEXT_SESSION.md`.
