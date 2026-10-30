import { storefrontBaseUrl } from "./storefront-config";
import { storefrontApiUrl } from "./storefront-config";
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

export async function getOmviqaHomePreview(token: string): Promise<OmviqaHomeResponse> {
  if (!storefrontApiUrl) throw new Error("La API de Omviqa no esta configurada.");
  const base = storefrontApiUrl.replace(/\/+$/, "");
  // Sin conexion (o sin permiso CORS porque el servidor aun no tiene la vista previa): mensaje claro, no "Failed to fetch".
  const res = await fetch(`${base}/api/storefront/preview/home?token=${encodeURIComponent(token)}`, { cache: "no-store" }).catch(() => null);
  if (!res) throw new Error("No se pudo conectar con Omviqa para cargar la vista previa. Intenta de nuevo en un momento.");
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const message = typeof data.error === "string" ? data.error : "La vista previa no esta disponible.";
    throw new Error(message);
  }
  const data = (await res.json()) as { home: OmviqaHomeResponse | null };
  if (!data.home) throw new Error("La vista previa no tiene contenido.");
  return data.home;
}
