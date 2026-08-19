import { useEffect, useMemo, useRef, useState } from "react";
import { whatsappLink } from "../lib/site-config";

// Filtro de marca, búsqueda y "cargar más" para el catálogo completo real
// (miles de productos por categoría) -- llama a la Storefront API de
// ASISTENTE directo desde el navegador, nunca descarga el catálogo completo
// (ver punto 14/15 del pedido de Fase 2). El sitio sigue siendo estático: la
// primera página ya viene renderizada en HTML (ver *.astro), este componente
// solo se encarga de lo que necesita datos en vivo (paginación profunda,
// filtro, búsqueda).
interface PublicBrandSummary {
  name: string;
  count: number;
}

interface StorefrontProduct {
  publicProductId: string;
  code: string | null;
  name: string;
  brand: string | null;
  publicPrice: number | null;
  imageUrl: string | null;
}

interface Props {
  apiBaseUrl: string;
  channelId: string;
  categorySlug: string;
  initialItems: StorefrontProduct[];
  initialBrands: PublicBrandSummary[];
  initialTotal: number;
  initialHasMore: boolean;
  pageSize?: number;
}

function priceLabel(price: number | null): string {
  if (price == null) return "Consultar precio";
  return `$${Number.isInteger(price) ? price : price.toFixed(2)}`;
}

export default function CatalogExplorer({
  apiBaseUrl,
  channelId,
  categorySlug,
  initialItems,
  initialBrands,
  initialTotal,
  initialHasMore,
  pageSize = 24,
}: Props) {
  const base = useMemo(() => `${apiBaseUrl.replace(/\/+$/, "")}/api/storefront/${channelId}`, [apiBaseUrl, channelId]);

  const [brand, setBrand] = useState("");
  const [query, setQuery] = useState("");
  // Semilla desde el HTML ya renderizado (primera página estática, indexable
  // -- ver *.astro) para no re-pedirla al navegador ni parpadear en el
  // primer render. Solo se vuelve a pedir la página 1 cuando el visitante
  // cambia marca/búsqueda de verdad (ver el effect de abajo, que se salta el
  // montaje inicial con isFirstRender).
  const [items, setItems] = useState<StorefrontProduct[]>(initialItems);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(initialTotal);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const requestId = useRef(0);
  const isFirstRender = useRef(true);

  async function loadPage(targetPage: number, replace: boolean) {
    const thisRequest = ++requestId.current;
    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams({ category: categorySlug, page: String(targetPage), limit: String(pageSize) });
      if (brand) params.set("brand", brand);
      if (query.trim()) params.set("q", query.trim());

      const res = await fetch(`${base}/products?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { items: StorefrontProduct[]; total: number; hasMore: boolean };

      if (thisRequest !== requestId.current) return; // respuesta obsoleta (el usuario ya cambio el filtro)
      setItems((prev) => (replace ? data.items : [...prev, ...data.items]));
      setTotal(data.total);
      setHasMore(data.hasMore);
      setPage(targetPage);
    } catch {
      if (thisRequest !== requestId.current) return;
      setError(true);
    } finally {
      if (thisRequest === requestId.current) setLoading(false);
    }
  }

  // Al cambiar marca/búsqueda, se reinicia desde la página 1 -- nunca se
  // acumulan resultados de filtros distintos en la misma lista. Se salta el
  // primer render: esos datos ya llegaron por props (HTML estático).
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timeout = setTimeout(() => loadPage(1, true), query ? 350 : 0);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brand, query]);

  // Sin API/canal configurados (ej. un deploy donde PUBLIC_STOREFRONT_* no
  // esta seteado todavia -- ver .env.example) SOLO se apaga lo que depende
  // de una llamada en vivo (filtro, búsqueda, "cargar más"). La grilla ya
  // renderizada con initialItems (HTML estático, generado en build time) se
  // sigue mostrando igual -- no depende de que ASISTENTE este arriba en este
  // momento.
  const liveEnabled = Boolean(apiBaseUrl && channelId);

  return (
    <div>
      {liveEnabled && (
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="rounded-full border border-primary-800/20 bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-700"
              aria-label="Filtrar por marca"
            >
              <option value="">Todas las marcas</option>
              {initialBrands.map((b) => (
                <option key={b.name} value={b.name}>
                  {b.name} ({b.count})
                </option>
              ))}
            </select>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar en esta categoría..."
              className="rounded-full border border-primary-800/20 bg-white px-4 py-2 text-sm text-ink shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-700"
              aria-label="Buscar producto"
            />
          </div>
          <p className="text-sm text-ink-muted">{total.toLocaleString("es-EC")} productos</p>
        </div>
      )}

      {error && (
        <p className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          No pudimos cargar el catálogo en este momento.{" "}
          <a href={whatsappLink()} className="font-semibold underline" target="_blank" rel="noopener noreferrer">
            Consulta por WhatsApp
          </a>
          .
        </p>
      )}

      {!error && items.length === 0 && !loading && (
        <p className="mb-6 text-sm text-ink-muted">No encontramos productos con ese filtro.</p>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.publicProductId} className="group glass-card flex flex-col overflow-hidden rounded-2xl shadow-md">
            <div className="flex aspect-square items-center justify-center overflow-hidden bg-white">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} loading="lazy" className="h-full w-full object-contain" />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-blush-50 text-primary-700/50">
                  <svg
                    viewBox="0 0 24 24"
                    width="36"
                    height="36"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span className="text-xs font-medium">Foto próximamente</span>
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-1.5 p-5">
              {item.brand && (
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary-700">{item.brand}</p>
              )}
              <h3 className="font-display text-lg leading-snug text-primary-900">{item.name}</h3>
              <p className="mt-1 text-xl font-semibold text-ink">{priceLabel(item.publicPrice)}</p>
              <a
                href={whatsappLink(
                  `Hola, quisiera consultar sobre: ${item.name}${item.code ? ` (Cód: ${item.code})` : ""}`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex w-fit items-center gap-2 rounded-full bg-primary-800 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary-900/20 transition-transform duration-200 hover:scale-105 hover:bg-primary-700"
              >
                Consultar
              </a>
            </div>
          </div>
        ))}
      </div>

      {loading && <p className="mt-8 text-center text-sm text-ink-muted">Cargando...</p>}

      {liveEnabled && !loading && hasMore && (
        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={() => loadPage(page + 1, false)}
            className="rounded-full border-2 border-primary-800 px-6 py-3 font-semibold text-primary-800 transition-transform duration-200 hover:scale-105 hover:bg-primary-800 hover:text-white"
          >
            Cargar más productos
          </button>
        </div>
      )}
    </div>
  );
}
