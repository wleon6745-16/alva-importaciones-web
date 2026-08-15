# Tareas automatizadas (producción)

Este documento describe los procesos automáticos que debe correr el **servidor de producción**
una vez el sitio esté desplegado — no Claude Code, no una sesión de chat. Claude Code prepara los
scripts y las plantillas; un humano los instala y los mantiene corriendo.

Ninguna de estas tareas está instalada todavía. Los comandos `npm run ...` que se mencionan aquí
se van creando a medida que avanza `docs/seo-work/MASTER_PLAN.md` (Sesiones 2, 11, 14, 16) — si
un comando de este documento todavía no existe en `package.json`, es una tarea futura, no un
error.

## 1. Catálogo (ya no requiere sincronización)

Hasta la migración a Astro Content Collections (ver `docs/seo-work/sessions/session-19.md`), el
catálogo vivía en un único `src/data/products.generated.json` **generado** por
`scripts/sync-public-catalog.ts`, y había que correr `npm run catalog:sync` después de tocar el
seed. Ese paso **ya no existe**: cada producto es su propio archivo fuente en
`src/content/products/<categoría>/<slug>.json` (validado por Zod en `src/content.config.ts`,
tipado por Astro), editado directamente a mano o desde Pages CMS (ver `docs/CONTENT_WORKFLOW.md`
§6). No hay build intermedio que pueda quedar desincronizado.

- **Validación de datos incompletos**: cubierta por `npm run seo:validate` (sección
  `product-incomplete` del reporte — nombre/imagen faltante son error, características vacías son
  aviso). No hace falta un `catalog:report` aparte.
- Si en el futuro se decide conectar una fuente externa en modo lectura (p. ej. la base de datos
  de `ASISTENTE`/SACC), sería un **importador** que escribe/actualiza los archivos de
  `src/content/products/`, no un paso de build — la decisión de no tener conexión en vivo sigue
  vigente por ahora (ver `docs/seo-work/DECISIONS.md`).

## 2. Validación SEO

- **Comando**: `npm run seo:validate` (se crea en Sesión 14)
- **Frecuencia sugerida**: en cada build y una vez al día en producción.
- Ver criterios completos en `tasks/seo-tasks.json` → `SEO-014`.

## 3. Actualización del sitio

- **Comando sugerido**: `npm run site:update` (aún no existe en `package.json`)
- **Debe ejecutar en orden**: `build` → `seo:validate`.
- Desplegar **solo si ambos pasos pasan**. Ya no hay un paso de sincronización de catálogo
  aparte (ver §1) — cualquier edición hecha a mano o desde Pages CMS ya está en
  `src/content/products/` antes de este comando.

## 4. IndexNow

- **Implementado en Sesión 11** (`SEO-011`). Dos scripts:
  - `scripts/indexnow-prepare-keyfile.mjs` — corre automáticamente antes de `astro build`
    (hook `prebuild` en `package.json`). Si existe la variable de entorno `INDEXNOW_KEY`, escribe
    `public/{key}.txt` (el archivo de verificación que IndexNow exige en la raíz del sitio) para
    que quede incluido en `dist/` al compilar. Si la variable no existe, no hace nada — el build
    sigue funcionando normal, IndexNow simplemente no está activo.
  - `scripts/indexnow-submit.mjs` (`npm run indexnow`) — se ejecuta **después** de un despliegue
    exitoso. Sin argumentos, envía todas las URLs de `dist/sitemap-0.xml`; con argumentos
    (`npm run indexnow -- https://alvaimportaciones.com/productos/muebles/nuevo-producto/`),
    envía solo esas URLs — usar esta forma en el día a día, no la del sitemap completo, salvo la
    primera activación.
- La clave (`INDEXNOW_KEY`) es un secreto: **nunca vive en el repo en texto plano**. Se configura
  como variable de entorno del hosting real (o un `.env` local, ya excluido por `.gitignore`).
  Ver `docs/seo-work/MANUAL_ACTIONS.md` #10 — falta que el usuario genere/obtenga la clave real
  y la configure en el entorno de producción; hasta entonces ambos scripts son no-ops seguros.

## 5. Revisión de enlaces

- **Comando**: `npm run links:check` (se crea en Sesión 14/15)
- **Frecuencia sugerida**: semanal.

## 6. Reporte de productos incompletos

Superado por `npm run seo:validate` (ver §1) — ya reporta productos sin nombre/imagen (error) o
sin características (aviso) en cada corrida, sin necesidad de un comando ni reporte aparte.

## Programación en el servidor

Se prefiere **systemd timer** sobre cron por sus logs (`journalctl`) y control de reintentos.
Plantillas conceptuales en `deploy/systemd/` (ver ese directorio) — **no instaladas**. Antes de
instalarlas en un servidor real hay que verificar:

- Ruta real del proyecto en ese servidor (las plantillas usan `/opt/alva-importaciones-web` como
  placeholder).
- Usuario del servicio (no usar `root`; las plantillas usan `www-data` como placeholder).
- Variables de entorno necesarias (`.env` fuera del repo, con permisos restringidos).
- Permisos de escritura sobre `src/content/`, `reports/` y logs.
- Política de reinicio (`Restart=on-failure` ya incluido en las plantillas, ajustar si hace
  falta).
- Cuál es el comando real de despliegue en ese hosting (varía según dónde se decida alojar el
  sitio — pendiente, ver `MANUAL_ACTIONS.md` #11).

Si el hosting no soporta systemd (por ejemplo, un proveedor gestionado tipo Vercel/Netlify o un
contenedor sin acceso a `systemctl`), estas tareas se implementan como *scheduled functions* o
cron del propio proveedor — la lógica de los scripts (`seo:validate`, `indexnow`, etc.) es la
misma, solo cambia quién los dispara.
