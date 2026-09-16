// Config publica de la Storefront API de ASISTENTE. El channelId NO es
// secreto (mismo principio que el Web Channel -- ver ASISTENTE/docs/
// web-channel-phase513.md seccion D): identifica el tenant, no autentica.
// La autorizacion real la da el Origin de la peticion (CORS por canal) del
// lado de ASISTENTE. Ambas variables deben estar prefijadas PUBLIC_ para que
// Vite/Astro las exponga tambien al bundle del navegador (CatalogExplorer
// las necesita ahi para poder llamar la API en vivo).
export const storefrontApiUrl = import.meta.env.PUBLIC_STOREFRONT_API_URL ?? "";
export const storefrontChannelId = import.meta.env.PUBLIC_STOREFRONT_CHANNEL_ID ?? "";

/**
 * Base de la Storefront API para este canal, o null si falta configuracion.
 *
 * PUBLIC_STOREFRONT_API_URL es el ORIGEN de Omviqa (https://api.omviqa.com,
 * ver .env.example), igual que lo usan el snapshot y CatalogExplorer. Las
 * lecturas del home y de las paginas editoriales armaban la ruta sin
 * `/api/storefront`, asi que con la configuracion documentada pedian
 * https://api.omviqa.com/<canal>/home -- un 404 -- y el sitio nunca mostraba
 * lo publicado desde Omviqa. Una sola funcion para que no vuelvan a divergir.
 */
export function storefrontBaseUrl(): string | null {
  if (!storefrontApiUrl || !storefrontChannelId) return null;
  return `${storefrontApiUrl.replace(/\/+$/, "")}/api/storefront/${storefrontChannelId}`;
}
