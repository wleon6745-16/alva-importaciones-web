# Flujo de actualización de fotos, promociones y contenido

Este documento explica de dónde sale el contenido visual del sitio (fotos de producto, imágenes
de categoría, promociones) y cómo actualizarlo sin tener que redescubrir el proceso cada vez.
Complementa a `docs/seo-work/` (el sistema de control de las 16 fases de SEO) y a
`docs/AUTOMATED_TASKS.md` (tareas programadas del servidor).

## 1. De dónde salen las fotos hoy

Hay **dos fuentes reales** de fotos de producto en este repo, ambas fuera del propio repo de
`alva-importaciones-web`:

1. **Catálogo de fotos por código** — `C:\Users\wleon\Proyectos\ASISTENTE\backend\assets\`
   - `furniture-catalog/{codigo}.{jpg,png}` — fotos de muebles indexadas por código SACC.
   - `product-images/alva/{proveedor}/{marca}/{codigo}-{sku}.{jpg,png}` — fotos de uñas,
     capilares y maquillaje, organizadas por proveedor (`dipaso`, `dipaso-name`, `ea`,
     `essence-official`, etc.) y luego por marca.
   - Son fotos de catálogo/producto limpias (fondo blanco o foto de estilo de vida), la mejor
     fuente disponible hoy. **Descubierto en la segunda pasada de calidad (2026-08-09)** — no se
     había usado en las sesiones anteriores del plan SEO.
2. **Export de Telegram** — `C:\Users\wleon\Downloads\...\ChatExport_2026-08-06\photos\` — fotos
   reales adjuntas a publicaciones del canal del negocio. Es la fuente que se usó originalmente
   para curar el catálogo (SEO-002, SEO-012) y sigue siendo válida cuando el catálogo de códigos
   no tiene una foto para un producto dado.

### 1.1 Muchas fotos de Telegram tienen overlay de marketing — recortarlas con `sharp`

Buena parte de las fotos de muebles del export tienen un diseño superpuesto (título, flechas,
iconos de características, y sobre todo una marca de agua translúcida "ALVA BEAUTY — Despierta
tu belleza"). No sirven tal cual para tarjetas de producto limpias.

`sharp` ya está disponible en `node_modules` (es dependencia interna de `astro:assets`, no hace
falta instalarlo) y permite recortar sin depender de ImageMagick/ffmpeg (no están instalados en
este entorno). Patrón usado en la Sesión 18:

```js
const sharp = require("sharp"); // ejecutar con `node` desde la raíz del repo, no desde /tmp
const meta = await sharp(srcPath).metadata();
const region = { left: Math.round(0.30*meta.width), top: Math.round(0.20*meta.height),
                  width: Math.round(0.60*meta.width), height: Math.round(0.50*meta.height) };
