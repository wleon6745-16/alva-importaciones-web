// ¿Se muestran precios en el sitio?
//
// Lo decide ALVA desde Omviqa (Sitio web → Catálogo público). La API ya no
// envia precios cuando estan ocultos, pero este sitio tambien tiene precios
// escritos a mano en sus paginas curadas: esos se ocultan aqui.
//
// Se pregunta una vez en el build. Ademas, BaseLayout vuelve a preguntar en
// el navegador y oculta al instante cualquier precio marcado con
// `data-precio`: apagar los precios en Omviqa tiene efecto sin recompilar.
// (Volver a encenderlos si requiere un build, porque el HTML ya no los trae.)
import { storefrontBaseUrl } from "./storefront-config";

async function preguntar(): Promise<boolean> {
  const base = storefrontBaseUrl();
  // Sin conexion a Omviqa configurada (desarrollo sin API): como siempre.
  if (!base) return true;
  try {
    const res = await fetch(`${base}/settings`);
    // Conectado pero sin respuesta: ANTE LA DUDA, SIN PRECIOS. Publicar un
    // precio que el negocio quizas no queria enseñar no tiene vuelta atras;
    // ocultarlo por error solo pide un nuevo build.
    if (!res.ok) return false;
    const data = (await res.json()) as { settings?: { showPrices?: unknown } };
    return data.settings?.showPrices === true;
  } catch {
    return false;
  }
}

export const showPrices: boolean = await preguntar();

export const PRECIO_OCULTO = "Consultar precio";
