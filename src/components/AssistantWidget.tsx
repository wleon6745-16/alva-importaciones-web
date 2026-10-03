import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { trackEvent } from "../lib/analytics";
import "../styles/assistant.css";

// Asistente de Alva en la web: habla con el Web Channel de Omviqa (el mismo motor
// que atiende WhatsApp). Sin cuenta ni JWT: la identidad es el channelId (publico,
// va en `endpoint`) + el Origin del sitio, validado del lado de Omviqa; el
// visitante es un UUID que genera este navegador.

interface Props {
  endpoint: string;
  whatsappUrl: string;
}

interface UiMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  images?: string[];
  error?: boolean;
  // El visitante pidio una asesora: se ofrece continuar por WhatsApp.
  handoff?: boolean;
  // Aviso discreto bajo la respuesta (p. ej. "te quedan pocas consultas hoy").
  note?: string;
}

interface QuoteRequest {
  /** Texto completo con la lista: respaldo si no se puede cargar el carrito. */
  message: string;
  /** Lo que se ve en el chat en lugar del mensaje completo. */
  display: string;
  /** Peticion corta que arranca la proforma una vez cargado el carrito. */
  proformaMessage: string;
  items: Array<{ productId: string; quantity: number; name: string }>;
}

interface SeedResult {
  agregados: number;
  omitidos: Array<{ productId: string; nombre: string | null }>;
}

interface SendOpts {
  /** Texto corto que se muestra en el chat en lugar del mensaje completo. */
  display?: string;
  /** Mensaje de lista de cotizacion: va completo y no se descarta por repetido. */
  quote?: boolean;
}

interface Stored {
  visitorId: string;
  historial: Array<{ role?: string }>;
  messages: UiMessage[];
  updatedAt: number;
}

const STORAGE_KEY = "alva.assistant.v1";
// Omviqa expira la conversacion a las 24 h: pasado ese tiempo se empieza de cero.
const TTL_MS = 24 * 60 * 60 * 1000;
// Omviqa rechaza (400) un historial de mas de 40 mensajes.
const MAX_HISTORY = 36;
const MAX_INPUT = 500;
// Omviqa acepta 1000 caracteres por mensaje; la lista de cotizacion se arma con margen.
const MAX_QUOTE_MESSAGE = 950;
// Freno ante abuso casual (la proteccion real vive en el servidor): pausa minima entre
// mensajes y tope de mensajes por navegador cada 24 h, que "Nueva conversacion" no reinicia.
const MIN_GAP_MS = 2500;
const DAILY_QUOTA = 40;
const QUOTA_KEY = "alva.assistant.quota";

function takeQuota(): boolean {
  try {
    const raw = localStorage.getItem(QUOTA_KEY);
    let q = raw ? (JSON.parse(raw) as { since: number; count: number }) : null;
    if (!q || Date.now() - q.since > TTL_MS) q = { since: Date.now(), count: 0 };
    if (q.count >= DAILY_QUOTA) return false;
    localStorage.setItem(QUOTA_KEY, JSON.stringify({ ...q, count: q.count + 1 }));
  } catch {
    // Sin almacenamiento no se puede contar: se deja pasar (el servidor sigue limitando).
  }
  return true;
}
const REQUEST_TIMEOUT_MS = 60_000;

const WELCOME_TEXT =
  "¡Hola! Soy el asistente de Alva Importaciones. Te ayudo con productos, precios, stock, nuestros locales y el curso de uñas. ¿Qué necesitas?";

const SUGGESTIONS = [
  "¿Tienen camillas disponibles?",
  "Quiero precios de esmaltes y geles",
  "¿Dónde están sus locales y horarios?",
  "Info del curso de uñas",
];

function uuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

function loadStored(): Stored {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const s = JSON.parse(raw) as Stored;
      if (s.visitorId && Date.now() - s.updatedAt < TTL_MS) return s;
    }
  } catch {
    // Sin almacenamiento (modo privado, bloqueado): el chat funciona igual, solo no recuerda.
  }
  return { visitorId: uuid(), historial: [], messages: [], updatedAt: Date.now() };
}

