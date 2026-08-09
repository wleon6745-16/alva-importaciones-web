# Sesión 13 — Imágenes, rendimiento y accesibilidad

**Fecha:** 2026-08-08
**Fase:** 13
**Tarea:** SEO-013
**Rama:** `feature/alva-seo-ai-discovery`

## Objetivo

Auditar y corregir imágenes (WebP, srcset, lazy/eager), LCP/CLS, menú móvil, contraste, foco
visible, jerarquía de encabezados y textos alternativos en todo el sitio (77 páginas).

## Hallazgos y correcciones

1. **Jerarquía de encabezados** (bug real, encontrado con un script que recorre `dist/` buscando
   saltos de nivel dentro de `<main>`): 6 páginas saltaban de `<h1>` a `<h3>` sin `<h2>` en medio
   — el patrón `ProductGrid`/`CategoryCard` renderiza `<h3>` por tarjeta, y varias páginas
   (4 landings comerciales de SEO-008, 1 guía de SEO-010, `/productos`) no tenían un `<h2>` de
   sección antes de esa grilla. Corregido añadiendo el `<h2>` correspondiente en cada caso
   (`/productos` usa uno visualmente oculto con `sr-only` ya que el diseño no pedía un título
   visible ahí). Verificado: 0 saltos en las 77 páginas tras el fix.
2. **LCP**: la imagen principal de cada página de producto (`productos/muebles/[slug].astro` y
   `productos/[category]/[slug].astro`) y la imagen del hero de la home ahora usan
   `loading="eager"` + `fetchpriority="high"` (antes usaban el `loading="lazy"` por defecto de
   `astro:assets`, penalizando el elemento más grande above-the-fold). Las imágenes de
   "relacionados" y las de las grillas de categoría se mantienen `lazy` (comportamiento por
   defecto), correcto para contenido fuera del viewport inicial.
3. **srcset**: se añadió `densities={[1, 1.5, 2]}` a esas mismas imágenes principales — verificado
   en el HTML generado que ahora emiten `srcset` con 3 variantes.
4. **CLS**: ya estaba cubierto en sesiones anteriores — todas las imágenes usan `astro:assets`
   con `width`/`height` explícitos (verificado, no hay ninguna sin dimensiones).
5. **Alt text**: verificado con un script sobre las 76 páginas HTML generadas (excluyendo 404)
   que **ningún** `<img>` carece de atributo `alt` — 0 encontrados. Las imágenes decorativas
   (iconos de marca junto a texto "ALVA") usan `alt=""` correctamente; las de producto usan el
   nombre real del producto.
6. **Menú móvil**: usa `<details>/<summary>` nativo con `aria-label="Abrir menú"` — accesible por
   teclado y lectores de pantalla por defecto (sin JS custom). Probado en navegador (viewport
   375×812): el clic en el summary alterna `open` correctamente y el `<nav>` se vuelve visible.
7. **Contraste**: auditados a mano los pares de color más usados del sistema de diseño
   (`--color-primary-800`/`--color-primary-700` sobre blanco/crema, texto `--color-ink-muted`
   sobre fondos claros) — todos superan 4.5:1 (AA para texto normal). El par más ajustado es
   `primary-700` sobre blanco en texto `text-sm font-semibold` (~4.61:1), que pasa AA pero queda
   cerca del límite — documentado aquí por si una futura sesión de refresco de marca lo revisa.
8. **Foco visible**: no hay ningún reset global de `outline` en `global.css` ni en el preflight de
   Tailwind v4 — el anillo de foco por defecto del navegador sigue activo en todos los enlaces;
   `WhatsAppCTA` además define un `focus-visible:outline` explícito.
9. **Área táctil**: el CTA compacto de las tarjetas de producto (`!px-4 !py-2 text-sm`) mide
   ~36px de alto, por encima del mínimo AA de 24px (WCAG 2.5.8); el CTA principal mide 48px.

## Validaciones ejecutadas

- `npm run build` → ✅ 77 páginas.
- Script de jerarquía de encabezados sobre las 77 páginas: 0 saltos tras el fix.
- Script de `alt` sobre 76 páginas (sin 404): 0 imágenes sin `alt`.
- Verificado en el HTML generado que las imágenes principales de producto y la de la home tienen
  `srcset` (3 densidades) + `loading="eager"` + `fetchpriority="high"`.
- Probado en navegador (viewport móvil) que el menú hamburguesa abre/cierra correctamente.

## Resultado

`SEO-013` completada. Evidencia en `tasks/evidence/SEO-013.log`.

## Siguiente tarea

`SEO-014` — Validador SEO automático.
