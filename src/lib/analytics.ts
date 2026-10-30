// Capa centralizada de analitica. Todo el sitio pasa por trackEvent() — nada de llamadas a
// gtag()/fbq()/dataLayer.push() sueltas en componentes individuales (ver docs/ANALYTICS.md).
//
// Diseño deliberado: trackEvent() publica en los proveedores configurados (GA4 y/o Meta Pixel)
// y ademas deja una copia en window.dataLayer para depuracion/GTM futuro. Si no hay proveedor
// configurado, no rompe nada ni hacen falta guards por componente.

export type TrackParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (command: "event", eventName: string, params?: Record<string, string | number | boolean>) => void;
    fbq?: (command: "track" | "trackCustom", eventName: string, params?: Record<string, string | number | boolean>) => void;
  }
}

function cleanParams(params: TrackParams): Record<string, string | number | boolean> {
  const clean: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") clean[key] = value;
  }
  return clean;
}

const META_STANDARD_EVENTS: Record<string, string> = {
  click_whatsapp: "Contact",
  quote_send: "Lead",
  assistant_message: "Contact",
};

function toPascalCase(eventName: string): string {
  return eventName
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

export function trackEvent(eventName: string, params: TrackParams = {}): void {
  if (typeof window === "undefined") return;
  try {
    const clean = cleanParams(params);
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: eventName, ...clean });
    window.gtag?.("event", eventName, clean);

    const metaEvent = META_STANDARD_EVENTS[eventName];
    if (metaEvent) window.fbq?.("track", metaEvent, { event_name: eventName, ...clean });
    window.fbq?.("trackCustom", toPascalCase(eventName), clean);
  } catch {
    // La analitica nunca debe romper el sitio.
  }
}

function datasetKeyToParam(key: string): string {
  // "trackProductCode" -> "product_code". Quita el prefijo "track" y pasa camelCase a snake_case.
  return key
    .slice("track".length)
    .replace(/([A-Z])/g, "_$1")
    .toLowerCase()
    .replace(/^_/, "");
}

/**
 * Delegación de clic a nivel de documento: cualquier elemento con `data-track-event="nombre"`
 * (uno o más nombres separados por espacio) dispara trackEvent() automáticamente, tomando el
 * resto de sus `data-track-*` como parámetros. Se llama una sola vez desde Analytics.astro —
 * evita repetir listeners/querySelectorAll en cada componente que tenga un CTA.
 *
 * Uso en markup:
 *   <a data-track-event="click_whatsapp" data-track-source="product" data-track-product-code="123">
 */
export function initClickTracking(): void {
  if (typeof document === "undefined") return;
  document.addEventListener("click", (event) => {
    const target = (event.target as HTMLElement | null)?.closest<HTMLElement>(
      "[data-track-event]",
    );
    if (!target) return;
    const eventNames = target.dataset.trackEvent?.split(/\s+/).filter(Boolean);
    if (!eventNames?.length) return;

    const params: TrackParams = {};
    for (const [key, value] of Object.entries(target.dataset)) {
      if (key === "trackEvent" || !value) continue;
      if (!key.startsWith("track")) continue;
      params[datasetKeyToParam(key)] = value;
    }

    for (const eventName of eventNames) trackEvent(eventName, params);
  });
}

/**
 * Dispara un evento de impresión (`view_*`) una sola vez por elemento cuando entra al viewport
 * (IntersectionObserver, umbral 50%) — evita falsos positivos por elementos renderizados pero
 * nunca vistos. Se desconecta del elemento apenas dispara una vez.
 */
export function initViewTracking(): void {
  if (typeof document === "undefined" || typeof IntersectionObserver === "undefined") return;
  const targets = document.querySelectorAll<HTMLElement>("[data-track-view-event]");
  if (targets.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        const eventNames = el.dataset.trackViewEvent?.split(/\s+/).filter(Boolean);
        if (eventNames?.length) {
          const params: TrackParams = {};
          for (const [key, value] of Object.entries(el.dataset)) {
            if (key === "trackViewEvent" || !value) continue;
            if (!key.startsWith("trackView")) continue;
            // "trackViewPromotionLabel" -> "promotion_label" (quita el prefijo "trackView").
            const paramKey = key
              .slice("trackView".length)
              .replace(/([A-Z])/g, "_$1")
              .toLowerCase()
              .replace(/^_/, "");
            params[paramKey] = value;
          }
          for (const eventName of eventNames) trackEvent(eventName, params);
        }
        observer.unobserve(el);
      }
    },
    { threshold: 0.5 },
  );

  targets.forEach((el) => observer.observe(el));
}
