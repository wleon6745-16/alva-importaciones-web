// Fuente unica de metadatos de categoria -- header, mosaico de categorias de
// la home y /productos consumen esto en vez de repetir arrays sueltos o
// bifurcar por if/else de categoria (ver docs/ALVA_2.0_PROPOSAL.md seccion G:
// "no hagas if category === 'unas' ... para construir la UI").
//
// Facial y Accesorios se incorporaron cuando dejaron de estar vacias: hoy el
// sitio consume el catalogo en vivo del Storefront y esas dos categorias
// tienen producto real publicado (Accesorios 408, Facial 303), ademas de
// pagina propia generada en /productos/<slug>. La reserva original de este
// comentario -- no listar una categoria sin producto detras -- sigue vigente
// para las que aun no lo tienen (barberia, corporal, lifting).
export interface CategoryMeta {
  slug: "muebles" | "unas" | "capilares" | "maquillaje" | "facial" | "accesorios";
  /** Nombre completo, para títulos y el mosaico. */
  label: string;
  /** Nombre corto, para el menú de navegación. */
  shortLabel: string;
  description: string;
  href: string;
  /** Peso visual en el mosaico editorial — "large" ocupa el doble de columna. */
  size: "large" | "medium";
}

export const categories: CategoryMeta[] = [
  {
    slug: "muebles",
    label: "Muebles para salón",
    shortLabel: "Muebles",
    description: "Camillas, sillones de peluquería y barbería, butacas y mesas de trabajo.",
    href: "/productos/muebles",
    size: "large",
  },
  {
    slug: "unas",
    label: "Uñas y Nail Art",
    shortLabel: "Uñas",
    description: "Acrílicos, geles, esmaltes y herramientas profesionales.",
    href: "/productos/unas",
    size: "medium",
  },
  {
    slug: "maquillaje",
    label: "Maquillaje",
    shortLabel: "Maquillaje",
    description: "Base, labiales, sombras y más, de marcas reconocidas.",
    href: "/productos/maquillaje",
    size: "medium",
  },
  {
    slug: "capilares",
    label: "Capilares",
    shortLabel: "Capilares",
    description: "Tratamientos, shampoos y equipo para el cuidado del cabello.",
    href: "/productos/capilares",
    size: "medium",
  },
  {
    slug: "facial",
    label: "Facial",
    shortLabel: "Facial",
    description: "Limpieza, hidratación y protección para el cuidado de la piel.",
    href: "/productos/facial",
    size: "medium",
  },
  {
    slug: "accesorios",
    label: "Accesorios",
    shortLabel: "Accesorios",
    description: "Herramientas, organizadores y complementos para el día a día del salón.",
    href: "/productos/accesorios",
    size: "medium",
  },
];
