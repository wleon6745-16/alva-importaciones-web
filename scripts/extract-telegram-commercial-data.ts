// Extractor CONTROLADO de datos comerciales candidatos desde el export de Telegram.
//
// "Controlado" significa: no publica nada automáticamente. Solo lee los HTML del export, agrupa
// candidatos por categoría (horarios, políticas, cursos, FAQ, características de producto) y
// escribe un reporte en reports/telegram-data-candidates.md para que un humano (o una sesión
// futura con instrucción explícita) decida qué usar. También compara contra los datos ya
// publicados en el sitio (horario en site-config.ts, curso en cursos.astro) y registra
// discrepancias como candidatos a nuevo conflicto — no las resuelve, no sobrescribe nada.
//
// Uso: node scripts/extract-telegram-commercial-data.ts [rutaAlExportDeTelegram]
// Por defecto usa la ruta documentada en docs/seo-work/CURRENT_STATE.md.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { siteConfig } from "../src/lib/site-config.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const REPORT_PATH = path.join(ROOT, "reports", "telegram-data-candidates.md");

const DEFAULT_EXPORT_DIR =
  "C:\\Users\\wleon\\Downloads\\38833FF26BA1D.UnigramPreview_g9c9v27vpyspw!App\\ChatExport_2026-08-06";

const exportDir = process.argv[2] || DEFAULT_EXPORT_DIR;
const sourceFiles = ["messages.html", "messages2.html"].map((f) => path.join(exportDir, f));

interface Message {
  source: string;
  date: string;
  text: string;
}

function decodeEntities(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&laquo;/g, "«")
    .replace(/&raquo;/g, "»")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

