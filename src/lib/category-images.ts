import type { ImageMetadata } from "astro";
import type { CategoryMeta } from "./categories";

// Fotografia de portada por categoria, en un solo lugar. Antes vivia duplicada
// en la home y en /productos, cada una con su propio import y su propia foto:
// al cambiar las imagenes de marca, /productos se quedo con las viejas y con
// solo 4 categorias. El texto/orden ya salia de lib/categories.ts; esto cierra
// el circulo mapeando slug -> asset, para que agregar una categoria nueva sea
// una entrada aca y otra alla, sin tocar ninguna pagina.
import mueblesImage from "../assets/products/muebles/cat-muebles.jpeg";
import nailsImage from "../assets/products/unas/cat-unas.jpeg";
import makeupImage from "../assets/products/maquillaje/cat-maquillaje.jpeg";
import hairImage from "../assets/products/capilares/cat-capilares.jpeg";
import facialImage from "../assets/products/facial/cat-facial.jpeg";
import accesoriosImage from "../assets/products/accesorios/cat-accesorios.jpeg";

export const categoryImages: Record<CategoryMeta["slug"], ImageMetadata> = {
  muebles: mueblesImage,
  unas: nailsImage,
  capilares: hairImage,
  maquillaje: makeupImage,
  facial: facialImage,
  accesorios: accesoriosImage,
};
