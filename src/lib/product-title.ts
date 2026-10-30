import type { Product } from "../types/product";
import { shorten } from "./product-description";

/**
 * Titulo unico para productos que comparten nombre (4 "Sillon de peluqueria", 2 "Tijera para cuticula
 * Staleks Pro"). Antes se distinguian por el precio, pero con los precios ocultos todos decian "Consultar
 * precio" y volvian a chocar: buscadores veian la misma pagina repetida. Ahora se distingue por lo que
 * es propio de cada uno y no cambia: el codigo, el numero de modelo que ya trae el slug, o su primera
 * caracteristica. Nada se inventa.
 */
export function uniqueProductTitle(product: Product, sameName: Product[]): string {
  if (sameName.length <= 1) return product.name;
  if (product.code) return `${product.name} (cód. ${product.code})`;
  const model = product.slug.match(/-(\d+)$/)?.[1];
  if (model) return `${product.name} (modelo ${model})`;
  const first = product.features[0];
  return first ? `${product.name} (${first.toLowerCase()})` : product.name;
}

/** Descripcion corta sin huecos (". .") cuando el producto no trae caracteristicas, y con el codigo si lo hay. */
export function productMetaDescription(product: Product, priceText: string): string {
  const head = product.brand ? `${product.name} (${product.brand})` : product.name;
  const parts = [head];
  if (product.code) parts.push(`Código ${product.code}`);
  const feats = product.features.slice(0, 2).join(", ");
  if (feats) parts.push(feats);
  parts.push(`Precio: ${priceText}`);
  // El cierre fijo va siempre; lo variable (nombre, caracteristicas) se recorta para entrar en ~160 caracteres.
  const tail = " Consulta por WhatsApp en Portoviejo, Manabí.";
  return `${shorten(`${parts.join(". ")}.`, 160 - tail.length)}${tail}`;
}
