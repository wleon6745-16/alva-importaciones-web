import { siteConfig } from "./site-config";
import type { Product } from "../types/product";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: new URL("/brand/alva-icon-512.png", siteConfig.url).toString(),
    sameAs: [siteConfig.instagram],
  };
}

type Location = (typeof siteConfig.locations)[number];

export function localBusinessSchema(location: Location, pageUrl?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: `${siteConfig.name} - ${location.name}`,
    image: new URL("/brand/alva-icon-512.png", siteConfig.url).toString(),
    url: pageUrl,
    telephone: `+${location.whatsappNumber}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: location.address,
      addressLocality: "Portoviejo",
      addressRegion: "Manabí",
      addressCountry: "EC",
    },
    // Área atendida = la ciudad donde está el local (dato ya verificado en la dirección, no
    // se infiere ni se inventa un radio de cobertura no confirmado).
    areaServed: {
      "@type": "City",
      name: "Portoviejo",
    },
    hasMap: location.mapsUrl,
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        opens: "09:00",
        closes: "18:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Sunday"],
        opens: "09:00",
        closes: "13:00",
      },
    ],
  };
}

export function localBusinessSchemas() {
  return siteConfig.locations.map((location) => localBusinessSchema(location));
}

export function courseSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "Curso Profesional de Uñas Acrílicas",
    description:
      "Curso profesional de uñas acrílicas de 6 meses, dictado por Alva Importaciones en Portoviejo. Incluye facilidades de pago.",
    provider: {
      "@type": "Organization",
      name: siteConfig.name,
      sameAs: siteConfig.url,
    },
  };
}

/**
 * `brand` no viene en el catálogo sanitizado (SEO-002) salvo que el nombre del producto ya la
 * mencione explícitamente (p. ej. "SILETI"). Para el resto se usa el vendedor (Alva
 * Importaciones) como marca — no es un dato inventado, es la identidad real de quien lo vende.
 */
function brandNameFor(product: Product): string {
  if (product.brand) return product.brand;
  const match = product.name.match(/\bSILETI\b/i);
  return match ? "SILETI" : siteConfig.name;
}

export function productSchema(product: Product, pageUrl: string, imageUrl: string) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: [imageUrl],
    description: product.features.join(", "),
    category: product.subcategory ?? product.category,
    brand: {
      "@type": "Brand",
      name: brandNameFor(product),
    },
    url: pageUrl,
  };

  if (product.code) schema.sku = product.code;

  // Solo se declara `offers` cuando hay un precio real conocido — nunca se inventa
  // disponibilidad ni condición del artículo (ver DATA_CONFLICTS.md / MASTER_PLAN.md).
  if (product.price !== undefined) {
    schema.offers = {
      "@type": "Offer",
      url: pageUrl,
      priceCurrency: product.currency ?? "USD",
      price: product.price,
      seller: {
        "@type": "Organization",
        name: siteConfig.name,
      },
    };
  }

  return schema;
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function articleSchema(options: {
  headline: string;
  description: string;
  pageUrl: string;
  datePublished: string;
  imageUrl?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: options.headline,
    description: options.description,
    url: options.pageUrl,
    datePublished: options.datePublished,
    dateModified: options.datePublished,
    author: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: new URL("/brand/alva-icon-512.png", siteConfig.url).toString(),
      },
    },
    ...(options.imageUrl ? { image: [options.imageUrl] } : {}),
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: new URL(item.path, siteConfig.url).toString(),
    })),
  };
}
