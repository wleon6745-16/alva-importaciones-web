# Sesión 06 — Categorías y enlaces internos

**Fecha:** 2026-08-08
**Fase:** 6
**Tarea:** SEO-006
**Rama:** `feature/alva-seo-ai-discovery`

## Objetivo

Mejorar la página de categoría de muebles (navegación por subcategoría, FAQ) y añadir enlazado
interno entre las 4 categorías de producto (muebles, uñas, capilares, maquillaje).

## Decisión: FAQ sin reclamos de política comercial

`MANUAL_ACTIONS.md` #5 marca las políticas de garantía/cambios como pendientes de confirmar
("pueden haber cambiado" desde 2025) y bloqueando explícitamente a la Sesión 9, no a esta. Por
eso el FAQ de `/productos/muebles` evita cualquier afirmación sobre garantía, envíos o formas de
pago — solo cubre hechos ya verificables (qué subcategorías existen, cómo se consulta precio,
que se puede visitar el local, que el catálogo no es exhaustivo).

## Trabajo realizado

1. `src/components/RelatedCategories.astro`: componente nuevo, lista de enlaces a las otras 3
   categorías (excluye la actual). Añadido a `muebles.astro`, `unas.astro`, `capilares.astro` y
   `maquillaje.astro` — antes estas 3 últimas no enlazaban a ninguna otra categoría más que vía
   el menú superior.
2. `src/lib/structured-data.ts`: nueva función `faqSchema()` (JSON-LD `FAQPage`).
3. `src/pages/productos/muebles.astro`:
   - Nav de subcategorías (ancla `#camillas`, `#sillones-y-sillas-de-peluqueria-barberia`, etc.)
     justo debajo del hero; cada sección de subcategoría ahora tiene `id` + `scroll-mt-24` para
     que el anchor no quede tapado por el header sticky.
   - Sección de FAQ visible (4 preguntas, contenido verificable, sin reclamos de política) +
     `FAQPage` JSON-LD.
   - `RelatedCategories` al final.
4. Filtros: no existen en el sitio todavía (no hay UI de filtrado), así que el criterio "filtros
   no indexables" no aplica — documentado aquí para que no se repita la pregunta.
5. Paginación: con 25 productos en una sola categoría, no se justifica paginar todavía — revisar
   si el volumen crece sustancialmente (p. ej. tras SEO-012).

## Validaciones ejecutadas

- `npm run build` → ✅ 37 páginas, sin errores.
- Verificado en el HTML generado: 5 anclas de navegación + 5 `id` de sección coincidentes, 4
  entidades en el `FAQPage` JSON-LD, enlaces cruzados presentes en `/productos/unas` hacia las
  otras 3 categorías.
- Revisado en navegador: FAQ y "Otras categorías" visibles y con el conteo esperado de elementos.

## Resultado

`SEO-006` completada. Evidencia en `tasks/evidence/SEO-006.log`.

## Siguiente tarea

`SEO-007` — Sucursales y SEO local.
