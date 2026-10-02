// Asistente web de Alva (Web Channel de Omviqa): POST /api/web-channel/:channelId/chat.
//
// El channelId es publico por diseno (identifica el tenant, no autentica -- la
// proteccion real es el Origin autorizado de ESE canal del lado de Omviqa), asi
// que tiene un valor por defecto en el codigo: el sitio funciona sin tocar las
// variables de Cloudflare. PUBLIC_ASSISTANT_CHANNEL_ID existe solo para apuntar a
// otro canal (por ejemplo uno de pruebas).
import { storefrontApiUrl } from "./storefront-config";

const DEFAULT_ASSISTANT_CHANNEL_ID = "2cb8f991-e0ce-4829-b46f-a0ded0b87e5b";

export const assistantChannelId: string =
  import.meta.env.PUBLIC_ASSISTANT_CHANNEL_ID || DEFAULT_ASSISTANT_CHANNEL_ID;

/** URL del chat del asistente, o null si el sitio no tiene Omviqa configurado. */
export function assistantEndpoint(): string | null {
  if (!storefrontApiUrl) return null;
  return `${storefrontApiUrl.replace(/\/+$/, "")}/api/web-channel/${assistantChannelId}/chat`;
}
