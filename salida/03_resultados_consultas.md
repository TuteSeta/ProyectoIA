# 03 — Resultados reales de las consultas en Neo4j

Ejecutado el 04/10/2026 14:05 contra `neo4j:5.21.0` (contenedor `neo4j-carteleria`).
Procedimiento: `bash neo4j/cargar.sh --reset --base` (borra la base y carga 01→03) y luego cada bloque
`// @paso` de `neo4j/04_consultas.cypher`, en orden, con `cypher-shell --format plain`.
Las salidas de abajo se copiaron tal cual las devolvió Neo4j (las sentencias de escritura sin `RETURN`
no imprimen nada).

## Paso 01 — ¿Por qué el pedido P-01 todavía no puede evaluarse?

*Caso:* CU1 · *Modo en demo.sh:* `corta` · *Ejecución:* OK

<details><summary>Consulta</summary>

```cypher
// Caso de uso: CU1 (Interpretación). Esperado: P-01 pendiente_de_aclaracion, D4 faltante sin clasificar,
// A4 pendiente y Q1 (consulta a Materiales) sin responder.
MATCH (p:Pedido {id:'P-01'})
RETURN p.id AS pedido, p.estado AS estado, p.iteracion AS iteracion,
       COLLECT { MATCH (d:DatoFaltante {caso:p.caso}) RETURN d.id + ' ' + d.atributo + ' (criticidad=' + d.criticidad + ')' } AS faltantes,
       COLLECT { MATCH (d:DatoAmbiguo {caso:p.caso}) RETURN d.id } AS ambiguos,
       COLLECT { MATCH (a:Aclaracion {caso:p.caso, estado:'pendiente'}) RETURN a.id + ': ' + a.pregunta } AS aclaraciones_pendientes,
       [(q:ConsultaSubmodulo {caso:p.caso})-[:SE_DIRIGE_A]->(s) | q.id + ' -> ' + s.id + ' (' + q.estado + ')'] AS consultas;
```

</details>

```text
pedido, estado, iteracion, faltantes, ambiguos, aclaraciones_pendientes, consultas
"P-01", "pendiente_de_aclaracion", 2, ["D4 soporte_y_montaje (criticidad=sin_clasificar)"], [], ["A4: ¿Sobre qué pared va y cómo es esa superficie?"], ["Q1 -> SM-MAT (pendiente)"]
```

## Paso 02 — Materiales responde la consulta Q1 con su regla R-MI-01

*Caso:* CU1 · *Modo en demo.sh:* `corta` · *Ejecución:* OK

<details><summary>Consulta</summary>

```cypher
// Caso de uso: CU1 (Interpretación ↔ Materiales). Esperado: Q1 = bloqueante, porque R-MI-01 (Lautaro) dice
// que sin soporte no se evalúa la instalación. Es el criterio de criticidad que el PI2 de Matías dejó pendiente.
MATCH (q:ConsultaSubmodulo {estado:'pendiente'})-[:SE_DIRIGE_A]->(:Submodulo {id:'SM-MAT'}),
      (q)-[:CONSULTA_SOBRE]->(d:DatoFaltante)
WHERE d.categoria IN ['entorno','dimensiones'] OR d.atributo STARTS WITH 'soporte'
SET q.estado = 'respondida', q.respuesta = 'bloqueante', q.regla = 'R-MI-01', d.criticidad = 'bloqueante'
WITH q, d
MERGE (ev:Evaluacion {id:'EV-' + q.caso}) ON CREATE SET ev:Instancia:Inferido, ev.caso = q.caso, ev.frame = 'Evaluacion'
WITH q, d, ev
WITH *, COUNT { (ev)-[:ACTIVO]->() } AS n_act
MATCH (r:Regla {id:'R-MI-01'})
MERGE (ev)-[a:ACTIVO {paso:'Q'}]->(r) ON CREATE SET a.orden = n_act + 1, a.submodulo = 'MAT', a.sobre = q.id
RETURN q.id AS consulta, d.id AS dato, d.atributo AS atributo, q.respuesta AS respuesta,
       'R-MI-01: si falta entorno, soporte / método o dimensiones, no evaluar y pedir el dato' AS justificacion;
```

</details>

```text
consulta, dato, atributo, respuesta, justificacion
"Q1", "D4", "soporte_y_montaje", "bloqueante", "R-MI-01: si falta entorno, soporte / método o dimensiones, no evaluar y pedir el dato"
```

## Paso 03 — INT-R11 evalúa la suficiencia de P-01 (no se cumple)

*Caso:* CU1 · *Modo en demo.sh:* `silencio` · *Ejecución:* OK

<details><summary>Consulta</summary>

```cypher
// Caso de uso: CU1. Esperado: R11 no se cumple (D4 bloqueante); P-01 sigue pendiente.
MATCH (p:Pedido) WHERE p.estado <> 'listo_para_evaluacion'
WITH p,
     [c IN p.datos_requeridos WHERE NOT (
          EXISTS { MATCH (d:DatoConfirmado {caso:p.caso, categoria:c}) }
       OR EXISTS { MATCH (nf:NecesidadFuncional {caso:p.caso})-[:CUBRE]->(:CategoriaDato {nombre:c}) }
       OR EXISTS { MATCH (d:DatoFaltante {caso:p.caso, categoria:c, criticidad:'postergable'}) })] AS sin_cubrir,
     COLLECT { MATCH (d:DatoFaltante {caso:p.caso}) WHERE d.criticidad <> 'postergable' RETURN d.id + ' (' + d.criticidad + ')' } AS faltantes_que_bloquean,
     COLLECT { MATCH (d:DatoAmbiguo {caso:p.caso}) RETURN d.id } AS ambiguos,
     COLLECT { MATCH (k:Contradiccion {caso:p.caso, estado:'abierta'}) RETURN k.id } AS contradicciones_abiertas
WITH p, sin_cubrir, faltantes_que_bloquean, ambiguos, contradicciones_abiertas,
     size(sin_cubrir) = 0 AND size(faltantes_que_bloquean) = 0 AND size(ambiguos) = 0 AND size(contradicciones_abiertas) = 0 AS cumple
SET p.estado = CASE WHEN cumple THEN 'listo_para_evaluacion' ELSE p.estado END
RETURN p.id AS pedido, cumple AS R11_se_cumple, p.estado AS estado, sin_cubrir, faltantes_que_bloquean, ambiguos, contradicciones_abiertas;
```

</details>

```text
pedido, R11_se_cumple, estado, sin_cubrir, faltantes_que_bloquean, ambiguos, contradicciones_abiertas
"P-01", FALSE, "pendiente_de_aclaracion", ["instalacion"], ["D4 (bloqueante)"], [], []
```

## Paso 04 — Llega la respuesta del cliente a A4 (dato de prueba simulado) → INT-R13 e INT-R09

*Caso:* CU1 · *Modo en demo.sh:* `extra` · *Ejecución:* OK

<details><summary>Consulta</summary>

```cypher
// Caso de uso: CU1. La respuesta a A4 NO está en el PI2 de Matías: se agrega como dato de prueba para que el
// caso llegue a los otros submódulos. Esperado: E13 nueva, D4 pasa de DatoFaltante a DatoConfirmado
// (cambio de etiqueta, M15), iteración 3. INT-R09 solo deja asignar valores con origen del cliente.
MATCH (p:Pedido {id:'P-01'}), (d:DatoFaltante {id:'D4'})-[:PROVOCA]->(a:Aclaracion {id:'A4', estado:'pendiente'})
MERGE (e:ExpresionCliente {id:'E13'})
SET e:Instancia:Inferido, e.caso = 'CU1', e.frame = 'ExpresionCliente', e.fuente = 'respuesta_a_aclaracion',
    e.texto_literal = 'Es la pared de ladrillo revocado de atrás del mostrador; el cartel va pegado a la pared.',
    e.dato_de_prueba = 'SIMULADO: la respuesta a A4 no figura en el PI2 de Matías'
MERGE (p)-[:CONTIENE]->(e)
SET a.estado = 'respondida'
MERGE (a)-[:ACTUALIZA {regla:'INT-R13'}]->(p)
MERGE (e)-[:APORTA {regla:'INT-R13'}]->(d)
WITH p, d, 'respuesta_a_aclaracion' AS origen_nuevo
WHERE origen_nuevo IN ['cliente', 'respuesta_a_aclaracion']          // INT-R09: no se aceptan valores supuestos
SET d.valor = 'pared de mampostería, adosado', d.soporte = 'mamposteria', d.montaje = 'adosado',
    d.origen = origen_nuevo, d.estado = 'confirmado', d.frame = 'DatoConfirmado', d.criticidad = null
REMOVE d:DatoFaltante
SET d:DatoConfirmado,
    p.iteracion = p.iteracion + 1, p.estado = 'en_interpretacion',
    p.historial = p.historial + ['it3: respuesta a A4 (INT-R13, dato de prueba simulado): D4 confirmado, soporte = mampostería']
WITH p, d
MERGE (ev:Evaluacion {id:'EV-CU1'})
WITH p, d, ev, COUNT { (ev)-[:ACTIVO]->() } AS n_act
UNWIND range(0, 1) AS i
MATCH (r:Regla {id: ['INT-R09', 'INT-R13'][i]})
MERGE (ev)-[a:ACTIVO {paso:'it3'}]->(r) ON CREATE SET a.orden = n_act + i + 1, a.submodulo = 'INT', a.sobre = d.id
WITH DISTINCT p, d
RETURN p.id AS pedido, p.iteracion AS iteracion, d.id AS dato, labels(d) AS etiquetas, d.valor AS valor, d.origen AS origen;
```

</details>

```text
pedido, iteracion, dato, etiquetas, valor, origen
"P-01", 3, "D4", ["Dato", "Instancia", "DatoConfirmado"], "pared de mampostería, adosado", "respuesta_a_aclaracion"
```

## Paso 05 — INT-R11 de nuevo: P-01 queda listo y se genera la ficha FR-01

*Caso:* CU1 · *Modo en demo.sh:* `corta` · *Ejecución:* OK

<details><summary>Consulta</summary>

