# Sesión 25 — Solución final de administración de contenido: vuelta a Decap CMS + DecapBridge

**Fecha:** 2026-08-15
**Fase:** fuera del `MASTER_PLAN.md` original — cierre de la saga de CMS iniciada en la Sesión 19.
**Rama:** `feature/alva-seo-ai-discovery`

## Contexto: por qué se volvió a Decap

Después de tres CMS distintos probados en este proyecto, el usuario pidió una solución definitiva
para que cualquier persona de ALVA pueda administrar el sitio sin conocimientos de programación.
Resumen de lo que se probó y por qué ninguna de las otras dos alternativas se quedó:

| CMS | Resultado real, probado en vivo |
|---|---|
| **Decap CMS** (Sesión 19) | Funcionó de punta a punta: listado correcto, edición de todos los campos, imagen con preview real, guardado real verificado byte a byte. Se dejó de usar solo porque Git Gateway (necesario para producción) está deprecado por Netlify — no por ningún fallo de funcionamiento. |
| **Pages CMS** (CMS-1, Sesión 20-22) | Se conecta directo a GitHub sin depender de Netlify, pero tuvo un bug de caché sin corregir en su propio proyecto ([pages-cms/pages-cms#301](https://github.com/pages-cms/pages-cms/issues/301)) que a veces ocultaba colecciones recién creadas, y necesitó reestructurar productos en 4 colecciones para que la vista previa de fotos funcionara. |
| **Sveltia CMS** (Sesión 23-24, spike controlado) | Cargó y leyó los 25 productos de muebles correctamente, incluida la lista de características como ítems con botón "Agregar" (justo lo que se pedía). Pero **guardar no escribía al archivo real en modo local**, confirmado en **tres intentos independientes** — el mío, uno hecho a mano por el usuario, y una repetición completa del flujo sin pausas — todos con el mismo resultado: la interfaz decía "guardado" pero el archivo nunca cambiaba (`git status` limpio, `mtime` sin tocar). Una falla silenciosa de esa naturaleza es inaceptable para un panel pensado para alguien no técnico, que no tendría forma de saber que su cambio se perdió. |

Decap es la única de las tres con un guardado real, verificado, funcionando — por eso se volvió a
Decap en esta sesión, en vez de seguir probando alternativas nuevas.

## Cambio aplicado

### Eliminado
- `.pages.yml` (Pages CMS, ya no se usa)
- `public/admin/index.html` y `config.yml` del spike de Sveltia (ya rechazado)

### Creado / restaurado
- `public/admin/index.html` — carga Decap CMS (no Sveltia, no Pages CMS)
- `public/admin/config.yml` — 4 colecciones de productos (Muebles, Uñas, Capilares, Maquillaje,
  una por categoría porque Decap no lee subcarpetas dentro de una sola colección — mismo patrón
  validado en la Sesión 19) + colección de promociones. Campos: exactamente los que existen hoy en
  `src/content.config.ts` (slug, nombre, categoría oculta con valor fijo por colección,
  subcategoría, código, precio, marca, características como lista con botón "Agregar", foto con
  preview, ALT). `slug` y `code` con advertencia visible de no cambiarlos en un producto ya
  publicado. Fotos: `media_folder`/`public_folder: ""` por colección (el campo `image` sigue
  guardando solo el nombre del archivo — mismo mecanismo ya probado funcionando en la Sesión 19).
- `npm run admin` (`decap-server`) restaurado en `package.json`, `decap-server` reinstalado como
  devDependency.
- `robots.txt`: `Disallow: /admin/` restaurado en todos los grupos de bots (existe la ruta de
  nuevo).
- `scripts/validate-seo.ts`: excluye `/admin` del checklist de SEO de nuevo (app shell, no
  contenido indexable).

### Backend de producción: DecapBridge en vez de Git Gateway directo
`public/admin/config.yml` usa `backend: { name: git-gateway, identity_url:
https://auth.decapbridge.com/sites/TU-SITE-ID, gateway_url: https://gateway.decapbridge.com }` —
[DecapBridge](https://decapbridge.com) es un reemplazo gratuito hecho específicamente para
sustituir Netlify Identity + Git Gateway (la pieza deprecada que motivó dejar Decap la primera
vez), sin depender de qué hosting sirva el sitio ni requerir mantener un servidor propio. El valor
`TU-SITE-ID` es un placeholder — falta que el usuario cree una cuenta en decapbridge.com, conecte
el repo, y reemplace ese valor por el Site ID real (ver `docs/seo-work/MANUAL_ACTIONS.md` #17).
Crear esa cuenta es una acción externa que no se puede automatizar desde una sesión de Claude Code.

### Sin tocar
`src/content.config.ts`, `src/content/products/**/*.json` (74 archivos), `src/content/promos/*.json`
(4 archivos), `src/lib/products.ts`, todas las implementaciones de `imageFor()` — íntegros, sin
cambios funcionales en ningún momento de esta sesión ni de las Sesiones 20-24.

## Verificación en vivo (no solo lectura de código)

Con `npm run admin` (`decap-server` en `localhost:8081`) + `astro dev --background`:

1. `http://localhost:4321/admin/index.html` carga Decap CMS de inmediato — **sin login, sin
   permiso de carpeta nativo, sin ninguna acción manual** (a diferencia de Sveltia, Decap usa
   `decap-server` como proxy HTTP normal, no la API nativa de sistema de archivos del navegador —
   esto es automatizable de punta a punta).
2. Las 5 colecciones (Muebles, Uñas, Capilares, Maquillaje, Promociones) cargan sus entradas
   reales — confirmado el listado completo de las 25 fichas de muebles con nombre y precio
   correctos.
3. Se abrió "Butaca Francia": todos los campos correctos, "3 características" con botón "Add
   características", foto con preview cargando de verdad (peticiones `blob:` con 200 OK).
4. **Prueba de escritura real**: se cambió el precio de 99 a 99.03 y se publicó. Se verificó
   `src/content/products/muebles/butaca-francia.json` directamente en disco — el `price` sí
   cambió a `99.03` (`git diff` lo confirma), no solo el mensaje de la interfaz. Se revirtió a 99
   manualmente y se confirmó `git status` limpio de nuevo.

## Validaciones ejecutadas

- `npx js-yaml public/admin/config.yml` → sintaxis válida.
- `npm run build` → ✅ 101 páginas.
- `npm run seo:validate` → ✅ 0 errores, 74 productos, 4 promociones.
- `git diff --stat` antes de commitear → confirmado que solo tocó lo esperado (ver archivos
  modificados en el reporte de esta sesión).

## Resultado

Panel de administración funcionando de verdad en local, sin ninguna cuenta ni configuración
adicional, verificado con una prueba de escritura real (no solo confiado en el mensaje de la
interfaz, lección aprendida directamente del fallo de Sveltia). Producción pendiente exclusivamente
de que el usuario cree la cuenta en DecapBridge.

## Pendiente

- Crear cuenta en `decapbridge.com`, conectar el repo, reemplazar `TU-SITE-ID` en
  `public/admin/config.yml` (`MANUAL_ACTIONS.md` #17).
- El usuario mencionó que ya tiene el dominio agregado a Cloudflare — el hosting concreto y el
  despliegue en sí quedan para una sesión futura, no se tocó nada de eso en esta sesión.
