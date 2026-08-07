# MASTER PLAN — SEO, catálogo e integración de la web de Alva Importaciones

## Objetivo general

Convertir `alva-importaciones-web` en un sitio indexable, rápido y confiable que:

1. Muestre el catálogo real de Alva Importaciones (muebles de salón, uñas, capilares, maquillaje) con datos sanitizados provenientes del asistente/SACC y de Telegram.
2. Sea descubrible por buscadores tradicionales (Google, Bing) y por motores/asistentes de IA (SearchBots, LLMs vía `llms.txt`).
3. Convierta visitas en consultas de WhatsApp identificables, sin publicar información privada, de clientes o de márgenes.
4. Se pueda desplegar y mantener con tareas programadas simples (sync de catálogo, validación SEO, IndexNow).

El trabajo se ejecuta en sesiones acotadas (el uso de Claude Code se restablece cada ~5 horas). Cada sesión debe poder reanudarse leyendo únicamente `docs/seo-work/CURRENT_STATE.md`, `docs/seo-work/NEXT_SESSION.md` y `tasks/seo-tasks.json` — nunca reconstruyendo contexto desde el historial de conversación.

## Alcance de repositorios

- **`alva-importaciones-web`** (este repo): sitio Astro público. Aquí vive todo el sistema de control (`docs/seo-work/`, `tasks/`) y el código del sitio.
- **`ASISTENTE`** (repo hermano, `C:\Users\wleon\Proyectos\ASISTENTE`): backend/SACC/base de datos del asistente de WhatsApp. Se consulta como **fuente de datos de solo lectura** para el catálogo (Sesión 2 en adelante). Nunca se escribe en ese repo desde este plan salvo que una tarea lo indique explícitamente.
- **Export de Telegram** (`C:\Users\wleon\Downloads\...\ChatExport_2026-08-06\`): fuente adicional de catálogo/fotos, ya usada parcialmente para muebles. Se sigue tratando como fuente no oficial que requiere contraste (ver `DATA_CONFLICTS.md`).

## Fases del proyecto (orden obligatorio)

| Fase | Sesiones | Tema |
|---|---|---|
| 1 | 1 | Sistema de planificación y punto de restauración |
| 2 | 2 | Fuente central del catálogo (sanitizada) |
| 3 | 3 | Slugs y páginas individuales de muebles |
| 4 | 4 | WhatsApp contextual y conversiones |
| 5 | 5 | Metadatos y Schema de productos |
| 6 | 6 | Categorías y enlaces internos |
| 7 | 7 | Sucursales y SEO local |
| 8 | 8 | Páginas comerciales locales |
| 9 | 9 | Información comercial de Telegram (validada) |
| 10 | 10 | Guías para búsqueda y buscadores con IA |
| 11 | 11 | Robots, sitemap, llms.txt e IndexNow |
| 12 | 12 | Uñas, maquillaje y capilares (páginas individuales) |
| 13 | 13 | Imágenes, rendimiento y accesibilidad |
| 14 | 14 | Validador SEO automático |
| 15 | 15 | Pruebas integrales y estabilización |
| 16 | 16 | Preparación de producción |

Las fases son secuenciales por dependencia de datos: no tiene sentido crear páginas de producto (3) antes de tener el catálogo sanitizado (2), ni Schema (5) antes de tener páginas (3), ni landing comerciales (8) antes de tener categorías (6) y SEO local (7).

## Dependencias clave

- Sesión 2 depende de: acceso de lectura a `ASISTENTE` (catálogo/SACC) y al export de Telegram.
- Sesiones 3–6 dependen de Sesión 2 (el JSON sanitizado del catálogo).
- Sesión 7 depende de direcciones/teléfonos confirmados (ver `MANUAL_ACTIONS.md` — puede empezar con los datos ya extraídos de Telegram, marcados como "no verificados" hasta confirmación).
- Sesión 8 depende de Sesiones 2, 6 y 7.
- Sesión 9 es independiente pero alimenta contenido para 7, 8 y 10.
- Sesión 10 depende de 2 y 6.
- Sesión 11 depende de que existan páginas reales que listar (después de 3, 6, 8, 10).
- Sesión 12 reutiliza el patrón de Sesión 3.
- Sesión 14 (validador) depende de que existan las convenciones de Sesiones 5, 6, 11.
- Sesión 15 depende de todas las anteriores.
- Sesión 16 es el cierre.

## Criterios de finalización del proyecto

- `npm run build` pasa sin errores.
- `npm run seo:validate` pasa sin errores bloqueantes.
- Todas las páginas de producto tienen `h1`, meta description única, canonical absoluta y JSON-LD válido.
- El sitio tiene sitemap, robots.txt y `llms.txt` coherentes con las rutas reales.
- No hay costos, márgenes, datos de clientes ni credenciales en el código público.
- `docs/seo-work/MANUAL_ACTIONS.md` lista únicamente lo que de verdad requiere al humano (dominio, Search Console, etc.).

## Riesgos

- **Datos inventados**: no existe integración en vivo con SACC desde este repo todavía; el riesgo principal es "alucinar" precios/stock. Mitigación: Sesión 2 solo sanitiza datos ya confirmados (Telegram + lo cargado manualmente), nunca inventa.
- **Conflictos de datos entre fuentes** (ya se detectó al menos uno, ver `DATA_CONFLICTS.md`): mitigación es registrar, no resolver arbitrariamente.
- **Publicar información privada** (costos, márgenes, datos de clientes, credenciales SACC): mitigación son las validaciones explícitas en Sesión 2 y el validador de Sesión 14.
- **Trabajo perdido entre sesiones** por el reinicio de uso cada ~5h: mitigado por este mismo sistema de control.
- **Scope creep dentro de una sesión**: cada sesión debe cerrar con un bloque funcional, no dejar cambios a medias sin documentar.

## Reglas de seguridad

1. Nunca commitear `.env`, credenciales de SACC, tokens de WhatsApp/Telegram ni claves de API.
2. Nunca publicar costos (`costo`), márgenes, ni precios mayoristas si no estaban ya destinados a ser públicos.
3. Nunca publicar datos personales de clientes.
4. Cualquier dato tomado de Telegram debe pasar por el proceso de la Sesión 9 (candidato → contraste → confirmado) antes de usarse como fuente pública "oficial"; mientras tanto puede usarse marcado como "no verificado" si ya es públicamente visible en el canal (como ya se hizo con los muebles).
5. No usar `--force`, `git reset --hard` ni reescribir historial sin pedirlo explícitamente el usuario.
6. No desplegar a producción automáticamente; los comandos de despliegue son manuales o requieren aprobación (ver `MANUAL_ACTIONS.md`).

## Definición de "terminado" (por tarea)

Una tarea de `tasks/seo-tasks.json` solo puede marcarse `completed` cuando:

1. Todos sus `acceptanceCriteria` se cumplen verificablemente (no por suposición).
2. Sus `validationCommands` se ejecutaron y pasaron.
3. El build (`npm run build`) sigue pasando.
4. `CURRENT_STATE.md`, `NEXT_SESSION.md` y `SESSION_LOG.md` quedan actualizados.
5. Existe un commit con el mensaje sugerido (o uno equivalente) que contiene el trabajo de esa tarea.

Si algo de esto no se cumple, la tarea se marca `blocked`, `failed` o se deja `in_progress` con una nota exacta de qué falta — nunca `completed` por defecto.
