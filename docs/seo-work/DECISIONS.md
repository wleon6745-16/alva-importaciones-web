# Decisiones técnicas

Registro de decisiones que **no deben revertirse** sin una razón nueva y explícita del usuario.
Sesiones futuras: lean esto antes de "corregir" algo que parezca raro — probablemente fue
deliberado.

---

Fecha: 2026-08-06
Decisión: El sitio de Alva Importaciones vive en un repositorio propio e independiente
(`C:\Users\wleon\Proyectos\alva-importaciones-web`), fuera del monorepo `ASISTENTE`.
Motivo: El usuario pidió explícitamente que la carpeta esté fuera de `ASISTENTE`. El sitio no
depende del backend del asistente para funcionar (MVP estático), y acoplarlo al monorepo del
asistente habría mezclado dos ciclos de vida de despliegue distintos.
Alternativas descartadas: Añadir `website/` dentro de `ASISTENTE` junto a `frontend/` y `backend/`.
Archivos afectados: todo el repo `alva-importaciones-web`.
Riesgo: bajo. Implica que la sincronización de catálogo (Sesión 2) debe leer `ASISTENTE` como
fuente externa de solo lectura, no como dependencia de build.

---

Fecha: 2026-08-06
Decisión: Stack del sitio: Astro 7 (salida estática) + islas de React (Framer Motion) + Tailwind
CSS v4.
Motivo: Sitio mayormente estático orientado a SEO; Astro genera HTML estático por página con el
menor JS posible, y las islas permiten animación rica solo donde aporta (demo de chat, carrusel).
Alternativas descartadas: Next.js (más pesado de lo necesario), Vite+React puro (SEO/SSG manual).
Archivos afectados: `astro.config.mjs`, todo `src/`.
Riesgo: bajo.

---

Fecha: 2026-08-06
Decisión: Paleta de marca real = negro/blanco + rojo `#CE113B` (tomado por muestreo de píxel del
logo oficial que envió el cliente), NO el burdeos/vino que se había supuesto inicialmente a partir
de una captura comprimida del avatar de Instagram.
Motivo: El cliente envió el logo oficial en JPG (18 variantes); una de ellas tiene fondo sólido
del rojo de marca real, del cual se muestreó el hex exacto con PIL.
Alternativas descartadas: mantener el burdeos `#7A1B32` supuesto originalmente.
Archivos afectados: `src/styles/global.css` (tokens `--color-primary-*`), todos los componentes
que usan `primary-700/800/900`.
Riesgo: bajo, ya validado visualmente con capturas de pantalla.

---

Fecha: 2026-08-06
Decisión: El foco principal del catálogo/homepage es la categoría **Muebles** (camillas, sillones
de peluquería/barbería, butacas, mesas, equipo), por encima de uñas/capilares/maquillaje.
Motivo: Instrucción explícita del usuario ("quiero que el foco de la página sea mostrar los
muebles"). Los datos reales (Telegram) confirman que es una línea de negocio activa y reciente
(publicaciones de sept-nov 2025 y may-ago 2026).
Alternativas descartadas: mantener el homepage centrado en insumos de belleza (uñas/capilares/
maquillaje) como se había planteado inicialmente.
Archivos afectados: `src/pages/index.astro`, `src/pages/productos/index.astro`,
`src/pages/productos/muebles.astro` (nueva).
Riesgo: bajo. Reversible cambiando el orden de `categories` y el hero si el negocio pide volver
al enfoque anterior.

---

Fecha: 2026-08-06
Decisión: Las direcciones de Matriz y Sucursal se tomaron de texto visible en publicaciones
promocionales del canal de Telegram (no de una fuente oficial verificada como Google Business
Profile).
Motivo: Era la única fuente disponible en el momento; el usuario no había confirmado direcciones
por otro medio.
Alternativas descartadas: dejar placeholders genéricos ("Portoviejo, Manabí") indefinidamente.
Archivos afectados: `src/lib/site-config.ts` (`locations`).
Riesgo: medio — ver `MANUAL_ACTIONS.md` #3. El texto es correcto tal como el negocio lo publicó,
pero no tiene coordenadas verificadas para un pin de mapa preciso.

---

Fecha: 2026-08-06
Decisión: Se crea un sistema de control persistente (`docs/seo-work/` + `tasks/`) en lugar de
depender del historial de conversación para continuar el trabajo de SEO/catálogo entre sesiones.
Motivo: Instrucción explícita del usuario; el uso de Claude Code se reinicia cada ~5 horas y no
se puede asumir que una sesión futura recuerde lo hablado.
Alternativas descartadas: ninguna — fue un requisito directo, no una elección técnica abierta.
Archivos afectados: `docs/seo-work/*`, `tasks/*`, `scripts/tasks.mjs`, `package.json` (scripts
`task:*`).
Riesgo: bajo. El principal riesgo es que el sistema se vuelva obsoleto si una sesión futura no lo
actualiza al cerrar — por eso el protocolo de cierre de sesión es obligatorio.

---

## Cómo registrar una nueva decisión

```text
Fecha:
Decisión:
Motivo:
Alternativas descartadas:
Archivos afectados:
Riesgo:
```
