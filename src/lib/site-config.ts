// Datos reales de Alva Importaciones. Los campos marcados TODO son
// placeholders a reemplazar cuando el cliente los confirme (ver plan).

export const siteConfig = {
  name: "Alva Importaciones",
  tagline: "Belleza Perfecta",
  description:
    "Importadora de insumos de uñas, capilares y maquillaje en Portoviejo, Manabí. Consulta precios y disponibilidad al instante por WhatsApp.",
  url: "https://alvaimportaciones.com", // TODO: dominio real
  instagram: "https://www.instagram.com/alvaimportaciones/",
  // TODO: confirmar si es un número único o uno por local
  whatsappNumber: "593000000000", // TODO: número real, formato internacional sin '+'
  whatsappMessage: "Hola, quisiera consultar sobre un producto",
  hours: [
    { days: "Lunes a sábado", time: "9:00 – 18:00" },
    { days: "Domingo", time: "9:00 – 13:00" },
  ],
  locations: [
    {
      name: "Local 1 - Portoviejo",
      // TODO: dirección exacta / link de Google Maps
      address: "Portoviejo, Manabí, Ecuador",
      mapsUrl: "https://maps.google.com/?q=Alva+Importaciones+Portoviejo",
    },
    {
      name: "Local 2 - Portoviejo",
      // TODO: dirección exacta / link de Google Maps
      address: "Portoviejo, Manabí, Ecuador",
      mapsUrl: "https://maps.google.com/?q=Alva+Importaciones+Portoviejo",
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

export function whatsappLink(message = siteConfig.whatsappMessage) {
  const text = encodeURIComponent(message);
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${text}`;
}
