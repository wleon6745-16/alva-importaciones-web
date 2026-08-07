# Acciones que requieren intervención humana

Ninguna de estas acciones puede completarla una sesión de Claude Code por sí sola. Se listan
para que el usuario (Junior) las resuelva cuando pueda; las tareas de desarrollo no deben
bloquearse esperándolas salvo que se indique lo contrario.

| # | Acción | Por qué es manual | Bloquea a | Estado |
|---|---|---|---|---|
| 1 | Confirmar cuál es el número real de WhatsApp de la Sucursal (ver `DATA_CONFLICTS.md` CONFLICT-001: `593963946590` vs `593963976590`) | Solo el negocio sabe cuál es correcto | Sesión 4, 7 | Pendiente |
| 2 | Confirmar si `COD:9974` corresponde a la camilla 3 niveles, a la silla de barbería SILETI ST-4100-1, o a ambas por error (ver `DATA_CONFLICTS.md` CONFLICT-002) | Requiere revisar el sistema de inventario real | Sesión 2, 9 | Pendiente |
| 3 | Confirmar direcciones exactas / pines de Google Maps de Matriz y Sucursal (hoy son direcciones en texto tomadas de publicaciones de Telegram, sin coordenadas verificadas) | Requiere que el negocio confirme o comparta el pin real | Sesión 7 | Parcialmente resuelto — direcciones en texto ya cargadas, falta pin/coordenadas |
| 4 | Confirmar teléfono fijo (si existe) además de los WhatsApp | No se ha visto ningún teléfono fijo en las fuentes revisadas | Sesión 7 | Pendiente |
| 5 | Confirmar políticas de garantía/cambios vigentes (las cargadas vienen de `ASISTENTE/backend/src/database/seed_alva_business_policies_phase61.sql`, de 2025) | Pueden haber cambiado | Sesión 9 | Pendiente |
| 6 | Comprar/asignar el dominio real (hoy el sitio usa el placeholder `https://alvaimportaciones.com` en `astro.config.mjs` y `site-config.ts`) | Requiere compra/gestión de dominio | Sesión 16, y cualquier sesión que dependa de URLs absolutas correctas | Pendiente |
| 7 | Configurar Google Search Console para el dominio real | Requiere acceso a cuenta Google del negocio | Sesión 16 | Pendiente |
| 8 | Configurar Bing Webmaster Tools | Requiere cuenta Microsoft | Sesión 16 | Pendiente |
| 9 | Configurar Bing Places / Google Business Profile | Requiere verificación física del negocio (postal/telefónica) | Sesión 7, 16 | Pendiente |
| 10 | Añadir claves de IndexNow, analítica (GA4 u otra) y cualquier otro secreto | No deben vivir en el repo en texto plano; requieren variables de entorno del hosting real | Sesión 4, 11, 16 | Pendiente |
| 11 | Configurar el entorno de producción (hosting, HTTPS, redirecciones) | Depende de dónde se decida desplegar (no definido aún) | Sesión 16 | Pendiente |
| 12 | Proveer el logo en formato vectorial fuente (AI/EPS/PSD) si existe, más allá de los PNG ya extraídos de las fotos JPG del cliente | Los assets actuales (`public/brand/*.png`) fueron generados por chroma-key desde JPGs; sirven pero no son ideales para todos los usos (p. ej. impresión) | Ninguna sesión de este plan depende de esto | Pendiente, no bloqueante |
| 13 | Confirmar testimonios reales de clientes para reemplazar los de ejemplo en `TestimonialCarousel.tsx` | Requiere reseñas reales del negocio | Ninguna sesión de este plan depende de esto directamente | Pendiente, no bloqueante |

## Cómo añadir una nueva acción manual

Agregar una fila a la tabla con: qué falta, por qué no lo puede hacer una sesión de Claude Code,
qué tareas bloquea (o "Ninguna, no bloqueante"), y el estado.
