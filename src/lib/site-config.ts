// Datos reales de Alva Importaciones. Los campos marcados TODO son
// placeholders a reemplazar cuando el cliente los confirme (ver plan).

export const siteConfig = {
  name: "Alva Importaciones",
  tagline: "Belleza Perfecta",
  description:
    "Muebles para salón de belleza (camillas, sillones de peluquería, butacas y mesas de trabajo) e insumos de uñas, capilares y maquillaje en Portoviejo, Manabí. Consulta precios y disponibilidad al instante por WhatsApp.",
  url: "https://alvaimportaciones.com", // TODO: dominio real
  instagram: "https://www.instagram.com/alvaimportaciones/",
  whatsappMessage: "Hola, quisiera consultar sobre un producto",
  hours: [
    { days: "Lunes a sábado", time: "9:00 – 18:00" },
    { days: "Domingo", time: "9:00 – 13:00" },
  ],
  locations: [
    {
      name: "Matriz",
      // Dirección verificada contra la tabla tenant_branches de la base de datos de ASISTENTE
      // (registro "Matriz" / "Bodega Matriz", tenant Alva) el 2026-08-06.
      address: "Calle Quito, entre Av. Manabí y García Moreno, Portoviejo, Manabí",
      mapsUrl:
        "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent("Calle Quito, entre Av. Manabí y García Moreno, Portoviejo, Manabí"),
      whatsappNumber: "593999526807",
    },
    {
      name: "Sucursal",
      // Dirección verificada contra la tabla tenant_branches de la base de datos de ASISTENTE
      // (registro "Local 9 de Octubre", tenant Alva) el 2026-08-06.
      address: "Calle 9 de Octubre, entre Ricaurte y Olmedo, Portoviejo, Manabí",
      mapsUrl:
        "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent("Calle 9 de Octubre, entre Ricaurte y Olmedo, Portoviejo, Manabí"),
      whatsappNumber: "593963946590",
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

// Número de la Matriz usado como WhatsApp principal para los CTA generales del sitio.
export const primaryWhatsappNumber = siteConfig.locations[0].whatsappNumber;

export function whatsappLink(message = siteConfig.whatsappMessage, number = primaryWhatsappNumber) {
  const text = encodeURIComponent(message);
  return `https://wa.me/${number}?text=${text}`;
}
