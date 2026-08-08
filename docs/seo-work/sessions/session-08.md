# Sesión 08 — Páginas comerciales locales

**Fecha:** 2026-08-08
**Fase:** 8
**Tarea:** SEO-008
**Rama:** `feature/alva-seo-ai-discovery`

## Objetivo

6 landing pages de intención de búsqueda local, cada una con contenido propio y enlazando
productos reales ya publicados.

## Trabajo realizado

1. `src/components/LocalLandingLayout.astro` + `src/components/ProductGrid.astro`: layout y
   grid reutilizables para las 6 páginas (hero con intro única, slot de contenido, CTA final).
2. Rutas creadas (todas en `src/pages/`, archivos literales — no una ruta dinámica, para evitar
   cualquier ambigüedad de enrutado con las páginas ya existentes):
   - `/muebles-para-salon-de-belleza-portoviejo/` — selección de 6 productos representando cada
     subcategoría, enlaza al catálogo completo.
   - `/sillas-de-barberia-portoviejo/` — los 9 sillones/sillas de la subcategoría (excluye el
     lavacabezas, que no es una silla).
   - `/camillas-esteticas-portoviejo/` — las 3 camillas.
   - `/productos-para-unas-portoviejo/` — enlaza a `/productos/unas` (insumos, sin ficha
     individual todavía — eso es SEO-012) + 3 muebles reales de manicura/pedicura.
   - `/equipamiento-para-peluquerias-manabi/` — lavacabezas, sillón lava cabeza, carrito
     auxiliar, tina spa.
   - `/cursos-de-unas-portoviejo/` — reencuadra los mismos datos reales del curso ya publicados
     en `/cursos` (6 meses, $60/mes, $10 matrícula) para la intención de búsqueda local, con
     enlace al detalle completo.
3. Cuidado explícito de no inventar política de envíos: un borrador inicial de
   `equipamiento-para-peluquerias-manabi` incluía "envíos desde Portoviejo" en la descripción —
   se quitó antes de terminar la tarea porque esa política no está verificada (`MANUAL_ACTIONS.md`
   #5). El texto final solo dice que se atienden consultas de Manabí por WhatsApp, que es cierto.

## Validaciones ejecutadas

- `npm run build` → ✅ 46 páginas (40 + 6 nuevas).
- Las 6 páginas: un solo `<h1>`, título y meta description únicos entre sí, canonical absoluta.
- Todos los enlaces a productos verificados contra los slugs reales generados en
  `dist/productos/muebles/*` — ninguno roto.
- Cero `aggregateRating`/`review` en las 6 páginas nuevas.
- Revisado en navegador: `/sillas-de-barberia-portoviejo` renderiza correctamente.

## Resultado

`SEO-008` completada. Evidencia en `tasks/evidence/SEO-008.log`.

## Siguiente tarea

`SEO-009` — Información comercial de Telegram (validada).
