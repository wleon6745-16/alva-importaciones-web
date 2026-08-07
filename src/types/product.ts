// Tipo público de producto para el catálogo del sitio.
//
// Deliberadamente NO incluye: costo, margen, proveedor, datos de cliente,
// credenciales ni ningún campo interno de SACC/ASISTENTE. Solo lo que es
// seguro y útil mostrar en una página pública indexable.
export interface Product {
  /** Identificador estable, único en todo el catálogo. No cambia aunque cambien precio o nombre. */
  id: string;
  /** Slug único y estable usado en la URL (/productos/muebles/[slug]/). */
  slug: string;
  name: string;
  category: string;
  subcategory?: string;
  /** Código de producto del negocio (SACC/Telegram), cuando se conoce. No es un dato sensible. */
  code?: string;
  /** Precio de venta público. Ausente cuando no hay un precio confiable conocido. */
  price?: number;
  currency?: "USD";
  brand?: string;
  features: string[];
  /** Nombre de archivo dentro de src/assets/products/<category>/, no una ruta completa. */
  image: string;
  imageAlt: string;
}

export interface ProductCategoryGroup {
  title: string;
  slug: string;
  items: Product[];
}
