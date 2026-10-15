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
    code?: string | null;
    name: string;
    category: { slug: string; label: string } | null;
    publicPrice: number | null;
  } | null;
}

export const NEW_PRODUCTS_LIMIT = 8;
/** Lo que la API entrega como maximo por pedido. */
export const NEW_PRODUCTS_MAX = 24;

/** Texto -> segmento de URL legible ("Pestañas JDM Whispy" -> "pestanas-jdm-whispy"). */
export function slugify(text: string): string {
  return (
    text
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "novedad"
  );
}

/**
 * Donde lleva una novedad. Si Omviqa ya la enlazo a un producto del catalogo, a la ficha de ese producto
 * (con precio y stock reales); si no, a su propia pagina de novedad. Antes la tarjeta no llevaba a ningun
 * lado: la foto no era un enlace y, sin producto, el titulo tampoco.
 */
export function novedadPath(item: NewProductItem): string {
  const p = item.product;
  if (p?.category?.slug && p.publicProductId) {
    return `/productos/${p.category.slug}/p/${p.publicProductId}/${slugify(p.name)}`;
  }
  return `/novedades/${item.id}/${slugify(item.title)}`;
}

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

/**
 * Una novedad por id, para su pagina. La API solo entrega la lista (hasta 24), asi que se busca ahi:
 * una novedad que ya salio de las ultimas 24 deja de tener pagina (y la pagina lo dice, sin inventar).
 */
export async function getNewProduct(id: string): Promise<NewProductItem | null> {
  const items = await getNewProducts(NEW_PRODUCTS_MAX);
  return items.find((item) => item.id === id) ?? null;
}
