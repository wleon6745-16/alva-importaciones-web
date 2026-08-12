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
  brand?: string;
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
        // Código añadido en la segunda pasada de calidad: DATA_CONFLICTS.md CONFLICT-003 ya
        // había identificado COD:11004 para este mismo modelo (messages2.html, 29-06-2026,
        // "Sillón de barbería SILETI ST-2202") como resolución opcional pendiente. Se confirma
        // ahora porque la foto de catálogo indexada bajo ese mismo código (ASISTENTE/backend/
        // assets/furniture-catalog/11004.jpeg) es visualmente el mismo sillón que la foto de
        // Telegram ya publicada para este producto.
        code: "11004",
        brand: "SILETI",
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

// Seed de SEO-012: curado a mano desde el export de Telegram (messages.html/messages2.html),
// cruzando cada mensaje con su foto real adjunta (mismo mensaje = mismo producto = misma foto,
// nunca una foto de otro mensaje). Solo se publican productos con nombre identificable, precio,
// foto real y — cuando la fuente lo trae — código y marca. No es el catálogo completo del canal
// (hay cientos de publicaciones más sin curar, ver reports/telegram-data-candidates.md); es una
// primera selección representativa por categoría, ampliable en una sesión futura con el mismo
// proceso.
const UNAS_CATEGORY = "unas";
const UNAS_SEED: SeedGroup[] = [
  {
    title: "Acrílicos y monómeros",
    subcategory: "acrilicos-y-monomeros",
    items: [
      {
        name: "Polvo acrílico Master Nails",
        price: 4.0,
        brand: "Master Nails",
        features: ["Gran variedad de colores"],
        image: "polvo-acrilico-master-nails.jpg",
      },
      {
        name: "Primer Master Nails 2 en 1",
        price: 8.7,
        brand: "Master Nails",
        features: ["2 en 1", "Presentación 15ml"],
        image: "primer-master-nails-2en1.jpg",
      },
      {
        name: "Monómero Master Nails 16 OZ",
        price: 32.75,
        brand: "Master Nails",
        features: ["Presentación 16 oz", "Disponible también en 8, 4, 2 y 1 oz"],
        image: "monomero-master-nails-16oz.jpg",
      },
      {
        name: "Monómero E&A 1000 ml",
        price: 9.5,
        brand: "E&A",
        features: ["Presentación 1000 ml"],
        image: "monomero-ea-1000ml.jpg",
      },
    ],
  },
  {
    title: "Esmaltes",
    subcategory: "esmaltes",
    items: [
      {
        name: "Esmalte Gelux Mía Secret",
        price: 11.25,
        brand: "Mía Secret",
        features: [],
        image: "esmalte-gelux-mia-secret.jpg",
      },
      {
        name: "Cover Master Nails 1oz",
        price: 8.2,
        brand: "Master Nails",
        features: ["Gran variedad de colores", "Presentación 1 oz"],
        image: "cover-master-nails-1oz.jpg",
      },
      {
        name: "Esmalte Rodher varios colores",
        price: 2.0,
        brand: "Rodher",
        features: [],
        image: "esmalte-rodher-varios-colores.jpg",
      },
    ],
  },
  {
    title: "Herramientas y equipo",
    subcategory: "herramientas-y-equipo",
    items: [
      {
        name: "Broca Umbrella pequeña Master Nails",
        price: 5.0,
        brand: "Master Nails",
        features: [],
        image: "broca-umbrella-pequena-master-nails.jpg",
      },
      {
        name: "Broca Umbrella mediana Master Nails",
        price: 5.0,
        brand: "Master Nails",
        features: [],
        image: "broca-umbrella-mediana-master-nails.jpg",
      },
      {
        name: "Limas lavables ZZAM",
        price: 1.75,
        brand: "ZZAM",
        features: ["Grano 100/180", "Grano 120/180", "Grano 180/220"],
        image: "limas-lavables-zzam.jpg",
      },
      {
        name: "Lámpara de uñas SUN D7 208W",
        price: 26.0,
        code: "4877",
        features: ["208W"],
        image: "lampara-unas-sun-d7-208w.jpg",
      },
      {
        name: "Lámpara de uñas media luna",
        price: 83.0,
        features: [],
        image: "lampara-unas-media-luna.jpg",
      },
      {
        name: "Drill inalámbrico Master Nails 35.000 RPM",
        price: 145.0,
        code: "7016",
        brand: "Master Nails",
        features: ["35.000 RPM", "60W"],
        image: "drill-inalambrico-master-nails.jpg",
      },
      {
        name: "Drill inalámbrico Enjoy Nail 35.000 RPM",
        price: 50.0,
        code: "6309",
        brand: "Enjoy Nail",
        features: ["35.000 RPM"],
        image: "drill-inalambrico-enjoy-nail.jpg",
      },
      {
        name: "Tijera para cutícula Staleks Pro",
        price: 19.5,
        code: "7828",
        brand: "Staleks Pro",
        features: [],
        image: "tijera-cuticula-staleks-pro-7828.jpg",
      },
      {
        name: "Tijera para cutícula Staleks Pro",
        price: 18.5,
        code: "6154",
        brand: "Staleks Pro",
        features: [],
        image: "tijera-cuticula-staleks-pro-6154.jpg",
      },
      {
        name: "Primer para pestañas Star Colors",
        price: 14.0,
        brand: "Star Colors",
        features: [],
        image: "primer-pestanas-star-colors.jpg",
      },
      {
        name: "Combo depila ya (cera en perlas + olla)",
        price: 12.5,
        features: ["Paquete de cera en perlas", "Incluye olla para derretir la cera"],
        image: "combo-depila-ya.jpg",
      },
    ],
  },
];

