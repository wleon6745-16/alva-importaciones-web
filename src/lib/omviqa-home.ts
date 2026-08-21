import { storefrontApiUrl, storefrontChannelId } from "./storefront-config";

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
  productCount: number;
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
  publishedAt: string | null;
  publishedVersion: number | null;
}

export async function getOmviqaHome(): Promise<OmviqaHomeResponse | null> {
  if (!storefrontApiUrl || !storefrontChannelId) return null;
  try {
    const res = await fetch(`${storefrontApiUrl.replace(/\/$/, "")}/${storefrontChannelId}/home`);
    if (!res.ok) return null;
    const data = (await res.json()) as { home: OmviqaHomeResponse | null };
    return data.home;
  } catch {
    return null;
  }
}
