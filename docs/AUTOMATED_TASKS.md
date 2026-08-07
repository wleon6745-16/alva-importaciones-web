# Tareas automatizadas (producción)

Este documento describe los procesos automáticos que debe correr el **servidor de producción**
una vez el sitio esté desplegado — no Claude Code, no una sesión de chat. Claude Code prepara los
scripts y las plantillas; un humano los instala y los mantiene corriendo.

Ninguna de estas tareas está instalada todavía. Los comandos `npm run ...` que se mencionan aquí
se van creando a medida que avanza `docs/seo-work/MASTER_PLAN.md` (Sesiones 2, 11, 14, 16) — si
un comando de este documento todavía no existe en `package.json`, es una tarea futura, no un
error.

## 1. Sincronización del catálogo

- **Comando**: `npm run catalog:sync` (se crea en Sesión 2/9)
- **Frecuencia sugerida**: cada 6 horas
- **Debe**:
  - Consultar la fuente autorizada (hoy: datos ya sanitizados en el repo; a futuro: `ASISTENTE`/SACC
    en modo lectura).
  - Sanitizar datos (sin costos, sin márgenes, sin datos de clientes, sin credenciales).
  - Validar el catálogo resultante (JSON válido, IDs/slugs únicos).
  - Si la validación falla, **conservar la última versión válida** y no sobrescribirla.
  - Registrar logs (éxito/fallo, cuántos productos, qué cambió).
  - No desplegar datos inválidos.

## 2. Validación SEO

- **Comando**: `npm run seo:validate` (se crea en Sesión 14)
- **Frecuencia sugerida**: en cada build y una vez al día en producción.
- Ver criterios completos en `tasks/seo-tasks.json` → `SEO-014`.

## 3. Actualización del sitio (si el catálogo es estático)

- **Comando sugerido**: `npm run site:update` (se crea cuando existan `catalog:sync` y
  `seo:validate`)
- **Debe ejecutar en orden**: `catalog:sync` → `catalog:validate` → `seo:validate` → `build`.
- Desplegar **solo si los cuatro pasos pasan**.

## 4. IndexNow

- **Comando**: `npm run indexnow` (se crea en Sesión 11)
- Se ejecuta **después** de una publicación exitosa.
- Envía únicamente las URLs modificadas en esa publicación, nunca el sitio completo salvo la
  primera vez.
- La clave de IndexNow es un secreto: vive en variables de entorno del hosting real, nunca en el
  repo en texto plano (ver `docs/seo-work/MANUAL_ACTIONS.md` #10).

## 5. Revisión de enlaces

- **Comando**: `npm run links:check` (se crea en Sesión 14/15)
- **Frecuencia sugerida**: semanal.

## 6. Reporte de productos incompletos

- **Comando**: `npm run catalog:report` (se crea en Sesión 2/9)
- **Frecuencia sugerida**: diaria, o después de cada `catalog:sync`.
- **Genera**: `reports/products-missing-data.md` con la lista de productos sin precio, sin
  imagen, sin código, etc.

## Programación en el servidor

Se prefiere **systemd timer** sobre cron por sus logs (`journalctl`) y control de reintentos.
Plantillas conceptuales en `deploy/systemd/` (ver ese directorio) — **no instaladas**. Antes de
instalarlas en un servidor real hay que verificar:

- Ruta real del proyecto en ese servidor (las plantillas usan `/opt/alva-importaciones-web` como
  placeholder).
- Usuario del servicio (no usar `root`; las plantillas usan `www-data` como placeholder).
- Variables de entorno necesarias (`.env` fuera del repo, con permisos restringidos).
- Permisos de escritura sobre `src/data/`, `reports/` y logs.
- Política de reinicio (`Restart=on-failure` ya incluido en las plantillas, ajustar si hace
  falta).
- Cuál es el comando real de despliegue en ese hosting (varía según dónde se decida alojar el
  sitio — pendiente, ver `MANUAL_ACTIONS.md` #11).

Si el hosting no soporta systemd (por ejemplo, un proveedor gestionado tipo Vercel/Netlify o un
contenedor sin acceso a `systemctl`), estas tareas se implementan como *scheduled functions* o
cron del propio proveedor — la lógica de los scripts (`catalog:sync`, `seo:validate`, etc.) es la
misma, solo cambia quién los dispara.