```cypher
// Caso de uso: CU1. Esperado: R11 se cumple → P-01 listo_para_evaluacion; se crea FR-01 con D2, D3, D4, D5 y NF1;
// INT-R12 no genera advertencias (no quedan faltantes postergables).
MATCH (p:Pedido) WHERE p.estado <> 'listo_para_evaluacion'
WITH p,
     [c IN p.datos_requeridos WHERE NOT (
          EXISTS { MATCH (d:DatoConfirmado {caso:p.caso, categoria:c}) }
       OR EXISTS { MATCH (nf:NecesidadFuncional {caso:p.caso})-[:CUBRE]->(:CategoriaDato {nombre:c}) }
       OR EXISTS { MATCH (d:DatoFaltante {caso:p.caso, categoria:c, criticidad:'postergable'}) })] AS sin_cubrir,
     COLLECT { MATCH (d:DatoFaltante {caso:p.caso}) WHERE d.criticidad <> 'postergable' RETURN d.id + ' (' + d.criticidad + ')' } AS faltantes_que_bloquean,
     COLLECT { MATCH (d:DatoAmbiguo {caso:p.caso}) RETURN d.id } AS ambiguos,
     COLLECT { MATCH (k:Contradiccion {caso:p.caso, estado:'abierta'}) RETURN k.id } AS contradicciones_abiertas
WITH p, sin_cubrir, faltantes_que_bloquean, ambiguos, contradicciones_abiertas,
     size(sin_cubrir) = 0 AND size(faltantes_que_bloquean) = 0 AND size(ambiguos) = 0 AND size(contradicciones_abiertas) = 0 AS cumple
SET p.estado = CASE WHEN cumple THEN 'listo_para_evaluacion' ELSE p.estado END
WITH p, cumple, sin_cubrir, faltantes_que_bloquean
MERGE (ev:Evaluacion {id:'EV-' + p.caso})
WITH p, cumple, sin_cubrir, faltantes_que_bloquean, ev
WITH *, COUNT { (ev)-[:ACTIVO]->() } AS n_act
MATCH (r:Regla {id:'INT-R11'})
MERGE (ev)-[a:ACTIVO {paso:'it' + toString(p.iteracion)}]->(r) ON CREATE SET a.orden = n_act + 1, a.submodulo = 'INT', a.sobre = p.id, a.resultado = cumple
RETURN p.id AS pedido, cumple AS R11_se_cumple, p.estado AS estado, sin_cubrir, faltantes_que_bloquean;
// INT-R11 (acción): crear la ficha de los pedidos listos que todavía no la tienen
MATCH (p:Pedido {estado:'listo_para_evaluacion'}) WHERE NOT EXISTS { (:FichaRequerimientos)-[:CORRESPONDE_A]->(p) }
MATCH (smi:Submodulo {id:'SM-INT'})
MERGE (f:FichaRequerimientos {id: replace(p.id, 'P-', 'FR-')})
SET f:Instancia:Inferido, f.caso = p.caso, f.frame = 'FichaRequerimientos'
MERGE (f)-[:CORRESPONDE_A]->(p)
MERGE (smi)-[:PRODUCE {regla:'INT-R11'}]->(f)
WITH f, p
CALL { WITH f, p MATCH (d:DatoConfirmado {caso:p.caso}) MERGE (f)-[:REGISTRA]->(d) }
CALL { WITH f, p MATCH (r:RestriccionCliente {caso:p.caso}) MERGE (f)-[:PRESERVA {regla:'INT-R04'}]->(r) }
CALL { WITH f, p MATCH (r:Preferencia {caso:p.caso}) MERGE (f)-[:INCLUYE]->(r) }
CALL { WITH f, p MATCH (r:NecesidadFuncional {caso:p.caso}) MERGE (f)-[:INCLUYE]->(r) }
CALL { WITH f MATCH (s:Submodulo) WHERE s.id IN ['SM-MAT', 'SM-MAN'] MERGE (f)-[:ALIMENTA]->(s) }
RETURN f.id AS ficha_creada, p.id AS pedido,
       [(f)-[:REGISTRA]->(d) | d.id + ' ' + d.atributo + ' = ' + toString(d.valor)] AS datos_confirmados,
       [(f)-[:INCLUYE]->(n:NecesidadFuncional) | n.id + ': ' + n.efecto_buscado] AS necesidades_funcionales;
// INT-R12: advertencias por faltantes postergables al crear la ficha
MATCH (f:FichaRequerimientos:Inferido)-[:CORRESPONDE_A]->(p:Pedido)
OPTIONAL MATCH (d:DatoFaltante {caso:p.caso, criticidad:'postergable'})
FOREACH (x IN CASE WHEN d IS NULL THEN [] ELSE [d] END |
  MERGE (av:Advertencia {id:'AV-' + x.id})
  SET av:Instancia:Inferido, av.caso = p.caso, av.frame = 'Advertencia', av.motivo = 'dato_postergable_pendiente',
      av.texto = 'El dato ' + x.id + ' (' + x.atributo + ') sigue pendiente'
  MERGE (f)-[:INCLUYE {regla:'INT-R12'}]->(av))
RETURN f.id AS ficha, count(d) AS advertencias_creadas_por_R12;
// =====================================================================================
// PARTE A — Integración Ficha → Cartel (CU1 y CU2)
// =====================================================================================
```

</details>

```text
pedido, R11_se_cumple, estado, sin_cubrir, faltantes_que_bloquean
"P-01", TRUE, "listo_para_evaluacion", [], []
ficha_creada, pedido, datos_confirmados, necesidades_funcionales
"FR-01", "P-01", ["D5 largo = ≈ 1 m", "D3 entorno = interior", "D2 contenido_texto = Café Andino", "D4 soporte_y_montaje = pared de mampostería, adosado"], ["NF1: visibilidad y efecto nocturno; aspecto similar a RV1"]
ficha, advertencias_creadas_por_R12
"FR-01", 0
```

## Paso 06 — INTEG-01: cada ficha describe un Cartel (sin completar huecos)

*Caso:* CU1+CU2 · *Modo en demo.sh:* `silencio` · *Ejecución:* OK

<details><summary>Consulta</summary>

```cypher
// Esperado: CAR-P-01 (1000 mm, interior, mampostería adosado, sin tecnología definida) y CAR-P-02 (corpóreo, con luz,
// 3000 mm, exterior, sobre estructura: marquesina a 4 m). Material y componentes NO se crean: la ficha no los define
// (los trata R-MI-13). Los slots sin dato toman el valor por defecto de su faceta (frames ENTORNO y SOPORTE de Lautaro).
MATCH (f:FichaRequerimientos)-[:CORRESPONDE_A]->(p:Pedido)
OPTIONAL MATCH (f)-[:REGISTRA]->(d:DatoConfirmado)
WITH f, p, collect(d) AS ds
WITH f, p,
     head([d IN ds WHERE d.atributo = 'tecnologia' | d.valor]) AS tipo,
     head([d IN ds WHERE d.atributo = 'iluminacion' | d.valor]) AS luz,
     head([d IN ds WHERE d.categoria = 'dimensiones' | d.valor_normalizado]) AS dim,
     head([d IN ds WHERE d.categoria = 'entorno' | d.valor]) AS ent,
     head([d IN ds WHERE d.categoria = 'instalacion' | d]) AS inst,
     EXISTS { (f)-[:INCLUYE]->(:NecesidadFuncional) } AS tiene_nf
MERGE (c:Cartel {id:'CAR-' + p.id})
SET c:Instancia:Inferido, c.caso = p.caso, c.frame = 'Cartel', c.desde_ficha = true, c.tipo_cartel = tipo,
    c.lleva_luz = CASE luz WHEN 'si' THEN true WHEN 'no' THEN false ELSE null END,
    c.dimension_maxima_mm = dim, c.montaje = inst.montaje, c.altura_m = inst.altura_m,
    c.pendiente = CASE WHEN luz = 'si' OR tiene_nf
                       THEN '[PENDIENTE: criterio del experto para proponer la tecnología de iluminación]' END
MERGE (f)-[:DESCRIBE {regla:'INTEG-01'}]->(c)
MERGE (g:Geometria {id:'GEO-' + p.id})
SET g:Instancia:Inferido, g.caso = p.caso, g.frame = 'Geometria', g.dimension_maxima_mm = dim,
    g.pendiente = '[PENDIENTE: ancho de canal y peso requieren el vector del diseño]'
MERGE (c)-[:TIENE]->(g)
MERGE (en:Entorno {id:'ENT-' + p.id})
SET en:Instancia:Inferido, en.caso = p.caso, en.frame = 'Entorno', en.tipo = ent,
    en.proteccion_superior = coalesce(en.proteccion_superior, 'ninguna'), en.humedad = coalesce(en.humedad, 'normal'),
    en.sol_directo = coalesce(en.sol_directo, false), en.valores_por_defecto = ['proteccion_superior', 'humedad', 'sol_directo']
MERGE (c)-[:SE_INSTALA_EN]->(en)
FOREACH (x IN CASE WHEN inst.soporte IS NULL THEN [] ELSE [inst] END |
  MERGE (so:Soporte {id:'SOP-' + p.id})
  SET so:Instancia:Inferido, so.caso = p.caso, so.frame = 'Soporte', so.tipo = x.soporte,
      so.capacidad_relativa = CASE x.soporte WHEN 'placa_de_yeso' THEN 'baja' WHEN 'mamposteria' THEN 'no_baja' ELSE null END,
      so.estado = coalesce(so.estado, 'no_verificado'), so.estructura_portante = coalesce(so.estructura_portante, 'desconocido')
  MERGE (fj:SistemaFijacion {id:'FIJ-' + p.id})
  SET fj:Instancia:Inferido, fj.caso = p.caso, fj.frame = 'SistemaFijacion', fj.pendiente = '[PENDIENTE: sistema de fijación a definir]'
  MERGE (c)-[:SE_FIJA_CON]->(fj) MERGE (fj)-[:SE_ANCLA_EN]->(so))
WITH f, p, c
OPTIONAL MATCH (f)-[:PRESERVA]->(r:RestriccionCliente)
FOREACH (x IN CASE WHEN r IS NULL THEN [] ELSE [r] END | MERGE (x)-[:CONDICIONA]->(c))
WITH DISTINCT f, p, c
MERGE (ev:Evaluacion {id:'EV-' + p.caso})
WITH f, p, c, ev
WITH *, COUNT { (ev)-[:ACTIVO]->() } AS n_act
MATCH (r:Regla {id:'INTEG-01'})
MERGE (ev)-[a:ACTIVO {paso:'INTEG'}]->(r) ON CREATE SET a.orden = n_act + 1, a.submodulo = 'COM', a.sobre = c.id
RETURN f.id AS ficha, c.id AS cartel, c.tipo_cartel AS tipo, c.lleva_luz AS lleva_luz, c.dimension_maxima_mm AS dim_mm,
       c.montaje AS montaje, c.altura_m AS altura_m, [(c)-[:SE_INSTALA_EN]->(e) | e.tipo][0] AS entorno
ORDER BY ficha;
// =====================================================================================
// PARTE A — Materiales e instalación (Lautaro, PI2)
// Orden de disparo del PI2: R-MI-01 → exposición (R-MI-02/08/09) → detección (R-MI-03…07, 13, 14) → dictamen (12 > 11 > 10)
// =====================================================================================
```

</details>

```text
ficha, cartel, tipo, lleva_luz, dim_mm, montaje, altura_m, entorno
"FR-01", "CAR-P-01", NULL, NULL, 1000, "adosado", NULL, "interior"
"FR-02", "CAR-P-02", "corporeo", TRUE, 3000, "sobre_estructura", 4, "exterior"
```

## Paso 07 — R-MI-01 datos mínimos + interpretación de la exposición (R-MI-08 → R-MI-02 / R-MI-09 / R-MI-GEN)

*Caso:* CU1+CU2+FR-07 · *Modo en demo.sh:* `silencio` · *Ejecución:* OK

<details><summary>Consulta</summary>

