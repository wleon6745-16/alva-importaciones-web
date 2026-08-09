# Próxima sesión

## Estado: el plan de `MASTER_PLAN.md` está completo

Las 16 fases (`SEO-001` a `SEO-016`) están `completed` en `tasks/seo-tasks.json`. No hay ninguna
tarea de código pendiente. `npm run build` y `npm run seo:validate` pasan sin errores.

## Qué leer primero si retomas este proyecto

1. `docs/seo-work/CURRENT_STATE.md` — resumen de las 16 sesiones y qué produjo cada una.
2. `docs/seo-work/MANUAL_ACTIONS.md` → sección "Checklist final de lanzamiento" — lo único que
   falta es configuración de cuentas externas del negocio (dominio, hosting, Search Console,
   Bing, Google Business Profile, IndexNow, analítica). Nada de código.
3. `docs/DEPLOYMENT.md` — guía de despliegue completa.
4. `docs/seo-work/DATA_CONFLICTS.md` — conflictos de datos sin resolver (número de WhatsApp de
   Sucursal, política de envíos sin confirmar) que siguen esperando confirmación humana.

## Si el usuario pide continuar trabajo nuevo

Este sistema de control (`tasks/seo-tasks.json`, `scripts/tasks.mjs`, protocolo de
`MASTER_PLAN.md`) sigue funcionando. Para una tarea nueva:

1. Añadir una entrada a `tasks/seo-tasks.json` (mismo formato: `id`, `phase`, `title`, `status`,
   `priority`, `dependencies`, `acceptanceCriteria`, `validationCommands`, `commitMessage`).
2. `npm run task:start -- <ID>`.
3. Trabajar, seguir el protocolo de cierre de `MASTER_PLAN.md` (actualizar `CURRENT_STATE.md`,
   escribir `docs/seo-work/sessions/session-NN.md`, reescribir este archivo).
4. `npm run task:complete -- <ID>`.

## Candidatos obvios para una fase futura (no forzados, solo sugeridos)

- Curar más productos de uñas/capilares/maquillaje desde
  `reports/telegram-data-candidates.md` (SEO-012 solo cubrió una selección representativa de 25,
  hay cientos más sin curar).
- Resolver `DATA_CONFLICTS.md` CONFLICT-001 (número de WhatsApp de Sucursal) y el hallazgo de
  envíos nacionales de `MANUAL_ACTIONS.md` #14, una vez el negocio confirme los datos reales.
- Coordenadas GPS exactas para los pines de Google Maps de Matriz/Sucursal
  (`MANUAL_ACTIONS.md` #3).
