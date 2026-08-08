# Próxima sesión

## 1. Qué leer primero

1. `docs/seo-work/CURRENT_STATE.md`
2. Este archivo completo
3. La tarea `SEO-004` en `tasks/seo-tasks.json`
4. `docs/seo-work/DATA_CONFLICTS.md` → CONFLICT-001 (número de WhatsApp de la Sucursal, sin
   resolver — no lo resuelvas por tu cuenta)

## 2. Qué tarea ejecutar

**SEO-004 — WhatsApp contextual y conversiones**, Fase 4.

Antes de tocar código: `npm run task:start -- SEO-004`.

Objetivo: que cada página de producto genere un mensaje de WhatsApp más completo (nombre, código,
URL de la página) y que cada clic en un CTA de WhatsApp dispare un evento de analítica
`whatsapp_click`, aunque todavía no haya ningún proveedor de analítica instalado.

## 3. Contexto importante: no existe analítica instalada todavía

Se verificó en esta sesión (búsqueda exhaustiva) que el repo **no tiene ningún proveedor de
analítica** (nada de GA4, GTM, Plausible, Fathom, Umami, Meta Pixel — cero `<script>` de
tracking, cero dependencia en `package.json`). Instalar un proveedor real es una decisión que
requiere datos de cuenta del cliente (Measurement ID, dominio verificado, etc.) — eso es
`MANUAL_ACTIONS.md` / Sesión 16, no esta tarea.

**Enfoque recomendado para SEO-004**: no instalar ningún proveedor. En su lugar, hacer que el
clic en cada CTA de WhatsApp empuje un evento al patrón estándar de `window.dataLayer` (el mismo
que usa Google Tag Manager/GA4, así que cuando se instale un proveedor real en el futuro no hay
que tocar este código, solo agregar el script del proveedor):

```js
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  event: "whatsapp_click",
  product_id: "...",      // solo en páginas de producto
  product_name: "...",    // solo en páginas de producto
  category: "...",        // solo en páginas de producto
  page_path: location.pathname,
  branch: "matriz" | "sucursal", // según qué número se está usando
});
```

Esto cumple el criterio de aceptación ("existe un evento de analítica whatsapp_click con
product_id, product_name, category, page_path, branch") de forma verificable sin depender de una
cuenta externa. Verificar manualmente en el navegador con la consola: `window.dataLayer` debe
llenarse al hacer clic.

## 4. Qué archivos revisar

- `src/components/WhatsAppCTA.astro` — hoy es un `<a href={whatsappLink(...)}>` plano, sin
  `onclick` ni tracking. Necesita aceptar props opcionales para los datos del evento (p. ej.
  `productId`, `productName`, `category`, `branch`) y disparar el `dataLayer.push` en el clic
  (puede ser un `<script>` inline con `data-*` attributes leídos por un listener, ya que es un
  componente `.astro` sin framework — revisar cómo se hace scripting inline en el resto del sitio,
  ver `SectionReveal.astro` como referencia de patrón `<script>` + `IntersectionObserver`).
- `src/pages/productos/muebles/[slug].astro` — el CTA principal de producto (SEO-003) hoy solo
  arma `message` con nombre y código. Hay que añadir la URL de la página al mensaje también
  (`Astro.url` o construir con `siteConfig.url` + `pagePath`), y pasar `productId`/`productName`/
  `category`/`branch` al `WhatsAppCTA` para el evento de analítica.
- `src/lib/site-config.ts` — de aquí sale `primaryWhatsappNumber` (Matriz) y
  `siteConfig.locations` (para saber qué `branch` corresponde a qué número). El CONFLICT-001 (
  número de Sucursal) sigue sin resolver: usar el número ya configurado, no inventar ni "corregir"
  por tu cuenta.
- `src/pages/productos/muebles.astro` — el CTA de cada tarjeta del listado también debería llevar
  los mismos datos de producto para el evento (mismo patrón que la página individual).

## 5. Qué resultado se espera

- Mensaje de WhatsApp en páginas de producto incluye nombre + código (si existe) + URL absoluta
  de la página.
- Número usado sigue siendo el configurado en `site-config.ts` (Matriz por defecto para CTAs
  generales; si se decide usar el de Sucursal en algún contexto, debe ser explícito y documentado,
  no un cambio silencioso).
- Evento `whatsapp_click` (vía `window.dataLayer.push`) disparado al hacer clic en cualquier CTA
  de WhatsApp de producto, con `product_id`, `product_name`, `category`, `page_path`, `branch`.
  Los CTAs genéricos (no de producto, p. ej. el del header o el de `/contacto`) pueden omitir los
  campos de producto pero deben seguir disparando el evento con `page_path` y `branch` al menos.
- Sin datos personales en el evento (nunca nombre/teléfono de un cliente real — solo datos del
  producto/página, que son públicos).
- URL de WhatsApp sigue codificada con `encodeURIComponent` (ya lo hace `whatsappLink()`, no
  romper eso).
- Verificado manualmente en vista móvil (usar `resize_window` a preset `mobile` en el navegador)
  que los CTA son clicables y con área táctil suficiente.
- `npm run build` sigue pasando.

## 6. Qué comandos ejecutar

```bash
cd "C:\Users\wleon\Proyectos\alva-importaciones-web"
git status
npm run task:status
npm run task:start -- SEO-004
# ... trabajo ...
npm run build
npm run task:validate
npm run task:complete -- SEO-004
```

## 7. Qué NO debe modificarse todavía

- No instalar ningún proveedor de analítica real (GA4/GTM/Plausible/etc.) — solo el
  `dataLayer.push` genérico descrito arriba. Instalar un proveedor real es de `MANUAL_ACTIONS.md`
  (requiere credenciales del cliente).
- No resolver CONFLICT-001 (número de WhatsApp de la Sucursal) — sigue pendiente de confirmación
  humana.
- No añadir Schema.org / JSON-LD de producto todavía — eso es SEO-005, la siguiente tarea.
- No tocar `src/data/products.generated.json` a mano — si hace falta un dato nuevo, se cambia el
  seed en `scripts/sync-public-catalog.ts` y se corre `npm run catalog:sync`.

## 8. Qué hacer si la tarea falla

1. No marcar `SEO-004` como `completed`.
2. Ejecutar `npm run task:fail -- SEO-004` y escribir la razón cuando el script la pida (o
   editar `tasks/seo-tasks.json` a mano si el script no cubre el caso).
3. Documentar en `docs/seo-work/CURRENT_STATE.md` → "Errores conocidos" exactamente qué falló,
   con el comando y el error.
4. Dejar el `git status` limpio (commitear lo estable, descartar/guardar en stash lo que no lo
   esté, nunca dejarlo mezclado sin explicación).
5. Reescribir este archivo (`NEXT_SESSION.md`) con instrucciones para retomar `SEO-004` desde el
   punto exacto donde falló (no desde cero).