```cypher
// Esperado: CU1 interior → baja (R-MI-GEN); CU2 exterior sin protección → alta (R-MI-02);
// FR-07 exterior con alero que NO cubre → R-MI-08 se evalúa y no aplica → alta (R-MI-02).
MATCH (c:Cartel {desde_ficha:true})-[:SE_INSTALA_EN]->(en:Entorno)
OPTIONAL MATCH (c)-[:SE_FIJA_CON]->(:SistemaFijacion)-[:SE_ANCLA_EN]->(so:Soporte)
WITH c, en, [x IN [CASE WHEN en.tipo IS NULL THEN 'entorno' END,
                   CASE WHEN so IS NULL OR c.montaje IS NULL THEN 'soporte / método' END,
                   CASE WHEN c.dimension_maxima_mm IS NULL THEN 'dimensiones' END] WHERE x IS NOT NULL] AS faltan
SET c.datos_minimos_ok = (size(faltan) = 0), c.faltan_minimos = faltan
WITH c, en, faltan,
     CASE WHEN size(faltan) > 0 THEN [null, null]
          WHEN en.tipo = 'interior' AND en.humedad = 'alta' AND en.sol_directo THEN ['alta', 'R-MI-09']
          WHEN en.tipo = 'interior' AND (en.humedad = 'alta' OR en.sol_directo) THEN ['media', 'R-MI-09']
          WHEN en.tipo = 'interior' THEN ['baja', 'R-MI-GEN']
          WHEN en.proteccion_superior IN ['alero', 'nicho'] AND en.alcance_proteccion = 'cubre' THEN ['media', 'R-MI-08']
          ELSE ['alta', 'R-MI-02'] END AS expo
SET en.nivel_exposicion = expo[0], en.regla_exposicion = expo[1]
MERGE (dic:DictamenAdecuacion {id:'DIC-' + c.caso})
SET dic:Instancia:Inferido, dic.caso = c.caso, dic.frame = 'DictamenAdecuacion'
MERGE (dic)-[:EVALUA]->(c)
// Excepción evaluada: se registra aunque no aplique (PI2 Lautaro, frame EXCEPCIÓN)
FOREACH (_ IN CASE WHEN en.tipo = 'exterior' AND en.proteccion_superior IN ['alero', 'nicho'] THEN [1] ELSE [] END |
  MERGE (ex:Excepcion {id:'EXC-' + c.caso})
  SET ex:Instancia:Inferido, ex.caso = c.caso, ex.frame = 'Excepcion', ex.tipo = en.proteccion_superior,
      ex.aplica = (en.alcance_proteccion = 'cubre'), ex.condicion = coalesce(en.detalle, en.proteccion_superior),
      ex.efecto = CASE WHEN en.alcance_proteccion = 'cubre' THEN 'exposición media' ELSE 'no baja la exposición: la protección no cubre al cartel' END
  MERGE (ex)-[:AJUSTA {regla:'R-MI-08', aplica:(en.alcance_proteccion = 'cubre')}]->(en))
WITH c, en, faltan, expo
MERGE (ev:Evaluacion {id:'EV-' + c.caso}) ON CREATE SET ev:Instancia:Inferido, ev.caso = c.caso, ev.frame = 'Evaluacion'
WITH c, en, faltan, ev,
     [x IN ['R-MI-01', CASE WHEN en.proteccion_superior IN ['alero', 'nicho'] AND expo[1] <> 'R-MI-08' THEN 'R-MI-08' END, expo[1]] WHERE x IS NOT NULL] AS reglas,
     COUNT { (ev)-[:ACTIVO]->() } AS n_act
UNWIND range(0, size(reglas) - 1) AS i
MATCH (r:Regla {id: reglas[i]})
MERGE (ev)-[a:ACTIVO {paso:'MAT'}]->(r) ON CREATE SET a.orden = n_act + i + 1, a.submodulo = 'MAT', a.sobre = c.id
WITH DISTINCT c, en, faltan
RETURN c.caso AS caso, c.id AS cartel, faltan AS faltan_datos_minimos, en.tipo AS entorno,
       en.proteccion_superior AS proteccion, en.nivel_exposicion AS exposicion, en.regla_exposicion AS regla
ORDER BY caso;
```

</details>

```text
caso, cartel, faltan_datos_minimos, entorno, proteccion, exposicion, regla
"CU1", "CAR-P-01", [], "interior", "ninguna", "baja", "R-MI-GEN"
"CU2", "CAR-P-02", [], "exterior", "ninguna", "alta", "R-MI-02"
"FR-07", "CAR-FR-07", [], "exterior", "alero", "alta", "R-MI-02"
```

## Paso 08 — Detección de Materiales: R-MI-03, R-MI-07, R-MI-13, R-MI-14, R-MI-06 (se acumulan)

*Caso:* CU1+CU2+FR-07 · *Modo en demo.sh:* `extra` · *Ejecución:* OK

<details><summary>Consulta</summary>

```cypher
// Esperado: CU1 nada. CU2 (sin material ni componentes definidos): RQ de cuerpo/frente y de componentes (R-MI-13),
// condición «fuente accesible» (R-MI-13), condición «relevar la marquesina» (R-MI-14), verificación estructural (R-MI-06).
// FR-07: restricción eléctrica excluyente (R-MI-03), restricción de mantenimiento corregible (R-MI-07), verificación (R-MI-06).
// R-MI-03: exposición alta y componente eléctrico declarado de interior o sin grado IP (grado exigido: a validar)
MATCH (c:Cartel {desde_ficha:true, datos_minimos_ok:true})-[:SE_INSTALA_EN]->(en:Entorno {nivel_exposicion:'alta'}),
      (c)-[:UTILIZA]->(ce:ComponenteElectrico), (dic:DictamenAdecuacion {id:'DIC-' + c.caso})
WHERE ce.uso_declarado = 'interior' OR ce.grado_ip IS NULL
MERGE (k:Conflicto {id:'RES-ELEC-' + c.caso})
SET k:Instancia:Inferido, k.caso = c.caso, k.frame = 'Conflicto', k.tipo = 'Electrica', k.origen = 'instalacion',
    k.severidad = 'excluyente', k.estado = 'Abierto',
    k.detalle = 'Componentes de interior, sin protección contra agua, con exposición alta [grado IP exigido: a validar, IEC 60529]'
MERGE (k)-[:CAUSADO_POR {regla:'R-MI-03'}]->(ce)
MERGE (k)-[:CAUSADO_POR {regla:'R-MI-03'}]->(en)
MERGE (dic)-[:REUNE {regla:'R-MI-03'}]->(k)
WITH DISTINCT c
MERGE (ev:Evaluacion {id:'EV-' + c.caso})
WITH c, ev WITH *, COUNT { (ev)-[:ACTIVO]->() } AS n_act MATCH (r:Regla {id:'R-MI-03'})
MERGE (ev)-[a:ACTIVO {paso:'MAT'}]->(r) ON CREATE SET a.orden = n_act + 1, a.submodulo = 'MAT', a.sobre = c.id;
// R-MI-04: exposición alta y material definido no apto para exterior (ningún caso cargado la dispara)
MATCH (c:Cartel {desde_ficha:true, datos_minimos_ok:true})-[:SE_INSTALA_EN]->(en:Entorno {nivel_exposicion:'alta'}),
      (c)-[:UTILIZA]->(m:Material {apto_exterior:'no'}), (dic:DictamenAdecuacion {id:'DIC-' + c.caso})
MERGE (k:Conflicto {id:'RES-MAT-' + c.caso})
SET k:Instancia:Inferido, k.caso = c.caso, k.frame = 'Conflicto', k.tipo = 'MaterialEntorno', k.origen = 'instalacion',
    k.severidad = 'excluyente', k.estado = 'Abierto', k.detalle = m.nombre + ' no apto para exterior'
MERGE (k)-[:CAUSADO_POR {regla:'R-MI-04'}]->(m)
MERGE (dic)-[:REUNE {regla:'R-MI-04'}]->(k);
// R-MI-07: fuente interna cerrada y sin acceso → restricción de mantenimiento corregible + condición
MATCH (c:Cartel {desde_ficha:true, datos_minimos_ok:true})-[:UTILIZA]->(ce:ComponenteElectrico {tipo:'fuente', ubicacion:'interna_cerrada', accesible:false}),
      (dic:DictamenAdecuacion {id:'DIC-' + c.caso})
MERGE (k:Conflicto {id:'RES-MANT-' + c.caso})
SET k:Instancia:Inferido, k.caso = c.caso, k.frame = 'Conflicto', k.tipo = 'Mantenimiento', k.origen = 'instalacion',
    k.severidad = 'corregible', k.estado = 'Abierto', k.detalle = 'Fuente cerrada dentro de la caja, sin acceso'
MERGE (ci:CondicionInstalacion {id:'CI-FUENTE-' + c.caso})
SET ci:Instancia:Inferido, ci.caso = c.caso, ci.frame = 'CondicionInstalacion', ci.regla_origen = 'R-MI-07',
    ci.descripcion = 'Fuente accesible sin desmontar el cartel y protegida'
MERGE (k)-[:CAUSADO_POR {regla:'R-MI-07'}]->(ce)
MERGE (k)-[:SE_RESUELVE_CON {regla:'R-MI-07'}]->(ci)
MERGE (dic)-[:REUNE {regla:'R-MI-07'}]->(k)
MERGE (dic)-[:IMPONE {regla:'R-MI-07'}]->(ci)
WITH c
MERGE (ev:Evaluacion {id:'EV-' + c.caso})
WITH c, ev WITH *, COUNT { (ev)-[:ACTIVO]->() } AS n_act MATCH (r:Regla {id:'R-MI-07'})
MERGE (ev)-[a:ACTIVO {paso:'MAT'}]->(r) ON CREATE SET a.orden = n_act + 1, a.submodulo = 'MAT', a.sobre = c.id;
// R-MI-13: material / componentes / fuente no definidos → no bloquea; requisitos según la exposición
MATCH (c:Cartel {desde_ficha:true, datos_minimos_ok:true})-[:SE_INSTALA_EN]->(en:Entorno), (dic:DictamenAdecuacion {id:'DIC-' + c.caso})
WITH c, en, dic,
     NOT EXISTS { (c)-[:UTILIZA]->(:Material) } AND en.nivel_exposicion = 'alta' AS rq_material,
     c.lleva_luz AND NOT EXISTS { (c)-[:UTILIZA]->(:ComponenteElectrico) } AND en.nivel_exposicion = 'alta' AS rq_componentes,
     c.lleva_luz AND NOT EXISTS { (c)-[:UTILIZA]->(:ComponenteElectrico {tipo:'fuente'}) } AND c.altura_m IS NOT NULL AS ci_fuente
WHERE rq_material OR rq_componentes OR ci_fuente
FOREACH (_ IN CASE WHEN rq_material THEN [1] ELSE [] END |
  MERGE (rq:RequisitoMaterial {id:'RQ-MAT-' + c.caso})
  SET rq:Instancia:Inferido, rq.caso = c.caso, rq.frame = 'RequisitoMaterial', rq.aplica_a = 'cuerpo y frente',
      rq.exigencia = 'Apto para exterior y radiación UV (el PLA no está indicado)', rq.exposicion_de_origen = en.nivel_exposicion,
      rq.equivale_a = 'R-MI-04'
  MERGE (dic)-[:ESTABLECE {regla:'R-MI-13'}]->(rq))
FOREACH (_ IN CASE WHEN rq_componentes THEN [1] ELSE [] END |
  MERGE (rq:RequisitoMaterial {id:'RQ-COMP-' + c.caso})
  SET rq:Instancia:Inferido, rq.caso = c.caso, rq.frame = 'RequisitoMaterial', rq.aplica_a = 'componente',
      rq.exigencia = 'Tiras, fuente y conexiones con protección contra agua [grado IP: a validar]', rq.exposicion_de_origen = en.nivel_exposicion,
      rq.equivale_a = 'R-MI-03'
  MERGE (dic)-[:ESTABLECE {regla:'R-MI-13'}]->(rq))
FOREACH (_ IN CASE WHEN ci_fuente THEN [1] ELSE [] END |
  MERGE (ci:CondicionInstalacion {id:'CI-FUENTE-' + c.caso})
  SET ci:Instancia:Inferido, ci.caso = c.caso, ci.frame = 'CondicionInstalacion', ci.regla_origen = 'R-MI-13',
      ci.descripcion = 'Fuente accesible sin desmontar las letras y protegida (el cartel va en altura)'
  MERGE (dic)-[:IMPONE {regla:'R-MI-13'}]->(ci))
WITH c
MERGE (ev:Evaluacion {id:'EV-' + c.caso})
WITH c, ev WITH *, COUNT { (ev)-[:ACTIVO]->() } AS n_act MATCH (r:Regla {id:'R-MI-13'})
MERGE (ev)-[a:ACTIVO {paso:'MAT'}]->(r) ON CREATE SET a.orden = n_act + 1, a.submodulo = 'MAT', a.sobre = c.id;
// R-MI-14: soporte no verificado y capacidad desconocida (R-MI-05 no evaluable) → condición de relevamiento
MATCH (c:Cartel {desde_ficha:true, datos_minimos_ok:true})-[:SE_FIJA_CON]->(:SistemaFijacion)-[:SE_ANCLA_EN]->(so:Soporte {estado:'no_verificado'}),
      (dic:DictamenAdecuacion {id:'DIC-' + c.caso})
WHERE so.capacidad_relativa IS NULL
MERGE (ci:CondicionInstalacion {id:'CI-SOPORTE-' + c.caso})
SET ci:Instancia:Inferido, ci.caso = c.caso, ci.frame = 'CondicionInstalacion', ci.regla_origen = 'R-MI-14',
    ci.descripcion = 'Relevar el soporte (' + so.tipo + ') y fijar a su estructura portante antes de instalar'
MERGE (dic)-[:IMPONE {regla:'R-MI-14'}]->(ci)
WITH c
MERGE (ev:Evaluacion {id:'EV-' + c.caso})
WITH c, ev WITH *, COUNT { (ev)-[:ACTIVO]->() } AS n_act MATCH (r:Regla {id:'R-MI-14'})
MERGE (ev)-[a:ACTIVO {paso:'MAT'}]->(r) ON CREATE SET a.orden = n_act + 1, a.submodulo = 'MAT', a.sobre = c.id;
// R-MI-06: bandera, o exterior en altura con exposición alta (viento) → verificación estructural profesional
MATCH (c:Cartel {desde_ficha:true, datos_minimos_ok:true})-[:SE_INSTALA_EN]->(en:Entorno), (dic:DictamenAdecuacion {id:'DIC-' + c.caso})
WHERE c.montaje = 'bandera' OR (en.tipo = 'exterior' AND c.altura_m IS NOT NULL AND en.nivel_exposicion = 'alta')
MERGE (vp:VerificacionProfesional {id:'VP-' + c.caso})
SET vp:Instancia:Inferido, vp.caso = c.caso, vp.frame = 'VerificacionProfesional', vp.tipo = 'estructural',
    vp.motivo = CASE WHEN c.montaje = 'bandera' THEN ['bandera sobre la vereda', 'viento'] ELSE ['altura (' + toString(c.altura_m) + ' m)', 'viento'] END,
    vp.pendiente = '[PENDIENTE: umbral de gran porte, CIRSOC 102; se aplica el criterio conservador del PI2]'
MERGE (dic)-[:SENALA {regla:'R-MI-06'}]->(vp)
WITH c
MERGE (ev:Evaluacion {id:'EV-' + c.caso})
WITH c, ev WITH *, COUNT { (ev)-[:ACTIVO]->() } AS n_act MATCH (r:Regla {id:'R-MI-06'})
MERGE (ev)-[a:ACTIVO {paso:'MAT'}]->(r) ON CREATE SET a.orden = n_act + 1, a.submodulo = 'MAT', a.sobre = c.id;
// Dictamen: R-MI-12 (no apto) > R-MI-11 (apto con condiciones) > R-MI-10 (apto)
MATCH (c:Cartel {desde_ficha:true}), (dic:DictamenAdecuacion {id:'DIC-' + c.caso}), (smm:Submodulo {id:'SM-MAN'})
WITH c, dic, smm,
     COUNT { (dic)-[:REUNE]->(:Conflicto {severidad:'excluyente'}) } AS excluyentes,
     COUNT { (dic)-[:REUNE|IMPONE|ESTABLECE|SENALA]->() } AS salidas
WITH c, dic, smm,
     CASE WHEN NOT c.datos_minimos_ok THEN ['no_evaluable', 'R-MI-01']
          WHEN excluyentes > 0 THEN ['no_apto', 'R-MI-12']
          WHEN salidas > 0 THEN ['apto_con_condiciones', 'R-MI-11']
          ELSE ['apto', 'R-MI-10'] END AS res
SET dic.resultado = res[0], dic.regla = res[1],
    dic.reglas_aplicadas = [(ev:Evaluacion {id:'EV-' + c.caso})-[a:ACTIVO {paso:'MAT'}]->(r) | r.id] + [res[1]],
    dic.destinatarios = ['manufacturabilidad', 'fabricante']
MERGE (dic)-[:ALIMENTA]->(smm)
WITH c, dic, res
MERGE (ev:Evaluacion {id:'EV-' + c.caso})
WITH c, dic, res, ev WITH *, COUNT { (ev)-[:ACTIVO]->() } AS n_act MATCH (r:Regla {id:res[1]})
MERGE (ev)-[a:ACTIVO {paso:'MAT'}]->(r) ON CREATE SET a.orden = n_act + 1, a.submodulo = 'MAT', a.sobre = c.id
RETURN c.caso AS caso, dic.resultado AS dictamen, dic.regla AS regla,
       [(dic)-[:REUNE]->(k) | k.tipo + ' (' + k.severidad + ')'] AS restricciones,
       [(dic)-[:ESTABLECE]->(x) | x.id] AS requisitos,
       [(dic)-[:IMPONE]->(x) | x.id] AS condiciones,
       [(dic)-[:SENALA]->(x) | x.id] AS verificaciones
ORDER BY caso;
// =====================================================================================
// PARTE A — Manufacturabilidad y rediseño (Luciano)
// =====================================================================================
```

