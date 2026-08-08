# Sesión 09 — Información comercial de Telegram (validada)

**Fecha:** 2026-08-08
**Fase:** 9
**Tarea:** SEO-009
**Rama:** `feature/alva-seo-ai-discovery`

## Objetivo

Extractor controlado de candidatos comerciales (horarios, políticas, cursos, FAQ,
características) desde el export de Telegram, sin publicar nada automáticamente.

## Trabajo realizado

1. `scripts/extract-telegram-commercial-data.ts`: lee `messages.html` + `messages2.html` del
   export (`C:\Users\wleon\Downloads\...\ChatExport_2026-08-06\`), parsea cada mensaje de texto
   (fecha + contenido, decodificando `<br>`/entidades HTML), clasifica por keywords en 5
   categorías, deduplica por prefijo de texto, y compara horarios/precios de curso contra lo ya
   publicado (`site-config.ts` / `/cursos`) para detectar discrepancias candidatas — sin
   resolverlas. No modifica ninguna página del sitio.
2. `npm run telegram:extract` añadido a `package.json`.
3. `reports/telegram-data-candidates.md` generado: 1109 mensajes de texto leídos.
   - **Horarios**: 1 candidato, confirma exactamente el horario ya publicado (9:00–18:00) — sin
     discrepancia.
   - **Políticas**: 3 candidatos, incluyen "Envíos a todo el país 🚛🇪🇨" mencionado dos veces —
     hallazgo nuevo, no usado en ninguna página todavía (en SEO-008 se evitó deliberadamente
     mencionar envíos sin confirmar). Registrado en `MANUAL_ACTIONS.md` #14 como pendiente de
     confirmación, no se publicó como oficial.
   - **Cursos**: sin candidatos (el canal de Telegram no promociona el curso; su origen es otro,
     ya documentado en `DATA_CONFLICTS.md`/sesiones previas).
   - **FAQ**: 12 candidatos, en su mayoría preguntas retóricas de marketing ("¿Por qué te va a
     encantar?") y no preguntas reales de clientes — esperado del filtro simple por "?", queda
     documentado para que quien cure el contenido lo sepa de antemano.
   - **Características de producto**: 16 candidatos de muestra (de un volumen mayor, limitado a
     25 en el reporte) — confirma que hay mucho más catálogo de uñas/capilares/maquillaje en
     Telegram sin curar todavía; esa curación completa es tarea de SEO-012, no de esta.
4. `MANUAL_ACTIONS.md`: nueva fila #14 (política de envíos sin confirmar).

## Validaciones ejecutadas

- `node scripts/extract-telegram-commercial-data.ts` → ejecuta sin error, reporte generado.
- `npm run build` → ✅ 46 páginas (sin cambios, esta tarea no toca páginas del sitio).
- Revisión manual del reporte: ningún dato se copió a una página pública; toda la salida vive en
  `reports/` (fuera de las rutas del sitio) marcada explícitamente como "candidatos sin
  verificar".

## Resultado

`SEO-009` completada. Evidencia en `tasks/evidence/SEO-009.log`.

## Siguiente tarea

`SEO-010` — Guías para búsqueda y buscadores con IA.
