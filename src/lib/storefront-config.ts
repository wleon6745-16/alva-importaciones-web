// Config publica de la Storefront API de ASISTENTE. El channelId NO es
// secreto (mismo principio que el Web Channel -- ver ASISTENTE/docs/
// web-channel-phase513.md seccion D): identifica el tenant, no autentica.
// La autorizacion real la da el Origin de la peticion (CORS por canal) del
// lado de ASISTENTE. Ambas variables deben estar prefijadas PUBLIC_ para que
// Vite/Astro las exponga tambien al bundle del navegador (CatalogExplorer
// las necesita ahi para poder llamar la API en vivo).
export const storefrontApiUrl = import.meta.env.PUBLIC_STOREFRONT_API_URL ?? "";
export const storefrontChannelId = import.meta.env.PUBLIC_STOREFRONT_CHANNEL_ID ?? "";
