// Datos reales de Alva Importaciones. Los campos marcados TODO son
// placeholders a reemplazar cuando el cliente los confirme (ver plan).

export const siteConfig = {
  name: "Alva Importaciones",
  tagline: "Belleza Perfecta",
  // Como la gente nos escribe y nos busca: "Alva Import", "alvaimport", "Alva Importaciones". Se declaran como
  // nombres alternos del negocio (schema.org) y se dicen en texto visible, para que buscadores y asistentes
  // de IA los reconozcan como la misma marca. No se inventan nombres: son las variantes reales del mismo.
  alternateNames: ["Alva Import", "AlvaImport", "Alva Importaciones Portoviejo", "Alva Importaciones Ecuador"],
  // Titulo de la portada: marca + lo que vendemos + donde, en una sola linea (el nombre solo no dice nada).
  homeTitle: "Alva Importaciones (Alva Import) | Belleza y salón en Portoviejo",
  homeDescription:
    "Alva Importaciones (Alva Import): muebles para salón de belleza, insumos de uñas, capilares y maquillaje, y curso de uñas en Portoviejo. Consulta por WhatsApp.",
  description:
    "Muebles para salón de belleza (camillas, sillones de peluquería, butacas y mesas de trabajo) e insumos de uñas, capilares y maquillaje en Portoviejo, Manabí. Consulta precios y disponibilidad al instante por WhatsApp.",
  url: "https://alvaimportaciones.com", // dominio real, confirmado 2026-08-15
  instagram: "https://www.instagram.com/alvaimportaciones/",
  whatsappMessage: "Hola, quisiera consultar sobre un producto",
  hours: [
    { days: "Lunes a sábado", time: "9:00 – 18:00" },
    { days: "Domingo", time: "9:00 – 13:00" },
  ],
  locations: [
    {
      slug: "matriz",
      name: "Matriz",
      // Dirección verificada contra la tabla tenant_branches de la base de datos de ASISTENTE
      // (registro "Matriz" / "Bodega Matriz", tenant Alva) el 2026-08-06.
      address: "Calle Quito, entre Av. Manabí y García Moreno, Portoviejo, Manabí",
      mapsUrl:
        "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent("Calle Quito, entre Av. Manabí y García Moreno, Portoviejo, Manabí"),
      // Corregido 2026-08-16 (confirmado directo por el usuario) — el 593999526807 anterior era
      // incorrecto.
      whatsappNumber: "593959298275",
    },
    {
      slug: "sucursal",
      name: "Sucursal",
      // Dirección verificada contra la tabla tenant_branches de la base de datos de ASISTENTE
      // (registro "Local 9 de Octubre", tenant Alva) el 2026-08-06.
      address: "Calle 9 de Octubre, entre Ricaurte y Olmedo, Portoviejo, Manabí",
      mapsUrl:
        "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent("Calle 9 de Octubre, entre Ricaurte y Olmedo, Portoviejo, Manabí"),
      // CONFLICT-001 resuelto 2026-08-16 (confirmado directo por el usuario): es 76, no 46 —
      // coincide con lo visto en el canal de Telegram. Ver docs/seo-work/DATA_CONFLICTS.md.
      whatsappNumber: "593963976590",
    },
  ],
  brands: [
    "Mia Secret",
    "Milani",
    "La Girl USA",
    "Master Nails",
    "Rodher",
    "Maxybelt",
    "Lissia",
    "Dipaso",
  ],
} as const;

/**
 * Ruta canonica tal como la sirve el servidor. Las paginas estaticas viven en carpetas, y Cloudflare
 * redirige "/contacto" -> "/contacto/" (307), asi que su canonical (y el sitemap) llevan la barra final.
 * Las rutas bajo demanda (fichas de producto en vivo y novedades) responden 200 sin barra y sin redirigir.
 * Antes el canonical decia "/contacto" mientras el sitemap decia "/contacto/": dos senales distintas para
 * la misma pagina, y un canonical que apuntaba a una URL que redirige.
 */
export function canonicalPath(path: string): string {
  if (!path || path === "/") return "/";
  const onDemand = /^\/(?:productos\/[^/]+\/p\/|novedades(?:\/|$))/.test(path);
  if (onDemand) return path.replace(/\/+$/, "") || "/";
  if (/\.[a-z0-9]{2,5}$/i.test(path)) return path; // archivo (xml, txt...)
  return path.endsWith("/") ? path : `${path}/`;
}

// Número de la Matriz usado como WhatsApp principal para los CTA generales del sitio.
export const primaryWhatsappNumber = siteConfig.locations[0].whatsappNumber;

export function whatsappLink(message = siteConfig.whatsappMessage, number = primaryWhatsappNumber) {
  const text = encodeURIComponent(message);
  return `https://wa.me/${number}?text=${text}`;
}
