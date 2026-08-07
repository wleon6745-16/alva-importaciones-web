# Próxima sesión

## 1. Qué leer primero

1. `docs/seo-work/CURRENT_STATE.md`
2. Este archivo completo
3. La tarea `SEO-002` en `tasks/seo-tasks.json`
4. `docs/seo-work/DATA_CONFLICTS.md` (para no repetir los conflictos ya detectados)

## 2. Qué tarea ejecutar

**SEO-002 — Fuente central del catálogo (sanitizada)**, Fase 2.

Antes de tocar código: `npm run task:start -- SEO-002`.

Objetivo: crear una fuente pública y segura de productos para Astro, reutilizando lo que ya
existe (el catálogo de muebles ya cargado a mano en `src/pages/productos/muebles.astro`) más lo
que se pueda extraer de `ASISTENTE` (backend/SACC) sin exponer datos privados.

## 3. Qué archivos revisar

- `src/pages/productos/muebles.astro` — fuente de verdad actual de los 25 productos de muebles
  (hoy hardcodeados en el `.astro`, hay que extraerlos a datos).
- `src/lib/site-config.ts` — patrón ya usado para datos centrales del sitio.
- `C:\Users\wleon\Proyectos\ASISTENTE\backend\src\modules\commerce\catalog\` — módulo de catálogo
  del asistente (leer, no modificar), para entender qué campos existen realmente en SACC/local
  antes de diseñar el tipo `Product`.
- `C:\Users\wleon\Proyectos\ASISTENTE\backend\src\database\` — buscar el schema de productos
  (nombre de tabla, columnas) para saber qué es seguro exponer.

## 4. Qué resultado se espera

- `src/types/product.ts` con un tipo `Product` tipado (sin campos de costo/margen/cliente).
- `src/data/products.generated.json` con al menos los 25 productos de muebles ya migrados desde
  `muebles.astro` a datos (el `.astro` pasa a leer de este JSON, no a hardcodear arrays).
- `scripts/sync-public-catalog.ts` — script que, dado un origen de datos (por ahora puede ser el
  propio `muebles.astro` actual como "seed" manual, documentado como tal), genera el JSON
  sanitizado. No hace falta conexión en vivo a SACC todavía si no es viable en esta sesión —
  documentar la limitación en `DATA_CONFLICTS.md` o en el propio script si se toma ese atajo.
- IDs y slugs únicos y estables (el slug debe sobrevivir a cambios de precio/nombre menores).
- `npm run build` sigue pasando y `/productos/muebles` se ve igual que antes (mismo contenido,
  ahora servido desde datos en vez de hardcode).

## 5. Qué comandos ejecutar

```bash
cd "C:\Users\wleon\Proyectos\alva-importaciones-web"
git status
npm run task:status
npm run task:start -- SEO-002
# ... trabajo ...
npm run build
npm run task:validate
npm run task:complete -- SEO-002
```

## 6. Qué NO debe modificarse todavía

- No tocar `ASISTENTE/backend` (solo lectura).
- No crear páginas individuales de producto (`/productos/muebles/[slug]/`) — eso es SEO-003, la
  siguiente tarea, depende de que SEO-002 exista primero.
- No añadir Schema.org / JSON-LD de producto todavía — eso es SEO-005.
- No cambiar la paleta, el logo, ni el foco en Muebles (decisiones ya tomadas, ver
  `DECISIONS.md`).
- No resolver los conflictos de `DATA_CONFLICTS.md` inventando un valor — solo registrar si
  aparecen nuevos.

## 7. Qué hacer si la tarea falla

1. No marcar `SEO-002` como `completed`.
2. Ejecutar `npm run task:fail -- SEO-002` y escribir la razón cuando el script la pida (o
   editar `tasks/seo-tasks.json` a mano si el script no cubre el caso).
3. Documentar en `docs/seo-work/CURRENT_STATE.md` → "Errores conocidos" exactamente qué falló,
   con el comando y el error.
4. Dejar el `git status` limpio (commitear lo estable, descartar/guardar en stash lo que no lo
   esté, nunca dejarlo mezclado sin explicación).
5. Reescribir este archivo (`NEXT_SESSION.md`) con instrucciones para retomar `SEO-002` desde el
   punto exacto donde falló (no desde cero).
