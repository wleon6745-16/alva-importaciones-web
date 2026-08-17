// Trae un snapshot en build-time del catalogo real (ASISTENTE Storefront API,
// ver ASISTENTE/docs/web-channel-phase513.md seccion K) y lo escribe como
// Content Collection en src/content/storefront/<categoria>.json.
//
// Por que en build time y no en cada visita: el sitio sigue 100% estatico
// (ver decision de Fase 2 -- ALVA_2.0_PROPOSAL.md seccion F, sin SSR/adapter
// nuevo). Este snapshot alimenta las paginas de categoria/Home (primera
// pagina, indexable). Paginacion profunda/filtro de marca/busqueda se
// resuelven aparte, en el navegador, llamando la misma API en vivo (ver
// src/components/CatalogExplorer.tsx) -- eso SI refleja el catalogo actual
// sin esperar a un rebuild.
//
// Resiliencia: si ASISTENTE no responde (caida temporal, o simplemente no
// hay ninguna instancia publica desplegada todavia -- ver nota en el reporte
// final de Fase 2), este script NO debe romper `npm run build`. Si el fetch
// falla, se deja el snapshot ya commiteado tal cual esta (last-known-good) en
// vez de borrarlo o dejar el sitio sin Home/categorias.
//
// Uso: node scripts/fetch-storefront-snapshot.ts  (se corre solo, o como
// parte de "npm run prebuild" -- ver package.json).
import { existsSync, mkdirSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "src", "content", "storefront");

const API_URL = (process.env.PUBLIC_STOREFRONT_API_URL || "http://localhost:4000").replace(/\/+$/, "");
const CHANNEL_ID = process.env.PUBLIC_STOREFRONT_CHANNEL_ID || "";
const FIRST_PAGE_LIMIT = 24;
const FETCH_TIMEOUT_MS = 15_000;

interface PublicCategorySummary {
  slug: string;
  label: string;
  description: string | null;
  imageUrl: string | null;
  featured: boolean;
  productCount: number;
}

interface PublicBrandSummary {
  name: string;
  count: number;
}

interface ListProductsResult {
  items: unknown[];
  page: number;
  limit: number;
  total: number;
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
      "[storefront-snapshot] PUBLIC_STOREFRONT_CHANNEL_ID no esta configurado -- se conserva el snapshot existente (si lo hay) y se omite el fetch."
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
      `[storefront-snapshot] No se pudo obtener /categories de ${base} (${(err as Error).message}). ` +
        "Se conserva el snapshot existente tal cual -- el build continua con datos previos, no se rompe la Home estatica."
    );
    return;
  }

  mkdirSync(OUT_DIR, { recursive: true });

  const fetchedAt = new Date().toISOString();
  const writtenSlugs = new Set<string>();
  let failures = 0;

  for (const category of categories) {
    try {
      const [brandsData, productsData] = await Promise.all([
        fetchJson<{ brands: PublicBrandSummary[] }>(`${base}/brands?category=${encodeURIComponent(category.slug)}`),
        fetchJson<ListProductsResult>(
          `${base}/products?category=${encodeURIComponent(category.slug)}&limit=${FIRST_PAGE_LIMIT}&page=1`
        ),
      ]);

      const snapshot = {
        categorySlug: category.slug,
        categoryLabel: category.label,
        description: category.description,
        featured: category.featured,
        productCount: category.productCount,
        brands: brandsData.brands,
        firstPage: productsData.items,
        firstPageTotal: productsData.total,
        fetchedAt,
      };

      writeFileSync(path.join(OUT_DIR, `${category.slug}.json`), JSON.stringify(snapshot, null, 2));
      writtenSlugs.add(category.slug);
    } catch (err) {
      failures += 1;
      console.warn(
        `[storefront-snapshot] Fallo al traer la categoria "${category.slug}" (${(err as Error).message}). ` +
          "Se conserva el archivo previo de esa categoria si existia."
      );
    }
  }

  // Categorias que YA NO estan habilitadas (o desaparecieron) en esta corrida se retiran del
  // snapshot -- si no, una categoria deshabilitada seguiria generando su pagina estatica
  // indefinidamente con datos viejos.
  if (existsSync(OUT_DIR)) {
    for (const file of readdirSync(OUT_DIR)) {
      if (!file.endsWith(".json")) continue;
      const slug = file.replace(/\.json$/, "");
      if (!categories.some((c) => c.slug === slug) && !writtenSlugs.has(slug)) {
        unlinkSync(path.join(OUT_DIR, file));
      }
    }
  }

  console.log(
    `[storefront-snapshot] Listo: ${writtenSlugs.size}/${categories.length} categorias actualizadas` +
      (failures > 0 ? ` (${failures} fallaron, se conservo su snapshot previo).` : ".")
  );
}

main().catch((err) => {
  console.warn(`[storefront-snapshot] Error inesperado, se conserva el snapshot existente: ${err.message}`);
});
