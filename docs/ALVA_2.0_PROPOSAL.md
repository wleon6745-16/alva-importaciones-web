# ALVA 2.0 — Auditoría y propuesta

**Fecha**: 2026-08-16. **Fase**: solo diagnóstico y propuesta — nada de esto está implementado.
Repo auditado: `alva-importaciones-web` (este). Repo investigado en paralelo (solo lectura):
`ASISTENTE` (`C:\Users\wleon\Proyectos\ASISTENTE`), vía un agente de exploración dedicado, con
una consulta de solo lectura contra la base de datos Postgres local ya corriendo
(`asistente-db-1`, Docker).

---

## A. Estado actual

`alvaimportaciones.com` es un sitio Astro **100% estático** (`output: "static"`), desplegado en
Cloudflare Workers (static assets), con dominio propio y HTTPS. El catálogo público hoy es un
**subconjunto curado a mano**: 74 productos, en 4 categorías fijas (`muebles`, `unas`,
`capilares`, `maquillaje`), cada uno un archivo JSON individual en
`src/content/products/<categoría>/<slug>.json`. Se editan directamente en el repo o desde el
panel `/admin` (Decap CMS + DecapBridge), que hace commit a git — no hay backend propio, no hay
base de datos, no hay sesión de usuario.

Stack: Astro 7.2 + React 19 (islas) + Tailwind v4. `framer-motion` **ya está instalado**
(`^13.0.0`) pero prácticamente sin usar — solo en `ChatDemo.tsx` y `TestimonialCarousel.tsx`
(este último inactivo, no se renderiza en ninguna página). Sin librería de carrito/checkout, sin
ningún código que mencione "cart"/"carrito"/"checkout" salvo el nombre de un producto real
("carrito auxiliar multiuso", un mueble).

SEO ya está en buen estado (fase recién cerrada hoy mismo): dominio canonical, sitemap, robots,
`llms.txt`, Schema.org, GA4, Search Console, Bing, IndexNow — ver `docs/SEO_ANALYTICS_BASELINE.md`.
Esto importa para ALVA 2.0 porque cualquier cambio de URLs o de cómo se genera el HTML puede
afectar directamente ese trabajo (ver sección K, riesgos).

---

## B. Catálogo — cómo se genera hoy y relación real con SACC/ASISTENTE

**Hoy no existe ninguna conexión entre `alva-importaciones-web` y `ASISTENTE`/SACC.** Búsqueda
exhaustiva en el repo de `ASISTENTE` (nombres del proyecto, "catálogo público", scripts de
exportación) — cero resultados. Son dos sistemas completamente desconectados.

Lo que sí existe, y es la pieza clave para ALVA 2.0:

```
SACC (ERP externo, controlsistemasjl.com)
      │  API HTTP autenticada (OAuth, SACC_USERNAME/PASSWORD/CLIENT_ID/SECRET)
      ▼
ASISTENTE (backend Node/Express + Postgres, ya corriendo en Docker)
      │  ProductSyncService sincroniza el catálogo completo a una tabla local `products`
      │  (12,066 filas reales del tenant de Alva, hoy)
      ▼
WhatsApp (vía Kapso, o Meta Cloud API directo — ambos caminos siguen montados en el código,
          no está claro cuál es el que realmente está en producción ahora mismo)
```

