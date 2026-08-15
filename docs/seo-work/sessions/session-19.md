# Sesión 19 — Content Collections y panel de administración sin código (Decap CMS)

**Fecha:** 2026-08-15
**Fase:** fuera del `MASTER_PLAN.md` original — pedido directo del usuario.
**Rama:** `feature/alva-seo-ai-discovery`

## Objetivo

El usuario preguntó cómo administrar fotos, descripciones y promociones sin tocar código, y pidió
un panel de administración. Se evaluaron tres opciones (Decap CMS, Google Sheets como fuente de
datos, o ningún panel) y, ante la falta de preferencia expresa del usuario, se recomendó y
construyó **Decap CMS**: es gratuito, no requiere backend propio, y encaja con un sitio Astro
estático generando commits reales sobre archivos versionados (en vez de una hoja de cálculo
externa que habría que sincronizar).

## Paso previo obligatorio: migrar el catálogo a Astro Content Collections

Decap CMS necesita que cada entrada editable sea **su propio archivo**. El catálogo hasta esta
sesión era un solo `src/data/products.generated.json`, generado por `scripts/sync-public-catalog.ts`
a partir de un "seed" en código — no editable archivo por archivo, y regenerado por completo en
cada corrida del script. Antes de tocar nada de UI de administración, hubo que reestructurar la
fuente de datos:

1. `src/content.config.ts` (nuevo): define las colecciones `products` y `promos` con `glob()` +
   esquema Zod (categoría, precio, features, imagen, etc.).
2. Migración de 74 productos de `products.generated.json` a archivos individuales
   `src/content/products/<categoría>/<slug>.json` (script de migración de un solo uso, ejecutado
   y luego eliminado).
3. 4 promociones extraídas del array hardcodeado de `PromoShowcase.astro` a
   `src/content/promos/*.json`.
4. `src/lib/products.ts` (nuevo): `getAllProducts()` / `getProductsByCategory()`, que reconstruyen
   la forma `Product` que ya esperaban las páginas (incluyendo el campo `id` sintético
   `${categoria}-${slug}` que antes calculaba el script de sync).
5. **14 archivos** que antes importaban `products.generated.json` migrados a usar los helpers de
   `src/lib/products.ts`: los 4 listados de categoría, las 2 páginas dinámicas de producto
   (`productos/muebles/[slug].astro`, `productos/[category]/[slug].astro` — ambas con
   `getStaticPaths`, ver la nota de scope abajo), 6 landing pages comerciales, 2 guías.
6. `PromoShowcase.astro` reescrito para leer `getCollection("promos")`.
7. `scripts/validate-seo.ts` actualizado: `loadProducts()` ahora recorre
   `src/content/products/<categoría>/*.json` en vez de parsear el JSON generado.
8. Eliminados: `scripts/sync-public-catalog.ts`, `src/data/products.generated.json`,
   `src/data/` (carpeta vacía), el script de migración de un solo uso, y el comando
   `catalog:sync` de `package.json` — ya no existe paso de generación intermedio, el JSON de cada
   producto **es** la fuente.

### Bug recurrente: `getStaticPaths` y scope de módulo

Ya documentado en SEO-003 y vuelto a encontrar aquí: `getStaticPaths()` corre en scope de módulo,
separado del resto del frontmatter (que corre por render), así que no puede cerrar sobre un
`const` declarado afuera — solo sobre imports/`await` hechos dentro de sí misma. Se resolvió
volviendo a buscar los productos (`await getProductsByCategory(...)` / `await getAllProducts()`)
tanto dentro de `getStaticPaths` como, por separado, en el resto del archivo.

### Verificación tras la migración

`npm run build` (101 páginas, sin errores) y `npm run seo:validate` (sin errores bloqueantes, solo
los avisos ya esperados de "producto sin características") pasaron limpios antes de seguir con el
panel de administración — la migración de datos no rompió nada.

## Panel `/admin` (Decap CMS)

`public/admin/index.html` (carga `decap-cms` desde CDN, sin build propio) +
`public/admin/config.yml`:

- **4 colecciones de productos** (`products-muebles`, `products-unas`, `products-capilares`,
  `products-maquillaje`), una por categoría en vez de una sola colección con `path` dinámico —
  **hallazgo empírico de esta sesión**: las "folder collections" de Decap CMS no leen subcarpetas
  por defecto (`folder: "src/content/products"` con archivos en `<categoría>/<slug>.json` daba
  "No Entries" aunque los 74 archivos existían). Apuntar cada colección directo a su subcarpeta
  real (`folder: "src/content/products/muebles"`, etc., con `category` como campo oculto) sí
  funciona.
- **1 colección de promociones** (`promos`), sin ese problema porque ya vivía en una sola carpeta
  plana.
- Los campos usan `extension: "json"` + `format: "json"` explícito — otro hallazgo empírico: sin
  esto, Decap asume YAML y tampoco lista entradas, aunque el error no es obvio en consola.
- El campo de foto (`widget: image`) usa `media_folder: "/src/assets/products/<categoría>"` +
  `public_folder: ""` — el truco de dejar `public_folder` vacío hace que el valor guardado en el
  JSON sea solo el nombre del archivo (`"foto.jpg"`), que es exactamente lo que espera
  `imageFor(categoria, filename)` en el código de las páginas (búsqueda por
  `import.meta.glob`), en vez de una ruta completa.
- `local_backend: true` + `backend.name: git-gateway` (pensado para Netlify Identity en
  producción — ver más abajo).

