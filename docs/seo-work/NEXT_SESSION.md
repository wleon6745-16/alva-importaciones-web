# Próxima sesión

## 1. Qué leer primero

1. `docs/seo-work/CURRENT_STATE.md`
2. Este archivo completo
3. La tarea `SEO-003` en `tasks/seo-tasks.json`
4. `docs/seo-work/sessions/session-02.md` (qué se decidió en SEO-002 y por qué)

## 2. Qué tarea ejecutar

**SEO-003 — Slugs y páginas individuales de muebles**, Fase 3.

Antes de tocar código: `npm run task:start -- SEO-003`.

Objetivo: crear una ruta dinámica `/productos/muebles/[slug]/` que genere una página indexable
por cada uno de los 25 productos de `src/data/products.generated.json`, reutilizando el tipo
`Product` de `src/types/product.ts`.

## 3. Qué archivos revisar

- `src/data/products.generated.json` — los 25 productos (categoría `muebles`), con `slug` único y
  estable ya calculado por `scripts/sync-public-catalog.ts`. No hace falta recalcular slugs, solo
  usarlos.
- `src/types/product.ts` — tipo `Product` (id, slug, name, category, subcategory?, code?, price?,
  currency?, brand?, features, image, imageAlt).
- `src/pages/productos/muebles.astro` — patrón ya usado para resolver imágenes con
  `import.meta.glob("../../assets/products/muebles/*.{jpg,jpeg,png,webp}", { eager: true })`
  sobre `astro:assets`. Reutilizar el mismo mecanismo en la página dinámica.
- `src/layouts/BaseLayout.astro` y `src/lib/structured-data.ts` — para breadcrumbs y estructura de
  página consistente con el resto del sitio.
- `src/components/WhatsAppCTA.astro` — CTA ya usado en las tarjetas de `muebles.astro`.

## 4. Qué resultado se espera

- Ruta `src/pages/productos/muebles/[slug].astro` (o `[slug]/index.astro`) con `getStaticPaths()`
  que itera `products.generated.json` filtrando `category === "muebles"`.
- Diseño de producto individual reutilizable: breadcrumbs (Inicio > Productos > Muebles >
  [nombre]), galería/imagen principal, nombre, precio (o "Consultar precio" si no hay `price`),
  código si existe, lista de características, CTA de WhatsApp con mensaje contextual, y una
  sección de "productos relacionados" (mismo `subcategory`, excluyendo el actual).
- Productos sin `price` o sin `code` no deben romper el build (ya son campos opcionales en el
  tipo `Product`; ya hay un caso real: "Lavacabezas SILETI ST-3000-1" no tiene precio).
- Un solo `<h1>` por página (el nombre del producto).
- `src/pages/productos/muebles.astro` (la página de listado) debe enlazar a cada
  `/productos/muebles/[slug]/` desde la tarjeta de producto (hoy la tarjeta completa no es un
  link; hay que decidir si la imagen/nombre se vuelve enlace manteniendo el botón de WhatsApp
  como acción separada).
- No hay slugs duplicados (ya están garantizados por el generador, pero validar en el build igual
  si es barato hacerlo).
- `npm run build` sigue pasando y genera 25 páginas nuevas bajo `/productos/muebles/`.

## 5. Qué comandos ejecutar

```bash
cd "C:\Users\wleon\Proyectos\alva-importaciones-web"
git status
npm run task:status
npm run task:start -- SEO-003
# ... trabajo ...
npm run build
npm run task:validate
npm run task:complete -- SEO-003
```

## 6. Qué NO debe modificarse todavía

- No añadir Schema.org / JSON-LD de producto todavía (`Product`, `Offer`, `AggregateRating`) —
  eso es SEO-005, la siguiente tarea después de esta. Las páginas de producto de SEO-003 solo
  necesitan el `BreadcrumbList` que ya se usa en el resto del sitio (vía `structured-data.ts`),
  igual que hace hoy `muebles.astro`.
- No tocar `src/data/products.generated.json` a mano — si hace falta cambiar un dato, se cambia
  el seed en `scripts/sync-public-catalog.ts` y se corre `npm run catalog:sync`.
- No conectar en vivo a la base de datos de `ASISTENTE` (decisión de SEO-002, ver
  `docs/seo-work/sessions/session-02.md`).
- No crear páginas de uñas/maquillaje/capilares todavía — eso es SEO-012, depende de este mismo
  patrón pero se hace después.
- No resolver los conflictos de `DATA_CONFLICTS.md` inventando un valor — solo registrar si
  aparecen nuevos.

## 7. Qué hacer si la tarea falla

1. No marcar `SEO-003` como `completed`.
2. Ejecutar `npm run task:fail -- SEO-003` y escribir la razón cuando el script la pida (o
   editar `tasks/seo-tasks.json` a mano si el script no cubre el caso).
3. Documentar en `docs/seo-work/CURRENT_STATE.md` → "Errores conocidos" exactamente qué falló,
   con el comando y el error.
4. Dejar el `git status` limpio (commitear lo estable, descartar/guardar en stash lo que no lo
   esté, nunca dejarlo mezclado sin explicación).
5. Reescribir este archivo (`NEXT_SESSION.md`) con instrucciones para retomar `SEO-003` desde el
   punto exacto donde falló (no desde cero).