const CAPILARES_CATEGORY = "capilares";
const CAPILARES_SEED: SeedGroup[] = [
  {
    title: "Tratamientos y shampoos",
    subcategory: "tratamientos-y-shampoos",
    items: [
      {
        name: "Mascarilla lisso keratina Placenta Life",
        price: 7.25,
        code: "287",
        brand: "Placenta Life",
        features: [],
        image: "mascarilla-lisso-keratina-placenta-life.jpg",
      },
      {
        name: "Kit shampoo + acondicionador Salon Line",
        price: 13.75,
        code: "9313",
        brand: "Salon Line",
        features: [],
        image: "kit-shampoo-acondicionador-salon-line.jpg",
      },
      {
        name: "Keratina Ambroisie 250 ml Rene Chardon",
        price: 45.0,
        code: "4199",
        brand: "Rene Chardon",
        features: ["Presentación 250 ml"],
        image: "keratina-ambroisie-250ml-rene-chardon.jpg",
      },
      {
        name: "Crema de peinar SKALA Bomba de Vitaminas",
        price: 8.25,
        code: "10879",
        brand: "SKALA",
        features: [
          "Fórmula con ácido hialurónico, aceite de ricino, proteínas vegetales, vitaminas A y E, D-Pantenol",
          "Nutre profundamente y ayuda a recuperar el brillo natural",
        ],
        image: "crema-peinar-skala-bomba-vitaminas.jpg",
      },
      {
        name: "Tónico capilar Poción Día y Noche",
        price: 15.75,
        code: "9729",
        brand: "Poción",
        features: [
          "Tratamiento con nanotecnología liposomal",
          "Ritual de aplicación día y noche",
          "Enfocado en caída del cabello y crecimiento",
        ],
        image: "tonico-capilar-pocion-dia-noche.jpg",
      },
      {
        name: "Shampoo control caspa Poción",
        price: 13.0,
        code: "11245",
        brand: "Poción",
        features: ["Ayuda a controlar la caspa visible", "Equilibra el cuero cabelludo", "Reduce la picazón"],
        image: "shampoo-control-caspa-pocion.jpg",
      },
      {
        name: "Gorro de ducha impermeable",
        price: 1.0,
        features: ["Aísla eficazmente la humedad del cabello"],
        image: "gorro-ducha-impermeable.jpg",
      },
      {
        name: "Reconstructor capilar Tratamiento Kuul",
        price: 17.3,
        code: "5830",
        brand: "Kuul",
        features: [],
        image: "reconstructor-capilar-tratamiento-kuul.jpg",
      },
      {
        name: "Pack BMT Keratina (shampoo + acondicionador + tratamiento)",
        price: 21.25,
        code: "5130",
        brand: "BMT",
        features: ["Shampoo + acondicionador + tratamiento"],
        image: "pack-bmt-keratina.jpg",
      },
      {
        name: "Cera de cabello The Barbería",
        price: 5.0,
        code: "6125",
        brand: "The Barbería",
        features: [],
        image: "cera-cabello-the-barberia.jpg",
      },
    ],
  },
  {
    title: "Equipo capilar",
    subcategory: "equipo-capilar",
    items: [
      {
        name: "Plancha de cabello mini Lizze",
        price: 36.0,
        code: "6291",
        brand: "Lizze",
        features: [],
        image: "plancha-cabello-mini-lizze.jpg",
      },
      {
        name: "Máquina de cabello WAHL Edición Legend",
        price: 148.75,
        code: "8526",
        brand: "WAHL",
        features: [],
        image: "maquina-cabello-wahl-legend.jpg",
      },
      {
        name: "Máquina de cabello WAHL Magic Clip",
        price: 137.0,
        code: "5464",
        brand: "WAHL",
        features: [],
        image: "maquina-cabello-wahl-magic-clip.jpg",
      },
      {
        name: "Secadora de cabello Realiss 2100W",
        price: 48.0,
        code: "10381",
        brand: "Realiss",
        features: ["2100 watts"],
        image: "secadora-cabello-realiss-2100w.jpg",
      },
      {
        name: "Tenaza para cabello Vulcan Taiff",
        price: 95.0,
        code: "11598",
        brand: "Taiff",
        features: [],
        image: "tenaza-cabello-vulcan-taiff.jpg",
      },
    ],
  },
];

