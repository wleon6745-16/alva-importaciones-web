#!/usr/bin/env node
// Prepara el archivo de verificación de IndexNow (`/{key}.txt`) ANTES de `astro build`, para que
// quede incluido en `dist/` cuando exista una clave real.
//
// La clave NUNCA vive en el repo en texto plano (ver docs/seo-work/MANUAL_ACTIONS.md #10): se lee
// de la variable de entorno INDEXNOW_KEY, que el hosting real debe configurar fuera del repo
// (o un .env local, ya en .gitignore). Sin esa variable, este script no hace nada — build sigue
// funcionando con normalidad, IndexNow simplemente no está activo todavía.
//
// Uso: node scripts/indexnow-prepare-keyfile.mjs
// Se ejecuta automáticamente antes de `npm run build` (ver "prebuild" en package.json).

import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT, "public");

const key = process.env.INDEXNOW_KEY;

if (!key) {
  console.log(
    "[indexnow] INDEXNOW_KEY no está configurada — se omite la generación del archivo de " +
      "verificación. Ver docs/AUTOMATED_TASKS.md sección 4 para activarlo cuando exista una " +
      "clave real.",
  );
  process.exit(0);
}

if (!/^[a-z0-9]{8,128}$/i.test(key)) {
  console.error("[indexnow] INDEXNOW_KEY tiene un formato inválido (debe ser alfanumérico, 8-128 caracteres).");
  process.exit(1);
}

mkdirSync(PUBLIC_DIR, { recursive: true });
const keyFilePath = path.join(PUBLIC_DIR, `${key}.txt`);
writeFileSync(keyFilePath, key + "\n", "utf-8");
console.log(`[indexnow] Archivo de verificación escrito: public/${key}.txt`);
