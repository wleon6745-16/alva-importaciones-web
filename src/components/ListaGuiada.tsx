import { useEffect, useRef, useState } from "react";

// LA CLIENTA ELIGE; EL ASISTENTE NO ADIVINA.
//
// Cuando alguien pega una lista ("polygel blanco, pincel para gel, monomero
// eya..."), el asistente tenia que adivinar marca y presentacion de cada
// renglon, y se equivocaba: a "pincel para polygel" le ofrecia polygel, a
// "monomero eya" le daba Mia Secret. Aqui cada renglon muestra sus opciones del
// catalogo (Omviqa entiende faltas y sinonimos) y ella toca la que es. Lo
// elegido entra a su lista de cotizacion y el asistente le arma la cotizacion.

export interface OpcionLista {
  publicProductId: string;
  code: string | null;
  name: string;
  brand: string | null;
  imageUrl: string | null;
}

export interface RenglonLista {
  linea: string;
  cantidad: number;
  opciones: OpcionLista[];
}

export interface Eleccion {
  opcion: OpcionLista;
  cantidad: number;
}

interface Props {
  renglones: RenglonLista[];
  ocupado: boolean;
  buscarOtraVez: (texto: string) => Promise<RenglonLista | null>;
  confirmar: (elegidos: Eleccion[]) => void;
  cancelar: () => void;
}

const marcaVisible = (m: string | null) => Boolean(m && /[A-Za-z0-9]/.test(m));

export default function ListaGuiada({ renglones: iniciales, ocupado, buscarOtraVez, confirmar, cancelar }: Props) {
  const [renglones, setRenglones] = useState(iniciales);
  // Con una sola opcion no hay nada que decidir: ya va marcada (y se puede quitar).
  const [elegido, setElegido] = useState<Array<string | null>>(() =>
    iniciales.map((r) => (r.opciones.length === 1 ? r.opciones[0].publicProductId : null))
  );
  const [cantidades, setCantidades] = useState(() => iniciales.map((r) => r.cantidad));
  const [otraForma, setOtraForma] = useState<Record<number, string>>({});
  const [buscando, setBuscando] = useState<number | null>(null);

  const total = elegido.filter(Boolean).length;

  function elegir(i: number, id: string) {
    setElegido((prev) => prev.map((x, j) => (j === i ? (x === id ? null : id) : x)));
  }

  function cambiarCantidad(i: number, delta: number) {
    setCantidades((prev) => prev.map((q, j) => (j === i ? Math.min(999, Math.max(1, q + delta)) : q)));
  }

  async function reintentar(i: number) {
    const texto = (otraForma[i] ?? "").trim();
    if (texto.length < 2) return;
    setBuscando(i);
    const nuevo = await buscarOtraVez(texto);
    setBuscando(null);
    if (!nuevo) return;
    setRenglones((prev) => prev.map((r, j) => (j === i ? { ...nuevo, linea: texto, cantidad: r.cantidad } : r)));
    setElegido((prev) => prev.map((x, j) => (j === i ? (nuevo.opciones.length === 1 ? nuevo.opciones[0].publicProductId : null) : x)));
  }

  function terminar() {
    const elegidos: Eleccion[] = [];
    renglones.forEach((r, i) => {
      const op = r.opciones.find((o) => o.publicProductId === elegido[i]);
      if (op) elegidos.push({ opcion: op, cantidad: cantidades[i] });
    });
    if (elegidos.length > 0) confirmar(elegidos);
  }

  const listos = elegido.filter(Boolean).length;

  // Al abrirse, se empieza por el primer renglon (el chat bajaba al final).
  const raiz = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const t = window.setTimeout(() => raiz.current?.scrollIntoView({ block: "start" }), 60);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div ref={raiz} className="aa-lista" aria-label="Elige los productos de tu lista">
      <div className="aa-lista-cabeza">
        <strong>Tu lista</strong>
        <span>
          {listos} de {renglones.length} elegido{renglones.length === 1 ? "" : "s"}
        </span>
        <span className="aa-lista-barra" aria-hidden="true">
          <span style={{ width: `${renglones.length ? Math.round((listos / renglones.length) * 100) : 0}%` }} />
        </span>
      </div>
      {renglones.map((r, i) => (
        <fieldset key={i} className={`aa-lista-renglon${elegido[i] ? " aa-lista-hecho" : ""}`}>
          <legend>
            <span className="aa-lista-num">{i + 1}.</span> {r.linea}
          </legend>
          <div className="aa-lista-cant" aria-label={`Cantidad de ${r.linea}`}>
            <button type="button" onClick={() => cambiarCantidad(i, -1)} aria-label="Una menos">−</button>
            <span>{cantidades[i]}</span>
            <button type="button" onClick={() => cambiarCantidad(i, 1)} aria-label="Una más">+</button>
          </div>
          {r.opciones.length > 0 ? (
            <div className="aa-lista-opciones" role="radiogroup">
              {/* Elegido uno, el renglon se pliega: con 20 productos la lista
                  se acorta a medida que avanza. "Cambiar" lo vuelve a abrir. */}
              {r.opciones.filter((o) => !elegido[i] || elegido[i] === o.publicProductId).map((o) => {
                const activo = elegido[i] === o.publicProductId;
                return (
                  <button
                    key={o.publicProductId}
                    type="button"
                    role="radio"
                    aria-checked={activo}
                    className={`aa-lista-op${activo ? " aa-lista-op-on" : ""}`}
                    onClick={() => elegir(i, o.publicProductId)}
                  >
                    {o.imageUrl ? <img src={o.imageUrl} alt="" loading="lazy" width="44" height="44" /> : <span className="aa-lista-sinfoto" aria-hidden="true" />}
                    <span className="aa-lista-txt">
                      <span className="aa-lista-nombre">{o.name}</span>
                      {marcaVisible(o.brand) && <span className="aa-lista-marca">{o.brand}</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="aa-lista-nada">No lo encontré así.</p>
          )}
          {elegido[i] ? (
            r.opciones.length > 1 && (
              <button type="button" className="aa-lista-cambiar" onClick={() => setElegido((prev) => prev.map((x, j) => (j === i ? null : x)))}>
                Cambiar
              </button>
            )
          ) : (
          <div className="aa-lista-otra">
            <input
              type="text"
              value={otraForma[i] ?? ""}
              maxLength={120}
              placeholder={r.opciones.length ? "¿No está? Escríbelo de otra forma" : "Escríbelo de otra forma (marca, tamaño…)"}
              onChange={(e) => setOtraForma((prev) => ({ ...prev, [i]: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void reintentar(i);
                }
              }}
            />
            <button type="button" onClick={() => void reintentar(i)} disabled={buscando === i}>
              {buscando === i ? "…" : "Buscar"}
            </button>
          </div>
          )}
        </fieldset>
      ))}
      <div className="aa-lista-pie">
        <button type="button" className="aa-lista-ok" onClick={terminar} disabled={total === 0 || ocupado}>
          {total === 0 ? "Elige al menos un producto" : `Agregar ${total} a mi cotización`}
        </button>
        <button type="button" className="aa-lista-cancelar" onClick={cancelar}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
