// Enumera el catalogo REAL completo (todas las categorias, todas las paginas --
// no solo la "primera pagina"/"destacados" que usa fetch-storefront-snapshot.ts)
// para darle a cada producto real una entrada en el sitemap.
//
// Por que hace falta un script aparte: las fichas de producto en vivo
// (src/pages/productos/[category]/p/[id]/[...slug].astro) son la UNICA ruta
// on-demand del sitio ("prerender = false" -- necesitan precio/stock frescos
// en cada visita, ver ese archivo). Al no generarse en el build, @astrojs/
// sitemap no las puede descubrir solo; hay que decirle explicitamente que
// URLs existen. Se hace en build-time (no en cada visita) para no agregarle
// al Worker una ruta mas que dependa de Omviqa estar arriba -- el sitio
// sigue siendo mayormente estatico (ver ALVA_2.0_PROPOSAL.md seccion F).
//
// Resiliencia: igual que fetch-storefront-snapshot.ts -- si Omviqa no
// responde, se conserva el archivo ya commiteado (last-known-good) en vez de
// dejar el sitemap sin estas URLs.
//
// Uso: node scripts/fetch-storefront-sitemap-urls.ts (parte de "npm run
// prebuild", ver package.json). astro.config.mjs lee el archivo que este
// script escribe.
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "src", "data");
const OUT_FILE = path.join(OUT_DIR, "storefront-sitemap-urls.json");

const API_URL = (process.env.PUBLIC_STOREFRONT_API_URL || "http://localhost:4000").replace(/\/+$/, "");
const CHANNEL_ID = process.env.PUBLIC_STOREFRONT_CHANNEL_ID || "";
const PAGE_LIMIT = 60; // maximo que acepta la API (ver /products?limit=...)
const FETCH_TIMEOUT_MS = 15_000;
const MAX_PAGES_PER_CATEGORY = 200; // salvavidas: ~12,000 productos por categoria, muy por encima de lo real

interface PublicCategorySummary {
  slug: string;
}

interface StorefrontProductListItem {
  publicProductId: string;
  slug: string;
}

interface ListProductsResult {
  items: StorefrontProductListItem[];
  hasMore: boolean;
}

async function fetchJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status} en ${url}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

async function main() {
  if (!CHANNEL_ID) {
    console.warn(
      "[storefront-sitemap-urls] PUBLIC_STOREFRONT_CHANNEL_ID no esta configurado -- se conserva el archivo existente (si lo hay) y se omite el fetch."
    );
    return;
  }

  const base = `${API_URL}/api/storefront/${CHANNEL_ID}`;
  let categories: PublicCategorySummary[];
  try {
    const data = await fetchJson<{ categories: PublicCategorySummary[] }>(`${base}/categories`);
    categories = data.categories;
  } catch (err) {
    console.warn(
      `[storefront-sitemap-urls] No se pudo obtener /categories de ${base} (${(err as Error).message}). ` +
        "Se conserva el archivo existente tal cual."
    );
    return;
  }

  const urls: string[] = [];
  let failures = 0;

  for (const category of categories) {
    let page = 1;
    let categoryTotal = 0;
    try {
      while (page <= MAX_PAGES_PER_CATEGORY) {
        const data = await fetchJson<ListProductsResult>(
          `${base}/products?category=${encodeURIComponent(category.slug)}&limit=${PAGE_LIMIT}&page=${page}`
        );
        for (const item of data.items) {
          urls.push(`/productos/${category.slug}/p/${item.publicProductId}/${item.slug}`);
        }
        categoryTotal += data.items.length;
        if (!data.hasMore) break;
        page += 1;
      }
    } catch (err) {
      failures += 1;
      console.warn(
        `[storefront-sitemap-urls] Fallo al paginar la categoria "${category.slug}" en la pagina ${page} (${(err as Error).message}). ` +
          `Se conservan las ${categoryTotal} URLs ya traidas de esa categoria antes del fallo.`
      );
    }
  }

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, JSON.stringify(urls, null, 2));

  console.log(
    `[storefront-sitemap-urls] Listo: ${urls.length} URLs de producto escritas en src/data/storefront-sitemap-urls.json` +
      (failures > 0 ? ` (${failures} categoria(s) fallaron a mitad de camino).` : ".")
  );
}

main().catch((err) => {
  console.warn(`[storefront-sitemap-urls] Error inesperado, se conserva el archivo existente: ${err.message}`);
});
