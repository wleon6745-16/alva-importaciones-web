// Genera src/data/products.generated.json a partir de un seed manual.
//
// Fuente actual (SEO-002, 2026-08-07): seed manual copiado del contenido ya publicado en
// src/pages/productos/muebles.astro, que a su vez viene del export de Telegram
// (messages.html / messages2.html) verificado en sesiones previas.
//
// NO hay conexión en vivo a la base de datos de ASISTENTE (tabla `products` en
// `assistant_sacc`) todavía. Se evaluó en esta sesión y se decidió no conectarse en vivo
// por ahora: requeriría exponer credenciales de Docker/Postgres en este repo público, y el
// build es estático (no hay backend en producción que pueda mantener esas credenciales fuera
// del bundle). Queda documentado como limitación conocida — ver docs/seo-work/DATA_CONFLICTS.md
// y docs/seo-work/NEXT_SESSION.md. Cuando se decida sincronizar en vivo, este archivo es el
// punto de reemplazo: cambiar `loadSeedProducts()` por una consulta de solo lectura, manteniendo
// el mismo saneamiento (sin costo, sin margen, sin datos de cliente).
//
// Uso: node scripts/sync-public-catalog.ts   (Node >=22.12 con soporte nativo de TypeScript)

import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Product, ProductCategoryGroup } from "../src/types/product.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUTPUT_PATH = path.join(ROOT, "src", "data", "products.generated.json");

interface SeedItem {
  name: string;
  price?: number;
  code?: string;
  features: string[];
  image: string;
}

interface SeedGroup {
  title: string;
  subcategory: string;
  items: SeedItem[];
}

const MUEBLES_CATEGORY = "muebles";

