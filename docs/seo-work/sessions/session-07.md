# Sesión 07 — Sucursales y SEO local

**Fecha:** 2026-08-08
**Fase:** 7
**Tarea:** SEO-007
**Rama:** `feature/alva-seo-ai-discovery`

## Objetivo

Página general de locales + una página por sucursal, cada una con dirección real, horario,
WhatsApp, mapa y JSON-LD `LocalBusiness` propio.

## Trabajo realizado

1. `src/lib/site-config.ts`: cada `location` ahora tiene `slug` (`matriz`, `sucursal`) para URLs
   estables.
2. `src/lib/structured-data.ts`: `localBusinessSchema(location, pageUrl?)` (una sola sucursal,
   con `telephone`, `url` y `areaServed` nuevos) + `localBusinessSchemas()` refactorizada para
   reusarla. `areaServed` = Portoviejo (la ciudad de la dirección ya verificada — no se inventa
   un radio de cobertura no confirmado).
3. `src/pages/locales/index.astro`: página general, lista los 2 locales con dirección, horario
   real (`siteConfig.hours`), mapa, WhatsApp por sucursal y enlace a la página de detalle.
4. `src/pages/locales/[branch].astro`: una página por sucursal (`getStaticPaths` sobre
   `siteConfig.locations`, mismo patrón de scope que SEO-003 — `getStaticPaths` lee del import
   `siteConfig`, no de un `const` externo). JSON-LD `LocalBusiness` específico por sucursal +
   `BreadcrumbList`.
5. `src/components/LocationsMap.astro` (usado en `/contacto`): el nombre de cada local ahora
   enlaza a `/locales/[slug]/`.
6. Fotografías por sucursal: no existen fotos reales diferenciadas por local en el repo (se
   verificó, no hay `src/assets/**/local*` ni `tienda*`) — no se fabricó ninguna, se usa el logo
   de marca como `image` en el JSON-LD igual que ya hacía `localBusinessSchemas()` original.

## Validaciones ejecutadas

- `npm run build` → ✅ 40 páginas (37 + `/locales`, `/locales/matriz`, `/locales/sucursal`).
- JSON-LD `LocalBusiness` de `/locales/matriz` parseado y verificado: dirección, teléfono,
  `areaServed`, horario y `hasMap` correctos.
- WhatsApp por sucursal verificado: `/locales/sucursal` usa `593963946590` (Sucursal, con
  CONFLICT-001 sin resolver, tal cual está configurado — no se tocó), `/locales/matriz` usa
  `593999526807`.
- Enlaces cruzados verificados: `/contacto` → `/locales/matriz/` y `/locales/sucursal/`.
- Revisado en navegador: contenido de `/locales` correcto (nombres, direcciones, horario, CTAs).

## Resultado

`SEO-007` completada. Evidencia en `tasks/evidence/SEO-007.log`.

## Siguiente tarea

`SEO-008` — Páginas comerciales locales.
