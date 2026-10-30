import { useEffect, useState } from "react";
import { getOmviqaHomePreview, type OmviqaHomeResponse } from "../lib/omviqa-home";
import { storefrontApiUrl } from "../lib/storefront-config";
import heroImageUrl from "../assets/products/muebles/cat-muebles.jpeg?url";
import categoryMueblesUrl from "../assets/products/muebles/cat-muebles.jpeg?url";
import categoryUnasUrl from "../assets/products/unas/cat-unas.jpeg?url";
import categoryMaquillajeUrl from "../assets/products/maquillaje/cat-maquillaje.jpeg?url";
import categoryCapilaresUrl from "../assets/products/capilares/cat-capilares.jpeg?url";
import categoryFacialUrl from "../assets/products/facial/cat-facial.jpeg?url";
import categoryAccesoriosUrl from "../assets/products/accesorios/cat-accesorios.jpeg?url";

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

function previewToken(): string | null {
  return new URLSearchParams(window.location.search).get("preview");
}

function previewSection(): string | null {
  return new URLSearchParams(window.location.search).get("section");
}

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

function publicImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  const base = storefrontApiUrl.replace(/\/+$/, "");
  return url.startsWith("/") ? `${base}${url}` : `${base}/${url}`;
}

const categoryFallbackImages: Record<string, string> = {
  muebles: categoryMueblesUrl,
  unas: categoryUnasUrl,
  maquillaje: categoryMaquillajeUrl,
  capilares: categoryCapilaresUrl,
  facial: categoryFacialUrl,
  accesorios: categoryAccesoriosUrl,
};

function ButtonLike({ label }: { label?: string }) {
  return label ? <span className="inline-flex rounded-full bg-primary-800 px-6 py-3 font-semibold text-white">{label}</span> : null;
}

