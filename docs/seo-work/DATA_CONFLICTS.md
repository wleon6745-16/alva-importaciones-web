# Conflictos de datos entre fuentes

No resolver estos conflictos inventando o asumiendo cuál valor es correcto. Se listan para que
el usuario (o una sesión futura con instrucción explícita) los confirme.

---

## CONFLICT-001 — Número de WhatsApp de la Sucursal

- **Fuentes en conflicto**:
  - Dato entregado directamente por el usuario en el chat (2026-08-06): `0963946590` → configurado
    en `src/lib/site-config.ts` como `593963946590` (Sucursal).
  - Enlace `https://wa.me/593963976590` encontrado en una publicación real del canal de Telegram
    de Alva Importaciones (`messages2.html`, mensaje del 04-08-2026, promoción de insumos de uñas).
- **Diferencia exacta**: `593963946590` (configurado) vs `593963976590` (visto en Telegram) — difieren
  en el 5º-6º dígito local (`46` vs `76`).
- **Estado**: sin resolver. No se ha cambiado el número configurado.
- **Impacto**: si el número configurado es incorrecto, los CTA de WhatsApp de la Sucursal en el
  sitio (`/contacto`, WhatsApp genérico si se usara ese número) fallarían o llegarían a un
  destinatario equivocado.
- **Acción pendiente**: confirmar con el cliente cuál de los dos números es el real. Ver
  `MANUAL_ACTIONS.md`.

---

## CONFLICT-002 — Código de producto duplicado entre categorías distintas

- **Fuentes en conflicto**:
  - `messages.html` (post del 08-09-2025): "Camilla multiuso 3 niveles", **COD:9974**, $208,
    color negro, niveles de inclinación ajustables — ya publicada en `/productos/muebles`
    (sección Camillas).
  - `messages2.html` (post del 29-06-2026): "Silla de barbería SILETI ST-4100-1", **COD:9974**,
    $208 — mismo código, mismo precio, categoría y nombre distintos.
- **Estado**: no se publicó la segunda entrada (ST-4100-1) para evitar un posible duplicado
  visual del mismo producto bajo dos nombres. Solo está publicada la "Camilla multiuso 3 niveles".
- **Impacto**: si en realidad son dos productos distintos que comparten código por error del
  negocio, falta un mueble por publicar (la silla SILETI ST-4100-1, sin foto propia verificada
  como distinta de la camilla).
- **RESUELTO 2026-08-06**: verificado contra la base de datos real de `ASISTENTE`
  (tabla `products`, tenant Alva, base `assistant_sacc` vía `docker exec asistente-db-1 psql`).
  El registro autoritativo es:

  ```text
  id_sacc=19993  codigo=9974  nombre="SILETI CAMILLA 3 TIEMPOS NEGRO ST-4100-1"
  categoria=LIFTING  subcategoria=ACCESORIOS C  stock=0
  precios={"1":"215","2":"213","3":"210","4":"208",...}
  ```

  Es la **camilla**, no una silla de barbería — el post de `messages2.html` que decía "SILLA DE
  BARBERIA SILETI ST-4100-1" tiene un error de tipeo/categorización del propio negocio al
  redactar la publicación. No hay un mueble nuevo que publicar; la ficha ya existente
  "Camilla multiuso 3 niveles" en `/productos/muebles` es correcta. Dato adicional encontrado: el
  producto tiene **stock 0** en SACC al momento de la verificación (el sitio no muestra stock en
  vivo hoy, así que esto no afecta la página, pero es relevante para Sesión 2 si se conecta stock
  real).

---

## CONFLICT-003 — Mismo modelo (ST-2202) publicado dos veces con nombres distintos

- **Fuentes en conflicto**:
  - `messages.html` (27-09-2025): "Sillón para Peluquería" (imagen muestra modelo **ST-2202**),
    $345, sin COD explícito en el texto — publicada en `/productos/muebles` como
    "Sillón de peluquería ST-2202".
  - `messages2.html` (29-06-2026): "Sillón de barbería SILETI ST-2202", **COD:11004**, $345 —
    mismo modelo y precio, nombre de marca ("SILETI") y de categoría ("barbería" en vez de
    "peluquería") distintos.
- **Estado**: no se publicó la segunda entrada por ser, con alta probabilidad, el mismo producto
  re-anunciado 9 meses después con la línea de marca "SILETI" añadida.
- **Impacto**: bajo — es informativo. Si se confirma que es el mismo producto, se podría
  enriquecer la ficha existente con el código `COD:11004` y el nombre de marca "SILETI".
- **Acción pendiente**: opcional, confirmar y actualizar el código en la ficha existente.

---

## LIMITACIÓN-001 — Sin conexión en vivo a la base de datos de ASISTENTE (no es un conflicto)

- **Contexto**: `NEXT_SESSION.md` (post Sesión 1) sugería evaluar si `scripts/sync-public-catalog.ts`
  debía leer en vivo la tabla `products` de `assistant_sacc` (Docker/Postgres del repo
  `ASISTENTE`) en vez de depender de un seed manual.
- **Decisión (Sesión 2, 2026-08-07)**: no conectar en vivo por ahora. El sitio se compila estático
  (`astro build`) y no tiene backend propio en producción donde guardar credenciales de Postgres
  de forma segura; hacerlo hoy implicaría exponer credenciales en el repo o en el entorno de build.
- **Estado actual**: `scripts/sync-public-catalog.ts` usa un seed manual (los mismos 25 productos
  ya publicados, sanitizados) documentado como tal en el propio script.
- **Impacto**: el catálogo público no se actualiza automáticamente si cambian precios/stock en
  SACC. Hay que volver a editar el seed y correr `npm run catalog:sync` a mano mientras esto no
  se resuelva.
- **Acción pendiente**: si se decide sincronizar en vivo más adelante, definir dónde vivirían las
  credenciales de solo lectura (variable de entorno en CI/build, nunca en el repo) antes de
  implementarlo.

---

## Cómo registrar un nuevo conflicto

```text
## CONFLICT-XXX — <título corto>

- **Fuentes en conflicto**: <de dónde sale cada valor, con fecha/archivo/mensaje>
- **Diferencia exacta**: <valores exactos comparados>
- **Estado**: sin resolver / resuelto el <fecha> a favor de <fuente>, motivo: <...>
- **Impacto**: <qué se rompe o qué queda desactualizado si no se resuelve>
- **Acción pendiente**: <qué falta, o referencia a MANUAL_ACTIONS.md>
```
