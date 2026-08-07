# Estado actual del proyecto

> Este archivo lo mantiene actualizado `scripts/tasks.mjs` en los bloques marcados con
> `<!-- AUTO:... -->`. El resto lo actualiza quien cierra la sesión, a mano, siguiendo el
> protocolo de cierre de `MASTER_PLAN.md`.

## Control de tarea (automático)

<!-- AUTO:SUMMARY:START -->
- Fase actual: 1
- Tarea actual: SEO-001
- Estado de la tarea actual: completed
- Última actualización: 2026-08-07T03:34:31.327Z
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

## Fase actual: 1 — Sistema de planificación y punto de restauración

## Tarea actual: SEO-001 — Crear sistema persistente de trabajo

Ver `tasks/seo-tasks.json` para la definición completa (criterios de aceptación, comandos de
validación).

## Tareas pendientes

Ver `tasks/seo-tasks.json` — Fases 2 a 16 (SEO-002 a SEO-016), todas en estado `pending`,
bloqueadas por dependencias hasta que SEO-001 se complete.

## Errores conocidos

- Ninguno bloqueante en el build actual.
- Ver `DATA_CONFLICTS.md` para inconsistencias de datos (no son errores de código).

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
