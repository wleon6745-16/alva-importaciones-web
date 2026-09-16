// "Productos nuevos": lo que ALVA publica como NUEVO en su canal de Telegram.
//
// Omviqa lee el canal, guarda la foto y, si la publicacion trae "COD:", la
// enlaza al producto real del catalogo (con su precio). Si no trae codigo, la
// novedad llega sin producto: se enseña la foto y el nombre del anuncio, y el
// cliente consulta por WhatsApp. Nunca se adivina a que producto se refiere.
import { storefrontBaseUrl } from "./storefront-config";

export interface NewProductItem {
  id: string;
  title: string;
  imageUrl: string;
  postedAt: string | null;
  product: {
    publicProductId: string;
    name: string;
    category: { slug: string; label: string } | null;
    publicPrice: number | null;
  } | null;
}

export const NEW_PRODUCTS_LIMIT = 8;

/**
 * Se pide en el build para que el HTML ya traiga las novedades (indexable y
 * sin esperar al navegador). Si Omviqa no responde, la seccion simplemente no
 * se pinta: el build no se rompe por esto.
 */
export async function getNewProducts(limit = NEW_PRODUCTS_LIMIT): Promise<NewProductItem[]> {
  const base = storefrontBaseUrl();
  if (!base) return [];
  try {
    const res = await fetch(`${base}/new-products?limit=${limit}`);
    if (!res.ok) return [];
    const data = (await res.json()) as { items?: NewProductItem[] };
    return Array.isArray(data.items) ? data.items : [];
  } catch {
    return [];
  }
}
