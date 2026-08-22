import { useEffect, useState } from "react";

type DraftEnvelope = {
  contentType: "home_section" | "promotion" | "course" | "location" | "page";
  contentKey: string;
  payload?: Record<string, any>;
  assets?: Record<string, { publicUrl: string }>;
  home?: {
    payload: { sections: Array<Record<string, any>> };
    categories: Array<{ slug: string; label: string }>;
    products: Array<{ publicProductId: string; name: string; publicPrice: number | null; imageUrl: string | null; category: { slug: string; label: string } | null }>;
    assets: Record<string, { publicUrl: string }>;
  };
};

function decodeDraft(): DraftEnvelope | null {
  const match = window.location.hash.match(/draft=([^&]+)/);
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(escape(atob(match[1])))) as DraftEnvelope;
  } catch {
    return null;
  }
}

function assetUrl(id: string | null | undefined, assets: Record<string, { publicUrl: string }> = {}) {
  return id ? assets[id]?.publicUrl ?? null : null;
}

function ButtonLike({ label }: { label?: string }) {
  return label ? <span className="inline-flex rounded-full bg-primary-800 px-6 py-3 font-semibold text-white">{label}</span> : null;
}

function HomeDraft({ draft }: { draft: DraftEnvelope }) {
  const home = draft.home;
  if (!home) return null;
  const categories = new Map(home.categories.map((item) => [item.slug, item]));
  const products = new Map(home.products.map((item) => [item.publicProductId, item]));
  return (
    <>
      {home.payload.sections
        .filter((section) => section.enabled !== false)
        .sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0))
        .map((section) => {
          const image = assetUrl(section.imageAssetId, home.assets);
          if (section.type === "hero") {
            return (
              <section key={section.id} className="relative overflow-hidden bg-primary-900">
                <div className="mx-auto grid max-w-6xl items-center gap-16 px-6 py-20 lg:grid-cols-[1.05fr_1fr] lg:py-32">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blush-100">{section.eyebrow}</p>
                    <h1 className="mt-5 font-display text-5xl text-white">{section.title}</h1>
                    <p className="mt-6 max-w-lg text-lg text-white/80">{section.body}</p>
                    <div className="mt-8 flex flex-wrap gap-4">
                      <ButtonLike label={section.primaryCta?.label} />
                      {section.secondaryCta?.label && <span className="inline-flex rounded-full border-2 border-white px-6 py-3 font-semibold text-white">{section.secondaryCta.label}</span>}
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-[1.75rem] shadow-2xl">
                    {image ? <img src={image} alt={section.imageAlt || section.title} className="aspect-[4/5] w-full object-cover" /> : <div className="aspect-[4/5] bg-primary-800" />}
                  </div>
                </div>
              </section>
            );
          }
          if (section.type === "categories") {
            return (
              <section key={section.id} className="section-y px-6">
                <div className="mx-auto max-w-6xl text-center">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-700">{section.eyebrow}</p>
                  <h2 className="mt-2 font-display text-4xl text-primary-900">{section.title}</h2>
                  <p className="mx-auto mt-3 max-w-2xl text-ink-muted">{section.body}</p>
                  <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {(section.categorySlugs ?? []).map((slug: string) => (
                      <div key={slug} className="rounded-3xl bg-primary-900 p-8 text-left text-white shadow-lg">
                        <h3 className="font-display text-2xl">{categories.get(slug)?.label ?? slug}</h3>
                        <span className="mt-4 inline-flex text-sm font-semibold">Ver mas →</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );
          }
          if (section.type === "featuredProducts") {
            return (
              <section key={section.id} className="section-y bg-blush-50 px-6">
                <div className="mx-auto max-w-6xl text-center">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-700">{section.eyebrow}</p>
                  <h2 className="mt-2 font-display text-3xl text-primary-900">{section.title}</h2>
                  <div className="mt-12 grid gap-6 sm:grid-cols-3">
                    {(section.productIds ?? []).map((id: string) => {
                      const product = products.get(id);
                      return (
                        <div key={id} className="glass-card overflow-hidden rounded-2xl text-left shadow-md">
                          <div className="aspect-square bg-white">{product?.imageUrl && <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain" />}</div>
                          <div className="p-5">
                            <p className="font-display text-lg text-primary-800">{product?.name ?? "Producto seleccionado"}</p>
                            <p className="text-lg font-semibold text-ink">{product?.publicPrice == null ? "Consultar precio" : `$${product.publicPrice.toFixed(2)}`}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            );
          }
          return (
            <section key={section.id} className="section-y px-6">
              <div className="mx-auto max-w-6xl">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-700">{section.eyebrow}</p>
                <h2 className="mt-2 font-display text-3xl text-primary-900">{section.title}</h2>
                <p className="mt-4 text-ink-muted">{section.body}</p>
              </div>
            </section>
          );
        })}
    </>
  );
}

function SingleDraft({ draft }: { draft: DraftEnvelope }) {
  const payload = draft.payload ?? {};
  const image = assetUrl(payload.imageAssetId, draft.assets);
  if (draft.contentType === "location") {
    return (
      <section className="hero-glow px-6 py-16">
        <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-xl">
          {image && <img src={image} alt={payload.imageAlt || payload.name} className="mb-6 aspect-[16/9] w-full rounded-2xl object-cover" />}
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-700">Local</p>
          <h1 className="mt-4 font-display text-4xl text-primary-900">{payload.title || payload.name}</h1>
          <p className="mt-4 text-ink-muted">{payload.description}</p>
          <p className="mt-4 font-semibold text-ink">{payload.address}</p>
        </div>
      </section>
    );
  }
  if (draft.contentType === "course") {
    return (
      <section className="hero-glow px-6 py-16">
        <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-700">Formación</p>
            <h1 className="mt-4 font-display text-4xl text-primary-900">{payload.title}</h1>
            <p className="mt-6 text-lg text-ink-muted">{payload.intro}</p>
          </div>
          {image && <img src={image} alt={payload.imageAlt || payload.title} className="aspect-[16/10] rounded-3xl object-cover shadow-xl" />}
        </div>
      </section>
    );
  }
  if (draft.contentType === "page") {
    return (
      <section className="hero-glow px-6 py-16">
        <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-700">{payload.eyebrow || payload.slug}</p>
            <h1 className="mt-4 font-display text-4xl text-primary-900">{payload.title}</h1>
            <p className="mt-6 whitespace-pre-line text-lg text-ink-muted">{payload.body}</p>
            {payload.ctaLabel && <span className="mt-8 inline-flex rounded-full bg-primary-800 px-6 py-3 font-semibold text-white">{payload.ctaLabel}</span>}
          </div>
          {image && <img src={image} alt={payload.imageAlt || payload.title} className="aspect-[16/10] rounded-3xl object-cover shadow-xl" />}
        </div>
      </section>
    );
  }
  return (
    <section className="section-y px-6">
      <div className="mx-auto max-w-3xl text-center">
        {image && <img src={image} alt={payload.imageAlt || payload.title} className="mx-auto mb-8 aspect-square max-w-sm rounded-3xl object-contain shadow-xl" />}
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-700">Promoción</p>
        <h1 className="mt-4 font-display text-4xl text-primary-900">{payload.title}</h1>
        <p className="mt-4 text-ink-muted">{payload.body}</p>
      </div>
    </section>
  );
}

export default function OmviqaDraftPreview() {
  const [draft, setDraft] = useState<DraftEnvelope | null>(null);
  useEffect(() => setDraft(decodeDraft()), []);
  if (!draft) {
    return (
      <section className="px-6 py-20 text-center">
        <h1 className="font-display text-3xl text-primary-900">Vista previa no disponible</h1>
        <p className="mt-3 text-ink-muted">Vuelve a abrir la vista previa desde Omviqa.</p>
      </section>
    );
  }
  return draft.contentType === "home_section" ? <HomeDraft draft={draft} /> : <SingleDraft draft={draft} />;
}
