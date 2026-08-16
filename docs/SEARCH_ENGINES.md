# Buscadores — Search Console, Bing, IndexNow, robots, llms.txt

Guía operativa de todo lo relacionado con indexación y descubrimiento. Fase SEO-Analytics,
2026-08-16.

## 1. Dominio canonical

`https://alvaimportaciones.com` (sin `www`). Confirmado en `astro.config.mjs` (`site`) y
`src/lib/site-config.ts` (`url`).

- `www.alvaimportaciones.com` → 301 a la versión sin `www` (regla de redirección en Cloudflare,
  configurada 2026-08-15/16).
- `http://` → **pendiente de forzar a `https://` a nivel de Cloudflare** — ver hallazgo en
  `SEO_ANALYTICS_BASELINE.md` §Problemas.

## 2. Google Search Console

**Estado: no configurado todavía** (requiere una cuenta de Google del negocio — no lo puede
hacer una sesión de Claude Code). Pasos exactos, ver la sección K del reporte de la fase
SEO-Analytics (2026-08-16) en el historial de esta conversación, o repetir aquí:

1. https://search.google.com/search-console → **Añadir propiedad** → elegir **"Dominio"** (no
   "Prefijo de URL") y escribir `alvaimportaciones.com`.
2. Google pide agregar un registro **TXT** a la zona DNS del dominio para verificar propiedad.
   Copiar ese valor exacto.
3. Agregarlo en Cloudflare → dominio `alvaimportaciones.com` → **DNS → Registros → Agregar
   registro** → Tipo `TXT`, Nombre `@`, Contenido = el valor que dio Google.
4. Volver a Search Console y confirmar verificación.
5. Enviar el sitemap: **Sitemaps** (menú izquierdo) → pegar `sitemap-index.xml` → Enviar.
6. Inspeccionar manualmente (botón "Inspeccionar URL") al menos: la home, una página de
   producto, una guía, `/cursos`, `/locales/matriz`, `/locales/sucursal` — para forzar
   indexación inmediata de las páginas de mayor valor comercial en vez de esperar el rastreo
   orgánico.

## 3. Sitemap

`https://alvaimportaciones.com/sitemap-index.xml` → referencia a
`https://alvaimportaciones.com/sitemap-0.xml` (generado por `@astrojs/sitemap`, automático en
cada build).

Verificado en producción (2026-08-16): HTTP 200, XML válido, 100 URLs, todas `https://`, todas
del dominio canonical, sin `localhost`/`ngrok`, sin duplicados, sin `/admin`. Incluye las 5
guías, `/cursos`, `/cursos-de-unas-portoviejo`, 79 páginas de producto, las páginas comerciales
locales. La página `/404` está correctamente excluida (no es contenido indexable).

## 4. robots.txt

`https://alvaimportaciones.com/robots.txt` — permite explícitamente Googlebot, Bingbot, y los
bots de IA ya decididos en SEO-011: `OAI-SearchBot`, `ChatGPT-User`, `GPTBot`, `PerplexityBot`,
`Perplexity-User`, `ClaudeBot`, `anthropic-ai`, `Google-Extended`. Bloquea `/admin/` para todos.
Referencia el sitemap. **No se modificó en esta fase** — ya estaba bien configurado, se auditó y
se confirmó que sigue siendo correcto en producción.

Distinción ya aplicada (no se tocó): son bots de *búsqueda/asistente* (responden preguntas en
tiempo real citando la fuente), no bots de entrenamiento genérico sin atribución — esa es la
razón por la que están permitidos.

## 5. llms.txt

`https://alvaimportaciones.com/llms.txt` — verificado en producción: accesible, sin
`localhost`/`ngrok`, contenido consistente con lo publicado (catálogo, guías, curso, locales,
política de "no vende en línea, todo por WhatsApp"). No se trata como sustituto de SEO
tradicional — es un mecanismo complementario, no hay ninguna afirmación de que garantice
aparecer en respuestas de IA.

## 6. Bing Webmaster Tools

**Estado: no configurado** (requiere cuenta Microsoft del negocio). robots.txt ya permite
`Bingbot` explícitamente y referencia el sitemap — Bing puede rastrear sin cambios adicionales.
Pasos:

1. https://www.bing.com/webmasters → **Agregar sitio** → `https://alvaimportaciones.com`.
2. Bing ofrece importar la propiedad directo desde Google Search Console (más rápido, si ya se
   hizo el paso 2) o verificar por separado con un registro DNS/meta tag propio.
3. Enviar `https://alvaimportaciones.com/sitemap-index.xml` en la sección Sitemaps.

## 7. IndexNow

**Ya implementado en código** (sesión SEO-011, sin cambios en esta fase — solo se auditó):

- `scripts/indexnow-prepare-keyfile.mjs` corre en `prebuild` (antes de `astro build`) y genera
  `public/{INDEXNOW_KEY}.txt` — el archivo de verificación que exige IndexNow, en la raíz del
  sitio. Si `INDEXNOW_KEY` no está definida, no genera nada y no falla el build.
- `scripts/indexnow-submit.mjs` envía URLs a `https://api.indexnow.org/indexnow`. Lee la clave
  de `process.env.INDEXNOW_KEY` — **nunca hardcodeada, nunca en el navegador** (el script corre
  con Node, no en el cliente). Sin la variable, no hace nada.
- Uso recomendado tras un deploy con contenido nuevo/cambiado:
  `npm run indexnow -- <url1> <url2>` (pasar solo las URLs que cambiaron — no reenviar todo el
  sitemap en cada deploy, eso sería spam hacia IndexNow).

**Pendiente**: generar una clave real de IndexNow (cualquier string de 32-128 caracteres
alfanuméricos sirve, no hay que "solicitarla" a nadie) y configurarla como variable de entorno
`INDEXNOW_KEY` en Cloudflare (Ajustes → Variables y secretos del Worker) — nunca en el repo.

## 8. Proceso de publicación/indexación (flujo completo)

1. Alguien edita contenido desde `/admin` (Decap CMS) → commit automático a
   `feature/alva-seo-ai-discovery`.
2. Cloudflare Workers Builds detecta el push, corre `npm run build`, despliega automáticamente
   (ver `docs/DEPLOYMENT.md` — el deploy command ya quedó configurado como `npx wrangler deploy`,
   que publica al 100% de tráfico sin pasos manuales).
3. El sitemap se regenera solo en cada build (siempre actualizado).
4. **Manual, cuando `INDEXNOW_KEY` exista**: correr `npm run indexnow -- <url-que-cambió>` para
   notificar a Bing/otros motores compatibles con IndexNow del cambio puntual.
5. Google no usa IndexNow — se entera por rastreo normal o por inspección manual en Search
   Console (§2, paso 6) para páginas que se quieran indexar de inmediato.
