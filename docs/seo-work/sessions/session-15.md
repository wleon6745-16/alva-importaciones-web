# Sesión 15 — Pruebas integrales y estabilización

**Fecha:** 2026-08-08
**Fase:** 15
**Tarea:** SEO-015
**Rama:** `feature/alva-seo-ai-discovery`

## Objetivo

Pasada final de estabilización antes de producción: correr todas las validaciones juntas,
probar navegación móvil y WhatsApp end-to-end, verificar Schema/sitemap/robots a mano, verificar
404, y probar que `catalog:sync` no corrompe el catálogo público si falla.

## Hallazgo real: `robots.txt`/`llms.txt` sin charset UTF-8 en producción

Al verificar `robots.txt` en el navegador apareció mojibake ("bÃºsqueda" en vez de "búsqueda").
Investigado: el servidor de desarrollo sirve `text/plain` sin `charset=utf-8`, y **`nginx.conf`
(el que sí se usa en producción, ver `Dockerfile`) tampoco tenía ninguna directiva `charset`** —
así que el mismo problema habría ocurrido en producción real para `robots.txt` y `llms.txt`
(ambos con acentos/ñ en español). Corregido añadiendo `charset utf-8;` a `nginx.conf`. El HTML no
se ve afectado porque ya declara `<meta charset="utf-8">` explícito en cada página.

## Prueba de resiliencia de `catalog:sync`

Simulé un fallo real: cambié temporalmente el nombre de un producto a `""` en el seed de
`scripts/sync-public-catalog.ts` y corrí el script.

- Resultado: el script lanza `Error: Producto sin nombre: muebles-` y termina con código de
  salida 1 **antes** de escribir el archivo (la validación con `assertSanitized()` corre antes
  del `writeFileSync`).
- Verificado con hash MD5 de `src/data/products.generated.json` antes y después del intento
  fallido: **idéntico** — el catálogo público conservó la última versión válida, tal como exige
  el criterio de aceptación.
- Revertido el cambio, corrida limpia confirmada (solo cambia el timestamp `generatedAt`, sin
  diferencias de datos).

## Otras validaciones ejecutadas

- `npm run build` → ✅ 77 páginas.
- `npm run seo:validate` → ✅ 0 errores, 12 avisos informativos (ya conocidos de SEO-014, sin
  cambios).
- `git diff --check` → sin problemas de espacio en blanco.
- Navegación móvil (viewport 375×812): menú hamburguesa abre/cierra correctamente y ahora incluye
  el enlace "Guías" (verificado en el DOM tras el fix de SEO-014).
- WhatsApp end-to-end probado en 3 contextos distintos (producto de muebles, producto de uñas,
  CTA de sucursal en `/locales/sucursal`): URL codificada correctamente, número correcto por
  sucursal, evento `whatsapp_click` en `window.dataLayer` con los campos esperados en los tres
  casos.
- Schema verificado en 8 tipos de página representativos (home, contacto, sucursal, producto
  muebles, producto belleza, curso, guía, categoría con FAQ) — todos con JSON-LD parseable y los
  tipos esperados (`Organization`, `LocalBusiness`, `Product`, `Course`, `Article`, `FAQPage`,
  `BreadcrumbList`).
- `/404` verificada: título, `<h1>` y enlace de vuelta al inicio presentes.
- Sitemap y robots.txt re-verificados manualmente (ya cubiertos en SEO-011, sin cambios de
  contenido salvo el fix de charset).

## Resultado

`SEO-015` completada. Evidencia en `tasks/evidence/SEO-015.log`.

## Siguiente tarea

`SEO-016` — Preparación de producción (última fase del plan).
