# Acciones que requieren intervención humana

Ninguna de estas acciones puede completarla una sesión de Claude Code por sí sola. Se listan
para que el usuario (Junior) las resuelva cuando pueda; las tareas de desarrollo no deben
bloquearse esperándolas salvo que se indique lo contrario.

## Checklist final de lanzamiento (SEO-016)

El código y el contenido del plan (`SEO-001` a `SEO-015`) están completos y verificados
(`npm run build` y `npm run seo:validate` pasan sin errores). Lo que queda antes de que el sitio
esté realmente en producción y descubierto por buscadores/IA es **exclusivamente** esto — todo
requiere acceso a cuentas del negocio, no puede completarlo una sesión de Claude Code:

- [ ] **Dominio real** comprado/asignado, reemplazando el placeholder `alvaimportaciones.com` en
      `astro.config.mjs` y `src/lib/site-config.ts` (fila #6 abajo). Ver `docs/DEPLOYMENT.md` §3.
- [ ] **Hosting + HTTPS** configurados y el sitio sirviendo sobre el dominio real (fila #11). Ver
      `docs/DEPLOYMENT.md` §3-5.
- [ ] **Google Search Console**: verificar propiedad del dominio real, enviar
      `https://<dominio>/sitemap-index.xml` (fila #7).
- [ ] **Bing Webmaster Tools**: verificar propiedad, enviar el mismo sitemap (fila #8).
- [ ] **Bing Places / Google Business Profile**: crear o reclamar las fichas de Matriz y
      Sucursal con las direcciones ya verificadas en `/locales/matriz` y `/locales/sucursal`
      (fila #9) — requiere verificación física/telefónica del negocio.
- [ ] **IndexNow**: generar una clave real, configurarla como `INDEXNOW_KEY` en el entorno del
      hosting (nunca en el repo), y correr `npm run indexnow` tras el primer despliegue (fila
      #10; mecanismo ya implementado en SEO-011, ver `docs/AUTOMATED_TASKS.md` §4).
- [ ] **Analítica** (GA4 u otra): decidir proveedor, instalar su script, y verificar que
      `WhatsAppCTA.astro` (que ya empuja a `window.dataLayer`, ver SEO-004) llega correctamente
      al proveedor elegido — no requiere cambios de código, solo el script del proveedor y su ID
      (fila #10).
- [ ] **Panel de administración `/admin` en producción** (Decap CMS, fuera del plan original,
      agregado en Sesión 19): subir el repo a GitHub, desplegar en Netlify, activar Identity +
      Git Gateway (filas #16-17). Sin esto, `/admin` no funciona en el dominio real — pero **sí
      funciona ya en local** con `npm run admin` + `astro dev --background`, sin depender de
      nada de esto (ver `docs/CONTENT_WORKFLOW.md` §6).

Ninguno de estos pasos está bloqueado por trabajo de código pendiente — todos son configuración
de cuentas externas que solo el dueño del negocio puede autorizar/ejecutar.

Nota aparte (no bloqueante): Docker Desktop en esta máquina no está arrancando el motor
(`HCS_E_SERVICE_NOT_AVAILABLE` al correr `docker ps`, diagnosticado en la Sesión 19 — el servicio
de virtualización de Windows no responde incluso después de reiniciar Docker Desktop). El sitio
**no depende de Docker para nada durante el desarrollo** (`astro dev` es suficiente); el
`Dockerfile`/`nginx.conf` del repo solo hacen falta si se elige ese método de despliegue en
producción. Arreglar Docker en esta máquina requiere una acción a nivel de Windows
(activar/reparar Hyper-V o el servicio de Contenedores de Windows) que una sesión de Claude Code
no puede ejecutar sin permisos de administrador.

## Tabla completa

| # | Acción | Por qué es manual | Bloquea a | Estado |
|---|---|---|---|---|
| 1 | Confirmar cuál es el número real de WhatsApp de la Sucursal (ver `DATA_CONFLICTS.md` CONFLICT-001: `593963946590` vs `593963976590`) | Solo el negocio sabe cuál es correcto | Sesión 4, 7 | Pendiente |
| 2 | ~~Confirmar si `COD:9974` corresponde a la camilla 3 niveles o a una silla de barbería~~ | — | — | **Resuelto 2026-08-06** vía consulta directa a la base de datos de `ASISTENTE` (tabla `products`). Es la camilla. Ver `DATA_CONFLICTS.md` CONFLICT-002. |
| 3 | Confirmar pines/coordenadas exactas de Google Maps de Matriz y Sucursal | El texto de la dirección ya está verificado contra `tenant_branches` en la base de datos de `ASISTENTE` (2026-08-06); falta solo la coordenada geográfica exacta para un pin preciso | Sesión 7 | Parcialmente resuelto — dirección en texto verificada contra la base de datos real, falta pin/coordenadas |
| 4 | Confirmar teléfono fijo (si existe) además de los WhatsApp | No se ha visto ningún teléfono fijo en las fuentes revisadas | Sesión 7 | Pendiente |
| 5 | Confirmar políticas de garantía/cambios vigentes (las cargadas vienen de `ASISTENTE/backend/src/database/seed_alva_business_policies_phase61.sql`, de 2025) | Pueden haber cambiado | Sesión 9 | Pendiente |
| 6 | Comprar/asignar el dominio real (hoy el sitio usa el placeholder `https://alvaimportaciones.com` en `astro.config.mjs` y `site-config.ts`) | Requiere compra/gestión de dominio | Sesión 16, y cualquier sesión que dependa de URLs absolutas correctas | Pendiente |
| 7 | Configurar Google Search Console para el dominio real | Requiere acceso a cuenta Google del negocio | Sesión 16 | Pendiente |
| 8 | Configurar Bing Webmaster Tools | Requiere cuenta Microsoft | Sesión 16 | Pendiente |
| 9 | Configurar Bing Places / Google Business Profile | Requiere verificación física del negocio (postal/telefónica) | Sesión 7, 16 | Pendiente |
| 10 | Añadir claves de IndexNow, analítica (GA4 u otra) y cualquier otro secreto | No deben vivir en el repo en texto plano; requieren variables de entorno del hosting real | Sesión 4, 11, 16 | Pendiente |
| 11 | Configurar el entorno de producción (hosting, HTTPS, redirecciones) | Depende de dónde se decida desplegar (no definido aún) | Sesión 16 | Pendiente |
| 12 | Proveer el logo en formato vectorial fuente (AI/EPS/PSD) si existe, más allá de los PNG ya extraídos de las fotos JPG del cliente | Los assets actuales (`public/brand/*.png`) fueron generados por chroma-key desde JPGs; sirven pero no son ideales para todos los usos (p. ej. impresión) | Ninguna sesión de este plan depende de esto | Pendiente, no bloqueante |
| 13 | Confirmar testimonios reales de clientes para reemplazar los de ejemplo en `TestimonialCarousel.tsx` | Requiere reseñas reales del negocio | Ninguna sesión de este plan depende de esto directamente | Pendiente, no bloqueante. **Actualización 2026-08-09**: el componente se quitó de la home en la segunda pasada de calidad (usaba personas genéricas tipo "Clienta frecuente" en vez de testimonios reales — no encajaba con el tono comercial buscado). El archivo sigue en `src/components/TestimonialCarousel.tsx` sin usarse, listo para reactivarse el día que existan testimonios reales con nombre y contexto verificados. |
| 14 | Confirmar si "Envíos a todo el país 🚛🇪🇨" (mencionado repetidas veces en publicaciones del canal de Telegram, ver `reports/telegram-data-candidates.md` sección Políticas, mensajes del 09.05.2026 y 26.06.2026) sigue siendo una política vigente y en qué condiciones (costo, transportadora, tiempos) | Es una promesa de marketing repetida en el canal oficial, pero no está verificada como política vigente ni documentada con detalle — no se ha usado en ninguna página del sitio todavía (ver SEO-008, se evitó deliberadamente una mención de envíos sin confirmar) | Cualquier página futura que quiera mencionar envíos/cobertura nacional | Pendiente |
| 15 | Ampliar el cruce foto-por-código (`ASISTENTE/backend/assets/`) contra el resto del catálogo — solo 7 de 50 productos tuvieron match exacto por código en la segunda pasada de calidad; hay ~1440 códigos indexados sin cruzar todavía, y varias fotos sin código legible (broca, esmaltes, monómeros de Master Nails/Mía Secret) que podrían tener match por marca+nombre con revisión manual | Requiere comparación visual humana para confirmar que la foto corresponde al mismo modelo/color exacto (ver metodología en `docs/CONTENT_WORKFLOW.md`) | Ninguna sesión bloqueada — es una mejora incremental de calidad de imagen | Pendiente, no bloqueante |
| 16 | ~~Subir `alva-importaciones-web` a un repo de GitHub~~ | — | — | **Resuelto 2026-08-15**: repo público `https://github.com/wleon6745-16/alva-importaciones-web`, ramas `master` y `feature/alva-seo-ai-discovery` empujadas (`git remote add origin` + `git push -u`). |
| 17 | Desplegar el sitio en Netlify conectado al repo de GitHub (fila #16, ya resuelta), y activar Identity + Git Gateway en Site settings | Requiere cuenta de Netlify del negocio; es la forma más simple de que `/admin` (Decap CMS) funcione en producción sin crear una OAuth app aparte | Panel `/admin` en producción | Pendiente — ya no bloqueada, el repo está en GitHub |

## Cómo añadir una nueva acción manual

Agregar una fila a la tabla con: qué falta, por qué no lo puede hacer una sesión de Claude Code,
qué tareas bloquea (o "Ninguna, no bloqueante"), y el estado.
