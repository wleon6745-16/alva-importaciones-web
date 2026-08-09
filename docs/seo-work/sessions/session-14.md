# Sesión 14 — Validador SEO automático

**Fecha:** 2026-08-08
**Fase:** 14
**Tarea:** SEO-014
**Rama:** `feature/alva-seo-ai-discovery`

## Objetivo

`scripts/validate-seo.ts` + `npm run seo:validate`, que recorre `dist/` después del build y
detecta automáticamente los problemas que hasta ahora se venían chequeando a mano con scripts
sueltos en cada sesión.

## Trabajo realizado

`scripts/validate-seo.ts` recorre todas las páginas HTML de `dist/` (menos `404.html`) y
`src/data/products.generated.json`, y detecta:

- Títulos duplicados / faltantes.
- Meta descriptions duplicadas / faltantes.
- Canonical faltante o apuntando a `localhost`/`127.0.0.1`.
- Ausencia de `<h1>` o más de uno por página.
- `<img>` sin atributo `alt`.
- JSON-LD inválido (falla al hacer `JSON.parse`).
- Enlaces internos rotos (construye el conjunto de URLs reales y compara contra cada `href`
  interno encontrado).
- Páginas huérfanas (BFS de enlaces internos desde `/`; cualquier página no alcanzada se marca
  como aviso, no error).
- Slugs de producto duplicados dentro de la misma categoría.
- Productos con información insuficiente (sin nombre o sin imagen = error; sin características =
  aviso, porque puede ser válido si la fuente no traía más detalle — no se inventa).

## Bug encontrado y corregido

La primera corrida marcó **65 páginas como huérfanas**, incluyendo páginas que claramente sí
estaban enlazadas (productos individuales de muebles, por ejemplo). Causa: el grafo de enlaces
se guardaba con la URL *sin normalizar* (con `/` final) como clave, pero el BFS empujaba a la
cola URLs *normalizadas* (sin `/` final) — nunca encontraban su entrada en el grafo y el
recorrido se cortaba casi de inmediato. Corregido normalizando la clave al guardar en el mapa.

## Hallazgo real tras el fix: 12 páginas genuinamente huérfanas

Con el bug corregido, quedaron 12 huérfanas reales — nada las enlazaba desde el sitio principal:
las 5 guías + su índice (SEO-010) y 6 de las landing comerciales locales (SEO-008). Corregido:

- `Header.astro`/`Footer.astro`: nuevo enlace "Guías" en la navegación (global) → resuelve
  `/guias` y, transitivamente, las 5 guías.
- `productos/muebles.astro`: enlace contextual a `/camillas-esteticas-portoviejo`,
  `/sillas-de-barberia-portoviejo` y `/equipamiento-para-peluquerias-manabi` junto al título de
  la subcategoría correspondiente.
- `productos/unas.astro`: enlace a `/productos-para-unas-portoviejo`.
- `cursos.astro`: enlace a `/cursos-de-unas-portoviejo`.

Verificado: 0 páginas huérfanas tras estos cambios.

## Validaciones ejecutadas

- `npm run build && npm run seo:validate` → ✅ "Validación SEO OK" — 0 errores, 12 avisos (todos
  "sin características listadas", informativos, no bloqueantes, no se inventó nada para
  cerrarlos).
- Confirmado manualmente que el validador reporta 0 enlaces internos rotos, 0 huérfanas, 0
  duplicados, 0 JSON-LD inválido, 0 imágenes sin alt — coincide con las auditorías manuales de
  sesiones anteriores.

## Resultado

`SEO-014` completada. Evidencia en `tasks/evidence/SEO-014.log`.

## Siguiente tarea

`SEO-015` — Pruebas integrales y estabilización.