</details>

```text
caso, dictamen, regla, restricciones, requisitos, condiciones, verificaciones
"CU1", "apto", "R-MI-10", [], [], [], []
"CU2", "apto_con_condiciones", "R-MI-11", [], ["RQ-MAT-CU2", "RQ-COMP-CU2"], ["CI-SOPORTE-CU2", "CI-FUENTE-CU2"], ["VP-CU2"]
"FR-07", "no_apto", "R-MI-12", ["Mantenimiento (corregible)", "Electrica (excluyente)"], [], ["CI-FUENTE-FR-07"], ["VP-FR-07"]
```

## Paso 09 — Detección: MAN-R7 (material), MAN-R3 (volumen), MAN-R2 (trazo), MAN-R4 (peso)

*Caso:* Todos · *Modo en demo.sh:* `silencio` · *Ejecución:* OK

<details><summary>Consulta</summary>

```cypher
// Esperado: CU2 → PETG (cumple el requisito de material RQ-MAT-CU2 de Lautaro, INTEG-03). CU1 (1000 mm), CU2 (3000 mm) y L-C2 (500 mm)
// → ExcedeCama. L-C1 → TrazoFino. L-C3 → RiesgoCaida.
// MAN-R7: exterior → PETG, descartar PLA. Solo para carteles con cuerpo impreso (no los Neón LED sobre acrílico)
// ni los que Materiales dictaminó «no apto» (su rediseño no está cubierto por las reglas de Luciano).
// INTEG-03: si Materiales dejó un requisito de material para el cuerpo, el PETG lo cumple.
MATCH (c:Cartel)-[:SE_INSTALA_EN]->(en:Entorno {tipo:'exterior'}), (petg:Material {id:'MAT-PETG'}), (pla:Material {id:'MAT-PLA'})
WHERE coalesce(c.tipo_cartel, '') <> 'NeonLED'
  AND NOT EXISTS { (:DictamenAdecuacion {resultado:'no_apto'})-[:EVALUA]->(c) }
SET c.material = 'PETG'
MERGE (c)-[:UTILIZA {regla:'MAN-R7'}]->(petg)
MERGE (c)-[:DESCARTA {regla:'MAN-R7', motivo:'deformación térmica / UV en exterior'}]->(pla)
WITH c, petg
OPTIONAL MATCH (:DictamenAdecuacion {id:'DIC-' + c.caso})-[:ESTABLECE]->(rq:RequisitoMaterial {aplica_a:'cuerpo y frente'})
FOREACH (x IN CASE WHEN rq IS NULL THEN [] ELSE [rq] END |
  MERGE (x)-[:SE_CUMPLE_CON {regla:'INTEG-03', alcance:'cuerpo (el frente queda a definir)'}]->(petg)
  SET x.estado = 'cumplido para el cuerpo por MAN-R7 (PETG)')
WITH DISTINCT c, rq IS NOT NULL AS cumple
MERGE (ev:Evaluacion {id:'EV-' + c.caso}) ON CREATE SET ev:Instancia:Inferido, ev.caso = c.caso, ev.frame = 'Evaluacion'
WITH c, ev, ['MAN-R7'] + CASE WHEN cumple THEN ['INTEG-03'] ELSE [] END AS rids, COUNT { (ev)-[:ACTIVO]->() } AS n_act
UNWIND range(0, size(rids) - 1) AS i
MATCH (r:Regla {id: rids[i]})
MERGE (ev)-[a:ACTIVO {paso:'MAN'}]->(r) ON CREATE SET a.orden = n_act + i + 1, a.submodulo = r.submodulo, a.sobre = c.id;
// MAN-R3: dimensión máxima > volumen útil de la impresora
MATCH (c:Cartel)-[:TIENE]->(g:Geometria), (h:Herramienta {id:'IMP3D'})-[:DEFINE]->(rc:RestriccionConstructiva {tipo:'Volumen'})
WHERE g.dimension_maxima_mm > h.volumen_util_maximo
MERGE (g)-[:VIOLA {regla:'MAN-R3'}]->(rc)
MERGE (k:Conflicto {id:'CONF-VOL-' + c.id})
SET k:Instancia:Inferido, k.caso = c.caso, k.frame = 'Conflicto', k.tipo = 'ExcedeCama', k.origen = 'manufactura',
    k.estado = coalesce(k.estado, 'Abierto'),
    k.detalle = toString(g.dimension_maxima_mm) + ' mm > ' + toString(h.volumen_util_maximo) + ' mm de cama'
MERGE (rc)-[:GENERA {regla:'MAN-R3'}]->(k)
MERGE (seg:AlternativaRediseno {id:'ALT-SEG-' + c.id})
SET seg:SegmentacionModular:Instancia:Inferido, seg.caso = c.caso, seg.frame = 'SegmentacionModular', seg.tipo_cambio = 'Segmentacion',
    seg.nombre = 'SegmentacionModular',
    seg.justificacion = CASE WHEN c.tipo_cartel = 'corporeo'
                             THEN 'Piezas de hasta 400 mm: en letras corpóreas equivale a fabricar letra por letra'
                             ELSE 'Dividir en piezas que entren en la cama de 400 mm' END
MERGE (ref:AlternativaRediseno {id:'ALT-REF-' + c.id})
SET ref:CambioFijacion:Instancia:Inferido, ref.caso = c.caso, ref.frame = 'CambioFijacion', ref.tipo_cambio = 'Fijacion',
    ref.nombre = 'CambioFijacion_Refuerzo', ref.justificacion = 'Reforzar la unión de los módulos para mantener la integridad'
MERGE (k)-[:EXIGE {regla:'MAN-R3'}]->(seg)
MERGE (seg)-[:EXIGE {regla:'MAN-R3'}]->(ref)
WITH c
MERGE (ev:Evaluacion {id:'EV-' + c.caso}) ON CREATE SET ev:Instancia:Inferido, ev.caso = c.caso, ev.frame = 'Evaluacion'
WITH c, ev WITH *, COUNT { (ev)-[:ACTIVO]->() } AS n_act MATCH (r:Regla {id:'MAN-R3'})
MERGE (ev)-[a:ACTIVO {paso:'MAN'}]->(r) ON CREATE SET a.orden = n_act + 1, a.submodulo = 'MAN', a.sobre = c.id;
// MAN-R2: canal menor a 6 mm con NeónFrontal
MATCH (c:Cartel {tecnologia_iluminacion:'NeonFrontal'})-[:TIENE]->(g:Geometria),
      (:TecnologiaIluminacion {nombre:'NeonFrontal'})-[:DEFINE]->(rc:RestriccionConstructiva {tipo:'Trazo'})
WHERE g.ancho_canal_mm < rc.valor_limite
MERGE (g)-[:VIOLA {regla:'MAN-R2'}]->(rc)
MERGE (k:Conflicto {id:'CONF-TRZ-' + c.id})
SET k:Instancia:Inferido, k.caso = c.caso, k.frame = 'Conflicto', k.tipo = 'TrazoFino', k.origen = 'manufactura',
    k.estado = coalesce(k.estado, 'Abierto'), k.detalle = toString(g.ancho_canal_mm) + ' mm < ' + toString(rc.valor_limite) + ' mm de la tira'
MERGE (rc)-[:GENERA {regla:'MAN-R2'}]->(k)
MERGE (a1:AlternativaRediseno {id:'ALT-ENG-' + c.id})
SET a1:CambioGeometria:Instancia:Inferido, a1.caso = c.caso, a1.frame = 'CambioGeometria', a1.tipo_cambio = 'Geometria',
    a1.nombre = 'EngrosarTrazo', a1.impacto_estetico = 'Alto', a1.justificacion = 'Aumentar el grosor de los trazos (afecta la apariencia)'
MERGE (a2:AlternativaRediseno {id:'ALT-RETRO-' + c.id})
SET a2:CambioTecnologia:Instancia:Inferido, a2.caso = c.caso, a2.frame = 'CambioTecnologia', a2.tipo_cambio = 'Tecnologia',
    a2.nombre = 'PasarRetroiluminado', a2.impacto_estetico = 'Bajo', a2.justificacion = 'Cambiar la tecnología de iluminación (mantiene la apariencia)'
MERGE (k)-[:EXIGE {regla:'MAN-R2'}]->(a1)
MERGE (k)-[:EXIGE {regla:'MAN-R2'}]->(a2)
WITH c
MERGE (ev:Evaluacion {id:'EV-' + c.caso}) ON CREATE SET ev:Instancia:Inferido, ev.caso = c.caso, ev.frame = 'Evaluacion'
WITH c, ev WITH *, COUNT { (ev)-[:ACTIVO]->() } AS n_act MATCH (r:Regla {id:'MAN-R2'})
MERGE (ev)-[a:ACTIVO {paso:'MAN'}]->(r) ON CREATE SET a.orden = n_act + 1, a.submodulo = 'MAN', a.sobre = c.id;
// MAN-R4: el peso supera la carga admisible de la fijación (valor límite [PENDIENTE]; se usa el hecho del caso)
MATCH (c:Cartel)-[:TIENE]->(g:Geometria {supera_carga_admisible:true}),
      (c)-[:SE_FIJA_CON]->(:SistemaFijacion)-[:DEFINE]->(rc:RestriccionConstructiva {tipo:'Peso'})
MERGE (g)-[:VIOLA {regla:'MAN-R4'}]->(rc)
MERGE (k:Conflicto {id:'CONF-PESO-' + c.id})
SET k:Instancia:Inferido, k.caso = c.caso, k.frame = 'Conflicto', k.tipo = 'RiesgoCaida', k.origen = 'manufactura',
    k.estado = coalesce(k.estado, 'Abierto'), k.detalle = 'peso estimado elevado > carga de la cinta bifaz [valor PENDIENTE]'
MERGE (rc)-[:GENERA {regla:'MAN-R4'}]->(k)
MERGE (a1:AlternativaRediseno {id:'ALT-INF-' + c.id})
SET a1:CambioGeometria:Instancia:Inferido, a1.caso = c.caso, a1.frame = 'CambioGeometria', a1.tipo_cambio = 'Geometria',
    a1.nombre = 'ReducirInfill', a1.impacto_estetico = 'Bajo', a1.requiere_perforar = false,
    a1.justificacion = 'Reducir masa interna sin alterar la apariencia exterior'
MERGE (a2:AlternativaRediseno {id:'ALT-FIJ-' + c.id})
SET a2:CambioFijacion:Instancia:Inferido, a2.caso = c.caso, a2.frame = 'CambioFijacion', a2.tipo_cambio = 'Fijacion',
    a2.nombre = 'FijacionMayorCapacidad', a2.requiere_perforar = true,
    a2.justificacion = 'Reemplazar la fijación por una de mayor capacidad (requiere perforar)'
MERGE (k)-[:EXIGE {regla:'MAN-R4'}]->(a1)
MERGE (k)-[:EXIGE {regla:'MAN-R4'}]->(a2)
WITH c
MERGE (ev:Evaluacion {id:'EV-' + c.caso}) ON CREATE SET ev:Instancia:Inferido, ev.caso = c.caso, ev.frame = 'Evaluacion'
WITH c, ev WITH *, COUNT { (ev)-[:ACTIVO]->() } AS n_act MATCH (r:Regla {id:'MAN-R4'})
MERGE (ev)-[a:ACTIVO {paso:'MAN'}]->(r) ON CREATE SET a.orden = n_act + 1, a.submodulo = 'MAN', a.sobre = c.id;
// MAN-R1: ¿se puede confirmar la manufacturabilidad directa? (muestra qué falta cuando no se puede)
MATCH (c:Cartel)-[:TIENE]->(g:Geometria)
RETURN c.caso AS caso, c.id AS cartel,
       [(g)-[v:VIOLA]->(rc) | rc.tipo + ' (' + v.regla + ')'] AS limites_violados,
       CASE WHEN EXISTS { (g)-[:VIOLA]->() } THEN 'no: hay conflictos'
            WHEN g.ancho_canal_mm IS NULL OR g.peso_estimado_gr IS NULL THEN 'no evaluable: falta ancho de canal o peso [PENDIENTE]'
            ELSE 'no evaluable: carga admisible de la fijación [PENDIENTE]' END AS MAN_R1
ORDER BY caso;
```

