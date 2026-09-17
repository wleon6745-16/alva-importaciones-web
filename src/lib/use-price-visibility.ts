import { useEffect, useState } from "react";

// Politica de precios para las islas React.
//
// Las islas refrescan productos en el navegador, y esas respuestas pueden venir
// de la cache HTTP de hace unos minutos, todavia con precio. Por eso preguntan
// aparte (sin cache) si el negocio publica precios, y si no, no los pintan.
// Una sola consulta por pagina, compartida por todas las islas.

const consultas = new Map<string, Promise<boolean>>();

function preciosVisibles(apiBaseUrl: string): Promise<boolean> {
  let consulta = consultas.get(apiBaseUrl);
  if (!consulta) {
    consulta = fetch(`${apiBaseUrl}/settings`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { settings?: { showPrices?: unknown } } | null) => data?.settings?.showPrices !== false)
      // Sin respuesta no se decide nada nuevo: queda lo que trajo el HTML.
      .catch(() => true);
    consultas.set(apiBaseUrl, consulta);
  }
  return consulta;
}

// BaseLayout ya pregunto antes de hidratar y, si los precios estan ocultos,
// cambio el texto del HTML y dejo esta marca: se arranca igual que el DOM.
function yaOcultos(): boolean {
  return typeof window !== "undefined" && (window as { __alvaShowPrices?: boolean }).__alvaShowPrices === false;
}

export function useShowPrices(apiBaseUrl: string): boolean {
  const [visibles, setVisibles] = useState(() => !yaOcultos());
  useEffect(() => {
    if (!apiBaseUrl) return;
    let vivo = true;
    preciosVisibles(apiBaseUrl).then((v) => {
      if (vivo) setVisibles(v);
    });
    return () => {
      vivo = false;
    };
  }, [apiBaseUrl]);
  return visibles;
}