await sharp(srcPath).extract(region).toFile(outPath);
```

Proceso iterativo recomendado: generar un recorte de prueba con un nombre distinto (p. ej.
`_cropped_archivo.jpg`), revisarlo visualmente, ajustar las fracciones si queda texto/marca de
agua visible, repetir hasta que quede limpio, y solo entonces mover el archivo sobre el original
(`git` ya versiona los binarios, así que un recorte que salga mal se puede revertir con
`git checkout -- <archivo>`). No existe una coordenada única válida para todas las fotos — cada
plantilla de marketing usada por el negocio pone el overlay en un sitio distinto.

## 2. Cómo se cruzan código ↔ foto (y por qué importa el orden)

Desde la migración a Astro Content Collections (Sesión 19), cada producto es su propio archivo
fuente en `src/content/products/<categoría>/<slug>.json` — **no hay generación intermedia**: ese
archivo JSON es directamente lo que lee el sitio (vía `src/content.config.ts` + `src/lib/products.ts`),
y se edita a mano o desde el panel `/admin` (ver §6 más abajo). El campo `code` de cada producto es
la clave para buscar una foto mejor:

1. Si el producto tiene `code`, buscar `{code}.*` en `furniture-catalog/` (muebles) o
   `{code}-*.*` en `product-images/alva/**/` (uñas/capilares/maquillaje).
2. Si hay match, comparar visualmente contra la foto actual (algunas fotos del catálogo de
   códigos no corresponden exactamente al mismo modelo/color — ver el caso real documentado en
   `docs/seo-work/DATA_CONFLICTS.md` CONFLICT-002, donde el nombre real del producto sí coincidía
   con el color de la foto de catálogo aunque no con la foto de Telegram ya publicada).
3. Si no hay match por código (la mayoría de productos sin código, o códigos no indexados
   todavía en `ASISTENTE`), la foto de Telegram sigue siendo la mejor disponible — no inventar
   ni usar una foto de un producto distinto solo por rellenar.
4. Copiar el archivo elegido a `src/assets/products/{categoria}/{nombre-descriptivo}.jpg`.
5. Poner ese mismo nombre de archivo en el campo `image` del JSON del producto (a mano, o subiendo
   la foto desde el campo "Foto del producto" en `/admin` — ver §6).

Un script de referencia (no forma parte del repo, se recreó como scratch en la sesión) que
automatiza el paso 1 completo:

```js
// Recorre ASISTENTE/backend/assets buscando archivos "{code}*.{jpg,png,webp}" y los cruza
// contra los productos de src/content/products/**/*.json por el campo `code`. Ver
// docs/seo-work/sessions/session-17.md para el resultado de la última corrida (7 matches de 50
// productos con código, cuando el catálogo todavía era un solo JSON generado).
```

Si se quiere repetir esta búsqueda con más profundidad (fuzzy match por marca/nombre para
productos sin código), un humano debe revisar los resultados uno por uno — no hay forma
confiable de automatizar esa parte sin arriesgar publicar la foto de un producto equivocado.

## 3. Cómo se curan las promociones desde Telegram

La sección "Así son nuestras promociones" de la home (`src/components/PromoShowcase.astro`) usa
imágenes reales del canal de Telegram, seleccionadas con este criterio:

- **Sí se publica**: gráficas de campaña ya diseñadas por el negocio (combos, promos, anuncios de
  eventos en sucursal) que no contienen datos de un cliente específico.
- **No se publica nunca**: capturas de conversaciones, comprobantes de pago, nombres de clientes,
  fotos de personas identificables sin ese propósito comercial explícito.
- Las promociones mostradas son **campañas pasadas**, no ofertas vigentes — por eso el texto de
  la sección dice "así son nuestras promociones" y no "promoción de esta semana", y el CTA
  principal manda al canal de WhatsApp/Instagram reales del negocio para lo que sí está activo
  hoy. **Nunca se debe cambiar ese framing a "oferta activa" sin verificar que de verdad lo esté.**

### Cómo actualizar esta sección

1. Abrir el export de Telegram más reciente (o pedir uno nuevo si pasaron varios meses).
2. Buscar publicaciones con foto + palabras clave de promoción (combo, descuento, oferta, promo,
   gratis, activación, sorteo) — hay un script de extracción reutilizable en
   `scripts/extract-telegram-commercial-data.ts` (de SEO-009) que ya clasifica candidatos por
   categoría; se puede extender con una categoría "promos" siguiendo el mismo patrón.
3. Elegir 3-5 gráficas recientes, diversas (que no sean todas de la misma categoría de producto).
4. Copiarlas a `src/assets/promos/` con nombres descriptivos.
5. Actualizar el array `promos` en `PromoShowcase.astro` (imports + `label`/`alt` de cada una).
6. Nunca copiar el mensaje de texto completo tal cual (puede tener precios desactualizados o
   condiciones que ya no aplican) — el `label` debe ser un resumen genérico ("Combo de muebles"),
   no la oferta exacta con precio.

### Qué se puede automatizar y qué no

| Parte | ¿Automatizable? |
|---|---|
| Extraer candidatos con foto + palabras clave de promo | Sí — extender `extract-telegram-commercial-data.ts` |
| Verificar que no haya datos privados/comprobantes en la foto | **No** — requiere revisión visual humana |
| Elegir cuáles mostrar (diversidad de categoría, calidad visual) | **No** — criterio editorial |
| Copiar el archivo elegido y regenerar el build | Sí — un script simple de copia + `npm run build` |

## 4. Guías y descripciones de producto

Las guías (`src/pages/guias/*.astro`) están escritas a mano con criterios de compra genéricos
reales de la industria (mecanismos, materiales, mantenimiento) — no se generan desde el catálogo
ni se resumen automáticamente. Si se agrega una guía nueva:

- Debe aportar criterios de compra reales y verificables, no solo repetir la lista de
  características de los productos ya publicados.
- No debe sonar a resumen de catálogo ("esto es lo que hay en nuestro catálogo") ni a texto
  meta/IA ("según la información disponible...").
- Debe enlazar productos reales (`ProductGrid`) y, cuando exista, la landing comercial
  relacionada (`/muebles-para-salon-de-belleza-portoviejo`, etc.).

## 6. Panel de administración sin tocar código (Decap CMS + DecapBridge)

**Solución final (2026-08-15), después de comparar tres CMS distintos.** El historial completo
está en `docs/seo-work/sessions/session-19.md` a `-24.md`, resumen:

1. **Decap CMS** (Sesión 19): probado funcionando de punta a punta en local — listado correcto,
   edición de todos los campos, imagen con preview real, y un guardado real verificado byte a
   byte en el archivo. Se dejó de usar solo porque Git Gateway (la pieza de Netlify que hacía
   falta para producción) está deprecada — no por ningún problema de funcionamiento.
2. **Pages CMS** (CMS-1, Sesión 20-22): se conecta directo a GitHub sin depender de Netlify, pero
   tuvo un bug de caché sin corregir (colecciones nuevas no siempre se descubrían,
   [pages-cms/pages-cms#301](https://github.com/pages-cms/pages-cms/issues/301)) y necesitó
   reestructurar productos en 4 colecciones para que la vista previa de fotos funcionara.
3. **Sveltia CMS** (Sesión 23-24, spike controlado): cargó y leyó los datos correctamente, pero
   **guardar no escribía al archivo real en tres intentos independientes** (incluido uno hecho a
   mano por el usuario, sin ninguna automatización de por medio) — falla silenciosa e inaceptable
   para un panel que va a usar alguien no técnico.

**Se volvió a Decap CMS**, la única de las tres con un guardado real verificado, y se resolvió el
problema de producción con **[DecapBridge](https://decapbridge.com)** — un reemplazo gratuito
hecho específicamente para sustituir Netlify Identity + Git Gateway, sin depender de qué hosting
sirva el sitio ni requerir mantener un servidor propio.

### Qué se puede editar

- **Productos** (`src/content/products/<categoría>/<slug>.json`): una colección por categoría
  (Muebles, Uñas, Capilares, Maquillaje) — Decap no lee subcarpetas dentro de una sola colección,
  por eso hay 4 en vez de 1 (mismo patrón ya validado en la Sesión 19). Campos: nombre, slug,
  categoría (oculta, fija según la colección), subcategoría, código, precio, marca,
  características, foto principal y su texto alternativo (ALT) — exactamente los campos que
  existen hoy en `src/content.config.ts`, sin agregar campos nuevos (destacado, disponible,
  galería, precio anterior, SEO title/description no existen todavía en el modelo real).
- **Promociones** (`src/content/promos/*.json`): título, descripción, categoría/foto, ALT y orden.
- La foto se sube directo desde el panel (queda en `src/assets/products/<categoría>/`) o se puede
  escribir el nombre de un archivo que ya exista ahí — el campo guarda solo el nombre del archivo,
  no una ruta completa, tal como espera `imageFor(categoria, filename)` en el código de las
  páginas. Sin cambios en ese código.
- `slug` y `code` llevan una advertencia visible en el propio campo explicando que no deben
  cambiarse en un producto ya publicado.

### Cómo probarlo/usarlo en local (funciona ya, sin ninguna cuenta)

```bash
npm run admin            # levanta decap-server en localhost:8081 (terminal aparte)
astro dev --background   # el sitio normal
```

Abrir `http://localhost:4321/admin/index.html`. Con `local_backend: true` en `config.yml`, Decap
detecta automáticamente el `decap-server` local — sin login, sin GitHub, sin cuentas externas.
Verificado de nuevo en esta sesión: las 5 colecciones cargan sus entradas reales, la foto de
Butaca Francia se previsualiza, y un guardado real de prueba (cambio de precio) se escribió
correctamente en el archivo — confirmado con `git diff`, no solo con el mensaje de la interfaz.

### Producción (pendiente — requiere una cuenta externa)

`public/admin/config.yml` ya está configurado para DecapBridge, pero con un valor de ejemplo
(`TU-SITE-ID`) en `identity_url` que hay que reemplazar por el real. Pasos (ninguno lo puede hacer
una sesión de Claude Code — crear una cuenta externa solo lo puede autorizar el dueño del
negocio):

1. Crear una cuenta gratuita en [decapbridge.com](https://decapbridge.com).
2. Crear un "Site" ahí conectado al repositorio `wleon6745-16/alva-importaciones-web`.
3. Copiar el "Site ID" real que genera DecapBridge y reemplazar `TU-SITE-ID` en
   `public/admin/config.yml` → `backend.identity_url`.
4. Invitar por correo a la persona de ALVA que va a administrar contenido, desde el panel de
   DecapBridge.
5. Con eso, `/admin` en el dominio de producción real pedirá login (gestionado por DecapBridge) y
   guardará los cambios como commits reales en GitHub.

## 7. Checklist rápido para una sesión futura de actualización de contenido

1. `npm run build && npm run seo:validate` antes de dar por terminado cualquier cambio visual o
   de contenido.
2. Si se agregan o cambian fotos, verificar que el archivo de origen tenga resolución suficiente
   para donde se va a usar (mínimo ~700px de lado para tarjetas grandes; para un hero a pantalla
   completa se necesitaría bastante más — ver la lección aprendida en
   `docs/seo-work/sessions/session-17.md` sobre el hero de la home).
3. Revisar visualmente en navegador (desktop y mobile) antes de considerar el cambio terminado —
   un build exitoso no garantiza que se vea bien.
