import { storefrontBaseUrl } from "./storefront-config";
import type { NewProductItem } from "./new-products";

export interface OmviqaHomeSection {
  id: string;
  type: string;
  enabled: boolean;
  sortOrder: number;
  [key: string]: unknown;
}

export interface OmviqaHomeProduct {
  publicProductId: string;
  name: string;
  slug: string;
  category: { slug: string; label: string } | null;
  brand: string | null;
  publicPrice: number | null;
  currency: "USD";
  imageUrl: string | null;
  shortDescription: string | null;
}

export interface OmviqaHomeCategory {
  slug: string;
  label: string;
  description: string | null;
  imageUrl: string | null;
  featured: boolean;
  /** Ya no lo envia la API publica (no se filtran cifras del catalogo). */
  productCount?: number;
}

export interface OmviqaHomeResponse {
  payload: {
    version: 1;
    sections: OmviqaHomeSection[];
    seo?: { title?: string; description?: string; noindex?: boolean };
  };
  categories: OmviqaHomeCategory[];
  products: OmviqaHomeProduct[];
  assets: Record<string, { id: string; publicUrl: string; width: number | null; height: number | null }>;
  /** Por id de seccion `newProducts`. Opcional: un Omviqa anterior no lo envia. */
  newProducts?: Record<string, NewProductItem[]>;
  publishedAt: string | null;
  publishedVersion: number | null;
}

export async function getOmviqaHome(): Promise<OmviqaHomeResponse | null> {
  const base = storefrontBaseUrl();
  if (!base) return null;
  try {
    const res = await fetch(`${base}/home`);
    if (!res.ok) return null;
    const data = (await res.json()) as { home: OmviqaHomeResponse | null };
    return data.home;
  } catch {
    return null;
  }
}