</details>

```text
caso, cartel, limites_violados, MAN_R1
"CU1", "CAR-P-01", ["Volumen (MAN-R3)"], "no: hay conflictos"
"CU2", "CAR-P-02", ["Volumen (MAN-R3)"], "no: hay conflictos"
"L-C1", "CAR-L1", ["Trazo (MAN-R2)"], "no: hay conflictos"
"L-C2", "CAR-L2", ["Volumen (MAN-R3)"], "no: hay conflictos"
"L-C3", "CAR-L3", ["Peso (MAN-R4)"], "no: hay conflictos"
```

## Paso 10 — Filtro por restricciones del cliente: MAN-R6, MAN-R5, MAN-R9, MAN-FILTRO y MAN-R8

*Caso:* Todos · *Modo en demo.sh:* `silencio` · *Ejecución:* OK

<details><summary>Consulta</summary>

```cypher
// Esperado: L-C1 Engrosar rechazada / Retroiluminado admitida (R6). L-C3 Fijación rechazada / Infill admitida (R9).
// L-C2 segmentación admitida por tamaño final fijo. CU1 y CU2: segmentación + refuerzo viables (en CU2 con advertencia de plazo).
// MAN-R6: fidelidad al logo alta
MATCH (r:RestriccionCliente {criterio:'fidelidad_logo', nivel:'Alta'})-[:CONDICIONA]->(c:Cartel),
      (k:Conflicto {tipo:'TrazoFino', caso:c.caso})-[:EXIGE]->(alt:AlternativaRediseno)
FOREACH (_ IN CASE WHEN alt.tipo_cambio = 'Geometria' THEN [1] ELSE [] END |
  MERGE (r)-[:RECHAZA {regla:'MAN-R6'}]->(alt) SET alt.viable = false)
FOREACH (_ IN CASE WHEN alt.tipo_cambio = 'Tecnologia' THEN [1] ELSE [] END |
  MERGE (r)-[:ADMITE {regla:'MAN-R6'}]->(alt) SET alt.viable = true)
WITH DISTINCT c
MERGE (ev:Evaluacion {id:'EV-' + c.caso})
WITH c, ev WITH *, COUNT { (ev)-[:ACTIVO]->() } AS n_act MATCH (r:Regla {id:'MAN-R6'})
MERGE (ev)-[a:ACTIVO {paso:'MAN'}]->(r) ON CREATE SET a.orden = n_act + 1, a.submodulo = 'MAN', a.sobre = c.id;
// MAN-R5: flexibilidad estética alta (ningún caso cargado la dispara)
MATCH (r:RestriccionCliente {criterio:'flexibilidad_estetica', nivel:'Alta'})-[:CONDICIONA]->(c:Cartel),
      (k:Conflicto {tipo:'TrazoFino', caso:c.caso})-[:EXIGE]->(alt:AlternativaRediseno)
FOREACH (_ IN CASE WHEN alt.tipo_cambio = 'Geometria' THEN [1] ELSE [] END |
  MERGE (r)-[:ADMITE {regla:'MAN-R5'}]->(alt) SET alt.viable = true)
FOREACH (_ IN CASE WHEN alt.tipo_cambio = 'Tecnologia' THEN [1] ELSE [] END |
  MERGE (r)-[:RECHAZA {regla:'MAN-R5'}]->(alt) SET alt.viable = false);
// MAN-R9: instalación no invasiva
MATCH (r:RestriccionCliente {criterio:'instalacion_no_invasiva'})-[:CONDICIONA]->(c:Cartel),
      (k:Conflicto {tipo:'RiesgoCaida', caso:c.caso})-[:EXIGE]->(alt:AlternativaRediseno)
FOREACH (_ IN CASE WHEN alt.requiere_perforar = true THEN [1] ELSE [] END |
  MERGE (r)-[:RECHAZA {regla:'MAN-R9'}]->(alt) SET alt.viable = false)
FOREACH (_ IN CASE WHEN alt.nombre = 'ReducirInfill' THEN [1] ELSE [] END |
  MERGE (r)-[:ADMITE {regla:'MAN-R9'}]->(alt) SET alt.viable = true)
WITH DISTINCT c
MERGE (ev:Evaluacion {id:'EV-' + c.caso})
WITH c, ev WITH *, COUNT { (ev)-[:ACTIVO]->() } AS n_act MATCH (r:Regla {id:'MAN-R9'})
MERGE (ev)-[a:ACTIVO {paso:'MAN'}]->(r) ON CREATE SET a.orden = n_act + 1, a.submodulo = 'MAN', a.sobre = c.id;
// MAN-FILTRO (PI2 Luciano, caso 2): el tamaño final fijo admite segmentar y reforzar (no cambian el tamaño)
MATCH (r:RestriccionCliente {criterio:'tamano_final_fijo'})-[:CONDICIONA]->(c:Cartel),
      (k:Conflicto {caso:c.caso, origen:'manufactura'})-[:EXIGE*1..2]->(alt:AlternativaRediseno)
WHERE alt.tipo_cambio IN ['Segmentacion', 'Fijacion']
MERGE (r)-[:ADMITE {regla:'MAN-FILTRO'}]->(alt)
SET alt.viable = true;
// MAN-FILTRO (PI1 Luciano, etapa 5): si ninguna restricción obligatoria la rechaza, la alternativa es viable.
// Una restricción obligatoria cuyo impacto no se puede evaluar (plazo) viaja como advertencia [PENDIENTE].
MATCH (k:Conflicto {origen:'manufactura'})-[:EXIGE*1..2]->(alt:AlternativaRediseno)
WHERE alt.viable IS NULL
SET alt.viable = true, alt.regla_viabilidad = 'MAN-FILTRO'
WITH DISTINCT alt
OPTIONAL MATCH (r:RestriccionCliente {criterio:'plazo'})-[:CONDICIONA]->(:Cartel {caso:alt.caso})
SET alt.advertencia = CASE WHEN r IS NULL THEN null
                           ELSE 'Impacto sobre ' + r.id + ' (' + r.descripcion + ', obligatoria) no evaluable [PENDIENTE: criterio del experto]' END
WITH DISTINCT alt.caso AS caso
MERGE (ev:Evaluacion {id:'EV-' + caso})
WITH ev WITH *, COUNT { (ev)-[:ACTIVO]->() } AS n_act MATCH (r:Regla {id:'MAN-FILTRO'})
MERGE (ev)-[a:ACTIVO {paso:'MAN'}]->(r) ON CREATE SET a.orden = n_act + 1, a.submodulo = 'MAN';
// MAN-R8: si todas las alternativas de un conflicto quedaron no viables → Inviable y vuelve a Interpretación
MATCH (k:Conflicto {origen:'manufactura'})
WITH k, [(k)-[:EXIGE*1..2]->(a:AlternativaRediseno) | a.viable] AS viabilidades
SET k.estado = CASE WHEN size(viabilidades) > 0 AND none(v IN viabilidades WHERE v = true) THEN 'Inviable' ELSE 'Resuelto' END
WITH k WHERE k.estado = 'Inviable'
MERGE (a:Aclaracion {id:'A-R8-' + k.id})
SET a:Instancia:Inferido, a.caso = k.caso, a.frame = 'Aclaracion', a.motivo = 'rigidez', a.estado = 'pendiente',
    a.pregunta = 'Ninguna alternativa respeta las restricciones obligatorias: ¿se puede flexibilizar alguna?'
MERGE (k)-[:PROVOCA {regla:'MAN-R8'}]->(a);
// Resumen del filtro
MATCH (k:Conflicto {origen:'manufactura'})-[:EXIGE*1..2]->(a:AlternativaRediseno)
OPTIONAL MATCH (r:RestriccionCliente)-[d:ADMITE|RECHAZA]->(a)
RETURN k.caso AS caso, k.tipo AS conflicto, a.nombre AS alternativa, a.viable AS viable,
       coalesce(type(d) + ' por ' + r.id + ' (' + d.regla + ')', a.regla_viabilidad) AS decision
ORDER BY caso, conflicto, alternativa;
```

