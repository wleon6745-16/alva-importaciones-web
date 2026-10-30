// Ficha de un producto individual del catálogo en vivo (Storefront API de
// Omviqa) -- a diferencia de storefront-snapshot.ts (foto del build, para
// listas), esto se pide en cada visita (ver
// src/pages/productos/[category]/p/[id]/[...slug].astro, la única ruta con
// "export const prerender = false"): con miles de SKUs reales no cabe
// generar una página estática por producto, y el precio/stock no puede
// quedar congelado hasta el próximo build.
import { storefrontBaseUrl } from "./storefront-config";

export interface StorefrontProductDetail {
  publicProductId: string;
  code: string | null;
  name: string;
  slug: string;
  category: { slug: string; label: string } | null;
  subcategory: string | null;
  brand: string | null;
  publicPrice: number | null;
  currency: string;
  imageUrl: string | null;
  /** Fotos adicionales, si Omviqa las publica (hoy el producto trae solo `imageUrl`). */
  images?: string[] | null;
  shortDescription: string | null;
}

/** null si no hay conexión a Omviqa configurada, o si el producto no existe/ya no está publicado. */
export async function getStorefrontProduct(id: string): Promise<StorefrontProductDetail | null> {
  const base = storefrontBaseUrl();
  if (!base) return null;
  try {
    const res = await fetch(`${base}/products/${id}`);
    if (!res.ok) return null;
    const data = (await res.json()) as { product?: StorefrontProductDetail };
    return data.product ?? null;
  } catch {
    return null;
  }
}

/**
 * Existencias reales en este momento, consultadas por Omviqa al sistema de
 * inventario. Solo el estado: "unknown" cuando no se pudo confirmar, y
 * entonces la página no dice ni disponible ni agotado.
 */
export type StorefrontAvailability = "in_stock" | "out_of_stock" | "unknown";

export async function getStorefrontAvailability(id: string): Promise<StorefrontAvailability> {
  const base = storefrontBaseUrl();
  if (!base) return "unknown";
  try {
    const res = await fetch(`${base}/products/${id}/availability`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return "unknown";
    const data = (await res.json()) as { availability?: string };
    return data.availability === "in_stock" || data.availability === "out_of_stock" ? data.availability : "unknown";
  } catch {
    return "unknown";
  }
}
