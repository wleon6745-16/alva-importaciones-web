# Analítica — cómo funciona

Guía operativa de la capa de analítica del sitio. Fase SEO-Analytics, 2026-08-16. Pensada para
que otro desarrollador (o tú mismo en 6 meses) entienda el sistema sin releer el código.

## 1. Cómo funciona GA4 aquí

El sitio **no traía ningún proveedor de analítica instalado** antes de esta fase (se verificó
con `grep` de `gtag`/`googletagmanager`/`GTM-`/`dataLayer` en todo `src/` — el único hallazgo
fue el `dataLayer.push` genérico que ya traía `WhatsAppCTA.astro` desde SEO-004, preparado para
cuando hubiera un proveedor real).

- `src/components/Analytics.astro` se incluye una sola vez, desde `src/layouts/BaseLayout.astro`
  (que envuelve literalmente todas las páginas del sitio).
- Lee `import.meta.env.PUBLIC_GA_MEASUREMENT_ID` en build time.
  - **Si no está definida**: no se renderiza ningún `<script>` de `gtag.js`. El sitio funciona
    exactamente igual — solo que nada de lo que se trackea llega a ningún lado.
  - **Si está definida**: carga `gtag.js` y llama `gtag('config', ID)`, el patrón oficial de
    Google.
- El mismo componente llama `initClickTracking()` e `initViewTracking()` (de
  `src/lib/analytics.ts`) una sola vez, sitewide.

**No se instaló GTM.** Con GA4 + `trackEvent()` cubriendo los eventos definidos, GTM no aporta
nada hoy — solo sumaría una capa de indirección y otro punto de fallo. Si en el futuro hace
falta cargar píxeles de Ads/Meta/etc. de forma dinámica sin nuevos despliegues, ahí sí GTM
empieza a justificarse; hasta entonces, no.

## 2. Variable requerida

