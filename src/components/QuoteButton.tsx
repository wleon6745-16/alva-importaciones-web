import { addToQuote, useQuote, QUOTE_MAX_ITEMS } from "../lib/quote-list";
import { trackEvent } from "../lib/analytics";
import "../styles/quote.css";

interface Props {
  id: string;
  code: string | null;
  name: string;
  /** "card" = compacto en tarjetas; "detail" = grande en la ficha del producto. */
  variant?: "card" | "detail";
  source?: string;
}

// Agrega un producto a la lista de cotizacion (nombre + cantidad; nunca precio).
export default function QuoteButton({ id, code, name, variant = "card", source }: Props) {
  const items = useQuote();
  const inList = items.find((x) => x.id === id);
  const full = !inList && items.length >= QUOTE_MAX_ITEMS;

  function onClick() {
    const result = addToQuote({ id, code, name });
    trackEvent("quote_add", { source: source ?? variant, result });
    if (result === "full") return;
    // Abre el panel solo desde la ficha: en las tarjetas el contador flotante ya confirma.
    if (variant === "detail") window.dispatchEvent(new Event("alva:open-quote"));
  }

  return (
    <button
      type="button"
      className={`ql-add ql-add-${variant}${inList ? " ql-add-in" : ""}`}
      onClick={onClick}
      disabled={full}
      aria-label={inList ? `${name}: ya está en tu cotización, agregar una unidad más` : `Agregar ${name} a mi cotización`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {inList ? <path d="M5 12.5l4.5 4.5L19 7.5" /> : <path d="M12 5v14M5 12h14" />}
      </svg>
      <span>{full ? "Lista llena" : inList ? `En tu cotización (${inList.qty})` : "Agregar a cotización"}</span>
    </button>
  );
}
