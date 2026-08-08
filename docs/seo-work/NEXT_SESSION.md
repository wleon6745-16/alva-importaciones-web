# Próxima sesión

## 1. Qué leer primero

1. `docs/seo-work/CURRENT_STATE.md`
2. Este archivo completo
3. La tarea `SEO-005` en `tasks/seo-tasks.json`

## 2. Qué tarea ejecutar

**SEO-005 — Metadatos y Schema de productos**, Fase 5.

Antes de tocar código: `npm run task:start -- SEO-005`.

## 3. Problema real a resolver: títulos duplicados

Hay 4 productos con el **mismo nombre exacto** "Sillón de peluquería" (slugs
`sillon-de-peluqueria`, `-4`, `-5`, `-6` — precios $349/$359/$279/$240). Hoy
`[slug].astro` usa `title={product.name}` sin más, así que esas 4 páginas generan el mismo
`<title>`. Hay que desambiguar el título (no el nombre visible del producto, que se queda igual)
cuando haya nombres duplicados dentro de la categoría — por ejemplo agregando el precio:
`"Sillón de peluquería - $349"`. Calcular la duplicidad contando cuántos productos de `muebles`
comparten `product.name` y aplicar el sufijo solo en ese caso, para no ensuciar los títulos que
ya son únicos.

## 4. Qué archivos revisar

- `src/pages/productos/muebles/[slug].astro` — título, descripción, canonical, OG ya viven aquí
  (via `BaseLayout`). Falta: JSON-LD `Product` + `Brand`, imagen OG específica del producto, y el
  fix de título duplicado del punto 3.
- `src/lib/structured-data.ts` — añadir una función `productSchema(product, pageUrl, imageUrl)`
  aquí, siguiendo el patrón de `breadcrumbSchema`/`organizationSchema`.
- `src/lib/site-config.ts` — no tiene marcas por producto; para el campo `brand` de Schema.org,
  usar "SILETI" para los 3 productos cuyo nombre ya la menciona (`silla-de-barberia-sileti-*`,
  `lavacabezas-sileti-*`) y `siteConfig.name` ("Alva Importaciones") como fallback para el resto
  (son productos revendidos sin marca propia identificada — no es un dato inventado, es la
  identidad del vendedor).

## 5. Qué resultado se espera

- Títulos únicos en las 25 páginas de producto (incluye el fix de los 4 "Sillón de peluquería").
- Meta descriptions ya son razonablemente únicas (incluyen precio + 2 features), pero revisar que
  sigan siéndolo tras cualquier cambio.
- Canonical absoluta (ya lo es, verificar que sigue).
- Open Graph completo — usar la imagen del producto (no el genérico `/og-image.jpg`) como
  `og:image`/`twitter:image` en cada página de producto. Se puede resolver con
  `getImage()` de `astro:assets` sobre el resultado de `imageFor()` y construir la URL absoluta.
- JSON-LD `Product` (name, image, description, sku=code si existe, brand, category) + `Brand` +
  `BreadcrumbList` (ya existe) por producto.
- `offers` **solo** cuando `product.price !== undefined` — sin inventar disponibilidad
  (`availability`) ni condición del artículo si no se tiene certeza.
- Sin `aggregateRating` ni `review` en ningún producto (no hay reseñas reales).
- `npm run build` sigue pasando.

## 6. Qué comandos ejecutar

```bash
cd "C:\Users\wleon\Proyectos\alva-importaciones-web"
npm run task:start -- SEO-005
# ... trabajo ...
npm run build
npm run task:complete -- SEO-005
```

## 7. Qué NO debe modificarse todavía

- No tocar `src/data/products.generated.json` a mano — cambios de datos van en el seed de
  `scripts/sync-public-catalog.ts` + `npm run catalog:sync`.
- No inventar `aggregateRating`, `review`, `availability` ni `itemCondition` sin dato real.
- Página de listado (`muebles.astro`) no necesita JSON-LD `Product` — eso es solo para páginas de
  producto individuales.

## 8. Qué hacer si la tarea falla

1. No marcar `SEO-005` como `completed`.
2. `npm run task:fail -- SEO-005` con la razón.
3. Documentar en `CURRENT_STATE.md` → "Errores conocidos".
4. Dejar `git status` limpio.
5. Reescribir este archivo con el punto exacto de retoma.