</details>

```text
caso, conflicto, alternativa, viable, decision
"CU1", "ExcedeCama", "CambioFijacion_Refuerzo", TRUE, "MAN-FILTRO"
"CU1", "ExcedeCama", "SegmentacionModular", TRUE, "MAN-FILTRO"
"CU2", "ExcedeCama", "CambioFijacion_Refuerzo", TRUE, "MAN-FILTRO"
"CU2", "ExcedeCama", "SegmentacionModular", TRUE, "MAN-FILTRO"
"L-C1", "TrazoFino", "EngrosarTrazo", FALSE, "RECHAZA por RCL-L1 (MAN-R6)"
"L-C1", "TrazoFino", "PasarRetroiluminado", TRUE, "ADMITE por RCL-L1 (MAN-R6)"
"L-C2", "ExcedeCama", "CambioFijacion_Refuerzo", TRUE, "ADMITE por RCL-L2 (MAN-FILTRO)"
"L-C2", "ExcedeCama", "SegmentacionModular", TRUE, "ADMITE por RCL-L2 (MAN-FILTRO)"
"L-C3", "RiesgoCaida", "FijacionMayorCapacidad", FALSE, "RECHAZA por RCL-L3 (MAN-R9)"
"L-C3", "RiesgoCaida", "ReducirInfill", TRUE, "ADMITE por RCL-L3 (MAN-R9)"
```

## Paso 11 — INTEG-02: Recomendación + cierre del rastro de decisión

*Caso:* Todos · *Modo en demo.sh:* `silencio` · *Ejecución:* OK

<details><summary>Consulta</summary>

```cypher
// Esperado: una Recomendacion por caso con las alternativas viables, el material y las condiciones de Materiales.
// FR-07 (no apto) no llega a recomendación: su rediseño (cambiar componentes, reubicar la fuente) no tiene regla de Luciano.
MATCH (c:Cartel)
MATCH (k:Conflicto {caso:c.caso, origen:'manufactura'})
OPTIONAL MATCH (k)-[:EXIGE*1..2]->(alt:AlternativaRediseno {viable:true})
WITH c, collect(DISTINCT k) AS ks, collect(DISTINCT alt) AS alts
OPTIONAL MATCH (dic:DictamenAdecuacion {id:'DIC-' + c.caso})
MERGE (rec:Recomendacion {id:'REC-' + c.caso})
SET rec:Instancia:Inferido, rec.caso = c.caso, rec.frame = 'Recomendacion', rec.decide = 'fabricante',
    rec.tipo = CASE WHEN size(alts) > 0 THEN 'rediseno' ELSE 'inviable' END,
    rec.conflictos = [k IN ks | k.tipo + ': ' + coalesce(k.detalle, '')],
    rec.alternativas = [a IN alts | a.nombre],
    rec.material = c.material,
    rec.dictamen_materiales = dic.resultado,
    rec.condiciones_instalacion = [(dic)-[:IMPONE]->(x) | x.descripcion],
    rec.requisitos = [(dic)-[:ESTABLECE]->(x) | x.exigencia + coalesce(' → ' + x.estado, '')],
    rec.verificaciones = [(dic)-[:SENALA]->(x) | 'verificación ' + x.tipo],
    rec.advertencias = [a IN alts WHERE a.advertencia IS NOT NULL | a.advertencia],
    rec.tecnologia = coalesce(c.tecnologia_iluminacion, c.pendiente)
FOREACH (a IN alts | MERGE (a)-[:CONFORMA {regla:'INTEG-02'}]->(rec))
WITH c, rec
MERGE (ev:Evaluacion {id:'EV-' + c.caso})
MERGE (ev)-[:CONCLUYE]->(rec)
WITH c, rec, ev WITH *, COUNT { (ev)-[:ACTIVO]->() } AS n_act MATCH (r:Regla {id:'INTEG-02'})
MERGE (ev)-[a:ACTIVO {paso:'INTEG'}]->(r) ON CREATE SET a.orden = n_act + 1, a.submodulo = 'COM', a.sobre = rec.id
RETURN rec.caso AS caso, rec.tipo AS tipo, rec.alternativas AS alternativas, rec.material AS material,
       rec.dictamen_materiales AS dictamen, rec.condiciones_instalacion AS condiciones
ORDER BY caso;
// Sincronizar INSTANCIA_DE con el frame actual de cada instancia (las reglas crean y reclasifican nodos)
MATCH (n:Instancia)-[r:INSTANCIA_DE]->(f:Frame) WHERE f.nombre <> n.frame DELETE r;
MATCH (n:Instancia) WHERE NOT (n)-[:INSTANCIA_DE]->() MATCH (f:Frame {nombre:n.frame}) MERGE (n)-[:INSTANCIA_DE]->(f);
// =====================================================================================
// PARTE B — Consultas de lectura para la presentación
// =====================================================================================
```

</details>

```text
caso, tipo, alternativas, material, dictamen, condiciones
"CU1", "rediseno", ["SegmentacionModular", "CambioFijacion_Refuerzo"], NULL, "apto", []
"CU2", "rediseno", ["SegmentacionModular", "CambioFijacion_Refuerzo"], "PETG", "apto_con_condiciones", ["Relevar el soporte (marquesina) y fijar a su estructura portante antes de instalar", "Fuente accesible sin desmontar las letras y protegida (el cartel va en altura)"]
"L-C1", "rediseno", ["PasarRetroiluminado"], "PLA", NULL, []
"L-C2", "rediseno", ["SegmentacionModular", "CambioFijacion_Refuerzo"], NULL, NULL, []
"L-C3", "rediseno", ["ReducirInfill"], NULL, NULL, []
```

## Paso 12 — Recorrido completo de CU1: del mensaje del cliente a la recomendación

*Caso:* CU1 · *Modo en demo.sh:* `corta` · *Ejecución:* OK

<details><summary>Consulta</summary>

```cypher
// Esperado: Interpretación (P-01 listo en iteración 3) → FR-01 → Materiales: apto (R-MI-10) →
// Manufacturabilidad: 1000 mm > 400 mm → SegmentacionModular + refuerzo. Decide el fabricante.
CALL {
  MATCH (p:Pedido {id:'P-01'})
  RETURN 1 AS n, 'Interpretación (Matías)' AS submodulo, p.id + ' ' + p.estado + ', iteración ' + toString(p.iteracion) AS resultado
  UNION ALL
  MATCH (f:FichaRequerimientos)-[:CORRESPONDE_A]->(:Pedido {id:'P-01'})
  RETURN 2 AS n, 'Ficha' AS submodulo, f.id + ': ' + reduce(s = '', d IN [(f)-[:REGISTRA]->(x) | x.atributo + '=' + toString(x.valor)] | s + d + '; ')
         + reduce(s = '', n IN [(f)-[:INCLUYE]->(x:NecesidadFuncional) | x.id + ' cubre la tecnología'] | s + n) AS resultado
  UNION ALL
  MATCH (dic:DictamenAdecuacion {caso:'CU1'})-[:EVALUA]->(c)-[:SE_INSTALA_EN]->(en)
  RETURN 3 AS n, 'Materiales (Lautaro)' AS submodulo, 'exposición ' + en.nivel_exposicion + ' (' + en.regla_exposicion + ') → ' + dic.resultado + ' (' + dic.regla + ')' AS resultado
  UNION ALL
  MATCH (k:Conflicto {caso:'CU1', origen:'manufactura'})
  RETURN 4 AS n, 'Manufacturabilidad (Luciano)' AS submodulo, k.tipo + ': ' + k.detalle AS resultado
  UNION ALL
  MATCH (rec:Recomendacion {caso:'CU1'})
  RETURN 5 AS n, 'Recomendación' AS submodulo, reduce(s = '', a IN rec.alternativas | s + a + ' + ') + 'decide: ' + rec.decide AS resultado
}
RETURN n AS paso, submodulo, resultado ORDER BY paso;
```

</details>

```text
paso, submodulo, resultado
1, "Interpretación (Matías)", "P-01 listo_para_evaluacion, iteración 3"
2, "Ficha", "FR-01: soporte_y_montaje=pared de mampostería, adosado; contenido_texto=Café Andino; entorno=interior; largo=≈ 1 m; NF1 cubre la tecnología"
3, "Materiales (Lautaro)", "exposición baja (R-MI-GEN) → apto (R-MI-10)"
4, "Manufacturabilidad (Luciano)", "ExcedeCama: 1000 mm > 400 mm de cama"
5, "Recomendación", "SegmentacionModular + CambioFijacion_Refuerzo + decide: fabricante"
```

## Paso 13 — Recorrido completo de CU2: FR-02 cruza los tres submódulos

*Caso:* CU2 · *Modo en demo.sh:* `corta` · *Ejecución:* OK

<details><summary>Consulta</summary>

```cypher
// Esperado: FR-02 con RC1 (plazo, obligatoria) y AV2 → Materiales (PI2 Lautaro, caso 1): exposición alta, sin material
// definido → requisitos (R-MI-13), condiciones (R-MI-13, R-MI-14) y verificación estructural (R-MI-06) → apto con condiciones
// (R-MI-11) → Manufacturabilidad: PETG (MAN-R7) cumple el requisito de material + segmentación letra por letra + refuerzo.
CALL {
  MATCH (f:FichaRequerimientos {id:'FR-02'})
  RETURN 1 AS n, 'Ficha (Matías)' AS submodulo,
         'restricciones: ' + reduce(s = '', r IN [(f)-[:PRESERVA]->(x) | x.id + ' ' + x.descripcion] | s + r) +
         ' | advertencias: ' + reduce(s = '', a IN [(f)-[:INCLUYE]->(x:Advertencia) | x.id] | s + a) AS resultado
  UNION ALL
  MATCH (dic:DictamenAdecuacion {caso:'CU2'})-[:EVALUA]->(c)-[:SE_INSTALA_EN]->(en)
  RETURN 2 AS n, 'Materiales (Lautaro)' AS submodulo, 'exposición ' + en.nivel_exposicion + ' (' + en.regla_exposicion + ') → ' + dic.resultado + ' (' + dic.regla + ')' AS resultado
  UNION ALL
  MATCH (:DictamenAdecuacion {caso:'CU2'})-[e:ESTABLECE]->(rq:RequisitoMaterial)
  RETURN 3 AS n, 'Materiales: requisito' AS submodulo, rq.exigencia + ' [' + e.regla + ']' + coalesce(' → ' + rq.estado, '') AS resultado
  UNION ALL
  MATCH (:DictamenAdecuacion {caso:'CU2'})-[i:IMPONE]->(ci:CondicionInstalacion)
  RETURN 4 AS n, 'Materiales: condición' AS submodulo, ci.descripcion + ' [' + i.regla + ']' AS resultado
  UNION ALL
  MATCH (:DictamenAdecuacion {caso:'CU2'})-[sx:SENALA]->(vp:VerificacionProfesional)
  RETURN 5 AS n, 'Materiales: verificación' AS submodulo, vp.tipo + ' (' + reduce(s = '', m IN vp.motivo | s + m + ' ') + ') [' + sx.regla + ']' AS resultado
  UNION ALL
  MATCH (c:Cartel {caso:'CU2'})-[u:UTILIZA]->(m:Material)
  RETURN 6 AS n, 'Manufacturabilidad (Luciano)' AS submodulo, 'material ' + m.nombre + ' (' + u.regla + ')' AS resultado
  UNION ALL
  MATCH (k:Conflicto {caso:'CU2', origen:'manufactura'})
  RETURN 7 AS n, 'Manufacturabilidad (Luciano)' AS submodulo, k.tipo + ': ' + k.detalle AS resultado
  UNION ALL
  MATCH (rec:Recomendacion {caso:'CU2'})
  RETURN 8 AS n, 'Recomendación' AS submodulo, reduce(s = '', a IN rec.alternativas | s + a + ' + ') + 'PETG; decide: ' + rec.decide AS resultado
  UNION ALL
  MATCH (rec:Recomendacion {caso:'CU2'}) UNWIND rec.advertencias AS adv
  RETURN 9 AS n, 'Advertencia' AS submodulo, adv AS resultado
}
RETURN n AS paso, submodulo, resultado ORDER BY paso;
```

