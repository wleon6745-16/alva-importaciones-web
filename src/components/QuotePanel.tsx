import { useEffect, useRef, useState } from "react";
import {
  buildAssistantMessage,
  buildWhatsappText,
  clearQuote,
  quoteDisplayText,
  removeFromQuote,
  setQuoteQty,
  useQuote,
  QUOTE_MAX_QTY,
} from "../lib/quote-list";
import { trackEvent } from "../lib/analytics";
import { whatsappLink } from "../lib/site-config";
import "../styles/quote.css";

// Contador flotante + panel con la lista. Muestra solo nombre y cantidad: el total y la
// proforma los da el asistente (que consulta el ERP), no esta pagina.
export default function QuotePanel({ assistantEnabled }: { assistantEnabled: boolean }) {
  const items = useQuote();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const pillRef = useRef<HTMLButtonElement>(null);
  const total = items.reduce((n, i) => n + i.qty, 0);

  useEffect(() => {
    const openIt = () => setOpen(true);
    window.addEventListener("alva:open-quote", openIt);
    return () => window.removeEventListener("alva:open-quote", openIt);
  }, []);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus({ preventScroll: true });
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", esc);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", esc);
      document.documentElement.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Lista vacia: no hay nada que mostrar, se cierra el panel.
  useEffect(() => {
    if (open && items.length === 0) setOpen(false);
  }, [open, items.length]);

  function close() {
    setOpen(false);
    pillRef.current?.focus({ preventScroll: true });
  }

  function askAssistant() {
    trackEvent("quote_send", { channel: "assistant", items: items.length });
    const detail = {
      message: buildAssistantMessage(items),
      display: quoteDisplayText(items),
      // "ver carrito" lo resuelve el motor sin pedir datos: muestra la lista y el total. La cedula se pide
      // solo despues, cuando el cliente decide pasar a la proforma.
      proformaMessage: "Ver mi carrito con el total",
      items: items.map((i) => ({ productId: i.id, quantity: i.qty, name: i.name })),
    };
    const w = window as unknown as { __alvaPendingQuote?: typeof detail };
    w.__alvaPendingQuote = detail; // por si el asistente aun no hidrato
    window.dispatchEvent(new CustomEvent("alva:open-assistant", { detail }));
    setOpen(false);
  }

  if (items.length === 0) return null;

  return (
    <div className="ql-root">
      <button ref={pillRef} type="button" className="ql-pill" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9 4h6a1 1 0 0 1 1 1v1H8V5a1 1 0 0 1 1-1Z" />
          <path d="M8 6H6.5A1.5 1.5 0 0 0 5 7.5v12A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5v-12A1.5 1.5 0 0 0 17.5 6H16" />
          <path d="M9 12h6M9 16h4" />
        </svg>
        <span className="ql-pill-label">Mi cotización</span>
        <span className="ql-count" aria-label={`${total} unidades`}>{total}</span>
      </button>

      {open && (
        <div className="ql-overlay" onClick={close}>
          <section
            ref={panelRef}
            className="ql-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Mi cotización"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="ql-head">
              <div>
                <h2 className="ql-title">Mi cotización</h2>
                <p className="ql-sub">
                  {items.length} {items.length === 1 ? "producto" : "productos"} · {total} {total === 1 ? "unidad" : "unidades"}
                </p>
              </div>
              <button type="button" className="ql-x" aria-label="Cerrar" onClick={close}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </header>

            <ul className="ql-list">
              {items.map((item) => (
                <li key={item.id} className="ql-row">
                  <div className="ql-row-text">
                    <p className="ql-name">{item.name}</p>
                    {item.code && <p className="ql-code">Cód. {item.code}</p>}
                  </div>
                  <div className="ql-qty" role="group" aria-label={`Cantidad de ${item.name}`}>
                    <button type="button" aria-label="Quitar una unidad" disabled={item.qty <= 1} onClick={() => setQuoteQty(item.id, item.qty - 1)}>−</button>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={QUOTE_MAX_QTY}
                      value={item.qty}
                      aria-label="Cantidad"
                      onChange={(e) => setQuoteQty(item.id, Number(e.target.value))}
                    />
                    <button type="button" aria-label="Agregar una unidad" disabled={item.qty >= QUOTE_MAX_QTY} onClick={() => setQuoteQty(item.id, item.qty + 1)}>+</button>
                  </div>
                  <button type="button" className="ql-del" aria-label={`Quitar ${item.name}`} onClick={() => removeFromQuote(item.id)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-12M9 7V4h6v3" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>

            <footer className="ql-foot">
              <p className="ql-hint">El asistente consulta precio y stock reales y te da el total con tu número de proforma.</p>
              {assistantEnabled && (
                <button type="button" className="ql-primary" onClick={askAssistant}>
                  Cotizar con el asistente
                </button>
              )}
              <a
                className={assistantEnabled ? "ql-secondary" : "ql-primary"}
                href={whatsappLink(buildWhatsappText(items))}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("quote_send", { channel: "whatsapp", items: items.length })}
              >
                Enviar a una asesora por WhatsApp
              </a>
              <button type="button" className="ql-clear" onClick={clearQuote}>
                Vaciar lista
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}
