// Validador SEO automático: recorre `dist/` (después de `astro build`) y detecta problemas
// comunes de SEO/estructura. Pensado para correr en CI/pre-deploy (`npm run seo:validate`) y
// también a mano durante el desarrollo.
//
// Uso: npm run build && npm run seo:validate

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const PRODUCTS_PATH = path.join(ROOT, "src", "data", "products.generated.json");

interface Issue {
  severity: "error" | "warning";
  check: string;
  message: string;
}

const issues: Issue[] = [];
function report(severity: Issue["severity"], check: string, message: string) {
  issues.push({ severity, check, message });
}

function walkHtmlFiles(dir: string, files: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkHtmlFiles(full, files);
    else if (entry.name.endsWith(".html")) files.push(full);
  }
  return files;
}

function urlPathFor(filePath: string): string {
  const rel = path.relative(DIST, filePath).split(path.sep).join("/");
  if (rel === "404.html") return "/404";
  if (rel === "index.html") return "/";
  return "/" + rel.replace(/index\.html$/, "").replace(/\.html$/, "");
}

function main() {
  if (!existsSync(DIST)) {
    console.error(`No existe ${path.relative(ROOT, DIST)}. Corre "npm run build" primero.`);
    process.exit(1);
  }
  if (!existsSync(PRODUCTS_PATH)) {
    console.error(`No existe ${path.relative(ROOT, PRODUCTS_PATH)}. Corre "npm run catalog:sync" primero.`);
    process.exit(1);
  }

  const files = walkHtmlFiles(DIST).filter((f) => !f.endsWith("404.html"));
  const pages = files.map((f) => {
    const html = readFileSync(f, "utf-8");
    return { file: f, url: urlPathFor(f), html };
  });

  const titles = new Map<string, string[]>();
  const descriptions = new Map<string, string[]>();
  const linkGraph = new Map<string, Set<string>>();
  const allUrls = new Set(pages.map((p) => p.url));

  for (const page of pages) {
    const { file, url, html } = page;
    const rel = path.relative(ROOT, file);

    // 1. Título
    const titleMatch = html.match(/<title>([^<]*)<\/title>/);
    if (!titleMatch || !titleMatch[1].trim()) {
      report("error", "title", `${rel}: sin <title>`);
    } else {
      const t = titleMatch[1].trim();
      titles.set(t, [...(titles.get(t) ?? []), url]);
    }

    // 2. Meta description
    const descMatch = html.match(/<meta name="description" content="([^"]*)"/);
    if (!descMatch || !descMatch[1].trim()) {
      report("error", "description", `${rel}: sin meta description`);
    } else {
      const d = descMatch[1].trim();
      descriptions.set(d, [...(descriptions.get(d) ?? []), url]);
    }

    // 3. Canonical
    const canonicalMatch = html.match(/<link rel="canonical" href="([^"]*)"/);
    if (!canonicalMatch) {
      report("error", "canonical", `${rel}: sin canonical`);
    } else if (/localhost|127\.0\.0\.1/.test(canonicalMatch[1])) {
      report("error", "canonical", `${rel}: canonical apunta a localhost (${canonicalMatch[1]})`);
    }

    // 4. h1 — dentro de <main> si existe, si no en toda la página
    const mainMatch = html.match(/<main[\s\S]*?<\/main>/);
    const scope = mainMatch ? mainMatch[0] : html;
    const h1Count = (scope.match(/<h1[ >]/g) ?? []).length;
    if (h1Count === 0) report("error", "h1", `${rel}: no tiene <h1>`);
    if (h1Count > 1) report("error", "h1", `${rel}: tiene ${h1Count} <h1> (debe ser 1)`);

    // 5. Imágenes sin alt
    const imgs = [...html.matchAll(/<img\b[^>]*>/g)];
    for (const img of imgs) {
      if (!/\balt="/.test(img[0])) {
        report("error", "alt", `${rel}: <img> sin atributo alt (${img[0].slice(0, 80)}...)`);
      }
    }

    // 6. JSON-LD válido
    const ldScripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    for (const [, jsonText] of ldScripts) {
      try {
        JSON.parse(jsonText);
      } catch (e) {
        report("error", "json-ld", `${rel}: JSON-LD inválido (${(e as Error).message})`);
      }
    }

    // Recolectar enlaces internos para "rotos" y "huérfanas"
    const hrefs = [...html.matchAll(/<a\b[^>]*\shref="([^"]*)"/g)].map((m) => m[1]);
    const internalTargets = new Set<string>();
    for (const href of hrefs) {
      if (!href.startsWith("/") || href.startsWith("//")) continue; // externo o protocolo-relativo
      const clean = href.split("#")[0].split("?")[0].replace(/\/$/, "") || "/";
      internalTargets.add(clean);
    }
    const normalizedUrl = url.replace(/\/$/, "") || "/";
    linkGraph.set(normalizedUrl, internalTargets);
  }

  // 7. Títulos duplicados
  for (const [title, urls] of titles) {
    if (urls.length > 1) {
      report("error", "title-duplicate", `Título duplicado "${title}" en: ${urls.join(", ")}`);
    }
  }

  // 8. Descripciones duplicadas
  for (const [desc, urls] of descriptions) {
    if (urls.length > 1) {
      report("error", "description-duplicate", `Meta description duplicada en: ${urls.join(", ")} ("${desc.slice(0, 60)}...")`);
    }
  }

  // 9. Enlaces internos rotos
  const normalizedUrls = new Set([...allUrls].map((u) => u.replace(/\/$/, "") || "/"));
  for (const [fromUrl, targets] of linkGraph) {
    for (const target of targets) {
      if (!normalizedUrls.has(target)) {
        report("error", "broken-link", `${fromUrl}: enlace interno roto -> ${target}`);
      }
    }
  }

  // 10. Páginas huérfanas (no alcanzables desde "/" siguiendo enlaces internos)
  const visited = new Set<string>(["/"]);
  const queue = ["/"];
  while (queue.length > 0) {
    const current = queue.shift()!;
    const targets = linkGraph.get(current) ?? new Set();
    for (const target of targets) {
      const normalized = target.replace(/\/$/, "") || "/";
      if (!visited.has(normalized) && normalizedUrls.has(normalized)) {
        visited.add(normalized);
        queue.push(normalized);
      }
    }
  }
  for (const url of normalizedUrls) {
    if (!visited.has(url)) {
      report("warning", "orphan-page", `Página huérfana (sin enlace interno entrante detectado): ${url}`);
    }
  }

  // 11. Slugs duplicados y productos con información insuficiente (desde el catálogo, no del HTML)
  const products = JSON.parse(readFileSync(PRODUCTS_PATH, "utf-8")).products as Array<{
    id: string;
    slug: string;
    name?: string;
    category: string;
    image?: string;
    features?: string[];
  }>;
  const slugsByCategory = new Map<string, string[]>();
  for (const p of products) {
    const key = `${p.category}/${p.slug}`;
    slugsByCategory.set(key, [...(slugsByCategory.get(key) ?? []), p.id]);
    if (!p.name || !p.name.trim()) {
      report("error", "product-incomplete", `Producto sin nombre: ${p.id}`);
    }
    if (!p.image) {
      report("error", "product-incomplete", `Producto sin imagen: ${p.id}`);
    }
    if ((!p.features || p.features.length === 0)) {
      report("warning", "product-incomplete", `Producto sin características listadas: ${p.id} (puede ser válido si la fuente no traía más detalle)`);
    }
  }
  for (const [key, ids] of slugsByCategory) {
    if (ids.length > 1) {
      report("error", "slug-duplicate", `Slug duplicado "${key}" en productos: ${ids.join(", ")}`);
    }
  }

  // --- Reporte ---
  const errors = issues.filter((i) => i.severity === "error");
  const warnings = issues.filter((i) => i.severity === "warning");

  console.log(`\nPáginas analizadas: ${pages.length}. Productos analizados: ${products.length}.\n`);

  if (errors.length > 0) {
    console.log(`ERRORES (${errors.length}):`);
    for (const i of errors) console.log(`  [${i.check}] ${i.message}`);
  }
  if (warnings.length > 0) {
    console.log(`\nAVISOS (${warnings.length}, no bloquean):`);
    for (const i of warnings) console.log(`  [${i.check}] ${i.message}`);
  }

  if (errors.length === 0) {
    console.log("\n✅ Validación SEO OK (sin errores bloqueantes).");
  } else {
    console.log(`\n❌ Validación SEO falló: ${errors.length} error(es).`);
    process.exit(1);
  }
}

main();
