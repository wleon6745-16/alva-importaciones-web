import { useEffect, useState } from "react";

// Promociones del Home, administradas desde Omviqa (Sitio web → Promociones).
//
// El HTML trae lo publicado al momento del build; el navegador vuelve a
// preguntar al cargar, para que una promocion nueva, editada o apagada en
// Omviqa se vea sin recompilar el sitio.

export interface PromotionCard {
  key: string;
  title: string;
  body: string;
  imageUrl: string | null;
  imageAlt: string;
}

interface EditorialPromotion {
  title: string;
  body: string;
  imageAssetId?: string | null;
  imageAlt?: string;
  startsAt?: string | null;
  endsAt?: string | null;
  enabled?: boolean;
}

interface EditorialResponse {
  collection: {
    items: Array<{ contentKey: string; payload: EditorialPromotion }>;
    assets: Record<string, { publicUrl: string }>;
  } | null;
}

interface Props {
  apiBaseUrl: string;
  initialItems: PromotionCard[];
  whatsappChannelUrl: string;
  instagramUrl: string;
}

/** Solo las promociones encendidas y dentro de sus fechas. */
export function vigentes(data: EditorialResponse, ahora = new Date()): PromotionCard[] {
  const coleccion = data.collection;
  if (!coleccion) return [];
  return coleccion.items
    .filter(({ payload }) => {
      if (payload.enabled === false) return false;
      if (payload.startsAt && new Date(payload.startsAt) > ahora) return false;
      if (payload.endsAt && new Date(payload.endsAt) < ahora) return false;
      return true;
    })
    .map(({ contentKey, payload }) => ({
      key: contentKey,
      title: payload.title,
      body: payload.body,
      imageUrl: payload.imageAssetId ? coleccion.assets[payload.imageAssetId]?.publicUrl ?? null : null,
      imageAlt: payload.imageAlt || payload.title,
    }));
}

export default function PromotionsShowcase({ apiBaseUrl, initialItems, whatsappChannelUrl, instagramUrl }: Props) {
  const [items, setItems] = useState<PromotionCard[]>(initialItems);

  useEffect(() => {
    if (!apiBaseUrl) return;
    const controller = new AbortController();
    fetch(`${apiBaseUrl}/editorial/promotion`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: EditorialResponse | null) => {
        // Un fallo no borra lo que ya se ve; una coleccion vacia si, porque
        // significa que el negocio apago sus promociones.
        if (data && data.collection) setItems(vigentes(data));
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [apiBaseUrl]);

  if (items.length === 0) return null;

  return (
    <div className="mx-auto max-w-6xl">
      <p className="text-center text-sm font-semibold uppercase tracking-[0.3em] text-primary-700">Promociones</p>
      <h2 className="mt-2 text-center font-display text-3xl text-primary-900 sm:text-4xl">Promociones y combos</h2>
      <p className="mx-auto mt-3 max-w-2xl text-center text-ink-muted">
        Beneficios pensados para equipar y abastecer tu salón. Las promociones se renuevan con frecuencia: síguenos
        para enterarte primero.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((promo) => (
          <div
            key={promo.key}
            className="glass-card group flex flex-col overflow-hidden rounded-2xl shadow-md transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
            data-track-view-event="view_promotion"
            data-track-view-promotion-label={promo.title}
          >
            <div className="aspect-square overflow-hidden bg-white">
              {promo.imageUrl ? (
                <img
                  src={promo.imageUrl}
                  alt={promo.imageAlt}
                  loading="lazy"
                  className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="h-full w-full bg-blush-50" />
              )}
            </div>
            <div className="flex flex-1 flex-col gap-1 p-4">
              <p className="font-display text-base text-primary-900">{promo.title}</p>
              <p className="text-sm text-ink-muted">{promo.body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <a
          href={whatsappChannelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-primary-800 px-6 py-3 font-semibold text-white transition-transform hover:scale-105 hover:bg-primary-700"
          data-track-event="click_social"
          data-track-platform="whatsapp_channel"
          data-track-source="promotions"
        >
          Seguir canal de WhatsApp →
        </a>
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border-2 border-primary-800 px-6 py-3 font-semibold text-primary-800 transition-transform hover:scale-105 hover:bg-primary-800 hover:text-white"
          data-track-event="click_social"
          data-track-platform="instagram"
          data-track-source="promotions"
        >
          Seguir en Instagram →
        </a>
      </div>
    </div>
  );
}
