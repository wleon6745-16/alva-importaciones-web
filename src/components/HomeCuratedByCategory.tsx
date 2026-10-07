import { useState } from "react";
import CategoryHighlights, { type HighlightProduct } from "./CategoryHighlights";
import "../styles/home-curated.css";

// Inicio: las fotos curadas del canal de Telegram de ALVA, cada una dentro de SU categoria.
//
// "Productos nuevos" solo guarda las ultimas novedades y las viejas salen de ahi; estas
// fotos, en cambio, son la imagen publica del producto y se quedan. Cada pestana reutiliza
// CategoryHighlights: el HTML trae las del momento del build y el navegador las refresca al
// abrir la pestana, asi una foto nueva del canal aparece en su categoria sin recompilar.

export interface CuratedCategory {
  slug: string;
  label: string;
  items: HighlightProduct[];
}

interface Props {
  apiBaseUrl: string;
  categories: CuratedCategory[];
}

export default function HomeCuratedByCategory({ apiBaseUrl, categories }: Props) {
  const [active, setActive] = useState(categories[0]?.slug ?? "");
  const current = categories.find((c) => c.slug === active) ?? categories[0];
  if (!current) return null;

  return (
    <div className="hc-root">
      <div className="hc-bar">
        <p className="hc-eyebrow">Fotos de nuestro catálogo</p>
        <div className="hc-tabs" role="tablist" aria-label="Elige una categoría">
          {categories.map((c) => (
            <button
              key={c.slug}
              type="button"
              role="tab"
              id={`hc-tab-${c.slug}`}
              aria-selected={c.slug === current.slug}
              aria-controls="hc-panel"
              className={`hc-tab${c.slug === current.slug ? " hc-tab-on" : ""}`}
              onClick={() => setActive(c.slug)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div id="hc-panel" role="tabpanel" aria-labelledby={`hc-tab-${current.slug}`}>
        <CategoryHighlights
          key={current.slug}
          apiBaseUrl={apiBaseUrl}
          categorySlug={current.slug}
          categoryLabel={current.label}
          initialItems={current.items}
        />
        <div className="hc-more">
          <a href={`/productos/${current.slug}`} className="hc-more-link">
            Ver todo en {current.label} →
          </a>
        </div>
      </div>
    </div>
  );
}
