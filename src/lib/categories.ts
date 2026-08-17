// Fuente unica de metadatos de categoria -- header, mosaico de categorias de
// la home y /productos consumen esto en vez de repetir arrays sueltos o
// bifurcar por if/else de categoria (ver docs/ALVA_2.0_PROPOSAL.md seccion G:
// "no hagas if category === 'unas' ... para construir la UI").
//
// Solo las 4 categorias con catalogo curado real hoy. SACC tiene 10
// categorias reales (ver ALVA_2.0_PROPOSAL.md seccion C) -- Facial/Skincare y
// Accesorios existen ahi pero sin ningun producto curado en este repo
// todavia, asi que no aparecen aca: agregar una entrada con foto/copy
// inventados seria fabricar contenido que no existe. En cuanto haya productos
// reales curados para esas categorias, agregarlas aca las hace aparecer
// automaticamente en el header y en el mosaico -- ningun otro archivo
// necesita cambiar.
export interface CategoryMeta {
  slug: "muebles" | "unas" | "capilares" | "maquillaje";
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
];
