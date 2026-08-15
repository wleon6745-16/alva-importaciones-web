# Registro de sesiones

Una entrada por sesión, la más reciente al final. Ver el detalle largo de cada una en
`docs/seo-work/sessions/session-NN.md`.

---

Sesión: 01
Fecha: 2026-08-06
Duración aproximada: ~1 hora
Objetivo: Crear el sistema persistente de planificación, ejecución, validación y reanudación
(Fase 1 del `MASTER_PLAN.md`).
Trabajo completado: estructura `docs/seo-work/` y `tasks/` completa; `tasks/seo-tasks.json` con
las 16 sesiones/fases del plan; scripts `scripts/tasks.mjs` + comandos `npm run task:*`;
`MASTER_PLAN.md`, `CURRENT_STATE.md`, `NEXT_SESSION.md`, `DECISIONS.md`, `DATA_CONFLICTS.md`
(2 conflictos reales detectados y registrados, no resueltos), `MANUAL_ACTIONS.md` (13 acciones
pendientes registradas); `docs/AUTOMATED_TASKS.md` y plantillas `deploy/systemd/` para las tareas
programadas futuras (Sesión 16 las activará).
Trabajo no completado: ninguno dentro del alcance de SEO-001.
Commits: ver hash reportado al final de la sesión en el mensaje al usuario.
Pruebas: `npm run build` verificado exitoso antes y después de los cambios de esta sesión (los
cambios de esta sesión son solo documentación/scripts, no tocan `src/`).
Errores: ninguno.
Siguiente tarea: SEO-002 — Fuente central del catálogo. Ver `NEXT_SESSION.md`.

---

Sesión: 02
Fecha: 2026-08-07
Duración aproximada: ~1 hora
Objetivo: Fuente central del catálogo sanitizada (Fase 2 del `MASTER_PLAN.md`).
Trabajo completado: `src/types/product.ts` (tipo `Product`); `scripts/sync-public-catalog.ts`
(seed manual de los 25 muebles + slugify con desambiguación + validación de saneamiento);
`src/data/products.generated.json` generado (25 productos, sin costo/margen/cliente, IDs y slugs
únicos); `src/pages/productos/muebles.astro` migrado para leer del JSON en vez de hardcodear
arrays (imágenes resueltas vía `import.meta.glob` para mantener `astro:assets`); `npm run
catalog:sync` añadido; `.claude/launch.json` creado. Decisión tomada: no conectar en vivo a la
base de datos de `ASISTENTE` todavía (sitio estático sin backend propio para guardar
credenciales) — documentado en `docs/seo-work/sessions/session-02.md`, no es un conflicto de
datos nuevo.
Trabajo no completado: ninguno dentro del alcance de SEO-002.
Commits: ver hash reportado al final de la sesión en el mensaje al usuario.
Pruebas: `npm run build` exitoso (12 páginas); `/productos/muebles` verificado en navegador
(`astro dev`) con contenido idéntico al anterior, incluyendo formato de precio `$17.50`.
Errores: ninguno bloqueante (se corrigió en la misma sesión un formato de precio `$17.5` →
`$17.50` antes de completar la tarea).
Siguiente tarea: SEO-003 — Slugs y páginas individuales de muebles. Ver `NEXT_SESSION.md`.

---

Sesión: 03
Fecha: 2026-08-08
Duración aproximada: ~45 min
Objetivo: Slugs y páginas individuales de muebles (Fase 3 del `MASTER_PLAN.md`).
Trabajo completado: `src/pages/productos/muebles/[slug].astro` (25 páginas de producto vía
`getStaticPaths`, breadcrumbs, imagen, precio/código opcionales, características, CTA de
WhatsApp, relacionados por subcategoría); listado (`muebles.astro`) enlazado a cada página de
producto.
Trabajo no completado: ninguno dentro del alcance de SEO-003.
Commits: ver hash reportado al final de la sesión en el mensaje al usuario.
Pruebas: `npm run build` exitoso (37 páginas); verificado un solo `<h1>` por página de producto;
caso sin precio/código probado; navegación real en navegador desde el listado hasta un producto.
Errores: se encontró y corrigió un bug de scope de `getStaticPaths` (hoisted a module scope por
Astro, no puede leer un `const` declarado fuera de la función) que rompía el build al generar las
páginas de producto — documentado en `docs/seo-work/sessions/session-03.md` para no repetirlo en
SEO-012.
Siguiente tarea: SEO-004 — WhatsApp contextual y conversiones. Ver `NEXT_SESSION.md`.