// Seed extraído de src/pages/productos/muebles.astro (25 productos ya publicados).
const MUEBLES_SEED: SeedGroup[] = [
  {
    title: "Camillas",
    subcategory: "camillas",
    items: [
      {
        name: "Camilla hidráulica multiusos",
        price: 155,
        code: "8833",
        features: ["Base metálica", "Autoportante", "Reposamanos", "Portátil"],
        image: "camilla-hidraulica-multiusos.jpg",
      },
      {
        name: "Camilla para lifting multiusos",
        price: 110,
        code: "8181",
        features: ["Portátil", "Autosoportante", "Base metálica"],
        image: "camilla-lifting-multiusos.jpg",
      },
      {
        name: "Camilla multiuso 3 niveles",
        price: 208,
        code: "9974",
        features: [
          "Niveles de inclinación ajustables",
          "Cubierta de fácil limpieza",
          "Cómoda y antideslizante",
          "Color negro",
        ],
        image: "camilla-3-niveles.jpg",
      },
    ],
  },
  {
    title: "Sillones y sillas de peluquería / barbería",
    subcategory: "sillones-y-sillas-de-peluqueria-barberia",
    items: [
      {
        name: "Sillón de peluquería ST-2202",
        price: 345,
        features: ["Base redonda", "Cuero de fácil limpieza", "Hidráulico", "Soporte para pies"],
        image: "sillon-peluqueria-1.jpg",
      },
      {
        name: "Sillón de peluquería ST-2215-1",
        price: 335,
        features: ["Soporte para brazos", "Cuero de fácil limpieza", "Base metálica", "Hidráulico"],
        image: "sillon-peluqueria-2.jpg",
      },
      {
        name: "Sillón de peluquería",
        price: 349,
        features: ["Reclinable", "Soporte para pies", "Hidráulico", "Reposamanos"],
        image: "sillon-peluqueria-3.jpg",
      },
      {
        name: "Sillón de peluquería",
        price: 359,
        features: ["Reclinable", "Hidráulico", "Base metálica", "Soporte de pies estático"],
        image: "sillon-peluqueria-4.jpg",
      },
      {
        name: "Sillón de peluquería",
        price: 279,
        features: ["Reclinable", "Base metálica", "Cubierta de cuero", "Soporte de pies estático"],
        image: "sillon-peluqueria-5.jpg",
      },
      {
        name: "Sillón de peluquería",
        price: 240,
        features: ["Diseño sencillo", "Reclinable", "Base metálica", "Acolchonado"],
        image: "sillon-peluqueria-6.jpg",
      },
      {
        name: "Sillón de peluquería ST-2009-1",
        price: 237,
        features: ["Reclinable", "Cubierta de cuero", "Base metálica", "Hidráulico"],
        image: "sillon-peluqueria-7.jpg",
      },
      {
        name: "Sillón lava cabeza",
        price: 365,
        features: ["Acolchonado", "Poza cabeza de cerámica", "Cubierta de cuero", "Diseño elegante"],
        image: "sillon-lava-cabeza.jpg",
      },
      {
        name: "Silla de barbería SILETI ST-2200",
        price: 295,
        code: "11002",
        features: ["Reclinable", "Altura ajustable (hidráulico)", "Acolchado premium", "Estructura resistente"],
        image: "silla-barberia-st2200.jpg",
      },
      {
        name: "Silla de barbería SILETI ST-2001",
        price: 230,
        code: "10362",
        features: ["Reclinable", "Sistema hidráulico", "Acolchado premium", "Reposapiés cómodo"],
        image: "silla-barberia-st2001.jpg",
      },
    ],
  },
  {
    title: "Butacas y sillas",
    subcategory: "butacas-y-sillas",
    items: [
      {
        name: "Butaca Francia",
        price: 99,
        code: "10399",
        features: ["Máximo confort y ergonomía", "Acabado elegante", "Base metálica"],
        image: "butaca-francia.jpg",
      },
      {
        name: "Silla concha para pedicure",
        price: 250,
        code: "10394",
        features: ["Set de pedicura", "Base resistente"],
        image: "silla-concha-pedicura.jpg",
      },
      {
        name: "Sillón Reina para pedicure",
        price: 350,
        code: "10393",
        features: ["Máximo confort y ergonomía", "Acabado elegante", "Recubierto en cuero"],
        image: "sillon-reina-pedicura.jpg",
      },
      {
        name: "Butaca Santander",
        price: 65,
        code: "10408",
        features: ["Acabado elegante"],
        image: "butaca-santander.jpg",
      },
      {
        name: "Butaca Style",
        price: 80,
        code: "10400",
        features: ["Máximo confort y ergonomía", "Acabado elegante", "Base metálica"],
        image: "butaca-style.jpg",
      },
      {
        name: "Silla Estela",
        price: 45,
        code: "10411",
        features: ["Acabado elegante"],
        image: "silla-estela.jpg",
      },
      {
        name: "Butaca Monet",
        price: 220,
        code: "10404",
        features: ["Cómoda y elegante", "Base ultra resistente", "Fácil limpieza"],
        image: "butaca-monet.jpg",
      },
      {
        name: "Silla amoblada hidráulica",
        price: 48,
        code: "10171",
        features: ["Giratoria", "Altura ajustable", "Disponible en varios colores"],
        image: "silla-amoblada-hidraulica.jpg",
      },
    ],
  },
  {
    title: "Mesas de trabajo",
    subcategory: "mesas-de-trabajo",
    items: [
      {
        name: "Set mesa + silla concha para manicura",
        price: 350,
        code: "10392",
        features: ["Organizador de esmaltes doble", "Dos cajones + espacio amplio", "Reposamanos + puff de espera"],
        image: "mesa-silla-concha-manicura.jpg",
      },
    ],
  },
  {
    title: "Equipo y accesorios de salón",
    subcategory: "equipo-y-accesorios-de-salon",
    items: [
      {
        name: "Carrito auxiliar multiuso",
        price: 17.5,
        code: "11842",
        features: ["3 niveles", "Bandejas de malla", "Ruedas giratorias 360°", "Estructura de acero"],
        image: "carrito-auxiliar.jpg",
      },
      {
        name: "Lavacabezas SILETI ST-3000-1",
        features: ["Reclinable", "Lavabo profundo de diseño anatómico", "Acolchado premium"],
        image: "lavacabezas-st3000.jpg",
      },
      {
        name: "Tina spa eléctrica",
        price: 36,
        code: "8248",
        features: ["Masaje relajante con rodillos", "Hidromasaje", "Uso profesional en salón"],
        image: "tina-spa-electrica.jpg",
      },
    ],
  },
];

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Sufijo estable extraído del nombre de archivo de imagen (p. ej. "sillon-peluqueria-4.jpg" -> "4"). */
function imageOrdinal(image: string): string | null {
  const match = image.match(/-(\d+)\.[a-z0-9]+$/i);
  return match ? match[1] : null;
}

