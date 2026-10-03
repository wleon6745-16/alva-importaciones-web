import { useEffect, useState } from "react";
import QuoteButton from "./QuoteButton";
import { whatsappLink } from "../lib/site-config";
import { useShowPrices } from "../lib/use-price-visibility";

// Destacados de cada categoria: los productos cuya foto es un anuncio del
// canal de Telegram de ALVA. Son piezas hechas para vender -- con color,
// composicion y texto --, asi que van arriba, en grande; el catalogo completo
// sigue mas abajo.
//
// Igual que "Productos nuevos": el HTML trae los del momento del build y el
// navegador los refresca al cargar, para que un anuncio nuevo aparezca sin
// recompilar el sitio.

export interface HighlightProduct {
  publicProductId: string;
  name: string;
  slug: string;
  brand: string | null;
  publicPrice: number | null;
  imageUrl: string | null;
}

interface Props {
  apiBaseUrl: string;
  categorySlug: string;
  categoryLabel: string;
  initialItems: HighlightProduct[];
  limit?: number;
}

function precio(p: number | null): string {
  if (p == null) return "Consultar precio";
  return `$${Number.isInteger(p) ? p : p.toFixed(2)}`;
}

export default function CategoryHighlights({ apiBaseUrl, categorySlug, categoryLabel, initialItems, limit = 8 }: Props) {
  const [items, setItems] = useState<HighlightProduct[]>(initialItems);
  const showPrices = useShowPrices(apiBaseUrl);

  useEffect(() => {
    if (!apiBaseUrl) return;
    const controller = new AbortController();
    const params = new URLSearchParams({ category: categorySlug, source: "channel", limit: String(limit) });
    fetch(`${apiBaseUrl}/products?${params.toString()}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { items?: HighlightProduct[] } | null) => {
        // Un fallo o un corte no borra lo que ya se ve. Tampoco se reemplaza por una
        // lista mas corta: la grilla ya renderizada encogeria justo cuando el visitante
        // ya tiene el dedo/cursor sobre una tarjeta, y el clic cae en lo que quedo debajo
        // (categorias, footer) en vez del producto que veia -- el reporte real que motivo
        // este guard.
        if (data && Array.isArray(data.items)) {
          const conFoto = data.items.filter((i) => i.imageUrl);
          setItems((prev) => (conFoto.length >= prev.length ? conFoto : prev));
        }
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [apiBaseUrl, categorySlug, limit]);

  const conFoto = items.filter((i) => i.imageUrl);
  if (conFoto.length === 0) return null;

  return (
    <section className="px-6 py-14" aria-labelledby={`destacados-${categorySlug}`}>
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-700">Destacados</p>
        <h2 id={`destacados-${categorySlug}`} className="mt-2 font-display text-3xl text-primary-900">
          Lo más buscado en {categoryLabel}
        </h2>
        <ul className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {conFoto.map((item) => {
            const detailHref = `/productos/${categorySlug}/p/${item.publicProductId}/${item.slug}`;
            return (
              <li key={item.publicProductId} className="glass-card group flex flex-col overflow-hidden rounded-2xl shadow-md">
                <a href={detailHref} className="block aspect-[4/5] overflow-hidden bg-white">
                  <img
                    src={item.imageUrl ?? ""}
                    alt={item.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </a>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  {item.brand && item.brand !== "//" && (
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary-700">{item.brand}</p>
                  )}
                  <a href={detailHref} className="font-display text-base leading-snug text-primary-900 hover:text-primary-700">
                    {item.name}
                  </a>
                  <p className="text-lg font-semibold text-ink" data-precio>{precio(showPrices ? item.publicPrice : null)}</p>
                  <a
                    href={whatsappLink(`Hola, quisiera consultar sobre: ${item.name}`)}
                    target="_blank"
                    rel="noopener"
                    className="mt-auto inline-flex w-fit items-center gap-2 rounded-full bg-primary-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
                  >
                    Consultar
                  </a>
                  <QuoteButton id={item.publicProductId} code={item.code ?? null} name={item.name} source="highlights" />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