function text(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function EmptyBlock({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="mx-auto max-w-3xl rounded-3xl border-2 border-dashed border-blush-200 bg-blush-50/70 px-6 py-10 text-center">
      <p className="font-display text-2xl text-primary-900">{title}</p>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-ink-muted">{detail}</p>
    </div>
  );
}

function FocusBadge() {
  return (
    <span className="pointer-events-none absolute right-4 top-4 z-10 rounded-full bg-blush-500 px-3 py-1 text-xs font-semibold text-white shadow-lg">
      Editando aqui
    </span>
  );
}

function ctaLabel(cta: any): string | undefined {
  return typeof cta?.label === "string" ? cta.label : undefined;
}

function sectionFallback(section: Record<string, any>) {
  if (section.type === "promo") {
    return {
      eyebrow: "Promociones",
      title: "Promociones y combos",
      body: "Beneficios pensados para equipar y abastecer tu salon. Las promociones se renuevan con frecuencia: siguenos por WhatsApp para enterarte primero.",
      cta: "Seguir canal de WhatsApp",
    };
  }
  if (section.type === "course") {
    return {
      eyebrow: "Curso profesional",
      title: "Quieres vivir de las unas?",
      body: "Ademas de vender los insumos, formamos a la proxima generacion de nail artists en Portoviejo con nuestro curso profesional.",
      cta: "Conoce el curso",
    };
  }
  if (section.type === "assistantDemo") {
    return {
      eyebrow: "Asistente por WhatsApp",
      title: "Respuestas al instante, con precio y stock reales",
      body: "Creamos un asistente de inteligencia artificial que responde tus consultas de WhatsApp en segundos: precios actualizados, disponibilidad real y sugerencias si un producto se agoto. Cuando hace falta, una asesora toma la conversacion.",
      cta: "Pruebalo por WhatsApp",
    };
  }
  return {
    eyebrow: "ALVA",
    title: "Titulo pendiente",
    body: "Completa el texto de esta seccion en Omviqa.",
    cta: "Boton de accion",
  };
}

function HomeDraft({ draft, home: homeFromToken }: { draft?: DraftEnvelope; home?: OmviqaHomeResponse }) {
  const home = homeFromToken ?? draft?.home;
  const activeSection = previewSection();
  useEffect(() => {
    if (!activeSection) return;
    const scrollToActiveSection = () => {
      document.querySelector(`[data-preview-section="${activeSection}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    window.requestAnimationFrame(scrollToActiveSection);
    const retryAfterLayout = window.setTimeout(scrollToActiveSection, 250);
    const retryAfterImages = window.setTimeout(scrollToActiveSection, 800);
    return () => {
      window.clearTimeout(retryAfterLayout);
      window.clearTimeout(retryAfterImages);
    };
  }, [activeSection, home]);
  if (!home) return null;
  const categories = new Map(home.categories.map((item) => [item.slug, item]));
  const products = new Map(home.products.map((item) => [item.publicProductId, item]));
  const sectionClass = (section: Record<string, any>, base: string) =>
    `relative ${base} scroll-mt-24 ${activeSection === section.id ? "outline outline-[4px] outline-offset-[-4px] outline-blush-500" : ""}`;
  const isActive = (section: Record<string, any>) => activeSection === section.id;
  return (
    <>
      {home.payload.sections
        .filter((section) => section.enabled !== false)
        .sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0))
        .map((section) => {
          const image = assetUrl(section.imageAssetId, home.assets);
          if (section.type === "hero") {
            const heroImage = image ?? heroImageUrl;
            return (
              <section key={section.id} data-preview-section={section.id} className={sectionClass(section, "relative overflow-hidden bg-primary-900")}>
                {isActive(section) && <FocusBadge />}
                <div className="mx-auto grid max-w-6xl items-center gap-16 px-6 py-20 lg:grid-cols-[1.05fr_1fr] lg:py-32">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blush-100">{text(section.eyebrow, "Belleza Perfecta")}</p>
                    <h1 className="mt-5 font-display text-5xl text-white">{text(section.title, "Titulo principal del Home")}</h1>
                    <p className="mt-6 max-w-lg text-lg text-white/80">{text(section.body, "Describe aqui que vende ALVA y como comprar por WhatsApp.")}</p>
                    <div className="mt-8 flex flex-wrap gap-4">
                      <ButtonLike label={section.primaryCta?.label} />
                      {section.secondaryCta?.label && <span className="inline-flex rounded-full border-2 border-white px-6 py-3 font-semibold text-white">{section.secondaryCta.label}</span>}
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-[1.75rem] shadow-2xl">
                    <img src={heroImage} alt={section.imageAlt || section.title} className="aspect-[4/5] w-full object-cover" />
                  </div>
                </div>
              </section>
            );
          }
          if (section.type === "categories") {
            return (
              <section key={section.id} data-preview-section={section.id} className={sectionClass(section, "section-y px-6")}>
                {isActive(section) && <FocusBadge />}
                <div className="mx-auto max-w-6xl text-center">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-700">{text(section.eyebrow, "Compra por categoria")}</p>
                  <h2 className="mt-2 font-display text-4xl text-primary-900">{text(section.title, "Categorias principales")}</h2>
                  <p className="mx-auto mt-3 max-w-2xl text-ink-muted">{text(section.body, "Selecciona las categorias publicas que quieres mostrar en este mosaico.")}</p>
                  <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {(section.categorySlugs ?? []).length > 0
                      ? (section.categorySlugs ?? []).map((slug: string) => {
                          const card = Array.isArray(section.categoryCards) ? section.categoryCards.find((item: any) => item.slug === slug) : null;
                          const categoryImage = assetUrl(card?.imageAssetId, home.assets) ?? categoryFallbackImages[slug];
                          return (
                          <div key={slug} className="group overflow-hidden rounded-3xl bg-primary-900 text-left text-white shadow-lg">
                            <div className="aspect-[4/3] overflow-hidden bg-blush-50">
                              {categoryImage && <img src={categoryImage} alt={card?.imageAlt || categories.get(slug)?.label || slug} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />}
                            </div>
                            <div className="p-6">
                              <h3 className="font-display text-2xl">{categories.get(slug)?.label ?? slug}</h3>
                              <span className="mt-4 inline-flex text-sm font-semibold">Ver mas →</span>
                            </div>
                          </div>
                          );
                        })
                      : <div className="sm:col-span-2 lg:col-span-3"><EmptyBlock title="Categorias pendientes" detail="Esta seccion esta activa, pero aun no tiene categorias seleccionadas en Omviqa." /></div>}
                  </div>
                </div>
              </section>
            );
          }
          if (section.type === "featuredProducts") {
            return (
              <section key={section.id} data-preview-section={section.id} className={sectionClass(section, "section-y bg-blush-50 px-6")}>
                {isActive(section) && <FocusBadge />}
                <div className="mx-auto max-w-6xl text-center">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-700">{text(section.eyebrow, "Productos destacados")}</p>
                  <h2 className="mt-2 font-display text-3xl text-primary-900">{text(section.title, "Productos elegidos")}</h2>
                  <div className="mt-12 grid gap-6 sm:grid-cols-3">
                    {(section.productIds ?? []).length > 0 ? (section.productIds ?? []).map((id: string) => {
                      const product = products.get(id);
                      const productImage = publicImageUrl(product?.imageUrl);
                      return (
                        <div key={id} className="glass-card overflow-hidden rounded-2xl text-left shadow-md">
                          <div className="flex aspect-square items-center justify-center bg-white">
                            {productImage ? <img src={productImage} alt={product?.name ?? "Producto destacado"} className="h-full w-full object-contain p-3" /> : <span className="text-xs text-ink-muted">Sin foto</span>}
                          </div>
                          <div className="p-5">
                            <p className="font-display text-lg text-primary-800">{product?.name ?? "Producto seleccionado"}</p>
                            <p className="text-lg font-semibold text-ink">{product?.publicPrice == null ? "Consultar precio" : `$${product.publicPrice.toFixed(2)}`}</p>
                          </div>
                        </div>
                      );
                    }) : <div className="sm:col-span-3"><EmptyBlock title="Productos pendientes" detail="Elige productos destacados desde el editor para llenar este bloque." /></div>}
                  </div>
                </div>
              </section>
            );
          }
          if (section.type === "newProducts") {
            return (
              <section key={section.id} data-preview-section={section.id} className={sectionClass(section, "section-y px-6")}>
                {isActive(section) && <FocusBadge />}
                <div className="mx-auto max-w-6xl text-center">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-700">{text(section.eyebrow, "Recien llegados")}</p>
                  <h2 className="mt-2 font-display text-3xl text-primary-900">{text(section.title, "Productos nuevos")}</h2>
                  <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: Math.min(Number(section.limit ?? 8), 4) }, (_, index) => (
                      <div key={index} className="flex aspect-[4/5] items-center justify-center rounded-2xl bg-blush-50 p-4 text-sm text-ink-muted">
                        Foto de Telegram
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );
          }
          if (section.type === "featureStrip") {
            const items = Array.isArray(section.items) ? section.items : [];
            return (
              <section key={section.id} data-preview-section={section.id} className={sectionClass(section, "bg-primary-900 px-6 py-10 text-white")}>
                {isActive(section) && <FocusBadge />}
                <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {items.length > 0
                    ? items.map((item: any, index: number) => (
                        <div key={`${item.title ?? "beneficio"}-${index}`} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                          <h3 className="font-display text-lg">{text(item.title, "Beneficio")}</h3>
                          {item.detail && <p className="mt-2 text-sm text-white/75">{item.detail}</p>}
                        </div>
                      ))
                    : <div className="sm:col-span-2 lg:col-span-4"><EmptyBlock title="Beneficios pendientes" detail="Agrega beneficios como WhatsApp, stock real, envio o pago seguro." /></div>}
                </div>
              </section>
            );
          }
          if (section.type === "promo" || section.type === "course" || section.type === "assistantDemo") {
            const fallback = sectionFallback(section);
            return (
              <section key={section.id} data-preview-section={section.id} className={sectionClass(section, "section-y px-6")}>
                {isActive(section) && <FocusBadge />}
                <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-700">{text(section.eyebrow, fallback.eyebrow)}</p>
                    <h2 className="mt-4 font-display text-3xl text-primary-900">{text(section.title, fallback.title)}</h2>
                    <p className="mt-5 text-ink-muted">{text(section.body, fallback.body)}</p>
                    <div className="mt-8"><ButtonLike label={ctaLabel(section.cta) ?? fallback.cta} /></div>
                  </div>
                  {image && <img src={image} alt={section.imageAlt || section.title} className="aspect-[16/10] w-full rounded-3xl object-cover shadow-xl" />}
                </div>
              </section>
            );
          }
          if (section.type === "cta") {
            return (
              <section key={section.id} data-preview-section={section.id} className={sectionClass(section, "bg-primary-900 px-6 py-20 text-center text-white")}>
                {isActive(section) && <FocusBadge />}
                <h2 className="font-display text-3xl">{text(section.title, "Cierre pendiente")}</h2>
                <p className="mx-auto mt-4 max-w-2xl text-blush-100/90">{text(section.body, "Completa la invitacion final del Home.")}</p>
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <ButtonLike label={ctaLabel(section.primaryCta)} />
                  {ctaLabel(section.secondaryCta) && <span className="inline-flex rounded-full border-2 border-white px-6 py-3 font-semibold text-white">{ctaLabel(section.secondaryCta)}</span>}
                </div>
              </section>
            );
          }
          return (
            <section key={section.id} data-preview-section={section.id} className={sectionClass(section, "section-y px-6")}>
              {isActive(section) && <FocusBadge />}
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
  const [homePreview, setHomePreview] = useState<OmviqaHomeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = previewToken();
    if (token) {
      setLoading(true);
      getOmviqaHomePreview(token)
        .then((home) => {
          setHomePreview(home);
          setError(null);
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : "La vista previa no esta disponible.");
        })
        .finally(() => setLoading(false));
      return;
    }
    setDraft(decodeDraft());
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <section className="px-6 py-20 text-center">
        <h1 className="font-display text-3xl text-primary-900">Cargando vista previa</h1>
        <p className="mt-3 text-ink-muted">Estamos preparando el borrador autorizado.</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="px-6 py-20 text-center">
        <h1 className="font-display text-3xl text-primary-900">Vista previa no disponible</h1>
        <p className="mx-auto mt-3 max-w-xl text-ink-muted">{error}</p>
      </section>
    );
  }

  if (homePreview) return <HomeDraft home={homePreview} />;

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
