// Mensajes de WhatsApp con contexto.
//
// Antes "Consultar" mandaba "Hola, quisiera consultar sobre: <nombre>": la asesora no sabia el codigo, la
// marca, la categoria ni cual era la pagina, y tampoco podia distinguir a un cliente que escribia desde
// el sitio de cualquier otro. Aqui se arma el mensaje completo; el marcador de origen lo agrega
// WhatsAppOrigin.astro en cada clic (ver ese archivo), para que valga tambien en los enlaces que se
// construyen en el navegador.
import { siteConfig } from "./site-config";

export interface ProductInquiry {
  name: string;
  code?: string | null;
  brand?: string | null;
  categoryLabel?: string | null;
  /** Ruta absoluta o relativa a la pagina del producto (se vuelve absoluta). */
  path?: string | null;
}

function absolute(path: string): string {
  try {
    return new URL(path, siteConfig.url).toString();
  } catch {
    return path;
  }
}

/** Marca "//" es el relleno de SACC para "sin marca": no se le dice a nadie. */
function usableBrand(brand?: string | null): string | null {
  const b = brand?.trim();
  return b && b !== "//" ? b : null;
}

export function productInquiryMessage(p: ProductInquiry): string {
  const lines = ["Hola, quisiera consultar sobre este producto:", `*${p.name}*`];
  const meta = [p.code ? `Cód: ${p.code}` : null, usableBrand(p.brand) ? `Marca: ${usableBrand(p.brand)}` : null, p.categoryLabel ?? null]
    .filter(Boolean)
    .join(" · ");
  if (meta) lines.push(meta);
  if (p.path) lines.push(absolute(p.path));
  lines.push("¿Lo tienen disponible y cuál es el precio?");
  return lines.join("\n");
}

export function promotionInquiryMessage(title: string): string {
  return ["Hola, quisiera aprovechar esta promoción:", `*${title}*`, absolute("/#promociones"), "¿Sigue vigente y qué incluye?"].join("\n");
}
