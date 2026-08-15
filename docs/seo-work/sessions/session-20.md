# Sesión 20 (CMS-1) — Auditoría Decap vs. Pages CMS, y reemplazo

**Fecha:** 2026-08-15
**Fase:** fuera del `MASTER_PLAN.md` original — pedido directo del usuario, continuación de la
Sesión 19.
**Rama:** `feature/alva-seo-ai-discovery`

## Objetivo

Antes de conectar Decap CMS (instalado en la Sesión 19) a GitHub/Netlify en producción, el usuario
pidió detenerse y hacer una auditoría comparativa contra Pages CMS, sin tocar la migración a
Content Collections ya hecha. Con la recomendación de esa auditoría aprobada ("B. Reemplazar Decap
por Pages CMS"), esta sesión ejecuta el reemplazo.

## Parte 1: auditoría

Resultado completo entregado al usuario en el chat de la sesión anterior; resumen de lo verificado
empíricamente (no solo revisado por lectura de código):

- `npm run build` (101 páginas) y `npm run seo:validate` (0 errores) re-verificados desde cero.
- 74 productos / 4 promociones confirmados contando archivos reales en
  `src/content/products/**/*.json` y `src/content/promos/*.json`.
- Canonical, JSON-LD (Organization + BreadcrumbList + Product), Open Graph y breadcrumbs
  verificados en el HTML generado de una página de producto real.
- **Cero impacto de Decap en el bundle público**: `grep -rl "decap" dist --include="*.html"
  --include="*.js" | grep -v admin` → 0 resultados. Nada fuera de `dist/admin/` referencia Decap.
- **Causa real del 404 en `/admin/`**: se había reportado en la Sesión 19 como un problema sin
  resolver. Se investigó en serio esta vez: levantando `astro preview` (servidor que sirve `dist/`
  tal cual, el más parecido a un hosting de producción real) y probando `/admin/`, `/admin` y
  `/admin/index.html` — **las tres devuelven 200**. El 404 era exclusivo del dev server de Astro
  (`astro dev`), no del build de producción. No hacía falta ningún hack — la conclusión terminó
  siendo irrelevante para la decisión final, porque Pages CMS ni siquiera usa una ruta `/admin`.
- **Git Gateway está deprecado** (confirmado contra `docs.netlify.com`, no contra supuestos
  viejos): "nuevas configuraciones de Git Gateway no se recomiendan". Netlify Identity en sí se
  mantiene (revirtieron su deprecación en feb. 2026), pero Git Gateway —la pieza que Decap usaba
  para autenticar— no.
- **Pages CMS** confirmado contra su documentación actual: soporta `format: json` nativamente,
  tiene una opción `subfolders: true` diseñada exactamente para el problema que encontramos con
  Decap (colecciones con archivos repartidos en subcarpetas por categoría), se autentica vía
  GitHub App (sin depender de qué hosting sirva el sitio), permite invitar usuarios por correo con
  enlace mágico sin necesitar cuenta de GitHub, tiene diseño responsive, y es 100% gratis y open
  source.

Sources consultadas: [Git Gateway | Netlify Docs](https://docs.netlify.com/manage/security/secure-access-to-sites/git-gateway/),
[decaporg/decap-cms discussion #7419](https://github.com/decaporg/decap-cms/discussions/7419),
[pagescms.org/docs](https://pagescms.org/docs/), [pages-cms en GitHub Marketplace](https://github.com/marketplace/pages-cms).

## Parte 2: reemplazo

### Eliminado

- `public/admin/index.html`
- `public/admin/config.yml`
- `decap-server` (`devDependencies` de `package.json`, vía `npm uninstall decap-server`)
- Script `"admin": "decap-server"` de `package.json`
- Exclusión de `/admin` en `scripts/validate-seo.ts` (código muerto — ya no existe esa ruta)
- `Disallow: /admin/` en todos los grupos de `robots.txt` — **no existe ninguna ruta
  administrativa bajo `alvaimportaciones.com`** (Pages CMS vive en `app.pagescms.org`), así que ya
  no hay nada que bloquear ahí. Documentado en el propio `robots.txt`.

### Creado

- `.pages.yml` (raíz del repo) — configuración completa de Pages CMS. Ver sección siguiente.
- `docs/seo-work/sessions/session-20.md` (este archivo)

### Modificado (solo documentación/comentarios, sin cambios funcionales)

- `src/content.config.ts`: comentario del encabezado ya no nombra "Decap CMS" (genérico: "un CMS
  externo"). El schema/lógica **no cambió**.
- `src/lib/products.ts`: mismo tipo de ajuste de comentario, sin cambios funcionales.
- `src/components/PromoShowcase.astro`: mismo tipo de ajuste de comentario, sin cambios
  funcionales — **no se rediseñó** (pedido explícito del usuario).
- `scripts/validate-seo.ts`: quitada la exclusión de `/admin` (dead code).
- `public/robots.txt`: ver arriba.
- `package.json` / `package-lock.json`: quitado `decap-server` y el script `admin`.
- `docs/CONTENT_WORKFLOW.md` §6, `docs/DEPLOYMENT.md` §7, `docs/seo-work/MANUAL_ACTIONS.md` fila
  #17, `docs/AUTOMATED_TASKS.md`: reescritos para describir Pages CMS en vez de Decap.
- `docs/seo-work/CURRENT_STATE.md`, `docs/seo-work/SESSION_LOG.md`: nueva entrada de esta sesión.

### Sin tocar (como pidió el usuario, ninguna necesidad comprobada de cambiarlo)

`src/content.config.ts` (schema Zod), `src/content/products/**/*.json` (74 archivos),
`src/content/promos/*.json` (4 archivos), `src/lib/products.ts` (lógica) — íntegros.

## `.pages.yml` — diseño y qué queda pendiente de verificar

Una sola colección `products` con `path: src/content/products` y `subfolders: true`, en vez de las
4 colecciones que requirió Decap — la razón por la que Decap las necesitó (no lee subcarpetas
dentro de una sola colección) tiene solución nativa documentada en Pages CMS. Colección `promos`
sin cambios de estructura. Ambas con `format: json`.

Los campos del formulario de productos son exactamente los que ya existen en
`src/content.config.ts` (slug, nombre, categoría, subcategoría, código, precio, marca,
características, foto, ALT) — **no se agregaron** los campos que pedía la especificación del
cambio pero que no existen en el modelo real hoy: precio anterior, descripción larga, galería de
varias fotos, destacado, disponible, SEO title/description por producto. Agregarlos requeriría
extender el schema Zod y los componentes que renderizan la página de producto — es un cambio de
funcionalidad, no de CMS, y el punto 1 de la especificación pedía explícitamente no tocar
`content.config.ts` salvo necesidad comprobada de compatibilidad (no es el caso aquí: la ausencia
de estos campos no es un problema de compatibilidad con Pages CMS, es que el sitio nunca los tuvo).
Mismo criterio para promociones: no existe CTA/enlace por promoción ni bandera activa/inactiva en
el modelo real (el CTA de la sección es fijo, igual para las 4 promos), así que no se inventaron en
`.pages.yml`.

`slug` y `code` llevan un `description` (texto de ayuda visible en el campo) advirtiendo que no se
deben cambiar en un producto ya publicado — no se encontró confirmación en la documentación de que
Pages CMS tenga un modo "solo lectura" por campo, así que esta advertencia de texto es la única
protección que se pudo confirmar que existe.

### No se pudo probar en vivo (bloqueado, ver Parte 3)

No hay forma de instalar la GitHub App de Pages CMS ni iniciar sesión sin que el dueño de la cuenta
de GitHub lo autorice manualmente desde su propio navegador — es un consentimiento OAuth, no algo
automatizable. Por eso `.pages.yml` se validó solo por sintaxis (`npx js-yaml .pages.yml`, parseo
correcto) y quedan documentados **dentro del propio archivo**, como comentarios, los puntos que
hay que revisar en el primer login real antes de confiar el catálogo real al panel:

1. Si `output: ""` en la fuente de medios guarda solo el nombre del archivo (lo que necesita
   `imageFor()` en el código) o una ruta completa. Si guarda una ruta, el arreglo es cambiar
   `imageFor()` en los 3-4 archivos que la definen para quitar el prefijo — no se aplicó
   preventivamente porque no hay forma de confirmar cuál de los dos casos es real sin haber hecho
   login, y tocar código de producción basado en una suposición no verificada no correspondía.
2. Si `subfolders: true` + el patrón de `filename` reparten un producto nuevo en
   `src/content/products/<categoría>/` solo, o si hay que elegir la subcarpeta a mano.
3. Los nombres de tipo de campo `text` (párrafo) y `number` se usaron por ser los más comunes en
   este tipo de herramientas, sin poder confirmarlos contra la referencia completa de tipos de
   campo de Pages CMS.

## Parte 3: verificación local y publicación bloqueada intencionalmente

Siguiendo la instrucción explícita del usuario (punto 9 de la especificación): como probar Pages
CMS de punta a punta requiere una acción manual del dueño de la cuenta de GitHub que no se puede
automatizar ni suplantar, **se detuvo ahí** — se dejó `.pages.yml` terminado, se validó todo lo
demás localmente (ver más abajo), y se documenta la acción exacta pendiente en lugar de continuar.
No se hizo ningún push a GitHub, ni cambio de hosting, ni configuración de DNS, ni instalación de
la GitHub App (ninguna de esas acciones puede completarla una sesión de Claude Code).

## Validaciones ejecutadas

- Sintaxis de `.pages.yml` verificada con `npx js-yaml .pages.yml` (sin tocar `package.json` —
  ejecución transitoria vía `npx`, confirmado con `git status` que no dejó rastro).
- `npm run build` → ver resultado exacto en el reporte final de la sesión.
- `npm run seo:validate` → ver resultado exacto en el reporte final de la sesión.
- Conteo de productos/promociones re-confirmado tras el cambio.

## Resultado

Decap CMS retirado por completo del repo. `.pages.yml` listo, validado por sintaxis, con sus
limitaciones de verificación documentadas honestamente en vez de asumidas. Ningún cambio a la
arquitectura de Content Collections. Pendiente exclusivamente la acción manual de GitHub descrita
en la Parte 3 — sin eso, no hay forma de terminar de probar Pages CMS.

## Pendientes

- Instalar la GitHub App de Pages CMS en `wleon6745-16/alva-importaciones-web` y conectar el repo
  (`docs/seo-work/MANUAL_ACTIONS.md` #17).
- Verificar en el primer login real los 3 puntos listados arriba y en `.pages.yml`.
- Invitar por correo a la persona de ALVA que va a administrar contenido.
- Extender el schema si en algún momento se decide agregar destacado/disponible/galería/precio
  anterior/SEO por producto — no es parte de este cambio de CMS.
