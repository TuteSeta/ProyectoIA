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
   Tiene que terminar con `✓ Listo` y el resumen `58, 123, 42, 139, 718`
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
| **01** | ¿Por qué P-01 todavía no puede evaluarse? | Columnas `faltantes`, `aclaraciones_pendientes`, `consultas` | «El pedido del Café Andino está pendiente: falta cómo se fija (D4). La aclaración A4 sigue sin respuesta y hay una consulta Q1 abierta a Materiales.» |
| **02** | Materiales responde Q1 con R-MI-01 | `respuesta = bloqueante` y la justificación | «Interpretación no decide si ese faltante bloquea: le pregunta al dueño del conocimiento. La regla R-MI-01 de Lautaro dice que sin soporte no se evalúa. El sistema **no avanza** y no inventa el dato.» |
| 03–11 | `· paso aplicado` | — | «Simulamos la respuesta del cliente (dato de prueba) y se aplican las reglas de los tres submódulos.» |
| **12** | Recorrido completo de CU1 | Las 5 filas | «Interior: exposición baja, apto. Un metro no entra en la cama de 40 cm: segmentar y reforzar. Decide el fabricante.» |
| **13** | Recorrido completo de CU2 | Filas 2 a 6 | «Exterior sin protección: exposición alta. No hay material elegido, y eso no frena: Materiales deja requisitos, la condición de revisar la marquesina y la verificación estructural → apto con condiciones. El PETG de Luciano cumple el requisito de material.» |
| **14** | FR-07: Neón LED en bandera | Filas 1, 3 y 5 | «El alero se evaluó y no cubre. Neón y fuente de interior bajo la lluvia: restricción excluyente → no apto, con cada causa.» |

Fin: `✓ Fin de la demo.` → pasar al Browser si sobra tiempo; si no, volver a las slides (slide 14).

**Versión larga** (si piden más detalle o en una consulta posterior): `bash neo4j/demo.sh --completa`
agrega el 04 (respuesta del cliente), el 05 (ficha FR-01), el 08 (detección y dictamen de Materiales para los tres
casos), el 15 (filtro por restricciones del cliente), el 16 (trazabilidad de CU2), el 17 (insumo para el LLM), el 18
(frame con herencia), el 19 (reglas por origen), el 20 (todo lo `[PENDIENTE]`) y el 21 (control INT-R09).

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

## 5. Video de respaldo (1:31, sin audio)

`salida/video_demo.mp4` se genera con Remotion a partir de capturas reales del Neo4j Browser:

```bash
bash neo4j/cargar.sh            # el contenedor tiene que estar arriba
cd video && npm install && npx playwright install chromium   # solo la primera vez
npm run grabar                  # graba las capturas en video/public/rec (recarga la base 01→03 y aplica los pasos)
npm run render                  # → salida/video_demo.mp4
```

Contenido: grafo de CU1 cargado → falta el soporte (A4, Q1) → dictamen apto de CU1 → alternativas de Luciano →
**CU2: apto con condiciones, el requisito de material lo cumple el PETG** → **FR-07: no apto con cada causa** →
trazabilidad (17 reglas de CU1) → grafo final de CU1. Si se usa en clase, Matías narra encima con el texto de la
sección 1.
