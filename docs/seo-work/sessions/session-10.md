# Sesión 10 — Guías para búsqueda y buscadores con IA

**Fecha:** 2026-08-08
**Fase:** 10
**Tarea:** SEO-010
**Rama:** `feature/alva-seo-ai-discovery`

## Objetivo

5 guías de compra/mantenimiento con contenido verificable, `Article`+`FAQPage` JSON-LD, autor
institucional y fecha real, enlazando productos y categorías reales.

## Trabajo realizado

1. `articleSchema()` en `structured-data.ts` (Article, autor y publisher = Alva Importaciones).
2. `src/components/GuideLayout.astro`: layout compartido (breadcrumbs, hero, slot, FAQ, CTA),
   con `datePublished` real (2026-08-08, fecha de esta sesión) y `Article`+`FAQPage`+`BreadcrumbList`.
3. 5 guías creadas, todas enlazando productos/categorías reales, sin inventar especificaciones
   que no estén ya en `products.generated.json`:
   - `/guias/como-elegir-silla-barberia/`
   - `/guias/como-equipar-salon-belleza/`
   - `/guias/que-camilla-estetica-comprar/`
   - `/guias/materiales-para-empezar-negocio-unas/`
   - `/guias/cuidados-muebles-salon-belleza/` (consejos de mantenimiento generales, sin
     afirmaciones específicas de un producto que no estén ya publicadas)
4. `/guias/index.astro`: página de listado, evita que las 5 guías queden huérfanas.

## Bug encontrado y corregido

`new Date("2026-08-08").toLocaleDateString(...)` sin `timeZone: "UTC"` mostraba "7 de agosto"
en vez de "8 de agosto" — `Date()` interpreta la fecha `YYYY-MM-DD` como medianoche UTC, y el
formateo sin zona explícita la convertía a la zona horaria local del entorno de build,
retrocediendo un día. Corregido añadiendo `timeZone: "UTC"` en `GuideLayout.astro`.

## Validaciones ejecutadas

- `npm run build` → ✅ 52 páginas (46 + 5 guías + índice de guías).
- Las 6 páginas nuevas: un solo `<h1>` cada una.
- JSON-LD verificado en una guía: `Organization`, `Article`, `FAQPage`, `BreadcrumbList`, todos
  válidos.
- Enlaces a producto/categoría verificados (incluye anclas `#camillas` etc. hacia
  `/productos/muebles`, ya generadas en SEO-006).
- Fecha de publicación verificada tras el fix: "8 de agosto de 2026" (coincide con `datePublished`).
- Revisado en navegador: `/guias` lista las 5 guías correctamente.

## Resultado

`SEO-010` completada. Evidencia en `tasks/evidence/SEO-010.log`.

## Siguiente tarea

`SEO-011` — Robots, sitemap, llms.txt e IndexNow.
