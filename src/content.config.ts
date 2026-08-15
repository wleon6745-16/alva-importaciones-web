// Colecciones de contenido editables desde Decap CMS (panel en /admin) sin tocar código.
// Cada producto/promoción vive en su propio archivo JSON dentro de src/content/. Ver
// docs/CONTENT_WORKFLOW.md para el flujo completo de edición.
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

export const collections = { products, promos };
