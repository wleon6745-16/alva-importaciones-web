# Sesión 22 — Pages CMS: 4 colecciones de productos con fuentes de medios fijas (Opción C)

**Fecha:** 2026-08-15
**Fase:** fuera del `MASTER_PLAN.md` original — continuación directa de CMS-1 (Sesiones 20-21).
**Rama:** `feature/alva-seo-ai-discovery`

## Contexto

La Sesión 21 confirmó, leyendo el código fuente real de Pages CMS
(`fields/core/image/edit-component.tsx`), que `options.path` en un campo de imagen **no interpola
plantillas** — `"{fields.category}"` se usaba literal, no como placeholder. La prueba en vivo del
usuario lo confirmó: la preview de "Butaca Francia" seguía rota.

Se compararon 3 arquitecturas reales (detalle completo en el reporte de esa conversación): guardar
la ruta con categoría incluida en el JSON, aplanar la carpeta física de imágenes, o volver a 4
colecciones de productos con fuente de medios fija por categoría — el mismo patrón que ya se había
validado funcionando con Decap CMS (Sesión 19). Se eligió la tercera (Opción C): es la única que no
depende de ningún comportamiento sin confirmar, y no toca ni los 74 JSON ni `imageFor()` ni ningún
archivo de código Astro.

## Cambio aplicado (solo `.pages.yml`)

- **5 fuentes de medios** en vez de 1: `muebles_photos`, `unas_photos`, `capilares_photos`,
  `maquillaje_photos` (cada una con `input` fijo a su carpeta real de categoría, sin plantillas) y
  `all_product_photos` (input: `src/assets/products`, para navegar a mano — usada solo por
  promociones).
- **4 colecciones de productos** en vez de 1: `products-muebles`, `products-unas`,
  `products-capilares`, `products-maquillaje`, cada una con `path` fijo a su carpeta real de
  contenido (`src/content/products/<categoría>`) y su campo `image` apuntando a la fuente de
  medios correspondiente vía `options.media` (sin `options.path`, ya no hace falta).
- El campo `category` de cada colección pasó de `select` editable a `string` con `hidden: true` y
  `default: <categoría>` — ya no tiene sentido pedirle al administrador que elija una categoría que
  ya está implícita en qué colección está editando, y evita que alguien la cambie por error creando
  un desajuste entre la carpeta real y el valor guardado.
- **Promociones**: se mantuvo como una sola colección (partirla en 4 rompería el concepto de
  "orden" que hoy cruza las 4 categorías en una sola lista) apuntando a `all_product_photos`. Esto
  deja una limitación conocida y documentada dentro del propio `.pages.yml`: la vista previa
  automática de una foto de promoción **ya guardada** puede seguir saliendo rota por la misma razón
  original (Pages CMS no sabe en cuál de las 4 carpetas buscar sin que alguien navegue) — aceptado
  explícitamente porque son solo 4 entradas, editadas con poca frecuencia, y no había forma de
  resolverlo sin la misma partición por categoría que sí tiene sentido para productos.

## Validaciones ejecutadas

- `npx js-yaml .pages.yml` → sintaxis válida.
- `npm run build` → ✅ 101 páginas.
- `npm run seo:validate` → ✅ 0 errores, 74 productos analizados.
- Conteo directo de archivos: 74 productos, 4 promociones — sin cambios.
- `git diff --stat` → solo `.pages.yml` (264 inserciones, 43 eliminaciones); ningún JSON de
  contenido, ningún archivo `.astro`/`.ts` tocado.

## Resultado

Commiteado y empujado **solo** a `feature/alva-seo-ai-discovery`. Sin merge a `master`, sin
deployment, sin cambios de hosting/DNS.

## Pendiente (prueba manual del usuario, no automatizada aquí)

1. Recargar Pages CMS → `Productos — Muebles` → `Butaca Francia` → confirmar que la foto principal
   ahora se previsualiza.
2. Si la preview funciona, **CMS-1 todavía no se da por terminado** — falta una prueba controlada
   de escritura/subida real (Pages CMS → GitHub → JSON/imagen → Astro → build → SEO) antes de
   cerrar el trabajo. Esa prueba no se ejecuta en esta sesión — se espera instrucción explícita del
   usuario para continuar.
