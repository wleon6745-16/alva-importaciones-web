# Estado actual del proyecto

> Este archivo lo mantiene actualizado `scripts/tasks.mjs` en los bloques marcados con
> `<!-- AUTO:... -->`. El resto lo actualiza quien cierra la sesión, a mano, siguiendo el
> protocolo de cierre de `MASTER_PLAN.md`.

## Control de tarea (automático)

<!-- AUTO:SUMMARY:START -->
- Fase actual: 15
- Tarea actual: SEO-015
- Estado de la tarea actual: completed
- Última actualización: 2026-08-09T00:15:14.074Z
<!-- AUTO:SUMMARY:END -->

## Git

- Repositorio: `C:\Users\wleon\Proyectos\alva-importaciones-web`
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

## Próxima tarea: SEO-016 — Preparación de producción (última fase)

Aún no iniciada. Ver `tasks/seo-tasks.json` y `docs/seo-work/NEXT_SESSION.md`.

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

## Tareas pendientes

Ver `tasks/seo-tasks.json` — Fase 16 (SEO-016, la última), en estado `pending`.

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

✅ `npm run build` pasa sin errores (verificado 2026-08-06, 12 páginas generadas, sitemap OK).

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
