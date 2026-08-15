# Estado actual del proyecto

> Este archivo lo mantiene actualizado `scripts/tasks.mjs` en los bloques marcados con
> `<!-- AUTO:... -->`. El resto lo actualiza quien cierra la sesión, a mano, siguiendo el
> protocolo de cierre de `MASTER_PLAN.md`.

## Control de tarea (automático)

<!-- AUTO:SUMMARY:START -->
- Fase actual: 16
- Tarea actual: SEO-016
- Estado de la tarea actual: completed
- Última actualización: 2026-08-09T00:19:01.786Z
<!-- AUTO:SUMMARY:END -->

## Git

- Repositorio: `C:\Users\wleon\Proyectos\alva-importaciones-web`
- Remoto: `origin` → `https://github.com/wleon6745-16/alva-importaciones-web` (público), agregado
  en la Sesión 19; `master` y `feature/alva-seo-ai-discovery` ya empujados con upstream configurado.
- Rama actual: `feature/alva-seo-ai-discovery`
- Rama base: `master`
- Último commit en `master` al crear esta rama: `dc46b8c` — "Add 6 more furniture/equipment
  items found in messages2.html (barberia chairs, carrito, lavacabezas, tina spa)"
- Working tree al iniciar Sesión 1: limpio.

## Tareas completadas (fuera de este sistema, sesiones previas sin control formal)

Estas ya estaban hechas antes de crear el sistema de control (Sesión 1), documentadas aquí para
que no se repitan:

- Scaffold Astro 7 + React + Tailwind v4 + sitemap.
- Sistema de marca real (logo, paleta negro/blanco/rojo `#CE113B`, favicons) extraído del logo
  oficial del cliente.
- Páginas: `/`, `/nosotros`, `/productos`, `/productos/unas`, `/productos/capilares`,
  `/productos/maquillaje`, `/productos/muebles`, `/cursos`, `/contacto`, `/privacidad`,
  `/terminos`, `/404`.
- Catálogo de **muebles** (25 productos reales: camillas, sillones de peluquería/barbería,
  butacas, mesas, equipo) extraído manualmente del export de Telegram
  (`messages.html` + `messages2.html`), con fotos reales copiadas a
  `src/assets/products/muebles/`.
- Direcciones reales de Matriz y Sucursal (texto, sin coordenadas verificadas — ver
  `MANUAL_ACTIONS.md`).
- Números de WhatsApp por sucursal configurados en `src/lib/site-config.ts` (con un conflicto de
  datos sin resolver, ver `DATA_CONFLICTS.md` CONFLICT-001).
- SEO básico: meta/OG/Twitter, JSON-LD `Organization` + `LocalBusiness` x2 + `Course` +
  `BreadcrumbList`, sitemap vía `@astrojs/sitemap`, `robots.txt` estático.
- Deployment: `Dockerfile` + `nginx.conf` standalone (sin probar en producción real).

## Sesión 17 (2026-08-09): segunda pasada de calidad

Fuera de las 16 fases del plan original (pedido directo del usuario). Ver
`docs/seo-work/sessions/session-17.md` para el detalle completo: guías reescritas, nueva fuente
de imágenes descubierta (`ASISTENTE/backend/assets/`), home rediseñada, promociones de Telegram
curadas en la home, `docs/CONTENT_WORKFLOW.md` nuevo. `astro.config.mjs` también gana
`server.allowedHosts` para poder probar por túnel ngrok (solo afecta `astro dev`).

## Sesión 18 (2026-08-15): más productos de Telegram, fotos limpias, promos rediseñadas

Fuera de las 16 fases del plan original. Catálogo ampliado de 50 a 74 productos reales curados
desde el export de Telegram; 17 fotos de muebles con overlay de marketing recortadas limpias con
`sharp`; fotos de portada de categoría reemplazadas; `PromoShowcase.astro` rediseñado de nuevo
(las gráficas de campaña originales no encajaban con la marca).

## Sesión 19 (2026-08-15): Content Collections + panel de administración (Decap CMS)