`ASISTENTE` **ya es, arquitectónicamente, exactamente la pieza que se pidió** ("SACC →
ASISTENTE/API → ALVA") — el conector SACC→Postgres local ya existe y funciona para WhatsApp. Lo
que falta es la salida hacia un tercer consumidor (el sitio web), que hoy no existe en absoluto.

### Hallazgos críticos que cambian el diseño de la integración

1. **El stock NO viene en la sincronización masiva.** Confirmado en el propio código de
   `ASISTENTE` (`product.mapper.ts`): el endpoint de catálogo masivo de SACC no incluye ningún
   campo de existencias — la columna `stock` de la tabla local **siempre vale 0** para las
   12,061 filas reales verificadas. El stock real solo se puede obtener llamando al endpoint de
   *detalle* de SACC, producto por producto, en el momento. Esto significa que **"stock en vivo
   para las 12,000+ fichas del sitio" no es viable con la sincronización actual** — hay que
   diseñar alrededor de esta limitación real, no asumir que "conectar a ASISTENTE" resuelve
   stock automáticamente.
2. **Los precios sí vienen bien, pero con matices de negocio.** `precios` es un mapa con niveles
   1 a 8; el nivel `"1"` es el precio público (el que se debe mostrar), el `"4"` es mayorista
   (solo si el cliente lo pide explícitamente), y `"2"`/`"3"` son ajustes manuales de vendedor que
   **nunca deben mostrarse automáticamente** (el propio código de ASISTENTE ya documenta esta
   regla para el chatbot — el sitio debe respetarla igual).
3. **Las fotos son el eslabón más débil.** Existen dos fuentes de imágenes en `ASISTENTE`:
   una carpeta con 1,431 archivos organizados por marca (`backend/assets/product-images/alva/`)
   y una columna `imagen_url` en la base de datos (solo 1,447 de 12,061 productos la tienen, y
   solo cubre muebles). La forma en que esa carpeta grande se vincula a cada producto real no
   está clara ni documentada — necesitaría su propia mini-auditoría antes de poder confiar en
   "traer la foto automáticamente" para el catálogo completo.
4. **No existe ninguna API pública o de servicio.** Todos los endpoints de `ASISTENTE`
   (`GET /api/products/search`, `GET /api/products/:id`, `POST /api/products/sync`) requieren
   un JWT de usuario autenticado — no hay API key ni token de servicio para acceso
   máquina-a-máquina. Además, `GET /api/products/:id` devuelve datos internos (costo, proveedor)
   que jamás deben llegar al público — ese endpoint tal cual no es apto para exponer.
5. **La sincronización diaria automática no está confirmadamente activa.** `JOB_SCHEDULER_ENABLED`
   está en `false` por defecto, y la última sincronización registrada en la base de datos local
   tiene varios días de antigüedad — sin poder confirmarlo con el dueño, no se puede asumir que
   el catálogo de ASISTENTE está siempre al día en producción.

---

## C. Datos disponibles (reales, verificados contra la base de datos de ASISTENTE)

| Categoría real (SACC) | Productos | Subcategorías | Marcas distintas |
|---|---:|---:|---:|
| UÑAS | 4,814 | 135 | 103 |
| CAPILAR | 2,904 | 91 | 158 |
| MAQUILLAJE | 2,600 | 104 | 111 |
| LIFTING | 465 | 47 | 54 |
| ACCESORIOS | 408 | 38 | 33 |
| FACIAL | 303 | 46 | 53 |
| BARBERIA | 262 | 29 | 34 |
| CORPORAL | 245 | 29 | 44 |
| MUEBLES | 47 | 8 | 4 |
| SERVICIOS | 13 | 1 | 1 |

**El sitio hoy solo cubre 4 de estas 10 categorías reales** (uñas, capilar, maquillaje, muebles —
y de "muebles" ya se curaron 47/47, prácticamente el 100%; de las otras tres, apenas una
fracción). **No existe una categoría "skincare" literal** en los datos reales — lo más cercano es
`FACIAL` (303 productos, 53 marcas). `ACCESORIOS` **sí existe ya como categoría propia** en SACC
(408 productos), separada de muebles — encaja directo con lo que pedía la dueña.

- **Marcas**: campo `marca` poblado en SACC, pero con un valor placeholder `"//"` (=
  "sin marca registrada") en ~2,524 filas — hay que filtrarlo, no mostrarlo como marca real.
- **Precios**: nivel público (`"1"`) disponible para prácticamente todo el catálogo.
- **Stock**: **no confiable en la sincronización masiva** (ver hallazgo #1 arriba).
- **Imágenes**: cobertura parcial y de vínculo poco claro (ver hallazgo #3).
- **Descripciones**: SACC trae `descripcion`/`datos_tecnicos`, pero no se auditó su calidad/
  completitud fila por fila — probable que varíe mucho, igual que pasó con el catálogo curado a
  mano (donde ya se documentó que algunos productos no traían características).

---

## D. Problemas encontrados

**Visuales/UX (código actual):**
- La sección "Categorías" de `/productos` (`CategoryCard.astro`) ya es visualmente decente
  (tarjetas grandes con foto, gradiente, hover) — no son "6 botones con iconos" — pero está
  **100% hardcodeada**: 4 categorías fijas, imágenes importadas a mano, sin filtro de marca en
  ningún lado del sitio.
- `ChatDemo.tsx` en la home es una **conversación falsa, guionada** (array fijo de 2 mensajes),
  no un asistente real — comunica la idea pero no funciona.
- Sin página ni componente de "marca" en absoluto hoy.

**Arquitectura/técnico:**
- El sitio es estático puro — sin runtime en el servidor. Esto choca directamente con "datos en
  vivo desde SACC" y con "carrito/checkout futuro", que necesitan estado de sesión y lógica de
  servidor (ver sección F e I).
- Cero código de integración con `ASISTENTE` — hay que construir todo el puente desde cero, no
  solo "conectar un endpoint que ya existe".

**Datos:**
- Solo 44 de 74 productos curados tienen marca asignada — ni siquiera el catálogo actual está
  100% listo para navegación por marca.
- Brecha real de cobertura: 74 productos curados a mano vs. 12,061 en el catálogo real de SACC.

**No se encontraron regresiones de SEO/rendimiento** — la fase de hoy mismo (SEO-Analytics) dejó
el sitio en buen estado; el riesgo es hacia adelante, no algo ya roto.

---

## E. Propuesta ALVA 2.0 (resumen conceptual)

Modernizar por **composición, no por reemplazo de identidad**: mantener paleta (negro/blanco/rojo
`#CE113B`), logo, tono de marca. Los cambios de impacto visual real, en orden de prioridad:

1. **Home rediseñada** con una sección "Compra por categoría" mucho más grande y visual que hoy
   (fotografía a página completa o casi, texto superpuesto con jerarquía fuerte, layout tipo
   editorial — usando `framer-motion`, ya instalado, para entrada escalonada/parallax sutil al
   hacer scroll). Con **6-10 categorías reales** (no 4), una vez curadas.
2. **Cards de producto/categoría con más movimiento**: hover con profundidad (ya hay una base en
   `CategoryCard.astro`, se puede llevar más lejos), transiciones de entrada con `SectionReveal`
   (ya existe, usa `IntersectionObserver`) combinadas con `framer-motion` para curvas de
   animación más ricas que el fade/slide actual.
3. **Navegación por marca** dentro de cada categoría — nuevo, no existe hoy.
4. **Jerarquía tipográfica más marcada** en detalle de producto (hoy es funcional pero plana).
5. Mobile: revisar especialmente el menú (`Header.astro` usa `<details>`, funcional pero básico)
   y el orden de scroll en detalle de producto.

No se propone video de fondo en el hero sin evaluar peso/LCP — si se usa, debe ser opcional y
diferido (poster estático + carga bajo interacción o `loading="lazy"` real), no autoplay pesado
en el LCP.

---

## F. Arquitectura propuesta: SACC → ASISTENTE/API → ALVA

**Decisión central**: dado que (a) el sitio es estático hoy, (b) el stock real de SACC no está
disponible en bulk, y (c) no existe ninguna API pública en ASISTENTE todavía — la opción de más
bajo riesgo para una primera fase **no es** hacer llamadas en vivo por cada visita, sino una
**sincronización programada** (snapshot periódico) que escribe los mismos archivos de contenido
que ya usa el sitio hoy (`src/content/products/**/*.json`), automatizando lo que hoy hace un
humano a mano vía `/admin`.

```
SACC ──(ya existe)──> ASISTENTE (Postgres local, tabla `products`)
                              │
                              │  NUEVO: un endpoint de servicio en ASISTENTE
                              │  (autenticado con API key/token, NO el JWT de usuario actual;
                              │  responde solo campos públicos: nombre, categoría, subcategoría,
                              │  marca, precio nivel 1, imagen si existe — nunca costo/proveedor)
                              ▼
                    Job programado (ej. Cloudflare Cron Trigger, o GitHub Action)
                    que llama ese endpoint y escribe/actualiza los JSON de
                    src/content/products/**/*.json
                              │
                              ▼
                    git commit automático → mismo pipeline de build/deploy ya probado hoy
                              │
                              ▼
                    alvaimportaciones.com (sigue siendo 100% estático)
```

**Quién es responsable de cada dato** (tal como pedía la sección 4 del brief):

| Campo | Fuente de verdad | Cómo llega a ALVA |
|---|---|---|
| Nombre, código, categoría, subcategoría, marca | SACC (vía ASISTENTE) | Sync programado |
| Precio (nivel público) | SACC (vía ASISTENTE) | Sync programado |
| Stock/disponibilidad | SACC, pero **no confiable en bulk** | **No se muestra como número** — se mantiene "Consultar disponibilidad por WhatsApp" (ver nota abajo) |
| Foto comercial | SACC/ASISTENTE si existe y está verificada; si no, curación manual (como hoy) | Sync programado + fallback a `/admin` |
| Descripción enriquecida, SEO, slug, destacado, orden visual, banners | ALVA (contenido editorial, como hoy) | `/admin` (Decap CMS), sin cambios |

**Sobre el stock**: dado que SACC no lo entrega en bulk, mostrar un número de stock en 12,000
fichas sería **inventar precisión que no existe** — misma regla que ya seguimos en SEO ("no
inventar stock" en Schema.org). Se recomienda mantener el patrón actual (WhatsApp confirma
disponibilidad al instante) como el mecanismo real de verificación, en vez de un badge de stock
que podría estar desactualizado por días.

**Evolución posible más adelante** (no en esta fase): si en el futuro se agrega runtime al sitio
(ver sección I, e-commerce), ahí sí tendría sentido una llamada en vivo al endpoint de *detalle*
de SACC (el que sí trae stock real) para productos específicos en el momento de la compra —
pero no para las 12,000 fichas de catálogo en cada carga de página.

---

## G. Categorías y marcas — navegación sin hardcode

1. El **schema de Zod** en `content.config.ts` seguirá necesitando un enum de categorías válidas
   (es una validación de tipos, no un hardcode de contenido) — pero ese enum se actualiza cuando
   el job de sincronización descubre una categoría nueva en los datos reales, no cuando un
   desarrollador la escribe a mano adivinando.
2. **Rutas por categoría**: generalizar el patrón ya usado en
   `productos/[category]/[slug].astro` (hoy cubre uñas/capilares/maquillaje) para que
   `getStaticPaths()` derive la lista de categorías de los datos reales (`getAllProducts()`
   distinct por `category`), no de un array fijo en el código.
3. **Marcas**: **no crear una página indexable por cada una de las ~150+ marcas por categoría** —
   eso generaría cientos de páginas casi vacías (varias marcas tienen 1-2 productos), exactamente
   el tipo de "páginas artificiales" que ya se descartó en la fase de SEO local. Propuesta:
   - Filtro de marca **dentro** de la página de categoría (UI, sin nueva URL — como ya existe
     implícitamente el patrón de subcategoría con anclas `#subcategoria`).
   - Página de marca dedicada (`/productos/<categoría>/marca/<marca>`) **solo** para marcas con
     un volumen mínimo real (a definir con la dueña, ej. 10+ productos) — así cada página tiene
     contenido genuino que indexar, no una ficha vacía.

---

## H. Asistente web — cómo integrarlo después, sin duplicar lógica

**No implementar todavía** (según lo pedido). Lo que ya existe y lo que falta, concretamente:

- ASISTENTE **ya está diseñado** para esto: hay una abstracción `ChannelAdapter` compartida entre
  WhatsApp y "web chat", y ambos convergen en el mismo motor de IA/conversación
  (`assistant.service.ts`). La idea de "un solo cerebro, varios canales" ya es como está
  construido — buena señal, no hay que rediseñar ASISTENTE para esto.
- **Pero el endpoint de "web chat" que existe hoy (`POST /api/chat`) no sirve tal cual**: requiere
  un JWT de usuario logueado y está pensado para pruebas internas del equipo de ASISTENTE, no
  para visitantes anónimos del sitio público. Además `CORS_ORIGIN` hoy solo permite
  `localhost:5173`.
- **Lo que falta construir** (en `ASISTENTE`, no en este repo):
  1. Un endpoint público con su propio modelo de autenticación (ej. token de sesión de visitante
     de corta duración, o simplemente scoping + rate limiting por IP/tenant, sin cuenta de
     usuario) — reutilizando el `WebChannelAdapter` que ya existe como base.
  2. `CORS_ORIGIN` actualizado para incluir `https://alvaimportaciones.com`.
  3. Confirmar que la respuesta nunca incluya costo/proveedor/margen (la regla ya existe en el
     código para el flujo interno; hay que verificar que el nuevo endpoint público la herede).
- **En este repo**, cuando llegue el momento: un componente burbuja flotante (isla React,
  `client:visible`), reemplazando o evolucionando el actual `ChatDemo.tsx` (que pasaría de ser una
  animación decorativa a un chat real apuntando al nuevo endpoint de ASISTENTE).

---

## I. Preparación para e-commerce futuro (sin implementar pagos)

Hoy el CTA de producto es un solo botón (`WhatsAppCTA`). Para no tener que rediseñar todo después:

- **Componentizar la zona de acción** del detalle de producto (ya está parcialmente separada del
  resto del layout) para que mañana pueda alojar "Agregar al carrito"/"Comprar ahora" junto al
  WhatsApp actual, sin tocar el resto de la página.
- El tipo `Product` (`src/types/product.ts`) ya es limpio y consistente (id, slug, precio,
  moneda, categoría) — buena base para un futuro carrito, no necesita rediseño de datos.
- **La limitación real**: carrito + checkout necesitan estado de sesión y un endpoint de servidor
  para procesar el pago/pedido — **no es posible en un sitio 100% estático**. Esto significa que
  e-commerce real y "datos en vivo desde SACC" (sección F) apuntan en la misma dirección: en
  algún punto futuro conviene evaluar pasar de `output: "static"` a un adapter SSR/híbrido de
  Astro para Cloudflare Workers (que ya es donde está desplegado — encaja de forma natural, sin
  cambiar de hosting). **No es necesario para esta fase** ni para el snapshot de catálogo
  propuesto en la sección F, que funciona perfectamente estático.
- Mientras tanto, los CTAs correctos siguen siendo "Consultar", "WhatsApp", y eventualmente
  "Preguntar al asistente" (sección H) — nunca un botón de compra que no lleva a ningún lado.

---

## J. Plan de implementación (fases pequeñas y reversibles)

| Fase | Qué incluye | Archivos/módulos principales | Cómo se verifica antes de seguir |
|---|---|---|---|
| **2.0-A** — Curación de datos | Ampliar categorías reales (FACIAL, ACCESORIOS, LIFTING, BARBERIA, CORPORAL) con una primera tanda curada a mano (mismo proceso ya usado, ver `docs/CONTENT_WORKFLOW.md`), sin tocar el frontend todavía | `src/content/products/`, `content.config.ts` (nuevas categorías en el enum) | `npm run build` + `npm run seo:validate` sin errores; revisión visual de las páginas de categoría nuevas |
| **2.0-B** — Home y categorías (visual) | Rediseño de la sección "Compra por categoría", cards con más movimiento, tipografía/jerarquía | `src/pages/index.astro`, `CategoryCard.astro`, `global.css` | Lighthouse/PageSpeed antes/después (no bajar Core Web Vitals), revisión en móvil real |
| **2.0-C** — Navegación por marca | Filtro de marca en categoría + páginas de marca solo donde haya volumen real | `productos/[category]/[slug].astro` (generalizar), nuevo `productos/[category]/marca/[brand].astro` | `npm run seo:validate`, revisar que no se generen páginas casi vacías |
| **2.0-D** — Endpoint público en ASISTENTE | Construir el endpoint de servicio (auth por API key, solo campos públicos) — **trabajo en el repo `ASISTENTE`, no en este** | Fuera de este repo | Probar con `curl`/Postman antes de conectar nada del lado de ALVA |
| **2.0-E** — Sync automático de catálogo | Job programado que llama el endpoint de 2.0-D y actualiza `src/content/products/` + commit automático | Nuevo script (`scripts/sync-from-asistente.ts` o similar), Cloudflare Cron Trigger o GitHub Action | Correr manualmente primero contra un subset pequeño, comparar diffs antes de automatizar el commit |
| **2.0-F** — Asistente web (bubble) | Endpoint público de chat en ASISTENTE + componente burbuja en ALVA | Ver sección H | Probar exhaustivamente que nunca exponga costo/proveedor antes de publicar |
| **2.0-G** — Evaluación SSR/e-commerce | Solo si se decide seguir con carrito/checkout real | `astro.config.mjs` (adapter), todo lo que dependa de rutas dinámicas de servidor | Migración probada en una rama aparte, no en producción directo |

Cada fase es su propio commit/PR, verificable independientemente, y **ninguna depende de que la
siguiente ya esté decidida** — se puede parar después de cualquiera de ellas y quedar en un
estado estable.

---

## K. Riesgos

- **SEO**: cambiar URLs de categoría/producto sin redirects rompería lo que se acaba de dejar
  indexado hoy. Cualquier fase que toque rutas debe mantener las URLs actuales o agregar 301.
- **Rendimiento**: más categorías = más páginas + más imágenes. Si las fotos nuevas (curadas o
  desde ASISTENTE) no pasan por el mismo pipeline de optimización de Astro (`astro:assets`), se
  puede perder el trabajo ya hecho de Core Web Vitals.
- **Sincronización de catálogo**: un job automático que haga commit al repo sin supervisión puede
  pisar ediciones manuales hechas desde `/admin` si no se diseña con cuidado el orden/prioridad
  (¿qué gana si alguien editó la descripción a mano y luego corre el sync?). Hay que definir esa
  regla en la fase 2.0-E, no dejarla implícita.
- **Stock incorrecto**: el riesgo más serio de negocio, no técnico — si en algún momento se decide
  mostrar un número de stock igual, y no es confiable (ver hallazgo de la sección B), un cliente
  puede reclamar por un producto "disponible" que no lo está.
- **Endpoint público de ASISTENTE mal filtrado**: si el nuevo endpoint de servicio (2.0-D) no
  filtra bien costo/proveedor/margen, esos datos internos quedarían expuestos públicamente —
  requiere revisión de seguridad antes de publicarlo, no solo funcional.
- **Administración del panel `/admin` actual**: mientras no exista el sync automático (fases A-C
  antes de E), seguirá siendo la única forma de editar contenido — no se debe desactivar ni
  reestructurar sin que el sync automático ya esté probado y funcionando.

---

## Estado del repo al cierre de esta auditoría

- **Rama actual**: `feature/alva-seo-ai-discovery` (sincronizada con `origin`, sin cambios
  pendientes de commit).
- **Último commit relevante**: `2bc2d2b` — "chore: trigger rebuild to pick up INDEXNOW_KEY"
  (sobre `5123844` — "SEO analytics production readiness", la fase recién cerrada).
- **`npm run build`**: ✅ 101 páginas, sin errores.
- **No se hizo ningún cambio de código en esta fase** — solo lectura/auditoría, tal como se pidió.
  No hubo push ni despliegue de nada nuevo.
- **Problema a resolver antes de empezar ALVA 2.0 en serio**: ninguno bloqueante del lado de
  `alva-importaciones-web`. Del lado de `ASISTENTE`, antes de la fase 2.0-D conviene confirmar
  con el dueño: (1) qué integración de WhatsApp está realmente en producción (Kapso o Meta
  directo — ambas siguen en el código), y (2) si la sincronización diaria SACC→ASISTENTE está
  realmente corriendo en el entorno que usan los clientes reales (en este Docker local no lo
  está, `JOB_SCHEDULER_ENABLED=false`).