</details>

```text
paso, submodulo, resultado
1, "Ficha (Matías)", "restricciones: RC1 plazo: antes de la inauguración | advertencias: AV2"
2, "Materiales (Lautaro)", "exposición alta (R-MI-02) → apto_con_condiciones (R-MI-11)"
3, "Materiales: requisito", "Apto para exterior y radiación UV (el PLA no está indicado) [R-MI-13] → cumplido para el cuerpo por MAN-R7 (PETG)"
3, "Materiales: requisito", "Tiras, fuente y conexiones con protección contra agua [grado IP: a validar] [R-MI-13]"
4, "Materiales: condición", "Relevar el soporte (marquesina) y fijar a su estructura portante antes de instalar [R-MI-14]"
4, "Materiales: condición", "Fuente accesible sin desmontar las letras y protegida (el cartel va en altura) [R-MI-13]"
5, "Materiales: verificación", "estructural (altura (4 m) viento ) [R-MI-06]"
6, "Manufacturabilidad (Luciano)", "material PETG (MAN-R7)"
7, "Manufacturabilidad (Luciano)", "ExcedeCama: 3000 mm > 400 mm de cama"
8, "Recomendación", "SegmentacionModular + CambioFijacion_Refuerzo + PETG; decide: fabricante"
9, "Advertencia", "Impacto sobre RC1 (plazo: antes de la inauguración, obligatoria) no evaluable [PENDIENTE: criterio del experto]"
9, "Advertencia", "Impacto sobre RC1 (plazo: antes de la inauguración, obligatoria) no evaluable [PENDIENTE: criterio del experto]"
```

## Paso 14 — Caso 2 del PI2 de Lautaro: Neón LED en bandera → no apto, con cada restricción y su causa

*Caso:* FR-07 · *Modo en demo.sh:* `corta` · *Ejecución:* OK

<details><summary>Consulta</summary>

```cypher
// Esperado: el alero no cubre (R-MI-08 se evalúa y no aplica) → exposición alta (R-MI-02); Neón LED y fuente de interior
// → restricción eléctrica EXCLUYENTE (R-MI-03); fuente cerrada → mantenimiento corregible (R-MI-07); bandera →
// verificación estructural (R-MI-06). R-MI-12 tiene prioridad sobre R-MI-11 → NO APTO.
CALL {
  MATCH (ex:Excepcion {caso:'FR-07'})-[a:AJUSTA]->(en:Entorno)
  RETURN 1 AS n, 'Excepción (' + a.regla + ')' AS paso_materiales, ex.tipo + ': ' + ex.condicion + ' → aplica = ' + toString(ex.aplica) AS resultado
  UNION ALL
  MATCH (en:Entorno {caso:'FR-07'})
  RETURN 2 AS n, 'Exposición (' + en.regla_exposicion + ')' AS paso_materiales, en.nivel_exposicion AS resultado
  UNION ALL
  MATCH (:DictamenAdecuacion {caso:'FR-07'})-[r:REUNE]->(k:Conflicto)
  RETURN 3 AS n, 'Restricción (' + r.regla + ')' AS paso_materiales,
         k.tipo + ', ' + k.severidad + ' — causada por: ' + reduce(s = '', x IN [(k)-[:CAUSADO_POR]->(c) | c.id] | s + x + ' ') +
         coalesce('→ se resuelve con: ' + head([(k)-[:SE_RESUELVE_CON]->(ci) | ci.descripcion]), '') AS resultado
  UNION ALL
  MATCH (:DictamenAdecuacion {caso:'FR-07'})-[sx:SENALA]->(vp:VerificacionProfesional)
  RETURN 4 AS n, 'Verificación (' + sx.regla + ')' AS paso_materiales, vp.tipo + ': ' + reduce(s = '', m IN vp.motivo | s + m + ' ') AS resultado
  UNION ALL
  MATCH (dic:DictamenAdecuacion {caso:'FR-07'})
  RETURN 5 AS n, 'Dictamen (' + dic.regla + ')' AS paso_materiales, toUpper(dic.resultado) + ' → pasa a Manufacturabilidad con las causas' AS resultado
}
RETURN n AS paso, paso_materiales, resultado ORDER BY paso;
```

</details>

```text
paso, paso_materiales, resultado
1, "Excepción (R-MI-08)", "alero: alero de 0,4 m; el cartel sobresale 1,0 m sobre la vereda → aplica = false"
2, "Exposición (R-MI-02)", "alta"
3, "Restricción (R-MI-07)", "Mantenimiento, corregible — causada por: CE-FR-07-FUENTE → se resuelve con: Fuente accesible sin desmontar el cartel y protegida"
3, "Restricción (R-MI-03)", "Electrica, excluyente — causada por: ENT-FR-07 CE-FR-07-NEON CE-FR-07-FUENTE "
4, "Verificación (R-MI-06)", "estructural: bandera sobre la vereda viento "
5, "Dictamen (R-MI-12)", "NO_APTO → pasa a Manufacturabilidad con las causas"
```

## Paso 15 — Las restricciones del cliente filtran las alternativas (admite / rechaza)

*Caso:* L-C1+L-C3 · *Modo en demo.sh:* `extra` · *Ejecución:* OK

<details><summary>Consulta</summary>

```cypher
// Caso de uso: casos del PI2 de Luciano. Esperado: L-C1 EngrosarTrazo RECHAZA (R6) / PasarRetroiluminado ADMITE;
// L-C3 FijacionMayorCapacidad RECHAZA (R9) / ReducirInfill ADMITE; L-C2 segmentación ADMITE (tamaño final).
MATCH (r:RestriccionCliente)-[d:ADMITE|RECHAZA]->(a:AlternativaRediseno)
RETURN a.caso AS caso, r.descripcion AS restriccion_del_cliente, type(d) AS decision, a.nombre AS alternativa, d.regla AS regla
ORDER BY caso, decision DESC;
```

</details>

```text
caso, restriccion_del_cliente, decision, alternativa, regla
"L-C1", "mantener la identidad visual del logo", "RECHAZA", "EngrosarTrazo", "MAN-R6"
"L-C1", "mantener la identidad visual del logo", "ADMITE", "PasarRetroiluminado", "MAN-R6"
"L-C2", "mantener el tamaño final (500 mm)", "ADMITE", "CambioFijacion_Refuerzo", "MAN-FILTRO"
"L-C2", "mantener el tamaño final (500 mm)", "ADMITE", "SegmentacionModular", "MAN-FILTRO"
"L-C3", "instalación no invasiva (sin perforar)", "RECHAZA", "FijacionMayorCapacidad", "MAN-R9"
"L-C3", "instalación no invasiva (sin perforar)", "ADMITE", "ReducirInfill", "MAN-R9"
```

## Paso 16 — Trazabilidad: qué reglas se activaron, en qué orden y de dónde sale cada una

*Caso:* CU2 · *Modo en demo.sh:* `corta` · *Ejecución:* OK

<details><summary>Consulta</summary>

```cypher
// Esperado: reglas de Interpretación (precargadas) → Materiales → Manufacturabilidad → Integración, con su origen.
MATCH (ev:Evaluacion {caso:'CU2'})-[a:ACTIVO]->(r:Regla)
RETURN a.orden AS orden, r.submodulo AS submodulo, r.id AS regla, r.nombre AS nombre, r.origen AS origen
ORDER BY orden;
```

</details>

```text
orden, submodulo, regla, nombre, origen
1, "INT", "INT-R03", "Contradicción entre datos", "propuesta"
2, "INT", "INT-R04", "Restricción explícita", "propuesta"
3, "INT", "INT-R05", "Preferencia no promovible", "propuesta"
4, "INT", "INT-R02", "Dato requerido faltante", "propuesta"
5, "INT", "INT-R08", "Formulación adaptada", "propuesta"
6, "INT", "INT-R10", "Consulta a otro submódulo", "propuesta"
7, "INT", "INT-R13", "Reingreso de la respuesta", "propuesta"
8, "INT", "INT-R11", "Suficiencia del pedido", "propuesta"
9, "INT", "INT-R12", "Herencia de incertidumbre", "propuesta"
10, "COM", "INTEG-01", "Ficha → Cartel", "propuesta"
11, "MAT", "R-MI-01", "Datos mínimos incompletos", "experto"
12, "MAT", "R-MI-02", "Exposición alta", "experto"
13, "MAT", "R-MI-13", "Material o componente no definido", "propuesta"
14, "MAT", "R-MI-14", "Soporte no verificado", "propuesta"
15, "MAT", "R-MI-06", "Derivación a verificación profesional", "experto+documental"
16, "MAT", "R-MI-11", "Dictamen apto con condiciones", "experto"
17, "MAN", "MAN-R7", "Material apto exterior", "documental"
18, "COM", "INTEG-03", "Requisito de Materiales → material de Manufacturabilidad", "propuesta"
19, "MAN", "MAN-R3", "Conflicto de volumen", "documental"
20, "MAN", "MAN-FILTRO", "Filtro por restricciones innegociables", "experto"
21, "COM", "INTEG-02", "Recomendación y traza", "propuesta"
```

## Paso 17 — Insumo para el LLM explicador: recomendación + reglas + slots + fuentes (el LLM no decide)

*Caso:* CU2 · *Modo en demo.sh:* `extra` · *Ejecución:* OK

<details><summary>Consulta</summary>

```cypher
// Esperado: un registro con todo lo necesario para que el LLM redacte la explicación sin agregar conocimiento.
MATCH (ev:Evaluacion {caso:'CU2'})-[:CONCLUYE]->(rec:Recomendacion)
MATCH (ev)-[:ACTIVO]->(r:Regla) WHERE r.submodulo IN ['MAT', 'MAN', 'COM']
OPTIONAL MATCH (r)-[:USA]->(s:Slot)
WITH rec, r, collect(s.id) AS slots
RETURN rec.id AS recomendacion, r.id AS regla, r.conclusion AS conclusion, r.fuente AS fuente, slots AS slots_evaluados
ORDER BY regla;
```

</details>