function saveStored(s: Stored) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...s, updatedAt: Date.now() }));
  } catch {
    // Ver loadStored.
  }
}

// Recorta el historial por el principio SIN partir un turno: debe empezar en un mensaje
// del usuario, o los bloques "tool" quedarian huerfanos de su tool_call.
function trimHistorial<T extends { role?: string }>(h: T[]): T[] {
  let out = h;
  while (out.length > MAX_HISTORY) {
    const next = out.findIndex((m, i) => i > 0 && m.role === "user");
    if (next === -1) break;
    out = out.slice(next);
  }
  return out;
}

// Si el visitante esta en la ficha de un producto, se le dice al asistente cual (nombre),
// asi "¿cuanto cuesta?" se entiende sin que lo repita.
function detectProductName(): string | null {
  const seg = location.pathname.split("/").filter(Boolean);
  const esFicha = seg[0] === "productos" && ((seg.length === 3 && seg[1] !== "p") || (seg.length >= 4 && seg[2] === "p"));
  if (!esFicha) return null;
  const name = document.querySelector("main h1")?.textContent?.trim();
  return name ? name.slice(0, 120) : null;
}

// ---- Guia dentro de la pagina -------------------------------------------------------------

interface NavItem {
  label: string;
  path: string;
  hash?: string;
}

interface PageContext {
  kind: "home" | "category" | "product" | "course" | "locations" | "other";
  intro: string | null;
  suggestions: string[];
  teaser: string;
  nav: NavItem[];
}

const REOPEN_KEY = "alva.assistant.reopen";
const TEASER_KEY = "alva.assistant.teaser";

function getPageContext(): PageContext {
  const path = location.pathname.replace(/\/+$/, "") || "/";
  const seg = path.split("/").filter(Boolean);
  const h1 = document.querySelector("main h1")?.textContent?.trim().slice(0, 80) ?? "";
  const onHome = path === "/";

  const nav: NavItem[] = [
    { label: "Categorías", path: onHome ? "/" : "/productos", hash: onHome ? "categorias" : undefined },
    { label: "Promociones", path: "/", hash: "promociones" },
    { label: "Curso de uñas", path: onHome ? "/" : "/cursos", hash: onHome ? "curso" : undefined },
    { label: "Locales y horarios", path: "/locales" },
  ].filter((n) => !(n.path === path && !n.hash));

  if (seg[0] === "productos" && ((seg.length === 3 && seg[1] !== "p") || (seg.length >= 4 && seg[2] === "p"))) {
    return {
      kind: "product",
      intro: h1 ? `Estás viendo *${h1}*. Pregúntame lo que quieras de este producto.` : null,
      suggestions: ["¿Cuánto cuesta y hay stock?", "¿Qué alternativas parecidas tienen?", "¿Tienen precio al por mayor?"],
      teaser: "¿Dudas de este producto? Te digo precio y stock.",
      nav,
    };
  }
  if (seg[0] === "productos" && seg.length === 2) {
    const label = h1 || "esta categoría";
    return {
      kind: "category",
      intro: `Estás en *${label}*. Te ayudo a elegir.`,
      suggestions: [`¿Qué me recomiendas en ${label}?`, "¿Qué marcas tienen?", "Quiero comprar al por mayor"],
      teaser: `¿Te ayudo a elegir en ${label}?`,
      nav,
    };
  }
  if (seg[0] === "cursos" || seg[0] === "cursos-de-unas-portoviejo") {
    return {
      kind: "course",
      intro: "Te cuento todo sobre el curso de uñas acrílicas.",
      suggestions: ["¿Cómo reservo mi cupo?", "¿Qué incluye el curso?", "¿Cuándo empieza el próximo grupo?"],
      teaser: "¿Quieres reservar tu cupo? Te explico cómo.",
      nav,
    };
  }
  if (seg[0] === "locales" || seg[0] === "contacto") {
    return {
      kind: "locations",
      intro: null,
      suggestions: ["¿Cuál es el horario de hoy?", "¿Cómo llego al local?", "¿Hacen envíos a todo Ecuador?"],
      teaser: "¿Necesitas ubicación u horarios? Pregúntame.",
      nav,
    };
  }
  if (onHome) {
    return { kind: "home", intro: null, suggestions: SUGGESTIONS, teaser: "¿Buscas algo en particular? Te ayudo a encontrarlo.", nav };
  }
  return { kind: "other", intro: null, suggestions: SUGGESTIONS, teaser: "¿Necesitas ayuda? Estoy aquí.", nav };
}

