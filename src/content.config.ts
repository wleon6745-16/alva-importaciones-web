// Colecciones de contenido editables sin tocar código (vía un CMS externo conectado al repo de
// GitHub — ver docs/CONTENT_WORKFLOW.md §6 para cuál y cómo). Cada producto/promoción vive en su
// propio archivo JSON dentro de src/content/.
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const products = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/products" }),
  schema: z.object({
    slug: z.string(),
    name: z.string(),
    category: z.enum(["muebles", "unas", "capilares", "maquillaje"]),
    subcategory: z.string().optional(),
    code: z.string().optional(),
    price: z.number().optional(),
    currency: z.literal("USD").optional(),
    brand: z.string().optional(),
    features: z.array(z.string()).default([]),
    // Nombre de archivo dentro de src/assets/products/<category>/ (no una ruta completa).
    image: z.string(),
    imageAlt: z.string(),
  }),
});

const promos = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/promos" }),
  schema: z.object({
    label: z.string(),
    body: z.string(),
    // category + image = misma convención que products, para reusar el resolver de imágenes.
    imageCategory: z.enum(["muebles", "unas", "capilares", "maquillaje"]),
    image: z.string(),
    imageAlt: z.string(),
    order: z.number().default(0),
  }),
});

const cursos = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/cursos" }),
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    description: z.string(),
    intro: z.string(),
    highlights: z.array(z.object({ label: z.string(), value: z.string() })),
    ctaLabel: z.string().default("Reservar mi cupo"),
    ctaMessage: z.string(),
  }),
});

const guias = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/guias" }),
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    description: z.string(),
    intro: z.string(),
    // Texto corto para la tarjeta en /guias — distinto del `intro` (más largo, va en la propia
    // página de la guía).
    listSummary: z.string(),
    datePublished: z.string(),
    faqs: z.array(z.object({ question: z.string(), answer: z.string() })).default([]),
    // Slugs exactos de src/content/products/**/*.json (cualquier categoría) a mostrar como
    // "modelos relacionados" al final de la guía. Opcional — no todas las guías tienen.
    relatedProductSlugs: z.array(z.string()).default([]),
    relatedProductsHeading: z.string().default("Modelos disponibles"),
    ctaMessage: z.string(),
  }),
});

// Snapshot en build-time del catalogo real (ASISTENTE Storefront API), un
// archivo por categoria -- ver scripts/fetch-storefront-snapshot.ts. Datos
// generados, no editados a mano. Independiente de la coleccion "products"
// (catalogo curado): esta trae el catalogo completo real de SACC, aquella
// trae los 74 productos curados con foto/descripcion editorial.
const publicCategoryRef = z.object({ slug: z.string(), label: z.string() }).nullable();

const storefrontProduct = z.object({
  publicProductId: z.string(),
  code: z.string().nullable(),
  name: z.string(),
  slug: z.string(),
  category: publicCategoryRef,
  subcategory: z.string().nullable(),
  brand: z.string().nullable(),
  publicPrice: z.number().nullable(),
  currency: z.literal("USD"),
  imageUrl: z.string().nullable(),
  shortDescription: z.string().nullable(),
});

const storefrontCatalog = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/storefront" }),
  schema: z.object({
    categorySlug: z.string(),
    categoryLabel: z.string(),
    description: z.string().nullable(),
    featured: z.boolean(),
    productCount: z.number(),
    brands: z.array(z.object({ name: z.string(), count: z.number() })),
    firstPage: z.array(storefrontProduct),
    firstPageTotal: z.number(),
    fetchedAt: z.string(),
  }),
});

export const collections = { products, promos, cursos, guias, storefrontCatalog };
