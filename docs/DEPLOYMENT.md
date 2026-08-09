# Despliegue a producción

Guía de referencia para llevar `alva-importaciones-web` a producción. El sitio es **estático**
(Astro, `output: "static"`): no hay backend propio, no hay base de datos en producción, no hay
sesiones de usuario. Todo lo que necesita el sitio en tiempo de ejecución es servir los archivos
de `dist/` sobre HTTPS.

## 1. Requisitos

- Node.js **≥ 22.12** para compilar (`package.json` → `engines`; los scripts de `scripts/*.ts`
  usan el soporte nativo de TypeScript de Node, que requiere esta versión o superior).
- Un servidor capaz de servir archivos estáticos (el `Dockerfile`/`nginx.conf` de este repo
  cubren esto, pero cualquier hosting estático — Vercel, Netlify, Cloudflare Pages, un VPS con
  nginx — funciona igual de bien).

## 2. Variables de entorno

El sitio en sí **no necesita ninguna variable de entorno para funcionar** (es 100% estático, sin
llamadas a APIs privadas en runtime). Las variables de entorno solo importan para las tareas de
mantenimiento (`npm run ...`), nunca se exponen al navegador:

| Variable | Usada por | Obligatoria | Notas |
|---|---|---|---|
| `INDEXNOW_KEY` | `scripts/indexnow-prepare-keyfile.mjs` (hook `prebuild`), `scripts/indexnow-submit.mjs` | No | Sin ella, IndexNow queda desactivado (no-op seguro, no rompe el build). Ver §5. |

Ninguna variable de entorno contiene secretos hoy porque IndexNow todavía no tiene una clave real
asignada (ver `docs/seo-work/MANUAL_ACTIONS.md` #10). Cuando se configure, debe vivir en el
entorno del hosting (o un `.env` local excluido por `.gitignore`) — **nunca en el repo**.

## 3. Dominio y HTTPS

- El dominio real todavía no está asignado — el código usa el placeholder
  `https://alvaimportaciones.com` en `astro.config.mjs` (`site`) y `src/lib/site-config.ts`
  (`url`). **Antes de desplegar a producción**, reemplazar ambos por el dominio real; de lo
  contrario, todas las URLs canónicas, el sitemap, el JSON-LD y los enlaces de Open Graph
  apuntarán al dominio equivocado.
- HTTPS es obligatorio (Search Console, IndexNow y la mayoría de bots de búsqueda tratan HTTP
  como señal negativa o simplemente no lo indexan). Si se usa el `Dockerfile`/`nginx.conf` de
  este repo tal cual, hay que añadir TLS por fuera (un proxy reverso tipo Caddy/Traefik, o
  terminación TLS del proveedor de hosting) — `nginx.conf` aquí solo sirve HTTP en el puerto 80.

## 4. Redirecciones

No hay redirecciones especiales que configurar en el código: Astro con `output: "static"` genera
una carpeta por ruta (`/productos/muebles/` → `dist/productos/muebles/index.html`), y `nginx.conf`
ya maneja esto con `try_files $uri $uri/ /404.html;`. Dos cosas a decidir en el hosting real:

- **www vs. sin www**: elegir una versión canónica (recomendado: sin `www`, ya que
  `astro.config.mjs`/`site-config.ts` usan `alvaimportaciones.com` sin `www`) y redirigir la otra
  con un 301 permanente a nivel de DNS/hosting.
- **HTTP → HTTPS**: redirigir con 301 a nivel de proxy/hosting (no está en `nginx.conf`, que solo
  sirve HTTP).

## 5. Proceso de build y despliegue

```bash
npm install
npm run build      # corre "prebuild" (IndexNow keyfile) y luego "astro build" -> dist/
npm run seo:validate   # debe pasar sin errores antes de desplegar (ver criterios en SEO-014)
```

Publicar el contenido de `dist/`. Con Docker:

```bash
docker build -t alva-web .
docker run -p 80:80 alva-web
```

### Activar IndexNow (opcional, cuando exista una clave real)

1. Generar/obtener una clave de IndexNow (32-128 caracteres alfanuméricos; Bing/otros motores la
   aceptan como archivo de verificación en la raíz del sitio).
2. Configurar `INDEXNOW_KEY` en el entorno del hosting (nunca en el repo).
3. `npm run build` generará automáticamente `public/{key}.txt` → queda en `dist/{key}.txt`.
4. Después de cada despliegue con contenido nuevo/cambiado:
   `npm run indexnow -- <url1> <url2> ...` (o sin argumentos para reenviar todo el sitemap, solo
   la primera vez). Ver `docs/AUTOMATED_TASKS.md` sección 4 para el detalle.

## 6. Tareas programadas (opcional, no instaladas)

`deploy/systemd/*.service` + `*.timer` son plantillas listas para un VPS con systemd
(sincronización de catálogo cada 6h, validación SEO diaria). **No están instaladas** — requieren
ajustar `WorkingDirectory`, `User` y `EnvironmentFile` a la ruta/usuario reales del servidor antes
de activarlas, y una confirmación explícita del usuario antes de instalarlas (ver
`docs/AUTOMATED_TASKS.md`). Si el hosting no soporta systemd (proveedor gestionado tipo
Vercel/Netlify, o contenedor sin `systemctl`), la misma lógica (`npm run catalog:sync`,
`npm run seo:validate`) se dispara como *scheduled function*/cron del proveedor en su lugar.

## 7. Checklist previo al primer despliegue real

- [ ] Dominio real comprado/asignado y actualizado en `astro.config.mjs` + `site-config.ts`.
- [ ] HTTPS configurado (certificado válido, HTTP→HTTPS forzado).
- [ ] `npm run build && npm run seo:validate` pasa sin errores contra el dominio real.
- [ ] Ver `docs/seo-work/MANUAL_ACTIONS.md` para el checklist completo de Search Console, Bing
      Webmaster Tools, Bing Places, Google Business Profile, IndexNow y analítica — todo eso
      requiere acceso a cuentas del negocio y no puede completarlo una sesión de Claude Code.