Pedido directo del usuario ("cómo puedo administrar sin tocar código las fotos, descripciones,
promociones"). Ver `docs/seo-work/sessions/session-19.md` para el detalle completo. Resumen:

- **Migración de datos**: el catálogo pasó de un único `src/data/products.generated.json`
  generado por `scripts/sync-public-catalog.ts` a Astro Content Collections — un archivo por
  producto en `src/content/products/<categoría>/<slug>.json` (74 archivos), validado por Zod en
  `src/content.config.ts` nuevo. `src/lib/products.ts` nuevo expone `getAllProducts()` /
  `getProductsByCategory()` para que las 14 páginas que antes importaban el JSON generado sigan
  funcionando igual. Promociones (`PromoShowcase.astro`) migradas igual a
  `src/content/promos/*.json`. `scripts/sync-public-catalog.ts` y el JSON generado, eliminados —
  ya no existe paso de generación intermedio.
- **Panel `/admin`**: Decap CMS (`public/admin/index.html` + `config.yml`), verificado
  funcionando en local con `npm run admin` (`decap-server`) + `astro dev` — probado en navegador:
  las 4 colecciones de productos (una por categoría, porque Decap no lee subcarpetas dentro de una
  sola colección) y la de promociones cargan sus entradas, y un guardado de prueba (cambio de
  precio, revertido después) se escribió correctamente en el archivo JSON real. En producción
  requiere GitHub + Netlify Identity/Git Gateway, todavía sin configurar (ver `MANUAL_ACTIONS.md`
  filas #16-17) — el repo no tiene remoto de GitHub.
- **Otros ajustes**: `scripts/validate-seo.ts` reescrito para leer del nuevo directorio de
  contenido y excluir `/admin` del checklist de SEO (es un app shell, no contenido indexable);
  `robots.txt` bloquea `/admin/` explícitamente (además del `noindex` de la página); `package.json`
  gana `npm run admin` y pierde `catalog:sync`. `npm run build` y `npm run seo:validate` pasan
  limpios al cerrar la sesión.
- **Docker**: se investigó por pedido del usuario (el motor no arranca,
  `HCS_E_SERVICE_NOT_AVAILABLE`, ver `MANUAL_ACTIONS.md`) — no es necesario para el sitio, quedó
  sin resolver como nota no bloqueante.

## Estado del plan original (16 fases): COMPLETO

Las 16 fases de `MASTER_PLAN.md` (SEO-001 a SEO-016) están `completed`. No quedan tareas
pendientes en `tasks/seo-tasks.json`. Lo que falta para producción real es exclusivamente
configuración de cuentas externas del negocio — ver "Checklist final de lanzamiento" en
`docs/seo-work/MANUAL_ACTIONS.md` y la guía en `docs/DEPLOYMENT.md`. Si se abre trabajo nuevo
(más productos por curar, resolver conflictos de datos, etc.), regístrese como una tarea nueva en
`tasks/seo-tasks.json`.

## Tareas completadas en el sistema de control

- **SEO-001** — Sistema persistente de trabajo. Ver `docs/seo-work/sessions/session-01.md`.
- **SEO-002** — Fuente central del catálogo (sanitizada). Ver
  `docs/seo-work/sessions/session-02.md`. Resultado: `src/types/product.ts`,
  `scripts/sync-public-catalog.ts`, `src/data/products.generated.json` (25 productos de muebles),
  `src/pages/productos/muebles.astro` migrado a consumir el JSON. Decisión: sin conexión en vivo
  a la base de datos de `ASISTENTE` por ahora (documentado, no es un conflicto de datos).
- **SEO-003** — Slugs y páginas individuales de muebles. Ver
  `docs/seo-work/sessions/session-03.md`. Resultado: `src/pages/productos/muebles/[slug].astro`
  (25 páginas de producto indexables, breadcrumbs, relacionados, CTA de WhatsApp), listado
  enlazado a cada producto. Bug de scope de `getStaticPaths` encontrado y corregido (ver detalle
  en la sesión) — relevante para SEO-012, que reutiliza el mismo patrón.
- **SEO-004** — WhatsApp contextual y conversiones. Ver `docs/seo-work/sessions/session-04.md`.
  Resultado: `WhatsAppCTA.astro` con evento `whatsapp_click` vía `dataLayer.push` (sin proveedor
  de analítica instalado — patrón genérico GTM/GA4), mensaje de WhatsApp de producto con URL.
- **SEO-005** — Metadatos y Schema de productos. Ver `docs/seo-work/sessions/session-05.md`.
  Resultado: `productSchema()` (Product+Brand+Offer condicional), títulos únicos (fix de 4
  duplicados), OG image por producto.
- **SEO-006** — Categorías y enlaces internos. Ver `docs/seo-work/sessions/session-06.md`.
  Resultado: `RelatedCategories.astro`, nav de subcategorías + anclas en muebles, FAQ visible +
  JSON-LD. Filtros/paginación no aplican todavía (documentado).
- **SEO-007** — Sucursales y SEO local. Ver `docs/seo-work/sessions/session-07.md`. Resultado:
  `/locales` + `/locales/[branch]` con LocalBusiness JSON-LD propio por sucursal.
- **SEO-008** — Páginas comerciales locales. Ver `docs/seo-work/sessions/session-08.md`.
  Resultado: 6 landing pages de intención local, todas enlazando productos reales.
- **SEO-009** — Información comercial de Telegram (validada). Ver
  `docs/seo-work/sessions/session-09.md`. Resultado: extractor + `reports/telegram-data-candidates.md`.
  Hallazgo: posible política de envíos nacionales sin confirmar (`MANUAL_ACTIONS.md` #14).
- **SEO-010** — Guías para búsqueda y buscadores con IA. Ver
  `docs/seo-work/sessions/session-10.md`. Resultado: 5 guías + índice, Article+FAQPage JSON-LD.
- **SEO-011** — Robots, sitemap, llms.txt e IndexNow. Ver `docs/seo-work/sessions/session-11.md`.
  Resultado: `robots.txt` con bots de IA, `llms.txt`, IndexNow implementado sin clave real
  todavía (`MANUAL_ACTIONS.md` #10).
- **SEO-012** — Uñas, maquillaje y capilares (páginas individuales). Ver
  `docs/seo-work/sessions/session-12.md`. Resultado: 25 productos reales curados desde Telegram
  (foto+precio+marca/código verificados), `products.generated.json` con 50 productos,
  `productos/[category]/[slug].astro` (ruta compartida para las 3 categorías).
- **SEO-013** — Imágenes, rendimiento y accesibilidad. Ver `docs/seo-work/sessions/session-13.md`.
  Resultado: fix de jerarquía de encabezados (6 páginas), srcset+eager en imágenes LCP, auditoría
  de contraste/foco/alt/menú móvil sin más hallazgos bloqueantes.
- **SEO-014** — Validador SEO automático. Ver `docs/seo-work/sessions/session-14.md`. Resultado:
  `scripts/validate-seo.ts` + `npm run seo:validate`; 12 páginas huérfanas reales encontradas y
  corregidas con enlaces internos (nav "Guías" + enlaces contextuales).
- **SEO-015** — Pruebas integrales y estabilización. Ver `docs/seo-work/sessions/session-15.md`.
  Resultado: fix de `charset utf-8` faltante en `nginx.conf` (afectaba `robots.txt`/`llms.txt` en
  producción real); resiliencia de `catalog:sync` verificada con fallo simulado; WhatsApp
  end-to-end y Schema verificados en múltiples tipos de página.
- **SEO-016** — Preparación de producción (última fase). Ver
  `docs/seo-work/sessions/session-16.md`. Resultado: `docs/DEPLOYMENT.md`, fix de `Dockerfile`
  (Node 20→22), checklist final en `MANUAL_ACTIONS.md`, verificación de que no hay secretos.

## Tareas pendientes

Ninguna. Las 16 fases están completas.

## Errores conocidos

- Ninguno bloqueante en el build actual. (El bug de `getStaticPaths` de SEO-003 ya está
  corregido; ver `docs/seo-work/sessions/session-03.md` para que no se repita en SEO-012.)
- Ver `DATA_CONFLICTS.md` para inconsistencias de datos (no son errores de código).

## Addendum post-SEO-001 (mismo día, misma sesión)

Tras completar SEO-001, el usuario pidió verificar CONFLICT-002 contra la base de datos real
antes de continuar. Se consultó `asistente-db-1` (Docker, Postgres) directamente:

- **CONFLICT-002 resuelto**: `codigo=9974` en la tabla `products` es
  "SILETI CAMILLA 3 TIEMPOS NEGRO ST-4100-1" (categoría LIFTING) — confirma que es la camilla ya
  publicada, no una silla de barbería distinta. Detalle en `DATA_CONFLICTS.md`.
- **Direcciones verificadas** contra `tenant_branches`: la de Matriz se corrigió (antes decía
  "diagonal a Av. Manabí", la base de datos dice "entre Av. Manabí y García Moreno" — más
  preciso). La de Sucursal coincidía exactamente con lo ya publicado. Actualizado en
  `src/lib/site-config.ts`.
- **Descubrimiento importante para SEO-002**: la tabla `products` de esa base de datos tiene el
  catálogo real y actualizado (código, nombre, categoría, precios por nivel, stock). Es candidata
  fuerte a ser la fuente autorizada de `catalog:sync`, en vez de depender solo del export de
  Telegram. Ver nota completa en `NEXT_SESSION.md`.
- **CONFLICT-001 (número de WhatsApp de la Sucursal) sigue sin resolver**: se revisó
  `tenant_channels` en la misma base de datos y está vacía (no hay canal de WhatsApp configurado
  ahí todavía), así que no aportó el dato. Sigue pendiente de confirmación humana.

## Archivos modificados en esta sesión (Sesión 1)

- Nuevo: `docs/seo-work/MASTER_PLAN.md`
- Nuevo: `docs/seo-work/CURRENT_STATE.md` (este archivo)
- Nuevo: `docs/seo-work/NEXT_SESSION.md`
- Nuevo: `docs/seo-work/DECISIONS.md`
- Nuevo: `docs/seo-work/DATA_CONFLICTS.md`
- Nuevo: `docs/seo-work/MANUAL_ACTIONS.md`
- Nuevo: `docs/seo-work/SESSION_LOG.md`
- Nuevo: `docs/seo-work/sessions/session-01.md`
- Nuevo: `tasks/seo-tasks.json`
- Nuevo: `tasks/completed/.gitkeep`, `tasks/failed/.gitkeep`, `tasks/evidence/.gitkeep`
- Nuevo: `scripts/tasks.mjs`
- Nuevo: `docs/AUTOMATED_TASKS.md`
- Nuevo: `deploy/systemd/*` (plantillas, no instaladas)
- Modificado: `package.json` (scripts `task:*`)

## Servicios necesarios para trabajar

- Node.js ≥ 22.12 (definido en `package.json` → `engines`).
- Ninguna base de datos ni backend corriendo es necesaria para el sitio en sí (es estático).
- Para Sesión 2 en adelante (sync de catálogo): acceso de lectura al repo `ASISTENTE`
  (`C:\Users\wleon\Proyectos\ASISTENTE`) y, opcionalmente, al export de Telegram en
  `C:\Users\wleon\Downloads\38833FF26BA1D.UnigramPreview_g9c9v27vpyspw!App\ChatExport_2026-08-06\`.

## Estado del build

✅ `npm run build` y `npm run seo:validate` pasan sin errores (verificado 2026-08-15 tras la
migración a Content Collections de la Sesión 19 — 101 páginas generadas, 74 productos, sitemap
OK).

## Estado de las pruebas

⚠️ No existen aún pruebas automatizadas (`npm run test`) ni linter configurado en este proyecto.
No inventar que existen. Se añadirán cuando una tarea del plan lo requiera (Sesión 14/15).

## Decisiones que no deben revertirse

Ver `docs/seo-work/DECISIONS.md` completo. Resumen:

- Repo del sitio independiente de `ASISTENTE`.
- Stack: Astro 7 + React islands + Tailwind v4.
- Paleta real negro/blanco/rojo `#CE113B` (no el burdeos supuesto inicialmente).
- Foco del catálogo/homepage: **Muebles** primero.
- Direcciones tomadas de Telegram (texto), pendientes de verificación con coordenadas.