```env
PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

- Ver `.env.example` en la raíz del repo.
- **Nunca hardcodear un ID real en el código** — va como variable de entorno del hosting
  (Cloudflare Workers: pestaña *Ajustes → Variables y secretos* del proyecto en el dashboard).
- El prefijo `PUBLIC_` es obligatorio: es la convención de Astro para exponer una variable al
  navegador (sin ese prefijo, `import.meta.env` no la expone fuera del build server-side).

## 3. La capa central: `src/lib/analytics.ts`

Todo pasa por `trackEvent(eventName, params)`. Ninguna llamada a `gtag()` o
`dataLayer.push()` suelta en componentes — así se evita justo lo que se pidió evitar: docenas de
`gtag()` dispersos sin abstracción.

```ts
trackEvent("click_whatsapp", { source: "product", product_code: "8833" });
```

- Si `window` no existe (SSR) o algo falla, `trackEvent` no lanza — un error de analítica nunca
  debe romper la página.
- Internamente hace `window.dataLayer.push({ event: eventName, ...params })`. Si `gtag.js` está
  cargado (ver §1), GA4 procesa ese push. Si no, el array simplemente crece sin que nadie lo lea.

### Dos mecanismos para no repetir código en cada componente

1. **`initClickTracking()`** — un solo listener de `click` a nivel de `document` (delegación).
   Cualquier elemento con `data-track-event="nombre_evento"` dispara `trackEvent()`
   automáticamente al hacer clic; el resto de sus atributos `data-track-*` se convierten en
   parámetros (`data-track-product-code="8833"` → `product_code: "8833"`). Se pueden disparar
   varios eventos del mismo clic separando los nombres por espacio:
   `data-track-event="click_whatsapp click_course_contact"`.

2. **`initViewTracking()`** — igual, pero para impresiones (`view_*`). Usa
   `IntersectionObserver` con umbral 50% y se desconecta del elemento apenas dispara una vez, así
   que no hay falsos positivos por elementos renderizados fuera de pantalla. Atributo:
   `data-track-view-event="view_promotion"` + `data-track-view-*` para parámetros.

Para agregar tracking a un botón/enlace nuevo: **no escribas JS**, solo agrega los atributos
`data-track-*` en el markup del componente `.astro`.

## 4. Eventos implementados

| Evento | Dónde dispara | Parámetros principales | Mecanismo |
| --- | --- | --- | --- |
| `click_whatsapp` | Cualquier `WhatsAppCTA` (header, hero, producto, categoría, guía, curso, contacto, local, 404, home) | `source`, `page_type`, `cta_location`, `product_code`, `product_name`, `category`, `branch` | Delegación de clic |
| `click_course_contact` | El botón de WhatsApp de `/cursos` (se dispara **junto con** `click_whatsapp source=course`, no en su lugar) | los mismos que `click_whatsapp` en ese botón | Delegación de clic |
| `click_maps` | Enlaces "Ver en Google Maps" (`LocationsMap`, `/locales`, `/locales/[branch]`) | `source`, `branch` | Delegación de clic |
| `click_social` | Instagram (Footer, PromoShowcase) y canal de WhatsApp (PromoShowcase) | `platform`, `source` | Delegación de clic |
| `view_product` | Carga de una página de detalle de producto (`productos/muebles/[slug]` y `productos/[category]/[slug]`), vía `ViewProductTracker.astro` | `product_code`, `product_name`, `category`, `brand` | Dispara una vez al cargar la página (no por hidratación/render de grilla) |
| `view_promotion` | Cada tarjeta de `PromoShowcase` (home) | `promotion_label` | `IntersectionObserver`, dispara una vez por tarjeta |

**No implementado — y por qué:**

- **`click_phone`**: el mecanismo genérico ya lo soporta (`data-track-event="click_phone"`), pero
  hoy no existe ningún enlace `tel:` en el sitio — no hay teléfono fijo confirmado
  (`docs/seo-work/MANUAL_ACTIONS.md` #4, sigue pendiente). Nada que trackear todavía.
- **`click_promotion`**: las tarjetas de `PromoShowcase` son de solo lectura (`<div>`, no
  `<a>` — son promociones ya pasadas, mostradas como muestra, no ofertas activas navegables). No
  hay nada que "clickear" hacia una promoción específica; forzar un evento ahí habría sido un
  evento falso.

### Nota sobre `product_code`

En `click_whatsapp`/`click_course_contact`, `product_code` es el **id interno** del producto
(`categoría-slug`, ej. `muebles-camilla-hidraulica-multiusos`) — es el valor que ya usaban los
componentes antes de esta fase (`productId={item.id}`), mantenido así por consistencia entre
todas las páginas (grillas y detalle). En `view_product`, en cambio, sí se usa el **código real
del negocio** cuando existe (`product.code`, ej. `"8833"`, con el id interno como respaldo si no
hay código) porque ahí no hay ningún patrón previo que romper. Si en algún momento se quiere
unificar, hay que decidirlo y tocar todos los `WhatsAppCTA` a la vez — no hacerlo a medias.

## 5. Lead vs. venta (decisión tomada)

Un clic en WhatsApp es **intención de contacto (lead)**, no una venta confirmada — el negocio no
vende en línea, no hay carrito ni checkout, así que no existe forma de confirmar una venta desde
el sitio.

**Decisión**: se mantiene `click_whatsapp` (y `click_course_contact`) como el evento, en vez de
renombrarlo a `generate_lead`. Motivo: `click_whatsapp` ya lleva parámetros ricos (`source`,
`product_code`, `category`, etc.) que se perderían o habría que duplicar si se usara solo el
nombre genérico recomendado de GA4. El paso pendiente (acción manual, dashboard de GA4, no
código) es marcar `click_whatsapp` como **evento clave** ("key event", antes "conversión") una
vez exista la propiedad de GA4 — ver checklist en la sección K del reporte final de esta fase.

**Nunca se cuenta `click_whatsapp` como venta.** Es un proxy de intención, útil para comparar qué
páginas/fuentes generan más contactos, no para calcular ingresos.

## 6. Cómo probar los eventos

Sin necesidad de GA4 real:

1. Abre el sitio en el navegador, abre la consola de DevTools.
2. `window.dataLayer = []` para limpiar.
3. Haz clic en un CTA de WhatsApp, o baja hasta la sección de promociones en la home.
4. `console.log(window.dataLayer)` — debe aparecer un objeto `{event: "...", ...params}` por
   cada acción.

Con GA4 real configurado, además: **DebugView** en el panel de GA4 (Configurar → DebugView) con
la extensión de Chrome "Google Analytics Debugger" activada, o agregando `?debug_mode=true` al
final de una URL del sitio.

## 7. Cómo evitar eventos duplicados

- `view_product` está en un componente dedicado (`ViewProductTracker.astro`) que se importa una
  sola vez por página de detalle — no vive dentro de un componente que se repita por cada
  producto de una grilla.
- `view_promotion` usa `IntersectionObserver` con `unobserve()` inmediato tras el primer disparo
  — no puede duplicarse aunque el usuario haga scroll hacia arriba y abajo repetidas veces.
- `initClickTracking()`/`initViewTracking()` se llaman **una sola vez**, desde `Analytics.astro`,
  no desde cada componente — si algún día se agrega un nuevo tipo de CTA, no hay que volver a
  llamar `initClickTracking()`, solo agregar los atributos `data-track-*` en el markup.
- Si en el futuro se agrega GTM, **no cargar GA4 directo a la vez** (duplicaría cada evento) —
  ver la nota en `SEO_ANALYTICS_BASELINE.md`.
