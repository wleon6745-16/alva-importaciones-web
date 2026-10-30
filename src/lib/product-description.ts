// La descripcion de un producto llega de Omviqa como UN solo bloque de texto: los titulos de las
// secciones ("Modo de uso", "Ingredientes clave"...) vienen pegados al texto y las listas separadas
// por ".." -- tal cual se pegan en un parrafo gigante. Aqui se separa en lo que ya es: un resumen y
// secciones con su titulo. No se cambia ni una palabra del contenido (es dato de Omviqa, no se
// reescribe a mano): solo se ordena para que la ficha se pueda leer.

export interface DescriptionItem {
  label: string | null;
  text: string;
}

export interface DescriptionSection {
  title: string;
  /** "steps": pasos numerados; "list": vinetas o filas etiqueta/valor; "text": parrafo corrido. */
  kind: "steps" | "list" | "text";
  items: DescriptionItem[];
}

export interface ParsedDescription {
  /** Primer parrafo, antes de cualquier titulo: es lo que va junto a la foto. */
  summary: string;
  sections: DescriptionSection[];
}

// Titulos que Omviqa antepone a cada bloque, y como se muestran.
const HEADINGS: Array<{ match: string; title: string; kind: DescriptionSection["kind"] }> = [
  { match: "Características Principales", title: "Características principales", kind: "list" },
  { match: "Problema que resuelve", title: "Qué problema resuelve", kind: "text" },
  { match: "Modo de uso", title: "Modo de uso", kind: "steps" },
  { match: "Ingredientes clave", title: "Ingredientes clave", kind: "list" },
  { match: "Características adicionales", title: "Características adicionales", kind: "list" },
  { match: "Ingredientes (INCI)", title: "Ingredientes (INCI)", kind: "text" },
];

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const HEADING_RE = new RegExp(`(${HEADINGS.map((h) => escapeRe(h.match)).join("|")})`, "g");

function clean(s: string): string {
  return s.replace(/\s+/g, " ").replace(/\s+([,.;:])/g, "$1").trim();
}

function toItem(raw: string): DescriptionItem | null {
  const text = clean(raw.replace(/^[.\s]+|[.\s]+$/g, ""));
  if (!text) return null;
  // "Aceite de Coco : Nutre..." / "Tamano: 300 ml" -> etiqueta y valor.
  const m = text.match(/^([^:.]{2,40}?)\s*:\s+(.+)$/);
  if (m) return { label: clean(m[1]), text: clean(m[2]) };
  return { label: null, text };
}

function splitItems(body: string): DescriptionItem[] {
  // ".." separa pasos/viñetas; si no hay, cada frase (incluso pegada, "mechones.Uso: ...") es una fila.
  const parts = body.includes("..")
    ? body.split(/\.\.\s*/)
    : body.split(/(?<=[.!?])\s*(?=[A-ZÁÉÍÓÚÑ¡¿])/);
  return parts.map(toItem).filter((i): i is DescriptionItem => i !== null);
}

export function parseDescription(input: string | null | undefined): ParsedDescription {
  const text = (input ?? "").trim();
  if (!text) return { summary: "", sections: [] };

  const pieces = text.split(HEADING_RE);
  // pieces = [intro, titulo1, cuerpo1, titulo2, cuerpo2, ...]
  const summary = clean(pieces[0] ?? "");
  const sections: DescriptionSection[] = [];

  for (let i = 1; i < pieces.length; i += 2) {
    const heading = HEADINGS.find((h) => h.match === pieces[i]);
    const body = (pieces[i + 1] ?? "").trim();
    if (!heading || !body) continue;
    if (heading.kind === "text") {
      sections.push({ title: heading.title, kind: "text", items: [{ label: null, text: clean(body) }] });
      continue;
    }
    const items = splitItems(body);
    if (items.length) sections.push({ title: heading.title, kind: heading.kind, items });
  }

  // Sin titulos (texto plano largo): todo es el resumen, y la ficha lo recorta con "Ver mas".
  return { summary, sections };
}

/** Recorta en un limite de frase (o de palabra) sin dejar la oracion a medias. */
export function shorten(text: string, max: number): string {
  const t = clean(text);
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const sentence = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "));
  if (sentence > max * 0.5) return cut.slice(0, sentence + 1);
  const space = cut.lastIndexOf(" ");
  return `${cut.slice(0, space > 0 ? space : max).replace(/[,;:\s]+$/, "")}…`;
}

/** Texto plano ordenado (para meta description y datos estructurados): sin pegotes ni "..". */
export function plainDescription(input: string | null | undefined): string {
  const { summary, sections } = parseDescription(input);
  const parts = [summary];
  for (const s of sections) {
    const body = s.items.map((i) => (i.label ? `${i.label}: ${i.text}` : i.text)).join(". ");
    parts.push(`${s.title}: ${body}`);
  }
  return clean(parts.filter(Boolean).join(". ").replace(/\.\.+/g, "."));
}
