// Wrapper sobre la Content Collection "products" (src/content/products/) que reconstruye el
// mismo shape que usaba antes products.generated.json — así el resto de páginas casi no cambia
// al migrar de un JSON generado a archivos de contenido editables desde /admin (Decap CMS).
import { getCollection } from "astro:content";
import type { Product } from "../types/product";

export async function getAllProducts(): Promise<Product[]> {
  const entries = await getCollection("products");
  return entries.map((entry) => ({
    id: `${entry.data.category}-${entry.data.slug}`,
    ...entry.data,
  }));
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const all = await getAllProducts();
  return all.filter((p) => p.category === category);
}
