# Línea base — SEO & Analytics

**Fecha de auditoría**: 2026-08-16
**Sitio auditado**: `https://alvaimportaciones.com` (producción real, no local)
**Objetivo**: punto cero para comparar resultados dentro de 30/60/90 días. Nada de lo aquí
registrado se actualiza retroactivamente — para ver el estado actual, repetir la auditoría, no
editar este archivo (crear uno nuevo o una sección de seguimiento aparte).

## Estado del sitio al momento de la auditoría

- Hosting: Cloudflare Workers (static assets), dominio conectado con HTTPS, deploy automático
  push→build→live desde `feature/alva-seo-ai-discovery` (ver `docs/DEPLOYMENT.md`).
- 101 páginas generadas (`npm run build`), 100 URLs en el sitemap (excluye `/404`, correcto).
- CMS (`/admin`, Decap + DecapBridge) operativo en producción desde el 2026-08-16 (fase
  anterior a esta).
- Sin GA4/GTM instalado antes de esta fase. Sin Search Console ni Bing Webmaster configurados.

## Páginas principales auditadas

Home, `/productos/muebles/camilla-hidraulica-multiusos/` (detalle de producto),
`/guias/como-elegir-silla-barberia/`, `/guias/` (índice), `/cursos/`, `/locales/matriz/`,
`/locales/sucursal/`, `/contacto/`, `/robots.txt`, `/sitemap-index.xml`, `/sitemap-0.xml`,
`/llms.txt`, `/404` (ruta inexistente), `/` sobre `http://`, `www.alvaimportaciones.com` sobre
`http://` y `https://`.

## Sitemap

- `sitemap-index.xml` → `sitemap-0.xml`, ambos HTTP 200, XML válido.
- 100 URLs, todas `https://alvaimportaciones.com/...`, sin duplicados, sin `localhost`/`ngrok`,
  sin `/admin`. Incluye las 5 guías, cursos, 79 páginas de producto, páginas comerciales locales.

## Robots.txt

Permite Googlebot, Bingbot, y los bots de IA ya decididos en SEO-011 (GPTBot, ClaudeBot,
PerplexityBot, OAI-SearchBot, ChatGPT-User, Perplexity-User, anthropic-ai, Google-Extended).
Bloquea `/admin/`. Referencia el sitemap. Sin cambios en esta fase — ya estaba correcto.

## llms.txt

Accesible, sin datos inventados ni URLs de desarrollo. Sin cambios en esta fase.

## Schema.org (JSON-LD)

Verificado directamente sobre HTML de producción (no solo el código fuente):

| Página | Tipos presentes | Notas |
| --- | --- | --- |
| Home | `Organization` | `sameAs` solo Instagram (real, no inventado) |
| Producto | `Product`, `Offer`, `Brand`, `Organization` (seller), `BreadcrumbList` | `sku` = código real del negocio (ej. `8833`), moneda `USD`, sin `availability` (deliberado — no hay stock en tiempo real, no se inventó) |
| Guía | `Article`, `FAQPage`, `Question`/`Answer`, `BreadcrumbList` | |
| Curso | `Course`, `BreadcrumbList` | |
| `/locales/matriz`, `/locales/sucursal` | `LocalBusiness` | NAP verificado — ver siguiente sección |

## SEO local — NAP

| Campo | Matriz | Sucursal |
| --- | --- | --- |
| Dirección | Calle Quito, entre Av. Manabí y García Moreno, Portoviejo | Calle 9 de Octubre, entre Ricaurte y Olmedo, Portoviejo |
| Teléfono/WhatsApp (schema) | `+593959298275` | `+593963976590` |
| Horario | Lun-Sáb 9:00-18:00, Dom 9:00-13:00 (igual en ambos) | |

Ambos números fueron **corregidos en esta misma sesión** (confirmados directo por el usuario,
2026-08-16) — antes el de Matriz estaba mal (`593999526807`) y el de Sucursal tenía un dígito
distinto al visto en el canal de Telegram oficial (resolvía `DATA_CONFLICT-001`). El schema los
toma en vivo de `src/lib/site-config.ts`, así que quedaron consistentes automáticamente en
schema + WhatsApp CTAs + páginas de texto visible, sin tener que tocar cada uno por separado.

## Open Graph / Twitter

Presentes en todas las páginas verificadas (`og:title`, `og:description`, `og:image`, `og:url`,
`og:type`, `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`). La imagen
de producto usa la foto real del producto (`og:image` específico); guías y curso usan
`/og-image.jpg` genérico (existe, HTTP 200) — no hay imágenes rotas ni inventadas.

## Analítica

- **GA4 no existía antes de esta fase.** Verificado con búsqueda de `gtag`/`googletagmanager`/
  `GTM-` en todo el código fuente — cero resultados salvo el `dataLayer.push` genérico ya
  preparado en `WhatsAppCTA.astro` desde SEO-004.