const MAQUILLAJE_CATEGORY = "maquillaje";
const MAQUILLAJE_SEED: SeedGroup[] = [
  {
    title: "Ojos y labios",
    subcategory: "ojos-y-labios",
    items: [
      {
        name: "Paleta de sombras Satine",
        price: 20.0,
        code: "2510",
        brand: "Satine",
        features: [],
        image: "paleta-sombras-satine.jpg",
      },
      {
        name: "Labial mate Top Face",
        price: 13.0,
        code: "6033",
        brand: "Top Face",
        features: [],
        image: "labial-mate-top-face.jpg",
      },
      {
        name: "Labial Milani",
        price: 14.85,
        code: "3487",
        brand: "Milani",
        features: [],
        image: "labial-milani.jpg",
      },
      {
        name: "Máscara de pestañas OG Mega Plump",
        price: 4.5,
        code: "11159",
        brand: "OG",
        features: [],
        image: "mascara-pestanas-og-mega-plump.jpg",
      },
      {
        name: "Labial Flormar",
        price: 6.0,
        code: "7447",
        brand: "Flormar",
        features: [],
        image: "labial-flormar.jpg",
      },
      {
        name: "Delineador glitter Beauty Creations",
        price: 6.3,
        code: "10891",
        brand: "Beauty Creations",
        features: [],
        image: "delineador-glitter-beauty-creations.jpg",
      },
      {
        name: "Labial Superstay Vinyl Ink S.F.R. Color",
        price: 2.0,
        code: "10865",
        brand: "S.F.R. Color",
        features: [],
        image: "labial-superstay-vinyl-ink-sfr-color.jpg",
      },
      {
        name: "Paleta de sombras Duo Rose Quartz",
        price: 4.5,
        code: "12006",
        features: [],
        image: "paleta-sombras-duo-rose-quartz.jpg",
      },
    ],
  },
  {
    title: "Rostro",
    subcategory: "rostro",
    items: [
      {
        name: "Sellador de maquillaje Beauty Creations",
        price: 8.9,
        code: "2602",
        brand: "Beauty Creations",
        features: [],
        image: "sellador-maquillaje-beauty-creations.jpg",
      },
      {
        name: "Polvo compacto Amorus",
        price: 5.75,
        brand: "Amorus",
        features: ["Tonos: Natural Beige 05, Porcelain 09, Caramel Beige 11"],
        image: "polvo-compacto-amorus.jpg",
      },
      {
        name: "Spray fijador de maquillaje S.F.R. Color",
        price: 3.0,
        code: "10866",
        brand: "S.F.R. Color",
        features: [],
        image: "spray-fijador-maquillaje-sfr-color.jpg",
      },
      {
        name: "Base líquida Vogue Resist",
        price: 6.25,
        brand: "Vogue",
        features: [
          "Hasta 24h o 30h de cobertura",
          "Resistente al sudor, la humedad y el agua",
          "Acabado mate natural",
          "Incluye protección solar",
        ],
        image: "base-liquida-vogue-resist.jpg",
      },
      {
        name: "Iluminador S.F.R. Color",
        price: 2.0,
        code: "10860",
        brand: "S.F.R. Color",
        features: ["Varios tonos"],
        image: "iluminador-sfr-color.jpg",
      },
      {
        name: "Corrector Essence Camouflage Matt",
        price: 4.25,
        code: "11357",
        brand: "Essence",
        features: [],
        image: "corrector-essence-camouflage-matt.jpg",
      },
      {
        name: "Mascarilla correctora Blanco Polar",
        price: 12.5,
        code: "9393",
        features: [],
        image: "mascarilla-correctora-blanco-polar.jpg",
      },
      {
        name: "Contorno de ojos Byphasse",
        price: 9.25,
        code: "2086",
        brand: "Byphasse",
        features: [],
        image: "contorno-ojos-byphasse.jpg",
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
        brand: item.brand,
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
  const products = [
    ...toProducts(MUEBLES_CATEGORY, MUEBLES_SEED),
    ...toProducts(UNAS_CATEGORY, UNAS_SEED),
    ...toProducts(CAPILARES_CATEGORY, CAPILARES_SEED),
    ...toProducts(MAQUILLAJE_CATEGORY, MAQUILLAJE_SEED),
  ];
  assertSanitized(products);

  const output = {
    generatedAt: new Date().toISOString(),
    source:
      "manual-seed:scripts/sync-public-catalog.ts (muebles migrado desde muebles.astro 2026-08-07; " +
      "uñas/capilares/maquillaje curados desde el export de Telegram en SEO-012, 2026-08-08)",
    products,
  };

  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2) + "\n", "utf-8");
  console.log(`Escrito ${products.length} productos en ${path.relative(ROOT, OUTPUT_PATH)}`);
}

main();