---

Sesión: 04
Fecha: 2026-08-08
Duración aproximada: ~25 min
Objetivo: WhatsApp contextual y conversiones (Fase 4).
Trabajo completado: `WhatsAppCTA.astro` con props de tracking (`productId`, `productName`,
`category`, `branch`) y `dataLayer.push("whatsapp_click", ...)` en cada clic (sin proveedor de
analítica instalado, patrón GTM/GA4 genérico); mensaje de WhatsApp de producto ahora incluye la
URL de la página.
Trabajo no completado: ninguno dentro del alcance.
Pruebas: `npm run build` OK (37 páginas); verificado en navegador (viewport móvil) que el CTA
mide 48px de alto y que el clic llena `window.dataLayer` con los 5 campos esperados sin datos
personales.
Errores: ninguno.
Siguiente tarea: SEO-005 — Metadatos y Schema de productos. Ver `NEXT_SESSION.md`.

---

Sesión: 05
Fecha: 2026-08-08
Duración aproximada: ~20 min
Objetivo: Metadatos y Schema de productos (Fase 5).
Trabajo completado: `productSchema()` en `structured-data.ts` (Product + Brand + Offer solo con
precio real, sin availability/itemCondition/reviews inventados); títulos únicos en las 25
páginas de producto (fix de 4 duplicados "Sillón de peluquería" desambiguados por precio); OG
image propia por producto vía `getImage()`.
Pruebas: `npm run build` OK; 25 títulos y 25 descripciones verificados únicos; JSON-LD validado
parseando el HTML generado; cero `aggregateRating`/`review` en todo el catálogo.
Errores: ninguno.
Siguiente tarea: SEO-006 — Categorías y enlaces internos. Ver `NEXT_SESSION.md`.

---