- Implementación nueva: `src/lib/analytics.ts` + `src/components/Analytics.astro`, gateada por
  `PUBLIC_GA_MEASUREMENT_ID` (sin esa variable, no carga nada — verificado). Ver
  `docs/ANALYTICS.md` para el detalle completo y la tabla de eventos.
- 7 eventos implementados y probados en navegador real (no solo escritos):
  `click_whatsapp`, `click_course_contact`, `click_maps`, `click_social`, `view_product`
  (confirmado con `dataLayer` real), `view_promotion` (lógica de extracción de parámetros
  verificada directamente; el disparo por `IntersectionObserver` en sí no se pudo probar con
  scroll real porque la herramienta de navegador de esta sesión no compone frames — es un
  API nativo del navegador, ampliamente probado, no código propio de riesgo).

## Rendimiento (medido, sin herramienta de Lighthouse disponible en este entorno)

| Página | Peso HTML |
| --- | --- |
| Home | 41.3 KB |
| Detalle de producto | 15.2 KB |

Sin JS de analítica bloqueante (GA4 se carga `async`). Sin herramienta de Lighthouse/PageSpeed
disponible en este entorno para medir LCP/CLS/INP reales — pendiente correr
PageSpeed Insights manualmente (ver checklist en el reporte final, sección K).

## Problemas encontrados y su estado

| # | Problema | Estado |
| --- | --- | --- |
| 1 | `http://alvaimportaciones.com/` (HTTP plano, sin `www`) devuelve `200 OK` en vez de redirigir a HTTPS | **Sin corregir** — requiere activar "Always Use HTTPS" en Cloudflare (dashboard, no código). Ver acción pendiente. |
| 2 | `http://www.alvaimportaciones.com/` devuelve `522` (timeout) en vez de redirigir | **Se resuelve solo** al activar "Always Use HTTPS" del problema #1 — Cloudflare primero fuerza HTTPS a nivel de borde, y ahí sí aplica la regla de redirección `www→non-www` ya creada. No requiere tocar la regla existente. |
| 3 | Una URL inexistente devolvía `404` con **cuerpo vacío** (`Content-Length: 0`), sin mostrar el diseño real de `404.html` | **Corregido en esta sesión** — se agregó `not_found_handling: "404-page"` a `wrangler.jsonc` (ver commit de esta fase). Falta verificar en producción después del deploy. |
| 4 | Sin headers de seguridad básicos (`Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`) | **Corregido en esta sesión** — agregados en `public/_headers`. **No** se agregó CSP todavía (riesgo de romper GA4/imágenes sin poder probar cada página contra ella) — queda como pendiente documentado, no aplicado a ciegas. |
| 5 | Números de WhatsApp de Matriz y Sucursal incorrectos en `site-config.ts` (y por lo tanto en schema y CTAs) | **Corregido** (confirmado por el usuario en esta misma sesión, antes de esta fase de SEO/Analytics). |

## Acciones realizadas en esta fase (resumen — detalle completo en el reporte final)

- Auditoría completa de producción (no solo del código fuente).
- `src/lib/analytics.ts`, `src/components/Analytics.astro`, `src/env.d.ts`, `.env.example`.
- `WhatsAppCTA.astro` migrado de su script propio a la delegación centralizada; `source`/
  `pageType`/`ctaLocation` agregados en los ~24 usos del componente en todo el sitio.
- `click_maps` en `LocationsMap.astro`, `/locales`, `/locales/[branch]`.
- `click_social` en `Footer.astro` y `PromoShowcase.astro`.
- `view_product` vía `ViewProductTracker.astro` en las dos rutas de detalle de producto.
- `view_promotion` en las tarjetas de `PromoShowcase.astro`.
- Fix de 404 vacío (`wrangler.jsonc`).
- Headers de seguridad básicos (`public/_headers`).
- `docs/ANALYTICS.md`, `docs/SEARCH_ENGINES.md`, este archivo.

## Acciones externas pendientes (requieren al dueño del negocio)

Ver sección K del reporte final de esta fase para la lista numerada completa con capturas de
dónde hacer clic. Resumen: Search Console, Bing Webmaster, `PUBLIC_GA_MEASUREMENT_ID` real,
`INDEXNOW_KEY` real, activar "Always Use HTTPS" en Cloudflare, Google Business Profile.

## Cómo repetir esta auditoría en 30/60/90 días

1. Comparar métricas reales de GA4 (una vez tenga datos): usuarios orgánicos, sesiones,
   eventos `click_whatsapp` por `source`, páginas con más `view_product`.
2. Comparar Search Console: impresiones, clics, CTR, posición promedio, páginas indexadas.
3. Repetir los checks de esta auditoría (`curl -I` a home/producto/robots/sitemap/llms, revisar
   Schema.org con una herramienta como el Rich Results Test de Google) y anotar diferencias.
4. No sobreescribir este archivo — crear `docs/SEO_ANALYTICS_BASELINE_YYYY-MM-DD.md` o una
   sección de seguimiento nueva, para poder comparar contra el punto cero real.