function extractMessages(filePath: string): Message[] {
  if (!existsSync(filePath)) {
    console.warn(`Aviso: no se encontró ${filePath}, se omite.`);
    return [];
  }
  const html = readFileSync(filePath, "utf-8");
  const source = path.basename(filePath);
  const messages: Message[] = [];

  // Cada mensaje de texto tiene un bloque de fecha ("pull_right date details" con el título ISO
  // simplificado) seguido, más adelante en el mismo bloque, de un div.text con el contenido.
  // Se itera con un regex no-greedy entre un date-title y el próximo, capturando el texto que
  // haya en medio si existe un div.text.
  const dateRe = /pull_right date details" title="([^"]+)"/g;
  const matches = [...html.matchAll(dateRe)];

  for (let i = 0; i < matches.length; i++) {
    const date = matches[i][1];
    const start = matches[i].index ?? 0;
    const end = i + 1 < matches.length ? matches[i + 1].index! : html.length;
    const chunk = html.slice(start, end);
    const textMatch = chunk.match(/<div class="text">([\s\S]*?)<\/div>/);
    if (!textMatch) continue;
    const text = decodeEntities(textMatch[1]);
    if (!text) continue;
    messages.push({ source, date, text });
  }

  return messages;
}

const CATEGORY_PATTERNS: Record<string, RegExp> = {
  horarios: /horario|atendemos|atenci[oó]n al cliente|abrimos|cerramos|lunes a|domingo/i,
  politicas: /garant[ií]a|cambio[s]?\b|devoluci[oó]n|env[ií]o[s]?|factura|abono|reserva|domicilio/i,
  cursos: /curso|matr[ií]cula|clases|cupo|inscripci[oó]n|nail\s*art.*(clase|curso)/i,
  faq: /\?/,
};

function classify(text: string): string[] {
  const cats: string[] = [];
  for (const [cat, re] of Object.entries(CATEGORY_PATTERNS)) {
    if (re.test(text)) cats.push(cat);
  }
  if (cats.length === 0 && /precio:/i.test(text)) cats.push("caracteristicas");
  return cats;
}

function main() {
  const allMessages = sourceFiles.flatMap(extractMessages);
  console.log(`Mensajes de texto leídos: ${allMessages.length}`);

  const byCategory: Record<string, Message[]> = {
    horarios: [],
    politicas: [],
    cursos: [],
    faq: [],
    caracteristicas: [],
  };

  const seen = new Set<string>();
  for (const msg of allMessages) {
    const key = msg.text.slice(0, 120);
    if (seen.has(key)) continue; // deduplicar mensajes repetidos/reenviados
    const cats = classify(msg.text);
    if (cats.length === 0) continue;
    seen.add(key);
    for (const cat of cats) byCategory[cat].push(msg);
  }

  // Discrepancias candidatas contra datos ya publicados — se listan, no se resuelven.
  const candidateConflicts: string[] = [];
  const publishedHours = siteConfig.hours.map((h) => `${h.days}: ${h.time}`).join(" / ");
  for (const msg of byCategory.horarios) {
    const mentionsDifferentHour = /\b(1[0-9]|2[0-3]|[0-9]):[0-5][0-9]\b/.test(msg.text) &&
      !msg.text.includes("9:00") && !msg.text.includes("18:00") && !msg.text.includes("13:00");
    if (mentionsDifferentHour) {
      candidateConflicts.push(
        `Horario mencionado en Telegram (${msg.source}, ${msg.date}) no coincide con el publicado ` +
          `("${publishedHours}"): "${msg.text.replace(/\n/g, " / ")}"`,
      );
    }
  }
  for (const msg of byCategory.cursos) {
    const priceMatch = msg.text.match(/\$\s?(\d+(?:[.,]\d+)?)/);
    if (priceMatch && !["60", "10", "30"].includes(priceMatch[1].replace(",", "."))) {
      candidateConflicts.push(
        `Precio de curso mencionado en Telegram (${msg.source}, ${msg.date}) distinto de lo ` +
          `publicado en /cursos ($60/mes, $10 matrícula, 2 pagos de $30): "${msg.text.replace(/\n/g, " / ")}"`,
      );
    }
  }

  const lines: string[] = [];
  lines.push("# Candidatos de datos comerciales extraídos de Telegram");
  lines.push("");
  lines.push(
    `> Generado por \`scripts/extract-telegram-commercial-data.ts\` el ${new Date().toISOString()}. ` +
      "Estos son candidatos sin verificar — ningún dato de aquí se publica como oficial sin " +
      "contrastarlo primero (ver DECISIONS.md / MASTER_PLAN.md, regla de seguridad #4).",
  );
  lines.push("");
  lines.push(`Mensajes de texto totales leídos: ${allMessages.length}.`);
  lines.push("");

  const SECTION_TITLES: Record<string, string> = {
    horarios: "Horarios",
    politicas: "Políticas (garantía, cambios, envíos, pagos)",
    cursos: "Cursos",
    faq: "Preguntas frecuentes (mensajes con \"?\")",
    caracteristicas: "Características de producto (con \"Precio:\")",
  };

  for (const [cat, title] of Object.entries(SECTION_TITLES)) {
    const items = byCategory[cat];
    lines.push(`## ${title}`);
    lines.push("");
    if (items.length === 0) {
      lines.push("Sin candidatos detectados.");
      lines.push("");
      continue;
    }
    const capped = cat === "caracteristicas" ? items.slice(0, 25) : items;
    for (const msg of capped) {
      lines.push(`- **${msg.date}** (${msg.source}): ${msg.text.replace(/\n/g, " / ")}`);
    }
    if (cat === "caracteristicas" && items.length > capped.length) {
      lines.push(
        `- … y ${items.length - capped.length} mensajes más con "Precio:" no listados aquí ` +
          "(curación completa de uñas/capilares/maquillaje es tarea de SEO-012, no de esta).",
      );
    }
    lines.push("");
  }

  lines.push("## Discrepancias candidatas contra datos ya publicados");
  lines.push("");
  if (candidateConflicts.length === 0) {
    lines.push("Ninguna detectada automáticamente en esta corrida.");
  } else {
    for (const c of candidateConflicts) lines.push(`- ${c}`);
  }
  lines.push("");

  writeFileSync(REPORT_PATH, lines.join("\n") + "\n", "utf-8");
  console.log(`Reporte escrito en ${path.relative(ROOT, REPORT_PATH)}`);
  console.log(`Discrepancias candidatas encontradas: ${candidateConflicts.length}`);
}

main();
