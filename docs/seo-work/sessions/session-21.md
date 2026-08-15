# Sesión 21 — Pages CMS conectado en vivo: fix de la vista previa de fotos

**Fecha:** 2026-08-15
**Fase:** fuera del `MASTER_PLAN.md` original — continuación directa de CMS-1 (Sesión 20), ya con
Pages CMS conectado de verdad al repositorio.
**Rama:** `feature/alva-seo-ai-discovery`

## Contexto

El usuario conectó la GitHub App de Pages CMS a `wleon6745-16/alva-importaciones-web` y confirmó
que la colección "Productos" navega bien por categoría (subcarpetas funcionando) y que los campos
de texto/número/select se leen correctamente en un producto real ("Butaca Francia"). El único
problema real: el campo "Foto principal" reconocía el nombre de archivo (`butaca-francia.jpg`)
pero la vista previa salía rota.

## Diagnóstico

En vez de seguir adivinando contra la documentación pública (que tiene huecos, como se dejó
anotado en `.pages.yml` al cerrar la Sesión 20), esta vez se leyó **el código fuente real** de
Pages CMS (`github.com/hunvreus/pagescms`):

- `types/field.ts` — el tipo `Field` no tiene una clave `media` propia. La única forma real de
  elegir la fuente de medios de un campo de imagen es `options.media` (anidada). El `.pages.yml`
  anterior tenía `media: product_photos` directo en el campo — una clave que Pages CMS
  simplemente ignora en silencio (no daba error, pero tampoco hacía nada).
- `fields/core/image/edit-component.tsx` — confirma que la resolución de una imagen existente es
  **concatenación directa** de `media.input` + el valor guardado, **sin búsqueda recursiva** en
  subcarpetas. Con `media.input: src/assets/products` (plano) y el valor guardado
  `butaca-francia.jpg` (sin subcarpeta), Pages CMS buscaba el archivo en
  `src/assets/products/butaca-francia.jpg` — que no existe, porque el archivo real está un nivel
  más abajo, en `src/assets/products/muebles/`. Ahí estaba el bug.
- El mismo archivo confirma que existe un `options.path` a nivel de campo que se combina con
  `media.input` para construir la ruta real — el mecanismo correcto para resolver el nivel de
  categoría sin tener que guardar la subcarpeta dentro del propio valor del campo.
- `lib/config-schema.ts` — confirma que `subfolders` es una clave válida de una **colección**
  (`content:`), no de una **fuente de medios** (`media:`). La media source tenía
  `subfolders: true`, que no es una clave reconocida ahí — se quitó.
- `types/field.ts` también confirma que `readonly` sí existe como propiedad real de un campo. No
  se aplicó a `slug`/`code` a propósito — es muy probable que también bloquee escribirlos al crear
  un producto nuevo, lo cual sería peor que el riesgo que se busca evitar. La protección actual
  (texto de advertencia visible en el campo) se mantiene como está.

## Cambio aplicado

Solo en `.pages.yml` (ningún otro archivo tocado, ningún JSON de producto/promoción modificado):

1. Quitado `subfolders: true` de la fuente de medios `product_photos` (clave inválida ahí).
2. En los dos campos de imagen (productos y promociones), cambiado de una clave `media:` directa
   (ignorada en silencio) a `options: { media: product_photos, path: "{fields.category}" }` (o
   `{fields.imageCategory}` en promociones) — usando el mismo mecanismo de plantillas `{fields.x}`
   que ya funciona en el `filename` de la colección, para que Pages CMS busque la foto en
   `src/assets/products/<categoría>/<archivo>` sin que el valor guardado en el JSON tenga que
   incluir la subcarpeta.
3. Comentario superior de `.pages.yml` reescrito con los hallazgos confirmados y, honestamente, el
   único punto que sigue sin confirmación 100% en vivo: si `options.path` en un campo de imagen
   acepta de verdad la plantilla `{fields.category}` igual que `filename` a nivel de colección. Es
   la hipótesis mejor fundamentada encontrada, no una certeza — se le pidió al usuario recargar
   Pages CMS y revisar si la foto de "Butaca Francia" ya se ve.

## Validaciones ejecutadas

- `npx js-yaml .pages.yml` → sintaxis válida.
- `git status`/`git diff --stat` → solo `.pages.yml` cambió (35 inserciones, 21 eliminaciones).
- `npm run build` → ✅ 101 páginas (sin cambios respecto a antes — `.pages.yml` no afecta a Astro).
- `npm run seo:validate` → ✅ 0 errores.

## Resultado

Cambio mínimo, acotado a `.pages.yml`, sin tocar el formato de los 74 JSON de producto ni el
código de `imageFor()`. Commiteado y empujado **solo** a `feature/alva-seo-ai-discovery` (sin
merge a `master`, sin deployment, sin cambios de hosting/DNS).

## Pendiente

- Confirmar en vivo (el usuario, recargando Pages CMS) que la foto de un producto existente ahora
  se previsualiza correctamente.
- Si sigue rota: el siguiente sospechoso sería que `options.path` no soporta plantillas de campo
  (solo cadenas literales) — en ese caso, la alternativa de respaldo sería volver a 4 fuentes de
  medios nombradas (una por categoría, con `input` fijo) y decidir cuál usar por categoría, lo cual
  sí requeriría un cambio de código en `imageFor()` para tolerar el nuevo formato — no aplicado
  todavía porque no hay evidencia de que haga falta.
