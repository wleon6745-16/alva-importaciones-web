import { useState, type FormEvent } from "react";
import "../styles/category-search.css";

// Buscador de la categoria, arriba de la pagina.
//
// El buscador real vive en el explorador del catalogo (CatalogExplorer), mucho mas abajo, despues
// de los destacados y las subcategorias. Este lo trae a la vista: escribe aqui, la pagina baja al
// catalogo y ya filtrado. El explorador de abajo sigue igual (con su filtro por marca).
//
// El explorador se hidrata al llegar a la vista; si el evento sale antes de que exista, la
// busqueda queda en una bandera de `window` que el explorador lee al montarse.

const TARGET_ID = "catalogo";

export default function CategorySearchBar({ categoryLabel }: { categorySlug: string; categoryLabel: string }) {
  const [query, setQuery] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    const w = window as unknown as { __alvaCatalogSearch?: string };
    w.__alvaCatalogSearch = q;
    window.dispatchEvent(new CustomEvent("alva:catalog-search", { detail: { query: q } }));
    const target = document.getElementById(TARGET_ID);
    if (target) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
  }

  return (
    <section className="cs-wrap" aria-label={`Buscar en ${categoryLabel}`}>
      <form className="cs-form" role="search" onSubmit={submit}>
        <label className="cs-sr" htmlFor="cs-input">
          Buscar producto en {categoryLabel}
        </label>
        <svg className="cs-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          id="cs-input"
          className="cs-input"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Buscar en ${categoryLabel}…`}
          autoComplete="off"
        />
        <button type="submit" className="cs-btn">
          Buscar
        </button>
      </form>
      <p className="cs-hint">
        Escribe el nombre, la marca o el código del producto.{" "}
        <a href={`#${TARGET_ID}`} className="cs-link">
          Ir al catálogo completo ↓
        </a>
      </p>
    </section>
  );
}