function buildSlug(baseSlug: string, item: SeedItem, usedSlugs: Set<string>): string {
  if (!usedSlugs.has(baseSlug)) return baseSlug;

  const withCode = item.code ? `${baseSlug}-${item.code}` : null;
  if (withCode && !usedSlugs.has(withCode)) return withCode;

  const ordinal = imageOrdinal(item.image);
  const withOrdinal = ordinal ? `${baseSlug}-${ordinal}` : null;
  if (withOrdinal && !usedSlugs.has(withOrdinal)) return withOrdinal;

  let n = 2;
  while (usedSlugs.has(`${baseSlug}-${n}`)) n++;
  return `${baseSlug}-${n}`;
}

function toProducts(category: string, groups: SeedGroup[]): Product[] {
  const usedSlugs = new Set<string>();
  const usedIds = new Set<string>();
  const products: Product[] = [];

  for (const group of groups) {
    for (const item of group.items) {
      const baseSlug = slugify(item.name);
      const slug = buildSlug(baseSlug, item, usedSlugs);
      usedSlugs.add(slug);

      const id = `${category}-${slug}`;
      if (usedIds.has(id)) {
        throw new Error(`ID duplicado generado: ${id}`);
      }
      usedIds.add(id);

      products.push({
        id,
        slug,
        name: item.name,
        category,
        subcategory: group.subcategory,
        code: item.code,
        price: item.price,
        currency: item.price !== undefined ? "USD" : undefined,
        brand: undefined,
        features: item.features,
        image: item.image,
        imageAlt: item.name,
      });
    }
  }

  return products;
}

const FORBIDDEN_KEYS = ["cost", "costo", "margen", "margin", "cliente", "customer", "token", "password", "secret"];

function assertSanitized(products: Product[]) {
  for (const product of products) {
    for (const key of Object.keys(product)) {
      if (FORBIDDEN_KEYS.some((forbidden) => key.toLowerCase().includes(forbidden))) {
        throw new Error(`Campo no permitido "${key}" encontrado en producto ${product.id}`);
      }
    }
  }

  const slugs = new Set<string>();
  const ids = new Set<string>();
  for (const product of products) {
    if (slugs.has(product.slug)) throw new Error(`Slug duplicado: ${product.slug}`);
    if (ids.has(product.id)) throw new Error(`ID duplicado: ${product.id}`);
    slugs.add(product.slug);
    ids.add(product.id);
    if (!product.name) throw new Error(`Producto sin nombre: ${product.id}`);
  }
}

function main() {
  const products = toProducts(MUEBLES_CATEGORY, MUEBLES_SEED);
  assertSanitized(products);

  const output = {
    generatedAt: new Date().toISOString(),
    source: "manual-seed:scripts/sync-public-catalog.ts (migrado desde muebles.astro, 2026-08-07)",
    products,
  };

  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2) + "\n", "utf-8");
  console.log(`Escrito ${products.length} productos en ${path.relative(ROOT, OUTPUT_PATH)}`);
}

main();
