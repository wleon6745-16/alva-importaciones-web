// Capa centralizada de analítica. Todo el sitio pasa por trackEvent() — nada de llamadas a
// gtag()/dataLayer.push() sueltas en componentes individuales (ver docs/ANALYTICS.md).
//
// Diseño deliberado: trackEvent() solo empuja a window.dataLayer. Si no hay proveedor
// configurado (PUBLIC_GA_MEASUREMENT_ID sin definir, ver Analytics.astro), gtag.js nunca se
// carga y esos pushes no van a ningún lado — no rompen nada, no hacen falta guards por
// componente. Nunca debe lanzar: un error de analítica no puede tumbar la página.

export type TrackParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export function trackEvent(eventName: string, params: TrackParams = {}): void {
  if (typeof window === "undefined") return;
  try {
    const cleanParams: Record<string, string | number | boolean> = {};
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") cleanParams[key] = value;
    }
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: eventName, ...cleanParams });
  } catch {
    // La analítica nunca debe romper el sitio.
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
