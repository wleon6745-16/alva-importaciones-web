#!/usr/bin/env node
// Envía URLs a IndexNow (Bing/Yandex/etc.) DESPUÉS de un despliegue exitoso.
//
// La clave se lee de la variable de entorno INDEXNOW_KEY (nunca del repo). Sin esa variable,
// este script no hace nada (no falla el proceso de build/deploy).
//
// Uso:
//   node scripts/indexnow-submit.mjs                → envía todas las URLs de dist/sitemap-0.xml
//   node scripts/indexnow-submit.mjs <url1> <url2>  → envía solo las URLs indicadas (recomendado
//                                                      tras un deploy normal: pasar solo lo que
//                                                      cambió, ver docs/AUTOMATED_TASKS.md #4)

import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SITEMAP_PATH = path.join(ROOT, "dist", "sitemap-0.xml");
const ENDPOINT = "https://api.indexnow.org/indexnow";
const HOST = "alvaimportaciones.com";

const key = process.env.INDEXNOW_KEY;

if (!key) {
  console.log(
    "[indexnow] INDEXNOW_KEY no está configurada — no se envía nada. Ver " +
      "docs/AUTOMATED_TASKS.md sección 4 para activarlo cuando exista una clave real.",
  );
  process.exit(0);
}

function urlsFromArgs() {
  const args = process.argv.slice(2);
  return args.length > 0 ? args : null;
}

function urlsFromSitemap() {
  if (!existsSync(SITEMAP_PATH)) {
    console.error(`[indexnow] No existe ${path.relative(ROOT, SITEMAP_PATH)}. Corre "npm run build" primero.`);
    process.exit(1);
  }
  const xml = readFileSync(SITEMAP_PATH, "utf-8");
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

async function main() {
  const urlList = urlsFromArgs() ?? urlsFromSitemap();

  if (urlList.length === 0) {
    console.log("[indexnow] No hay URLs para enviar.");
    return;
  }

  const body = {
    host: HOST,
    key,
    keyLocation: `https://${HOST}/${key}.txt`,
    urlList,
  };

  console.log(`[indexnow] Enviando ${urlList.length} URL(s) a ${ENDPOINT}...`);

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    console.error(`[indexnow] Fallo: HTTP ${response.status} ${response.statusText}`);
    const text = await response.text().catch(() => "");
    if (text) console.error(text);
    process.exit(1);
  }

  console.log(`[indexnow] OK (HTTP ${response.status}).`);
}

main();
