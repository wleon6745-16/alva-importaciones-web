// Lista de cotizacion del visitante: productos + cantidad, guardados en SU navegador.
//
// A proposito NO guarda precios: el precio y el stock son del ERP (via Omviqa) y la
// lista no debe mostrar uno desactualizado ni darle a la competencia una tabla de
// precios. El total y la proforma los da el asistente, que sí consulta el ERP.
import { useSyncExternalStore } from "react";

export interface QuoteItem {
  id: string;
  code: string | null;
  name: string;
  qty: number;
}

const KEY = "alva.quote.v1";
const EVENT = "alva:quote-change";
export const QUOTE_MAX_ITEMS = 50;
export const QUOTE_MAX_QTY = 999;
// Omviqa acepta 1000 caracteres por mensaje; se deja margen para el encabezado.
const ASSISTANT_MESSAGE_BUDGET = 900;
// Un enlace de WhatsApp largo se corta en algunos dispositivos.
const WHATSAPP_TEXT_BUDGET = 1500;

const EMPTY: QuoteItem[] = [];
let cacheRaw: string | null = null;
let cacheItems: QuoteItem[] = EMPTY;

function sanitize(value: unknown): QuoteItem[] {
  if (!Array.isArray(value)) return EMPTY;
  const out: QuoteItem[] = [];
  for (const raw of value) {
    const r = raw as Partial<QuoteItem> | null;
    if (!r || typeof r.id !== "string" || typeof r.name !== "string") continue;
    const qty = Math.min(QUOTE_MAX_QTY, Math.max(1, Math.floor(Number(r.qty) || 1)));
    out.push({ id: r.id, code: typeof r.code === "string" && r.code ? r.code : null, name: r.name.slice(0, 120), qty });
    if (out.length >= QUOTE_MAX_ITEMS) break;
  }
  return out;
}

export function readQuote(): QuoteItem[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    // Sin almacenamiento (modo privado, bloqueado): la lista no se recuerda entre paginas.
  }
  if (raw === cacheRaw) return cacheItems;
  cacheRaw = raw;
  try {
    cacheItems = raw ? sanitize(JSON.parse(raw)) : EMPTY;
  } catch {
    cacheItems = EMPTY;
  }
  return cacheItems;
}

function write(items: QuoteItem[]): void {
  try {
    const raw = items.length ? JSON.stringify(items) : null;
    if (raw) localStorage.setItem(KEY, raw);
    else localStorage.removeItem(KEY);
  } catch {
    // Ver readQuote.
  }
  // Se invalida la cache y se avisa a los demas componentes y pestanas.
  cacheRaw = "__stale__";
  window.dispatchEvent(new Event(EVENT));
}

export type AddResult = "added" | "increased" | "full";

export function addToQuote(item: Omit<QuoteItem, "qty">, qty = 1): AddResult {
  const items = [...readQuote()];
  const i = items.findIndex((x) => x.id === item.id);
  if (i >= 0) {
    items[i] = { ...items[i], qty: Math.min(QUOTE_MAX_QTY, items[i].qty + qty) };
    write(items);
    return "increased";
  }
  if (items.length >= QUOTE_MAX_ITEMS) return "full";
  items.push({ ...item, name: item.name.slice(0, 120), qty: Math.min(QUOTE_MAX_QTY, Math.max(1, qty)) });
  write(items);
  return "added";
}

export function setQuoteQty(id: string, qty: number): void {
  const q = Math.min(QUOTE_MAX_QTY, Math.max(1, Math.floor(qty) || 1));
  write(readQuote().map((x) => (x.id === id ? { ...x, qty: q } : x)));
}

export function removeFromQuote(id: string): void {
  write(readQuote().filter((x) => x.id !== id));
}

export function clearQuote(): void {
  write([]);
}

function subscribe(onChange: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY || e.key === null) onChange();
  };
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

/** Lista reactiva. En el servidor y en la hidratacion es vacia, para no desajustar el HTML. */
export function useQuote(): QuoteItem[] {
  return useSyncExternalStore(subscribe, readQuote, () => EMPTY);
}

function line(item: QuoteItem, withName: boolean): string {
  const code = item.code ? `[${item.code}] ` : "";
  const name = withName ? item.name.slice(0, 40) : item.code ? "" : item.name.slice(0, 40);
  return `- ${item.qty} x ${code}${name}`.trimEnd();
}

/**
 * Mensaje para el asistente: cantidad + codigo (el codigo es lo que permite emparejar
 * con el catalogo sin adivinar por nombre). Si con nombres no cabe en el limite del
 * mensaje, se envia solo el codigo.
 */
export function buildAssistantMessage(items: QuoteItem[]): string {
  const head = `Quiero cotizar esta lista de ${items.length} ${items.length === 1 ? "producto" : "productos"} y que me generes la proforma:\n`;
  for (const withName of [true, false]) {
    const body = items.map((i) => line(i, withName)).join("\n");
    if (head.length + body.length <= ASSISTANT_MESSAGE_BUDGET) return head + body;
  }
  // Con 50 productos maximos y solo codigo siempre cabe; esto es un seguro.
  return (head + items.map((i) => line(i, false)).join("\n")).slice(0, ASSISTANT_MESSAGE_BUDGET);
}

/** Texto compacto para el chat visible (el mensaje completo va al servidor, no se muestra). */
export function quoteDisplayText(items: QuoteItem[]): string {
  return `Quiero cotizar mi lista (${items.length} ${items.length === 1 ? "producto" : "productos"})`;
}

/** Version para WhatsApp con asesora: nombre + cantidad, recortada si es muy larga. */
export function buildWhatsappText(items: QuoteItem[]): string {
  const head = "Hola, quisiera cotizar esta lista:\n";
  let out = head;
  let shown = 0;
  for (const item of items) {
    const next = `${out === head ? "" : "\n"}- ${item.qty} x ${item.name}${item.code ? ` (Cód: ${item.code})` : ""}`;
    if (out.length + next.length > WHATSAPP_TEXT_BUDGET) break;
    out += next;
    shown += 1;
  }
  if (shown < items.length) out += `\n(y ${items.length - shown} productos más; los envío en otro mensaje)`;
  return out;
}