### Verificado en navegador (Browser pane, no solo lectura de código)

1. `npm run admin` (nuevo script → `decap-server`, instalado como devDependency) + `astro dev
   --background`.
2. `http://localhost:4321/admin/index.html` carga Decap CMS, detecta el proxy local
   (`Detected Decap CMS Proxy Server ... with repo: 'alva-importaciones-web'` en consola).
   Nota: `http://localhost:4321/admin/` (con barra, sin `index.html`) da 404 en el dev server de
   Astro — no diagnosticado a fondo, se documentó el workaround (usar la ruta completa) en
   `docs/CONTENT_WORKFLOW.md`.
3. Tras login (sin credenciales reales — `local_backend` no las pide), las 5 colecciones listan
   sus entradas reales: 25 muebles, y se confirmó también maquillaje (16) y promociones (4)
   completas y con los datos correctos.
4. Se abrió la entrada "Camilla multiuso 3 niveles", se confirmó que todos los campos cargan
   (incluida la vista previa de la foto, servida como blob URL vía el proxy), se cambió el precio
   de 208 a 209, se publicó ("Publish now"), y se verificó leyendo el archivo directamente en
   disco que el cambio se escribió de verdad (`"price": 209`). Se revirtió el valor a 208
   manualmente para no dejar un cambio de prueba en el catálogo real.

### Efecto colateral: `/admin` rompía `seo:validate`

El validador escaneaba `dist/admin/index.html` como si fuera una página de contenido y fallaba
por falta de `<title>` único/description/canonical/h1 (son cosas que un app shell de SPA no tiene
ni necesita). Se excluyó `/admin` del escaneo en `scripts/validate-seo.ts`, igual que ya se hacía
con `404.html`. También se agregó `Disallow: /admin/` a **todos** los grupos de `robots.txt`
(no solo al de `User-agent: *`, porque un bot con su propio grupo específico —Googlebot,
GPTBot, etc.— no hereda las reglas del grupo `*` según la especificación) — la página ya tenía
`<meta name="robots" content="noindex">`, esto es una capa extra para bots que no la respeten.

## Producción: bloqueada por falta de repo en GitHub

`backend.name: git-gateway` requiere Netlify Identity + Git Gateway, que a su vez requiere que el
repo esté en GitHub y el sitio desplegado en Netlify. Verificado en esta sesión: el repo no tiene
remoto (`git remote -v` vacío) y no hay `gh` CLI instalado. Documentado como pendiente en
`docs/seo-work/MANUAL_ACTIONS.md` (filas #16-17) y en `docs/DEPLOYMENT.md` §7 — **no bloquea el
uso del panel en local**, que ya funciona hoy sin ninguna de estas dos cosas.

## Otros archivos actualizados (documentación, para que no queden desactualizados)

- `docs/CONTENT_WORKFLOW.md`: sección 2 actualizada (ya no hay `catalog:sync`), nueva sección 6
  sobre el panel `/admin`.
- `docs/AUTOMATED_TASKS.md`: sección 1 reescrita (ya no hay sincronización de catálogo que
  automatizar), sección 3 y 6 ajustadas.
- `docs/DEPLOYMENT.md`: nueva sección 7 sobre el panel en producción, referencia a `catalog:sync`
  en la sección de tareas programadas eliminada.
- `docs/seo-work/MANUAL_ACTIONS.md`: 2 filas nuevas (GitHub + Netlify Identity/Git Gateway), nota
  sobre Docker no bloqueante.

## Docker (investigado por pedido del usuario, sin resolver)

El usuario pidió activar el proyecto por Docker. `docker ps`/`docker version` fallan con
`HCS_E_SERVICE_NOT_AVAILABLE` (motor de Docker Desktop no responde). Diagnosticado hasta el límite
de lo posible sin permisos de administrador: `wsl -l -v` mostraba la distro `docker-desktop`
parada, `wsl --shutdown` (corrido dos veces por el usuario) no lo resolvió, un reinicio completo
de Docker Desktop tampoco. Es un problema de virtualización de Windows (Hyper-V / servicio de
Contenedores), fuera del alcance de una sesión de Claude Code. **No bloqueante**: el sitio no
depende de Docker para desarrollarse ni probarse (`astro dev` es suficiente); Docker solo haría
falta si se elige ese método de despliegue en producción.

## Validaciones ejecutadas

- `npm run build` → ✅ 101 páginas, sin errores (antes y después de la migración de datos).
- `npm run seo:validate` → ✅ sin errores bloqueantes (30 avisos de "producto sin
  características", ya esperados — no todos los productos curados de Telegram traían el detalle).
- Panel `/admin` probado end-to-end en navegador real (Browser pane): listado de entradas, carga
  de campos e imagen, guardado real verificado en disco (ver arriba).

## Resultado

Migración de datos y panel de administración local, completos y verificados. Commiteado en esta
sesión.

## Pendientes (no bloqueantes)

- GitHub + Netlify Identity/Git Gateway para que `/admin` funcione en producción
  (`MANUAL_ACTIONS.md` #16-17).
- Docker Desktop sin arrancar en esta máquina (no bloqueante, ver arriba).
- El campo de foto dinámico de promociones (`media_folder: "/src/assets/products/{{fields.imageCategory}}"`)
  no se probó explícitamente subiendo un archivo nuevo en esta sesión (solo se verificó que la
  colección de promos carga sus 4 entradas existentes) — si al usarlo en la práctica no resuelve
  bien la carpeta dinámica, revisar ese campo primero.
