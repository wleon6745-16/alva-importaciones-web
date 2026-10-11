// Todas las categorias que el visitante puede abrir, para el menu y el Inicio.
//
// lib/categories.ts guarda las categorias "curadas" (con foto editorial y texto propio). Pero la
// tienda tiene mas categorias reales -- Barberia, Corporal, Lifting -- que tienen pagina propia
// (/productos/<slug>, generada desde la instantanea del catalogo) y no aparecian en el menu: el
// visitante solo podia llegar a ellas escribiendo la direccion. Aqui se juntan las dos fuentes,
// sin inventar fotos ni descripciones: una categoria sin texto editorial va solo con su nombre.
import { getCollection } from "astro:content";
import { categories } from "./categories";

export interface NavCategory {
  slug: string;
  /** Nombre corto, para el menu. */
  label: string;
  description: string | null;
  href: string;
  /** true si es una de las curadas de lib/categories.ts. */
  curated: boolean;
}

export async function getNavCategories(): Promise<NavCategory[]> {
  const curated: NavCategory[] = categories.map((c) => ({
    slug: c.slug,
    label: c.shortLabel,
    description: c.description,
    href: c.href,
    curated: true,
  }));
  const known = new Set<string>(curated.map((c) => c.slug));

  const entries = await getCollection("storefrontCatalog");
  const extras: NavCategory[] = entries
    .filter((entry) => !known.has(entry.data.categorySlug))
    .map((entry) => ({
      slug: entry.data.categorySlug,
      label: entry.data.categoryLabel,
      description: null,
      href: `/productos/${entry.data.categorySlug}`,
      curated: false,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, "es"));

  return [...curated, ...extras];
}
