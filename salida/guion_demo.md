# Guion de la demo — Grupo 11 (lunes 5/10/2026)

Slide 13 de la presentación · **habla Matías** · duración objetivo **2 min** (máximo 3).
Se comparte pantalla con **dos ventanas**: la terminal (Git Bash) y el Browser de Neo4j (`http://localhost:7474`).

---

## 0. Antes de la clase (15 min antes)

1. Abrir **Docker Desktop** y esperar a que diga *Engine running*.
2. En Git Bash, desde la carpeta del proyecto:
   ```bash
   cd "/d/University/Quinto/IA/Proyecto IA"
   bash neo4j/cargar.sh            # crea/arranca el contenedor y carga 01→04
   ```
   Tiene que terminar con `✓ Listo` y el resumen `55, 105, 38, 122, 626`
   (frames, slots, reglas, instancias, relaciones).
3. Abrir `http://localhost:7474` → usuario `neo4j`, contraseña `password`. Dejar abierta una pestaña.
4. Probar la demo una vez sin pausas: `bash neo4j/demo.sh --sin-pausa` (tarda ~30 s).
5. Terminal: fuente grande (Ctrl + rueda), ventana maximizada, fondo oscuro.
6. Tener a mano el **video de respaldo** (sección 5) en el escritorio.

> Si `cargar.sh` falla con «Docker no responde»: abrir Docker Desktop y repetir.
> Si el puerto 7474 o 7687 está ocupado: `docker ps` y frenar lo que lo use.

---

## 1. Demo en vivo (terminal) — `bash neo4j/demo.sh`

El script recarga la base al estado inicial de los casos (01→03, **sin reglas aplicadas**) y muestra cada paso
con título, la consulta y una pausa. `Enter` ejecuta; `Enter` pasa al siguiente.
Los pasos «silenciosos» se aplican solos y muestran una línea `· paso NN aplicado`.

| # | Lo que aparece | Qué mostrar | Qué decir (resumido) |
|---|---|---|---|
| — | `→ Recargando la base…` | — | «Arrancamos con los casos cargados pero sin ninguna regla aplicada.» |
| **01** | ¿Por qué P-01 todavía no puede evaluarse? | Columnas `faltantes`, `aclaraciones_pendientes`, `consultas` | «El pedido del Café Andino está pendiente: falta D4, el soporte. La aclaración A4 sigue sin respuesta y hay una consulta Q1 abierta a Materiales.» |
| **02** | Materiales responde Q1 con R-MI-01 | `respuesta = bloqueante` y la justificación | «Interpretación no decide si ese faltante bloquea: le pregunta al dueño del conocimiento. La regla R-MI-01 de Lautaro dice que sin soporte no se evalúa. Entonces el sistema **no avanza** y no inventa el dato.» |
| 03–04 | `· paso aplicado` | — | «Ahora simulamos que el cliente responde la aclaración. Esa respuesta es un dato de prueba.» |
| **05** | INT-R11 de nuevo: P-01 listo y ficha FR-01 | `R11_se_cumple = TRUE`, `datos_confirmados` | «Con el soporte confirmado se cumple la regla de suficiencia y se genera la ficha. Solo esa regla puede habilitar el pedido.» |
| 06–11 | `· paso aplicado` (×6) | — | «Se aplican las reglas de Materiales y de Manufacturabilidad sobre los dos casos.» |
| **12** | Recorrido completo de CU1 | Las 5 filas | «Interpretación → ficha → Materiales: exposición baja, apto → Luciano: 1000 mm no entran en la cama de 400 → segmentar y reforzar. Decide el fabricante.» |
| **13** | Recorrido completo de CU2 | Filas 2, 3, 4 y 7 | «Exterior expuesto: apto con condiciones. La condición de material la resuelve una regla de Luciano: PETG. Y quedan advertencias: el plazo obligatorio y la verificación estructural, con umbral pendiente.» |
| **14** | Las restricciones del cliente filtran las alternativas | Columnas `decision` y `regla` | «La restricción obligatoria rechaza una alternativa y admite otra: fidelidad del logo, instalación no invasiva, tamaño fijo.» |
| **15** | Trazabilidad de CU2 | Columnas `orden`, `submodulo`, `origen` | «Cada regla que se activó, en orden, de qué submódulo y de dónde sale: experto, propuesta o documental.» |

Fin: `✓ Fin de la demo.` → pasar al Browser si sobra tiempo; si no, volver a las slides (slide 14).

**Versión larga** (si piden más detalle o en una consulta posterior): `bash neo4j/demo.sh --completa`
agrega el paso 04 (respuesta del cliente y cambio de etiqueta), el 08 (dictamen de Materiales), el 16 (insumo
para el LLM explicador), el 17 (frame DatoFaltante con herencia), el 18 (reglas por origen), el 19 (todo lo
`[PENDIENTE]`) y el 20 (control de integridad INT-R09).

---

## 2. Browser de Neo4j (opcional, 30–60 s)

Pegar en la barra superior de `http://localhost:7474` y ejecutar con `Ctrl+Enter`.
**Después de `demo.sh` la base queda completa**, así que estas consultas muestran el resultado final.