const DEFAULT_CTX: PageContext = {
  kind: "other",
  intro: null,
  suggestions: SUGGESTIONS,
  teaser: "¿Necesitas ayuda? Estoy aquí.",
  nav: [],
};

// En celular el panel es una hoja inferior que tapa media pantalla: no se reabre solo al
// cambiar de pagina, para no estorbar la lectura.
function isDesktop(): boolean {
  return window.matchMedia("(min-width: 641px)").matches;
}

function rememberReopen() {
  if (!isDesktop()) return;
  try {
    sessionStorage.setItem(REOPEN_KEY, "1");
  } catch {
    // sin sessionStorage: simplemente no se reabre.
  }
}

// Desplaza la pagina a una seccion y la resalta un momento (la guia "senala" donde esta).
function spotlight(hash: string): boolean {
  const el = document.getElementById(hash);
  if (!el) return false;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const top = el.getBoundingClientRect().top + window.scrollY - 88;
  window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
  el.classList.add("aa-spot");
  window.setTimeout(() => el.classList.remove("aa-spot"), 2200);
  return true;
}

const RICH = /(\*\*[^*\n]+\*\*|\*[^*\n]+\*|https?:\/\/[^\s<>"')]+)/g;

// Texto del asistente -> nodos React (nunca HTML crudo): *negrita* al estilo WhatsApp y
// enlaces http(s) clicables. Un enlace al propio sitio recuerda reabrir el chat al llegar.
function renderRich(text: string): ReactNode[] {
  return text.split(RICH).map((part, i) => {
    if (!part) return null;
    if (/^https?:\/\//.test(part)) {
      const url = part.replace(/[.,;:!?]+$/, "");
      const tail = part.slice(url.length);
      let mismoSitio = false;
      try {
        mismoSitio = new URL(url).origin === location.origin;
      } catch {
        // URL mal formada: se muestra como texto/enlace normal.
      }
      return (
        <span key={i}>
          <a
            href={url}
            {...(mismoSitio ? {} : { target: "_blank", rel: "noopener noreferrer" })}
            onClick={() => {
              if (mismoSitio) rememberReopen();
            }}
          >
            {url}
          </a>
          {tail}
        </span>
      );
    }
    if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (/^\*[^*]+\*$/.test(part)) return <strong key={i}>{part.slice(1, -1)}</strong>;
    return part;
  });
}

// Misma idea que usa Omviqa para detectar "quiero una asesora". Omviqa avisa al equipo, pero un
// visitante web no tiene telefono: la forma real de continuar con una persona es WhatsApp.
function asksForAdvisor(text: string): boolean {
  const t = text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  return /\b(asesora|asesor|humano|humana|persona|alguien|vendedora|vendedor|hablar con (una|un))\b/.test(t);
}

function quotaNote(restantes: unknown): string | undefined {
  if (typeof restantes !== "number" || !Number.isFinite(restantes) || restantes > 10) return undefined;
  return restantes <= 0
    ? "Esta fue tu última consulta de hoy con el asistente."
    : `Te quedan ${restantes} ${restantes === 1 ? "consulta" : "consultas"} hoy con el asistente.`;
}

function onlyHttps(urls: unknown): string[] {
  if (!Array.isArray(urls)) return [];
  return urls.filter((u): u is string => typeof u === "string" && /^https:\/\//.test(u)).slice(0, 4);
}

function friendlyError(status: number): string {
  if (status === 429) return "Estoy recibiendo muchas consultas ahora mismo. Dame unos segundos y toca Reintentar.";
  if (status === 400) return "No pude procesar ese mensaje. ¿Puedes escribirlo de otra forma?";
  return "No logré responder esta vez. Toca Reintentar y lo intento de nuevo.";
}

export default function AssistantWidget({ endpoint, whatsappUrl }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [lastFailed, setLastFailed] = useState<string | null>(null);
  const [ctx, setCtx] = useState<PageContext>(DEFAULT_CTX);
  const [teaser, setTeaser] = useState(false);

  const store = useRef<Stored | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const contextSentFor = useRef<string | null>(null);
  const sendingRef = useRef(false);
  const sendRef = useRef<((raw: string, opts?: SendOpts) => Promise<void>) | null>(null);
  const quoteRef = useRef<((q: QuoteRequest) => Promise<void>) | null>(null);
  const lastOpts = useRef<SendOpts>({});
  const lastSendAt = useRef(0);
  const lastText = useRef("");

  useEffect(() => {
    store.current = loadStored();
    setMessages(store.current.messages);
    const page = getPageContext();
    setCtx(page);

    // Si el visitante llego siguiendo un enlace del chat, el panel sigue abierto.
    try {
      if (sessionStorage.getItem(REOPEN_KEY) === "1") {
        sessionStorage.removeItem(REOPEN_KEY);
        if (isDesktop() && store.current.messages.length > 0) setOpen(true);
        return;
      }
      // Invitacion discreta, una sola vez por sesion y solo si no ha usado el chat.
      if (sessionStorage.getItem(TEASER_KEY) || store.current.messages.length > 0) return;
    } catch {
      return;
    }
    const t = window.setTimeout(() => setTeaser(true), 9000);
    return () => window.clearTimeout(t);
  }, []);

  function dismissTeaser() {
    setTeaser(false);
    try {
      sessionStorage.setItem(TEASER_KEY, "1");
    } catch {
      // Ver rememberReopen.
    }
  }

  const openPanel = useCallback((source: string) => {
    setOpen(true);
    setTeaser(false);
    try {
      sessionStorage.setItem(TEASER_KEY, "1");
    } catch {
      // Ver rememberReopen.
    }
    trackEvent("assistant_open", { source });
  }, []);

  // El Home (u otro CTA) pide abrirlo con `window.dispatchEvent(new Event("alva:open-assistant"))`;
  // si el widget aun no hidrato, el CTA deja la bandera y se abre al montar.
  useEffect(() => {
    const w = window as unknown as { __alvaOpenAssistant?: boolean };
    const w2 = window as unknown as { __alvaPendingQuote?: QuoteRequest };
    // La lista de cotizacion pide abrir el asistente y enviarle los productos.
    const sendQuote = (q: QuoteRequest) => {
      w2.__alvaPendingQuote = undefined;
      openPanel("quote");
      void quoteRef.current?.(q);
    };
    const handler = (e: Event) => {
      w.__alvaOpenAssistant = false;
      const q = (e as CustomEvent<QuoteRequest | undefined>).detail;
      if (q?.message) sendQuote(q);
      else openPanel("cta");
    };
    window.addEventListener("alva:open-assistant", handler);
    if (w2.__alvaPendingQuote) {
      sendQuote(w2.__alvaPendingQuote);
    } else if (w.__alvaOpenAssistant) {
      w.__alvaOpenAssistant = false;
      openPanel("cta");
    }
    return () => window.removeEventListener("alva:open-assistant", handler);
  }, [openPanel]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus({ preventScroll: true });
    const esc = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("keydown", esc);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, sending, open]);

  function close() {
    setOpen(false);
    launcherRef.current?.focus({ preventScroll: true });
  }

  const persist = useCallback((patch: Partial<Stored>) => {
    if (!store.current) store.current = loadStored();
    store.current = { ...store.current, ...patch };
    saveStored(store.current);
  }, []);

  const send = useCallback(
    async (raw: string, opts: SendOpts = {}) => {
      const text = raw.trim().slice(0, opts.quote ? MAX_QUOTE_MESSAGE : MAX_INPUT);
      if (!text || sendingRef.current) return;
      if (!store.current) store.current = loadStored();

      // Reintentar un turno fallido (lastFailed) no cuenta como mensaje repetido.
      const retry = lastFailed === text;
      if (!retry && (Date.now() - lastSendAt.current < MIN_GAP_MS || (!opts.quote && text === lastText.current))) return;
      if (!retry && !takeQuota()) {
        setMessages((prev) => [
          ...prev,
          {
            id: uuid(),
            role: "assistant",
            text: "Llegaste al límite de consultas por hoy con el asistente. Para seguir, una asesora puede atenderte por WhatsApp.",
            handoff: true,
          },
        ]);
        return;
      }
      lastSendAt.current = Date.now();
      lastText.current = text;

      sendingRef.current = true;
      setSending(true);
      setLastFailed(null);
      setInput("");

      const userMsg: UiMessage = { id: uuid(), role: "user", text: opts.display ?? text };
      setMessages((prev) => {
        const next = [...prev, userMsg];
        persist({ messages: next });
        return next;
      });
      trackEvent("assistant_message", { page_path: location.pathname });

      // Contexto de la ficha: solo en el primer mensaje enviado desde esa pagina.
      let mensaje = text;
      const producto = opts.quote ? null : detectProductName();
      if (producto && contextSentFor.current !== location.pathname) {
        mensaje = `${text}\n\n(Contexto: estoy viendo en la web la ficha del producto "${producto}")`;
        contextSentFor.current = location.pathname;
      }

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      try {
        const body = JSON.stringify({
          visitorId: store.current.visitorId,
          mensaje,
          historial: trimHistorial(store.current.historial),
        });
        const post = () =>
          fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body, signal: controller.signal });
        let res: Response;
        try {
          res = await post();
          if (res.status >= 500) throw new Error("5xx");
        } catch (first) {
          if (controller.signal.aborted) throw first;
          // Un fallo de red o 5xx suele ser momentaneo: un reintento silencioso antes de avisar.
          await new Promise((r) => setTimeout(r, 1500));
          res = await post();
        }
        if (!res.ok) {
          const err = (await res.json().catch(() => null)) as { code?: string } | null;
          throw Object.assign(new Error("http"), { status: res.status, code: err?.code });
        }
        const data = (await res.json()) as {
          respuesta?: unknown;
          imagenes?: unknown;
          historial?: unknown;
          aviso?: { restantes?: unknown };
        };
        const respuesta = typeof data.respuesta === "string" && data.respuesta.trim() ? data.respuesta : null;
        if (!respuesta) throw Object.assign(new Error("empty"), { status: 500 });

        const botMsg: UiMessage = { id: uuid(), role: "assistant", text: respuesta, images: onlyHttps(data.imagenes), handoff: asksForAdvisor(text), note: quotaNote(data.aviso?.restantes) };
        const historial = Array.isArray(data.historial) ? (data.historial as Array<{ role?: string }>) : store.current.historial;
        setMessages((prev) => {
          const next = [...prev, botMsg];
          persist({ messages: next.slice(-60), historial: trimHistorial(historial) });
          return next;
        });
      } catch (err) {
        const status = (err as { status?: number }).status ?? 0;
        // Tope diario del servidor: no es un fallo transitorio, asi que no se ofrece Reintentar;
        // se pasa a una asesora por WhatsApp.
        if ((err as { code?: string }).code === "WEB_DAILY_LIMIT") {
          trackEvent("assistant_daily_limit", {});
          setMessages((prev) => [
            ...prev,
            {
              id: uuid(),
              role: "assistant",
              text: "Hoy se alcanzó el límite de consultas del asistente. Una asesora te atiende por WhatsApp.",
              handoff: true,
            },
          ]);
          return;
        }
        trackEvent("assistant_error", { status });
        setLastFailed(text);
        lastOpts.current = opts;
        setMessages((prev) => [
          ...prev,
          { id: uuid(), role: "assistant", text: controller.signal.aborted ? friendlyError(500) : friendlyError(status), error: true },
        ]);
        // El turno fallido no entra al historial; el siguiente intento reenvia el mismo contexto.
        contextSentFor.current = contextSentFor.current === location.pathname && producto ? null : contextSentFor.current;
      } finally {
        clearTimeout(timer);
        sendingRef.current = false;
        setSending(false);
        inputRef.current?.focus({ preventScroll: true });
      }
    },
    [endpoint, persist, lastFailed]
  );

  sendRef.current = send;

  // Lista de cotizacion: primero se carga en el carrito de Omviqa (emparejando por producto, sin
  // adivinar por texto) y luego se pide la proforma. Si Omviqa aun no tiene ese endpoint o falla,
  // se manda la lista como texto, que es lo que el asistente entendia antes.
  quoteRef.current = async (q: QuoteRequest) => {
    if (sendingRef.current) return;
    if (!store.current) store.current = loadStored();
    sendingRef.current = true;
    setSending(true);
    let seeded: SeedResult | null = null;
    try {
      const res = await fetch(endpoint.replace(/\/chat$/, "/quote"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId: store.current.visitorId,
          items: q.items.map(({ productId, quantity }) => ({ productId, quantity })),
        }),
        signal: AbortSignal.timeout(30_000),
      });
      if (res.ok) seeded = (await res.json()) as SeedResult;
    } catch {
      // Se usa el respaldo en texto.
    }
    sendingRef.current = false;
    setSending(false);

    if (seeded && seeded.agregados > 0) {
      const names = new Map(q.items.map((i) => [i.productId, i.name]));
      const faltan = (seeded.omitidos ?? []).map((o) => o.nombre ?? names.get(o.productId) ?? "un producto");
      await send(q.proformaMessage, { display: q.display, quote: true });
      if (faltan.length > 0) {
        setMessages((prev) => [
          ...prev,
          { id: uuid(), role: "assistant", text: `No pude cargar: ${faltan.join(", ")}. El resto de tu lista sí quedó en la cotización.` },
        ]);
      }
    } else {
      await send(q.message, { display: q.display, quote: true });
    }
  };

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send(input);
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void send(input);
    }
  }

  // La guia: lleva al visitante a una seccion de esta pagina (y la senala) o a otra pagina.
  function go(item: NavItem) {
    trackEvent("assistant_guide", { target: item.label });
    const here = (location.pathname.replace(/\/+$/, "") || "/") === item.path;
    if (here && item.hash && spotlight(item.hash)) {
      if (!isDesktop()) setOpen(false);
      return;
    }
    rememberReopen();
    location.href = item.hash ? `${item.path}#${item.hash}` : item.path;
  }

  function reset() {
    const fresh = { visitorId: uuid(), historial: [], messages: [], updatedAt: Date.now() };
    store.current = fresh;
    saveStored(fresh);
    contextSentFor.current = null;
    setMessages([]);
    setLastFailed(null);
  }

  const welcome: UiMessage = {
    id: "welcome",
    role: "assistant",
    text: ctx.intro ? `¡Hola! ${ctx.intro}` : WELCOME_TEXT,
  };
  const visible = [welcome, ...messages];
  const hasUserMessage = messages.some((m) => m.role === "user");

  return (
    <div className="aa-root">
      {teaser && !open && (
        <div className="aa-teaser" role="status">
          <button type="button" className="aa-teaser-text" onClick={() => openPanel("teaser")}>
            {ctx.teaser}
          </button>
          <button type="button" className="aa-teaser-x" aria-label="Cerrar sugerencia" onClick={dismissTeaser}>
            ×
          </button>
        </div>
      )}
      <button
        ref={launcherRef}
        type="button"
        className="aa-launcher"
        hidden={open}
        aria-label="Abrir el asistente de Alva"
        aria-expanded={open}
        aria-controls="aa-panel"
        onClick={() => openPanel("launcher")}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.5-4.7A8 8 0 1 1 21 12Z" />
          <path d="M9 11h6M9 14h3.5" />
        </svg>
        <span className="aa-launcher-label">Pregúntale al asistente</span>
      </button>

      <section id="aa-panel" className="aa-panel" role="dialog" aria-label="Asistente de Alva Importaciones" hidden={!open}>
        <header className="aa-head">
          <img className="aa-avatar" src="/brand/alva-icon-96.png" alt="" width="36" height="36" />
          <div className="aa-head-text">
            <h2 className="aa-title">Asistente Alva</h2>
            <p className="aa-status">
              <span className="aa-dot" aria-hidden="true" />
              En línea · responde al instante
            </p>
          </div>
          <button type="button" className="aa-close" aria-label="Cerrar el asistente" onClick={close}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </header>

        <div ref={bodyRef} className="aa-body" role="log" aria-live="polite" aria-relevant="additions">
          {visible.map((m) => (
            <div key={m.id} style={{ display: "contents" }}>
              <div className={`aa-msg ${m.role === "user" ? "aa-msg-user" : "aa-msg-bot"}${m.error ? " aa-msg-error" : ""}`}>
                {m.role === "assistant" ? renderRich(m.text) : m.text}
              </div>
              {m.note && <p className="aa-note">{m.note}</p>}
              {m.handoff && (
                <a
                  className="aa-handoff"
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-track-event="click_whatsapp"
                  data-track-source="assistant_handoff"
                >
                  Continuar con una asesora por WhatsApp →
                </a>
              )}
              {m.images && m.images.length > 0 && (
                <div className="aa-images">
                  {m.images.map((src) => (
                    <a key={src} href={src} target="_blank" rel="noopener noreferrer">
                      <img src={src} alt="Imagen del producto" loading="lazy" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}

          {!hasUserMessage && (
            <>
              <p className="aa-chips-label">Preguntas frecuentes</p>
              <div className="aa-chips" aria-label="Preguntas sugeridas">
                {ctx.suggestions.map((s) => (
                  <button key={s} type="button" className="aa-chip" onClick={() => void send(s)} disabled={sending}>
                    {s}
                  </button>
                ))}
              </div>
            </>
          )}

          {ctx.nav.length > 0 && (
            <>
              <p className="aa-chips-label">Te llevo a</p>
              <div className="aa-nav" aria-label="Ir a una sección">
                {ctx.nav.map((n) => (
                  <button key={n.label} type="button" className="aa-nav-btn" onClick={() => go(n)}>
                    {n.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {lastFailed && !sending && (
            <button type="button" className="aa-retry" onClick={() => void send(lastFailed, lastOpts.current)}>
              Reintentar
            </button>
          )}

          {sending && (
            <div className="aa-typing" role="status" aria-label="El asistente está escribiendo">
              <span />
              <span />
              <span />
            </div>
          )}
        </div>

        <form className="aa-form" onSubmit={onSubmit}>
          <label className="aa-sr" htmlFor="aa-input">
            Escribe tu consulta
          </label>
          <input
            id="aa-input"
            ref={inputRef}
            className="aa-input"
            type="text"
            value={input}
            maxLength={MAX_INPUT}
            autoComplete="off"
            placeholder="Escribe tu consulta…"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
          />
          <button type="submit" className="aa-send" aria-label="Enviar mensaje" disabled={sending || !input.trim()}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </form>

        <div className="aa-foot">
          <span>Respuestas con IA: confirma precio y stock por WhatsApp.</span>
          <span>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" data-track-event="click_whatsapp" data-track-source="assistant">
              Hablar con una asesora
            </a>
            {hasUserMessage && (
              <>
                {" · "}
                <a
                  href="#nueva"
                  onClick={(e) => {
                    e.preventDefault();
                    reset();
                  }}
                >
                  Nueva conversación
                </a>
              </>
            )}
          </span>
        </div>
      </section>
    </div>
  );
}