```text
recomendacion, regla, conclusion, fuente, slots_evaluados
"REC-CU2", "INTEG-01", "instanciar Cartel/Entorno con los DatosConfirmados de la ficha (sin completar huecos)", "Interacción PI1 (los tres) + RL12 Luciano", ["Cartel.dimension_maxima_mm", "FichaRequerimientos.id"]
"REC-CU2", "INTEG-02", "Recomendación que CONFORMAN las alternativas + registrar Evaluacion (reglas activadas)", "PI1 Luciano etapa 6 + pregunta integrador «Trazabilidad»", ["Recomendacion.tipo"]
"REC-CU2", "INTEG-03", "RequisitoMaterial SE_CUMPLE_CON Material", "PI2 Lautaro (DI-01 → R7 de Luciano) + PI2 Luciano R7", ["Material.apto_exterior", "RequisitoMaterial.aplica_a"]
"REC-CU2", "MAN-FILTRO", "alternativa viable (ADMITE si la restricción la respeta explícitamente)", "PI1 Luciano etapa 5 / PI2 RL8", ["AlternativaRediseno.viable", "RestriccionCliente.rigidez"]
"REC-CU2", "MAN-R3", "Conflicto ExcedeCama + SegmentaciónModular que EXIGE CambioFijación (refuerzo)", "PI2 Luciano R3 (ficha impresora)", ["Herramienta.volumen_util_maximo", "Geometria.dimension_maxima_mm"]
"REC-CU2", "MAN-R7", "descartar PLA, seleccionar PETG", "PI2 Luciano R7 (propiedades térmicas FDM)", ["Entorno.tipo", "Cartel.material"]
"REC-CU2", "R-MI-01", "no evaluar (pendiente_de_datos); solicitar el dato a Interpretación (⇒ el faltante es bloqueante)", "PI2 Lautaro R-MI-01 (M8)", ["ConsultaSubmodulo.respuesta", "Cartel.dimension_maxima_mm", "Cartel.montaje", "Soporte.tipo", "Entorno.tipo"]
"REC-CU2", "R-MI-02", "nivel_exposicion = alta", "PI2 Lautaro R-MI-02", ["Entorno.nivel_exposicion", "Entorno.alcance_proteccion", "Entorno.proteccion_superior", "Entorno.tipo"]
"REC-CU2", "R-MI-06", "VerificacionProfesional estructural; el dictamen no puede ser apto", "PI2 Lautaro R-MI-06 (CIRSOC 102)", ["Entorno.nivel_exposicion", "Cartel.altura_m", "Cartel.montaje"]
"REC-CU2", "R-MI-11", "dictamen apto con condiciones, listando cada una", "PI2 Lautaro R-MI-11", ["Conflicto.severidad", "DictamenAdecuacion.resultado"]
"REC-CU2", "R-MI-13", "no bloquear; RequisitoMaterial equivalente a R-MI-03/04 según la exposición; en altura, condición «fuente accesible»", "PI2 Lautaro R-MI-13 (nueva, M3)", ["RequisitoMaterial.exigencia", "Cartel.altura_m", "Entorno.nivel_exposicion", "Cartel.material"]
"REC-CU2", "R-MI-14", "condición: relevar el soporte y fijar a su estructura portante antes de instalar", "PI2 Lautaro R-MI-14 (nueva, M7)", ["Soporte.capacidad_relativa", "Soporte.estado"]
```

## Paso 18 — Frame de ejemplo con slots y facetas: DatoFaltante hereda de Dato (ES_UN)

*Caso:* Modelo · *Modo en demo.sh:* `extra` · *Ejecución:* OK

<details><summary>Consulta</summary>

```cypher
// Esperado: slots propios (criticidad) y heredados (atributo, categoria, valor, origen, estado) con sus facetas y demonios.
MATCH (f:Frame {nombre:'DatoFaltante'})-[:ES_UN*0..]->(anc:Frame)-[:TIENE_SLOT]->(s:Slot)
RETURN anc.nombre AS definido_en, s.nombre AS slot, s.tipo_dato AS tipo, s.valores_permitidos AS valores,
       s.valor_defecto AS defecto, s.cardinalidad AS card,
       coalesce(nullif(s.si_agregado, ''), nullif(s.si_modificado, ''), nullif(s.si_necesario, ''), '—') AS demonio
ORDER BY definido_en DESC, slot;
```

</details>

```text
definido_en, slot, tipo, valores, defecto, card, demonio
"DatoFaltante", "criticidad", "Enum", "bloqueante | postergable | sin_clasificar", "sin_clasificar", "1", "crear Aclaracion (INT-R02) y ConsultaSubmodulo si depende de otro submódulo (INT-R10)"
"Dato", "atributo", "Texto", "", "", "1", "—"
"Dato", "categoria", "Enum", "producto_tecnologia | dimensiones | contexto_de_uso | entorno | instalacion | apariencia | restricciones", "", "1", "—"
"Dato", "estado", "Enum", "confirmado | faltante | ambiguo | en_conflicto | descartado", "", "1", "reclasificar etiqueta y recalcular estado del Pedido"
"Dato", "origen", "Enum", "cliente | respuesta_a_aclaracion", "", "1", "—"
"Dato", "valor", "Cualquiera", "", "", "0..1", "verificar faceta origen (INT-R09)"
"Dato", "valor_normalizado", "Número", "", "", "0..1", "—"
```

## Paso 19 — Origen del conocimiento: reglas por submódulo y origen (experto / propuesta / documental)

*Caso:* Modelo · *Modo en demo.sh:* `extra` · *Ejecución:* OK

<details><summary>Consulta</summary>

```cypher
MATCH (r:Regla)
RETURN r.submodulo AS submodulo, r.origen AS origen, count(*) AS reglas, collect(r.id) AS ids
ORDER BY submodulo, origen;
```

</details>

```text
submodulo, origen, reglas, ids
"COM", "propuesta", 3, ["INTEG-01", "INTEG-03", "INTEG-02"]
"INT", "propuesta", 13, ["INT-R01", "INT-R02", "INT-R03", "INT-R04", "INT-R05", "INT-R06", "INT-R07", "INT-R08", "INT-R09", "INT-R10", "INT-R11", "INT-R12", "INT-R13"]
"MAN", "documental", 4, ["MAN-R1", "MAN-R2", "MAN-R3", "MAN-R7"]
"MAN", "experto", 6, ["MAN-R4", "MAN-R5", "MAN-R6", "MAN-R9", "MAN-FILTRO", "MAN-G1"]
"MAN", "propuesta", 1, ["MAN-R8"]
"MAT", "documental+experto", 2, ["R-MI-03", "R-MI-04"]
"MAT", "experto", 9, ["R-MI-01", "R-MI-02", "R-MI-GEN", "R-MI-05", "R-MI-07", "R-MI-08", "R-MI-09", "R-MI-10", "R-MI-11"]
"MAT", "experto+documental", 1, ["R-MI-06"]
"MAT", "propuesta", 3, ["R-MI-12", "R-MI-13", "R-MI-14"]
```

## Paso 20 — Qué queda [PENDIENTE] en el modelo (para validar con el experto)

*Caso:* Modelo · *Modo en demo.sh:* `extra` · *Ejecución:* OK

<details><summary>Consulta</summary>

```cypher
CALL {
  MATCH (s:Slot) WHERE s.nota CONTAINS 'PENDIENTE' RETURN 'Slot' AS tipo, s.id AS elemento, s.nota AS detalle
  UNION ALL
  MATCH (f:Frame) WHERE f.pendiente <> '' RETURN 'Frame' AS tipo, f.nombre AS elemento, f.pendiente AS detalle
  UNION ALL
  MATCH (n:Instancia) WHERE n.pendiente IS NOT NULL RETURN 'Instancia' AS tipo, n.id AS elemento, n.pendiente AS detalle
}
RETURN tipo, elemento, detalle ORDER BY tipo, elemento;
```

</details>

```text
tipo, elemento, detalle
"Instancia", "CAR-P-01", "[PENDIENTE: criterio del experto para proponer la tecnología de iluminación]"
"Instancia", "CAR-P-02", "[PENDIENTE: criterio del experto para proponer la tecnología de iluminación]"
"Instancia", "FIJ-CINTA", "[PENDIENTE: carga admisible de la cinta bifaz]"
"Instancia", "FIJ-FR-07", "[PENDIENTE: sistema de fijación a definir (lo deriva R-MI-06)]"
"Instancia", "FIJ-P-01", "[PENDIENTE: sistema de fijación a definir]"
"Instancia", "FIJ-P-02", "[PENDIENTE: sistema de fijación a definir]"
"Instancia", "GEO-P-01", "[PENDIENTE: ancho de canal y peso requieren el vector del diseño]"
"Instancia", "GEO-P-02", "[PENDIENTE: ancho de canal y peso requieren el vector del diseño]"
"Instancia", "MAT-ACR", "[PENDIENTE: resistencia UV y térmica según fichas técnicas]"
"Instancia", "RC-PESO", "[PENDIENTE: carga admisible]"
"Instancia", "RC-TEMP", "[PENDIENTE: temperatura de deformación]"
"Instancia", "VP-CU2", "[PENDIENTE: umbral de gran porte, CIRSOC 102; se aplica el criterio conservador del PI2]"
"Instancia", "VP-FR-07", "[PENDIENTE: umbral de gran porte, CIRSOC 102; se aplica el criterio conservador del PI2]"
"Slot", "Cartel.peso_estimado", "Estimación del experto [PENDIENTE: criterio, PI2 Lautaro «a validar»]"
"Slot", "ComponenteElectrico.grado_ip", "IEC 60529 [PENDIENTE: grado exigido según exposición, a validar]"
"Slot", "Entorno.alcance_proteccion", "Solo si hay protección; qué es un alero «efectivo» [PENDIENTE: criterio a validar]"
"Slot", "Entorno.nivel_exposicion", "Exposición ambiental (PI2 Lautaro C8). Variable difusa candidata [PENDIENTE: funciones de pertenencia]"
"Slot", "Excepcion.efecto", "Magnitud del efecto [PENDIENTE: a validar]"
"Slot", "Material.resistencia_termica", "[PENDIENTE: fichas técnicas]"
"Slot", "Material.resistencia_uv", "[PENDIENTE: fichas técnicas]"
"Slot", "NecesidadFuncional.tecnologia_asociada", "Interpretación no puede asignarla; la propone Manufacturabilidad [PENDIENTE: criterio]"
"Slot", "Pedido.datos_requeridos", "Valor provisional de PG0/PI1 [PENDIENTE: conjunto por tipo de cartel]"
"Slot", "RestriccionConstructiva.valor_limite", "Trazo 6 mm, Volumen 400 mm (documental); Peso [PENDIENTE]"
"Slot", "SistemaFijacion.carga_admisible", "[PENDIENTE: valor] (RestriccionPeso)"
"Slot", "Soporte.capacidad_relativa", "Placa de yeso = baja (§6); mampostería = no_baja («en principio buen soporte»). Niveles finos [PENDIENTE: a validar]"
```

## Paso 21 — INT-R09 como restricción de integridad: ningún dato con valor «supuesto»

*Caso:* Control · *Modo en demo.sh:* `extra` · *Ejecución:* OK

<details><summary>Consulta</summary>

```cypher
// Esperado: 0 datos con origen distinto de cliente / respuesta_a_aclaracion.
MATCH (d:Dato) WHERE d.valor IS NOT NULL AND NOT d.origen IN ['cliente', 'respuesta_a_aclaracion']
RETURN count(d) AS datos_con_origen_invalido;
// Consultas visuales para el Browser (http://localhost:7474) — copiar y pegar, no las ejecuta demo.sh:
//
//   // Red semántica integrada (esquema)
//   MATCH (a:Frame)-[r]->(b:Frame) WHERE r.nivel = 'esquema' RETURN a, r, b
//
//   // Jerarquía de frames
//   MATCH p=(:Frame)-[:ES_UN|ES_PARTE_DE]->(:Frame) RETURN p
//
//   // Grafo instanciado de CU2 (sin frames ni categorías)
//   MATCH (n:Instancia {caso:'CU2'})-[r]-(m:Instancia) WHERE NOT m:CategoriaDato RETURN n, r, m
//
//   // Rastro de decisión de CU2
//   MATCH p=(:Evaluacion {caso:'CU2'})-[:ACTIVO]->(:Regla) RETURN p
```

</details>

```text
datos_con_origen_invalido
0
```