1. **Grafo instanciado de CU2** (la más vistosa):
   ```cypher
   MATCH (n:Instancia {caso:'CU2'})-[r]-(m:Instancia)
   WHERE NOT m:CategoriaDato
   RETURN n, r, m
   ```
   Qué decir: «Arriba lo de Interpretación, en el medio el dictamen de Materiales, abajo el conflicto y las
   alternativas. Cada relación creada por una regla tiene la propiedad `regla`» — hacer clic en una flecha
   `VIOLA` o `RECHAZA` y mostrar `regla` en el panel derecho.

2. **Red semántica integrada (esquema)**:
   ```cypher
   MATCH (a:Frame)-[r]->(b:Frame) WHERE r.nivel = 'esquema' RETURN a, r, b
   ```

3. **Un frame con sus slots** (si preguntan por facetas):
   ```cypher
   MATCH (f:Frame {nombre:'DatoFaltante'})-[:ES_UN*0..]->(a:Frame)-[:TIENE_SLOT]->(s:Slot)
   RETURN a, s
   ```
   Clic en un `Slot` → panel derecho: `tipo_dato`, `valores_permitidos`, `valor_defecto`, `cardinalidad`,
   `si_agregado`…

4. **Rastro de decisión de CU2**:
   ```cypher
   MATCH p=(:Evaluacion {caso:'CU2'})-[:ACTIVO]->(:Regla) RETURN p
   ```

Para que se lea mejor: en el panel de estilo (abajo del grafo) elegir *caption* = `id` para las instancias y
`nombre` para `Frame`.

---

## 3. Si algo falla en vivo

| Síntoma | Qué hacer |
|---|---|
| `demo.sh` se queda en «Esperando a Neo4j» | Docker Desktop no arrancó: abrirlo; mientras tanto, pasar al video |
| Error de una consulta | Seguir con `Enter`; las salidas reales están en `salida/03_resultados_consultas.md` (tenerlo abierto en otra pestaña) |
| Se corta la conexión / no se puede compartir | Video de respaldo (sección 5) |
| Se ejecutó dos veces / estado raro | `bash neo4j/demo.sh` siempre recarga desde cero; volver a lanzarlo |

---

## 4. Frases clave (para no olvidar)

- «El sistema **no decide**: estructura, infiere, alerta y explica. Decide el fabricante.»
- «Cuando la información no alcanza, **no inventa**: pregunta (R-MI-01, INT-R09).»
- «Cada regla dice si es conocimiento del **experto**, una **propuesta** nuestra o un **documento**.»
- «Lo que no está relevado queda **[PENDIENTE]** en el grafo y se puede listar con una consulta.»

---

## 5. Video de respaldo (2–3 min)

**Cómo grabarlo (Windows):** `Win + Alt + R` con la Xbox Game Bar (graba la ventana activa) o OBS Studio
(captura de pantalla completa, 1920×1080, 30 fps). Micrófono activado; habla Matías. Grabar con
`bash neo4j/demo.sh` (con pausas, para controlar el ritmo). Guardar como `salida/video_demo.mp4` y subirlo a
Drive con enlace por si falla la conexión.

| Tiempo | Pantalla | Locución |
|---|---|---|
| 0:00–0:15 | Slide 13 (título de la demo) | «Esta es la demo del modelo integrado del Grupo 11 en Neo4j. Vamos a ver un pedido que no avanza hasta que tiene la información necesaria, y cómo cruza los tres submódulos.» |
| 0:15–0:25 | Terminal: `bash neo4j/demo.sh`, recarga | «El script recarga la base con los casos, sin ninguna regla aplicada todavía.» |
| 0:25–0:50 | Paso 01 | «El pedido del Café Andino está pendiente: falta el soporte, la aclaración al cliente está abierta y hay una consulta al submódulo de Materiales.» |
| 0:50–1:10 | Paso 02 | «Materiales responde con su regla R-MI-01: sin soporte no se evalúa. El faltante es bloqueante y el sistema no inventa el dato.» |
| 1:10–1:25 | Pasos 03–05 | «Con la respuesta del cliente —un dato de prueba— se cumple la regla de suficiencia y se genera la ficha FR-01.» |
| 1:25–1:50 | Paso 12 | «Recorrido completo: interior, apto; un metro no entra en la cama de 40 cm de la impresora, así que se recomienda segmentar y reforzar. Decide el fabricante.» |
| 1:50–2:15 | Paso 13 | «En las letras corpóreas para exterior: apto con condiciones, material PETG por una regla de Luciano, segmentación letra por letra y dos advertencias pendientes de validar.» |
| 2:15–2:35 | Paso 14 | «Las restricciones del cliente filtran: la fidelidad al logo rechaza engrosar el trazo; la instalación no invasiva rechaza perforar.» |
| 2:35–2:55 | Paso 15 y Browser con el grafo de CU2 | «Y todo queda trazado: qué reglas se activaron, en qué orden y de dónde sale cada una. Este es el grafo del caso en Neo4j.» |
| 2:55–3:00 | Slide 14 | «Gracias.» |
