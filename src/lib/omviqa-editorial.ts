import { storefrontApiUrl, storefrontChannelId } from "./storefront-config";

export type OmviqaEditorialType = "promotion" | "course" | "location" | "page";

export interface OmviqaAssetRef {
  id: string;
  publicUrl: string;
  width: number | null;
  height: number | null;
}

export interface OmviqaPromotion {
  title: string;
  body: string;
  imageAssetId?: string | null;
  imageAlt?: string;
  startsAt?: string | null;
  endsAt?: string | null;
  enabled?: boolean;
  sortOrder?: number;
}

export interface OmviqaCourse {
  slug: string;
  title: string;
  description: string;
  intro: string;
  highlights: Array<{ label: string; value: string }>;
  imageAssetId?: string | null;
  imageAlt?: string;
  ctaLabel?: string;
  ctaMessage?: string;
  enabled?: boolean;
  seo?: { title?: string; description?: string; noindex?: boolean };
}

export interface OmviqaLocation {
  slug: string;
  name: string;
  title?: string;
  description?: string;
  address: string;
  hours?: Array<{ days: string; time: string }>;
  mapsUrl?: string;
  whatsappNumber?: string;
  imageAssetId?: string | null;
  imageAlt?: string;
  enabled?: boolean;
  sortOrder?: number;
  seo?: { title?: string; description?: string; noindex?: boolean };
}

export interface OmviqaPage {
  slug: string;
  eyebrow?: string;
  title: string;
  body: string;
  imageAssetId?: string | null;
  imageAlt?: string;
  ctaLabel?: string;
  ctaHref?: string;
  enabled?: boolean;
  sortOrder?: number;
  seo?: { title?: string; description?: string; noindex?: boolean };
}

export type OmviqaEditorialPayload = OmviqaPromotion | OmviqaCourse | OmviqaLocation | OmviqaPage;

export interface OmviqaEditorialItem<TPayload extends OmviqaEditorialPayload> {
  contentKey: string;
  payload: TPayload;
  publishedAt: string | null;
  publishedVersion: number | null;
}

export interface OmviqaEditorialCollection<TPayload extends OmviqaEditorialPayload> {
  contentType: OmviqaEditorialType;
  items: Array<OmviqaEditorialItem<TPayload>>;
  assets: Record<string, OmviqaAssetRef>;
}

export function editorialAssetUrl(
  payload: { imageAssetId?: string | null },
  assets: Record<string, OmviqaAssetRef>
): string | null {
  return payload.imageAssetId ? assets[payload.imageAssetId]?.publicUrl ?? null : null;
}

export async function getOmviqaEditorial<TPayload extends OmviqaEditorialPayload>(
  contentType: OmviqaEditorialType
): Promise<OmviqaEditorialCollection<TPayload> | null> {
  if (!storefrontApiUrl || !storefrontChannelId) return null;
  try {
    const res = await fetch(`${storefrontApiUrl.replace(/\/$/, "")}/${storefrontChannelId}/editorial/${contentType}`);
    if (!res.ok) return null;
    const data = (await res.json()) as { collection: OmviqaEditorialCollection<TPayload> | null };
    return data.collection && data.collection.items.length > 0 ? data.collection : null;
  } catch {
    return null;
  }
}
