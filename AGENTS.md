# alva-importaciones-web — instrucciones de agente

Sitio público de **ALVA Importaciones**. Corto a propósito: lo que se puede
deducir leyendo el repo no se documenta aquí.

## Qué es y qué no es

Este repo es **el sitio público**. La plataforma SaaS que lo alimenta es
**Omviqa**, en `C:\Users\wleon\Proyectos\ASISTENTE` — ahí viven el asistente,
el catálogo sincronizado, `/admin`, la Storefront API y la configuración de
tenant. ALVA es **un tenant** de Omviqa, no la plataforma.

Para trabajo de ALVA Functional Release hay que mirar los dos repos juntos.

## Stack

Astro + islas de React, Tailwind, content collections (`src/content.config.ts`).
Las páginas viven en `src/pages/`, los componentes en `src/components/`. El
esquema de contenido es la fuente de verdad del modelo editorial; no lo
repliques en documentación.

Servidor de desarrollo en segundo plano:

```
astro dev --background
```

Se gestiona con `astro dev stop`, `astro dev status`, `astro dev logs`.

## Contenido: dos fuentes conviviendo

- **Decap CMS** en `public/admin/config.yml` es hoy la administración diaria y
  el fallback.
- **Omviqa** expone contenido editorial publicado por la Storefront API
  (`storefront:sync`), y su `/admin` va sustituyendo a Decap por fases.

**No se retira Decap** hasta que una fase de migración lo apruebe
explícitamente. Las rutas de preview de Omviqa viven bajo `/omviqa-preview/*`
y no reemplazan `/decap-admin` ni `alvaimportaciones.com/admin` sin aprobación.

## Dónde se trabaja — ramas

**La rama publicada es `feature/alva-telegram-catalog`.** De ahí sale el sitio
que está en producción en Cloudflare Workers.

**`master` está meses atrás.** Publicar o ramificar desde ahí retrocede el
sitio entero: se pierden el catálogo desde Telegram, los destacados por
categoría, las promociones editables desde Omviqa y el widget actual del
asistente. Un PR fusionado a `master` no cambia nada en vivo.

Antes de tocar nada:

```bash
git fetch origin && git checkout feature/alva-telegram-catalog && git pull --ff-only
```

Publicar es `npm run build` con `PUBLIC_STOREFRONT_API_URL=https://api.omviqa.com`
y `npx wrangler deploy`. El `prebuild` regenera `src/content/storefront/*.json`
contra la API: esos ficheros cambian en cada build y son regenerables.

## Reglas

- **SACC es la fuente de verdad operativa de ALVA y no se modifica.** Precio,
  stock e identidad de producto vienen del ERP a través de Omviqa; nunca se
  convierten en contenido editable a mano en este repo.
- El sistema de diseño y la estructura de página los controla ALVA/Omviqa.
  Esto no es un constructor libre de páginas.
- Secretos solo en variables de entorno. Nunca en el repo ni en este archivo.
- **No se despliega salvo instrucción explícita.**

## Scripts propios

Además de los de Astro hay utilidades del proyecto (`seo:validate`,
`indexnow`, `storefront:sync`, `task:*`). Consulta `package.json` antes de
inventar un comando: la lista cambia y no se replica aquí.

## Documentación externa

Astro: https://docs.astro.build — routing, componentes, islas de framework,
content collections, estilos e i18n.
