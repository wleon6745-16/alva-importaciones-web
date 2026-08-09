# Sesión 16 — Preparación de producción (cierre del plan)

**Fecha:** 2026-08-08
**Fase:** 16 (última)
**Tarea:** SEO-016
**Rama:** `feature/alva-seo-ai-discovery`

## Objetivo

Documentación de despliegue completa, checklist final de `MANUAL_ACTIONS.md`, verificar que no
hay secretos en el repo, y confirmar que las plantillas de systemd/cron siguen documentadas y
sin instalar.

## Trabajo realizado

1. **`docs/DEPLOYMENT.md`** (nuevo): guía de despliegue — requisitos de Node, variables de
   entorno (solo `INDEXNOW_KEY`, opcional, nunca secreta hoy porque no hay clave real todavía),
   dominio/HTTPS/redirecciones, proceso de build, cómo activar IndexNow cuando exista clave real,
   y un checklist previo al primer despliegue.
2. **Bug real encontrado y corregido**: `Dockerfile` usaba `node:20-alpine`, pero
   `package.json` → `engines` exige `>=22.12.0` (los scripts de `scripts/*.ts` necesitan el
   soporte nativo de TypeScript de Node, que no existe en Node 20). El build de `astro build` en
   sí no se rompía porque no ejecuta esos scripts, pero cualquier uso futuro de
   `catalog:sync`/`seo:validate`/`telegram:extract` dentro de un contenedor basado en esa imagen
   habría fallado. Corregido a `node:22-alpine`.
3. **`docs/seo-work/MANUAL_ACTIONS.md`**: nueva sección "Checklist final de lanzamiento" al
   principio del archivo, agrupando las acciones ya listadas (dominio, hosting/HTTPS, Search
   Console, Bing Webmaster Tools, Bing Places/Google Business Profile, IndexNow, analítica) en
   una lista de verificación clara y accionable, cada ítem referenciando dónde está el trabajo de
   código ya hecho (p. ej. las páginas `/locales/*` ya verificadas para las fichas de Bing
   Places/GBP) para que quien la ejecute no tenga que releer todo el histórico.
4. **Verificación de secretos**: `git ls-files` + búsqueda de patrones de credenciales
   (API keys, contraseñas, connection strings, claves privadas) sobre todo el repo trackeado —
   cero coincidencias reales. Las únicas menciones a `sacc_user`/`assistant_sacc` son prosa de
   documentación sobre un comando `docker exec ... psql` local (sin contraseña incluida), no
   credenciales.
5. **Plantillas systemd**: confirmadas sin instalar, con las rutas/usuario todavía como
   placeholders (`/opt/alva-importaciones-web`, `www-data`) — tal como exige el criterio de
   aceptación.

## Validaciones ejecutadas

- `npm run build` → ✅ 77 páginas.
- `npm run seo:validate` → ✅ 0 errores.
- Verificación de secretos sobre el repo completo → 0 encontrados.
- Confirmado que `deploy/systemd/*.service`/`*.timer` siguen marcados como "PLANTILLA — no
  instalada" y no fueron ejecutados ni instalados en esta sesión.

## Resultado

`SEO-016` completada. Evidencia en `tasks/evidence/SEO-016.log`. **Las 16 fases del
`MASTER_PLAN.md` están completas.**

## Qué queda (fuera del alcance de código, ver `MANUAL_ACTIONS.md`)

Todo lo que falta para que el sitio esté realmente en línea y descubierto por buscadores es
configuración de cuentas externas del negocio (dominio, hosting/HTTPS, Search Console, Bing
Webmaster Tools, Bing Places/Google Business Profile, clave real de IndexNow, proveedor de
analítica) — nada de eso puede completarlo una sesión de Claude Code. Ver el checklist final en
`docs/seo-work/MANUAL_ACTIONS.md` y la guía completa en `docs/DEPLOYMENT.md`.

## Siguiente tarea

Ninguna — `npm run task:next` no devuelve tareas pendientes. Si se abre una fase 17+ en el
futuro (p. ej. curar más productos de uñas/capilares/maquillaje, o resolver los conflictos de
`DATA_CONFLICTS.md`), debe registrarse como una tarea nueva en `tasks/seo-tasks.json` siguiendo
el mismo formato.
