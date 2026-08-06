import { siteConfig } from "./site-config";

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

export function localBusinessSchemas() {
  return siteConfig.locations.map((location) => ({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: `${siteConfig.name} - ${location.name}`,
    image: new URL("/brand/alva-icon-512.png", siteConfig.url).toString(),
    address: {
      "@type": "PostalAddress",
      streetAddress: location.address,
      addressLocality: "Portoviejo",
      addressRegion: "Manabí",
      addressCountry: "EC",
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
  }));
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
