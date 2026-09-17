import { useEffect, useState } from "react";
import { whatsappLink } from "../lib/site-config";
import { useShowPrices } from "../lib/use-price-visibility";
import type { NewProductItem } from "../lib/new-products";

// "Productos nuevos" del Home.
//
// POR QUE EN VIVO. El sitio es estatico: lo que se pide en el build queda
// congelado hasta el siguiente despliegue. Pero las novedades cambian cada vez
// que ALVA publica en su canal de Telegram. Asi que el HTML trae las novedades
// del momento del build (indexables, visibles sin JavaScript) y el navegador
// las refresca al cargar -- una publicacion NUEVO aparece en la web sin que
// nadie tenga que recompilar nada.

interface Props {
  apiBaseUrl: string;
  initialItems: NewProductItem[];
  limit: number;
  eyebrow?: string;
  title?: string;
}

function precio(item: NewProductItem): string | null {
  const p = item.product?.publicPrice;
  if (p == null) return null;
  return `$${Number.isInteger(p) ? p : p.toFixed(2)}`;
}

export default function NewProducts({ apiBaseUrl, initialItems, limit, eyebrow = "Recién llegados", title = "Productos nuevos" }: Props) {
  const [items, setItems] = useState<NewProductItem[]>(initialItems);
  const showPrices = useShowPrices(apiBaseUrl);

  useEffect(() => {
    if (!apiBaseUrl) return;
    const controller = new AbortController();
    fetch(`${apiBaseUrl}/new-products?limit=${limit}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { items?: NewProductItem[] } | null) => {
        // Una respuesta fallida o vacia por un corte no borra lo que ya se ve.
        if (data && Array.isArray(data.items) && data.items.length > 0) setItems(data.items);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [apiBaseUrl, limit]);

  if (items.length === 0) return null;

  return (
    <section className="section-y px-6" aria-labelledby="productos-nuevos">
      <div className="mx-auto max-w-6xl">
        <p className="text-center text-sm font-semibold uppercase tracking-[0.3em] text-primary-700">{eyebrow}</p>
        <h2 id="productos-nuevos" className="text-display-lg mt-2 text-center text-primary-900">
          {title}
        </h2>
        <ul className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {items.map((item) => {
            const categoria = item.product?.category ?? null;
            const destino = categoria ? `/productos/${categoria.slug}` : null;
            const valor = showPrices ? precio(item) : null;
            return (
              <li key={item.id} className="glass-card group flex flex-col overflow-hidden rounded-2xl shadow-md">
                <div className="relative aspect-[4/5] overflow-hidden bg-white">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-blush-500 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                    Nuevo
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  {destino ? (
                    <a href={destino} className="font-display text-base leading-snug text-primary-800 hover:text-primary-600">
                      {item.title}
                    </a>
                  ) : (
                    <p className="font-display text-base leading-snug text-primary-800">{item.title}</p>
                  )}
                  {valor && <p className="text-lg font-semibold text-ink" data-precio>{valor}</p>}
                  <a
                    href={whatsappLink(`Hola, quisiera consultar sobre: ${item.title}`)}
                    target="_blank"
                    rel="noopener"
                    className="mt-auto inline-flex w-fit items-center gap-2 rounded-full bg-primary-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
                  >
                    Consultar
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