Sesión: 06
Fecha: 2026-08-08
Duración aproximada: ~20 min
Objetivo: Categorías y enlaces internos (Fase 6).
Trabajo completado: `RelatedCategories.astro` (enlazado cruzado entre las 4 categorías); nav de
subcategorías + anclas en `/productos/muebles`; FAQ visible + `FAQPage` JSON-LD (sin reclamos de
política comercial no verificada, ver `MANUAL_ACTIONS.md` #5). Filtros y paginación: no aplican
todavía (documentado, no son huecos pendientes).
Pruebas: `npm run build` OK; anclas/ids verificados; FAQ con 4 entidades; enlaces cruzados
verificados en `/productos/unas`.
Errores: ninguno.
Siguiente tarea: SEO-007 — Sucursales y SEO local. Ver `NEXT_SESSION.md`.

---

Sesión: 07
Fecha: 2026-08-08
Duración aproximada: ~20 min
Objetivo: Sucursales y SEO local (Fase 7).
Trabajo completado: `/locales` (general) + `/locales/[branch]` (Matriz, Sucursal) con dirección
real, horario, WhatsApp por sucursal, mapa y JSON-LD `LocalBusiness` propio (`areaServed`
Portoviejo). `LocationsMap.astro` en `/contacto` enlaza a las páginas nuevas.
Pruebas: `npm run build` OK (40 páginas); JSON-LD verificado; números de WhatsApp por sucursal
verificados correctos.
Errores: ninguno.
Siguiente tarea: SEO-008 — Páginas comerciales locales. Ver `NEXT_SESSION.md`.

---

Sesión: 08
Fecha: 2026-08-08
Duración aproximada: ~20 min
Objetivo: Páginas comerciales locales (Fase 8).
Trabajo completado: 6 landing pages de intención local (muebles, sillas de barbería, camillas,
uñas, equipamiento Manabí, cursos de uñas), cada una con contenido propio enlazando productos
reales; se quitó una afirmación de "envíos" no verificada antes de terminar.
Pruebas: `npm run build` OK (46 páginas); h1/título/descripción únicos verificados; enlaces a
producto verificados contra slugs reales.
Errores: ninguno.
Siguiente tarea: SEO-009 — Información comercial de Telegram (validada). Ver `NEXT_SESSION.md`.

---

Sesión: 09
Fecha: 2026-08-08
Duración aproximada: ~20 min
Objetivo: Información comercial de Telegram validada (Fase 9).
Trabajo completado: `scripts/extract-telegram-commercial-data.ts` (1109 mensajes leídos, 5
categorías, comparación contra datos publicados); `reports/telegram-data-candidates.md`
generado; hallazgo nuevo (envíos a todo el país, repetido en el canal) registrado en
`MANUAL_ACTIONS.md` #14 sin publicarlo.
Pruebas: script ejecuta sin error; `npm run build` OK (46 páginas, sin cambios de contenido).
Errores: ninguno.
Siguiente tarea: SEO-010 — Guías para búsqueda y buscadores con IA. Ver `NEXT_SESSION.md`.

---

Sesión: 10
Fecha: 2026-08-08
Duración aproximada: ~25 min
Objetivo: Guías para búsqueda y buscadores con IA (Fase 10).
Trabajo completado: 5 guías (`GuideLayout.astro`, `articleSchema()`) + índice `/guias`, todas con
Article+FAQPage+BreadcrumbList JSON-LD, autor institucional, fecha real, enlazando productos y
categorías reales sin inventar especificaciones.
Pruebas: `npm run build` OK (52 páginas); h1 único por página; JSON-LD verificado.
Errores: se encontró y corrigió un bug de zona horaria en el formateo de fecha ("7 de agosto" en
vez de "8 de agosto") — documentado en `docs/seo-work/sessions/session-10.md`.
Siguiente tarea: SEO-011 — Robots, sitemap, llms.txt e IndexNow. Ver `NEXT_SESSION.md`.

---

Sesión: 11
Fecha: 2026-08-08
Duración aproximada: ~20 min
Objetivo: Robots, sitemap, llms.txt e IndexNow (Fase 11).
Trabajo completado: `robots.txt` con bots de IA explícitos; `llms.txt` nuevo; IndexNow
implementado (`indexnow-prepare-keyfile.mjs` como hook `prebuild`, `indexnow-submit.mjs` vía
`npm run indexnow`), sin clave real (no existe todavía, ver `MANUAL_ACTIONS.md` #10) — ambos
scripts no-op seguro sin `INDEXNOW_KEY`, probados con clave falsa.
Pruebas: `npm run build` OK (52 páginas); `dist/robots.txt`/`dist/llms.txt` verificados; sitemap
con 51 URLs (25 de producto, 404 excluido correctamente); scripts de IndexNow probados
manualmente con y sin clave.
Errores: ninguno.
Siguiente tarea: SEO-012 — Uñas, maquillaje y capilares (páginas individuales). Ver `NEXT_SESSION.md`.

---

Sesión: 12
Fecha: 2026-08-08
Duración aproximada: ~40 min
Objetivo: Uñas, maquillaje y capilares con páginas individuales (Fase 12).
Trabajo completado: 25 productos reales curados desde Telegram (9 uñas, 8 capilares, 8
maquillaje), cada uno con foto real verificada del mismo mensaje, precio, y marca/código cuando
la fuente lo traía; `products.generated.json` 25→50 productos; ruta dinámica compartida
`productos/[category]/[slug].astro`; las 3 páginas de categoría ahora muestran productos reales
agrupados por subcategoría en vez de la galería genérica.
Pruebas: `npm run build` OK (77 páginas); h1 único por página; 0 títulos/descripciones
duplicados en 50 productos; revisado en navegador.
Errores: se repitió el bug de scope de `getStaticPaths` (ya documentado en SEO-003) al escribir
la nueva ruta — corregido antes de commitear.
Siguiente tarea: SEO-013 — Imágenes, rendimiento y accesibilidad. Ver `NEXT_SESSION.md`.

---

Sesión: 13
Fecha: 2026-08-08
Duración aproximada: ~25 min
Objetivo: Imágenes, rendimiento y accesibilidad (Fase 13).
Trabajo completado: fix de jerarquía de encabezados (6 páginas con salto h1→h3, corregido);
`loading="eager"`+`fetchpriority="high"`+`srcset` (densities) en imágenes LCP-críticas (producto
y home); auditoría de contraste, foco visible, alt text (0 faltantes en 76 páginas) y menú móvil
(accesible nativo, probado).
Pruebas: `npm run build` OK (77 páginas); script de jerarquía 0 issues; script de alt 0 issues;
srcset/eager verificados en HTML generado; menú móvil probado en navegador.
Errores: ninguno sin corregir (el bug de jerarquía de encabezados fue el hallazgo principal, ya
resuelto).
Siguiente tarea: SEO-014 — Validador SEO automático. Ver `NEXT_SESSION.md`.

---

Sesión: 14
Fecha: 2026-08-08
Duración aproximada: ~25 min
Objetivo: Validador SEO automático (Fase 14).
Trabajo completado: `scripts/validate-seo.ts` + `npm run seo:validate` (títulos/descripciones
duplicados, canonical, h1, alt, JSON-LD, enlaces rotos, huérfanas, slugs duplicados, productos
incompletos). Bug de scope corregido en la detección de huérfanas (normalización de URL). Tras
el fix, se encontraron 12 páginas realmente huérfanas (guías + 6 landing locales) y se
corrigieron añadiendo enlaces internos reales (nav global "Guías", enlaces contextuales desde
muebles/unas/cursos).
Pruebas: `npm run build && npm run seo:validate` → 0 errores, 12 avisos informativos (productos
sin más características que las que trae la fuente).
Errores: ninguno sin corregir.
Siguiente tarea: SEO-015 — Pruebas integrales y estabilización. Ver `NEXT_SESSION.md`.

---

Sesión: 15
Fecha: 2026-08-08
Duración aproximada: ~20 min
Objetivo: Pruebas integrales y estabilización (Fase 15).
Trabajo completado: fix de `charset utf-8` faltante en `nginx.conf` (encontrado por mojibake real
en `robots.txt`, habría afectado también a `llms.txt` en producción); prueba de resiliencia de
`catalog:sync` con fallo simulado (confirma que preserva el catálogo válido, hash MD5 idéntico);
WhatsApp end-to-end probado en 3 contextos con verificación de `dataLayer`; Schema verificado en
8 tipos de página.
Pruebas: `npm run build` OK; `npm run seo:validate` OK (0 errores); `git diff --check` OK; menú
móvil con "Guías" verificado; 404 verificada.
Errores: ninguno sin corregir (el hallazgo de charset fue el principal, ya resuelto).
Siguiente tarea: SEO-016 — Preparación de producción. Ver `NEXT_SESSION.md`.

---

Sesión: 16
Fecha: 2026-08-08
Duración aproximada: ~15 min
Objetivo: Preparación de producción — cierre del plan (Fase 16, última).
Trabajo completado: `docs/DEPLOYMENT.md` (guía de despliegue completa); fix de `Dockerfile`
(`node:20-alpine` → `node:22-alpine`, no coincidía con `engines` de `package.json` ni con los
scripts `.ts` nuevos); checklist final consolidado en `MANUAL_ACTIONS.md`; verificación de que no
hay secretos en el repo; confirmado que las plantillas systemd siguen sin instalar.
Pruebas: `npm run build` OK; `npm run seo:validate` OK (0 errores); búsqueda de secretos en todo
el repo trackeado sin resultados.
Errores: ninguno sin corregir.
**Las 16 fases de `MASTER_PLAN.md` están completas.** Lo que queda es configuración de cuentas
externas del negocio, documentado en `MANUAL_ACTIONS.md` → "Checklist final de lanzamiento".

---

Sesión: 17
Fecha: 2026-08-09
Duración aproximada: ~90 min
Objetivo: Segunda pasada de calidad (pedido directo del usuario, fuera de las 16 fases del plan
original) — contenido editorial, imágenes, promociones de Telegram, rediseño de home, mobile.
Trabajo completado: 5 guías reescritas con voz editorial real; descubrimiento de un catálogo de
fotos por código en `ASISTENTE/backend/assets/` (7 productos actualizados con fotos mejores, 1
conflicto de datos resuelto — CONFLICT-003); home rediseñada (hero enmarcado sin upscaling,
`PromoShowcase.astro` con 4 campañas reales curadas de Telegram, `CategoryCard.astro` estilo
tile grande, `TrustSection.astro` reemplazando el carrusel de testimonios de ejemplo);
`docs/CONTENT_WORKFLOW.md` nuevo documentando el flujo completo.
Pruebas: `npm run build` y `npm run seo:validate` en verde tras cada bloque; jerarquía de
encabezados re-verificada (0 saltos en 77 páginas); verificado en navegador que el hero no hace
upscaling; verificado por HTTP directo que las imágenes cargan bien (se descartó una falsa alarma
del panel de navegador de esta sesión).
Errores: ninguno sin corregir. Se corrigió en la misma sesión un hero full-bleed que habría
estirado una imagen de baja resolución.
Siguiente: ver `docs/seo-work/sessions/session-17.md` sección "Pendientes".

---

Sesión: 19
Fecha: 2026-08-15
Duración aproximada: ~90 min
Objetivo: Panel de administración sin código (pedido directo del usuario) — requirió migrar antes
el catálogo a Astro Content Collections. Fuera de las 16 fases del plan original.
Trabajo completado: `src/content.config.ts` + `src/content/products/<categoría>/<slug>.json` (74
archivos) + `src/content/promos/*.json` (4 archivos) reemplazando
`src/data/products.generated.json`/`scripts/sync-public-catalog.ts` (eliminados); `src/lib/products.ts`
nuevo; 14 archivos consumidores migrados; `scripts/validate-seo.ts` actualizado; panel `/admin`
(Decap CMS) con 5 colecciones, probado end-to-end en navegador incluyendo un guardado real
verificado en disco; `npm run admin` (`decap-server`) nuevo; `robots.txt` y `seo:validate`
ajustados para excluir `/admin`; documentación actualizada (`CONTENT_WORKFLOW.md`,
`AUTOMATED_TASKS.md`, `DEPLOYMENT.md`, `MANUAL_ACTIONS.md`).
Trabajo no completado: panel en producción (requiere GitHub + Netlify Identity/Git Gateway, sin
configurar — ver `MANUAL_ACTIONS.md` #16-17); Docker Desktop en esta máquina sigue sin arrancar
(no bloqueante).
Pruebas: `npm run build` (101 páginas) y `npm run seo:validate` (0 errores) verificados antes y
después de la migración de datos; panel `/admin` verificado en navegador (Browser pane): listado
de entradas en las 5 colecciones, carga de campos e imagen, guardado de prueba confirmado
escribiéndose en el archivo real y revertido después.
Errores: dos hallazgos empíricos de Decap CMS corregidos en la misma sesión — folder collections
no leen subcarpetas (se separó en 4 colecciones por categoría) y necesitan `extension`/`format`
explícitos para JSON (sin YAML por defecto no listaba nada). Ver `docs/seo-work/sessions/session-19.md`
para el detalle.
Siguiente: resolver GitHub/Netlify para producción cuando el usuario lo decida; ver
`docs/seo-work/sessions/session-19.md` sección "Pendientes".

---

Sesión: 20 (CMS-1)
Fecha: 2026-08-15
Duración aproximada: ~2 horas (auditoría + implementación)
Objetivo: auditoría comparativa Decap CMS vs. Pages CMS pedida por el usuario, y ejecución de la
recomendación aprobada (reemplazar Decap por Pages CMS), conservando íntegra la arquitectura de
Content Collections de la Sesión 19.
Trabajo completado: auditoría (confirmó 74 productos/4 promos/101 páginas intactos, cero impacto
del panel en el bundle público, causa real del 404 de `/admin/` identificada como artefacto del
dev server — no existe en el build de producción, verificado con `astro preview`); investigación
con documentación actual (Git Gateway deprecado por Netlify; Pages CMS soporta JSON + subcarpetas
nativamente + login por correo sin GitHub); reemplazo ejecutado: `public/admin/`, `decap-server` y
`npm run admin` eliminados; `.pages.yml` nuevo (1 colección de productos con subcarpetas en vez de
4); `robots.txt` sin `Disallow: /admin/` (ya no existe esa ruta); comentarios que mencionaban Decap
actualizados en `src/content.config.ts`, `src/lib/products.ts`, `PromoShowcase.astro` (sin cambios
funcionales); documentación (`CONTENT_WORKFLOW.md`, `DEPLOYMENT.md`, `MANUAL_ACTIONS.md`)
actualizada.
Trabajo no completado: conexión real de Pages CMS (requiere que el dueño de la cuenta de GitHub
instale la GitHub App — consentimiento OAuth que no se puede automatizar, ver `MANUAL_ACTIONS.md`
#17); por lo mismo, varios detalles de `.pages.yml` quedaron marcados como "sin verificar en vivo"
en el propio archivo (formato del campo de imagen, reparto automático en subcarpetas, un par de
nombres de tipo de campo) — no se pudo probar Pages CMS de punta a punta en esta sesión.
Pruebas: `npm run build` y `npm run seo:validate` verificados después del cambio — ver
`docs/seo-work/sessions/session-20.md` para las cifras exactas.
Errores: ninguno introducido — `src/content.config.ts`, `src/content/products/`,
`src/content/promos/` y `src/lib/products.ts` no cambiaron funcionalmente.
Siguiente: instalar la GitHub App de Pages CMS y conectar el repo (acción manual del usuario), y
solo entonces verificar en vivo los puntos marcados como pendientes en `.pages.yml`.

---

Sesión: 21-24 (Pages CMS y Sveltia CMS descartados)
Fecha: 2026-08-15
Objetivo: pruebas en vivo de Pages CMS conectado de verdad, y luego un spike controlado de
Sveltia CMS como alternativa, ambos a pedido del usuario tras encontrar problemas reales.
Trabajo completado: Pages CMS reestructurado a 4 colecciones de productos + fuentes de medios
fijas (Sesión 22) para arreglar la vista previa de fotos; encontrado un bug de caché sin corregir
del propio Pages CMS que a veces impedía descubrir colecciones nuevas
(pages-cms/pages-cms#301); spike de Sveltia CMS (`public/admin/` temporal, `.pages.yml`
conservado sin tocar) que sí leyó los 25 productos de muebles y todos sus campos correctamente,
pero **guardar no escribía al archivo real** en modo local — confirmado en tres intentos
independientes, incluido uno hecho a mano por el usuario.
Trabajo no completado: ninguna de las dos alternativas quedó lista para producción.
Pruebas: verificación exhaustiva vía `git diff`/`mtime` del archivo real (no solo el mensaje de la
interfaz) en cada intento de guardado de Sveltia — los tres fallaron de forma idéntica.
Errores: ninguno introducido al repo real — ambos CMS se probaron sin tocar los 74+4 JSON reales
más allá de una prueba de escritura que se revirtió cada vez.
Siguiente: ver Sesión 25 — se volvió a Decap CMS.

---

Sesión: 25 (solución final de CMS)
Fecha: 2026-08-15
Objetivo: implementar una solución de administración de contenido definitiva, sin conocimientos
de programación, después de que Pages CMS y Sveltia CMS no dieran un resultado confiable.
Trabajo completado: `.pages.yml` eliminado; spike de Sveltia eliminado; Decap CMS restaurado en
`public/admin/` (4 colecciones de productos + promociones, mismo patrón validado en la Sesión 19);
`decap-server` reinstalado, `npm run admin` restaurado; `robots.txt` y `scripts/validate-seo.ts`
actualizados para `/admin` de nuevo; backend de producción configurado para DecapBridge (gratuito,
reemplaza Netlify Identity + Git Gateway, que está deprecado) en vez de Git Gateway directo;
documentación (`CONTENT_WORKFLOW.md`, `DEPLOYMENT.md`, `MANUAL_ACTIONS.md`, `CURRENT_STATE.md`)
actualizada para reflejar la decisión final.
Trabajo no completado: conectar DecapBridge en producción (requiere que el usuario cree una
cuenta externa — no automatizable).
Pruebas: `npm run build` (101 páginas) y `npm run seo:validate` (0 errores) verificados; panel
`/admin` probado en vivo con `decap-server` local — las 5 colecciones cargan sus entradas reales,
la foto de "Butaca Francia" se previsualiza, y un guardado de prueba (precio 99 → 99.03) se
verificó escrito en el archivo real con `git diff` (no solo el mensaje de la interfaz) y se
revirtió a 99 antes de continuar.
Errores: ninguno — `src/content.config.ts`, `src/content/products/`, `src/content/promos/`,
`src/lib/products.ts` y `imageFor()` sin cambios funcionales en todo el proceso.
Siguiente: crear cuenta en decapbridge.com y conectar el repo (acción manual del usuario,
`MANUAL_ACTIONS.md` #17); cuando el usuario decida el hosting definitivo (ya tiene el dominio en
Cloudflare), retomar el checklist de `DEPLOYMENT.md`.
