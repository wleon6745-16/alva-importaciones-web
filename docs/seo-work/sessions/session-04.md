# Sesión 04 — WhatsApp contextual y conversiones

**Fecha:** 2026-08-08
**Fase:** 4
**Tarea:** SEO-004
**Rama:** `feature/alva-seo-ai-discovery`

## Objetivo

Enriquecer los CTA de WhatsApp con contexto (nombre, código, URL de la página) y añadir un
evento de analítica `whatsapp_click` disparado en cada clic.

## Decisión: sin proveedor de analítica instalado

Se verificó (búsqueda exhaustiva) que el repo no tiene GA4/GTM/Plausible/etc. Instalar uno real
requiere credenciales del cliente (fuera de alcance de esta tarea, es de `MANUAL_ACTIONS.md`).
En su lugar, `WhatsAppCTA.astro` ahora empuja a `window.dataLayer` (patrón estándar GTM/GA4) en
cada clic — compatible con cualquier proveedor que se instale después, sin tener que tocar este
código.

## Trabajo realizado

1. `src/components/WhatsAppCTA.astro`: nuevas props opcionales `productId`, `productName`,
   `category`, `branch` (inferido automáticamente por `number` si no se pasa explícito). Añade
   atributos `data-*` al `<a>` y un `<script>` que escucha el clic y hace
   `window.dataLayer.push({ event: "whatsapp_click", product_id, product_name, category,
   page_path, branch })`. Sin datos personales — solo datos del producto/página, públicos.
2. `src/pages/productos/muebles/[slug].astro`: el mensaje de WhatsApp del CTA principal ahora
   incluye la URL absoluta de la página (además de nombre y código, que ya tenía); se pasan
   `productId`/`productName`/`category` al componente.
3. `src/pages/productos/muebles.astro`: mismo tratamiento en el CTA de cada tarjeta del listado.

## Validaciones ejecutadas

- `npm run build` → ✅ 37 páginas, sin errores.
- Verificado en el HTML generado que la URL de WhatsApp está correctamente codificada
  (`encodeURIComponent` vía `whatsappLink()`, ya existente) y que los atributos `data-*` se
  renderizan solo cuando hay datos de producto (el CTA genérico del header no lleva
  `product_id`/`product_name`).
- Probado en navegador con viewport móvil (375×812): CTA de producto mide 48px de alto (por
  encima del mínimo recomendado de 44px), clic simulado confirma que `window.dataLayer` recibe
  el evento `whatsapp_click` con los 5 campos esperados y sin datos personales.

## Resultado

`SEO-004` completada. Evidencia en `tasks/evidence/SEO-004.log`.

## Siguiente tarea

`SEO-005` — Metadatos y Schema de productos. Instrucciones completas reescritas en
`docs/seo-work/NEXT_SESSION.md`.
